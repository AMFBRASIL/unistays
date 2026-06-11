import { z } from 'zod';

export const availabilitySchema = z.object({
    body: z.object({
        propertyType: z.string().optional(),
        region: z.string().optional(),
        checkIn: z.string({ required_error: 'Check-in date is required' }),
        checkOut: z.string({ required_error: 'Check-out date is required' }),
        guests: z.number({ required_error: 'Number of guests is required' }).min(1),
        stayType: z.enum(['daily', 'weekly', 'monthly', 'longstay']).optional().default('daily'),
    }),
});

export const createReservationSchema = z.object({
    body: z.object({
        unitId: z.number({ required_error: 'Unit ID is required' }),
        checkIn: z.string({ required_error: 'Check-in date is required' }),
        checkOut: z.string({ required_error: 'Check-out date is required' }),
        guests: z.number({ required_error: 'Number of guests is required' }).min(1),
        stayType: z.string().optional().default('daily'),
        paymentMethod: z.string().optional(),
        promotionCode: z.string().optional(),
        paymentStatus: z.enum(['pending', 'paid']).optional(),
        pixGatewayProvider: z.string().optional(),
        pixGatewayTxid: z.string().optional(),
        guestInfo: z.object({
            name: z.string().min(3, 'Name must have at least 3 characters'),
            email: z.string().email('Invalid email address'),
            phone: z.string().min(10, 'Phone must have at least 10 characters'),
            cpf: z.string().min(11, 'CPF required'),
            observations: z.string().optional(),
        }),
    }),
});

export type CheckAvailabilityInput = z.infer<typeof availabilitySchema>['body'];
export type CreateReservationInput = z.infer<typeof createReservationSchema>['body'];
