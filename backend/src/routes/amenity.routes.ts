import { Router } from 'express';
import { AmenityController } from '@/controllers/AmenityController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createAmenitySchema, updateAmenitySchema } from '@/validators/amenity.validator';

const router = Router();
const amenityController = new AmenityController();

router.use(authenticate);

router.get('/', amenityController.getAll.bind(amenityController));
router.get('/:id', amenityController.getById.bind(amenityController));
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createAmenitySchema), amenityController.create.bind(amenityController));
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updateAmenitySchema), amenityController.update.bind(amenityController));
router.delete('/:id', authorize('super_admin', 'admin'), amenityController.delete.bind(amenityController));

export default router;
