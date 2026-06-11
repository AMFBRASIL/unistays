import { z } from 'zod';

export const createAmenitySchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Código é obrigatório').max(50, 'Código deve ter no máximo 50 caracteres'),
    name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
    category: z.enum(['comfort', 'entertainment', 'wellness', 'convenience'], { required_error: 'Categoria é obrigatória' }),
    icon: z.string().max(100).optional().nullable(),
    description: z.string().optional().nullable(),
    isChargeable: z.boolean().optional().default(false),
    price: z.number().min(0).optional().nullable(),
    status: z.enum(['active', 'inactive']).optional().default('active'),
  }).refine((data) => {
    if (data.isChargeable && (!data.price || data.price <= 0)) {
      return false;
    }
    return true;
  }, {
    message: 'Preço é obrigatório quando a amenidade é cobrável',
    path: ['price'],
  }),
});

export const updateAmenitySchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50).optional(),
    name: z.string().min(1).max(255).optional(),
    category: z.enum(['comfort', 'entertainment', 'wellness', 'convenience']).optional(),
    icon: z.string().max(100).optional().nullable(),
    description: z.string().optional().nullable(),
    isChargeable: z.boolean().optional(),
    price: z.number().min(0).optional().nullable(),
    status: z.enum(['active', 'inactive']).optional(),
  }).refine((data) => {
    if (data.isChargeable && data.price !== undefined && data.price !== null && data.price <= 0) {
      return false;
    }
    return true;
  }, {
    message: 'Preço deve ser maior que zero quando a amenidade é cobrável',
    path: ['price'],
  }),
});

export type CreateAmenityInput = z.infer<typeof createAmenitySchema>['body'];
export type UpdateAmenityInput = z.infer<typeof updateAmenitySchema>['body'];
