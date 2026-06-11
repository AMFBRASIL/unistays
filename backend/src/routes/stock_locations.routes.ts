import { Router } from 'express';
import { StockLocationController } from '@/controllers/StockLocationController';

const router = Router();
const controller = new StockLocationController();

router.get('/', (req, res, next) => controller.list(req, res, next));
router.post('/', (req, res, next) => controller.create(req, res, next));
router.put('/:id', (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;
