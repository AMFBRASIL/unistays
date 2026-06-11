import { Router } from 'express';
import { ProductController } from '@/controllers/ProductController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createProductSchema, updateProductSchema } from '@/validators/product.validator';

const router = Router();
const productController = new ProductController();

router.use(authenticate);

router.get('/', productController.getAll.bind(productController));
router.get('/:id', productController.getById.bind(productController));
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createProductSchema), productController.create.bind(productController));
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updateProductSchema), productController.update.bind(productController));
router.delete('/:id', authorize('super_admin', 'admin', 'manager'), productController.delete.bind(productController));

export default router;
