import { Router } from 'express';
import { ProductConfigController } from '@/controllers/ProductConfigController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createProductConfigSchema, updateProductConfigSchema } from '@/validators/productConfig.validator';

const router = Router();
const productConfigController = new ProductConfigController();

router.use(authenticate);

router.get('/', productConfigController.getCurrent.bind(productConfigController));
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createProductConfigSchema), productConfigController.createOrUpdate.bind(productConfigController));
router.put('/', authorize('super_admin', 'admin', 'manager'), validate(updateProductConfigSchema), productConfigController.createOrUpdate.bind(productConfigController));

export default router;
