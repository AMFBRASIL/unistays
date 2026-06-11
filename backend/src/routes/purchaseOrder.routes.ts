import { Router } from 'express';
import { PurchaseOrderController } from '@/controllers/PurchaseOrderController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createPurchaseOrderSchema, updatePurchaseOrderStatusSchema } from '@/validators/purchaseOrder.validator';

const router = Router();
const controller = new PurchaseOrderController();

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
  validate(createPurchaseOrderSchema),
  (req, res, next) => controller.create(req, res, next)
);

router.put(
  '/:id/status',
  authorize('super_admin', 'admin', 'manager'),
  validate(updatePurchaseOrderStatusSchema),
  (req, res, next) => controller.updateStatus(req, res, next)
);

export default router;
