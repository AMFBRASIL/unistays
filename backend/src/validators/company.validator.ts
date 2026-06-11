import { z } from 'zod';

export const createCompanySchema = z.object({
  body: z.object({
    type: z.enum(['agency', 'corporate', 'operator', 'ota'], { required_error: 'Tipo de empresa é obrigatório' }),
    name: z.string().min(1, 'Razão social é obrigatória').max(255, 'Razão social deve ter no máximo 255 caracteres'),
    tradeName: z.string().max(255, 'Nome fantasia deve ter no máximo 255 caracteres').optional().nullable(),
    cnpj: z.string().max(18, 'CNPJ deve ter no máximo 18 caracteres').optional().nullable(),
    stateRegistration: z.string().max(50, 'Inscrição Estadual deve ter no máximo 50 caracteres').optional().nullable(),
    email: z.preprocess(
      (val) => val === '' || val === null || val === undefined ? null : val,
      z.union([
        z.string().email('E-mail inválido'),
        z.null()
      ]).optional()
    ),
    phone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional().nullable(),
    website: z.string().max(500, 'Website deve ter no máximo 500 caracteres').optional().nullable(),
    contactName: z.string().max(255, 'Nome do contato deve ter no máximo 255 caracteres').optional().nullable(),
    contactEmail: z.preprocess(
      (val) => val === '' || val === null || val === undefined ? null : val,
      z.union([
        z.string().email('E-mail do contato inválido'),
        z.null()
      ]).optional()
    ),
    contactPhone: z.string().max(20, 'Telefone do contato deve ter no máximo 20 caracteres').optional().nullable(),
    zipCode: z.string().max(20, 'CEP deve ter no máximo 20 caracteres').optional().nullable(),
    address: z.string().max(500, 'Endereço deve ter no máximo 500 caracteres').optional().nullable(),
    street: z.string().max(255, 'Logradouro deve ter no máximo 255 caracteres').optional().nullable(),
    number: z.string().max(20, 'Número deve ter no máximo 20 caracteres').optional().nullable(),
    complement: z.string().max(100, 'Complemento deve ter no máximo 100 caracteres').optional().nullable(),
    neighborhood: z.string().max(100, 'Bairro deve ter no máximo 100 caracteres').optional().nullable(),
    city: z.string().max(100, 'Cidade deve ter no máximo 100 caracteres').optional().nullable(),
    state: z.string().max(50, 'Estado deve ter no máximo 50 caracteres').optional().nullable(),
    country: z.string().max(100, 'País deve ter no máximo 100 caracteres').optional().default('Brasil'),
    commissionPercentage: z.number().min(0).max(100).optional().nullable(),
    paymentTerms: z.string().max(50, 'Prazo de pagamento deve ter no máximo 50 caracteres').optional().nullable(),
    notes: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional().default('active'),
  }),
});

export const updateCompanySchema = z.object({
  body: z.object({
    type: z.enum(['agency', 'corporate', 'operator', 'ota']).optional(),
    name: z.string().min(1).max(255).optional(),
    tradeName: z.string().max(255).optional().nullable(),
    cnpj: z.string().max(18).optional().nullable(),
    stateRegistration: z.string().max(50).optional().nullable(),
    email: z.preprocess(
      (val) => val === '' || val === null || val === undefined ? null : val,
      z.union([
        z.string().email(),
        z.null()
      ]).optional()
    ),
    phone: z.string().max(20).optional().nullable(),
    website: z.string().max(500).optional().nullable(),
    contactName: z.string().max(255).optional().nullable(),
    contactEmail: z.preprocess(
      (val) => val === '' || val === null || val === undefined ? null : val,
      z.union([
        z.string().email(),
        z.null()
      ]).optional()
    ),
    contactPhone: z.string().max(20).optional().nullable(),
    zipCode: z.string().max(20).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    street: z.string().max(255).optional().nullable(),
    number: z.string().max(20).optional().nullable(),
    complement: z.string().max(100).optional().nullable(),
    neighborhood: z.string().max(100).optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    state: z.string().max(50).optional().nullable(),
    country: z.string().max(100).optional(),
    commissionPercentage: z.number().min(0).max(100).optional().nullable(),
    paymentTerms: z.string().max(50).optional().nullable(),
    notes: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>['body'];
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>['body'];
