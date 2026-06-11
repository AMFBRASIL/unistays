import { z } from 'zod';

// Helper para campos nullable/opcionais
const nullableString = z.preprocess(
  (val) => {
    if (val === null || val === undefined || val === '' || val === 'null') {
      return null;
    }
    return typeof val === 'string' ? val.trim() || null : val;
  },
  z.union([z.null(), z.string()])
);

// Validação de CNPJ (14 dígitos, aceita formatado)
const cnpjSchema = z.preprocess(
  (val) => {
    if (!val || val === '' || val === 'null') return null;
    const cleaned = String(val).replace(/\D/g, ''); // Remove formatação
    return cleaned.length === 14 ? cleaned : String(val); // Retorna formatado se válido
  },
  z.union([
    z.null(),
    z.string().regex(/^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})$/, 'CNPJ inválido'),
  ])
);

// Validação de CEP (8 dígitos, aceita formatado)
const cepSchema = z.preprocess(
  (val) => {
    if (!val || val === '' || val === 'null') return null;
    const cleaned = String(val).replace(/\D/g, ''); // Remove formatação
    return cleaned.length === 8 ? cleaned : String(val); // Retorna formatado se válido
  },
  z.union([
    z.null(),
    z.string().regex(/^(\d{5}-?\d{3}|\d{8})$/, 'CEP inválido'),
  ])
);

// Validação de estado (UF) - 2 letras maiúsculas
const stateSchema = z.preprocess(
  (val) => {
    if (!val || val === '' || val === 'null') return null;
    return String(val).toUpperCase().substring(0, 2);
  },
  z.union([
    z.null(),
    z.string().length(2, 'UF deve ter 2 caracteres'),
  ])
);

export const createInvoiceParamsSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().nullable().optional(),
    
    // Dados da Empresa
    companyName: nullableString.optional(),
    cnpj: cnpjSchema.optional(),
    stateRegistration: nullableString.optional(),
    municipalRegistration: nullableString.optional(),
    address: nullableString.optional(),
    number: nullableString.optional(),
    complement: nullableString.optional(),
    city: nullableString.optional(),
    state: stateSchema.optional(),
    zipCode: cepSchema.optional(),
    phone: nullableString.optional(),
    email: z.string().email('E-mail inválido').nullable().optional().or(z.literal('')),
    
    // Certificado Digital
    certificatePath: nullableString.optional(),
    certificatePassword: nullableString.optional(),
    
    // Configurações de Emissão
    nfProvider: z.enum(['sefaz', 'nfcom']).optional(),
    serie: z.string().max(10).optional(),
    environment: z.enum(['production', 'homologation']).optional(),
    autoEmit: z.boolean().optional(),
  }).passthrough(), // Permite campos extras
});

export const updateInvoiceParamsSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().nullable().optional(),
    
    // Dados da Empresa
    companyName: nullableString.optional(),
    cnpj: cnpjSchema.optional(),
    stateRegistration: nullableString.optional(),
    municipalRegistration: nullableString.optional(),
    address: nullableString.optional(),
    number: nullableString.optional(),
    complement: nullableString.optional(),
    city: nullableString.optional(),
    state: stateSchema.optional(),
    zipCode: cepSchema.optional(),
    phone: nullableString.optional(),
    email: z.string().email('E-mail inválido').nullable().optional().or(z.literal('')),
    
    // Certificado Digital
    certificatePath: nullableString.optional(),
    certificatePassword: nullableString.optional(),
    
    // Configurações de Emissão
    nfProvider: z.enum(['sefaz', 'nfcom']).optional(),
    serie: z.string().max(10).optional(),
    environment: z.enum(['production', 'homologation']).optional(),
    autoEmit: z.boolean().optional(),
  }).passthrough(), // Permite campos extras
});

export type CreateInvoiceParamsInput = z.infer<typeof createInvoiceParamsSchema>['body'];
export type UpdateInvoiceParamsInput = z.infer<typeof updateInvoiceParamsSchema>['body'];
