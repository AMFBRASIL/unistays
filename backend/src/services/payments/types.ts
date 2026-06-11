/** Resultado genérico de cobrança PIX imediata (extensível para outros gateways). */
export type PixImmediateChargeResult = {
  provider: 'efi';
  txid: string;
  brCode: string;
  status?: string;
  location?: string;
};

export type CreatePixImmediateInput = {
  /** Valor em BRL (ex.: 199.9) */
  amount: number;
  /** Texto exibido ao pagador */
  description: string;
  pagador?: {
    nome?: string | null;
    /** CPF somente dígitos */
    cpf?: string | null;
    cnpj?: string | null;
  };
  /** Campos extras no comprovante (máx. conforme API Efí) */
  infoAdicionais?: { nome: string; valor: string }[];
  /** Segundos até expirar a cobrança (padrão no .env) */
  expirationSeconds?: number;
};
