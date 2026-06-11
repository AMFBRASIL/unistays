import { Router } from 'express';
import { UnitOfMeasureController } from '@/controllers/UnitOfMeasureController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createUnitOfMeasureSchema, updateUnitOfMeasureSchema } from '@/validators/unitOfMeasure.validator';

const router = Router();
const unitOfMeasureController = new UnitOfMeasureController();

router.use(authenticate);

router.get('/', unitOfMeasureController.getAll.bind(unitOfMeasureController));
router.get('/:id', unitOfMeasureController.getById.bind(unitOfMeasureController));
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createUnitOfMeasureSchema), unitOfMeasureController.create.bind(unitOfMeasureController));
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updateUnitOfMeasureSchema), unitOfMeasureController.update.bind(unitOfMeasureController));
router.delete('/:id', authorize('super_admin', 'admin'), unitOfMeasureController.delete.bind(unitOfMeasureController));

export default router;
