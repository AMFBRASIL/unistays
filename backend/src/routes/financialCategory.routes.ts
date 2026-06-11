import { Router } from 'express';
import { FinancialCategoryController } from '@/controllers/FinancialCategoryController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createFinancialCategorySchema, updateFinancialCategorySchema } from '@/validators/financialCategory.validator';

const router = Router();
const controller = new FinancialCategoryController();

router.use(authenticate);

router.get('/', authorize('super_admin', 'admin', 'manager'), (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', authorize('super_admin', 'admin', 'manager'), (req, res, next) => controller.getById(req, res, next));
router.post(
  '/',
  authorize('super_admin', 'admin', 'manager'),
  validate(createFinancialCategorySchema),
  (req, res, next) => controller.create(req, res, next)
);
router.put(
  '/:id',
  authorize('super_admin', 'admin', 'manager'),
  validate(updateFinancialCategorySchema),
  (req, res, next) => controller.update(req, res, next)
);
router.delete('/:id', authorize('super_admin', 'admin', 'manager'), (req, res, next) => controller.delete(req, res, next));

export default router;
