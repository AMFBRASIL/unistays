import { Router } from 'express';
import { UnitController } from '@/controllers/UnitController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createUnitSchema, updateUnitSchema } from '@/validators/unit.validator';

const router = Router();
const unitController = new UnitController();

router.use(authenticate);

router.get('/', unitController.getAll);
router.get('/:id', unitController.getById);
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createUnitSchema), unitController.create);
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updateUnitSchema), unitController.update);
router.delete('/:id', authorize('super_admin', 'admin'), unitController.delete);

export default router;
