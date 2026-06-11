import { Router } from 'express';
import { SetupController } from '@/controllers/SetupController';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();
const controller = new SetupController();

// Rota pública para verificar status de instalação
router.get('/status', controller.checkInstallationStatus);

// Rota pública para instalação inicial
router.post('/install', controller.install);

router.get('/progress', authenticate, controller.getProgress.bind(controller));

export default router;
