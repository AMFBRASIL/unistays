import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateEmailConfigInput, UpdateEmailConfigInput } from '@/validators/emailConfig.validator';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { EmailService } from '@/services/EmailService';

interface EmailConfigResponse {
  id: number;
  uuid: string;
  propertyId: number | null;
  method: string;
  provider: string | null;
  smtpServer: string | null;
  smtpPort: number | null;
  smtpSecurity: string | null;
  smtpUsername: string | null;
  smtpPassword: string | null; // Retorna apenas se solicitado
  apiKey: string | null; // Retorna apenas se solicitado
  apiDomain: string | null;
  apiDailyLimit: number | null;
  apiWebhookUrl: string | null;
  fromEmail: string | null;
  fromName: string | null;
  replyTo: string | null;
  defaultShowBranding: boolean;
  isActive: boolean;
  isDefault: boolean;
  lastTestedAt: Date | null;
  lastTestResult: string | null;
  lastTestError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class EmailConfigController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId, method } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          id,
          uuid,
          property_id as propertyId,
          method,
          provider,
          smtp_server as smtpServer,
          smtp_port as smtpPort,
          smtp_security as smtpSecurity,
          smtp_username as smtpUsername,
          NULL as smtpPassword,
          NULL as apiKey,
          api_domain as apiDomain,
          api_daily_limit as apiDailyLimit,
          api_webhook_url as apiWebhookUrl,
          from_email as fromEmail,
          from_name as fromName,
          reply_to as replyTo,
          default_show_branding as defaultShowBranding,
          is_active as isActive,
          is_default as isDefault,
          last_tested_at as lastTestedAt,
          last_test_result as lastTestResult,
          last_test_error as lastTestError,
          created_at as createdAt,
          updated_at as updatedAt
        FROM email_configs
        WHERE deleted_at IS NULL
      `;

      const params: any[] = [];
      if (propertyId) {
        query += ` AND property_id = ?`;
        params.push(parseInt(propertyId as string, 10));
      } else {
        query += ` AND property_id IS NULL`;
      }
      if (method) {
        query += ` AND method = ?`;
        params.push(method);
      }

      query += ` ORDER BY is_default DESC, created_at DESC`;

      const configs = await queryRunner.query(query, params);
      await queryRunner.release();

      const configsResponse: EmailConfigResponse[] = configs.map((row: any) => ({
        id: row.id,
        uuid: row.uuid,
        propertyId: row.propertyId,
        method: row.method,
        provider: row.provider,
        smtpServer: row.smtpServer,
        smtpPort: row.smtpPort ? Number(row.smtpPort) : null,
        smtpSecurity: row.smtpSecurity,
        smtpUsername: row.smtpUsername,
        smtpPassword: null,
        apiKey: null,
        apiDomain: row.apiDomain,
        apiDailyLimit: row.apiDailyLimit ? Number(row.apiDailyLimit) : null,
        apiWebhookUrl: row.apiWebhookUrl,
        fromEmail: row.fromEmail,
        fromName: row.fromName,
        replyTo: row.replyTo,
        defaultShowBranding: row.defaultShowBranding === 1 || row.defaultShowBranding === true,
        isActive: row.isActive === 1 || row.isActive === true,
        isDefault: row.isDefault === 1 || row.isDefault === true,
        lastTestedAt: row.lastTestedAt,
        lastTestResult: row.lastTestResult,
        lastTestError: row.lastTestError,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      res.json({
        success: true,
        data: { emailConfigs: configsResponse },
      });
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
            method,
            provider,
            smtp_server as smtpServer,
            smtp_port as smtpPort,
            smtp_security as smtpSecurity,
            smtp_username as smtpUsername,
            NULL as smtpPassword,
            NULL as apiKey,
            api_domain as apiDomain,
            api_daily_limit as apiDailyLimit,
            api_webhook_url as apiWebhookUrl,
            from_email as fromEmail,
            from_name as fromName,
            reply_to as replyTo,
            default_show_branding as defaultShowBranding,
            is_active as isActive,
            is_default as isDefault,
            last_tested_at as lastTestedAt,
            last_test_result as lastTestResult,
            last_test_error as lastTestError,
            created_at as createdAt,
            updated_at as updatedAt
          FROM email_configs
          WHERE id = ? AND deleted_at IS NULL
        `;

        const results = await queryRunner.query(query, [parseInt(id, 10)]);

        if (results.length === 0) {
          throw new AppError('Configuração de e-mail não encontrada', 404);
        }

        const row = results[0];

        const configResponse: EmailConfigResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          method: row.method,
          provider: row.provider,
          smtpServer: row.smtpServer,
          smtpPort: row.smtpPort ? Number(row.smtpPort) : null,
          smtpSecurity: row.smtpSecurity,
          smtpUsername: row.smtpUsername,
          smtpPassword: null, // Nunca retornar senha
          apiKey: null, // Nunca retornar API key
          apiDomain: row.apiDomain,
          apiDailyLimit: row.apiDailyLimit ? Number(row.apiDailyLimit) : null,
          apiWebhookUrl: row.apiWebhookUrl,
          fromEmail: row.fromEmail,
          fromName: row.fromName,
          replyTo: row.replyTo,
          defaultShowBranding: row.defaultShowBranding === 1 || row.defaultShowBranding === true,
          isActive: row.isActive === 1 || row.isActive === true,
          isDefault: row.isDefault === 1 || row.isDefault === true,
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

  async getCurrent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      try {
        // Buscar configuração ativa específica da propriedade ou global
        let query = `
          SELECT 
            id,
            uuid,
            property_id as propertyId,
            method,
            provider,
            smtp_server as smtpServer,
            smtp_port as smtpPort,
            smtp_security as smtpSecurity,
            smtp_username as smtpUsername,
            NULL as smtpPassword,
            NULL as apiKey,
            api_domain as apiDomain,
            api_daily_limit as apiDailyLimit,
            api_webhook_url as apiWebhookUrl,
            from_email as fromEmail,
            from_name as fromName,
            reply_to as replyTo,
            default_show_branding as defaultShowBranding,
            is_active as isActive,
            is_default as isDefault,
            last_tested_at as lastTestedAt,
            last_test_result as lastTestResult,
            last_test_error as lastTestError,
            created_at as createdAt,
            updated_at as updatedAt
          FROM email_configs
          WHERE deleted_at IS NULL AND is_active = TRUE
        `;

        const params: any[] = [];
        if (propertyId) {
          query += ` AND (property_id = ? OR property_id IS NULL)`;
          params.push(parseInt(propertyId as string, 10));
        } else {
          query += ` AND property_id IS NULL`;
        }

        query += ` ORDER BY property_id DESC, is_default DESC, created_at DESC LIMIT 1`;

        const results = await queryRunner.query(query, params);

        if (results.length === 0) {
          throw new AppError('Nenhuma configuração de e-mail ativa encontrada', 404);
        }

        const row = results[0];

        const configResponse: EmailConfigResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          method: row.method,
          provider: row.provider,
          smtpServer: row.smtpServer,
          smtpPort: row.smtpPort ? Number(row.smtpPort) : null,
          smtpSecurity: row.smtpSecurity,
          smtpUsername: row.smtpUsername,
          smtpPassword: null,
          apiKey: null,
          apiDomain: row.apiDomain,
          apiDailyLimit: row.apiDailyLimit ? Number(row.apiDailyLimit) : null,
          apiWebhookUrl: row.apiWebhookUrl,
          fromEmail: row.fromEmail,
          fromName: row.fromName,
          replyTo: row.replyTo,
          defaultShowBranding: row.defaultShowBranding === 1 || row.defaultShowBranding === true,
          isActive: row.isActive === 1 || row.isActive === true,
          isDefault: row.isDefault === 1 || row.isDefault === true,
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
      const data: CreateEmailConfigInput = req.body;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Se isDefault = true, desativar outras configurações default
        if (data.isDefault) {
          await queryRunner.query(
            `UPDATE email_configs SET is_default = FALSE WHERE deleted_at IS NULL`
          );
        }

        // IMPORTANTE: Senha SMTP e API Key precisam ser armazenadas em texto plano
        // (ou com criptografia reversível) porque precisam ser usadas para autenticação
        // bcrypt é unidirecional e não pode ser revertido
        // Em produção, considere usar criptografia simétrica (AES) se necessário
        const smtpPassword = data.smtpPassword || null;
        const apiKey = data.apiKey || null;

        const uuid = uuidv4();
        const insertQuery = `
          INSERT INTO email_configs (
            uuid, property_id, method, provider,
            smtp_server, smtp_port, smtp_security, smtp_username, smtp_password,
            api_key, api_domain, api_daily_limit, api_webhook_url,
            from_email, from_name, reply_to,
            default_show_branding, is_active, is_default
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const insertParams: any[] = [
          uuid,
          data.propertyId || null,
          data.method,
          data.provider || null,
          data.smtpServer || null,
          data.smtpPort || null,
          data.smtpSecurity || null,
          data.smtpUsername || null,
          smtpPassword,
          apiKey,
          data.apiDomain || null,
          data.apiDailyLimit || null,
          data.apiWebhookUrl || null,
          data.fromEmail || null,
          data.fromName || null,
          data.replyTo || null,
          data.defaultShowBranding !== false,
          data.isActive !== false,
          data.isDefault || false,
        ];

        const result = await queryRunner.query(insertQuery, insertParams);
        const configId = result.insertId;

        await queryRunner.commitTransaction();

        // Buscar configuração criada
        const selectQuery = `
          SELECT 
            id, uuid, property_id as propertyId, method, provider,
            smtp_server as smtpServer, smtp_port as smtpPort, smtp_security as smtpSecurity,
            smtp_username as smtpUsername, NULL as smtpPassword,
            NULL as apiKey, api_domain as apiDomain, api_daily_limit as apiDailyLimit,
            api_webhook_url as apiWebhookUrl, from_email as fromEmail, from_name as fromName,
            reply_to as replyTo, default_show_branding as defaultShowBranding,
            is_active as isActive, is_default as isDefault,
            last_tested_at as lastTestedAt, last_test_result as lastTestResult,
            last_test_error as lastTestError, created_at as createdAt, updated_at as updatedAt
          FROM email_configs
          WHERE id = ?
        `;

        const createdConfig = await queryRunner.query(selectQuery, [configId]);
        await queryRunner.release();

        const row = createdConfig[0];

        const configResponse: EmailConfigResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          method: row.method,
          provider: row.provider,
          smtpServer: row.smtpServer,
          smtpPort: row.smtpPort ? Number(row.smtpPort) : null,
          smtpSecurity: row.smtpSecurity,
          smtpUsername: row.smtpUsername,
          smtpPassword: null,
          apiKey: null,
          apiDomain: row.apiDomain,
          apiDailyLimit: row.apiDailyLimit ? Number(row.apiDailyLimit) : null,
          apiWebhookUrl: row.apiWebhookUrl,
          fromEmail: row.fromEmail,
          fromName: row.fromName,
          replyTo: row.replyTo,
          defaultShowBranding: row.defaultShowBranding === 1 || row.defaultShowBranding === true,
          isActive: row.isActive === 1 || row.isActive === true,
          isDefault: row.isDefault === 1 || row.isDefault === true,
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
      const data: UpdateEmailConfigInput = req.body;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Verificar se a configuração existe
        const checkQuery = `SELECT id FROM email_configs WHERE id = ? AND deleted_at IS NULL`;
        const existing = await queryRunner.query(checkQuery, [parseInt(id, 10)]);

        if (existing.length === 0) {
          throw new AppError('Configuração de e-mail não encontrada', 404);
        }

        // Se isDefault = true, desativar outras configurações default
        if (data.isDefault) {
          await queryRunner.query(
            `UPDATE email_configs SET is_default = FALSE WHERE id != ? AND deleted_at IS NULL`,
            [parseInt(id, 10)]
          );
        }

        // Construir query de update dinamicamente
        const updateFields: string[] = [];
        const updateParams: any[] = [];

        if (data.method !== undefined) { updateFields.push('method = ?'); updateParams.push(data.method); }
        if (data.provider !== undefined) { updateFields.push('provider = ?'); updateParams.push(data.provider || null); }
        
        if (data.smtpServer !== undefined) { updateFields.push('smtp_server = ?'); updateParams.push(data.smtpServer || null); }
        if (data.smtpPort !== undefined) { updateFields.push('smtp_port = ?'); updateParams.push(data.smtpPort || null); }
        if (data.smtpSecurity !== undefined) { updateFields.push('smtp_security = ?'); updateParams.push(data.smtpSecurity || null); }
        if (data.smtpUsername !== undefined) { updateFields.push('smtp_username = ?'); updateParams.push(data.smtpUsername || null); }
        if (data.smtpPassword !== undefined) {
          // Senha SMTP precisa ser armazenada em texto plano (não usar bcrypt - é unidirecional)
          // Em produção, considere usar criptografia reversível se necessário
          if (data.smtpPassword !== null && data.smtpPassword !== '') {
            updateFields.push('smtp_password = ?');
            updateParams.push(data.smtpPassword);
          }
          // Se enviou string vazia ou null, manter o valor atual (não atualizar)
        }
        
        // API Key: sempre atualizar se fornecida, mesmo que seja string vazia
        // Se for string vazia ou null, será NULL no banco
        // Se não for fornecida (undefined), manter o valor atual
        if (data.apiKey !== undefined) {
          updateFields.push('api_key = ?');
          updateParams.push(data.apiKey && data.apiKey.trim() !== '' ? data.apiKey.trim() : null);
        }
        if (data.apiDomain !== undefined) { updateFields.push('api_domain = ?'); updateParams.push(data.apiDomain || null); }
        if (data.apiDailyLimit !== undefined) { updateFields.push('api_daily_limit = ?'); updateParams.push(data.apiDailyLimit || null); }
        if (data.apiWebhookUrl !== undefined) { updateFields.push('api_webhook_url = ?'); updateParams.push(data.apiWebhookUrl || null); }
        
        if (data.fromEmail !== undefined) { updateFields.push('from_email = ?'); updateParams.push(data.fromEmail || null); }
        if (data.fromName !== undefined) { updateFields.push('from_name = ?'); updateParams.push(data.fromName || null); }
        if (data.replyTo !== undefined) { updateFields.push('reply_to = ?'); updateParams.push(data.replyTo || null); }
        
        if (data.defaultShowBranding !== undefined) { updateFields.push('default_show_branding = ?'); updateParams.push(data.defaultShowBranding); }
        if (data.isActive !== undefined) { updateFields.push('is_active = ?'); updateParams.push(data.isActive); }
        if (data.isDefault !== undefined) { updateFields.push('is_default = ?'); updateParams.push(data.isDefault); }

        updateFields.push('updated_at = NOW()');
        updateParams.push(parseInt(id, 10));

        if (updateFields.length === 1) {
          throw new AppError('Nenhum campo para atualizar', 400);
        }

        const updateQuery = `UPDATE email_configs SET ${updateFields.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
        await queryRunner.query(updateQuery, updateParams);

        await queryRunner.commitTransaction();

        // Buscar configuração atualizada
        const selectQuery = `
          SELECT 
            id, uuid, property_id as propertyId, method, provider,
            smtp_server as smtpServer, smtp_port as smtpPort, smtp_security as smtpSecurity,
            smtp_username as smtpUsername, NULL as smtpPassword,
            NULL as apiKey, api_domain as apiDomain, api_daily_limit as apiDailyLimit,
            api_webhook_url as apiWebhookUrl, from_email as fromEmail, from_name as fromName,
            reply_to as replyTo, default_show_branding as defaultShowBranding,
            is_active as isActive, is_default as isDefault,
            last_tested_at as lastTestedAt, last_test_result as lastTestResult,
            last_test_error as lastTestError, created_at as createdAt, updated_at as updatedAt
          FROM email_configs
          WHERE id = ?
        `;

        const updatedConfig = await queryRunner.query(selectQuery, [parseInt(id, 10)]);
        await queryRunner.release();

        const row = updatedConfig[0];

        const configResponse: EmailConfigResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          method: row.method,
          provider: row.provider,
          smtpServer: row.smtpServer,
          smtpPort: row.smtpPort ? Number(row.smtpPort) : null,
          smtpSecurity: row.smtpSecurity,
          smtpUsername: row.smtpUsername,
          smtpPassword: null,
          apiKey: null,
          apiDomain: row.apiDomain,
          apiDailyLimit: row.apiDailyLimit ? Number(row.apiDailyLimit) : null,
          apiWebhookUrl: row.apiWebhookUrl,
          fromEmail: row.fromEmail,
          fromName: row.fromName,
          replyTo: row.replyTo,
          defaultShowBranding: row.defaultShowBranding === 1 || row.defaultShowBranding === true,
          isActive: row.isActive === 1 || row.isActive === true,
          isDefault: row.isDefault === 1 || row.isDefault === true,
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
        // Verificar se a configuração existe
        const checkQuery = `SELECT id FROM email_configs WHERE id = ? AND deleted_at IS NULL`;
        const existing = await queryRunner.query(checkQuery, [parseInt(id, 10)]);

        if (existing.length === 0) {
          throw new AppError('Configuração de e-mail não encontrada', 404);
        }

        // Soft delete
        const deleteQuery = `UPDATE email_configs SET deleted_at = NOW() WHERE id = ?`;
        await queryRunner.query(deleteQuery, [parseInt(id, 10)]);

        await queryRunner.release();

        res.json({
          success: true,
          message: 'Configuração de e-mail excluída com sucesso',
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
      const { testEmail } = req.body;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();

      try {
        // Buscar configuração
        const query = `
          SELECT 
            id, method, provider,
            smtp_server, smtp_port, smtp_security, smtp_username, smtp_password,
            api_key, api_domain, from_email, from_name
          FROM email_configs
          WHERE id = ? AND deleted_at IS NULL AND is_active = TRUE
        `;

        const results = await queryRunner.query(query, [parseInt(id, 10)]);

        if (results.length === 0) {
          throw new AppError('Configuração de e-mail não encontrada ou inativa', 404);
        }

        const config = results[0];

        if (!testEmail || !testEmail.trim()) {
          throw new AppError('E-mail de teste não fornecido', 400);
        }

        // Preparar configuração para envio
        let emailConfig: any = null;

        if (config.method === 'smtp') {
          emailConfig = {
            server: config.smtp_server,
            port: config.smtp_port,
            security: config.smtp_security,
            username: config.smtp_username,
            password: config.smtp_password,
            fromEmail: config.from_email,
            fromName: config.from_name,
            replyTo: null, // Pode ser adicionado se necessário
          };
        } else if (config.method === 'api') {
          emailConfig = {
            provider: config.provider,
            apiKey: config.api_key,
            domain: config.api_domain || null,
            fromEmail: config.from_email,
            fromName: config.from_name,
          };
        } else {
          throw new AppError('Método de envio não suportado para teste', 400);
        }

        let testSuccess = false;
        let errorMessage: string | null = null;

        try {
          // Enviar e-mail de teste usando o EmailService
          await EmailService.sendTestEmail(
            config.method as 'smtp' | 'api' | 'default',
            testEmail.trim(),
            emailConfig
          );

          testSuccess = true;
        } catch (error: any) {
          testSuccess = false;
          errorMessage = error.message || 'Erro ao enviar e-mail de teste';
          console.error('Erro ao enviar e-mail de teste:', error);
        }

        // Atualizar resultado do teste
        const updateQuery = `
          UPDATE email_configs 
          SET last_tested_at = NOW(), 
              last_test_result = ?,
              last_test_error = ?
          WHERE id = ?
        `;

        await queryRunner.query(updateQuery, [
          testSuccess ? 'success' : 'error',
          errorMessage,
          parseInt(id, 10),
        ]);

        await queryRunner.release();

        if (testSuccess) {
          res.json({
            success: true,
            message: `E-mail de teste enviado com sucesso para ${testEmail.trim()}`,
            data: { result: 'success' },
          });
        } else {
          res.status(400).json({
            success: false,
            message: 'Falha no teste de e-mail',
            data: { result: 'error', error: errorMessage || 'Falha ao enviar e-mail de teste' },
          });
        }
      } catch (error) {
        await queryRunner.release();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }
}
