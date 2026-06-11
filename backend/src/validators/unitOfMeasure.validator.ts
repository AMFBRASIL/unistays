import { z } from 'zod';

export const createUnitOfMeasureSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Código é obrigatório').max(10, 'Código deve ter no máximo 10 caracteres'),
    name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
    abbreviation: z.string().min(1, 'Abreviação é obrigatória').max(10, 'Abreviação deve ter no máximo 10 caracteres'),
    description: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional().default('active'),
  }),
});

export const updateUnitOfMeasureSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(10).optional(),
    name: z.string().min(1).max(100).optional(),
    abbreviation: z.string().min(1).max(10).optional(),
    description: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export type CreateUnitOfMeasureInput = z.infer<typeof createUnitOfMeasureSchema>['body'];
export type UpdateUnitOfMeasureInput = z.infer<typeof updateUnitOfMeasureSchema>['body'];
