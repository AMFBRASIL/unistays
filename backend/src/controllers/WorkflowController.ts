import { Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AppError } from '@/middlewares/error.middleware';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { WorkflowService } from '@/services/WorkflowService';
import { v4 as uuidv4 } from 'uuid';

/**
 * WorkflowController - Novo schema (workflows + workflow_steps + workflow_triggers + workflow_actions)
 * Tabelas: workflows, workflow_steps, workflow_triggers, workflow_actions, workflow_executions
 */
export class WorkflowController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const search = (req.query.search as string) || '';
      const statusFilter = req.query.status as string | undefined;

      let query = `
        SELECT 
          w.id, w.NAME as name, w.DESCRIPTION as description,
          w.is_active, w.execution_count as executions,
          w.last_executed_at as lastExecutedAt,
          w.created_at as createdAt, w.updated_at as updatedAt
        FROM workflows w
        WHERE 1=1
      `;
      const params: (string | number)[] = [];
      if (search.trim()) {
        query += ` AND (w.NAME LIKE ? OR w.DESCRIPTION LIKE ?)`;
        const term = `%${search.trim()}%`;
        params.push(term, term);
      }
      if (statusFilter === 'active') {
        query += ` AND w.is_active = TRUE`;
      } else if (statusFilter === 'paused') {
        query += ` AND w.is_active = FALSE`;
      }
      query += ` ORDER BY w.updated_at DESC`;

      const rows = await queryRunner.query(query, params);
      const workflowIds = (rows as any[]).map((r) => r.id);

      if (workflowIds.length === 0) {
        res.json({ workflows: [] });
        return;
      }

      // Expandir placeholders para IN clause (MySQL não suporta array em ?)
      const idPlaceholders = workflowIds.map(() => '?').join(',');

      const stepsQuery = `
        SELECT ws.workflow_id, ws.step_type, ws.trigger_id, ws.action_id, ws.step_order, ws.config
        FROM workflow_steps ws
        WHERE ws.workflow_id IN (${idPlaceholders}) AND ws.is_active = TRUE
        ORDER BY ws.workflow_id, ws.step_order
      `;
      const stepsRows = await queryRunner.query(stepsQuery, workflowIds);

      const executionsStatsQuery = `
        SELECT workflow_id,
          COUNT(*) as total,
          SUM(CASE WHEN STATUS = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN STATUS = 'failed' THEN 1 ELSE 0 END) as failed
        FROM workflow_executions
        WHERE workflow_id IN (${idPlaceholders})
        GROUP BY workflow_id
      `;
      let executionsStats: Record<string, { total: number; completed: number; failed: number }> = {};
      try {
        const statsRows = await queryRunner.query(executionsStatsQuery, workflowIds);
        (statsRows as any[]).forEach((r: any) => {
          executionsStats[r.workflow_id] = {
            total: Number(r.total) || 0,
            completed: Number(r.completed) || 0,
            failed: Number(r.failed) || 0,
          };
        });
      } catch {
        // table may not exist yet
      }

      const triggerIds = [...new Set((stepsRows as any[]).filter((s) => s.trigger_id).map((s) => s.trigger_id))];
      let triggerNames: Record<string, string> = {};
      if (triggerIds.length > 0) {
        const triggerPlaceholders = triggerIds.map(() => '?').join(',');
        const triggersRows = await queryRunner.query(
          `SELECT id, NAME FROM workflow_triggers WHERE id IN (${triggerPlaceholders})`,
          triggerIds
        );
        (triggersRows as any[]).forEach((t: any) => {
          triggerNames[t.id] = t.NAME;
        });
      }

      const workflows = (rows as any[]).map((w: any) => {
        const steps = (stepsRows as any[]).filter((s: any) => s.workflow_id === w.id);
        const triggerStep = steps.find((s: any) => s.step_type === 'trigger');
        const actionSteps = steps.filter((s: any) => s.step_type === 'action').sort((a, b) => a.step_order - b.step_order);
        const triggerId = triggerStep?.trigger_id || null;
        const triggerName = triggerId ? triggerNames[triggerId] || '' : '';
        const actions = actionSteps.map((s: any) => s.action_id);

        const stats = executionsStats[w.id] || { total: 0, completed: 0, failed: 0 };
        const execCount = Number(w.executions) || 0;
        // Calcular taxa de sucesso: se há registros em workflow_executions, usar stats; senão, se há execution_count, assumir 100%
        let successRate = 0;
        if (stats.total > 0) {
          successRate = Math.round((stats.completed / stats.total) * 1000) / 10;
        } else if (execCount > 0) {
          // Não há registros detalhados, mas workflow foi executado - assumir sucesso ou N/A
          successRate = 100;
        }
        const hasFailed = stats.failed > 0;
        let lastRun = '';
        if (w.lastExecutedAt) {
          const d = new Date(w.lastExecutedAt);
          const now = new Date();
          const diffMs = now.getTime() - d.getTime();
          const diffM = Math.floor(diffMs / 60000);
          const diffH = Math.floor(diffMs / 3600000);
          const diffD = Math.floor(diffMs / 86400000);
          if (diffM < 60) lastRun = `Há ${diffM} min`;
          else if (diffH < 24) lastRun = `Há ${diffH} hora${diffH > 1 ? 's' : ''}`;
          else lastRun = `Há ${diffD} dia${diffD > 1 ? 's' : ''}`;
        }

        return {
          id: w.id,
          name: w.name,
          description: w.description || '',
          trigger: triggerId,
          triggerName,
          actions,
          status: w.is_active ? 'active' : 'paused',
          executions: Number(w.executions) || 0,
          successRate,
          hasFailed,
          lastRun,
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
        };
      });

      res.json({ workflows });
    } catch (error) {
      next(error);
    } finally {
      await queryRunner.release();
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const id = req.params.id;
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const wRows = await queryRunner.query(
        `SELECT id, NAME as name, DESCRIPTION as description, is_active, execution_count, last_executed_at, created_at, updated_at FROM workflows WHERE id = ?`,
        [id]
      );
      if (!(wRows as any[]).length) {
        throw new AppError('Workflow não encontrado', 404);
      }
      const w = (wRows as any[])[0];

      const stepsRows = await queryRunner.query(
        `SELECT id, step_type, trigger_id, action_id, step_order, config, delay_seconds, retry_count, retry_delay_seconds, condition_expression
         FROM workflow_steps WHERE workflow_id = ? AND is_active = TRUE ORDER BY step_order`,
        [id]
      );
      const steps = stepsRows as any[];
      const triggerStep = steps.find((s) => s.step_type === 'trigger');
      const triggerId = triggerStep?.trigger_id || null;
      const actionsOrdered = steps.filter((s) => s.step_type === 'action').map((s) => s.action_id);

      const workflow = {
        id: w.id,
        name: w.name,
        description: w.description || '',
        status: w.is_active ? 'active' : 'paused',
        trigger: triggerId,
        actions: actionsOrdered,
        steps: steps.map((s) => ({
          id: s.id,
          type: s.step_type,
          triggerId: s.trigger_id,
          actionId: s.action_id,
          stepOrder: s.step_order,
          config: typeof s.config === 'string' ? (s.config ? JSON.parse(s.config) : {}) : s.config || {},
          delaySeconds: s.delay_seconds,
          retry_count: s.retry_count,
          retry_delay_seconds: s.retry_delay_seconds,
          conditionExpression: s.condition_expression,
        })),
        executions: Number(w.execution_count) || 0,
        lastExecutedAt: w.last_executed_at,
        createdAt: w.created_at,
        updatedAt: w.updated_at,
      };
      res.json(workflow);
    } catch (error) {
      next(error);
    } finally {
      await queryRunner.release();
    }
  }

  async getTriggerTypes(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const rows = await queryRunner.query(
        `SELECT id, NAME as name, DESCRIPTION as description, category, trigger_type as triggerType, icon, config FROM workflow_triggers WHERE is_active = TRUE ORDER BY category, name`
      );
      const triggers = (rows as any[]).map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description || '',
        category: r.category,
        triggerType: r.triggerType,
        icon: r.icon || 'Zap',
        config: typeof r.config === 'string' ? (r.config ? JSON.parse(r.config) : {}) : r.config || {},
      }));
      res.json({ triggers });
    } catch (error) {
      next(error);
    } finally {
      await queryRunner.release();
    }
  }

  async getActionTypes(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const rows = await queryRunner.query(
        `SELECT id, NAME as name, DESCRIPTION as description, category, action_type as actionType, icon, config_schema as configSchema FROM workflow_actions WHERE is_active = TRUE ORDER BY category, name`
      );
      const actions = (rows as any[]).map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description || '',
        category: r.category,
        actionType: r.actionType,
        icon: r.icon || 'Play',
        configSchema: typeof r.configSchema === 'string' ? (r.configSchema ? JSON.parse(r.configSchema) : {}) : r.configSchema || {},
      }));
      res.json({ actions });
    } catch (error) {
      next(error);
    } finally {
      await queryRunner.release();
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const body = req.body || {};
    const name = (body.name || '').trim();
    const description = body.description ?? '';
    const isActive = body.isActive ?? body.status === 'active';
    const steps = Array.isArray(body.steps) ? body.steps : [];

    if (!name) {
      throw new AppError('Nome do workflow é obrigatório', 400);
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const id = uuidv4();
      const createdBy = (req as any).user?.id ?? null;

      await queryRunner.query(
        `INSERT INTO workflows (id, NAME, DESCRIPTION, is_active, created_by) VALUES (?, ?, ?, ?, ?)`,
        [id, name, description, !!isActive, createdBy]
      );

      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        const stepId = uuidv4();
        const stepType = s.stepType ?? s.type ?? 'action';
        const triggerId = s.triggerId ?? s.trigger_id ?? null;
        const actionId = s.actionId ?? s.action_id ?? null;
        const config = s.config ? JSON.stringify(s.config) : null;
        const delaySeconds = s.delaySeconds ?? s.delay_seconds ?? 0;
        const retryCount = s.retryCount ?? s.retry_count ?? 0;
        const retryDelaySeconds = s.retryDelaySeconds ?? s.retry_delay_seconds ?? 60;

        await queryRunner.query(
          `INSERT INTO workflow_steps (id, workflow_id, step_type, trigger_id, action_id, step_order, config, delay_seconds, retry_count, retry_delay_seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [stepId, id, stepType, triggerId, actionId, i, config, delaySeconds, retryCount, retryDelaySeconds]
        );
      }

      await queryRunner.commitTransaction();

      const created = await queryRunner.query(
        `SELECT id, NAME as name, DESCRIPTION as description, is_active, created_at as createdAt FROM workflows WHERE id = ?`,
        [id]
      );
      const w = (created as any[])[0];
      res.status(201).json({
        id: w.id,
        name: w.name,
        description: w.description || '',
        status: w.is_active ? 'active' : 'paused',
        createdAt: w.createdAt,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      next(error);
    } finally {
      await queryRunner.release();
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const id = req.params.id;
    const body = req.body || {};
    const name = body.name !== undefined ? (body.name || '').trim() : undefined;
    const description = body.description !== undefined ? body.description : undefined;
    const isActive = body.isActive !== undefined ? body.isActive : body.status !== undefined ? body.status === 'active' : undefined;
    const steps = body.steps !== undefined && Array.isArray(body.steps) ? body.steps : undefined;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const existing = await queryRunner.query(`SELECT id FROM workflows WHERE id = ?`, [id]);
      if (!(existing as any[]).length) {
        throw new AppError('Workflow não encontrado', 404);
      }

      await queryRunner.startTransaction();

      const updates: string[] = [];
      const params: (string | number | boolean)[] = [];
      if (name !== undefined) {
        updates.push('NAME = ?');
        params.push(name);
      }
      if (description !== undefined) {
        updates.push('DESCRIPTION = ?');
        params.push(description);
      }
      if (isActive !== undefined) {
        updates.push('is_active = ?');
        params.push(!!isActive);
      }
      if (updates.length) {
        params.push(id);
        await queryRunner.query(`UPDATE workflows SET ${updates.join(', ')} WHERE id = ?`, params);
      }

      if (steps !== undefined) {
        await queryRunner.query(`DELETE FROM workflow_steps WHERE workflow_id = ?`, [id]);
        for (let i = 0; i < steps.length; i++) {
          const s = steps[i];
          const stepId = s.id && typeof s.id === 'string' ? s.id : uuidv4();
          const stepType = s.stepType ?? s.type ?? 'action';
          const triggerId = s.triggerId ?? s.trigger_id ?? null;
          const actionId = s.actionId ?? s.action_id ?? null;
          const config = s.config ? JSON.stringify(s.config) : null;
          const delaySeconds = s.delaySeconds ?? s.delay_seconds ?? 0;
          const retryCount = s.retryCount ?? s.retry_count ?? 0;
          const retryDelaySeconds = s.retryDelaySeconds ?? s.retry_delay_seconds ?? 60;

          await queryRunner.query(
            `INSERT INTO workflow_steps (id, workflow_id, step_type, trigger_id, action_id, step_order, config, delay_seconds, retry_count, retry_delay_seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [stepId, id, stepType, triggerId, actionId, i, config, delaySeconds, retryCount, retryDelaySeconds]
          );
        }
      }

      await queryRunner.commitTransaction();

      const updated = await queryRunner.query(
        `SELECT id, NAME as name, DESCRIPTION as description, is_active, updated_at as updatedAt FROM workflows WHERE id = ?`,
        [id]
      );
      const w = (updated as any[])[0];
      res.json({
        id: w.id,
        name: w.name,
        description: w.description || '',
        status: w.is_active ? 'active' : 'paused',
        updatedAt: w.updatedAt,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      next(error);
    } finally {
      await queryRunner.release();
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const id = req.params.id;
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const existing = await queryRunner.query(`SELECT id FROM workflows WHERE id = ?`, [id]);
      if (!(existing as any[]).length) {
        throw new AppError('Workflow não encontrado', 404);
      }
      await queryRunner.query(`DELETE FROM workflow_steps WHERE workflow_id = ?`, [id]);
      await queryRunner.query(`DELETE FROM workflows WHERE id = ?`, [id]);
      res.status(204).send();
    } catch (error) {
      next(error);
    } finally {
      await queryRunner.release();
    }
  }

  async getExecutions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const workflowId = req.query.workflowId as string | undefined;
    const limit = Math.min(parseInt((req.query.limit as string) || '50', 10) || 50, 200);

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      let query = `
        SELECT e.id, e.workflow_id as workflowId, e.STATUS as status, e.triggered_by as triggeredBy,
               e.trigger_data as triggerData, e.error_message as errorMessage,
               e.started_at as startedAt, e.completed_at as completedAt, e.duration_ms as durationMs,
               w.NAME as workflowName
        FROM workflow_executions e
        INNER JOIN workflows w ON w.id = e.workflow_id
        WHERE 1=1
      `;
      const params: (string | number)[] = [];
      if (workflowId) {
        query += ` AND e.workflow_id = ?`;
        params.push(workflowId);
      }
      query += ` ORDER BY e.created_at DESC LIMIT ?`;
      params.push(limit);

      const rows = await queryRunner.query(query, params);
      const executions = (rows as any[]).map((r) => {
        let triggerData = r.triggerData;
        if (typeof triggerData === 'string') {
          try {
            triggerData = triggerData ? JSON.parse(triggerData) : null;
          } catch {
            triggerData = null;
          }
        }
        const durationMs = r.durationMs != null ? Number(r.durationMs) : null;
        let duration = '';
        if (durationMs != null) {
          if (durationMs < 1000) duration = `${durationMs}ms`;
          else duration = `${(durationMs / 1000).toFixed(1)}s`;
        }
        return {
          id: r.id,
          workflowId: r.workflowId,
          workflowName: r.workflowName,
          status: r.status,
          triggeredBy: r.triggeredBy,
          triggerData,
          errorMessage: r.errorMessage,
          startedAt: r.startedAt,
          completedAt: r.completedAt,
          durationMs,
          duration,
          time: r.startedAt ? new Date(r.startedAt).toLocaleTimeString('pt-BR') : '',
        };
      });
      res.json({ executions });
    } catch (error) {
      next(error);
    } finally {
      await queryRunner.release();
    }
  }

  async getStatus(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const rows = await queryRunner.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active,
          SUM(execution_count) as totalExecutions
        FROM workflows
      `);
      const r = (rows as any[])[0];
      let failedCount = 0;
      try {
        const failRows = await queryRunner.query(
          `SELECT COUNT(*) as c FROM workflow_executions WHERE STATUS = 'failed' AND started_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
        );
        failedCount = Number((failRows as any[])[0]?.c) || 0;
      } catch {
        // ignore
      }
      res.json({
        total: Number(r.total) || 0,
        active: Number(r.active) || 0,
        paused: Number(r.total) - Number(r.active) || 0,
        totalExecutions: Number(r.totalExecutions) || 0,
        failedLast24h: failedCount,
      });
    } catch (error) {
      next(error);
    } finally {
      await queryRunner.release();
    }
  }

  async executeWorkflow(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const id = req.params.id;
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const wRows = await queryRunner.query(
        `SELECT id, NAME FROM workflows WHERE id = ?`,
        [id]
      );
      if (!(wRows as any[]).length) {
        throw new AppError('Workflow não encontrado', 404);
      }
      // TODO: integrar com WorkflowService para executar steps (trigger + actions)
      // Por ora retorna sucesso e registra execução manual
      const executionId = uuidv4();
      await queryRunner.query(
        `INSERT INTO workflow_executions (id, workflow_id, STATUS, triggered_by, started_at, completed_at, duration_ms) VALUES (?, ?, 'completed', 'manual', NOW(), NOW(), 0)`,
        [executionId, id]
      );
      await queryRunner.query(
        `UPDATE workflows SET execution_count = execution_count + 1, last_executed_at = NOW() WHERE id = ?`,
        [id]
      );
      res.json({
        success: true,
        executionId,
        message: 'Execução registrada (execução real dos steps em desenvolvimento)',
      });
    } catch (error) {
      next(error);
    } finally {
      await queryRunner.release();
    }
  }

  async rerunLastFailed(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const id = req.params.id;
    try {
      const result = await WorkflowService.rerunLastFailed(id);
      if (!result) {
        throw new AppError('Nenhuma execução falhada encontrada para este workflow', 404);
      }
      res.json({
        success: true,
        data: {
          workflowId: result.workflowId,
          success: result.success,
          results: result.results,
          duration: result.duration,
          error: result.error,
        },
        message: result.success ? 'Execução reexecutada com sucesso' : 'Execução reexecutada com falhas',
      });
    } catch (error) {
      next(error);
    }
  }
}
