import { z } from 'zod';

export const createSupplierCategorySchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Código é obrigatório').max(50, 'Código deve ter no máximo 50 caracteres'),
    name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
    icon: z.string().max(100, 'Ícone deve ter no máximo 100 caracteres').optional().nullable(),
    colorFrom: z.string().max(50, 'Cor inicial deve ter no máximo 50 caracteres').optional().nullable(),
    colorTo: z.string().max(50, 'Cor final deve ter no máximo 50 caracteres').optional().nullable(),
    description: z.string().optional().nullable(),
    sortOrder: z.number().int().min(0).optional().default(0),
    status: z.enum(['active', 'inactive']).optional().default('active'),
  }),
});

export const updateSupplierCategorySchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50).optional(),
    name: z.string().min(1).max(255).optional(),
    icon: z.string().max(100).optional().nullable(),
    colorFrom: z.string().max(50).optional().nullable(),
    colorTo: z.string().max(50).optional().nullable(),
    description: z.string().optional().nullable(),
    sortOrder: z.number().int().min(0).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export type CreateSupplierCategoryInput = z.infer<typeof createSupplierCategorySchema>['body'];
export type UpdateSupplierCategoryInput = z.infer<typeof updateSupplierCategorySchema>['body'];
