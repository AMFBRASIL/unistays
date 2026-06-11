import { Router } from 'express';
import { ExtraController } from '@/controllers/ExtraController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createExtraSchema, updateExtraSchema } from '@/validators/extra.validator';

const router = Router();
const extraController = new ExtraController();

router.use(authenticate);

router.get('/', extraController.getAll.bind(extraController));
router.get('/:id', extraController.getById.bind(extraController));
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createExtraSchema), extraController.create.bind(extraController));
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updateExtraSchema), extraController.update.bind(extraController));
router.delete('/:id', authorize('super_admin', 'admin'), extraController.delete.bind(extraController));

export default router;
