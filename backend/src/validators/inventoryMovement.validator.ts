import { z } from 'zod';

export const createInventoryMovementSchema = z.object({
  body: z.object({
    itemId: z.coerce.number().int().positive('Item é obrigatório'),
    type: z.enum(['in', 'out', 'transfer', 'adjustment']),
    quantity: z.coerce.number().refine((v) => v !== 0, 'Quantidade não pode ser zero'),
    unitCost: z.coerce.number().min(0).optional().nullable(),
    reason: z.string().max(255).optional().nullable(),
    reference: z.string().max(255).optional().nullable(),
    notes: z.string().optional().nullable(),
    inventoryCountId: z.coerce.number().int().positive().optional().nullable(),
  }),
});

export const createInventoryMovementBulkSchema = z.object({
  body: z.object({
    movements: z.array(z.object({
      itemId: z.coerce.number().int().positive(),
      type: z.enum(['in', 'out', 'transfer', 'adjustment']),
      quantity: z.coerce.number().refine((v) => v !== 0, 'Quantidade não pode ser zero'),
      reason: z.string().max(255).optional().nullable(),
    })).min(1, 'Informe ao menos uma movimentação'),
  }),
});

export type CreateInventoryMovementInput = z.infer<typeof createInventoryMovementSchema>['body'];
export type CreateInventoryMovementBulkInput = z.infer<typeof createInventoryMovementBulkSchema>['body'];
