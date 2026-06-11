import { z } from 'zod';

// Transforma null/undefined/string vazia em undefined para campos opcionais
const nullablePositiveInt = z.preprocess(
  (val) => {
    if (val === null || val === undefined || val === '' || val === 'null') {
      return null; // Mantém null explicitamente
    }
    const num = typeof val === 'string' ? parseInt(val, 10) : Number(val);
    return Number.isNaN(num) ? null : num;
  },
  z.union([
    z.null(),
    z.number().int().positive(),
  ])
);

const nullablePositiveNumber = z.preprocess(
  (val) => {
    if (val === null || val === undefined || val === '' || val === 'null') {
      return null; // Mantém null explicitamente
    }
    const num = typeof val === 'string' ? parseFloat(val) : Number(val);
    return Number.isNaN(num) ? null : num;
  },
  z.union([
    z.null(),
    z.number().min(0).max(100),
  ])
);

export const createProductConfigSchema = z.object({
  body: z.object({
    propertyId: nullablePositiveInt.optional(),
    defaultUnitId: nullablePositiveInt.optional(),
    defaultProductGroupId: nullablePositiveInt.optional(),
    defaultCategoryId: nullablePositiveInt.optional(),
    defaultCategory: z.string().max(100).nullish().optional(), // Mantido para compatibilidade
    enableBarcode: z.boolean().optional(),
    enableImages: z.boolean().optional(),
    enableVariations: z.boolean().optional(),
    priceRounding: z.number().int().min(0).max(4).optional(),
    enableTaxes: z.boolean().optional(),
    defaultTaxRate: nullablePositiveNumber.optional(),
  }),
});

export const updateProductConfigSchema = z.object({
  body: z.object({
    propertyId: nullablePositiveInt.optional(),
    defaultUnitId: nullablePositiveInt.optional(),
    defaultProductGroupId: nullablePositiveInt.optional(),
    defaultCategoryId: nullablePositiveInt.optional(),
    defaultCategory: z.string().max(100).nullish().optional(), // Mantido para compatibilidade
    enableBarcode: z.boolean().optional(),
    enableImages: z.boolean().optional(),
    enableVariations: z.boolean().optional(),
    priceRounding: z.number().int().min(0).max(4).optional(),
    enableTaxes: z.boolean().optional(),
    defaultTaxRate: nullablePositiveNumber.optional(),
  }),
});

export type CreateProductConfigInput = z.infer<typeof createProductConfigSchema>['body'];
export type UpdateProductConfigInput = z.infer<typeof updateProductConfigSchema>['body'];
