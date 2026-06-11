import { z } from 'zod';

export const createFinancialCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nome é obrigatório').max(100),
    type: z.enum(['income', 'expense']),
    icon: z.string().max(50).optional().default('DollarSign'),
    color: z.string().max(50).optional().default('slate-500'),
    sortOrder: z.number().int().optional().default(0),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateFinancialCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    type: z.enum(['income', 'expense']).optional(),
    icon: z.string().max(50).optional(),
    color: z.string().max(50).optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateFinancialCategoryInput = z.infer<typeof createFinancialCategorySchema>['body'];
export type UpdateFinancialCategoryInput = z.infer<typeof updateFinancialCategorySchema>['body'];
