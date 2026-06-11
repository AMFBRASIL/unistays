import { Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateStockConfigInput, UpdateStockConfigInput } from '@/validators/stockConfig.validator';

/** Resposta unificada para o modal (schema 004: stock_configurations + alert + coding + fiscal) */
export interface StockConfigResponse {
  id: string;
  propertyId: number;
  // Geral (stock_configurations)
  allowNegativeStock: boolean;
  autoGenerateSKU: boolean;
  trackExpirationDate: boolean;
  trackBatchNumber: boolean;
  defaultUnit: string;
  defaultUnitId: string | null;
  defaultUnitInfo?: { id: string; code: string; name: string } | null;
  stockMethod: string;
  defaultMinStock: number;
  defaultMaxStock: number;
  defaultReorderPoint: number;
  autoReorder: boolean;
  reorderLeadTime: number;
  safetyStockPercent: number;
  // Alertas (stock_alert_configurations)
  enableLowStockAlert: boolean;
  enableExpirationAlert: boolean;
  expirationAlertDays: number;
  enableReorderAlert: boolean;
  enableOverstockAlert: boolean;
  alertEmail: boolean;
  alertPush: boolean;
  alertSMS: boolean;
  // Codificação (stock_coding_configurations)
  skuPrefix: string;
  skuDigits: number;
  enableEAN: boolean;
  eanPrefix: string;
  enableQRCode: boolean;
  qrCodeContent: string;
  // Fiscal (stock_fiscal_configurations)
  defaultNCM: string | null;
  defaultCFOP: string;
  defaultICMS: number;
  defaultPIS: number;
  defaultCOFINS: number;
  defaultIPI: number;
  createdAt?: string;
  updatedAt?: string;
}

function rowToResponse(row: any): StockConfigResponse {
  return {
    id: row.id,
    propertyId: row.propertyId,
    allowNegativeStock: Boolean(row.allowNegativeStock),
    autoGenerateSKU: row.autoGenerateSKU !== 0 && row.autoGenerateSKU !== false,
    trackExpirationDate: row.trackExpirationDate !== 0 && row.trackExpirationDate !== false,
    trackBatchNumber: Boolean(row.trackBatchNumber),
    defaultUnit: row.defaultUnit ?? 'un',
    defaultUnitId: row.defaultUnitId ?? null,
    defaultUnitInfo: row.defaultUnitId ? { id: row.defaultUnitId, code: row.unitCode ?? '', name: row.unitName ?? '' } : null,
    stockMethod: row.stockMethod ?? 'fifo',
    defaultMinStock: Number(row.defaultMinStock ?? 10),
    defaultMaxStock: Number(row.defaultMaxStock ?? 100),
    defaultReorderPoint: Number(row.defaultReorderPoint ?? 20),
    autoReorder: Boolean(row.autoReorder),
    reorderLeadTime: Number(row.reorderLeadTime ?? 7),
    safetyStockPercent: Number(row.safetyStockPercent ?? 15),
    enableLowStockAlert: row.enableLowStockAlert !== 0 && row.enableLowStockAlert !== false,
    enableExpirationAlert: row.enableExpirationAlert !== 0 && row.enableExpirationAlert !== false,
    expirationAlertDays: Number(row.expirationAlertDays ?? 30),
    enableReorderAlert: row.enableReorderAlert !== 0 && row.enableReorderAlert !== false,
    enableOverstockAlert: Boolean(row.enableOverstockAlert),
    alertEmail: row.alertEmail !== 0 && row.alertEmail !== false,
    alertPush: row.alertPush !== 0 && row.alertPush !== false,
    alertSMS: Boolean(row.alertSMS),
    skuPrefix: row.skuPrefix ?? 'PRD',
    skuDigits: Number(row.skuDigits ?? 6),
    enableEAN: row.enableEAN !== 0 && row.enableEAN !== false,
    eanPrefix: row.eanPrefix ?? '789',
    enableQRCode: row.enableQRCode !== 0 && row.enableQRCode !== false,
    qrCodeContent: row.qrCodeContent ?? 'sku',
    defaultNCM: row.defaultNCM ?? null,
    defaultCFOP: row.defaultCFOP ?? '5102',
    defaultICMS: Number(row.defaultICMS ?? 18),
    defaultPIS: Number(row.defaultPIS ?? 1.65),
    defaultCOFINS: Number(row.defaultCOFINS ?? 7.6),
    defaultIPI: Number(row.defaultIPI ?? 0),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class StockConfigController {
  private readonly allowedDefaultUnits = new Set(['un', 'kg', 'lt', 'mt', 'cx', 'pc']);

  private async ensureDefaultUnitSchemaCompatibility(queryRunner: any): Promise<void> {
    const columnRows = await queryRunner.query(
      `SELECT DATA_TYPE AS dataType, COLUMN_TYPE AS columnType
         FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'stock_configurations'
          AND COLUMN_NAME = 'default_unit_id'
        LIMIT 1`
    );
    const dataType = String(columnRows?.[0]?.dataType || '').toLowerCase();

    // Se já é inteiro, schema está compatível com FK para measurement_units.id.
    if (['int', 'integer', 'bigint', 'mediumint', 'smallint', 'tinyint'].includes(dataType)) {
      return;
    }

    const fkRows = await queryRunner.query(
      `SELECT CONSTRAINT_NAME AS constraintName
         FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'stock_configurations'
          AND COLUMN_NAME = 'default_unit_id'
          AND REFERENCED_TABLE_NAME = 'measurement_units'
        LIMIT 1`
    );
    const fkName = fkRows?.[0]?.constraintName ? String(fkRows[0].constraintName) : null;
    if (fkName) {
      await queryRunner.query(`ALTER TABLE stock_configurations DROP FOREIGN KEY \`${fkName}\``);
    }

    // Tenta converter valores UUID legados -> id numérico da unidade.
    await queryRunner.query(
      `UPDATE stock_configurations sc
          LEFT JOIN measurement_units mu ON mu.uuid = sc.default_unit_id
         SET sc.default_unit_id = CAST(mu.id AS CHAR)
       WHERE sc.default_unit_id IS NOT NULL
         AND sc.default_unit_id <> ''
         AND mu.id IS NOT NULL`
    );

    // Qualquer valor não numérico fica NULL para não quebrar a conversão/FK.
    await queryRunner.query(
      `UPDATE stock_configurations
          SET default_unit_id = NULL
        WHERE default_unit_id IS NOT NULL
          AND default_unit_id <> ''
          AND default_unit_id REGEXP '[^0-9]'`
    );

    await queryRunner.query(
      `ALTER TABLE stock_configurations
         MODIFY COLUMN default_unit_id INT(10) UNSIGNED NULL`
    );

    await queryRunner.query(
      `ALTER TABLE stock_configurations
         ADD CONSTRAINT fk_stock_config_default_unit
         FOREIGN KEY (default_unit_id) REFERENCES measurement_units(id) ON DELETE SET NULL`
    );
  }

  private async getDefaultUnitReferenceColumn(queryRunner: any): Promise<'id' | 'uuid'> {
    try {
      const rows = await queryRunner.query(
        `SELECT kcu.REFERENCED_COLUMN_NAME AS referencedColumn
           FROM information_schema.KEY_COLUMN_USAGE kcu
          WHERE kcu.TABLE_SCHEMA = DATABASE()
            AND kcu.TABLE_NAME = 'stock_configurations'
            AND kcu.COLUMN_NAME = 'default_unit_id'
            AND kcu.REFERENCED_TABLE_NAME = 'measurement_units'
          LIMIT 1`
      );
      const ref = String(rows?.[0]?.referencedColumn || 'id').toLowerCase();
      return ref === 'uuid' ? 'uuid' : 'id';
    } catch {
      return 'id';
    }
  }

  private async resolveMeasurementUnitId(
    queryRunner: any,
    rawUnitId: string | number | null | undefined,
    rawUnitCode?: string | null
  ): Promise<string | number | null> {
    if (rawUnitId == null || rawUnitId === '') return null;

    const raw = String(rawUnitId).trim();
    if (!raw) return null;
    const refColumn = await this.getDefaultUnitReferenceColumn(queryRunner);

    // Resolve por ID numérico direto (ambientes clássicos com measurement_units.id int)
    if (/^\d+$/.test(raw)) {
      const byNumericId = await queryRunner.query(
        `SELECT id, uuid
           FROM measurement_units
          WHERE id = ?
          LIMIT 1`,
        [Number(raw)]
      );
      if (byNumericId.length > 0) {
        return refColumn === 'uuid' ? byNumericId[0].uuid : byNumericId[0].id;
      }
    }

    // Resolve por UUID explícito.
    const byUuid = await queryRunner.query(
      `SELECT id, uuid
         FROM measurement_units
        WHERE uuid = ?
        LIMIT 1`,
      [raw]
    );
    if (byUuid.length > 0) {
      return refColumn === 'uuid' ? byUuid[0].uuid : byUuid[0].id;
    }

    // Fallback por código/símbolo quando vier defaultUnit (ex.: "un", "kg")
    if (rawUnitCode && String(rawUnitCode).trim()) {
      const code = String(rawUnitCode).trim();
      const byCode = await queryRunner.query(
        `SELECT id, uuid
           FROM measurement_units
          WHERE UPPER(code) = UPPER(?) OR UPPER(symbol) = UPPER(?)
          LIMIT 1`,
        [code, code]
      );
      if (byCode.length > 0) {
        return refColumn === 'uuid' ? byCode[0].uuid : byCode[0].id;
      }
    }

    // Última tentativa tolerante para schemas heterogêneos.
    const byAny = await queryRunner.query(
      `SELECT id, uuid
         FROM measurement_units
        WHERE CAST(id AS CHAR) = ? OR uuid = ?
        LIMIT 1`,
      [raw, raw]
    );
    if (byAny.length > 0) {
      return refColumn === 'uuid' ? byAny[0].uuid : byAny[0].id;
    }

    return null;
  }

  private async resolveDefaultUnitCode(
    queryRunner: any,
    resolvedUnitId: string | number | null,
    rawDefaultUnit?: string | null
  ): Promise<'un' | 'kg' | 'lt' | 'mt' | 'cx' | 'pc'> {
    const fromRaw = (rawDefaultUnit || '').toString().trim().toLowerCase();
    if (this.allowedDefaultUnits.has(fromRaw)) {
      return fromRaw as 'un' | 'kg' | 'lt' | 'mt' | 'cx' | 'pc';
    }

    if (resolvedUnitId != null) {
      const rows = await queryRunner.query(
        `SELECT code, symbol FROM measurement_units WHERE CAST(id AS CHAR) = ? LIMIT 1`,
        [String(resolvedUnitId)]
      );
      if (rows.length > 0) {
        const code = (rows[0].code || rows[0].symbol || '').toString().trim().toLowerCase();
        if (this.allowedDefaultUnits.has(code)) {
          return code as 'un' | 'kg' | 'lt' | 'mt' | 'cx' | 'pc';
        }
      }
    }

    return 'un';
  }

  /**
   * GET: Busca configuração por property_id.
   * Usa schema 004: stock_configurations + stock_alert_configurations + stock_coding_configurations + stock_fiscal_configurations.
   * Se essas tabelas não existirem, tenta stock_config (legado).
   */
  async getCurrent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      const { propertyId: propertyIdParam } = req.query;
      const propertyId = propertyIdParam ? parseInt(propertyIdParam as string, 10) : null;

      if (propertyId == null || isNaN(propertyId)) {
        res.json({
          success: true,
          data: null,
          message: 'Informe propertyId para carregar a configuração.',
        });
        await queryRunner.release();
        return;
      }

      // Tentar schema 004 (stock_configurations + child tables)
      const query004 = `
        SELECT
          sc.id,
          sc.property_id AS propertyId,
          sc.allow_negative_stock AS allowNegativeStock,
          sc.auto_generate_sku AS autoGenerateSKU,
          sc.track_expiration_date AS trackExpirationDate,
          sc.track_batch_number AS trackBatchNumber,
          sc.default_unit AS defaultUnit,
          sc.default_unit_id AS defaultUnitId,
          mu.code AS unitCode,
          mu.name AS unitName,
          sc.stock_method AS stockMethod,
          sc.default_min_stock AS defaultMinStock,
          sc.default_max_stock AS defaultMaxStock,
          sc.default_reorder_point AS defaultReorderPoint,
          sc.auto_reorder AS autoReorder,
          sc.reorder_lead_time AS reorderLeadTime,
          sc.safety_stock_percent AS safetyStockPercent,
          sc.created_at AS createdAt,
          sc.updated_at AS updatedAt,
          sac.enable_low_stock_alert AS enableLowStockAlert,
          sac.enable_expiration_alert AS enableExpirationAlert,
          sac.expiration_alert_days AS expirationAlertDays,
          sac.enable_reorder_alert AS enableReorderAlert,
          sac.enable_overstock_alert AS enableOverstockAlert,
          sac.alert_email AS alertEmail,
          sac.alert_push AS alertPush,
          sac.alert_sms AS alertSMS,
          scc.sku_prefix AS skuPrefix,
          scc.sku_digits AS skuDigits,
          scc.enable_ean AS enableEAN,
          scc.ean_prefix AS eanPrefix,
          scc.enable_qrcode AS enableQRCode,
          scc.qrcode_content AS qrCodeContent,
          sfc.default_ncm AS defaultNCM,
          sfc.default_cfop_internal AS defaultCFOP,
          sfc.default_icms_rate AS defaultICMS,
          sfc.default_pis_rate AS defaultPIS,
          sfc.default_cofins_rate AS defaultCOFINS,
          sfc.default_ipi_rate AS defaultIPI
        FROM stock_configurations sc
        LEFT JOIN measurement_units mu ON sc.default_unit_id = mu.id AND (mu.is_active = 1 OR mu.is_active IS NULL)
        LEFT JOIN stock_alert_configurations sac ON sc.id = sac.stock_config_id
        LEFT JOIN stock_coding_configurations scc ON sc.id = scc.stock_config_id
        LEFT JOIN stock_fiscal_configurations sfc ON sc.id = sfc.stock_config_id
        WHERE sc.property_id = ?
        LIMIT 1
      `;

      let results: any[];
      try {
        results = await queryRunner.query(query004, [propertyId]);
      } catch (err: any) {
        if (err?.code === 'ER_NO_SUCH_TABLE' && err?.message?.includes('stock_configurations')) {
          results = [];
        } else {
          throw err;
        }
      }

      await queryRunner.release();

      if (results.length === 0) {
        res.json({
          success: true,
          data: null,
          message: 'Nenhuma configuração encontrada. Salve para criar.',
        });
        return;
      }

      const config = rowToResponse(results[0]);
      res.json({ success: true, data: config });
    } catch (error) {
      await queryRunner.release();
      next(error);
    }
  }

  /**
   * POST: Cria ou atualiza configuração (schema 004).
   * Requer propertyId. Upsert em stock_configurations e nas 3 tabelas filhas.
   */
  async createOrUpdate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await this.ensureDefaultUnitSchemaCompatibility(queryRunner);
      await queryRunner.startTransaction();

      const data = req.body as CreateStockConfigInput | UpdateStockConfigInput;
      const propertyId = data.propertyId;
      const resolvedDefaultUnitId = await this.resolveMeasurementUnitId(
        queryRunner,
        data.defaultUnitId as any,
        (data as any).defaultUnit ?? null
      );
      const resolvedDefaultUnit = await this.resolveDefaultUnitCode(
        queryRunner,
        resolvedDefaultUnitId,
        (data as any).defaultUnit ?? null
      );

      if (propertyId == null || typeof propertyId !== 'number' || propertyId <= 0) {
        throw new AppError('propertyId é obrigatório e deve ser um número positivo.', 400);
      }
      if (data.defaultUnitId != null && String(data.defaultUnitId).trim() !== '' && resolvedDefaultUnitId == null) {
        throw new AppError('Unidade padrão inválida. Selecione uma unidade de medida existente.', 400);
      }

      // Verificar se stock_configurations existe
      let existing: any[] = [];
      try {
        existing = await queryRunner.query(
          'SELECT id FROM stock_configurations WHERE property_id = ? LIMIT 1',
          [propertyId]
        );
      } catch (err: any) {
        if (err?.code === 'ER_NO_SUCH_TABLE') {
          throw new AppError(
            'Tabelas de configuração de estoque (004) não encontradas. Execute a migração stock_configurations.',
            503
          );
        }
        throw err;
      }

      if (existing.length > 0) {
        const configId = existing[0].id;

        await queryRunner.query(
          `UPDATE stock_configurations SET
            allow_negative_stock = ?, auto_generate_sku = ?, track_expiration_date = ?, track_batch_number = ?,
            default_unit = ?, default_unit_id = ?, stock_method = ?,
            default_min_stock = ?, default_max_stock = ?, default_reorder_point = ?,
            auto_reorder = ?, reorder_lead_time = ?, safety_stock_percent = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
          [
            data.allowNegativeStock ? 1 : 0,
            data.autoGenerateSKU !== false ? 1 : 0,
            data.trackExpirationDate !== false ? 1 : 0,
            data.trackBatchNumber ? 1 : 0,
            resolvedDefaultUnit,
            resolvedDefaultUnitId,
            data.stockMethod ?? 'fifo',
            data.defaultMinStock ?? 10,
            data.defaultMaxStock ?? 100,
            data.defaultReorderPoint ?? 20,
            data.autoReorder ? 1 : 0,
            data.reorderLeadTime ?? 7,
            data.safetyStockPercent ?? 15,
            configId,
          ]
        );

        // Upsert: garante gravação mesmo quando a linha filha não existir (ex.: trigger ausente)
        await queryRunner.query(
          `INSERT INTO stock_alert_configurations (id, stock_config_id, enable_low_stock_alert, enable_expiration_alert, expiration_alert_days, enable_reorder_alert, enable_overstock_alert, alert_email, alert_push, alert_sms)
           VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             enable_low_stock_alert = VALUES(enable_low_stock_alert),
             enable_expiration_alert = VALUES(enable_expiration_alert),
             expiration_alert_days = VALUES(expiration_alert_days),
             enable_reorder_alert = VALUES(enable_reorder_alert),
             enable_overstock_alert = VALUES(enable_overstock_alert),
             alert_email = VALUES(alert_email),
             alert_push = VALUES(alert_push),
             alert_sms = VALUES(alert_sms),
             updated_at = CURRENT_TIMESTAMP`,
          [
            configId,
            data.enableLowStockAlert !== false ? 1 : 0,
            data.enableExpirationAlert !== false ? 1 : 0,
            data.expirationAlertDays ?? 30,
            data.enableReorderAlert !== false ? 1 : 0,
            data.enableOverstockAlert ? 1 : 0,
            data.alertEmail !== false ? 1 : 0,
            data.alertPush !== false ? 1 : 0,
            data.alertSMS ? 1 : 0,
          ]
        );

        await queryRunner.query(
          `INSERT INTO stock_coding_configurations (id, stock_config_id, sku_prefix, sku_digits, enable_ean, ean_prefix, enable_qrcode, qrcode_content)
           VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             sku_prefix = VALUES(sku_prefix),
             sku_digits = VALUES(sku_digits),
             enable_ean = VALUES(enable_ean),
             ean_prefix = VALUES(ean_prefix),
             enable_qrcode = VALUES(enable_qrcode),
             qrcode_content = VALUES(qrcode_content),
             updated_at = CURRENT_TIMESTAMP`,
          [
            configId,
            data.skuPrefix ?? 'PRD',
            data.skuDigits ?? 6,
            data.enableEAN !== false ? 1 : 0,
            data.eanPrefix ?? '789',
            data.enableQRCode !== false ? 1 : 0,
            data.qrCodeContent ?? 'sku',
          ]
        );

        await queryRunner.query(
          `INSERT INTO stock_fiscal_configurations (id, stock_config_id, default_ncm, default_cfop_internal, default_icms_rate, default_pis_rate, default_cofins_rate, default_ipi_rate)
           VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             default_ncm = VALUES(default_ncm),
             default_cfop_internal = VALUES(default_cfop_internal),
             default_icms_rate = VALUES(default_icms_rate),
             default_pis_rate = VALUES(default_pis_rate),
             default_cofins_rate = VALUES(default_cofins_rate),
             default_ipi_rate = VALUES(default_ipi_rate),
             updated_at = CURRENT_TIMESTAMP`,
          [
            configId,
            data.defaultNCM ?? null,
            data.defaultCFOP ?? '5102',
            data.defaultICMS ?? 18,
            data.defaultPIS ?? 1.65,
            data.defaultCOFINS ?? 7.6,
            data.defaultIPI ?? 0,
          ]
        );
      } else {
        const idResult = await queryRunner.query('SELECT UUID() AS id');
        const configId = idResult[0].id;

        await queryRunner.query(
          `INSERT INTO stock_configurations (
            id, property_id,
            allow_negative_stock, auto_generate_sku, track_expiration_date, track_batch_number,
            default_unit, default_unit_id, stock_method,
            default_min_stock, default_max_stock, default_reorder_point,
            auto_reorder, reorder_lead_time, safety_stock_percent
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            configId,
            propertyId,
            data.allowNegativeStock ? 1 : 0,
            data.autoGenerateSKU !== false ? 1 : 0,
            data.trackExpirationDate !== false ? 1 : 0,
            data.trackBatchNumber ? 1 : 0,
            resolvedDefaultUnit,
            resolvedDefaultUnitId,
            data.stockMethod ?? 'fifo',
            data.defaultMinStock ?? 10,
            data.defaultMaxStock ?? 100,
            data.defaultReorderPoint ?? 20,
            data.autoReorder ? 1 : 0,
            data.reorderLeadTime ?? 7,
            data.safetyStockPercent ?? 15,
          ]
        );

        // Upsert nas tabelas filhas (trigger pode ter criado as linhas; se não, INSERT cria)
        await queryRunner.query(
          `INSERT INTO stock_alert_configurations (id, stock_config_id, enable_low_stock_alert, enable_expiration_alert, expiration_alert_days, enable_reorder_alert, enable_overstock_alert, alert_email, alert_push, alert_sms)
           VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             enable_low_stock_alert = VALUES(enable_low_stock_alert),
             enable_expiration_alert = VALUES(enable_expiration_alert),
             expiration_alert_days = VALUES(expiration_alert_days),
             enable_reorder_alert = VALUES(enable_reorder_alert),
             enable_overstock_alert = VALUES(enable_overstock_alert),
             alert_email = VALUES(alert_email),
             alert_push = VALUES(alert_push),
             alert_sms = VALUES(alert_sms),
             updated_at = CURRENT_TIMESTAMP`,
          [
            configId,
            data.enableLowStockAlert !== false ? 1 : 0,
            data.enableExpirationAlert !== false ? 1 : 0,
            data.expirationAlertDays ?? 30,
            data.enableReorderAlert !== false ? 1 : 0,
            data.enableOverstockAlert ? 1 : 0,
            data.alertEmail !== false ? 1 : 0,
            data.alertPush !== false ? 1 : 0,
            data.alertSMS ? 1 : 0,
          ]
        );

        await queryRunner.query(
          `INSERT INTO stock_coding_configurations (id, stock_config_id, sku_prefix, sku_digits, enable_ean, ean_prefix, enable_qrcode, qrcode_content)
           VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             sku_prefix = VALUES(sku_prefix),
             sku_digits = VALUES(sku_digits),
             enable_ean = VALUES(enable_ean),
             ean_prefix = VALUES(ean_prefix),
             enable_qrcode = VALUES(enable_qrcode),
             qrcode_content = VALUES(qrcode_content),
             updated_at = CURRENT_TIMESTAMP`,
          [
            configId,
            data.skuPrefix ?? 'PRD',
            data.skuDigits ?? 6,
            data.enableEAN !== false ? 1 : 0,
            data.eanPrefix ?? '789',
            data.enableQRCode !== false ? 1 : 0,
            data.qrCodeContent ?? 'sku',
          ]
        );

        await queryRunner.query(
          `INSERT INTO stock_fiscal_configurations (id, stock_config_id, default_ncm, default_cfop_internal, default_icms_rate, default_pis_rate, default_cofins_rate, default_ipi_rate)
           VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             default_ncm = VALUES(default_ncm),
             default_cfop_internal = VALUES(default_cfop_internal),
             default_icms_rate = VALUES(default_icms_rate),
             default_pis_rate = VALUES(default_pis_rate),
             default_cofins_rate = VALUES(default_cofins_rate),
             default_ipi_rate = VALUES(default_ipi_rate),
             updated_at = CURRENT_TIMESTAMP`,
          [
            configId,
            data.defaultNCM ?? null,
            data.defaultCFOP ?? '5102',
            data.defaultICMS ?? 18,
            data.defaultPIS ?? 1.65,
            data.defaultCOFINS ?? 7.6,
            data.defaultIPI ?? 0,
          ]
        );
      }

      // Compatibilidade com schema legado:
      // parte do sistema ainda consulta `stock_config` (incluindo indicadores de setup).
      // Espelha os principais campos por propriedade quando a tabela existir.
      try {
        const negStockColRows = await queryRunner.query(
          `SELECT column_name AS columnName
             FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'stock_config'
              AND column_name IN ('negative_stock_allowed', 'allow_negative_stock')
            LIMIT 1`
        );
        const negativeStockColumn =
          (negStockColRows?.[0]?.columnName as string | undefined) || 'negative_stock_allowed';

        const legacyRow = await queryRunner.query(
          `SELECT id FROM stock_config WHERE property_id = ? LIMIT 1`,
          [propertyId]
        );

        if (legacyRow.length > 0) {
          await queryRunner.query(
            `UPDATE stock_config SET
              low_stock_threshold = ?,
              critical_stock_threshold = ?,
              ${negativeStockColumn} = ?,
              cost_method = ?,
              track_expiration = ?,
              track_by_batch = ?,
              updated_at = CURRENT_TIMESTAMP
             WHERE property_id = ?`,
            [
              data.defaultMinStock ?? 10,
              data.defaultReorderPoint ?? 20,
              data.allowNegativeStock ? 1 : 0,
              data.stockMethod ?? 'fifo',
              data.trackExpirationDate !== false ? 1 : 0,
              data.trackBatchNumber ? 1 : 0,
              propertyId,
            ]
          );
        } else {
          await queryRunner.query(
            `INSERT INTO stock_config (
              uuid, property_id,
              low_stock_threshold, critical_stock_threshold,
              ${negativeStockColumn}, cost_method,
              track_expiration, track_by_batch,
              created_at, updated_at
            ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
              propertyId,
              data.defaultMinStock ?? 10,
              data.defaultReorderPoint ?? 20,
              data.allowNegativeStock ? 1 : 0,
              data.stockMethod ?? 'fifo',
              data.trackExpirationDate !== false ? 1 : 0,
              data.trackBatchNumber ? 1 : 0,
            ]
          );
        }
      } catch (legacyError: any) {
        // Se a tabela legada não existir, segue sem bloquear o fluxo principal.
        if (legacyError?.code !== 'ER_NO_SUCH_TABLE') {
          throw legacyError;
        }
      }

      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: existing.length > 0 ? 'Configuração de estoque atualizada com sucesso.' : 'Configuração de estoque criada com sucesso.',
      });
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      next(error);
    }
  }
}
