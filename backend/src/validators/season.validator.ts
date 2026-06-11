import { z } from 'zod';

export const createSeasonSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive('Propriedade é obrigatória'),
    code: z.string().min(1, 'Código é obrigatório').max(50, 'Código deve ter no máximo 50 caracteres'),
    name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
    type: z.enum(['high', 'medium', 'low', 'special', 'holiday'], { required_error: 'Tipo é obrigatório' }),
    startDate: z.string().date('Data de início inválida'),
    endDate: z.string().date('Data de fim inválida'),
    priceMultiplier: z.number().min(0.1, 'Multiplicador deve ser maior que 0').max(10, 'Multiplicador deve ser menor ou igual a 10').optional().default(1.0),
    isRecurring: z.boolean().optional().default(false),
    recurrencePattern: z.record(z.any()).optional().nullable(),
    description: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional().default('active'),
  }).refine((data) => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    }
    return true;
  }, {
    message: 'Data de fim deve ser maior ou igual à data de início',
    path: ['endDate'],
  }),
});

export const updateSeasonSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().optional(),
    code: z.string().min(1).max(50).optional(),
    name: z.string().min(1).max(255).optional(),
    type: z.enum(['high', 'medium', 'low', 'special', 'holiday']).optional(),
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
    priceMultiplier: z.number().min(0.1).max(10).optional(),
    isRecurring: z.boolean().optional(),
    recurrencePattern: z.record(z.any()).optional().nullable(),
    description: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional(),
  }).refine((data) => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    }
    return true;
  }, {
    message: 'Data de fim deve ser maior ou igual à data de início',
    path: ['endDate'],
  }),
});

export type CreateSeasonInput = z.infer<typeof createSeasonSchema>['body'];
export type UpdateSeasonInput = z.infer<typeof updateSeasonSchema>['body'];
