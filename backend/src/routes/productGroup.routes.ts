import { Router } from 'express';
import { ProductGroupController } from '@/controllers/ProductGroupController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createProductGroupSchema, updateProductGroupSchema } from '@/validators/productGroup.validator';

const router = Router();
const productGroupController = new ProductGroupController();

router.use(authenticate);

router.get('/', productGroupController.getAll.bind(productGroupController));
router.get('/:id', productGroupController.getById.bind(productGroupController));
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createProductGroupSchema), productGroupController.create.bind(productGroupController));
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updateProductGroupSchema), productGroupController.update.bind(productGroupController));
router.delete('/:id', authorize('super_admin', 'admin'), productGroupController.delete.bind(productGroupController));

export default router;
