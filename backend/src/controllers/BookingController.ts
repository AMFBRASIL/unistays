import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/BookingService';
import { CheckAvailabilityInput, CreateReservationInput } from '../validators/booking.validator';
import { PaymentService } from '@/services/payments/PaymentService';
import { AppError } from '@/middlewares/error.middleware';
import { PaymentMethod } from '@/entities/PaymentMethod.entity';
import { AppDataSource } from '@/config/database';
import { createStaticPix, hasError } from 'pix-utils';
import QRCode from 'qrcode';

export class BookingController {
    async getProperties(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { type } = req.query;
            const properties = await BookingService.getPropertiesByType(type as string);

            res.json({
                success: true,
                data: { properties }
            });
        } catch (error) {
            next(error);
        }
    }

    async getRegions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const regions = await BookingService.getAvailableRegions();
            res.json({
                success: true,
                data: { regions }
            });
        } catch (error) {
            next(error);
        }
    }

    async checkAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: CheckAvailabilityInput = req.body;

            // Convert string dates to Date objects
            const checkIn = new Date(data.checkIn);
            const checkOut = new Date(data.checkOut);

            const units = await BookingService.checkAvailability({
                propertyType: data.propertyType,
                checkIn,
                checkOut,
                guests: data.guests,
                stayType: data.stayType
            });

            res.json({
                success: true,
                data: { units }
            });
        } catch (error: any) {
            console.error('CheckAvailability Error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal Server Error',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                details: error
            });
        }
    }

    async createReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: CreateReservationInput = req.body;

            // Convert string dates to Date objects
            const checkIn = new Date(data.checkIn);
            const checkOut = new Date(data.checkOut);

            const result = await BookingService.createReservation({
                ...data,
                checkIn,
                checkOut,
            });

            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async generatePixCharge(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const amount = Number(req.body?.amount || 0);
            const description = String(req.body?.description || 'Pagamento de reserva').trim();
            const guest = req.body?.guest || {};
            const reservationContext = req.body?.reservationContext || {};

            if (!Number.isFinite(amount) || amount <= 0) {
                throw new AppError('Valor inválido para gerar PIX.', 400);
            }

            let provider: 'efi' | 'static' = 'efi';
            let txid: string | undefined;
            let brCode = '';

            if (PaymentService.isPixImmediateAvailable()) {
                const charge = await PaymentService.createPixImmediateCharge({
                    amount,
                    description: description.slice(0, 140),
                    pagador: {
                        nome: guest?.name || undefined,
                        cpf: guest?.cpf ? String(guest.cpf).replace(/\D/g, '') : undefined,
                    },
                    infoAdicionais: [
                        reservationContext?.unitLabel
                            ? { nome: 'Unidade', valor: String(reservationContext.unitLabel).slice(0, 120) }
                            : null,
                        reservationContext?.period
                            ? { nome: 'Período', valor: String(reservationContext.period).slice(0, 120) }
                            : null,
                    ].filter(Boolean) as { nome: string; valor: string }[],
                });
                brCode = charge.brCode;
                txid = charge.txid;
            } else {
                provider = 'static';
                const pmRepo = AppDataSource.getRepository(PaymentMethod);
                const methods = await pmRepo.find({ where: { isActive: true }, order: { id: 'ASC' } });
                const pixMethod = methods.find((m) => {
                    const t = (m.type || '').toLowerCase();
                    const c = (m.code || '').toLowerCase();
                    return t === 'pix' || c === 'pix';
                });
                const details = pixMethod?.details as Record<string, unknown> | null | undefined;
                const rawKey = details?.pixKey ?? details?.pix_key ?? details?.key;
                const pixKey = rawKey != null ? String(rawKey).trim() : '';
                if (!pixKey) {
                    throw new AppError('PIX indisponível: configure Efí (EFI_GN_*) ou uma chave PIX em métodos de pagamento.', 503);
                }

                const staticPix = createStaticPix({
                    merchantName: 'UniStays',
                    merchantCity: 'BRASIL',
                    pixKey,
                    infoAdicional: String(description || 'Reserva').slice(0, 40),
                    transactionAmount: amount,
                });
                if (hasError(staticPix)) {
                    const errs = (staticPix as { errors?: string[] }).errors;
                    throw new AppError(Array.isArray(errs) && errs.length ? errs.join('; ') : 'Erro ao gerar PIX estático.', 400);
                }
                brCode = staticPix.toBRCode();
            }

            const qrCodeDataUrl = await QRCode.toDataURL(brCode, { width: 320, margin: 2, errorCorrectionLevel: 'M' });
            res.json({
                success: true,
                data: { provider, txid, brCode, qrCodeDataUrl, amount, description }
            });
        } catch (error) {
            next(error);
        }
    }

    async getRatePlans(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const ratePlans = await BookingService.getRatePlans();

            res.json({
                success: true,
                data: { ratePlans }
            });
        } catch (error) {
            next(error);
        }
    }
}
