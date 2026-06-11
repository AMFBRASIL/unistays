import { Router } from 'express';
import { InventoryMovementController } from '@/controllers/InventoryMovementController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createInventoryMovementSchema, createInventoryMovementBulkSchema } from '@/validators/inventoryMovement.validator';

const router = Router();
const controller = new InventoryMovementController();

router.use(authenticate);

router.get(
  '/',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => controller.getAll(req, res, next)
);

router.post(
  '/bulk',
  authorize('super_admin', 'admin', 'manager'),
  validate(createInventoryMovementBulkSchema),
  (req, res, next) => controller.createBulk(req, res, next)
);

router.post(
  '/',
  authorize('super_admin', 'admin', 'manager'),
  validate(createInventoryMovementSchema),
  (req, res, next) => controller.create(req, res, next)
);

export default router;
