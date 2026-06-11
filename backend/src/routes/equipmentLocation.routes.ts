import { Router } from 'express';
import { EquipmentLocationController } from '@/controllers/EquipmentLocationController';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();
const controller = new EquipmentLocationController();

router.use(authenticate);
router.get('/', controller.getAll.bind(controller));

export default router;
