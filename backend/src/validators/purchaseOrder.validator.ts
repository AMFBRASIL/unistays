import { z } from 'zod';

const orderItemSchema = z.object({
  inventoryItemId: z.coerce.number().int().positive('Item é obrigatório'),
  quantity: z.coerce.number().positive('Quantidade deve ser positiva'),
  unitPrice: z.coerce.number().min(0).default(0),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
});

const bodySchema = z.object({
  propertyId: z.coerce.number().int().positive('Propriedade é obrigatória'),
  supplierId: z.coerce.number().int().positive().optional().nullable(),
  supplierName: z.string().max(255).optional().nullable(),
  orderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
  expectedDeliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  deliveryAddress: z.string().max(500).optional().nullable(),
  deliveryNotes: z.string().optional().nullable(),
  paymentMethodId: z.coerce.number().int().positive().optional().nullable(),
  paymentInstallments: z.coerce.number().int().min(1).optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(orderItemSchema).min(1, 'Adicione pelo menos um item'),
});

export const createPurchaseOrderSchema = z.object({ body: bodySchema });
export type CreatePurchaseOrderInput = z.infer<typeof bodySchema>;

const updateStatusBodySchema = z.object({
  status: z.string().min(1, 'Status é obrigatório'),
  notes: z.string().optional().nullable(),
});

export const updatePurchaseOrderStatusSchema = z.object({ body: updateStatusBodySchema });
