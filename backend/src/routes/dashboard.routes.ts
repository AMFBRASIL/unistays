import { Router } from 'express';
import { DashboardController } from '@/controllers/DashboardController';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();
const dashboardController = new DashboardController();

router.use(authenticate);

router.get('/stats', (req, res, next) => dashboardController.getStats(req, res, next));

export default router;
