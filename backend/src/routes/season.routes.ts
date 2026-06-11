import { Router } from 'express';
import { SeasonController } from '@/controllers/SeasonController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createSeasonSchema, updateSeasonSchema } from '@/validators/season.validator';

const router = Router();
const seasonController = new SeasonController();

router.use(authenticate);

router.get('/', seasonController.getAll.bind(seasonController));
router.get('/:id', seasonController.getById.bind(seasonController));
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createSeasonSchema), seasonController.create.bind(seasonController));
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updateSeasonSchema), seasonController.update.bind(seasonController));
router.delete('/:id', authorize('super_admin', 'admin'), seasonController.delete.bind(seasonController));

export default router;
