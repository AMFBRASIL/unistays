import { z } from 'zod';

export const createMealSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive('Propriedade é obrigatória'),
    code: z.string().min(1, 'Código é obrigatório').max(50, 'Código deve ter no máximo 50 caracteres'),
    name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'brunch'], { required_error: 'Tipo de refeição é obrigatório' }),
    servingType: z.enum(['buffet', 'a_la_carte', 'room_service'], { required_error: 'Tipo de serviço é obrigatório' }),
    description: z.string().optional().nullable(),
    price: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
    pricePerPerson: z.boolean().optional().default(true),
    startTime: z.string().optional().nullable(),
    endTime: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional().default('active'),
  }).refine((data) => {
    if (data.startTime && data.endTime) {
      // Validar formato de tempo se ambos estão preenchidos
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
        return false;
      }
    }
    return true;
  }, {
    message: 'Horários devem estar no formato HH:MM',
    path: ['startTime'],
  }),
});

export const updateMealSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().optional(),
    code: z.string().min(1).max(50).optional(),
    name: z.string().min(1).max(255).optional(),
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'brunch']).optional(),
    servingType: z.enum(['buffet', 'a_la_carte', 'room_service']).optional(),
    description: z.string().optional().nullable(),
    price: z.number().min(0).optional(),
    pricePerPerson: z.boolean().optional(),
    startTime: z.string().optional().nullable(),
    endTime: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional(),
  }).refine((data) => {
    if (data.startTime && data.endTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
        return false;
      }
    }
    return true;
  }, {
    message: 'Horários devem estar no formato HH:MM',
    path: ['startTime'],
  }),
});

export type CreateMealInput = z.infer<typeof createMealSchema>['body'];
export type UpdateMealInput = z.infer<typeof updateMealSchema>['body'];
