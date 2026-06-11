import { z } from 'zod';

export const createChartOfAccountSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Código da conta é obrigatório').max(50, 'Código muito longo'),
    name: z.string().min(1, 'Nome da conta é obrigatório').max(255, 'Nome muito longo'),
    accountType: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
    category: z.string().max(100).nullable().optional(),
    parentAccountId: z.number().int().positive().nullable().optional(),
    description: z.string().nullable().optional(),
    allowSubAccounts: z.boolean().optional(),
    allowTransactions: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateChartOfAccountSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50).optional(),
    name: z.string().min(1).max(255).optional(),
    accountType: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']).optional(),
    category: z.string().max(100).nullable().optional(),
    parentAccountId: z.number().int().positive().nullable().optional(),
    description: z.string().nullable().optional(),
    allowSubAccounts: z.boolean().optional(),
    allowTransactions: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateChartOfAccountInput = z.infer<typeof createChartOfAccountSchema>['body'];
export type UpdateChartOfAccountInput = z.infer<typeof updateChartOfAccountSchema>['body'];
