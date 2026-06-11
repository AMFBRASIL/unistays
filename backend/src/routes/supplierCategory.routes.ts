import { Router } from 'express';
import { SupplierCategoryController } from '@/controllers/SupplierCategoryController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createSupplierCategorySchema, updateSupplierCategorySchema } from '@/validators/supplierCategory.validator';

const router = Router();
const supplierCategoryController = new SupplierCategoryController();

router.use(authenticate);

router.get('/', supplierCategoryController.getAll);
router.get('/:id', supplierCategoryController.getById);
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createSupplierCategorySchema), supplierCategoryController.create);
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updateSupplierCategorySchema), supplierCategoryController.update);
router.delete('/:id', authorize('super_admin', 'admin'), supplierCategoryController.delete);

export default router;
