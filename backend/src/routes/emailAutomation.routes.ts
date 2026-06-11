import { Router } from 'express';
import { EmailAutomationController } from '@/controllers/EmailAutomationController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createEmailAutomationSchema, updateEmailAutomationSchema } from '@/validators/emailAutomation.validator';

const router = Router();
const controller = new EmailAutomationController();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createEmailAutomationSchema), controller.create);
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updateEmailAutomationSchema), controller.update);
router.delete('/:id', authorize('super_admin', 'admin'), controller.delete);

export default router;
