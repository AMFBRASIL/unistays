import { z } from 'zod';

const countItemSchema = z.object({
  itemId: z.coerce.number().int().positive(),
  systemQuantity: z.coerce.number().min(0),
  countedQuantity: z.coerce.number().min(0).nullable(),
  status: z.enum(['pending', 'counted', 'divergent', 'adjusted']),
  notes: z.string().max(500).optional().nullable(),
});

export const createInventoryCountSchema = z.object({
  body: z.object({
    propertyId: z.coerce.number().int().positive('Propriedade é obrigatória'),
    name: z.string().min(1, 'Nome da contagem é obrigatório').max(255),
    protocol: z.string().min(1, 'Protocolo é obrigatório').max(50),
    responsible: z.string().max(255).optional().nullable(),
    notes: z.string().optional().nullable(),
    blindCount: z.boolean().optional(),
    totalItems: z.coerce.number().int().min(0).optional(),
    countedItems: z.coerce.number().int().min(0).optional(),
    divergentItems: z.coerce.number().int().min(0).optional(),
    adjustedItems: z.coerce.number().int().min(0).optional(),
    accuracyPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
    status: z.enum(['draft', 'completed', 'cancelled']).optional(),
    items: z.array(countItemSchema).optional(),
  }),
});

export type CreateInventoryCountInput = z.infer<typeof createInventoryCountSchema>['body'];
