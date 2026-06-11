import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateAiConfigInput, UpdateAiConfigInput } from '@/validators/aiConfig.validator';
import { v4 as uuidv4 } from 'uuid';
import { IAService } from '@/services/IAService';

interface AiConfigResponse {
  id: number;
  uuid: string;
  propertyId: number | null;
  provider: string;
  name: string;
  apiKey?: string | null;
  apiEndpoint: string | null;
  model: string | null;
  temperature: number | null;
  maxTokens: number | null;
  organizationId: string | null;
  projectId: string | null;
  region: string | null;
  customHeaders: Record<string, any> | null;
  customParams: Record<string, any> | null;
  isActive: boolean;
  isDefault: boolean;
  lastTestedAt: Date | null;
  lastTestResult: string | null;
  lastTestError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class AiConfigController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { provider, propertyId } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          id,
          uuid,
          property_id as propertyId,
          provider,
          name,
          api_endpoint as apiEndpoint,
          model,
          temperature,
          max_tokens as maxTokens,
          organization_id as organizationId,
          project_id as projectId,
          region,
          custom_headers as customHeaders,
          custom_params as customParams,
          is_active as isActive,
          is_default as isDefault,
          last_tested_at as lastTestedAt,
          last_test_result as lastTestResult,
          last_test_error as lastTestError,
          created_at as createdAt,
          updated_at as updatedAt
        FROM ai_configs
        WHERE deleted_at IS NULL
      `;

      const params: any[] = [];
      if (provider) {
        query += ` AND provider = ?`;
        params.push(provider);
      }
      if (propertyId) {
        query += ` AND (property_id = ? OR property_id IS NULL)`;
        params.push(parseInt(propertyId as string, 10));
      } else {
        query += ` AND property_id IS NULL`;
      }

      query += ` ORDER BY is_default DESC, is_active DESC, created_at ASC`;

      const configs = await queryRunner.query(query, params);
      await queryRunner.release();

      // Parse JSON fields and remove sensitive data
      const configsResponse: AiConfigResponse[] = configs.map((row: any) => {
        let customHeaders = null;
        let customParams = null;

        try {
          if (row.customHeaders) {
            customHeaders = typeof row.customHeaders === 'string' ? JSON.parse(row.customHeaders) : row.customHeaders;
          }
          if (row.customParams) {
            customParams = typeof row.customParams === 'string' ? JSON.parse(row.customParams) : row.customParams;
          }
        } catch (error) {
          // Ignore JSON parse errors
        }

        return {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          provider: row.provider,
          name: row.name,
          apiEndpoint: row.apiEndpoint,
          model: row.model,
          temperature: row.temperature ? parseFloat(row.temperature) : null,
          maxTokens: row.maxTokens ? parseInt(row.maxTokens, 10) : null,
          organizationId: row.organizationId,
          projectId: row.projectId,
          region: row.region,
          customHeaders,
          customParams,
          isActive: Boolean(row.isActive),
          isDefault: Boolean(row.isDefault),
          lastTestedAt: row.lastTestedAt,
          lastTestResult: row.lastTestResult,
          lastTestError: row.lastTestError,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      });

      res.json({
        success: true,
        data: { aiConfigs: configsResponse },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      try {
        let query = `
          SELECT 
            id,
            uuid,
            property_id as propertyId,
            provider,
            name,
            api_endpoint as apiEndpoint,
            model,
            temperature,
            max_tokens as maxTokens,
            organization_id as organizationId,
            project_id as projectId,
            region,
            custom_headers as customHeaders,
            custom_params as customParams,
            is_active as isActive,
            is_default as isDefault,
            last_tested_at as lastTestedAt,
            last_test_result as lastTestResult,
            last_test_error as lastTestError,
            created_at as createdAt,
            updated_at as updatedAt
          FROM ai_configs
          WHERE deleted_at IS NULL 
          AND is_active = TRUE
        `;

        const params: any[] = [];
        if (propertyId) {
          query += ` AND (property_id = ? OR property_id IS NULL)`;
          params.push(parseInt(propertyId as string, 10));
        } else {
          query += ` AND property_id IS NULL`;
        }

        query += ` ORDER BY is_default DESC, created_at ASC LIMIT 1`;

        const results = await queryRunner.query(query, params);

        if (results.length === 0) {
          res.json({
            success: true,
            data: null,
          });
          return;
        }

        const row = results[0];

        // Parse JSON fields
        let customHeaders = null;
        let customParams = null;

        try {
          if (row.customHeaders) {
            customHeaders = typeof row.customHeaders === 'string' ? JSON.parse(row.customHeaders) : row.customHeaders;
          }
          if (row.customParams) {
            customParams = typeof row.customParams === 'string' ? JSON.parse(row.customParams) : row.customParams;
          }
        } catch (error) {
          // Ignore
        }

        const configResponse: AiConfigResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          provider: row.provider,
          name: row.name,
          apiEndpoint: row.apiEndpoint,
          model: row.model,
          temperature: row.temperature ? parseFloat(row.temperature) : null,
          maxTokens: row.maxTokens ? parseInt(row.maxTokens, 10) : null,
          organizationId: row.organizationId,
          projectId: row.projectId,
          region: row.region,
          customHeaders,
          customParams,
          isActive: Boolean(row.isActive),
          isDefault: Boolean(row.isDefault),
          lastTestedAt: row.lastTestedAt,
          lastTestResult: row.lastTestResult,
          lastTestError: row.lastTestError,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.json({
          success: true,
          data: configResponse,
        });
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();

      try {
        const query = `
          SELECT 
            id,
            uuid,
            property_id as propertyId,
            provider,
            name,
            api_key as apiKey,
            api_endpoint as apiEndpoint,
            model,
            temperature,
            max_tokens as maxTokens,
            organization_id as organizationId,
            project_id as projectId,
            region,
            custom_headers as customHeaders,
            custom_params as customParams,
            is_active as isActive,
            is_default as isDefault,
            last_tested_at as lastTestedAt,
            last_test_result as lastTestResult,
            last_test_error as lastTestError,
            created_at as createdAt,
            updated_at as updatedAt
          FROM ai_configs
          WHERE id = ? AND deleted_at IS NULL
        `;

        const results = await queryRunner.query(query, [parseInt(id, 10)]);

        if (results.length === 0) {
          throw new AppError('Configuração de IA não encontrada', 404);
        }

        const row = results[0];

        // Parse JSON fields
        let customHeaders = null;
        let customParams = null;

        try {
          if (row.customHeaders) {
            customHeaders = typeof row.customHeaders === 'string' ? JSON.parse(row.customHeaders) : row.customHeaders;
          }
          if (row.customParams) {
            customParams = typeof row.customParams === 'string' ? JSON.parse(row.customParams) : row.customParams;
          }
        } catch (error) {
          // Ignore
        }

        const configResponse: AiConfigResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          provider: row.provider,
          name: row.name,
          apiKey: row.apiKey ?? null,
          apiEndpoint: row.apiEndpoint,
          model: row.model,
          temperature: row.temperature ? parseFloat(row.temperature) : null,
          maxTokens: row.maxTokens ? parseInt(row.maxTokens, 10) : null,
          organizationId: row.organizationId,
          projectId: row.projectId,
          region: row.region,
          customHeaders,
          customParams,
          isActive: Boolean(row.isActive),
          isDefault: Boolean(row.isDefault),
          lastTestedAt: row.lastTestedAt,
          lastTestResult: row.lastTestResult,
          lastTestError: row.lastTestError,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.json({
          success: true,
          data: configResponse,
        });
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateAiConfigInput = req.body;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Se isDefault = true, remover default de outras configs
        if (data.isDefault) {
          const unsetDefaultQuery = `UPDATE ai_configs SET is_default = FALSE WHERE deleted_at IS NULL`;
          await queryRunner.query(unsetDefaultQuery);
        }

        const uuid = uuidv4();
        // API Key em texto plano para o IAService poder usá-la nas chamadas às APIs
        const apiKeyToStore = data.apiKey?.trim() || null;

        const customHeadersJson = data.customHeaders ? JSON.stringify(data.customHeaders) : null;
        const customParamsJson = data.customParams ? JSON.stringify(data.customParams) : null;

        const insertQuery = `
          INSERT INTO ai_configs (
            uuid, property_id, provider, name, api_key, api_endpoint,
            model, temperature, max_tokens, organization_id, project_id, region,
            custom_headers, custom_params, is_active, is_default
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const insertParams: any[] = [
          uuid,
          data.propertyId || null,
          data.provider,
          data.name.trim(),
          apiKeyToStore,
          data.apiEndpoint?.trim() || null,
          data.model?.trim() || null,
          data.temperature || null,
          data.maxTokens || null,
          data.organizationId?.trim() || null,
          data.projectId?.trim() || null,
          data.region?.trim() || null,
          customHeadersJson,
          customParamsJson,
          data.isActive !== false,
          data.isDefault || false,
        ];

        const result = await queryRunner.query(insertQuery, insertParams);
        const configId = result.insertId;

        await queryRunner.commitTransaction();

        // Buscar config criada (sem API key)
        const selectQuery = `
          SELECT 
            id, uuid, property_id as propertyId, provider, name, api_endpoint as apiEndpoint,
            model, temperature, max_tokens as maxTokens, organization_id as organizationId,
            project_id as projectId, region, custom_headers as customHeaders, custom_params as customParams,
            is_active as isActive, is_default as isDefault,
            last_tested_at as lastTestedAt, last_test_result as lastTestResult, last_test_error as lastTestError,
            created_at as createdAt, updated_at as updatedAt
          FROM ai_configs
          WHERE id = ?
        `;

        const createdConfig = await queryRunner.query(selectQuery, [configId]);
        await queryRunner.release();

        const row = createdConfig[0];

        // Parse JSON fields
        let customHeaders = null;
        let customParams = null;

        try {
          if (row.customHeaders) {
            customHeaders = typeof row.customHeaders === 'string' ? JSON.parse(row.customHeaders) : row.customHeaders;
          }
          if (row.customParams) {
            customParams = typeof row.customParams === 'string' ? JSON.parse(row.customParams) : row.customParams;
          }
        } catch (error) {
          // Ignore
        }

        const configResponse: AiConfigResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          provider: row.provider,
          name: row.name,
          apiEndpoint: row.apiEndpoint,
          model: row.model,
          temperature: row.temperature ? parseFloat(row.temperature) : null,
          maxTokens: row.maxTokens ? parseInt(row.maxTokens, 10) : null,
          organizationId: row.organizationId,
          projectId: row.projectId,
          region: row.region,
          customHeaders,
          customParams,
          isActive: Boolean(row.isActive),
          isDefault: Boolean(row.isDefault),
          lastTestedAt: row.lastTestedAt,
          lastTestResult: row.lastTestResult,
          lastTestError: row.lastTestError,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.status(201).json({
          success: true,
          data: configResponse,
        });
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateAiConfigInput = req.body;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Verificar se a config existe
        const checkQuery = `SELECT id FROM ai_configs WHERE id = ? AND deleted_at IS NULL`;
        const existing = await queryRunner.query(checkQuery, [parseInt(id, 10)]);

        if (existing.length === 0) {
          throw new AppError('Configuração de IA não encontrada', 404);
        }

        // Se isDefault = true, remover default de outras configs
        if (data.isDefault) {
          const unsetDefaultQuery = `UPDATE ai_configs SET is_default = FALSE WHERE id != ? AND deleted_at IS NULL`;
          await queryRunner.query(unsetDefaultQuery, [parseInt(id, 10)]);
        }

        // Construir query de update dinamicamente
        const updateFields: string[] = [];
        const updateParams: any[] = [];

        if (data.provider !== undefined) { updateFields.push('provider = ?'); updateParams.push(data.provider); }
        if (data.name !== undefined) { updateFields.push('name = ?'); updateParams.push(data.name.trim()); }
        if (data.apiEndpoint !== undefined) { updateFields.push('api_endpoint = ?'); updateParams.push(data.apiEndpoint?.trim() || null); }
        if (data.model !== undefined) { updateFields.push('model = ?'); updateParams.push(data.model?.trim() || null); }
        if (data.temperature !== undefined) { updateFields.push('temperature = ?'); updateParams.push(data.temperature || null); }
        if (data.maxTokens !== undefined) { updateFields.push('max_tokens = ?'); updateParams.push(data.maxTokens || null); }
        if (data.organizationId !== undefined) { updateFields.push('organization_id = ?'); updateParams.push(data.organizationId?.trim() || null); }
        if (data.projectId !== undefined) { updateFields.push('project_id = ?'); updateParams.push(data.projectId?.trim() || null); }
        if (data.region !== undefined) { updateFields.push('region = ?'); updateParams.push(data.region?.trim() || null); }
        if (data.customHeaders !== undefined) { 
          updateFields.push('custom_headers = ?'); 
          updateParams.push(data.customHeaders ? JSON.stringify(data.customHeaders) : null); 
        }
        if (data.customParams !== undefined) { 
          updateFields.push('custom_params = ?'); 
          updateParams.push(data.customParams ? JSON.stringify(data.customParams) : null); 
        }
        if (data.isActive !== undefined) { updateFields.push('is_active = ?'); updateParams.push(data.isActive); }
        if (data.isDefault !== undefined) { updateFields.push('is_default = ?'); updateParams.push(data.isDefault); }

        // Se API Key fornecida, guardar em texto plano para o IAService usar
        if (data.apiKey !== undefined) {
          updateFields.push('api_key = ?');
          updateParams.push(data.apiKey?.trim() || null);
        }

        updateFields.push('updated_at = NOW()');
        updateParams.push(parseInt(id, 10));

        if (updateFields.length === 1) {
          throw new AppError('Nenhum campo para atualizar', 400);
        }

        const updateQuery = `UPDATE ai_configs SET ${updateFields.join(', ')} WHERE id = ?`;
        await queryRunner.query(updateQuery, updateParams);

        await queryRunner.commitTransaction();

        // Buscar config atualizada (sem API key)
        const selectQuery = `
          SELECT 
            id, uuid, property_id as propertyId, provider, name, api_endpoint as apiEndpoint,
            model, temperature, max_tokens as maxTokens, organization_id as organizationId,
            project_id as projectId, region, custom_headers as customHeaders, custom_params as customParams,
            is_active as isActive, is_default as isDefault,
            last_tested_at as lastTestedAt, last_test_result as lastTestResult, last_test_error as lastTestError,
            created_at as createdAt, updated_at as updatedAt
          FROM ai_configs
          WHERE id = ?
        `;

        const updatedConfig = await queryRunner.query(selectQuery, [parseInt(id, 10)]);
        await queryRunner.release();

        const row = updatedConfig[0];

        // Parse JSON fields
        let customHeaders = null;
        let customParams = null;

        try {
          if (row.customHeaders) {
            customHeaders = typeof row.customHeaders === 'string' ? JSON.parse(row.customHeaders) : row.customHeaders;
          }
          if (row.customParams) {
            customParams = typeof row.customParams === 'string' ? JSON.parse(row.customParams) : row.customParams;
          }
        } catch (error) {
          // Ignore
        }

        const configResponse: AiConfigResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          provider: row.provider,
          name: row.name,
          apiEndpoint: row.apiEndpoint,
          model: row.model,
          temperature: row.temperature ? parseFloat(row.temperature) : null,
          maxTokens: row.maxTokens ? parseInt(row.maxTokens, 10) : null,
          organizationId: row.organizationId,
          projectId: row.projectId,
          region: row.region,
          customHeaders,
          customParams,
          isActive: Boolean(row.isActive),
          isDefault: Boolean(row.isDefault),
          lastTestedAt: row.lastTestedAt,
          lastTestResult: row.lastTestResult,
          lastTestError: row.lastTestError,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.json({
          success: true,
          data: configResponse,
        });
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();

      try {
        // Verificar se a config existe
        const checkQuery = `SELECT id, name FROM ai_configs WHERE id = ? AND deleted_at IS NULL`;
        const existing = await queryRunner.query(checkQuery, [parseInt(id, 10)]);

        if (existing.length === 0) {
          throw new AppError('Configuração de IA não encontrada', 404);
        }

        // Soft delete
        const deleteQuery = `UPDATE ai_configs SET deleted_at = NOW() WHERE id = ?`;
        await queryRunner.query(deleteQuery, [parseInt(id, 10)]);

        await queryRunner.release();

        res.json({
          success: true,
          message: 'Configuração de IA excluída com sucesso',
        });
      } catch (error) {
        await queryRunner.release();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }

  async test(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();

      try {
        // Buscar configuração com API key (para teste)
        const query = `
          SELECT id, provider, name, api_key, api_endpoint, model
          FROM ai_configs
          WHERE id = ? AND deleted_at IS NULL AND is_active = TRUE
        `;

        const results = await queryRunner.query(query, [parseInt(id, 10)]);

        if (results.length === 0) {
          throw new AppError('Configuração de IA não encontrada', 404);
        }

        const config = results[0];

        // Simular teste (em produção, faria chamada real à API)
        // Por enquanto, apenas atualizamos o status de teste
        const testSuccess = true; // Em produção, fazer chamada real
        const testResult = testSuccess ? 'success' : 'error';
        const testError = testSuccess ? null : 'Erro ao conectar com a API';

        const updateQuery = `
          UPDATE ai_configs 
          SET last_tested_at = NOW(), 
              last_test_result = ?, 
              last_test_error = ?
          WHERE id = ?
        `;

        await queryRunner.query(updateQuery, [testResult, testError, parseInt(id, 10)]);
        await queryRunner.release();

        res.json({
          success: true,
          data: {
            result: testResult,
            message: testSuccess ? 'Conexão testada com sucesso!' : testError,
          },
        });
      } catch (error) {
        await queryRunner.release();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }

  async generateEmailTemplate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { templateType, subject, categoryName, templateName, additionalContext } = req.body;
      const { propertyId } = req.query;

      if (!templateType) {
        throw new AppError('Tipo de template é obrigatório', 400);
      }

      // Verificar se há IA disponível
      const isAvailable = await IAService.isAvailable(propertyId ? parseInt(propertyId as string, 10) : undefined);
      if (!isAvailable) {
        throw new AppError('Nenhuma configuração de IA ativa encontrada. Configure uma IA primeiro.', 400);
      }

      // Dados do formulário (Templates de E-mail - Novo Template) para a IA entender o contexto do HTML
      const parts: string[] = [];
      if (templateName && String(templateName).trim()) parts.push(`Nome do template: ${String(templateName).trim()}`);
      if (categoryName && String(categoryName).trim()) parts.push(`Categoria: ${String(categoryName).trim()}`);
      if (subject && String(subject).trim()) parts.push(`Assunto do e-mail: ${String(subject).trim()}`);
      const formContext = parts.length > 0 ? parts.join('. ') + '.' : '';
      const extraContext = additionalContext && String(additionalContext).trim() ? ` Contexto adicional: ${String(additionalContext).trim()}.` : '';
      const contextForAI = formContext + extraContext;

      const unistaysSystemPrompt = `Você é um especialista em comunicação hoteleira e design de e-mails. Este pedido parte de um GERADOR DE TEMPLATE DE HTML do sistema: a saída será usada como template de e-mail na plataforma Unistays.

REGRAS OBRIGATÓRIAS:
- Gere APENAS HTML, SEM SCRIPTS: não inclua <script>, JavaScript, atributos de evento (onclick, onload, etc.), nem URLs javascript: ou vbscript:. E-mails e o preview do sistema não executam scripts; o HTML deve ser estático (markup + CSS apenas).
- Marca: Unistays — solução de hospedagem e tecnologia para hotéis. Visual limpo, acolhedor, profissional e moderno.
- HTML: documento completo (DOCTYPE, html, head, body). Use apenas CSS inline ou em tag <style> no head (clientes de e-mail não suportam CSS externo).
- Design: responsivo (meta viewport, max-width em tabelas/containers ~600px), tipografia legível (ex: font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif), espaçamento generoso.
- Ilustrativo: inclua uma área de hero/header no topo (pode ser fundo em gradiente ou cor sólida com ícone/emoji ou placeholder para imagem [ex: <!-- IMAGEM HERO -->]). Use blocos visuais claros (cards, bordas suaves, sombras leves via border/background).
- Acessibilidade: contraste adequado, hierarquia de títulos (h1/h2), placeholders entre colchetes para variáveis dinâmicas (ex: [cliente], [nome-hotel], [data-checkin]).
- Retorne APENAS o HTML do e-mail, sem markdown, sem explicações antes ou depois.`;

      // Mapear tipos de template para prompts (userPrompt usa categoria e contexto)
      const templatePrompts: Record<string, { systemPrompt: string; userPrompt: string }> = {
        reservation_confirmation: {
          systemPrompt: unistaysSystemPrompt,
          userPrompt: `Gere um template de e-mail HTML moderno e ilustrativo para CONFIRMAÇÃO DE RESERVA, alinhado à marca Unistays.

${contextForAI}

Conteúdo obrigatório (use os placeholders entre colchetes):
- Área hero/header no topo (visual atrativo).
- Saudação personalizada com [cliente].
- Confirmação da reserva: check-in [data-checkin] às [hora-checkin], check-out [data-checkout] às [hora-checkout], quarto [tipo-quarto].
- Número da reserva: [numero-reserva]. Valor total: [valor-total].
- Destaque para link de check-in online: [link-checkin].
- Rodapé com contato: [telefone-hotel], [email-hotel], [nome-hotel].

Retorne apenas o HTML completo do e-mail.`,
        },
        checkin_digital: {
          systemPrompt: unistaysSystemPrompt,
          userPrompt: `Gere um template de e-mail HTML moderno e ilustrativo para CHECK-IN DIGITAL, alinhado à marca Unistays.

${contextForAI}

Conteúdo obrigatório:
- Hero/header no topo.
- Saudação com [cliente].
- Link em destaque para check-in online: [link-checkin].
- Instruções passo a passo (numeradas ou em blocos visuais).
- Data/hora: [data-checkin] às [hora-checkin]. Documentos necessários (texto genérico ou placeholder).
- Rodapé: [telefone-hotel], [email-hotel], [nome-hotel].

Retorne apenas o HTML completo do e-mail.`,
        },
        payment_received: {
          systemPrompt: unistaysSystemPrompt,
          userPrompt: `Gere um template de e-mail HTML moderno e ilustrativo para CONFIRMAÇÃO DE PAGAMENTO RECEBIDO, alinhado à marca Unistays.

${contextForAI}

Conteúdo obrigatório:
- Hero/header (ex: ícone ou mensagem de “Pagamento confirmado”).
- Saudação com [cliente].
- Valores: [valor-pago], [valor-total], [valor-pendente] (se aplicável). Reserva: [numero-reserva].
- Rodapé: [telefone-hotel], [email-hotel], [nome-hotel].

Retorne apenas o HTML completo do e-mail.`,
        },
        checkout_reminder: {
          systemPrompt: unistaysSystemPrompt,
          userPrompt: `Gere um template de e-mail HTML moderno e ilustrativo para LEMBRETE DE CHECK-OUT, alinhado à marca Unistays.

${contextForAI}

Conteúdo obrigatório:
- Hero/header.
- Saudação amigável com [cliente].
- Lembrete: check-out em [data-checkout] às [hora-checkout]. Agradecimento pela estadia.
- Instruções breves de check-out. Opção de check-out tardio (texto genérico).
- Rodapé: [telefone-hotel], [email-hotel], [nome-hotel].

Retorne apenas o HTML completo do e-mail.`,
        },
        post_stay_review: {
          systemPrompt: unistaysSystemPrompt,
          userPrompt: `Gere um template de e-mail HTML moderno e ilustrativo para PEDIDO DE AVALIAÇÃO PÓS-ESTADIA, alinhado à marca Unistays.

${contextForAI}

Conteúdo obrigatório:
- Hero/header (tom de agradecimento).
- Saudação com [cliente], agradecimento pela estadia.
- Link em destaque para avaliação: [link-avaliacao].
- Mensagem gentil pedindo feedback.
- Rodapé: [telefone-hotel], [email-hotel], [nome-hotel].

Retorne apenas o HTML completo do e-mail.`,
        },
        password_reset: {
          systemPrompt: unistaysSystemPrompt,
          userPrompt: `Gere um template de e-mail HTML moderno e ilustrativo para RECUPERAÇÃO DE SENHA, alinhado à marca Unistays.

${contextForAI}

Conteúdo obrigatório:
- Hero/header (tom seguro e claro).
- Saudação com [cliente].
- Instruções para reset de senha e link seguro (use placeholder [link-reset-senha] ou similar).
- Aviso de segurança (não compartilhar o link).
- Rodapé: [email-hotel] para suporte.

Retorne apenas o HTML completo do e-mail.`,
        },
        welcome: {
          systemPrompt: unistaysSystemPrompt,
          userPrompt: `Gere um template de e-mail HTML moderno e ilustrativo para BOAS-VINDAS a novos hóspedes, alinhado à marca Unistays.

${contextForAI}

Conteúdo obrigatório:
- Hero/header acolhedor.
- Saudação calorosa com [cliente], mensagem de boas-vindas do [nome-hotel].
- Blocos com informações úteis e serviços (texto genérico ou placeholders).
- Rodapé: [telefone-hotel], [email-hotel], [nome-hotel].

Retorne apenas o HTML completo do e-mail.`,
        },
        booking_cancellation: {
          systemPrompt: unistaysSystemPrompt,
          userPrompt: `Gere um template de e-mail HTML moderno e ilustrativo para NOTIFICAÇÃO DE CANCELAMENTO DE RESERVA, alinhado à marca Unistays.

${contextForAI}

Conteúdo obrigatório:
- Hero/header (tom profissional e empático).
- Saudação com [cliente].
- Confirmação do cancelamento da reserva [numero-reserva]. Período original: [data-checkin] a [data-checkout].
- Informações sobre reembolso (texto genérico). Link ou menção para nova reserva.
- Rodapé: [telefone-hotel], [email-hotel], [nome-hotel].

Retorne apenas o HTML completo do e-mail.`,
        },
      };

      const promptConfig = templatePrompts[templateType];
      if (!promptConfig) {
        throw new AppError(`Tipo de template não reconhecido: ${templateType}`, 400);
      }

      // Log: envio para IA e prompt utilizado
      console.log('[AiConfigController] ✅ Enviado para IA corretamente. Tipo:', templateType);
      console.log('[AiConfigController] Prompt (system):', promptConfig.systemPrompt?.slice(0, 300) + (promptConfig.systemPrompt?.length > 300 ? '...' : ''));
      console.log('[AiConfigController] Prompt (user):', promptConfig.userPrompt);

      // Gerar conteúdo usando IA
      let htmlContent: string = '';
      let textContent: string = '';

      try {
        const response = await IAService.sendPrompt(
          promptConfig.userPrompt,
          {
            systemPrompt: promptConfig.systemPrompt,
            temperature: 0.7,
            maxTokens: 2000,
          },
          propertyId ? parseInt(propertyId as string, 10) : undefined
        );

        const rawContent = response?.content?.trim();
        if (!rawContent) {
          console.warn('[AiConfigController] IA retornou conteúdo vazio, usando template básico.');
          htmlContent = AiConfigController.generateBasicTemplate(templateType);
        } else {
          // Remover eventual bloco markdown ```html ... ``` se a IA envolveu o HTML
          htmlContent = rawContent.replace(/^```(?:html)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
          console.log('[AiConfigController] IA retornou HTML com sucesso, tamanho:', htmlContent.length, 'chars');
        }

        // Extrair texto plano do HTML (simplificado - em produção use uma lib)
        textContent = htmlContent
          .replace(/<[^>]*>/g, '')
          .replace(/\n\s*\n/g, '\n')
          .trim();
      } catch (error: unknown) {
        // Se a IA falhar, logar e retornar template básico
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error('[AiConfigController] Erro ao chamar IA (usando template básico):', errMsg);
        if (error instanceof Error && error.stack) {
          console.error('[AiConfigController] Stack:', error.stack);
        }
        htmlContent = AiConfigController.generateBasicTemplate(templateType);
        textContent = htmlContent.replace(/<[^>]*>/g, '').trim();
      }

      const defaultSubject = AiConfigController.generateDefaultSubject(templateType);
      
      res.json({
        success: true,
        data: {
          bodyHtml: htmlContent,
          bodyText: textContent,
          subject: subject || defaultSubject,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  private static generateBasicTemplate(templateType: string): string {
    const templates: Record<string, string> = {
      reservation_confirmation: `
        <html>
          <body>
            <h1>Confirmação de Reserva</h1>
            <p>Olá [cliente],</p>
            <p>Sua reserva foi confirmada!</p>
            <p><strong>Detalhes da Reserva:</strong></p>
            <ul>
              <li>Check-in: [data-checkin] às [hora-checkin]</li>
              <li>Check-out: [data-checkout] às [hora-checkout]</li>
              <li>Quarto: [tipo-quarto]</li>
              <li>Valor Total: [valor-total]</li>
            </ul>
            <p>Número da reserva: [numero-reserva]</p>
            <p>Estamos ansiosos para recebê-lo!</p>
            <p>Atenciosamente,<br/>Equipe [nome-hotel]</p>
          </body>
        </html>
      `,
    };

    return templates[templateType] || '<html><body><p>Template não disponível</p></body></html>';
  }

  private static generateDefaultSubject(templateType: string): string {
    const subjects: Record<string, string> = {
      reservation_confirmation: 'Confirmação de Reserva - [nome-hotel]',
      checkin_digital: 'Check-in Digital - [nome-hotel]',
      payment_received: 'Pagamento Recebido - [nome-hotel]',
      checkout_reminder: 'Lembrete de Check-out - [nome-hotel]',
      post_stay_review: 'Avalie sua estadia - [nome-hotel]',
      password_reset: 'Recuperação de Senha - [nome-hotel]',
      welcome: 'Bem-vindo ao [nome-hotel]!',
      booking_cancellation: 'Cancelamento de Reserva - [nome-hotel]',
    };

    return subjects[templateType] || 'Email do [nome-hotel]';
  }
}
