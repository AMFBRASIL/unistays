import { Router } from 'express';
import { PromotionController } from '@/controllers/PromotionController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createPromotionSchema, updatePromotionSchema } from '@/validators/promotion.validator';

const router = Router();
const promotionController = new PromotionController();

router.use(authenticate);

router.get('/', promotionController.getAll);
router.get('/:id', promotionController.getById);
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createPromotionSchema), promotionController.create);
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updatePromotionSchema), promotionController.update);
router.delete('/:id', authorize('super_admin', 'admin'), promotionController.delete);

export default router;
