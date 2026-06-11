import { Router } from 'express';
import { PropertyBankAccountController } from '@/controllers/PropertyBankAccountController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';

const router = Router();
const controller = new PropertyBankAccountController();

router.use(authenticate);
router.get('/', controller.list.bind(controller));
router.post('/', authorize('super_admin', 'admin', 'manager'), controller.createOrUpdate.bind(controller));
router.put('/', authorize('super_admin', 'admin', 'manager'), controller.createOrUpdate.bind(controller));
router.delete('/:id', authorize('super_admin', 'admin', 'manager'), controller.remove.bind(controller));

export default router;

