import { z } from 'zod';

export const createExtraSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive('Propriedade é obrigatória'),
    code: z.string().min(1, 'Código é obrigatório').max(50, 'Código deve ter no máximo 50 caracteres'),
    name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
    category: z.enum(['amenities', 'services', 'experiences', 'transport'], { required_error: 'Categoria é obrigatória' }),
    description: z.string().optional().nullable(),
    imageUrl: z.string().max(500).optional().nullable(),
    pricingType: z.enum(['fixed', 'per_day', 'per_person', 'percentage'], { required_error: 'Tipo de preço é obrigatório' }),
    price: z.number().min(0).optional().nullable(),
    percentage: z.number().min(0).max(100).optional().nullable(),
    isTaxable: z.boolean().optional().default(true),
    requiresConfirmation: z.boolean().optional().default(false),
    isPopular: z.boolean().optional().default(false),
    isFeatured: z.boolean().optional().default(false),
    status: z.enum(['active', 'inactive']).optional().default('active'),
  }).refine((data) => {
    if (data.pricingType === 'percentage') {
      return data.percentage !== null && data.percentage !== undefined;
    } else {
      return data.price !== null && data.price !== undefined;
    }
  }, {
    message: 'Preço ou percentual é obrigatório conforme o tipo de cobrança',
    path: ['price'],
  }),
});

export const updateExtraSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().optional(),
    code: z.string().min(1).max(50).optional(),
    name: z.string().min(1).max(255).optional(),
    category: z.enum(['amenities', 'services', 'experiences', 'transport']).optional(),
    description: z.string().optional().nullable(),
    imageUrl: z.string().max(500).optional().nullable(),
    pricingType: z.enum(['fixed', 'per_day', 'per_person', 'percentage']).optional(),
    price: z.number().min(0).optional().nullable(),
    percentage: z.number().min(0).max(100).optional().nullable(),
    isTaxable: z.boolean().optional(),
    requiresConfirmation: z.boolean().optional(),
    isPopular: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }).refine((data) => {
    if (data.pricingType === 'percentage') {
      return !data.price || data.percentage !== null;
    }
    return true;
  }, {
    message: 'Para tipo percentual, o percentual é obrigatório',
    path: ['percentage'],
  }),
});

export type CreateExtraInput = z.infer<typeof createExtraSchema>['body'];
export type UpdateExtraInput = z.infer<typeof updateExtraSchema>['body'];
