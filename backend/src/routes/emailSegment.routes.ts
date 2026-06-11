import { Router } from 'express';
import { EmailSegmentController } from '@/controllers/EmailSegmentController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createEmailSegmentSchema, updateEmailSegmentSchema } from '@/validators/emailSegment.validator';

const router = Router();
const controller = new EmailSegmentController();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createEmailSegmentSchema), controller.create);
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updateEmailSegmentSchema), controller.update);
router.delete('/:id', authorize('super_admin', 'admin'), controller.delete);

export default router;
