import { Router } from 'express';
import { EquipmentController } from '@/controllers/EquipmentController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';

const router = Router();
const controller = new EquipmentController();

router.use(authenticate);

router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', authorize('super_admin', 'admin', 'manager'), controller.create.bind(controller));
router.put('/:id', authorize('super_admin', 'admin', 'manager'), controller.update.bind(controller));
router.delete('/:id', authorize('super_admin', 'admin'), controller.delete.bind(controller));

export default router;
