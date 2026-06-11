import { Router } from 'express';
import { PaymentMethodController } from '@/controllers/PaymentMethodController';

const router = Router();
const controller = new PaymentMethodController();

router.get('/', (req, res, next) => controller.list(req, res, next));
router.post('/', (req, res, next) => controller.create(req, res, next));
router.put('/:id', (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));
router.patch('/:id/toggle-status', (req, res, next) => controller.toggleStatus(req, res, next));

export default router;
