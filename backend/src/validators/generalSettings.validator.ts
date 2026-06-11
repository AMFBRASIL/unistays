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
    if (cleaned.length === 14) {
      // Formatar CNPJ: XX.XXX.XXX/XXXX-XX
      return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
    return String(val);
  },
  z.union([
    z.null(),
    z.string().regex(/^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})$/, 'CNPJ inválido'),
  ])
);

// Validação de URL (aceita sem protocolo, adiciona https:// automaticamente)
const websiteSchema = z.preprocess(
  (val) => {
    // Se for undefined, null, ou string vazia, retorna null
    if (val === undefined || val === null || val === '' || val === 'null') {
      return null;
    }
    const url = String(val).trim();
    if (!url) return null;
    
    // Se não começa com http:// ou https://, adiciona https://
    if (!url.match(/^https?:\/\//i)) {
      return `https://${url}`;
    }
    return url;
  },
  z.union([
    z.null(),
    z.string().url('URL inválida'),
  ])
).optional();

export const createGeneralSettingsSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().nullable().optional(),
    hotelName: nullableString.optional(),
    legalName: nullableString.optional(),
    cnpj: cnpjSchema.optional(),
    address: nullableString.optional(),
    timezone: z.string().max(50).default('America/Sao_Paulo').optional(),
    currency: z.string().length(3).default('BRL').optional(),
    language: z.string().max(10).default('pt-BR').optional(),
    dateFormat: z.string().max(20).default('DD/MM/YYYY').optional(),
    timeFormat: z.enum(['12h', '24h']).default('24h').optional(),
    fiscalYearStart: z.string().length(2).default('01').optional(),
    fiscalYearEnd: z.string().length(2).default('12').optional(),
    contactEmail: z.string().email('E-mail inválido').nullable().optional().or(z.literal('')),
    contactPhone: nullableString.optional(),
    website: websiteSchema,
    businessHoursStart: nullableString.optional(),
    businessHoursEnd: nullableString.optional(),
    enableNotifications: z.boolean().optional(),
    enableEmailNotifications: z.boolean().optional(),
    enableSmsNotifications: z.boolean().optional(),
    autoBackup: z.boolean().optional(),
    backupFrequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']).optional(),
  }).passthrough(),
});

export const updateGeneralSettingsSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().nullable().optional(),
    hotelName: nullableString.optional(),
    legalName: nullableString.optional(),
    cnpj: cnpjSchema.optional(),
    address: nullableString.optional(),
    timezone: z.string().max(50).optional(),
    currency: z.string().length(3).optional(),
    language: z.string().max(10).optional(),
    dateFormat: z.string().max(20).optional(),
    timeFormat: z.enum(['12h', '24h']).optional(),
    fiscalYearStart: z.string().length(2).optional(),
    fiscalYearEnd: z.string().length(2).optional(),
    contactEmail: z.string().email('E-mail inválido').nullable().optional().or(z.literal('')),
    contactPhone: nullableString.optional(),
    website: websiteSchema,
    instagram: nullableString.optional(),
    logoUrl: nullableString.optional(),
    businessHoursStart: nullableString.optional(),
    businessHoursEnd: nullableString.optional(),
    // Campos de formatação de moeda
    currencySymbol: nullableString.optional(),
    currencyDecimalPlaces: z.number().int().min(0).max(4).optional(),
    currencyThousandsSeparator: nullableString.optional(),
    currencyDecimalSeparator: nullableString.optional(),
    currencySymbolPosition: z.enum(['before', 'after']).optional(),
    enableNotifications: z.boolean().optional(),
    enableEmailNotifications: z.boolean().optional(),
    enableSmsNotifications: z.boolean().optional(),
    autoBackup: z.boolean().optional(),
    backupFrequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']).optional(),
  }).passthrough(),
});

export type CreateGeneralSettingsInput = z.infer<typeof createGeneralSettingsSchema>['body'];
export type UpdateGeneralSettingsInput = z.infer<typeof updateGeneralSettingsSchema>['body'];
