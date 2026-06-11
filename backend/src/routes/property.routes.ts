import { Router } from 'express';
import { PropertyController } from '@/controllers/PropertyController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';

const router = Router();
const propertyController = new PropertyController();

router.use(authenticate);

router.get('/', authenticate, propertyController.getAll);
router.get('/:id', authenticate, propertyController.getById);
router.post('/', authenticate, authorize('super_admin', 'admin', 'manager'), propertyController.create);
router.put('/:id', authenticate, authorize('super_admin', 'admin', 'manager'), propertyController.update);
router.delete('/:id', authenticate, authorize('super_admin', 'admin'), propertyController.delete);

export default router;
