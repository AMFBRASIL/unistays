import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { ContractTemplateController } from '@/controllers/ContractTemplateController';

const router = Router();
const controller = new ContractTemplateController();

router.use(authenticate);

router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.post('/', authorize('super_admin', 'admin', 'manager'), (req, res, next) => controller.create(req, res, next));
router.put('/:id', authorize('super_admin', 'admin', 'manager'), (req, res, next) => controller.update(req, res, next));

export default router;
