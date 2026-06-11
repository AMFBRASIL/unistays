import { z } from 'zod';

// Helper para campos nullable/opcionais numéricos (tax rates)
const nullableDecimal = z.preprocess(
  (val) => {
    if (val === null || val === undefined || val === '' || val === 'null') {
      return null;
    }
    const num = typeof val === 'string' ? parseFloat(val) : Number(val);
    return Number.isNaN(num) ? null : num;
  },
  z.union([
    z.null(),
    z.number().min(0).max(100).optional(), // Tax rates de 0 a 100%
  ])
);

export const createFiscalParamsSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().nullable().optional(),
    
    // Regime Tributário
    taxRegime: z.enum(['simples_nacional', 'lucro_presumido', 'lucro_real']).optional(),
    
    // Alíquotas e Inclusão de Impostos
    icmsRate: nullableDecimal.optional(),
    icmsIncluded: z.boolean().optional(),
    ipiRate: nullableDecimal.optional(),
    ipiIncluded: z.boolean().optional(),
    pisRate: nullableDecimal.optional(),
    pisIncluded: z.boolean().optional(),
    cofinsRate: nullableDecimal.optional(),
    cofinsIncluded: z.boolean().optional(),
    issRate: nullableDecimal.optional(),
    issIncluded: z.boolean().optional(),
  }).passthrough(),
});

export const updateFiscalParamsSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().nullable().optional(),
    
    // Regime Tributário
    taxRegime: z.enum(['simples_nacional', 'lucro_presumido', 'lucro_real']).optional(),
    
    // Alíquotas e Inclusão de Impostos
    icmsRate: nullableDecimal.optional(),
    icmsIncluded: z.boolean().optional(),
    ipiRate: nullableDecimal.optional(),
    ipiIncluded: z.boolean().optional(),
    pisRate: nullableDecimal.optional(),
    pisIncluded: z.boolean().optional(),
    cofinsRate: nullableDecimal.optional(),
    cofinsIncluded: z.boolean().optional(),
    issRate: nullableDecimal.optional(),
    issIncluded: z.boolean().optional(),
  }).passthrough(),
});

export type CreateFiscalParamsInput = z.infer<typeof createFiscalParamsSchema>['body'];
export type UpdateFiscalParamsInput = z.infer<typeof updateFiscalParamsSchema>['body'];
