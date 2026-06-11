import { z } from 'zod';

export const createProductGroupSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Código é obrigatório').max(50, 'Código deve ter no máximo 50 caracteres'),
    name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
    parentGroupId: z.number().int().positive().optional().nullable(),
    description: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional().default('active'),
  }),
});

export const updateProductGroupSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50).optional(),
    name: z.string().min(1).max(255).optional(),
    parentGroupId: z.number().int().positive().optional().nullable(),
    description: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export type CreateProductGroupInput = z.infer<typeof createProductGroupSchema>['body'];
export type UpdateProductGroupInput = z.infer<typeof updateProductGroupSchema>['body'];
