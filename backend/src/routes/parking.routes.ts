import { Router } from 'express';
import { ParkingController } from '@/controllers/ParkingController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createParkingSchema, updateParkingSchema } from '@/validators/parking.validator';

const router = Router();
const parkingController = new ParkingController();

router.use(authenticate);

router.get('/', parkingController.getAll.bind(parkingController));
router.get('/:id', parkingController.getById.bind(parkingController));
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createParkingSchema), parkingController.create.bind(parkingController));
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updateParkingSchema), parkingController.update.bind(parkingController));
router.delete('/:id', authorize('super_admin', 'admin'), parkingController.delete.bind(parkingController));

export default router;
