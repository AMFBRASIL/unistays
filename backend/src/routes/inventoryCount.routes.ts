import { Router } from 'express';
import { InventoryCountController } from '@/controllers/InventoryCountController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createInventoryCountSchema } from '@/validators/inventoryCount.validator';

const router = Router();
const controller = new InventoryCountController();

router.use(authenticate);

router.get(
  '/',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => controller.getAll(req, res, next)
);

router.get(
  '/:id(\\d+)/items',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => controller.getItemsById(req, res, next)
);
router.get(
  '/:id(\\d+)',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => controller.getById(req, res, next)
);

router.post(
  '/',
  authorize('super_admin', 'admin', 'manager'),
  validate(createInventoryCountSchema),
  (req, res, next) => controller.create(req, res, next)
);

export default router;
