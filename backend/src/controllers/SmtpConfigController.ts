import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { v4 as uuidv4 } from 'uuid';

/** Resposta para o modal (smtp_configurations + from/sender mapeado) */
function rowToResponse(row: any) {
  const encryption = row.smtp_encryption || row.smtpEncryption || 'tls';
  return {
    id: row.id,
    uuid: row.uuid,
    propertyId: row.propertyId ?? row.property_id,
    name: row.name,
    description: row.description,
    providerType: row.provider_type ?? row.providerType ?? 'smtp',
    emailProviderId: row.email_provider_id ?? row.emailProviderId,
    providerSlug: row.providerSlug ?? row.provider_slug ?? null,
    smtpHost: row.smtp_host ?? row.smtpHost,
    smtpPort: row.smtp_port != null ? Number(row.smtp_port) : (row.smtpPort != null ? Number(row.smtpPort) : 587),
    smtpEncryption: encryption,
    smtpUsername: row.smtp_username ?? row.smtpUsername,
    smtpTimeout: row.smtp_timeout != null ? Number(row.smtp_timeout) : (row.smtpTimeout ?? 30),
    dailyLimit: row.daily_limit != null ? Number(row.daily_limit) : (row.dailyLimit ?? 0),
    apiKey: (() => {
      const val = row.api_key ?? row.api_key_encrypted ?? row.API_KEY_ENCRYPTED ?? row.apiKeyEncrypted ?? row.API_KEY ?? '';
      return val != null ? String(val) : '';
    })(),
    apiDomain: row.api_domain ?? row.apiDomain ?? null,
    apiWebhookUrl: row.api_webhook_url ?? row.apiWebhookUrl ?? null,
    trackOpens: row.track_opens !== undefined && row.track_opens !== null ? (row.track_opens === 1 || row.track_opens === true) : true,
    trackClicks: row.track_clicks !== undefined && row.track_clicks !== null ? (row.track_clicks === 1 || row.track_clicks === true) : true,
    lastTestEmail: row.last_test_email ?? row.lastTestEmail ?? null,
    isActive: row.is_active === 1 || row.is_active === true || row.isActive === true,
    isDefault: row.is_default === 1 || row.is_default === true || row.isDefault === true,
    lastTestAt: row.last_test_at ?? row.lastTestAt,
    lastTestResult: row.last_test_result ?? row.lastTestResult,
    lastTestMessage: row.last_test_message ?? row.lastTestMessage,
    fromEmail: row.from_email ?? row.fromEmail,
    fromName: row.from_name ?? row.fromName,
    replyTo: row.reply_to ?? row.replyTo,
    templateIds: row.templateIds ?? [],
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt,
    // Notificações (preenchidos depois a partir de smtp_notification_settings)
    bounceAlert: row.bounceAlert,
    deliveryReport: row.deliveryReport,
    weeklyDigest: row.weeklyDigest,
    alertEmail: row.alertEmail ?? '',
    retryOnFail: row.retryOnFail,
    retryAttempts: row.retryAttempts ?? '3',
  };
}

/** Carrega smtp_notification_settings e retorna objeto para o modal */
async function loadNotificationSettings(configId: number): Promise<{
  bounceAlert: boolean;
  deliveryReport: boolean;
  weeklyDigest: boolean;
  alertEmail: string;
  retryOnFail: boolean;
  retryAttempts: string;
}> {
  const q = AppDataSource.createQueryRunner();
  const defaults = {
    bounceAlert: true,
    deliveryReport: false,
    weeklyDigest: true,
    alertEmail: '',
    retryOnFail: true,
    retryAttempts: '3',
  };
  try {
    const [row] = await q.query(
      `SELECT bounce_alerts_enabled, bounce_alert_email, daily_report_enabled,
              weekly_report_enabled, auto_retry_enabled, auto_retry_max_attempts
       FROM smtp_notification_settings WHERE smtp_configuration_id = ? LIMIT 1`,
      [configId]
    );
    await q.release();
    if (!row) return defaults;
    const r = row as any;
    return {
      bounceAlert: r.bounce_alerts_enabled === 1 || r.bounce_alerts_enabled === true,
      deliveryReport: r.daily_report_enabled === 1 || r.daily_report_enabled === true,
      weeklyDigest: r.weekly_report_enabled === 1 || r.weekly_report_enabled === true,
      alertEmail: r.bounce_alert_email != null ? String(r.bounce_alert_email) : '',
      retryOnFail: r.auto_retry_enabled === 1 || r.auto_retry_enabled === true,
      retryAttempts: r.auto_retry_max_attempts != null ? String(r.auto_retry_max_attempts) : '3',
    };
  } catch {
    try {
      await q.release();
    } catch {
      //
    }
    return defaults;
  }
}

export class SmtpConfigController {
  /**
   * GET /smtp-configs/current?propertyId=
   * Retorna a configuração ativa para a propriedade (ou a primeira existente).
   */
  async getCurrent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      const { propertyId } = req.query;
      const propId = propertyId ? parseInt(propertyId as string, 10) : null;

      let query = `
        SELECT sc.*, ep.slug AS providerSlug
        FROM smtp_configurations sc
        LEFT JOIN email_providers ep ON ep.id = sc.email_provider_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (propId != null && !isNaN(propId)) {
        query += ` AND sc.property_id = ?`;
        params.push(propId);
      }

      query += ` ORDER BY sc.is_default DESC, sc.created_at DESC LIMIT 1`;

      const rows = await queryRunner.query(query, params);
      await queryRunner.release();

      if (rows.length === 0) {
        res.json({ success: true, data: null, message: 'Nenhuma configuração SMTP encontrada.' });
        return;
      }

      const row = rows[0];
      const fromEmail = row.smtp_host ? row.smtp_username : null;
      const fromName = row.name || null;
      const replyTo = row.smtp_username || null;
      const data = rowToResponse({
        ...row,
        propertyId: row.property_id,
        providerType: row.provider_type,
        emailProviderId: row.email_provider_id,
        smtpHost: row.smtp_host,
        smtpPort: row.smtp_port,
        smtpEncryption: row.smtp_encryption,
        smtpUsername: row.smtp_username,
        smtpTimeout: row.smtp_timeout,
        dailyLimit: row.daily_limit,
        api_key: row.api_key ?? row.api_key_encrypted ?? row.API_KEY_ENCRYPTED,
        from_email: fromEmail,
        from_name: fromName,
        reply_to: replyTo,
        api_domain: row.api_domain,
        api_webhook_url: row.api_webhook_url,
        track_opens: row.track_opens,
        track_clicks: row.track_clicks,
        last_test_email: row.last_test_email,
        providerSlug: row.providerSlug,
      });

      try {
        const r2 = AppDataSource.createQueryRunner();
        const identityRows = await r2.query(
          `SELECT sender_email, sender_name, reply_to_email FROM smtp_sender_identities WHERE smtp_configuration_id = ? AND is_default = 1 AND is_active = 1 LIMIT 1`,
          [row.id]
        );
        await r2.release();
        if (identityRows.length > 0) {
          data.fromEmail = identityRows[0].sender_email;
          data.fromName = identityRows[0].sender_name;
          data.replyTo = identityRows[0].reply_to_email || identityRows[0].sender_email;
        }
      } catch {
        // smtp_sender_identities pode não existir ainda
      }

      try {
        const r3 = AppDataSource.createQueryRunner();
        const templateRows = await r3.query(
          `SELECT email_template_id FROM smtp_template_settings WHERE smtp_configuration_id = ? AND is_enabled = 1`,
          [row.id]
        );
        await r3.release();
        data.templateIds = (templateRows as { email_template_id: number }[]).map((r) => r.email_template_id);
      } catch {
        data.templateIds = [];
      }

      const notif = await loadNotificationSettings(row.id);
      Object.assign(data, notif);

      res.json({ success: true, data });
    } catch (error) {
      await queryRunner.release();
      next(error);
    }
  }

  /**
   * GET /smtp-configs?propertyId=
   */
  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      const { propertyId } = req.query;
      let query = `
        SELECT 
          sc.id, sc.uuid, sc.property_id AS propertyId, sc.name, sc.provider_type AS providerType,
          sc.smtp_host AS smtpHost, sc.smtp_port AS smtpPort, sc.is_active AS isActive, sc.is_default AS isDefault,
          sc.last_test_result AS lastTestResult, sc.created_at AS createdAt
        FROM smtp_configurations sc
        WHERE 1=1
      `;
      const params: any[] = [];
      if (propertyId) {
        query += ` AND sc.property_id = ?`;
        params.push(parseInt(propertyId as string, 10));
      }
      query += ` ORDER BY sc.is_default DESC, sc.name ASC`;

      const rows = await queryRunner.query(query, params);
      await queryRunner.release();
      res.json({ success: true, data: rows });
    } catch (error) {
      await queryRunner.release();
      next(error);
    }
  }

  /**
   * POST /smtp-configs - cria configuração (e opcionalmente identidade de remetente e notificações).
   */
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const body = req.body as Record<string, unknown>;
      const propertyId = body.propertyId != null ? Number(body.propertyId) : null;
      if (propertyId == null || isNaN(propertyId)) {
        throw new AppError('propertyId é obrigatório', 400);
      }

      const name = typeof body.name === 'string' ? body.name.trim() : 'Configuração de E-mail';
      const providerType = (body.providerType as string) || (body.method as string) || 'smtp';
      const providerSlug = typeof body.providerSlug === 'string' ? body.providerSlug : (body.provider as string) || null;
      const smtpHost = typeof body.smtpHost === 'string' ? body.smtpHost : (body.smtpServer as string) || null;
      const smtpPort = body.smtpPort != null ? Number(body.smtpPort) : (body.smtpPort != null ? Number(body.smtpPort) : 587);
      const smtpEncryption = (body.smtpEncryption as string) || (body.smtpSecurity as string) || 'tls';
      const smtpUsername = typeof body.smtpUsername === 'string' ? body.smtpUsername : null;
      const smtpPassword = typeof body.smtpPassword === 'string' ? body.smtpPassword : null;
      const fromEmail = typeof body.fromEmail === 'string' ? body.fromEmail : null;
      const fromName = typeof body.fromName === 'string' ? body.fromName : null;
      const replyTo = typeof body.replyTo === 'string' ? body.replyTo : null;
      const dailyLimit = body.dailyLimit != null ? Number(body.dailyLimit) : 0;
      const apiKeyRaw = body.apiKey ?? body.api_key;
      const apiKey = typeof apiKeyRaw === 'string' && apiKeyRaw.trim() !== '' && apiKeyRaw !== '••••••••'
        ? apiKeyRaw.trim()
        : null;
      const apiDomain = typeof body.apiDomain === 'string' ? body.apiDomain : null;
      const apiWebhookUrl = typeof body.apiWebhookUrl === 'string' ? body.apiWebhookUrl : null;
      const trackOpens = body.trackOpens !== undefined ? (body.trackOpens ? 1 : 0) : 1;
      const trackClicks = body.trackClicks !== undefined ? (body.trackClicks ? 1 : 0) : 1;
      const isDefault = Boolean(body.isDefault);

      let emailProviderId: number | null = null;
      if (providerSlug) {
        const slugMap: Record<string, string> = { ses: 'amazon-ses' };
        const slugToUse = slugMap[providerSlug] ?? providerSlug;
        const epRows = await queryRunner.query(
          'SELECT id FROM email_providers WHERE slug = ? LIMIT 1',
          [slugToUse]
        );
        const epRow = Array.isArray(epRows) ? epRows[0] : epRows;
        if (epRow && (epRow.id != null || epRow.ID != null)) {
          emailProviderId = Number(epRow.id ?? epRow.ID);
        }
      }

      const uuid = uuidv4();
      // INSERT apenas com colunas que existem na tabela 004 (smtp_configurations)
      await queryRunner.query(
        `INSERT INTO smtp_configurations (
          uuid, property_id, name, description, provider_type, email_provider_id,
          smtp_host, smtp_port, smtp_encryption, smtp_username, smtp_password,
          smtp_timeout, daily_limit, api_key,
          is_active, is_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuid,
          propertyId,
          name,
          body.description || null,
          providerType === 'api' ? 'api' : providerType === 'default' ? 'unistays' : 'smtp',
          emailProviderId,
          smtpHost,
          smtpPort,
          smtpEncryption === 'ssl' ? 'ssl' : smtpEncryption === 'none' ? 'none' : 'tls',
          smtpUsername,
          providerType === 'smtp' ? smtpPassword : null,
          body.smtpTimeout != null ? Number(body.smtpTimeout) : 30,
          dailyLimit,
          providerType === 'api' ? apiKey : null,
          1,
          isDefault ? 1 : 0,
        ]
      );

      const [insertResult] = await queryRunner.query('SELECT LAST_INSERT_ID() AS id');
      const configId = insertResult.id;

      // Atualizar colunas opcionais (existem se smtp_config_extra_columns.sql foi executado)
      try {
        await queryRunner.query(
          `UPDATE smtp_configurations SET api_domain = ?, api_webhook_url = ?, track_opens = ?, track_clicks = ?, last_test_email = ? WHERE id = ?`,
          [apiDomain, apiWebhookUrl, trackOpens, trackClicks, typeof body.lastTestEmail === 'string' ? body.lastTestEmail : null, configId]
        );
      } catch {
        // colunas podem não existir
      }

      if (fromEmail && fromName) {
        try {
          await queryRunner.query(
            `INSERT INTO smtp_sender_identities (uuid, smtp_configuration_id, sender_name, sender_email, reply_to_email, is_default, is_active)
             VALUES (?, ?, ?, ?, ?, 1, 1)`,
            [uuidv4(), configId, fromName, fromEmail, replyTo || fromEmail]
          );
        } catch {
          // tabela pode não existir
        }
      }

      const templateIds = Array.isArray(body.templateIds) ? (body.templateIds as number[]).filter((id) => Number.isInteger(id)) : [];
      for (const tid of templateIds) {
        try {
          await queryRunner.query(
            `INSERT INTO smtp_template_settings (uuid, smtp_configuration_id, email_template_id, is_enabled, track_opens, track_clicks)
             VALUES (?, ?, ?, 1, ?, ?)
             ON DUPLICATE KEY UPDATE is_enabled = 1, track_opens = VALUES(track_opens), track_clicks = VALUES(track_clicks)`,
            [uuidv4(), configId, tid, trackOpens, trackClicks]
          );
        } catch {
          //
        }
      }

      const notif = body.notificationSettings as Record<string, unknown> | undefined;
      const bounceAlert = notif?.bounceAlert ?? body.bounceAlert ?? true;
      const deliveryReport = notif?.deliveryReport ?? body.deliveryReport ?? false;
      const weeklyDigest = notif?.weeklyDigest ?? body.weeklyDigest ?? true;
      const alertEmail = (notif?.alertEmail ?? body.alertEmail) != null ? String(notif?.alertEmail ?? body.alertEmail).trim() : null;
      const retryOnFail = notif?.retryOnFail ?? body.retryOnFail ?? true;
      const retryAttempts = Math.min(10, Math.max(1, parseInt(String(notif?.retryAttempts ?? body.retryAttempts ?? 3), 10) || 3));
      try {
        await queryRunner.query(
          `INSERT INTO smtp_notification_settings (
            UUID, smtp_configuration_id,
            bounce_alerts_enabled, bounce_alert_email,
            daily_report_enabled, weekly_report_enabled,
            auto_retry_enabled, auto_retry_max_attempts
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            bounce_alerts_enabled = VALUES(bounce_alerts_enabled),
            bounce_alert_email = VALUES(bounce_alert_email),
            daily_report_enabled = VALUES(daily_report_enabled),
            weekly_report_enabled = VALUES(weekly_report_enabled),
            auto_retry_enabled = VALUES(auto_retry_enabled),
            auto_retry_max_attempts = VALUES(auto_retry_max_attempts)`,
          [
            uuidv4(),
            configId,
            bounceAlert ? 1 : 0,
            alertEmail,
            deliveryReport ? 1 : 0,
            weeklyDigest ? 1 : 0,
            retryOnFail ? 1 : 0,
            retryAttempts,
          ]
        );
      } catch {
        // tabela pode não existir
      }

      await queryRunner.commitTransaction();
      await queryRunner.release();

      const config = await this.getByIdInternal(configId);
      res.status(201).json({ success: true, data: config, message: 'Configuração SMTP criada com sucesso.' });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      next(error);
    }
  }

  private async getByIdInternal(id: number): Promise<any> {
    const q = AppDataSource.createQueryRunner();
    const [row] = await q.query(
      `SELECT sc.*, ep.slug AS providerSlug
       FROM smtp_configurations sc
       LEFT JOIN email_providers ep ON ep.id = sc.email_provider_id
       WHERE sc.id = ?`,
      [id]
    );
    await q.release();
    if (!row) return null;
    let fromEmail = row.smtp_username;
    let fromName = row.name;
    let replyTo = row.smtp_username;
    try {
      const q2 = AppDataSource.createQueryRunner();
      const [idRow] = await q2.query(
        'SELECT sender_email, sender_name, reply_to_email FROM smtp_sender_identities WHERE smtp_configuration_id = ? AND is_default = 1 LIMIT 1',
        [id]
      );
      await q2.release();
      if (idRow) {
        fromEmail = idRow.sender_email;
        fromName = idRow.sender_name;
        replyTo = idRow.reply_to_email || idRow.sender_email;
      }
    } catch {
      //
    }
    let templateIds: number[] = [];
    try {
      const q3 = AppDataSource.createQueryRunner();
      const tRows = await q3.query(
        'SELECT email_template_id FROM smtp_template_settings WHERE smtp_configuration_id = ? AND is_enabled = 1',
        [id]
      );
      await q3.release();
      templateIds = (tRows as { email_template_id: number }[]).map((r) => r.email_template_id);
    } catch {
      //
    }
    const resp = rowToResponse({
      ...row,
      propertyId: row.property_id,
      providerType: row.provider_type,
      emailProviderId: row.email_provider_id,
      smtpHost: row.smtp_host,
      smtpPort: row.smtp_port,
      smtpEncryption: row.smtp_encryption,
      smtpUsername: row.smtp_username,
      smtpTimeout: row.smtp_timeout,
      dailyLimit: row.daily_limit,
      api_key: row.api_key ?? row.api_key_encrypted ?? row.API_KEY_ENCRYPTED,
      from_email: fromEmail,
      from_name: fromName,
      reply_to: replyTo,
      api_domain: row.api_domain,
      api_webhook_url: row.api_webhook_url,
      track_opens: row.track_opens,
      track_clicks: row.track_clicks,
      last_test_email: row.last_test_email,
      providerSlug: row.providerSlug,
      templateIds,
    });
    const notif = await loadNotificationSettings(id);
    Object.assign(resp, notif);
    return resp;
  }

  /** GET /smtp-configs/:id */
  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt((req as any).params.id, 10);
      if (isNaN(id)) throw new AppError('ID inválido', 400);
      const config = await this.getByIdInternal(id);
      if (!config) throw new AppError('Configuração SMTP não encontrada', 404);
      res.json({ success: true, data: config });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /smtp-configs/:id
   */
  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const id = parseInt((req as any).params.id, 10);
      if (isNaN(id)) throw new AppError('ID inválido', 400);
      const body = req.body as Record<string, unknown>;

      const updates: string[] = [];
      const params: any[] = [];

      if (body.name !== undefined) {
        updates.push('name = ?');
        params.push(typeof body.name === 'string' ? body.name : '');
      }
      if (body.providerType !== undefined) {
        updates.push("provider_type = ?");
        params.push(body.providerType === 'api' ? 'api' : body.providerType === 'default' ? 'unistays' : 'smtp');
      }
      if (body.smtpHost !== undefined) {
        updates.push('smtp_host = ?');
        params.push(body.smtpHost);
      }
      if (body.smtpPort !== undefined) {
        updates.push('smtp_port = ?');
        params.push(Number(body.smtpPort));
      }
      if (body.smtpEncryption !== undefined) {
        updates.push('smtp_encryption = ?');
        params.push(body.smtpEncryption === 'ssl' ? 'ssl' : body.smtpEncryption === 'none' ? 'none' : 'tls');
      }
      if (body.smtpUsername !== undefined) {
        updates.push('smtp_username = ?');
        params.push(body.smtpUsername);
      }
      if (body.smtpPassword !== undefined && body.smtpPassword !== '') {
        updates.push('smtp_password = ?');
        params.push(body.smtpPassword);
      }
      if (body.smtpTimeout !== undefined) {
        updates.push('smtp_timeout = ?');
        params.push(Number(body.smtpTimeout));
      }
      if (body.dailyLimit !== undefined) {
        updates.push('daily_limit = ?');
        params.push(Number(body.dailyLimit));
      }
      const updateApiKey = body.apiKey ?? body.api_key;
      if (typeof updateApiKey === 'string' && updateApiKey.trim() !== '' && updateApiKey !== '••••••••') {
        updates.push('api_key = ?');
        params.push(updateApiKey.trim());
      }
      if (body.apiDomain !== undefined) {
        updates.push('api_domain = ?');
        params.push(body.apiDomain);
      }
      if (body.apiWebhookUrl !== undefined) {
        updates.push('api_webhook_url = ?');
        params.push(body.apiWebhookUrl);
      }
      if (body.trackOpens !== undefined) {
        updates.push('track_opens = ?');
        params.push(body.trackOpens ? 1 : 0);
      }
      if (body.trackClicks !== undefined) {
        updates.push('track_clicks = ?');
        params.push(body.trackClicks ? 1 : 0);
      }
      if (body.lastTestEmail !== undefined) {
        updates.push('last_test_email = ?');
        params.push(body.lastTestEmail);
      }
      if (body.providerSlug !== undefined || body.provider !== undefined) {
        const slug = (body.providerSlug ?? body.provider) as string;
        if (slug) {
          const slugMap: Record<string, string> = { ses: 'amazon-ses' };
          const slugToUse = slugMap[slug] ?? slug;
          const epRows = await queryRunner.query('SELECT id FROM email_providers WHERE slug = ? LIMIT 1', [slugToUse]);
          const epRow = Array.isArray(epRows) ? epRows[0] : epRows;
          if (epRow && (epRow.id != null || epRow.ID != null)) {
            updates.push('email_provider_id = ?');
            params.push(Number(epRow.id ?? epRow.ID));
          }
        }
      }
      if (body.isActive !== undefined) {
        updates.push('is_active = ?');
        params.push(body.isActive ? 1 : 0);
      }
      if (body.isDefault !== undefined) {
        updates.push('is_default = ?');
        params.push(body.isDefault ? 1 : 0);
      }

      if (updates.length > 0) {
        params.push(id);
        await queryRunner.query(
          `UPDATE smtp_configurations SET ${updates.join(', ')} WHERE id = ?`,
          params
        );
      }

      if (Array.isArray(body.templateIds)) {
        try {
          await queryRunner.query(
            'DELETE FROM smtp_template_settings WHERE smtp_configuration_id = ?',
            [id]
          );
          const templateIds = (body.templateIds as number[]).filter((tid) => Number.isInteger(tid));
          const trackOpens = body.trackOpens !== undefined ? (body.trackOpens ? 1 : 0) : 1;
          const trackClicks = body.trackClicks !== undefined ? (body.trackClicks ? 1 : 0) : 1;
          for (const tid of templateIds) {
            await queryRunner.query(
              `INSERT INTO smtp_template_settings (uuid, smtp_configuration_id, email_template_id, is_enabled, track_opens, track_clicks)
               VALUES (?, ?, ?, 1, ?, ?)`,
              [uuidv4(), id, tid, trackOpens, trackClicks]
            );
          }
        } catch {
          //
        }
      }

      const notif = body.notificationSettings as Record<string, unknown> | undefined;
      const hasNotif =
        notif !== undefined ||
        body.bounceAlert !== undefined ||
        body.deliveryReport !== undefined ||
        body.weeklyDigest !== undefined ||
        body.alertEmail !== undefined ||
        body.retryOnFail !== undefined ||
        body.retryAttempts !== undefined;
      if (hasNotif) {
        try {
          const bounceAlert = notif?.bounceAlert ?? body.bounceAlert;
          const deliveryReport = notif?.deliveryReport ?? body.deliveryReport;
          const weeklyDigest = notif?.weeklyDigest ?? body.weeklyDigest;
          const alertEmail = (notif?.alertEmail ?? body.alertEmail) != null ? String(notif?.alertEmail ?? body.alertEmail).trim() : null;
          const retryOnFail = notif?.retryOnFail ?? body.retryOnFail;
          const retryAttemptsRaw = notif?.retryAttempts ?? body.retryAttempts;
          const retryAttempts = retryAttemptsRaw != null ? Math.min(10, Math.max(1, parseInt(String(retryAttemptsRaw), 10) || 3)) : null;
          const existingNotif = await queryRunner.query(
            'SELECT id FROM smtp_notification_settings WHERE smtp_configuration_id = ? LIMIT 1',
            [id]
          );
          if (existingNotif.length > 0) {
            const up: string[] = [];
            const p: any[] = [];
            if (bounceAlert !== undefined) {
              up.push('bounce_alerts_enabled = ?');
              p.push(bounceAlert ? 1 : 0);
            }
            if (deliveryReport !== undefined) {
              up.push('daily_report_enabled = ?');
              p.push(deliveryReport ? 1 : 0);
            }
            if (weeklyDigest !== undefined) {
              up.push('weekly_report_enabled = ?');
              p.push(weeklyDigest ? 1 : 0);
            }
            if (alertEmail !== undefined) {
              up.push('bounce_alert_email = ?');
              p.push(alertEmail);
            }
            if (retryOnFail !== undefined) {
              up.push('auto_retry_enabled = ?');
              p.push(retryOnFail ? 1 : 0);
            }
            if (retryAttempts !== null && retryAttempts !== undefined) {
              up.push('auto_retry_max_attempts = ?');
              p.push(retryAttempts);
            }
            if (up.length > 0) {
              p.push(id);
              await queryRunner.query(
                `UPDATE smtp_notification_settings SET ${up.join(', ')} WHERE smtp_configuration_id = ?`,
                p
              );
            }
          } else {
            const bAlert = bounceAlert !== undefined ? !!bounceAlert : true;
            const dReport = deliveryReport !== undefined ? !!deliveryReport : false;
            const wDigest = weeklyDigest !== undefined ? !!weeklyDigest : true;
            const aEmail = alertEmail ?? '';
            const rFail = retryOnFail !== undefined ? !!retryOnFail : true;
            const rAttempts = retryAttempts != null ? retryAttempts : 3;
            await queryRunner.query(
              `INSERT INTO smtp_notification_settings (
                UUID, smtp_configuration_id,
                bounce_alerts_enabled, bounce_alert_email,
                daily_report_enabled, weekly_report_enabled,
                auto_retry_enabled, auto_retry_max_attempts
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [uuidv4(), id, bAlert ? 1 : 0, aEmail, dReport ? 1 : 0, wDigest ? 1 : 0, rFail ? 1 : 0, rAttempts]
            );
          }
        } catch {
          //
        }
      }

      if (body.fromEmail !== undefined || body.fromName !== undefined || body.replyTo !== undefined) {
        try {
          const fromEmail = typeof body.fromEmail === 'string' ? body.fromEmail : null;
          const fromName = typeof body.fromName === 'string' ? body.fromName : null;
          const replyTo = typeof body.replyTo === 'string' ? body.replyTo : null;
          const existing = await queryRunner.query(
            'SELECT id FROM smtp_sender_identities WHERE smtp_configuration_id = ? AND is_default = 1 LIMIT 1',
            [id]
          );
          if (existing.length > 0) {
            const up: string[] = [];
            const p: any[] = [];
            if (fromEmail != null) {
              up.push('sender_email = ?');
              p.push(fromEmail);
            }
            if (fromName != null) {
              up.push('sender_name = ?');
              p.push(fromName);
            }
            if (replyTo != null) {
              up.push('reply_to_email = ?');
              p.push(replyTo);
            }
            if (up.length > 0) {
              p.push(existing[0].id);
              await queryRunner.query(`UPDATE smtp_sender_identities SET ${up.join(', ')} WHERE id = ?`, p);
            }
          } else if (fromEmail && fromName) {
            await queryRunner.query(
              `INSERT INTO smtp_sender_identities (uuid, smtp_configuration_id, sender_name, sender_email, reply_to_email, is_default, is_active)
               VALUES (?, ?, ?, ?, ?, 1, 1)`,
              [uuidv4(), id, fromName, fromEmail, replyTo || fromEmail]
            );
          }
        } catch {
          //
        }
      }

      await queryRunner.release();
      const config = await this.getByIdInternal(id);
      res.json({ success: true, data: config, message: 'Configuração SMTP atualizada com sucesso.' });
    } catch (error) {
      await queryRunner.release();
      next(error);
    }
  }

  /**
   * POST /smtp-configs/:id/test - testa conexão enviando e-mail de teste.
   * Suporta SMTP e API (SendGrid, Mailgun, etc.) conforme configurado na tela.
   */
  async test(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const id = parseInt((req as any).params.id, 10);
      const testEmail = (req.body as any)?.testEmail || (req.body as any)?.email;
      if (isNaN(id)) throw new AppError('ID inválido', 400);
      if (!testEmail || !String(testEmail).trim()) throw new AppError('Informe o e-mail de teste (testEmail)', 400);

      const [config] = await queryRunner.query(
        `SELECT sc.provider_type, sc.smtp_host, sc.smtp_port, sc.smtp_encryption, sc.smtp_username, sc.smtp_password,
                sc.api_key, sc.api_domain, sc.name,
                ep.slug AS provider_slug
         FROM smtp_configurations sc
         LEFT JOIN email_providers ep ON ep.id = sc.email_provider_id
         WHERE sc.id = ?`,
        [id]
      );
      if (!config) {
        await queryRunner.release();
        throw new AppError('Configuração não encontrada', 404);
      }

      const providerType = (config.provider_type || 'smtp').toLowerCase();
      if (providerType === 'unistays' || providerType === 'default') {
        await queryRunner.release();
        throw new AppError('Teste não disponível para configuração padrão (Uni Stays). Use SMTP ou API.', 400);
      }

      let fromEmail = config.smtp_username || '';
      let fromName = config.name || 'Unistays';
      let replyTo: string | null = config.smtp_username || null;
      const [idRow] = await queryRunner.query(
        'SELECT sender_email, sender_name, reply_to_email FROM smtp_sender_identities WHERE smtp_configuration_id = ? AND is_default = 1 AND is_active = 1 LIMIT 1',
        [id]
      );
      if (idRow && (idRow as any).sender_email) {
        fromEmail = (idRow as any).sender_email;
        fromName = (idRow as any).sender_name || fromName;
        replyTo = (idRow as any).reply_to_email || (idRow as any).sender_email;
      }

      const { EmailService } = await import('@/services/EmailService');

      if (providerType === 'api') {
        const apiKey = config.api_key ?? config.api_key_encrypted ?? '';
        const slug = config.provider_slug || 'sendgrid';
        const provider = EmailService.mapProviderSlugToProvider(slug);
        const apiConfig = {
          provider: provider as 'sendgrid' | 'mailgun' | 'ses' | 'brevo' | 'resend' | 'postmark',
          apiKey,
          domain: config.api_domain || undefined,
          fromEmail,
          fromName,
        };
        try {
          await EmailService.sendTestEmail('api', String(testEmail).trim(), apiConfig);
        } catch (err: any) {
          await queryRunner.query(
            `UPDATE smtp_configurations SET last_test_at = NOW(), last_test_result = 'failed', last_test_message = ? WHERE id = ?`,
            [err?.message || 'Falha no teste', id]
          );
          await queryRunner.release();
          throw err;
        }
      } else {
        const security = (config.smtp_encryption === 'ssl' ? 'ssl' : config.smtp_encryption === 'none' ? 'none' : 'tls') as 'tls' | 'ssl' | 'none';
        const smtpConfig = {
          server: config.smtp_host || '',
          port: Number(config.smtp_port) || 587,
          security,
          username: config.smtp_username || '',
          password: config.smtp_password || '',
          fromEmail: fromEmail || config.smtp_username || '',
          fromName: fromName || 'Unistays',
          replyTo: replyTo || undefined,
        };
        try {
          await EmailService.sendTestEmail('smtp', String(testEmail).trim(), smtpConfig);
        } catch (err: any) {
          await queryRunner.query(
            `UPDATE smtp_configurations SET last_test_at = NOW(), last_test_result = 'failed', last_test_message = ? WHERE id = ?`,
            [err?.message || 'Falha no teste', id]
          );
          await queryRunner.release();
          throw err;
        }
      }

      try {
        await queryRunner.query(
          `UPDATE smtp_configurations SET last_test_at = NOW(), last_test_result = 'success', last_test_message = NULL, last_test_email = ? WHERE id = ?`,
          [String(testEmail).trim(), id]
        );
      } catch {
        await queryRunner.query(
          `UPDATE smtp_configurations SET last_test_at = NOW(), last_test_result = 'success', last_test_message = NULL WHERE id = ?`,
          [id]
        );
      }
      await queryRunner.release();

      res.json({
        success: true,
        data: { success: true, message: 'E-mail de teste enviado com sucesso.' },
        message: `E-mail de teste enviado para ${String(testEmail).trim()}.`,
      });
    } catch (error) {
      try {
        await queryRunner.release();
      } catch {
        //
      }
      next(error);
    }
  }
}
