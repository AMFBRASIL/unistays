import { z } from 'zod';

export const TransactionTypeSchema = z.enum(['income', 'expense']);
export const TransactionStatusSchema = z.enum(['pending', 'completed', 'cancelled', 'refunded']);

const transactionBodySchema = z.object({
    type: TransactionTypeSchema,
    financialCategoryId: z.coerce.number().int().positive('Categoria é obrigatória'),
    chartOfAccountId: z.coerce.number().int().positive().optional().nullable(),
    description: z.string().min(1, 'Descrição é obrigatória'),
    amount: z.coerce.number().positive('Valor deve ser positivo'),
    currency: z.string().length(3).default('BRL'),
    status: TransactionStatusSchema.default('pending'),
    paymentMethodId: z.coerce.number().nullable().optional(),
    paymentDate: z.string().optional().nullable(),
    dueDate: z.string().optional().nullable(),
    propertyId: z.coerce.number().optional().nullable(),
    supplierId: z.coerce.number().optional().nullable(),
    reservationId: z.coerce.number().optional().nullable(),
    notes: z.string().optional().nullable(),
    attachments: z.array(z.string()).optional().nullable(),
});

export const createTransactionSchema = z.object({
    body: transactionBodySchema,
});

export const updateTransactionSchema = z.object({
    body: transactionBodySchema.partial(),
});

export type CreateTransactionInput = z.infer<typeof transactionBodySchema>;
export type UpdateTransactionInput = z.infer<typeof transactionBodySchema>;
