import { Router } from 'express';
import { BookingChannelController } from '@/controllers/BookingChannelController';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();
const controller = new BookingChannelController();

router.get('/', authenticate, controller.getAll.bind(controller));
router.get('/catalog', authenticate, controller.getAvailableCatalog.bind(controller));
router.get('/:id(\\d+)', authenticate, controller.getById.bind(controller));
router.post('/', authenticate, controller.create.bind(controller));
router.put('/:id(\\d+)', authenticate, controller.update.bind(controller));
router.delete('/:id(\\d+)', authenticate, controller.delete.bind(controller));

export default router;
