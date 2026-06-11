import { Router } from 'express';
import { StorageConfigController } from '@/controllers/StorageConfigController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createStorageConfigSchema, updateStorageConfigSchema } from '@/validators/storageConfig.validator';

const router = Router();
const storageConfigController = new StorageConfigController();

router.use(authenticate);

router.get('/', storageConfigController.getAll);
router.get('/:id', storageConfigController.getById);
router.post('/', authorize('super_admin', 'admin'), validate(createStorageConfigSchema), storageConfigController.create);
router.put('/:id', authorize('super_admin', 'admin'), validate(updateStorageConfigSchema), storageConfigController.update);
router.delete('/:id', authorize('super_admin', 'admin'), storageConfigController.delete);

export default router;
