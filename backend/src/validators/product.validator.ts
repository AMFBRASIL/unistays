import { z } from 'zod';

// Helper para campos numéricos opcionais que podem ser null
const nullablePositiveInt = z.union([
  z.null(),
  z.undefined(),
  z.number().int().positive(),
]);

const nullableDecimal = z.union([
  z.null(),
  z.undefined(),
  z.number().min(0),
]);

export const createProductSchema = z.object({
  body: z.object({
    propertyId: nullablePositiveInt.optional(),
    code: z.string().min(1).max(50),
    name: z.string().min(1).max(255),
    barcode: z.string().max(100).nullable().optional(),
    categoryId: nullablePositiveInt.optional(),
    category: z.string().max(100).nullable().optional(), // Mantido para compatibilidade
    productGroupId: nullablePositiveInt.optional(),
    unitId: nullablePositiveInt.optional(),
    description: z.string().nullable().optional(),
    costPrice: nullableDecimal.optional(),
    salePrice: nullableDecimal.optional(),
    stockQuantity: z.number().min(0).default(0),
    minStock: z.number().min(0).default(0),
    trackStock: z.boolean().optional().default(true),
    supplierId: nullablePositiveInt.optional(),
    images: z.array(z.string()).nullable().optional(), // Array de URLs de imagens
    status: z.enum(['active', 'inactive']).optional().default('active'),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    propertyId: nullablePositiveInt.optional(),
    code: z.string().min(1).max(50).optional(),
    name: z.string().min(1).max(255).optional(),
    barcode: z.string().max(100).nullable().optional(),
    categoryId: nullablePositiveInt.optional(),
    category: z.string().max(100).nullable().optional(),
    productGroupId: nullablePositiveInt.optional(),
    unitId: nullablePositiveInt.optional(),
    description: z.string().nullable().optional(),
    costPrice: nullableDecimal.optional(),
    salePrice: nullableDecimal.optional(),
    stockQuantity: z.number().min(0).optional(),
    minStock: z.number().min(0).optional(),
    trackStock: z.boolean().optional(),
    supplierId: nullablePositiveInt.optional(),
    images: z.array(z.string()).nullable().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
