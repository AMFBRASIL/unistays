import { Router } from 'express';
import { RatePlanController } from '@/controllers/RatePlanController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createRatePlanSchema, updateRatePlanSchema } from '@/validators/ratePlan.validator';

const router = Router();
const ratePlanController = new RatePlanController();

router.use(authenticate);

router.get('/', ratePlanController.getAll);
router.get('/:id', ratePlanController.getById);
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createRatePlanSchema), ratePlanController.create);
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updateRatePlanSchema), ratePlanController.update);
router.delete('/:id', authorize('super_admin', 'admin'), ratePlanController.delete);

export default router;
