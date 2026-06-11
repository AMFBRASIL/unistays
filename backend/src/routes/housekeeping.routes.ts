import { Router } from 'express';
import { HousekeepingController } from '@/controllers/HousekeepingController';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';

import { createHousekeepingTaskSchema, updateHousekeepingTaskSchema } from '@/validators/housekeeping.validator';

const router = Router();
const controller = new HousekeepingController();

router.use(authenticate);

router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));
router.post('/', validate(createHousekeepingTaskSchema), (req, res, next) => controller.create(req, res, next));
router.put('/:id', validate(updateHousekeepingTaskSchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;
