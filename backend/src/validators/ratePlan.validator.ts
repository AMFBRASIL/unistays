import { z } from 'zod';

export const createRatePlanSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive('Propriedade é obrigatória'),
    name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
    code: z.string().min(1, 'Código é obrigatório').max(50, 'Código deve ter no máximo 50 caracteres').optional(),
    description: z.string().optional().nullable(),
    type: z.enum(['rack', 'corporate', 'group', 'promotional', 'package', 'long_stay'], { required_error: 'Tipo é obrigatório' }),
    currency: z.string().length(3).optional().default('BRL'),
    baseRate: z.number().min(0, 'Taxa base deve ser maior ou igual a zero').optional().default(0),
    discountPercentage: z.number().min(0).max(100).optional().nullable(),
    minStay: z.number().int().min(1).optional().nullable(),
    maxStay: z.number().int().min(1).optional().nullable(),
    advanceBookingDays: z.number().int().min(0).optional().nullable(),
    validFrom: z.string().date().optional().nullable(),
    validTo: z.string().date().optional().nullable(),
    propertyTypes: z.array(z.string()).optional().nullable(), // JSON: tipos de propriedade aplicáveis
    stayTypes: z.array(z.string()).optional().nullable(), // JSON: tipos de estadia aplicáveis
    inclusions: z.array(z.string()).optional().nullable(), // JSON: inclusões do plano
    cancellationPolicy: z.record(z.any()).optional().nullable(),
    restrictions: z.record(z.any()).optional().nullable(),
    status: z.enum(['active', 'inactive']).optional().default('active'),
  }),
});

export const updateRatePlanSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().optional(),
    name: z.string().min(1).max(255).optional(),
    code: z.string().min(1).max(50).optional(),
    description: z.string().optional().nullable(),
    type: z.enum(['rack', 'corporate', 'group', 'promotional', 'package', 'long_stay']).optional(),
    currency: z.string().length(3).optional(),
    baseRate: z.number().min(0).optional(),
    discountPercentage: z.number().min(0).max(100).optional().nullable(),
    minStay: z.number().int().min(1).optional().nullable(),
    maxStay: z.number().int().min(1).optional().nullable(),
    advanceBookingDays: z.number().int().min(0).optional().nullable(),
    validFrom: z.string().date().optional().nullable(),
    validTo: z.string().date().optional().nullable(),
    propertyTypes: z.array(z.string()).optional().nullable(),
    stayTypes: z.array(z.string()).optional().nullable(),
    inclusions: z.array(z.string()).optional().nullable(),
    cancellationPolicy: z.record(z.any()).optional().nullable(),
    restrictions: z.record(z.any()).optional().nullable(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export type CreateRatePlanInput = z.infer<typeof createRatePlanSchema>['body'];
export type UpdateRatePlanInput = z.infer<typeof updateRatePlanSchema>['body'];
