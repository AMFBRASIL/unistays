import { createStaticPix, hasError } from 'pix-utils';
import QRCode from 'qrcode';
import { AppDataSource } from '@/config/database';
import { Reservation } from '@/entities/Reservation.entity';
import { PaymentMethod } from '@/entities/PaymentMethod.entity';
import { AppError } from '@/middlewares/error.middleware';
import { logger } from '@/utils/logger';
import { PaymentService } from '@/services/payments';

export type WebCheckinPixResult =
  | { configured: false; reason: 'NO_BALANCE' | 'NO_PIX_METHOD' }
  | {
      configured: true;
      /** PIX dinâmico via Efí ou PIX estático (chave no cadastro) */
      provider: 'efi' | 'static';
      amount: number;
      brCode: string;
      qrCodeDataUrl: string;
      reservationNumber: string | null;
      merchantName: string;
      pixKeyMasked: string;
      /** Presente quando provider === 'efi' (conciliação / suporte) */
      txid?: string;
    };

function sanitizeMerchantField(s: string | null | undefined, max: number, fallback: string): string {
  const base = (s || fallback).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const cleaned = base.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const out = cleaned.slice(0, max);
  return out || fallback.slice(0, max);
}

function maskPixKey(key: string): string {
  const k = key.trim();
  if (k.length <= 6) return '***';
  if (k.includes('@')) {
    const [, b] = k.split('@');
    return `***@${(b || '').slice(0, 24)}`;
  }
  return `${k.slice(0, 3)}***${k.slice(-3)}`;
}

export class GuestWebCheckinPixService {
  /**
   * Saldo pendente: tenta **Efí** (PIX dinâmico) se `EFI_GN_ENABLED`; senão PIX estático (`payment_methods`).
   */
  static async getPixForReservation(guestId: number, reservationId: number): Promise<WebCheckinPixResult> {
    const reservationRepository = AppDataSource.getRepository(Reservation);
    const reservation = await reservationRepository.findOne({
      where: { id: reservationId, guestId },
      relations: ['property', 'guest'],
    });
    if (!reservation) {
      throw new AppError('Reserva não encontrada', 404);
    }

    const total = Number(reservation.totalAmount || 0);
    const paid = Number(reservation.paidAmount || 0);
    const balanceCol = reservation.balance != null ? Number(reservation.balance) : NaN;
    const balance = !Number.isNaN(balanceCol) ? balanceCol : Math.max(0, total - paid);

    if (!balance || balance <= 0) {
      return { configured: false, reason: 'NO_BALANCE' };
    }

    const amount = Math.round(balance * 100) / 100;
    const ref = (reservation.reservationNumber || String(reservation.id)).slice(0, 24);
    const guest = reservation.guest;

    let efiError: Error | null = null;
    if (PaymentService.isPixImmediateAvailable()) {
      try {
        const fullName = [guest?.firstName, guest?.lastName].filter(Boolean).join(' ').trim();
        const cpfDigits = guest?.documentNumber ? String(guest.documentNumber).replace(/\D/g, '') : '';

        const charge = await PaymentService.createPixImmediateCharge({
          amount,
          description: `Reserva ${ref} — UniStays`.slice(0, 140),
          pagador: {
            nome: fullName || undefined,
            cpf: cpfDigits.length === 11 ? cpfDigits : undefined,
          },
          infoAdicionais: [{ nome: 'Referencia', valor: ref.slice(0, 50) }],
        });

        const qrCodeDataUrl = await QRCode.toDataURL(charge.brCode, {
          width: 280,
          margin: 2,
          errorCorrectionLevel: 'M',
        });

        return {
          configured: true,
          provider: 'efi',
          amount,
          brCode: charge.brCode,
          qrCodeDataUrl,
          reservationNumber: reservation.reservationNumber,
          merchantName: reservation.property?.name || 'Hotel',
          pixKeyMasked: 'Efí / Gerencianet',
          txid: charge.txid,
        };
      } catch (e) {
        efiError = e instanceof Error ? e : new Error(String(e));
        logger.warn('[GuestWebCheckinPixService] Efí indisponível ou erro; tentando PIX estático.', {
          message: efiError.message,
        });
      }
    }

    const pmRepo = AppDataSource.getRepository(PaymentMethod);
    const methods = await pmRepo.find({
      where: { isActive: true },
      order: { id: 'ASC' },
    });

    const pixMethod = methods.find((m) => {
      const t = (m.type || '').toLowerCase();
      const c = (m.code || '').toLowerCase();
      return t === 'pix' || c === 'pix';
    });

    const details = pixMethod?.details as Record<string, unknown> | null | undefined;
    const rawKey = details?.pixKey ?? details?.pix_key ?? details?.key;
    const pixKey = rawKey != null ? String(rawKey).trim() : '';

    if (!pixKey) {
      if (efiError) {
        throw new AppError(
          efiError.message || 'Não foi possível gerar PIX (Efí falhou e não há chave PIX no cadastro).',
          502
        );
      }
      return { configured: false, reason: 'NO_PIX_METHOD' };
    }

    const merchantName = sanitizeMerchantField(reservation.property?.name, 25, 'Hotel');
    const merchantCity = sanitizeMerchantField(reservation.property?.city, 15, 'Brasil').toUpperCase();

    const infoAdicional = `Reserva ${ref}`.slice(0, 40);

    const pix = createStaticPix({
      merchantName,
      merchantCity,
      pixKey,
      infoAdicional,
      transactionAmount: amount,
    });

    if (hasError(pix)) {
      const errs = (pix as { errors?: string[] }).errors;
      const msg = Array.isArray(errs) && errs.length ? errs.join('; ') : 'Chave PIX ou dados do recebedor inválidos.';
      if (efiError) {
        throw new AppError(`${msg} (Efí também falhou: ${efiError.message})`, 400);
      }
      throw new AppError(msg, 400);
    }

    const brCode = pix.toBRCode();
    const qrCodeDataUrl = await QRCode.toDataURL(brCode, { width: 280, margin: 2, errorCorrectionLevel: 'M' });

    return {
      configured: true,
      provider: 'static',
      amount,
      brCode,
      qrCodeDataUrl,
      reservationNumber: reservation.reservationNumber,
      merchantName,
      pixKeyMasked: maskPixKey(pixKey),
    };
  }
}
