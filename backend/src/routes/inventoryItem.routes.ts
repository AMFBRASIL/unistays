import { Router } from 'express';
import { InventoryItemController } from '@/controllers/InventoryItemController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createInventoryItemSchema, updateInventoryItemSchema } from '@/validators/inventoryItem.validator';

const router = Router();
const controller = new InventoryItemController();

router.use(authenticate);

router.get(
  '/',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => controller.getAll(req, res, next)
);

router.get(
  '/:id',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => controller.getById(req, res, next)
);

router.post(
  '/',
  authorize('super_admin', 'admin', 'manager'),
  validate(createInventoryItemSchema),
  (req, res, next) => controller.create(req, res, next)
);

router.put(
  '/:id',
  authorize('super_admin', 'admin', 'manager'),
  validate(updateInventoryItemSchema),
  (req, res, next) => controller.update(req, res, next)
);

router.delete(
  '/:id',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => controller.delete(req, res, next)
);

export default router;
