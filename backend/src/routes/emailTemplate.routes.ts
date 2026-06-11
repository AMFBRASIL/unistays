import { Router } from 'express';
import { PmsEmailTemplateController } from '@/controllers/PmsEmailTemplateController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';

const router = Router();
const controller = new PmsEmailTemplateController();

router.use(authenticate);

// Rotas de categorias (prefixo /categories) – devem vir antes de /:id para não serem capturadas como id
router
  .route('/categories')
  .get(controller.getCategories.bind(controller))
  .post(authorize('super_admin', 'admin', 'manager'), controller.createCategory.bind(controller));

router
  .route('/categories/:id')
  .put(authorize('super_admin', 'admin', 'manager'), controller.updateCategory.bind(controller))
  .delete(authorize('super_admin', 'admin', 'manager'), controller.deleteCategory.bind(controller));

router.get('/variable-groups', controller.getVariableGroups.bind(controller));
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authorize('super_admin', 'admin', 'manager'), controller.create);
router.put('/:id', authorize('super_admin', 'admin', 'manager'), controller.update);
router.delete('/:id', authorize('super_admin', 'admin'), controller.delete);

export default router;
