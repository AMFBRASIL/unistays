import { Router } from 'express';
import { FiscalParamsController } from '@/controllers/FiscalParamsController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createFiscalParamsSchema, updateFiscalParamsSchema } from '@/validators/fiscalParams.validator';

const router = Router();
const fiscalParamsController = new FiscalParamsController();

router.use(authenticate);

// GET - Buscar parâmetros fiscais atuais (global ou por propriedade)
router.get(
  '/',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => fiscalParamsController.getCurrent(req, res, next)
);

// POST - Criar ou atualizar parâmetros fiscais
router.post(
  '/',
  authorize('super_admin', 'admin', 'manager'),
  validate(createFiscalParamsSchema),
  (req, res, next) => fiscalParamsController.createOrUpdate(req, res, next)
);

// PUT - Atualizar parâmetros fiscais
router.put(
  '/',
  authorize('super_admin', 'admin', 'manager'),
  validate(updateFiscalParamsSchema),
  (req, res, next) => fiscalParamsController.createOrUpdate(req, res, next)
);

export default router;
