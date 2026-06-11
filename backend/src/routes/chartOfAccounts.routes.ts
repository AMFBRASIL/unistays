import { Router } from 'express';
import { ChartOfAccountsController } from '@/controllers/ChartOfAccountsController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createChartOfAccountSchema, updateChartOfAccountSchema } from '@/validators/chartOfAccounts.validator';

const router = Router();
const chartOfAccountsController = new ChartOfAccountsController();

router.use(authenticate);

// GET - Listar todas as contas
router.get(
  '/',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => chartOfAccountsController.getAll(req, res, next)
);

// GET - Buscar conta por ID
router.get(
  '/:id',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => chartOfAccountsController.getById(req, res, next)
);

// POST - Criar nova conta
router.post(
  '/',
  authorize('super_admin', 'admin', 'manager'),
  validate(createChartOfAccountSchema),
  (req, res, next) => chartOfAccountsController.create(req, res, next)
);

// PUT - Atualizar conta
router.put(
  '/:id',
  authorize('super_admin', 'admin', 'manager'),
  validate(updateChartOfAccountSchema),
  (req, res, next) => chartOfAccountsController.update(req, res, next)
);

// DELETE - Excluir conta (soft delete)
router.delete(
  '/:id',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => chartOfAccountsController.delete(req, res, next)
);

export default router;
