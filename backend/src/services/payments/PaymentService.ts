import { AppError } from '@/middlewares/error.middleware';
import { EfiPaymentService } from './EfiPaymentService';
import type { CreatePixImmediateInput, PixImmediateChargeResult } from './types';

/**
 * Fachada de pagamentos da plataforma. Qualquer módulo (web check-in, reservas, PDV, etc.)
 * deve usar esta classe para não acoplar diretamente a um PSP.
 *
 * Hoje: **Efí (Gerencianet)** para PIX imediato. Novos adapters podem ser encadeados aqui.
 */
export class PaymentService {
  /** Há pelo menos um gateway PIX configurado e habilitado. */
  static isPixImmediateAvailable(): boolean {
    return EfiPaymentService.isConfigured();
  }

  /**
   * Cria cobrança PIX imediata (QR dinâmico / copia e cola).
   * @throws AppError 503 se nenhum gateway estiver disponível
   */
  static async createPixImmediateCharge(
    input: CreatePixImmediateInput
  ): Promise<PixImmediateChargeResult> {
    if (EfiPaymentService.isConfigured()) {
      return EfiPaymentService.createPixImmediateCharge(input);
    }
    throw new AppError(
      'Nenhum provedor de pagamento PIX está configurado. Defina EFI_GN_* no .env.',
      503
    );
  }
}
