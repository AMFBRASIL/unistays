import { Router } from 'express';
import { BookingEngineConfigController } from '@/controllers/BookingEngineConfigController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createBookingEngineConfigSchema, updateBookingEngineConfigSchema } from '@/validators/bookingEngineConfig.validator';

const router = Router();
const bookingEngineConfigController = new BookingEngineConfigController();

router.use(authenticate);

// GET - Buscar configurações do motor de reserva atuais (global ou por propriedade)
router.get(
  '/',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => bookingEngineConfigController.getCurrent(req, res, next)
);

// POST - Criar ou atualizar configurações do motor de reserva
router.post(
  '/',
  authorize('super_admin', 'admin', 'manager'),
  validate(createBookingEngineConfigSchema),
  (req, res, next) => bookingEngineConfigController.createOrUpdate(req, res, next)
);

// PUT - Atualizar configurações do motor de reserva
router.put(
  '/',
  authorize('super_admin', 'admin', 'manager'),
  validate(updateBookingEngineConfigSchema),
  (req, res, next) => bookingEngineConfigController.createOrUpdate(req, res, next)
);

export default router;
