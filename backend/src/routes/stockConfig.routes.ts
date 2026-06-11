import { Router } from 'express';
import { StockConfigController } from '@/controllers/StockConfigController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createStockConfigSchema, updateStockConfigSchema } from '@/validators/stockConfig.validator';

const router = Router();
const stockConfigController = new StockConfigController();

router.use(authenticate);

router.get('/', stockConfigController.getCurrent.bind(stockConfigController));
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createStockConfigSchema), stockConfigController.createOrUpdate.bind(stockConfigController));
router.put('/', authorize('super_admin', 'admin', 'manager'), validate(updateStockConfigSchema), stockConfigController.createOrUpdate.bind(stockConfigController));

export default router;
