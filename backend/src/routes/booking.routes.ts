import { Router } from 'express';
import { BookingController } from '@/controllers/BookingController';
import { validate } from '@/middlewares/validation.middleware';
import { availabilitySchema, createReservationSchema } from '@/validators/booking.validator';

const router = Router();
const controller = new BookingController();

// Public routes (no auth required for booking engine)
router.get('/properties', controller.getProperties);
router.get('/regions', controller.getRegions);
router.get('/rate-plans', controller.getRatePlans);
router.post('/availability', validate(availabilitySchema), controller.checkAvailability);
router.post('/reservations', validate(createReservationSchema), controller.createReservation);
router.post('/pix/charge', controller.generatePixCharge);

export default router;
