import { Router } from 'express';
import { MealController } from '@/controllers/MealController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createMealSchema, updateMealSchema } from '@/validators/meal.validator';

const router = Router();
const mealController = new MealController();

router.use(authenticate);

router.get('/', mealController.getAll.bind(mealController));
router.get('/:id', mealController.getById.bind(mealController));
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createMealSchema), mealController.create.bind(mealController));
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updateMealSchema), mealController.update.bind(mealController));
router.delete('/:id', authorize('super_admin', 'admin'), mealController.delete.bind(mealController));

export default router;
