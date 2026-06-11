import { IsNull } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { AppError } from '@/middlewares/error.middleware';
import { EmailService } from './EmailService';
import { Transaction, TransactionType, TransactionStatus } from '@/entities/Transaction.entity';
import { FinancialCategory } from '@/entities/FinancialCategory.entity';
import { v4 as uuidv4 } from 'uuid';

interface Workflow {
  id: number | string;
  uuid?: string;
  propertyId?: number | null;
  name: string;
  description?: string | null;
  triggerType: string;
  triggerConfig?: any;
  actions: any[];
  status: 'active' | 'paused' | 'draft';
}

interface TriggerData {
  triggerType: string;
  eventData: any; // Dados do evento (ex: guest data, reservation data)
  propertyId?: number | null;
}

interface ActionResult {
  actionId: string;
  success: boolean;
  error?: string;
  data?: any;
}

interface ExecutionResult {
  workflowId: number | string;
  success: boolean;
  results: ActionResult[];
  error?: string;
  duration: number;
}

export class WorkflowService {
  /**
   * Processa workflows baseado em um evento/trigger
   */
  static async processTrigger(triggerData: TriggerData): Promise<void> {
    try {
      console.log(`[WorkflowService.processTrigger] Evento recebido: ${triggerData.triggerType}`);
      
      // Buscar workflows ativos para este trigger
      const workflows = await this.getActiveWorkflows(triggerData.triggerType, triggerData.propertyId);

      console.log(`[WorkflowService.processTrigger] ${triggerData.triggerType}: ${workflows.length} workflow(s) ativo(s) encontrado(s)`);
      
      if (workflows.length === 0) {
        console.warn(`[WorkflowService] ⚠️ Nenhum workflow ativo para o evento "${triggerData.triggerType}". Verifique se existe um workflow ativo com esse gatilho em /workflows.`);
        if (triggerData.triggerType === 'purchase_order.created') {
          console.warn('[WorkflowService] 💡 Para notificar a gestão de compras ao criar pedido, execute: backend/database/workflow_purchase_order_created.sql');
        }
      } else {
        console.log(`[WorkflowService] ✓ Workflows que serão executados:`, workflows.map(w => `"${w.name}" (${w.id})`).join(', '));
      }

      // Processar cada workflow de forma assíncrona (não bloquear)
      workflows.forEach((workflow) => {
        // Executar em background sem bloquear
        WorkflowService.executeWorkflow(workflow, triggerData).catch((error) => {
          console.error(`Erro ao executar workflow ${workflow.id}:`, error);
        });
      });
    } catch (error: any) {
      console.error('Erro ao processar trigger:', error);
      // Não propagar erro para não interromper o fluxo principal
    }
  }

  /**
   * Mapeia triggerType (usado no código) para event (gravado no config do gatilho no banco).
   */
  private static triggerTypeToEvent(triggerType: string): string {
    const map: Record<string, string> = {
      new_guest: 'guest.created',
      guest_created: 'guest.created',
      reservation_created: 'reservation.created',
      reservation_checkin: 'reservation.checkin',
      reservation_checkout: 'reservation.checkout',
      reservation_cancelled: 'reservation.cancelled',
      payment_received: 'payment.received',
      maintenance_requested: 'maintenance.requested',
      task_created: 'task.created',
      transaction_created: 'transaction.created',
      purchase_order_created: 'purchase_order.created',
    };
    return map[triggerType] ?? triggerType;
  }

  /**
   * Mapeia action_type (workflow_actions) para action_id usado no executeAction.
   */
  private static actionTypeToId(actionType: string, actionName?: string): string {
    const byType: Record<string, string> = {
      email: 'send_email',
      sms: 'send_sms',
      whatsapp: 'send_whatsapp',
      notification: 'push_notification',
      task: 'create_task',
      database: 'update_database',
      webhook: 'webhook',
      integration: 'webhook',
      financial: 'create_transaction',
      transaction: 'create_transaction',
    };
    if (actionName?.toLowerCase().includes('aguardar')) return 'delay';
    if (actionName?.toLowerCase().includes('transação') || actionName?.toLowerCase().includes('transacao')) return 'create_transaction';
    if (actionName?.toLowerCase().includes('mapear conta') || actionName?.toLowerCase().includes('plano de conta')) return 'map_chart_account';
    return byType[actionType] ?? 'send_email';
  }

  /**
   * Busca workflows ativos para um tipo de trigger (novo schema: workflows + workflow_steps + workflow_triggers).
   */
  private static async getActiveWorkflows(
    triggerType: string,
    _propertyId?: number | null
  ): Promise<Workflow[]> {
    const event = this.triggerTypeToEvent(triggerType);
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const query = `
        SELECT DISTINCT w.id, w.name, w.description, w.is_active, w.property_id as propertyId
        FROM workflows w
        INNER JOIN workflow_steps ws_trigger ON ws_trigger.workflow_id = w.id AND ws_trigger.step_type = 'trigger' AND ws_trigger.is_active = TRUE
        INNER JOIN workflow_triggers wt ON wt.id = ws_trigger.trigger_id
        WHERE w.is_active = TRUE
          AND (wt.config IS NULL OR JSON_UNQUOTE(JSON_EXTRACT(wt.config, '$.event')) = ?)
      `;
      const rows = await queryRunner.query(query, [event]);
      if (!(rows as any[]).length) return [];

      const workflowIds = (rows as any[]).map((r: any) => r.id);
      const idPlaceholders = workflowIds.map(() => '?').join(',');

      const stepsQuery = `
        SELECT ws.workflow_id, ws.step_type, ws.action_id, ws.step_order, ws.config, ws.delay_seconds, ws.retry_count, ws.retry_delay_seconds
        FROM workflow_steps ws
        WHERE ws.workflow_id IN (${idPlaceholders}) AND ws.is_active = TRUE AND ws.step_type IN ('action', 'delay')
        ORDER BY ws.workflow_id, ws.step_order
      `;
      const stepsRows = await queryRunner.query(stepsQuery, workflowIds);

      const actionIds = [...new Set((stepsRows as any[]).filter((s: any) => s.action_id).map((s: any) => s.action_id))];
      let actionMeta: Record<string, { action_type: string; name: string }> = {};
      if (actionIds.length > 0) {
        const actionRows = await queryRunner.query(
          `SELECT id, action_type as action_type, NAME as name FROM workflow_actions WHERE id IN (?)`,
          [actionIds]
        );
        (actionRows as any[]).forEach((a: any) => {
          actionMeta[a.id] = { action_type: a.action_type, name: a.name };
        });
      }

      const workflows: Workflow[] = (rows as any[]).map((w: any) => {
        const steps = (stepsRows as any[]).filter((s: any) => s.workflow_id === w.id);
        const actions: any[] = [];
        for (const s of steps) {
          if (s.step_type === 'delay') {
            const sec = s.delay_seconds ?? 0;
            actions.push({ action_id: 'delay', config: { duration: sec, unit: 'seconds' } });
          } else if (s.action_id) {
            const meta = actionMeta[s.action_id];
            const actionId = meta
              ? this.actionTypeToId(meta.action_type, meta.name)
              : 'send_email';
            let config = s.config;
            if (typeof config === 'string') {
              try {
                config = config ? JSON.parse(config) : {};
              } catch {
                config = {};
              }
            }
            const retryCount = Number(s.retry_count) || 0;
            const retryDelaySeconds = Number(s.retry_delay_seconds) || 60;
            actions.push({
              action_id: actionId,
              config: config || {},
              retry_count: retryCount,
              retry_delay_seconds: retryDelaySeconds,
            });
          }
        }
        return {
          id: w.id,
          name: w.name,
          description: w.description || null,
          propertyId: w.propertyId || w.property_id || null,
          triggerType: event,
          triggerConfig: {},
          actions,
          status: 'active' as const,
        };
      });

      return workflows;
    } catch (err) {
      console.error('[WorkflowService.getActiveWorkflows] Erro:', err);
      return [];
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Reexecuta a última execução falhada de um workflow, usando os mesmos trigger_data.
   * @returns ExecutionResult ou null se não houver execução falhada
   */
  static async rerunLastFailed(workflowId: string): Promise<ExecutionResult | null> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const failedRows = await queryRunner.query(
        `SELECT id, trigger_data as triggerData, triggered_by as triggeredBy
         FROM workflow_executions
         WHERE workflow_id = ? AND STATUS = 'failed'
         ORDER BY created_at DESC
         LIMIT 1`,
        [workflowId]
      );

      if (!(failedRows as any[]).length) {
        return null;
      }

      const lastFailed = (failedRows as any[])[0];
      let eventData: any = null;
      const raw = lastFailed.triggerData;
      if (raw) {
        if (typeof raw === 'string') {
          try {
            eventData = raw ? JSON.parse(raw) : null;
          } catch {
            eventData = null;
          }
        } else {
          eventData = raw;
        }
      }

      if (!eventData) {
        throw new AppError('Não foi possível recuperar os dados da execução falhada para reexecução', 400);
      }

      const workflow = await this.getWorkflowById(workflowId);
      if (!workflow) {
        throw new AppError('Workflow não encontrado', 404);
      }

      const triggerType = lastFailed.triggeredBy && lastFailed.triggeredBy !== 'system'
        ? lastFailed.triggeredBy
        : workflow.triggerType;

      const triggerData: TriggerData = {
        triggerType,
        eventData,
        propertyId: workflow.propertyId ?? null,
      };

      return await this.executeWorkflow(workflow, triggerData);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Carrega um workflow por ID com sua estrutura (trigger, actions)
   */
  private static async getWorkflowById(workflowId: string): Promise<Workflow | null> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const wRows = await queryRunner.query(
        `SELECT w.id, w.NAME as name, w.DESCRIPTION as description, w.is_active
         FROM workflows w
         WHERE w.id = ?`,
        [workflowId]
      );
      if (!(wRows as any[]).length) return null;

      const w = (wRows as any[])[0];

      const triggerStepRows = await queryRunner.query(
        `SELECT ws.trigger_id, wt.config
         FROM workflow_steps ws
         LEFT JOIN workflow_triggers wt ON wt.id = ws.trigger_id
         WHERE ws.workflow_id = ? AND ws.step_type = 'trigger' AND ws.is_active = TRUE
         LIMIT 1`,
        [workflowId]
      );
      let triggerType = 'reservation.created';
      if ((triggerStepRows as any[]).length) {
        const cfg = (triggerStepRows as any[])[0].config;
        if (cfg) {
          const parsed = typeof cfg === 'string' ? (cfg ? JSON.parse(cfg) : {}) : cfg;
          if (parsed.event) triggerType = parsed.event;
        }
      }

      const stepsRows = await queryRunner.query(
        `SELECT ws.step_type, ws.action_id, ws.step_order, ws.config, ws.delay_seconds, ws.retry_count, ws.retry_delay_seconds
         FROM workflow_steps ws
         WHERE ws.workflow_id = ? AND ws.is_active = TRUE AND ws.step_type IN ('action', 'delay')
         ORDER BY ws.step_order`,
        [workflowId]
      );

      const actionIds = [...new Set((stepsRows as any[]).filter((s: any) => s.action_id).map((s: any) => s.action_id))];
      let actionMeta: Record<string, { action_type: string; name: string }> = {};
      if (actionIds.length > 0) {
        const placeholders = actionIds.map(() => '?').join(',');
        const actionRows = await queryRunner.query(
          `SELECT id, action_type as action_type, NAME as name FROM workflow_actions WHERE id IN (${placeholders})`,
          actionIds
        );
        (actionRows as any[]).forEach((a: any) => {
          actionMeta[a.id] = { action_type: a.action_type, name: a.name };
        });
      }

      const actions: any[] = [];
      for (const s of stepsRows as any[]) {
        if (s.step_type === 'delay') {
          const sec = s.delay_seconds ?? 0;
          actions.push({ action_id: 'delay', config: { duration: sec, unit: 'seconds' } });
        } else if (s.action_id) {
          const meta = actionMeta[s.action_id];
          const actionId = meta
            ? this.actionTypeToId(meta.action_type, meta.name)
            : 'send_email';
          let config = s.config;
          if (typeof config === 'string') {
            try {
              config = config ? JSON.parse(config) : {};
            } catch {
              config = {};
            }
          }
          const retryCount = Number(s.retry_count) || 0;
          const retryDelaySeconds = Number(s.retry_delay_seconds) || 60;
          actions.push({
            action_id: actionId,
            config: config || {},
            retry_count: retryCount,
            retry_delay_seconds: retryDelaySeconds,
          });
        }
      }

      return {
        id: w.id,
        name: w.name,
        description: w.description || null,
        triggerType,
        triggerConfig: {},
        actions,
        status: 'active' as const,
        propertyId: null,
      };
    } catch (err) {
      console.error('[WorkflowService.getWorkflowById] Erro:', err);
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Verifica se um workflow deve ser executado baseado nas condições
   */
  private static shouldExecuteWorkflow(workflow: Workflow, triggerData: TriggerData): boolean {
    if (!workflow.triggerConfig) {
      return true; // Sem filtros, executa sempre
    }

    const config = workflow.triggerConfig;
    const eventData = triggerData.eventData;

    // Verificar filtros comuns
    if (config.filters) {
      // Filtro por guest_type
      if (config.filters.guest_type && eventData.tier) {
        const guestType = config.filters.guest_type;
        if (Array.isArray(guestType) && !guestType.includes('all')) {
          if (guestType.includes('vip') && !['gold', 'platinum'].includes(eventData.tier)) {
            return false;
          }
          if (guestType.includes('new') && eventData.totalStays > 0) {
            return false;
          }
        }
      }

      // Filtro por channel (para reservas)
      if (config.filters.channel && eventData.channel) {
        const channel = config.filters.channel;
        if (Array.isArray(channel) && !channel.includes('all') && !channel.includes(eventData.channel)) {
          return false;
        }
      }

      // Filtro por payment_method (para pagamentos)
      if (config.filters.payment_method && eventData.paymentMethod) {
        const paymentMethod = config.filters.payment_method;
        if (Array.isArray(paymentMethod) && !paymentMethod.includes('all') && !paymentMethod.includes(eventData.paymentMethod)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Executa um workflow específico
   * Pode ser chamado externamente para testar/executar workflows manualmente
   */
  static async executeWorkflow(workflow: Workflow, triggerData: TriggerData): Promise<ExecutionResult> {
    const startTime = Date.now();
    const executionUuid = uuidv4();
    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar se deve executar
      if (!this.shouldExecuteWorkflow(workflow, triggerData)) {
        // Rollback e release antes de retornar cedo
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        return {
          workflowId: workflow.id,
          success: true,
          results: [],
          duration: Date.now() - startTime,
        };
      }

      const triggerDataJson = JSON.stringify(triggerData.eventData);
      const isNewSchema = typeof workflow.id === 'string';

      let executionId: string | number;

      if (isNewSchema) {
        // Novo schema: workflow_executions (id UUID, workflow_id, STATUS, trigger_data, started_at, etc.)
        executionId = executionUuid;
        await queryRunner.query(
          `INSERT INTO workflow_executions (id, workflow_id, STATUS, triggered_by, trigger_data, started_at)
           VALUES (?, ?, 'running', ?, ?, NOW())`,
          [executionId, workflow.id, 'system', triggerDataJson]
        );
      } else {
        // Schema antigo (compatibilidade)
        const executionInsertQuery = `
          INSERT INTO workflow_executions (
            uuid, workflow_id, trigger_data, execution_status, started_at
          ) VALUES (?, ?, ?, 'failed', NOW())
        `;
        await queryRunner.query(executionInsertQuery, [
          executionUuid,
          workflow.id,
          triggerDataJson,
        ]);
        const executionIdResult = await queryRunner.query('SELECT LAST_INSERT_ID() as id');
        executionId = executionIdResult[0].id;
      }

      console.log(`[WorkflowService.executeWorkflow] Criando registro de execução para workflow ${workflow.id}...`);
      console.log(`[WorkflowService.executeWorkflow] Dados do workflow:`, {
        workflowId: workflow.id,
        workflowName: workflow.name,
        actionCount: workflow.actions.length,
        triggerType: workflow.triggerType,
      });
      
      console.log(`[WorkflowService.executeWorkflow] ✅ Registro de execução criado (ID: ${executionId})`);
      console.log(`[WorkflowService.executeWorkflow] Executando ${workflow.actions.length} ação(ões)...`);

      // Executar ações em sequência
      const results: ActionResult[] = [];
      let hasError = false;
      let errorMessage: string | null = null;

      for (let i = 0; i < workflow.actions.length; i++) {
        const action = workflow.actions[i];
        const maxAttempts = Math.max(1, Number(action.retry_count) || 1);
        const retryDelayMs = (Number(action.retry_delay_seconds) || 60) * 1000;

        let lastResult: ActionResult | null = null;
        let lastError: string | null = null;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          console.log(`[WorkflowService.executeWorkflow] Executando ação ${i + 1}/${workflow.actions.length}${maxAttempts > 1 ? ` (tentativa ${attempt}/${maxAttempts})` : ''}...`);

          try {
            const resolvedPropertyId = workflow.propertyId ?? triggerData.propertyId ?? null;
            const result = await this.executeAction(action, triggerData, resolvedPropertyId);
            lastResult = result;

            if (result.success) {
              results.push(result);
              console.log(`[WorkflowService.executeWorkflow] ✅ Ação ${i + 1} concluída com sucesso`);
              break;
            }

            lastError = result.error || 'Ação falhou';
            console.warn(`[WorkflowService.executeWorkflow] ⚠️ Ação ${i + 1} falhou (tentativa ${attempt}/${maxAttempts}):`, {
              actionId: action.action_id,
              error: lastError,
            });

            if (attempt < maxAttempts && retryDelayMs > 0) {
              console.log(`[WorkflowService.executeWorkflow] Aguardando ${retryDelayMs / 1000}s antes da próxima tentativa...`);
              await new Promise((r) => setTimeout(r, retryDelayMs));
            }
          } catch (error: any) {
            lastError = error.message || 'Erro ao executar ação';
            console.error(`[WorkflowService.executeWorkflow] ❌ ERRO na ação ${i + 1} (tentativa ${attempt}/${maxAttempts}):`, {
              actionId: action.action_id || 'unknown',
              error: lastError,
              stack: error.stack,
            });

            if (attempt < maxAttempts && retryDelayMs > 0) {
              console.log(`[WorkflowService.executeWorkflow] Aguardando ${retryDelayMs / 1000}s antes da próxima tentativa...`);
              await new Promise((r) => setTimeout(r, retryDelayMs));
            }
          }
        }

        if (lastResult && !lastResult.success) {
          hasError = true;
          errorMessage = lastResult.error || lastError || 'Ação falhou';
          results.push(lastResult);
        } else if (lastError && !lastResult) {
          hasError = true;
          errorMessage = lastError;
          results.push({
            actionId: action.action_id || 'unknown',
            success: false,
            error: lastError,
          });
        }
      }
      
      console.log(`[WorkflowService.executeWorkflow] Todas as ações foram processadas:`, {
        totalActions: workflow.actions.length,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length,
        hasError,
      });

      const duration = Date.now() - startTime;
      const executionStatus = hasError ? (results.some((r) => r.success) ? 'partial' : 'failed') : 'success';
      const statusForDb = executionStatus === 'partial' ? 'failed' : executionStatus;

      if (isNewSchema) {
        await queryRunner.query(
          `UPDATE workflow_executions
           SET STATUS = ?, result_data = ?, error_message = ?, completed_at = NOW(), duration_ms = ?
           WHERE id = ?`,
          [statusForDb === 'success' ? 'completed' : 'failed', JSON.stringify(results), errorMessage, duration, executionId]
        );
        await queryRunner.query(
          `UPDATE workflows SET execution_count = execution_count + 1, last_executed_at = NOW() WHERE id = ?`,
          [workflow.id]
        );
      } else {
        await queryRunner.query(
          `UPDATE workflow_executions
           SET execution_status = ?, execution_duration = ?, actions_executed = ?, error_message = ?, completed_at = NOW()
           WHERE id = ?`,
          [executionStatus, duration / 1000, JSON.stringify(results), errorMessage, executionId]
        );
        const successIncrement = executionStatus === 'success' || executionStatus === 'partial' ? 1 : 0;
        const failureIncrement = executionStatus === 'failed' || executionStatus === 'partial' ? 1 : 0;
        await queryRunner.query(
          `UPDATE workflows
           SET execution_count = execution_count + 1, success_count = success_count + ?,
               failure_count = failure_count + ?, last_executed_at = NOW(), last_execution_status = ?
           WHERE id = ?`,
          [successIncrement, failureIncrement, statusForDb, workflow.id]
        );
      }

      await queryRunner.commitTransaction();
      
      console.log(`[WorkflowService.executeWorkflow] Workflow ${workflow.id} concluído: ${executionStatus} (${duration}ms)`);

      return {
        workflowId: workflow.id,
        success: !hasError,
        results,
        error: errorMessage || undefined,
        duration,
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Executa uma ação individual
   */
  private static async executeAction(
    action: any,
    triggerData: TriggerData,
    propertyId?: number | null
  ): Promise<ActionResult> {
    const actionId = action.action_id;
    const actionStartTime = Date.now();
    
    console.log(`[WorkflowService.executeAction] ===== INÍCIO da ação: ${actionId} =====`);
    console.log(`[WorkflowService.executeAction] Configuração da ação:`, {
      actionId,
      hasConfig: !!action.config,
      configKeys: action.config ? Object.keys(action.config) : [],
    });

    try {
      switch (actionId) {
        case 'send_email':
          console.log(`[WorkflowService.executeAction] Executando ação: send_email`);
          await this.executeSendEmail(action, triggerData, propertyId);
          break;

        case 'send_sms':
          // TODO: Implementar envio de SMS
          console.log(`[WorkflowService.executeAction] AVISO: SMS não implementado ainda:`, action);
          break;

        case 'add_points':
          console.log(`[WorkflowService.executeAction] Executando ação: add_points`);
          await this.executeAddPoints(action, triggerData);
          break;

        case 'create_task':
          // TODO: Implementar criação de tarefas
          console.log(`[WorkflowService.executeAction] AVISO: Create task não implementado ainda:`, action);
          break;

        case 'webhook':
          console.log(`[WorkflowService.executeAction] Executando ação: webhook`);
          await this.executeWebhook(action, triggerData);
          break;

        case 'delay':
          console.log(`[WorkflowService.executeAction] Executando ação: delay`);
          await this.executeDelay(action);
          break;

        case 'create_transaction':
          console.log(`[WorkflowService.executeAction] Executando ação: create_transaction`);
          await this.executeCreateTransaction(action, triggerData, propertyId);
          break;

        case 'map_chart_account':
          console.log(`[WorkflowService.executeAction] Executando ação: map_chart_account`);
          await this.executeMapChartAccount(action, triggerData);
          break;

        default:
          const errorMsg = `Ação não suportada: ${actionId}`;
          console.error(`[WorkflowService.executeAction] ERRO: ${errorMsg}`);
          throw new Error(errorMsg);
      }

      const duration = Date.now() - actionStartTime;
      console.log(`[WorkflowService.executeAction] ✅ Ação ${actionId} concluída com sucesso (${duration}ms)`);
      console.log(`[WorkflowService.executeAction] ===== FIM da ação: ${actionId} =====`);

      return {
        actionId,
        success: true,
      };
    } catch (error: any) {
      const duration = Date.now() - actionStartTime;
      const errorMsg = error.message || 'Erro ao executar ação';
      console.error(`[WorkflowService.executeAction] ❌ ERRO na ação ${actionId} (${duration}ms):`, {
        error: errorMsg,
        stack: error.stack,
      });
      console.log(`[WorkflowService.executeAction] ===== FIM da ação: ${actionId} (COM ERRO) =====`);
      
      return {
        actionId,
        success: false,
        error: errorMsg,
      };
    }
  }

  /**
   * Executa ação de enviar e-mail
   * Usa sempre a configuração da tela de Configuração de E-mail via EmailService
   */
  private static async executeSendEmail(
    action: any,
    triggerData: TriggerData,
    propertyId?: number | null
  ): Promise<void> {
    console.log('[WorkflowService.executeSendEmail] ===== INÍCIO da execução de envio de e-mail =====');
    console.log('[WorkflowService.executeSendEmail] Parâmetros recebidos:', {
      propertyId,
      hasConfig: !!action.config,
      hasTriggerData: !!triggerData,
      hasEventData: !!triggerData?.eventData,
    });

    const config = action.config || {};
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      console.log('[WorkflowService.executeSendEmail] QueryRunner conectado. Iniciando preparação do e-mail...');
      
      // Buscar template se especificado
      let emailHtml = config.html || '';
      let emailSubject = config.subject || 'Notificação do Unistays';
      let emailTo = config.to || '';

      console.log('[WorkflowService.executeSendEmail] Configuração inicial:', {
        hasHtml: !!emailHtml,
        htmlLength: emailHtml.length,
        subject: emailSubject,
        emailTo: emailTo || '(não definido)',
        hasTemplateId: !!config.template_id,
        templateId: config.template_id || '(não definido)',
      });

      // Normalizar eventData: quando o gatilho é de reserva, email/nome estão em eventData.guest
      const raw = triggerData.eventData;
      const guest = raw?.guest;
      const reservation = raw?.reservation;
      const maintenance = raw?.maintenance;
      const eventData = {
        ...raw,
        // Destinatário: prioriza top-level, depois hóspede da reserva
        email: raw?.email ?? guest?.email ?? '',
        firstName: raw?.firstName ?? guest?.firstName ?? raw?.name ?? '',
        lastName: raw?.lastName ?? guest?.lastName ?? '',
        name: raw?.name ?? (guest ? `${guest.firstName ?? ''} ${guest.lastName ?? ''}`.trim() : '') ?? '',
        phone: raw?.phone ?? guest?.phone ?? '',
        documentNumber: raw?.documentNumber ?? guest?.documentNumber ?? raw?.cpf ?? guest?.cpf ?? '',
        document: raw?.document ?? guest?.document ?? '',
        cpf: raw?.documentNumber ?? guest?.documentNumber ?? raw?.cpf ?? guest?.cpf ?? '',
        // Campos de reserva (podem vir de eventData.reservation)
        reservationNumber: raw?.reservationNumber ?? reservation?.reservationNumber ?? '',
        protocol: raw?.protocol ?? reservation?.confirmationCode ?? raw?.id?.toString() ?? '',
        id: raw?.id ?? reservation?.id ?? '',
        checkInDate: raw?.checkInDate ?? raw?.checkinDate ?? (reservation?.checkIn ? String(reservation.checkIn).slice(0, 10) : '') ?? '',
        checkOutDate: raw?.checkOutDate ?? raw?.checkoutDate ?? (reservation?.checkOut ? String(reservation.checkOut).slice(0, 10) : '') ?? '',
        checkinDate: raw?.checkinDate ?? (reservation?.checkIn ? String(reservation.checkIn).slice(0, 10) : '') ?? '',
        checkoutDate: raw?.checkoutDate ?? (reservation?.checkOut ? String(reservation.checkOut).slice(0, 10) : '') ?? '',
        nights: raw?.nights ?? reservation?.nights?.toString() ?? '',
        totalAmount: raw?.totalAmount?.toString() ?? raw?.totalValue?.toString() ?? reservation?.totalAmount?.toString() ?? raw?.total?.toString() ?? '',
        total: raw?.total ?? reservation?.totalAmount?.toString() ?? '',
        // Manutenção (quando gatilho é maintenance.requested)
        tituloManutencao: raw?.tituloManutencao ?? maintenance?.title ?? '',
        localManutencao: raw?.localManutencao ?? maintenance?.location ?? '',
        equipamento: raw?.equipamento ?? maintenance?.equipment ?? '',
        prioridadeManutencao: raw?.prioridadeManutencao ?? maintenance?.priority ?? '',
        tipoManutencao: raw?.tipoManutencao ?? maintenance?.type ?? '',
        descricaoManutencao: raw?.descricaoManutencao ?? maintenance?.description ?? '',
        dataPrevista: raw?.dataPrevista ?? (maintenance?.dueDate ? String(maintenance.dueDate).slice(0, 10) : '') ?? '',
        responsavel: raw?.responsavel ?? maintenance?.assignedTo ?? '',
        // Pedido de compra (quando gatilho é purchase_order.created)
        orderNumber: raw?.orderNumber ?? raw?.protocol ?? raw?.orderId?.toString() ?? '',
        supplierName: raw?.supplierName ?? '',
        propertyName: raw?.propertyName ?? '',
        expectedDeliveryDate: raw?.expectedDeliveryDate ? String(raw.expectedDeliveryDate).slice(0, 10) : '',
      };
      console.log('[WorkflowService.executeSendEmail] EventData disponível:', {
        hasEventData: !!raw,
        hasGuest: !!guest,
        hasReservation: !!reservation,
        email: eventData.email || '(não disponível)',
      });
      
      // Buscar informações da empresa/propriedade usando EmailService (busca de properties ou general_settings)
      const companyInfo = await EmailService.getCompanyInfo(propertyId);
      
      // Buscar informações da configuração de e-mail (pode ter nome do remetente que é útil)
      let emailConfigInfo: any = {};
      try {
        const validPropertyId = propertyId !== null && propertyId !== undefined && !isNaN(Number(propertyId)) ? Number(propertyId) : null;
        const emailConfigQuery = `
          SELECT from_name as fromName, from_email as fromEmail
          FROM email_configs
          WHERE deleted_at IS NULL AND is_active = TRUE
        `;
        const emailConfigParams: any[] = [];
        let emailConfigWhere = '';
        
        if (validPropertyId) {
          emailConfigWhere = ` AND (property_id = ? OR property_id IS NULL)`;
          emailConfigParams.push(validPropertyId);
        } else {
          emailConfigWhere = ` AND property_id IS NULL`;
        }
        
        const finalEmailConfigQuery = emailConfigQuery + emailConfigWhere + ` ORDER BY property_id DESC, is_default DESC, created_at DESC LIMIT 1`;
        const emailConfigResults = await queryRunner.query(finalEmailConfigQuery, emailConfigParams);
        if (emailConfigResults.length > 0) {
          emailConfigInfo = emailConfigResults[0];
        }
      } catch (error) {
        console.error('Erro ao buscar configuração de e-mail:', error);
      }

      // Valores comuns pré-computados
      const guestFirstName = eventData.firstName || eventData.name || 'Cliente';
      const guestLastName = eventData.lastName || '';
      const guestFullName = `${eventData.firstName || ''} ${eventData.lastName || ''}`.trim() || 'Cliente';
      const guestEmail = eventData.email || '';
      const guestPhone = eventData.phone || '';
      const guestDocument = eventData.documentNumber || eventData.cpf || '';
      const resNumber = eventData.reservationNumber || eventData.id?.toString() || '';
      const resProtocol = eventData.protocol || eventData.id?.toString() || '';
      const checkIn = eventData.checkInDate || eventData.checkinDate || '';
      const checkOut = eventData.checkOutDate || eventData.checkoutDate || '';
      const checkInTime = eventData.checkInTime || eventData.checkinTime || '';
      const checkOutTime = eventData.checkOutTime || eventData.checkoutTime || '';
      const nightsStr = eventData.nights?.toString() || '';
      const roomNumber = eventData.roomNumber || eventData.room || '';
      const roomType = eventData.roomType || eventData.accommodationType || '';
      const adultsStr = eventData.adults?.toString() || '';
      const childrenStr = eventData.children?.toString() || '';
      const totalAmount = eventData.totalAmount?.toString() || eventData.total?.toString() || '';
      const amountVal = eventData.amount?.toString() || eventData.total?.toString() || '';
      const hotelName = companyInfo.name || emailConfigInfo.fromName || 'Unistays';
      const hotelAddress = companyInfo.address || '';
      const hotelPhone = companyInfo.phone || '';
      const hotelEmail = companyInfo.email || emailConfigInfo.fromEmail || '';
      const hotelWebsite = companyInfo.website || '';
      const hotelCnpj = companyInfo.cnpj || companyInfo.taxId || '';
      const hotelWifi = companyInfo.wifiPassword || (companyInfo as any).wifi_password || '';
      const hotelWifiNetwork = companyInfo.wifiNetwork || (companyInfo as any).wifi_network || '';

      console.log('[WorkflowService.executeSendEmail] Wi-Fi Debug:', {
        propertyId,
        companyInfoWifiNetwork: companyInfo.wifiNetwork,
        companyInfoWifiPassword: companyInfo.wifiPassword,
        resolvedWifiNetwork: hotelWifiNetwork,
        resolvedWifiPassword: hotelWifi,
        fullCompanyInfo: JSON.stringify(companyInfo),
      });

      // Mapeamento completo de variáveis - Português E Inglês (ambos formatos funcionam)
      const variableMap: Record<string, string> = {
        // ============================================
        // HÓSPEDE / GUEST (português + inglês)
        // ============================================
        '[cliente]': guestFirstName,
        '[nome]': guestFirstName,
        '[nome-cliente]': guestFirstName,
        '[guest_first_name]': guestFirstName,
        '[guest_name]': guestFirstName,
        '[first_name]': guestFirstName,
        '[sobrenome]': guestLastName,
        '[sobrenome-cliente]': guestLastName,
        '[guest_last_name]': guestLastName,
        '[last_name]': guestLastName,
        '[nome-completo]': guestFullName,
        '[guest_full_name]': guestFullName,
        '[full_name]': guestFullName,
        '[email]': guestEmail,
        '[email-cliente]': guestEmail,
        '[guest_email]': guestEmail,
        '[telefone]': guestPhone,
        '[telefone-cliente]': guestPhone,
        '[guest_phone]': guestPhone,
        '[phone]': guestPhone,
        '[cpf-cliente]': guestDocument,
        '[documento-cliente]': guestDocument,
        '[cpf]': guestDocument,
        '[documento]': guestDocument,
        '[guest_document]': guestDocument,
        '[document]': guestDocument,

        // ============================================
        // RESERVA / RESERVATION (português + inglês)
        // ============================================
        '[numero-reserva]': resNumber,
        '[reservation_number]': resNumber,
        '[booking_number]': resNumber,
        '[protocolo]': resProtocol,
        '[protocol]': resProtocol,
        '[confirmation_code]': resProtocol,
        '[data-checkin]': checkIn,
        '[check_in_date]': checkIn,
        '[checkin_date]': checkIn,
        '[checkin]': checkIn,
        '[data-checkout]': checkOut,
        '[check_out_date]': checkOut,
        '[checkout_date]': checkOut,
        '[checkout]': checkOut,
        '[hora-checkin]': checkInTime,
        '[check_in_time]': checkInTime,
        '[hora-checkout]': checkOutTime,
        '[check_out_time]': checkOutTime,
        '[noites]': nightsStr,
        '[nights]': nightsStr,
        '[numero-quarto]': roomNumber,
        '[room_number]': roomNumber,
        '[room]': roomNumber,
        '[tipo-quarto]': roomType,
        '[room_type]': roomType,
        '[adultos]': adultsStr,
        '[adults]': adultsStr,
        '[criancas]': childrenStr,
        '[children]': childrenStr,

        // ============================================
        // FINANCEIRO / FINANCIAL (português + inglês)
        // ============================================
        '[valor-total]': totalAmount,
        '[total_amount]': totalAmount,
        '[total]': totalAmount,
        '[valor]': amountVal,
        '[amount]': amountVal,
        '[valor-pago]': eventData.amountPaid?.toString() || '',
        '[amount_paid]': eventData.amountPaid?.toString() || '',
        '[valor-pendente]': eventData.amountPending?.toString() || '',
        '[amount_pending]': eventData.amountPending?.toString() || '',
        '[valor-diaria]': eventData.dailyRate?.toString() || '',
        '[daily_rate]': eventData.dailyRate?.toString() || '',
        '[moeda]': eventData.currency || 'R$',
        '[currency]': eventData.currency || 'R$',

        // ============================================
        // HOTEL / PROPRIEDADE (português + inglês)
        // ============================================
        '[nome-hotel]': hotelName,
        '[hotel_name]': hotelName,
        '[property_name]': hotelName,
        '[endereco-hotel]': hotelAddress,
        '[hotel_address]': hotelAddress,
        '[telefone-hotel]': hotelPhone,
        '[hotel_phone]': hotelPhone,
        '[email-hotel]': hotelEmail,
        '[hotel_email]': hotelEmail,
        '[site-hotel]': hotelWebsite,
        '[hotel_website]': hotelWebsite,
        '[website]': hotelWebsite,
        '[cnpj-hotel]': hotelCnpj,
        '[hotel_cnpj]': hotelCnpj,
        '[wifi_password]': hotelWifi,
        '[senha-wifi]': hotelWifi,
        '[wifi_network]': hotelWifiNetwork,
        '[rede-wifi]': hotelWifiNetwork,
        '[nome-rede-wifi]': hotelWifiNetwork,

        // ============================================
        // MANUTENÇÃO / MAINTENANCE (português + inglês)
        // ============================================
        '[titulo-manutencao]': eventData.tituloManutencao || '',
        '[maintenance_title]': eventData.tituloManutencao || '',
        '[local-manutencao]': eventData.localManutencao || '',
        '[maintenance_location]': eventData.localManutencao || '',
        '[equipamento]': eventData.equipamento || '',
        '[equipment]': eventData.equipamento || '',
        '[maintenance_equipment]': eventData.equipamento || '',
        '[prioridade-manutencao]': eventData.prioridadeManutencao || '',
        '[maintenance_priority]': eventData.prioridadeManutencao || '',
        '[tipo-manutencao]': eventData.tipoManutencao || '',
        '[maintenance_type]': eventData.tipoManutencao || '',
        '[descricao-manutencao]': eventData.descricaoManutencao || '',
        '[maintenance_description]': eventData.descricaoManutencao || '',
        '[data-prevista-manutencao]': eventData.dataPrevista || '',
        '[maintenance_due_date]': eventData.dataPrevista || '',
        '[responsavel-manutencao]': eventData.responsavel || '',
        '[maintenance_assigned_to]': eventData.responsavel || '',

        // ============================================
        // TAREFA / TASK (português + inglês)
        // ============================================
        '[task-id]': (eventData.taskId ?? eventData.task?.id ?? '').toString(),
        '[task_id]': (eventData.taskId ?? eventData.task?.id ?? '').toString(),
        '[task-type]': eventData.type ?? eventData.task?.type ?? '',
        '[task_type]': eventData.type ?? eventData.task?.type ?? '',
        '[task-category]': eventData.category ?? eventData.task?.category ?? '',
        '[task_category]': eventData.category ?? eventData.task?.category ?? '',
        '[task-description]': eventData.description ?? eventData.task?.description ?? '',
        '[task_description]': eventData.description ?? eventData.task?.description ?? '',
        '[task-priority]': eventData.priority ?? eventData.task?.priority ?? '',
        '[task_priority]': eventData.priority ?? eventData.task?.priority ?? '',
        '[task-unit-id]': (eventData.unitId ?? eventData.task?.unitId ?? '').toString(),
        '[task_unit_id]': (eventData.unitId ?? eventData.task?.unitId ?? '').toString(),
        '[task-estimated-time]': eventData.estimatedTime ?? eventData.task?.estimatedTime ?? '',
        '[task_estimated_time]': eventData.estimatedTime ?? eventData.task?.estimatedTime ?? '',
        '[task-scheduled-at]': eventData.scheduledAt ?? eventData.task?.scheduledAt ?? '',
        '[task_scheduled_at]': eventData.scheduledAt ?? eventData.task?.scheduledAt ?? '',
        '[task-notes]': eventData.notes ?? eventData.task?.notes ?? '',
        '[task_notes]': eventData.notes ?? eventData.task?.notes ?? '',

        // ============================================
        // TRANSAÇÃO / TRANSACTION (português + inglês)
        // ============================================
        '[transaction-id]': (eventData.transactionId ?? eventData.transaction?.id ?? '').toString(),
        '[transaction_id]': (eventData.transactionId ?? eventData.transaction?.id ?? '').toString(),
        '[transaction-type]': eventData.type ?? eventData.transaction?.type ?? '',
        '[transaction_type]': eventData.type ?? eventData.transaction?.type ?? '',
        '[transaction-category]': eventData.categoryName ?? eventData.transaction?.categoryName ?? '',
        '[transaction_category]': eventData.categoryName ?? eventData.transaction?.categoryName ?? '',
        '[transaction-amount]': (eventData.amount ?? eventData.transaction?.amount ?? '').toString(),
        '[transaction_amount]': (eventData.amount ?? eventData.transaction?.amount ?? '').toString(),
        '[transaction-description]': eventData.transaction?.description ?? '',
        '[transaction_description]': eventData.transaction?.description ?? '',
        '[transaction-number]': eventData.transaction?.transactionNumber ?? '',
        '[transaction_number]': eventData.transaction?.transactionNumber ?? '',

        // ============================================
        // PEDIDO DE COMPRA / PURCHASE ORDER
        // ============================================
        '[protocolo-pedido]': eventData.orderNumber || eventData.protocol || '',
        '[order_number]': eventData.orderNumber || eventData.protocol || '',
        '[fornecedor]': eventData.supplierName || '',
        '[supplier_name]': eventData.supplierName || '',
        '[valor-pedido]': eventData.totalAmount || eventData.total?.toString() || '',
        '[order_amount]': eventData.totalAmount || eventData.total?.toString() || '',
        '[propriedade-pedido]': eventData.propertyName || '',
        '[order_property]': eventData.propertyName || '',
        '[data-entrega-pedido]': eventData.expectedDeliveryDate || '',
        '[delivery_date]': eventData.expectedDeliveryDate || '',
      };

      // Buscar e processar template se especificado
      if (config.template_id) {
        console.log('[WorkflowService.executeSendEmail] Buscando template de e-mail:', {
          templateId: config.template_id,
        });
        
        try {
          const templateQuery = `
            SELECT content_html, subject
            FROM email_templates
            WHERE id = ? AND is_active = TRUE
          `;

          const templates = await queryRunner.query(templateQuery, [config.template_id]);
          console.log('[WorkflowService.executeSendEmail] Template buscado:', {
            found: templates.length > 0,
            templateCount: templates.length,
          });

          if (templates.length > 0) {
            const template = templates[0];
            emailHtml = template.content_html || template.body_html || '';
            emailSubject = template.subject || config.subject || emailSubject;
            console.log('[WorkflowService.executeSendEmail] Template carregado:', {
              hasHtml: !!emailHtml,
              htmlLength: emailHtml.length,
              subject: emailSubject,
            });
          } else {
            console.warn('[WorkflowService.executeSendEmail] AVISO: Template não encontrado ou inativo!', {
              templateId: config.template_id,
            });
          }
        } catch (error: any) {
          console.error('[WorkflowService.executeSendEmail] ERRO ao buscar template:', {
            templateId: config.template_id,
            error: error.message,
            stack: error.stack,
          });
        }
      } else {
        console.log('[WorkflowService.executeSendEmail] Nenhum template especificado, usando HTML personalizado');
      }
      
      // Substituir variáveis no HTML (tanto para templates quanto para HTML personalizado)
      Object.keys(variableMap).forEach((variable) => {
        const regex = new RegExp(variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const value = variableMap[variable];
        emailHtml = emailHtml.replace(regex, value);
        emailSubject = emailSubject.replace(regex, value);
      });
      
      // Log para debug
      console.log('[WorkflowService.executeSendEmail] Variáveis substituídas:', {
        propertyId: propertyId,
        companyName: companyInfo.name || 'N/A',
        hasCompanyInfo: !!companyInfo.name,
        emailConfigFromName: emailConfigInfo.fromName || 'N/A',
        clienteName: eventData.firstName || 'N/A',
      });

      // Se não tem destinatário na config, usar o e-mail do hóspede (já normalizado em eventData: eventData.guest.email quando gatilho é reserva)
      if (!emailTo && eventData.email) {
        console.log('[WorkflowService.executeSendEmail] Destinatário não definido na config, usando e-mail do hóspede (eventData.email)');
        emailTo = eventData.email;
      }

      console.log('[WorkflowService.executeSendEmail] Validando destinatário...', {
        emailTo: emailTo || '(não definido)',
        hasEmailTo: !!emailTo,
      });

      if (!emailTo) {
        const errorMsg = 'Destinatário do e-mail não especificado';
        console.error('[WorkflowService.executeSendEmail] ERRO FATAL:', errorMsg);
        throw new Error(errorMsg);
      }

      // Usar EmailService que busca a configuração do banco de dados
      // Isso garante que sempre use a mesma configuração da tela de Configuração de E-mail
      console.log('[WorkflowService.executeSendEmail] Chamando EmailService.sendEmail...', {
        to: emailTo,
        subject: emailSubject.substring(0, 50) + (emailSubject.length > 50 ? '...' : ''),
        htmlLength: emailHtml.length,
        propertyId,
      });

      try {
        await EmailService.sendEmail(
          emailTo,
          emailSubject,
          emailHtml,
          emailSubject, // text version (mesmo conteúdo)
          propertyId
        );
        
        console.log('[WorkflowService.executeSendEmail] ✅ E-mail enviado com sucesso!', {
          to: emailTo,
          subject: emailSubject.substring(0, 50),
        });
      } catch (emailError: any) {
        console.error('[WorkflowService.executeSendEmail] ❌ ERRO ao enviar e-mail:', {
          to: emailTo,
          error: emailError.message,
          stack: emailError.stack,
          statusCode: emailError.statusCode || emailError.status,
        });
        throw emailError; // Re-lançar para que o erro seja tratado no executeAction
      }
    } catch (error: any) {
      console.error('[WorkflowService.executeSendEmail] ❌ ERRO GERAL na execução:', {
        error: error.message,
        stack: error.stack,
        propertyId,
      });
      throw error;
    } finally {
      console.log('[WorkflowService.executeSendEmail] Liberando QueryRunner...');
      await queryRunner.release();
      console.log('[WorkflowService.executeSendEmail] ===== FIM da execução de envio de e-mail =====');
    }
  }

  /**
   * Obtém estatísticas dos workflows (para o modal de status)
   * Nota: Mantido para compatibilidade, mas agora o método correto é getWorkflowStatus
   */
  static async getWorkflowStats(propertyId?: number | null): Promise<any> {
    return this.getWorkflowStatus(propertyId);
  }

  /**
   * Obtém status e estatísticas completas dos workflows (novo schema: workflows sem uuid/property_id/deleted_at)
   */
  static async getWorkflowStatus(_propertyId?: number | null): Promise<any> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active,
          SUM(execution_count) as totalExecutions
        FROM workflows
      `;

      const results = await queryRunner.query(query);
      const stats = results[0];

      // Buscar execuções recentes com problemas (novo schema: workflow_executions sem uuid, coluna STATUS)
      let failedExecutions: any[] = [];
      try {
        const executionsQuery = `
          SELECT 
            we.id, we.workflow_id as workflowId,
            we.STATUS as executionStatus, we.error_message as errorMessage,
            we.started_at as startedAt, we.completed_at as completedAt,
            w.NAME as workflowName
          FROM workflow_executions we
          INNER JOIN workflows w ON w.id = we.workflow_id
          WHERE we.STATUS IN ('failed', 'cancelled')
            AND we.started_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
          ORDER BY we.started_at DESC LIMIT 10
        `;
        failedExecutions = await queryRunner.query(executionsQuery);
      } catch {
        // tabela pode não existir ainda
      }

      return {
        total: parseInt(stats.total) || 0,
        active: parseInt(stats.active) || 0,
        paused: parseInt(stats.total) - parseInt(stats.active) || 0,
        draft: 0,
        totalExecutions: parseInt(stats.totalExecutions) || 0,
        totalSuccess: 0,
        totalFailures: 0,
        failedExecutions: failedExecutions.map((row: any) => ({
          id: row.id,
          workflowId: row.workflowId,
          workflowName: row.workflowName,
          executionStatus: row.executionStatus,
          errorMessage: row.errorMessage,
          startedAt: row.startedAt,
          completedAt: row.completedAt,
        })),
      };
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Executa ação de adicionar pontos de fidelidade
   */
  private static async executeAddPoints(action: any, triggerData: TriggerData): Promise<void> {
    const config = action.config || {};
    const points = config.points || 0;
    const guestId = triggerData.eventData.guestId || triggerData.eventData.id;

    if (!guestId) {
      throw new Error('ID do hóspede não encontrado nos dados do evento');
    }

    if (points <= 0) {
      throw new Error('Pontos inválidos');
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();
      const updateQuery = `
        UPDATE guests
        SET loyalty_points = loyalty_points + ?,
            updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
      `;

      await queryRunner.query(updateQuery, [points, guestId]);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Executa ação de webhook
   */
  private static async executeWebhook(action: any, triggerData: TriggerData): Promise<void> {
    const config = action.config || {};
    const url = config.url;

    if (!url) {
      throw new Error('URL do webhook não especificada');
    }

    const axios = require('axios');
    const headers = config.headers || {};
    const timeout = config.timeout || 5000;

    await axios.post(url, triggerData.eventData, {
      headers,
      timeout,
    });
  }

  /**
   * Executa ação de criar transação financeira (receita ou despesa).
   * Usado pelos workflows financeiros de reserva (valor pago, comissão).
   */
  private static async executeCreateTransaction(
    action: any,
    triggerData: TriggerData,
    propertyId?: number | null
  ): Promise<void> {
    const config = action.config || {};
    const raw = triggerData.eventData || {};
    const reservation = raw.reservation;

    const type = (config.type || 'income') as 'income' | 'expense';
    const amount = Number(raw.amount ?? config.amount ?? 0);
    const categoryKey = (config.category || (type === 'income' ? 'hospedagem' : 'comissao')) as string;
    const nameMap: Record<string, string> = {
      hospedagem: 'Hospedagem',
      aluguel: 'Aluguel Long Stay',
      comissao: 'Comissão',
      extras: 'Extras/Consumos',
      servicos: 'Serviços',
      operacional: 'Operacional',
      manutencao: 'Manutenção',
      outros: 'Outros',
    };
    const lookupName = nameMap[categoryKey] ?? (type === 'income' ? 'Hospedagem' : 'Comissão');

    let description = config.description || (raw.description as string) || '';
    const reservationNumber = reservation?.reservationNumber ?? raw.reservationNumber ?? '';
    const agencyName = reservation?.agencyName ?? raw.agencyName ?? '';
    description = description.replace(/\[numero-reserva\]/g, reservationNumber).replace(/\[agencia\]/g, agencyName);
    const notes = config.notes || '';
    const reservationId = reservation?.id ?? raw.reservationId ?? null;
    const propId = propertyId ?? reservation?.propertyId ?? raw.propertyId ?? null;
    const userId = raw.userId ?? raw.createdBy ?? null;
    const currency = reservation?.currency ?? raw.currency ?? 'BRL';

    if (amount <= 0) {
      console.warn('[WorkflowService.executeCreateTransaction] Valor inválido ou zero, ignorando.');
      return;
    }

    const fcRepo = AppDataSource.getRepository(FinancialCategory);
    const financialCat = await fcRepo.findOne({ where: { type: type as any, name: lookupName, deletedAt: IsNull() } });
    const fallbackCat = await fcRepo.findOne({ where: { type: type as any, name: 'Outros', deletedAt: IsNull() } });
    const finalCategoryId = financialCat?.id ?? fallbackCat?.id ?? null;

    const transactionRepository = AppDataSource.getRepository(Transaction);
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await transactionRepository.count();
    const prefix = type === 'income' ? 'INC' : 'EXP';
    const transactionNumber = `${prefix}-${year}${month}-${String(count + 1).padStart(5, '0')}`;

    // Comissão (expense): pendente - usuário confirma pagamento na tela financeira
    // Valor pago (income): concluído - dinheiro já recebido
    const isCommission = type === 'expense';
    const status = isCommission ? TransactionStatus.PENDING : TransactionStatus.COMPLETED;
    const paymentDate = isCommission ? null : new Date();

    const tx = transactionRepository.create({
      uuid: uuidv4(),
      transactionNumber,
      type: type === 'income' ? TransactionType.INCOME : TransactionType.EXPENSE,
      financialCategoryId: finalCategoryId,
      description: description || `${type === 'income' ? 'Receita' : 'Despesa'} - Reserva ${reservation?.reservationNumber ?? ''}`,
      amount,
      currency,
      status,
      paymentMethodId: null,
      paymentDate,
      dueDate: reservation?.checkIn ?? reservation?.depositDueDate ?? null,
      reservationId,
      propertyId: propId,
      createdBy: userId,
      notes: notes || (type === 'income' ? `Pagamento - Reserva ${reservation?.reservationNumber ?? ''}` : `Comissão - Reserva ${reservation?.reservationNumber ?? ''}`),
    });

    await transactionRepository.save(tx);
    console.log(`[WorkflowService.executeCreateTransaction] ✅ Transação criada: ${transactionNumber} R$ ${amount}`);
  }

  /**
   * Executa ação de mapear conta contábil (plano de contas) para uma transação.
   * Config: { chart_account_id: number } ou { chart_account_code: "3.01.001" }
   */
  private static async executeMapChartAccount(action: any, triggerData: TriggerData): Promise<void> {
    const config = action.config || {};
    const raw = triggerData.eventData || {};
    const transactionId = raw.transactionId ?? raw.transaction?.id;

    if (!transactionId) {
      console.warn('[WorkflowService.executeMapChartAccount] transactionId não encontrado no eventData, ignorando.');
      return;
    }

    let chartAccountId: number | null = null;

    // Opção 1: chart_account_id direto (número)
    if (config.chart_account_id) {
      chartAccountId = Number(config.chart_account_id);
    }
    // Opção 2: chart_account_code (ex: "3.01.001") - buscar no banco
    else if (config.chart_account_code) {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      try {
        const rows = await queryRunner.query(
          'SELECT id FROM chart_of_accounts WHERE code = ? AND deleted_at IS NULL AND is_active = TRUE LIMIT 1',
          [config.chart_account_code]
        );
        if (rows.length > 0) {
          chartAccountId = rows[0].id;
        } else {
          console.warn(`[WorkflowService.executeMapChartAccount] Conta ${config.chart_account_code} não encontrada no plano de contas.`);
        }
      } finally {
        await queryRunner.release();
      }
    }

    if (!chartAccountId) {
      console.warn('[WorkflowService.executeMapChartAccount] chart_account_id ou chart_account_code não configurado, ignorando.');
      return;
    }

    // Atualizar transaction com chart_of_account_id
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.query(
        'UPDATE transactions SET chart_of_account_id = ?, updated_at = NOW() WHERE id = ?',
        [chartAccountId, transactionId]
      );
      console.log(`[WorkflowService.executeMapChartAccount] ✅ Transação ${transactionId} mapeada para conta contábil ${chartAccountId}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Executa ação de delay (aguarda tempo)
   */
  private static async executeDelay(action: any): Promise<void> {
    const config = action.config || {};
    const duration = config.duration || 0;
    const unit = config.unit || 'seconds'; // seconds, minutes, hours

    let milliseconds = duration * 1000; // default seconds

    switch (unit) {
      case 'minutes':
        milliseconds = duration * 60 * 1000;
        break;
      case 'hours':
        milliseconds = duration * 60 * 60 * 1000;
        break;
    }

    // Limitar delay máximo a 5 minutos para evitar bloqueios longos
    if (milliseconds > 5 * 60 * 1000) {
      milliseconds = 5 * 60 * 1000;
    }

    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

}
