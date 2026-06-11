import { Router } from 'express';
import { MaintenanceOrderController } from '@/controllers/MaintenanceOrderController';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();
const controller = new MaintenanceOrderController();

router.use(authenticate);

router.get('/', controller.getAll.bind(controller));
router.get('/stats', controller.getStats.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
