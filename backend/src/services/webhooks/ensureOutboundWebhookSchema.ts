import { AppDataSource } from '@/config/database';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { randomBytes } from 'crypto';

let schemaReady = false;

/**
 * Outbound webhooks (tela /registrations → Webhooks).
 * Unistays envia eventos do sistema para URLs externas (CRM, pagamentos, etc.).
 * Diferente do webhook Channex (entrada de reservas), que fica em /integrations.
 */
export async function ensureOutboundWebhookSchema(): Promise<void> {
  if (schemaReady) return;
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const qr = AppDataSource.createQueryRunner();
  try {
    await qr.query(`
      CREATE TABLE IF NOT EXISTS outbound_webhooks (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid CHAR(36) NOT NULL,
        name VARCHAR(160) NOT NULL,
        url VARCHAR(500) NOT NULL,
        secret VARCHAR(120) NOT NULL,
        events JSON NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        last_triggered_at DATETIME NULL,
        last_status ENUM('success','error','pending') NULL,
        success_count INT UNSIGNED NOT NULL DEFAULT 0,
        error_count INT UNSIGNED NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_outbound_webhooks_uuid (uuid),
        KEY idx_outbound_webhooks_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS outbound_webhook_deliveries (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        webhook_id INT UNSIGNED NOT NULL,
        event_name VARCHAR(80) NOT NULL,
        request_body JSON NULL,
        response_status INT NULL,
        response_body TEXT NULL,
        status ENUM('success','error') NOT NULL,
        error_message TEXT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_owd_webhook (webhook_id, created_at),
        CONSTRAINT fk_owd_webhook
          FOREIGN KEY (webhook_id) REFERENCES outbound_webhooks(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const existing = await qr.query(
      `SELECT id FROM outbound_webhooks WHERE name = ? LIMIT 1`,
      ['Unistays Event Log (interno)'],
    );

    if (!existing.length) {
      const secret = `whsec_${randomBytes(18).toString('hex')}`;
      const base = (env.API_PUBLIC_URL || `http://localhost:${env.PORT}`).replace(/\/$/, '');
      const echoUrl = `${base}/api/${env.API_VERSION}/outbound-webhooks/echo`;
      const { v4: uuidv4 } = await import('uuid');

      await qr.query(
        `INSERT INTO outbound_webhooks
          (uuid, name, url, secret, events, is_active, last_status)
         VALUES (?, ?, ?, ?, ?, 1, 'pending')`,
        [
          uuidv4(),
          'Unistays Event Log (interno)',
          echoUrl,
          secret,
          JSON.stringify([
            'reservation.created',
            'reservation.cancelled',
            'guest.created',
            'payment.received',
          ]),
        ],
      );

      logger.info('[ensureOutboundWebhookSchema] seed webhook interno criado', { url: echoUrl });
    }

    schemaReady = true;
  } catch (error) {
    logger.error('[ensureOutboundWebhookSchema] failed', error);
    throw error;
  } finally {
    await qr.release();
  }
}
