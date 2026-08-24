import { Router } from 'express';
import { OutboundWebhookController } from '@/controllers/OutboundWebhookController';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();
const controller = new OutboundWebhookController();

// Público: receptor interno do seed (sem JWT)
router.post('/echo', controller.echo.bind(controller));

router.get('/', authenticate, controller.list.bind(controller));
router.post('/', authenticate, controller.create.bind(controller));
router.put('/:id(\\d+)', authenticate, controller.update.bind(controller));
router.delete('/:id(\\d+)', authenticate, controller.remove.bind(controller));
router.post('/:id(\\d+)/test', authenticate, controller.test.bind(controller));

export default router;
