import { Router } from 'express';
import { CampaignController } from '@/controllers/CampaignController';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();
const campaignController = new CampaignController();

// Rotas protegidas por autenticação
router.use(authenticate);

// Rotas de estatísticas (devem vir antes de :id)
router.get('/stats', campaignController.getStats);
router.get('/performance', campaignController.getPerformance);

router.get('/', campaignController.getAll);
router.get('/:id', campaignController.getById);
router.post('/', campaignController.create);
router.put('/:id', campaignController.update);
router.delete('/:id', campaignController.delete);
router.post('/:id/send', campaignController.send);

export default router;
