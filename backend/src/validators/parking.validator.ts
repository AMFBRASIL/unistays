import { z } from 'zod';

export const createParkingSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive('Propriedade é obrigatória'),
    code: z.string().min(1, 'Código é obrigatório').max(50, 'Código deve ter no máximo 50 caracteres'),
    name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
    parkingType: z.enum(['covered', 'uncovered', 'valet', 'garage'], { required_error: 'Tipo de estacionamento é obrigatório' }),
    pricingType: z.enum(['per_day', 'per_night', 'fixed', 'free'], { required_error: 'Tipo de preço é obrigatório' }),
    price: z.number().min(0).optional().nullable(),
    capacity: z.number().int().min(1).optional().nullable(),
    description: z.string().optional().nullable(),
    isTaxable: z.boolean().optional().default(true),
    requiresReservation: z.boolean().optional().default(false),
    status: z.enum(['active', 'inactive']).optional().default('active'),
  }).refine((data) => {
    if (data.pricingType !== 'free' && (!data.price || data.price <= 0)) {
      return false;
    }
    return true;
  }, {
    message: 'Preço é obrigatório quando o tipo não é gratuito',
    path: ['price'],
  }),
});

export const updateParkingSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().optional(),
    code: z.string().min(1).max(50).optional(),
    name: z.string().min(1).max(255).optional(),
    parkingType: z.enum(['covered', 'uncovered', 'valet', 'garage']).optional(),
    pricingType: z.enum(['per_day', 'per_night', 'fixed', 'free']).optional(),
    price: z.number().min(0).optional().nullable(),
    capacity: z.number().int().min(1).optional().nullable(),
    description: z.string().optional().nullable(),
    isTaxable: z.boolean().optional(),
    requiresReservation: z.boolean().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }).refine((data) => {
    if (data.pricingType === 'free' || data.pricingType === undefined) {
      return true;
    }
    if (data.price !== undefined && data.price !== null && data.price <= 0) {
      return false;
    }
    return true;
  }, {
    message: 'Preço deve ser maior que zero quando o tipo não é gratuito',
    path: ['price'],
  }),
});

export type CreateParkingInput = z.infer<typeof createParkingSchema>['body'];
export type UpdateParkingInput = z.infer<typeof updateParkingSchema>['body'];
