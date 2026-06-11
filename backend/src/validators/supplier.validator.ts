import { z } from 'zod';

export const createSupplierSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive('Propriedade é obrigatória para cadastro do fornecedor'),
    code: z.string().min(1, 'Código é obrigatório').max(50, 'Código deve ter no máximo 50 caracteres').optional(),
    categoryId: z.number().int().positive('Categoria é obrigatória'),
    name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
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
    whatsapp: z.string().max(20, 'WhatsApp deve ter no máximo 20 caracteres').optional().nullable(),
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
    city: z.string().max(100, 'Cidade deve ter no máximo 100 caracteres').optional().nullable(),
    state: z.string().max(50, 'Estado deve ter no máximo 50 caracteres').optional().nullable(),
    paymentTerms: z.number().int().min(0).optional().nullable(),
    deliveryDays: z.number().int().min(0).optional().nullable(),
    minOrderValue: z.number().min(0).optional().nullable(),
    notes: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional().default('active'),
  }),
});

export const updateSupplierSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().optional().nullable(),
    code: z.string().min(1).max(50).optional(),
    categoryId: z.number().int().positive().optional(),
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
    whatsapp: z.string().max(20).optional().nullable(),
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
    city: z.string().max(100).optional().nullable(),
    state: z.string().max(50).optional().nullable(),
    paymentTerms: z.number().int().min(0).optional().nullable(),
    deliveryDays: z.number().int().min(0).optional().nullable(),
    minOrderValue: z.number().min(0).optional().nullable(),
    notes: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>['body'];
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>['body'];
