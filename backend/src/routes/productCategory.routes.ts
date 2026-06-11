import { Router } from 'express';
import { ProductCategoryController } from '@/controllers/ProductCategoryController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createProductCategorySchema, updateProductCategorySchema } from '@/validators/productCategory.validator';

const router = Router();
const productCategoryController = new ProductCategoryController();

router.use(authenticate);

router.get('/', productCategoryController.getAll.bind(productCategoryController));
router.get('/:id', productCategoryController.getById.bind(productCategoryController));
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createProductCategorySchema), productCategoryController.create.bind(productCategoryController));
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updateProductCategorySchema), productCategoryController.update.bind(productCategoryController));
router.delete('/:id', authorize('super_admin', 'admin', 'manager'), productCategoryController.delete.bind(productCategoryController));

export default router;
