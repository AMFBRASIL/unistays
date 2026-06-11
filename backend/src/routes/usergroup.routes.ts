import { Router } from 'express';
import { UserGroupController } from '@/controllers/UserGroupController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';

const router = Router();
const userGroupController = new UserGroupController();

router.use(authenticate);

router.get('/', authorize('super_admin', 'admin'), userGroupController.getAll);
router.get('/:id', authorize('super_admin', 'admin'), userGroupController.getById);
router.post('/', authorize('super_admin', 'admin'), userGroupController.create);
router.put('/:id', authorize('super_admin', 'admin'), userGroupController.update);
router.delete('/:id', authorize('super_admin', 'admin'), userGroupController.delete);

// Permissões
router.put('/:id/permissions', authorize('super_admin', 'admin'), userGroupController.updatePermissions);

// Members
router.post('/:id/users', authorize('super_admin', 'admin'), userGroupController.addUser);
router.delete('/:id/users/:userId', authorize('super_admin', 'admin'), userGroupController.removeUser);

export default router;
