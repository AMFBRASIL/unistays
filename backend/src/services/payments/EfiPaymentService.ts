import path from 'path';
import EfiPay from 'sdk-node-apis-efi';
import { env } from '@/config/env';
import { AppError } from '@/middlewares/error.middleware';
import { logger } from '@/utils/logger';
import type { CreatePixImmediateInput, PixImmediateChargeResult } from './types';

/**
 * Integração **Efí Pay** (antiga Gerencianet) — PIX cobrança imediata.
 * Credenciais e certificado via `.env` (veja `backend/.env.example`).
 */
export class EfiPaymentService {
  static isConfigured(): boolean {
    const hasClient = !!(env.EFI_GN_CLIENT_ID && env.EFI_GN_CLIENT_SECRET);
    const hasPixKey = !!env.EFI_GN_PIX_KEY?.trim();
    const hasCert = !!(
      env.EFI_GN_CERTIFICATE_PATH?.trim() || env.EFI_GN_CERTIFICATE_BASE64?.trim()
    );
    return env.EFI_GN_ENABLED && hasClient && hasPixKey && hasCert;
  }

  private static buildClientOptions(): ConstructorParameters<typeof EfiPay>[0] {
    const certPathRaw = env.EFI_GN_CERTIFICATE_PATH?.trim();
    const certB64 = env.EFI_GN_CERTIFICATE_BASE64?.trim();

    let certificate: string;
    let cert_base64 = false;

    if (certB64) {
      certificate = certB64;
      cert_base64 = true;
    } else if (certPathRaw) {
      certificate = path.isAbsolute(certPathRaw)
        ? certPathRaw
        : path.join(process.cwd(), certPathRaw);
    } else {
      throw new AppError('Certificado Efí não configurado (path ou base64).', 500);
    }

    return {
      sandbox: env.EFI_GN_SANDBOX,
      client_id: env.EFI_GN_CLIENT_ID!,
      client_secret: env.EFI_GN_CLIENT_SECRET!,
      certificate,
      cert_base64,
    };
  }

  /**
   * Cria cobrança PIX imediata (POST /v2/cob). Retorna BR Code + txid.
   */
  static async createPixImmediateCharge(input: CreatePixImmediateInput): Promise<PixImmediateChargeResult> {
    if (!this.isConfigured()) {
      throw new AppError('Gateway Efí (Gerencianet) não está habilitado ou incompleto no .env.', 503);
    }

    const amount = Math.round(input.amount * 100) / 100;
    if (amount < 0.01) {
      throw new AppError('Valor mínimo para PIX é R$ 0,01.', 400);
    }

    const original = amount.toFixed(2);
    const expiracao = input.expirationSeconds ?? env.EFI_GN_CHARGE_EXPIRATION_SECONDS;

    const chave = env.EFI_GN_PIX_KEY!.trim();

    const body: Record<string, unknown> = {
      calendario: { expiracao },
      valor: { original },
      chave,
      solicitacaoPagador: input.description.slice(0, 140),
    };

    if (input.infoAdicionais?.length) {
      body.infoAdicionais = input.infoAdicionais.slice(0, 10).map((i) => ({
        nome: String(i.nome).slice(0, 50),
        valor: String(i.valor).slice(0, 200),
      }));
    }

    const pag = input.pagador;
    if (pag?.cnpj && String(pag.cnpj).replace(/\D/g, '').length === 14) {
      body.devedor = {
        cnpj: String(pag.cnpj).replace(/\D/g, ''),
        nome: (pag.nome || 'Pagador').toString().slice(0, 100),
      };
    } else if (pag?.cpf && String(pag.cpf).replace(/\D/g, '').length === 11) {
      body.devedor = {
        cpf: String(pag.cpf).replace(/\D/g, ''),
        nome: (pag.nome || 'Pagador').toString().slice(0, 100),
      };
    } else if (pag?.nome?.trim()) {
      body.devedor = {
        nome: pag.nome.trim().slice(0, 100),
      };
    }

    let efipay: InstanceType<typeof EfiPay>;
    try {
      efipay = new EfiPay(this.buildClientOptions());
    } catch (e) {
      logger.error('[EfiPaymentService] Falha ao instanciar SDK', e);
      throw new AppError('Falha ao inicializar cliente Efí (certificado/credenciais).', 500);
    }

    try {
      const res = (await efipay.pixCreateImmediateCharge({}, body)) as Record<string, unknown>;
      const txid = String(res.txid || '');
      const brCode = String(res.pixCopiaECola || res.pix_copia_e_cola || '');
      if (!txid || !brCode) {
        logger.warn('[EfiPaymentService] Resposta sem txid ou pixCopiaECola', res);
        throw new AppError('Resposta inválida da API Efí ao criar cobrança PIX.', 502);
      }
      return {
        provider: 'efi',
        txid,
        brCode,
        status: typeof res.status === 'string' ? res.status : undefined,
        location: typeof res.location === 'string' ? res.location : undefined,
      };
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      const msg =
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as { message: unknown }).message === 'string'
          ? (err as { message: string }).message
          : String(err);
      const nome =
        err &&
        typeof err === 'object' &&
        'nome' in err &&
        typeof (err as { nome: unknown }).nome === 'string'
          ? (err as { nome: string }).nome
          : '';
      logger.error('[EfiPaymentService] pixCreateImmediateCharge', { msg, nome, err });
      throw new AppError(nome || msg || 'Erro ao gerar cobrança PIX na Efí.', 502);
    }
  }
}
