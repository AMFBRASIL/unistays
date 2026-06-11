import { z } from 'zod';

export const createPromotionSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive('Propriedade é obrigatória'),
    code: z.string().min(1, 'Código é obrigatório').max(50, 'Código deve ter no máximo 50 caracteres').optional(),
    name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
    description: z.string().optional().nullable(),
    type: z.enum(['percentage', 'fixed_amount', 'package', 'free_night', 'discount', 'fixed', 'flash', 'earlybird', 'lastminute', 'gift'], { required_error: 'Tipo é obrigatório' }),
    discountValue: z.number().min(0).optional().nullable(),
    discountPercentage: z.number().min(0).max(100).optional().nullable(),
    minValue: z.number().min(0).optional().nullable(),
    maxDiscount: z.number().min(0).optional().nullable(),
    minStay: z.number().int().min(1).optional().nullable(),
    maxStay: z.number().int().min(1).optional().nullable(),
    validFrom: z.string().date().optional().nullable(),
    validTo: z.string().date().optional().nullable(),
    propertyTypes: z.array(z.string()).optional().nullable(),
    selectedDays: z.array(z.string()).optional().nullable(),
    applicableRatePlans: z.array(z.number()).optional().nullable(),
    applicableRoomTypes: z.array(z.number()).optional().nullable(),
    bookingWindowStart: z.number().int().min(0).optional().nullable(),
    bookingWindowEnd: z.number().int().min(0).optional().nullable(),
    usageLimit: z.number().int().min(1).optional().nullable(),
    usesPerGuest: z.number().int().min(1).optional().nullable(),
    showOnWebsite: z.boolean().optional().default(true),
    requireCoupon: z.boolean().optional().default(false),
    status: z.enum(['active', 'inactive', 'expired', 'exhausted']).optional().default('active'),
  }),
});

export const updatePromotionSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().optional(),
    code: z.string().min(1).max(50).optional(),
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional().nullable(),
    type: z.enum(['percentage', 'fixed_amount', 'package', 'free_night', 'discount', 'fixed', 'flash', 'earlybird', 'lastminute', 'gift']).optional(),
    discountValue: z.number().min(0).optional().nullable(),
    discountPercentage: z.number().min(0).max(100).optional().nullable(),
    minValue: z.number().min(0).optional().nullable(),
    maxDiscount: z.number().min(0).optional().nullable(),
    minStay: z.number().int().min(1).optional().nullable(),
    maxStay: z.number().int().min(1).optional().nullable(),
    validFrom: z.string().date().optional().nullable(),
    validTo: z.string().date().optional().nullable(),
    propertyTypes: z.array(z.string()).optional().nullable(),
    selectedDays: z.array(z.string()).optional().nullable(),
    applicableRatePlans: z.array(z.number()).optional().nullable(),
    applicableRoomTypes: z.array(z.number()).optional().nullable(),
    bookingWindowStart: z.number().int().min(0).optional().nullable(),
    bookingWindowEnd: z.number().int().min(0).optional().nullable(),
    usageLimit: z.number().int().min(1).optional().nullable(),
    usesPerGuest: z.number().int().min(1).optional().nullable(),
    showOnWebsite: z.boolean().optional(),
    requireCoupon: z.boolean().optional(),
    status: z.enum(['active', 'inactive', 'expired', 'exhausted']).optional(),
  }),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>['body'];
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>['body'];
