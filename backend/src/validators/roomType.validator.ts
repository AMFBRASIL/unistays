import { z } from 'zod';

export const createRoomTypeSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive('ID da propriedade deve ser positivo'),
    code: z.string().min(1, 'Código é obrigatório').max(50, 'Código deve ter no máximo 50 caracteres'),
    name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
    description: z.string().optional().nullable(),
    propertyType: z.enum(['hotel', 'apart-hotel', 'loft', 'temporada', 'hostel', 'resort'], {
      errorMap: () => ({ message: 'Tipo de propriedade inválido' }),
    }),
    maxGuests: z.number().int().positive().default(2),
    maxAdults: z.number().int().positive().default(2),
    maxChildren: z.number().int().min(0).default(1),
    basePrice: z.number().nonnegative().optional().nullable(),
    adultPrice: z.number().nonnegative().optional().default(0),
    childPrice: z.number().nonnegative().optional().default(0),
    infantPrice: z.number().nonnegative().optional().default(0),
    pricingStyle: z.enum(['per_unit', 'per_person']).optional().default('per_unit'),
    sizeM2: z.number().positive().optional().nullable(),
    images: z.array(z.string().url()).optional().nullable(),
    amenityIds: z.array(z.number().int().positive()).optional().default([]),
    status: z.enum(['active', 'inactive']).optional().default('active'),
  }),
});

export const updateRoomTypeSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50).optional(),
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional().nullable(),
    propertyType: z.enum(['hotel', 'apart-hotel', 'loft', 'temporada', 'hostel', 'resort']).optional(),
    maxGuests: z.number().int().positive().optional(),
    maxAdults: z.number().int().positive().optional(),
    maxChildren: z.number().int().min(0).optional(),
    basePrice: z.number().nonnegative().optional().nullable(),
    adultPrice: z.number().nonnegative().optional(),
    childPrice: z.number().nonnegative().optional(),
    infantPrice: z.number().nonnegative().optional(),
    pricingStyle: z.enum(['per_unit', 'per_person']).optional(),
    sizeM2: z.number().positive().optional().nullable(),
    images: z.array(z.string().url()).optional().nullable(),
    amenityIds: z.array(z.number().int().positive()).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>['body'];
export type UpdateRoomTypeInput = z.infer<typeof updateRoomTypeSchema>['body'];
