import { z } from 'zod';

export const createUnitSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive('ID da propriedade deve ser positivo'),
    number: z.string().min(1, 'Número do quarto é obrigatório').max(50, 'Número deve ter no máximo 50 caracteres'),
    name: z.string().max(255, 'Nome deve ter no máximo 255 caracteres').optional().nullable(),
    roomTypeId: z.number().int().positive().optional().nullable(),
    type: z.string().min(1, 'Tipo é obrigatório').max(100),
    floor: z.number().int().min(0).default(1),
    capacity: z.number().int().positive().default(2),
    maxCapacity: z.number().int().positive().default(2),
    beds: z.string().max(255).optional().nullable(),
    sizeM2: z.number().positive().optional().nullable(),
    view: z.string().max(100).optional().nullable(),
    amenities: z
      .any()
      .superRefine((val, ctx) => {
        // Aceita null/undefined
        if (val === null || val === undefined) {
          return; // Válido
        }

        // Valida array de strings
        if (Array.isArray(val)) {
          const allStrings = val.every((item) => typeof item === 'string');
          if (!allStrings) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Array deve conter apenas strings',
            });
          }
          return; // Válido
        }

        // Aceita qualquer objeto (não array)
        if (typeof val === 'object') {
          return; // Válido
        }

        // Qualquer outro tipo é inválido
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Amenities deve ser um array de strings, um objeto, ou null',
        });
      })
      .optional()
      .nullable(),
    images: z.array(z.string().min(1)).optional().nullable(),
    status: z.enum(['available', 'occupied', 'checkout', 'cleaning', 'maintenance', 'blocked']).optional().default('available'),
    rates: z.object({
      daily: z.number().positive().optional(),
      weekly: z.number().positive().optional(),
      monthly: z.number().positive().optional(),
    }).optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateUnitSchema = z.object({
  body: z.object({
    number: z.string().min(1).max(50).optional(),
    name: z.string().max(255).optional().nullable(),
    roomTypeId: z.number().int().positive().optional().nullable(),
    type: z.string().min(1).max(100).optional(),
    floor: z.number().int().min(0).optional(),
    capacity: z.number().int().positive().optional(),
    maxCapacity: z.number().int().positive().optional(),
    beds: z.string().max(255).optional().nullable(),
    sizeM2: z.number().positive().optional().nullable(),
    view: z.string().max(100).optional().nullable(),
    amenities: z
      .any()
      .superRefine((val, ctx) => {
        // Aceita null/undefined
        if (val === null || val === undefined) {
          return; // Válido
        }

        // Valida array de strings
        if (Array.isArray(val)) {
          const allStrings = val.every((item) => typeof item === 'string');
          if (!allStrings) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Array deve conter apenas strings',
            });
          }
          return; // Válido
        }

        // Aceita qualquer objeto (não array)
        if (typeof val === 'object') {
          return; // Válido
        }

        // Qualquer outro tipo é inválido
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Amenities deve ser um array de strings, um objeto, ou null',
        });
      })
      .optional()
      .nullable(),
    images: z.array(z.string().min(1)).optional().nullable(),
    status: z.enum(['available', 'occupied', 'checkout', 'cleaning', 'maintenance', 'blocked']).optional(),
    rates: z.object({
      daily: z.number().positive().optional(),
      weekly: z.number().positive().optional(),
      monthly: z.number().positive().optional(),
    }).optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>['body'];
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>['body'];
