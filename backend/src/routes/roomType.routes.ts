import { Router } from 'express';
import { RoomTypeController } from '@/controllers/RoomTypeController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createRoomTypeSchema, updateRoomTypeSchema } from '@/validators/roomType.validator';

const router = Router();
const roomTypeController = new RoomTypeController();

router.use(authenticate);

router.get('/', roomTypeController.getAll);
router.get('/:id', roomTypeController.getById);
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createRoomTypeSchema), roomTypeController.create);
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updateRoomTypeSchema), roomTypeController.update);
router.delete('/:id', authorize('super_admin', 'admin'), roomTypeController.delete);

export default router;
