import { Router } from 'express';
import { EmailConfigController } from '@/controllers/EmailConfigController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createEmailConfigSchema, updateEmailConfigSchema } from '@/validators/emailConfig.validator';

const router = Router();
const emailConfigController = new EmailConfigController();

router.use(authenticate);

router.get('/', emailConfigController.getAll);
router.get('/current', emailConfigController.getCurrent);
router.get('/:id', emailConfigController.getById);
router.post('/', authorize('super_admin', 'admin'), validate(createEmailConfigSchema), emailConfigController.create);
router.put('/:id', authorize('super_admin', 'admin'), validate(updateEmailConfigSchema), emailConfigController.update);
router.delete('/:id', authorize('super_admin', 'admin'), emailConfigController.delete);
router.post('/:id/test', authorize('super_admin', 'admin'), emailConfigController.test);

export default router;
