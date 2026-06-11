import { Router } from 'express';
import { UserController } from '@/controllers/UserController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createUserSchema } from '@/validators/user.validator';

const router = Router();
const userController = new UserController();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/', authorize('super_admin', 'admin'), validate(createUserSchema), userController.create);
router.get('/', authorize('super_admin', 'admin', 'manager'), userController.getAll);
router.get('/:id', authorize('super_admin', 'admin', 'manager'), userController.getById);
router.put('/:id', authorize('super_admin', 'admin'), userController.update);
router.delete('/:id', authorize('super_admin', 'admin'), userController.delete);
router.post('/:id/reset-password', authorize('super_admin', 'admin'), userController.resetPassword);
router.post('/:id/send-email', authorize('super_admin', 'admin', 'manager'), userController.sendEmail);

export default router;
