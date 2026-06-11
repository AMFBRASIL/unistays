import { Router } from 'express';
import { GeneralSettingsController } from '@/controllers/GeneralSettingsController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createGeneralSettingsSchema, updateGeneralSettingsSchema } from '@/validators/generalSettings.validator';

const router = Router();
const generalSettingsController = new GeneralSettingsController();

router.use(authenticate);

router.get('/', generalSettingsController.getCurrent.bind(generalSettingsController));
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createGeneralSettingsSchema), generalSettingsController.createOrUpdate.bind(generalSettingsController));
router.put('/', authorize('super_admin', 'admin', 'manager'), validate(updateGeneralSettingsSchema), generalSettingsController.createOrUpdate.bind(generalSettingsController));

export default router;
