import { z } from 'zod';

export const createProductCategorySchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50).regex(/^[A-Z0-9_]+$/, 'Código deve conter apenas letras maiúsculas, números e underscore'),
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional().nullable(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser um código hexadecimal válido (ex: #FF5733)').optional().nullable(),
    icon: z.string().max(50).optional().nullable(),
    parentId: z.number().int().positive().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const updateProductCategorySchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50).regex(/^[A-Z0-9_]+$/, 'Código deve conter apenas letras maiúsculas, números e underscore').optional(),
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional().nullable(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser um código hexadecimal válido (ex: #FF5733)').optional().nullable(),
    icon: z.string().max(50).optional().nullable(),
    parentId: z.number().int().positive().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export type CreateProductCategoryInput = z.infer<typeof createProductCategorySchema>['body'];
export type UpdateProductCategoryInput = z.infer<typeof updateProductCategorySchema>['body'];
