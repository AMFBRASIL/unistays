import { AppDataSource } from '@/config/database';
import { logger } from '@/utils/logger';

let schemaReady = false;

/**
 * Ensures provider-agnostic integration tables exist.
 * Kept in TypeScript (not .sql) so the layer survives .gitignore of SQL dumps.
 */
export async function ensureIntegrationSchema(): Promise<void> {
  if (schemaReady) return;
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const qr = AppDataSource.createQueryRunner();
  try {
    await qr.query(`
      CREATE TABLE IF NOT EXISTS integration_providers (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        code VARCHAR(50) NOT NULL,
        name VARCHAR(120) NOT NULL,
        category VARCHAR(50) NOT NULL DEFAULT 'channel_manager',
        description TEXT NULL,
        logo_url VARCHAR(500) NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        capabilities JSON NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_integration_providers_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS integration_connections (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid CHAR(36) NOT NULL,
        provider_id INT UNSIGNED NOT NULL,
        property_id INT UNSIGNED NULL,
        name VARCHAR(160) NOT NULL,
        status ENUM('disconnected','connected','error','disabled') NOT NULL DEFAULT 'disconnected',
        auth_type ENUM('access_token','oauth') NOT NULL DEFAULT 'access_token',
        credentials_encrypted TEXT NULL,
        settings JSON NULL,
        external_account_id VARCHAR(120) NULL,
        last_sync_at DATETIME NULL,
        last_error TEXT NULL,
        webhook_secret VARCHAR(120) NULL,
        created_by INT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_integration_connections_uuid (uuid),
        KEY idx_integration_connections_provider (provider_id),
        KEY idx_integration_connections_property (property_id),
        KEY idx_integration_connections_status (status),
        CONSTRAINT fk_integration_connections_provider
          FOREIGN KEY (provider_id) REFERENCES integration_providers(id)
          ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS integration_entity_mappings (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        connection_id INT UNSIGNED NOT NULL,
        entity_type ENUM('property','unit','room_type','rate_plan','listing','channel') NOT NULL,
        local_id INT UNSIGNED NOT NULL,
        external_id VARCHAR(120) NOT NULL,
        external_label VARCHAR(255) NULL,
        metadata JSON NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_integration_mapping (connection_id, entity_type, local_id),
        KEY idx_integration_mapping_ext (connection_id, entity_type, external_id),
        KEY idx_integration_mapping_local (entity_type, local_id),
        CONSTRAINT fk_integration_mapping_connection
          FOREIGN KEY (connection_id) REFERENCES integration_connections(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Inventário compartilhado: N units Unistays → 1 room_type Channex
    try {
      await qr.query(
        `ALTER TABLE integration_entity_mappings DROP INDEX uq_integration_mapping_ext`,
      );
    } catch {
      /* index já removido ou tabela nova sem ele */
    }
    try {
      await qr.query(
        `CREATE INDEX idx_integration_mapping_ext
         ON integration_entity_mappings (connection_id, entity_type, external_id)`,
      );
    } catch {
      /* índice já existe */
    }

    await qr.query(`
      CREATE TABLE IF NOT EXISTS integration_sync_logs (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        connection_id INT UNSIGNED NOT NULL,
        direction ENUM('inbound','outbound') NOT NULL,
        module ENUM('connection','reservations','availability','rates','messages','reviews','tasks','webhooks','other') NOT NULL DEFAULT 'other',
        action VARCHAR(80) NOT NULL,
        status ENUM('success','error','skipped','pending') NOT NULL DEFAULT 'pending',
        external_ref VARCHAR(160) NULL,
        request_summary JSON NULL,
        response_summary JSON NULL,
        error_message TEXT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_integration_sync_logs_conn (connection_id, created_at),
        KEY idx_integration_sync_logs_module (module, status),
        CONSTRAINT fk_integration_sync_logs_connection
          FOREIGN KEY (connection_id) REFERENCES integration_connections(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Hostex removido — concorrente, não é o CM do Unistays. Desativa se existir.
    await qr.query(
      `UPDATE integration_providers SET is_active = 0, updated_at = NOW() WHERE code = 'hostex'`,
    );
    await qr.query(`
      DELETE c FROM integration_connections c
      INNER JOIN integration_providers p ON p.id = c.provider_id
      WHERE p.code = 'hostex'
    `);

    await qr.query(`
      INSERT INTO integration_providers (code, name, category, description, is_active, capabilities)
      VALUES (
        'channex',
        'Channex',
        'channel_manager',
        'Channel Manager para PMS (Channex.io). Unistays empurra ARI e recebe reservas das OTAs (Booking.com, Airbnb, Expedia…) via API oficial.',
        1,
        JSON_OBJECT(
          'reservations', true,
          'availability', true,
          'rates', true,
          'messages', true,
          'reviews', true,
          'webhooks', true,
          'ari', true
        )
      )
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        description = VALUES(description),
        capabilities = VALUES(capabilities),
        is_active = 1
    `);

    schemaReady = true;
  } catch (error) {
    logger.error('[ensureIntegrationSchema] failed', error);
    throw error;
  } finally {
    await qr.release();
  }
}
