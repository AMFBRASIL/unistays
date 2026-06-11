import { Router } from 'express';
import { AiConfigController } from '@/controllers/AiConfigController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createAiConfigSchema, updateAiConfigSchema } from '@/validators/aiConfig.validator';

const router = Router();
const aiConfigController = new AiConfigController();

router.use(authenticate);

router.get('/', aiConfigController.getAll.bind(aiConfigController));
router.get('/current', aiConfigController.getCurrent.bind(aiConfigController));
router.post('/generate-email-template', authorize('super_admin', 'admin', 'manager'), aiConfigController.generateEmailTemplate.bind(aiConfigController));
router.get('/:id', aiConfigController.getById.bind(aiConfigController));
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createAiConfigSchema), aiConfigController.create.bind(aiConfigController));
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updateAiConfigSchema), aiConfigController.update.bind(aiConfigController));
router.delete('/:id', authorize('super_admin', 'admin'), aiConfigController.delete.bind(aiConfigController));
router.post('/:id/test', authorize('super_admin', 'admin', 'manager'), aiConfigController.test.bind(aiConfigController));

export default router;
