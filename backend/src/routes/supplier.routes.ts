import { Router } from 'express';
import { SupplierController } from '@/controllers/SupplierController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createSupplierSchema, updateSupplierSchema } from '@/validators/supplier.validator';

const router = Router();
const supplierController = new SupplierController();

router.use(authenticate);

router.get('/', supplierController.getAll);
router.get('/:id/products', supplierController.getProducts);
router.get('/:id', supplierController.getById);
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createSupplierSchema), supplierController.create);
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updateSupplierSchema), supplierController.update);
router.delete('/:id', authorize('super_admin', 'admin'), supplierController.delete);

export default router;
