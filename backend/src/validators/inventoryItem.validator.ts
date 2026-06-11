import { z } from 'zod';

const bodySchemaObject = z.object({
  productId: z.coerce.number().int().positive('Selecione o produto do catálogo').optional(),
  propertyId: z.coerce.number().int().positive('Propriedade é obrigatória'),
  name: z.string().max(255).optional(),
  category: z.string().max(100).optional().nullable(),
  sku: z.string().max(100).optional().nullable(),
  barcode: z.string().max(100).optional().nullable(),
  brand: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
  model: z.string().max(255).optional().nullable(),
  imageUrl: z.string().max(500).optional().nullable(),
  unit: z.string().max(50).optional().default('un'),
  currentStock: z.coerce.number().min(0).default(0),
  minStock: z.coerce.number().min(0).default(0),
  maxStock: z.coerce.number().min(0).optional().nullable(),
  reorderPoint: z.coerce.number().min(0).optional().nullable(),
  costPrice: z.coerce.number().min(0).optional().nullable(),
  sellingPrice: z.coerce.number().min(0).optional().nullable(),
  supplier: z.string().max(255).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  shelfPosition: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
  temperatureControl: z.boolean().optional(),
  humidityControl: z.boolean().optional(),
  trackBatch: z.boolean().optional(),
  trackSerial: z.boolean().optional(),
  expirationAlert: z.boolean().optional(),
  expirationDays: z.coerce.number().int().min(0).optional().nullable(),
});

const bodySchema = bodySchemaObject.refine(
  (data) => data.productId != null || (data.name != null && data.name.trim().length > 0),
  { message: 'Informe o produto (productId) ou o nome do item', path: ['name'] }
);

export const createInventoryItemSchema = z.object({ body: bodySchema });
export const updateInventoryItemSchema = z.object({ body: bodySchemaObject.partial() });

export type CreateInventoryItemInput = z.infer<typeof bodySchema>;
export type UpdateInventoryItemInput = z.infer<typeof bodySchemaObject>;
