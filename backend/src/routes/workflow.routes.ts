import { Router } from 'express';
import { WorkflowController } from '@/controllers/WorkflowController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createWorkflowSchema, updateWorkflowSchema } from '@/validators/workflow.validator';

const router = Router();
const workflowController = new WorkflowController();

router.use(authenticate);

// GET - Listar todos os workflows
router.get(
  '/',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => workflowController.getAll(req, res, next)
);

// GET - Obter tipos de gatilhos disponíveis
router.get(
  '/trigger-types',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => workflowController.getTriggerTypes(req, res, next)
);

// GET - Obter tipos de ações disponíveis
router.get(
  '/action-types',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => workflowController.getActionTypes(req, res, next)
);

// GET - Listar execuções
router.get(
  '/executions',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => workflowController.getExecutions(req, res, next)
);

// GET - Obter status e estatísticas dos workflows
router.get(
  '/status',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => workflowController.getStatus(req, res, next)
);

// POST - Executar workflow manualmente (para testes) - DEVE VIR ANTES DE /:id
router.post(
  '/:id/execute',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => workflowController.executeWorkflow(req, res, next)
);

// POST - Reexecutar última execução falhada do workflow
router.post(
  '/:id/rerun-last-failed',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => workflowController.rerunLastFailed(req, res, next)
);

// GET - Obter workflow por ID
router.get(
  '/:id',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => workflowController.getById(req, res, next)
);

// POST - Criar novo workflow
router.post(
  '/',
  authorize('super_admin', 'admin', 'manager'),
  validate(createWorkflowSchema),
  (req, res, next) => workflowController.create(req, res, next)
);

// PUT - Atualizar workflow
router.put(
  '/:id',
  authorize('super_admin', 'admin', 'manager'),
  validate(updateWorkflowSchema),
  (req, res, next) => workflowController.update(req, res, next)
);

// DELETE - Excluir workflow (soft delete)
router.delete(
  '/:id',
  authorize('super_admin', 'admin', 'manager'),
  (req, res, next) => workflowController.delete(req, res, next)
);

export default router;
