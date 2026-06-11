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

// Validação de URL
const urlSchema = z.preprocess(
  (val) => {
    if (!val || val === '' || val === 'null') return null;
    return String(val).trim() || null;
  },
  z.union([
    z.null(),
    z.string().url('URL inválida'),
  ])
);

// Validação de array de idiomas
const languagesSchema = z.preprocess(
  (val) => {
    if (!val) return null;
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return [val];
      }
    }
    return null;
  },
  z.union([
    z.null(),
    z.array(z.string()),
  ])
);

// Validação de número inteiro positivo ou zero
const positiveIntSchema = z.preprocess(
  (val) => {
    if (val === null || val === undefined || val === '' || val === 'null') return null;
    const num = typeof val === 'string' ? parseInt(val, 10) : Number(val);
    return Number.isNaN(num) ? null : num;
  },
  z.union([
    z.null(),
    z.number().int().min(0),
  ])
);

// Validação de percentual (0-100)
const percentageSchema = z.preprocess(
  (val) => {
    if (val === null || val === undefined || val === '' || val === 'null') return null;
    const num = typeof val === 'string' ? parseFloat(val) : Number(val);
    return Number.isNaN(num) ? null : num;
  },
  z.union([
    z.null(),
    z.number().min(0).max(100),
  ])
);

export const createBookingEngineConfigSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().nullable().optional(),
    
    // Configurações Gerais
    enabled: z.boolean().optional(),
    websiteUrl: urlSchema.optional(),
    bookingUrl: urlSchema.optional(),
    defaultCurrency: z.string().length(3).optional(),
    availableLanguages: languagesSchema.optional(),
    
    // Configurações de Reserva
    enableInstantBooking: z.boolean().optional(),
    minAdvanceBooking: positiveIntSchema.optional(),
    maxAdvanceBooking: positiveIntSchema.optional(),
    
    // Configurações de Pagamento
    requirePayment: z.boolean().optional(),
    requireDeposit: z.boolean().optional(),
    depositPercentage: percentageSchema.optional(),
    
    // Configurações de Exibição
    enableSearchFilters: z.boolean().optional(),
    showPriceInclusive: z.boolean().optional(),
    enableGuestReviews: z.boolean().optional(),
    enableRecommendations: z.boolean().optional(),
    mobileOptimized: z.boolean().optional(),
    
    // Integrações
    enableGoogleAnalytics: z.boolean().optional(),
    googleAnalyticsId: nullableString.optional(),
  }).passthrough(),
});

export const updateBookingEngineConfigSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().nullable().optional(),
    
    // Configurações Gerais
    enabled: z.boolean().optional(),
    websiteUrl: urlSchema.optional(),
    bookingUrl: urlSchema.optional(),
    defaultCurrency: z.string().length(3).optional(),
    availableLanguages: languagesSchema.optional(),
    
    // Configurações de Reserva
    enableInstantBooking: z.boolean().optional(),
    minAdvanceBooking: positiveIntSchema.optional(),
    maxAdvanceBooking: positiveIntSchema.optional(),
    
    // Configurações de Pagamento
    requirePayment: z.boolean().optional(),
    requireDeposit: z.boolean().optional(),
    depositPercentage: percentageSchema.optional(),
    
    // Configurações de Exibição
    enableSearchFilters: z.boolean().optional(),
    showPriceInclusive: z.boolean().optional(),
    enableGuestReviews: z.boolean().optional(),
    enableRecommendations: z.boolean().optional(),
    mobileOptimized: z.boolean().optional(),
    
    // Integrações
    enableGoogleAnalytics: z.boolean().optional(),
    googleAnalyticsId: nullableString.optional(),
  }).passthrough(),
});

export type CreateBookingEngineConfigInput = z.infer<typeof createBookingEngineConfigSchema>['body'];
export type UpdateBookingEngineConfigInput = z.infer<typeof updateBookingEngineConfigSchema>['body'];
