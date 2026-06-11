import { AppDataSource } from '@/config/database';
import { env } from '@/config/env';

async function scalar(sql: string, params: unknown[] = []): Promise<number> {
  const rows = await AppDataSource.query(sql, params);
  if (!rows?.length) return 0;
  const row = rows[0] as Record<string, unknown>;
  const v = row.c ?? row.cnt ?? row.count ?? row.total;
  return Number(v) || 0;
}

async function exists(sql: string, params: unknown[] = []): Promise<boolean> {
  return (await scalar(sql, params)) > 0;
}

async function safeExists(sql: string, params: unknown[] = []): Promise<boolean> {
  try {
    return await exists(sql, params);
  } catch {
    return false;
  }
}

/** Indicadores de setup alinhados aos ids usados em SetupProgress (frontend). */
export class SetupProgressService {
  static async compute(): Promise<{ items: Record<string, boolean> }> {
    const items: Record<string, boolean> = {};

    const propCount = await scalar(`SELECT COUNT(*) AS c FROM properties WHERE deleted_at IS NULL`);
    items['prop-1'] = propCount > 0;
    items['prop-2'] = await exists(
      `SELECT 1 AS c FROM properties
       WHERE deleted_at IS NULL
         AND address IS NOT NULL AND TRIM(address) <> ''
         AND city IS NOT NULL AND TRIM(city) <> ''
       LIMIT 1`
    );

    const propsRows = await AppDataSource.query(
      `SELECT settings FROM properties WHERE deleted_at IS NULL`
    ).catch(() => [] as { settings: unknown }[]);

    let hasCheckTimes = false;
    for (const p of propsRows as { settings: unknown }[]) {
      if (!p.settings) continue;
      let settings: Record<string, unknown>;
      try {
        settings =
          typeof p.settings === 'string' ? JSON.parse(p.settings) : (p.settings as Record<string, unknown>);
      } catch {
        continue;
      }
      const ci =
        settings.checkInTime ||
        settings.checkIn ||
        settings.check_in_time ||
        settings.check_in;
      const co =
        settings.checkOutTime ||
        settings.checkOut ||
        settings.check_out_time ||
        settings.check_out;
      if (ci && co) {
        hasCheckTimes = true;
        break;
      }
    }
    items['prop-3'] = hasCheckTimes;

    items['prop-4'] = await exists(
      `SELECT 1 AS c FROM properties WHERE deleted_at IS NULL
         AND (
           (logo IS NOT NULL AND TRIM(logo) <> '')
           OR (images IS NOT NULL AND JSON_LENGTH(images) > 0)
         ) LIMIT 1`
    );

    const unitCount = await scalar(`SELECT COUNT(*) AS c FROM units WHERE deleted_at IS NULL`);
    items['unit-1'] = unitCount > 0;
    const badCapacity = await scalar(
      `SELECT COUNT(*) AS c FROM units WHERE deleted_at IS NULL
         AND (capacity IS NULL OR capacity < 1 OR max_capacity IS NULL OR max_capacity < capacity)`
    );
    items['unit-2'] = unitCount > 0 && badCapacity === 0;

    const rtaCount = await scalar(`SELECT COUNT(*) AS c FROM room_type_amenities`).catch(() => 0);
    items['unit-3'] = rtaCount > 0;

    const unitsWithPhotos = await scalar(
      `SELECT COUNT(*) AS c FROM units WHERE deleted_at IS NULL
         AND images IS NOT NULL AND JSON_LENGTH(images) > 0`
    );
    items['unit-4'] = unitsWithPhotos > 0;

    items['rate-1'] =
      (await scalar(`SELECT COUNT(*) AS c FROM rate_plans WHERE deleted_at IS NULL`)) > 0;
    items['rate-2'] = (await scalar(`SELECT COUNT(*) AS c FROM seasons WHERE deleted_at IS NULL`)) > 0;
    items['rate-3'] = await exists(
      `SELECT 1 AS c FROM policies WHERE deleted_at IS NULL AND policy_type = 'cancellation' LIMIT 1`
    );
    items['rate-4'] =
      (await scalar(`SELECT COUNT(*) AS c FROM promotions WHERE deleted_at IS NULL`)) > 0;

    items['inv-1'] =
      (await scalar(`SELECT COUNT(*) AS c FROM product_categories WHERE is_active = 1`)) > 0;
    items['inv-2'] = (await scalar(`SELECT COUNT(*) AS c FROM products WHERE status = 'active'`)) > 0;

    const stockByProperty = await scalar(
      `SELECT COUNT(*) AS c FROM stock_config WHERE property_id IS NOT NULL`
    );
    items['inv-3'] = stockByProperty > 0;

    items['inv-4'] =
      (await scalar(`SELECT COUNT(*) AS c FROM suppliers WHERE deleted_at IS NULL AND status = 'active'`)) >
      0;

    items['pay-1'] = (await scalar(`SELECT COUNT(*) AS c FROM payment_methods WHERE is_active = 1`)) > 0;

    const gnOk =
      Boolean(env.EFI_GN_ENABLED) &&
      Boolean(env.EFI_GN_CLIENT_ID?.trim()) &&
      Boolean(env.EFI_GN_CLIENT_SECRET?.trim());
    const pmGateway =
      (await scalar(
        `SELECT COUNT(*) AS c FROM payment_methods WHERE is_active = 1
         AND details IS NOT NULL AND JSON_LENGTH(details) > 0`
      )) > 0;
    items['pay-2'] = gnOk || pmGateway;

    const pay3Invoice = await exists(
      `SELECT 1 AS c FROM invoice_params ip
       INNER JOIN properties p ON p.id = ip.property_id AND p.deleted_at IS NULL
       WHERE ip.cnpj IS NOT NULL AND TRIM(ip.cnpj) <> ''
       LIMIT 1`
    );
    const pay3BankAccounts = await safeExists(
      `SELECT 1 AS c FROM property_bank_accounts pba
       INNER JOIN properties p ON p.id = pba.property_id AND p.deleted_at IS NULL
       WHERE pba.deleted_at IS NULL AND pba.is_active = 1
       LIMIT 1`
    );
    items['pay-3'] = pay3Invoice || pay3BankAccounts;
    items['pay-4'] = await exists(
      `SELECT 1 AS c FROM invoice_params
       WHERE nf_provider IS NOT NULL AND TRIM(COALESCE(nf_provider, '')) <> ''
       LIMIT 1`
    );

    const emailCfg =
      (await scalar(
        `SELECT COUNT(*) AS c FROM email_configs WHERE deleted_at IS NULL AND is_active = 1
         AND (
           (method = 'smtp' AND smtp_server IS NOT NULL AND TRIM(smtp_server) <> '')
           OR (method = 'api' AND api_key IS NOT NULL AND TRIM(api_key) <> '')
         )`
      )) > 0;
    const smtpTable = await scalar(
      `SELECT COUNT(*) AS c FROM smtp_configurations WHERE is_active = 1`
    ).catch(() => 0);
    items['int-1'] = emailCfg || smtpTable > 0;

    const otaLinked = await scalar(
      `SELECT COUNT(*) AS c FROM booking_channels
       WHERE deleted_at IS NULL
         AND slug IN ('booking','airbnb','expedia','decolar','hotels_com','cvc')
         AND metadata IS NOT NULL
         AND JSON_LENGTH(metadata) > 0`
    ).catch(() => 0);
    items['int-2'] = otaLinked > 0;

    items['int-3'] = (await scalar(`SELECT COUNT(*) AS c FROM equipments WHERE status = 'active'`)) > 0;

    items['int-4'] = await safeExists(
      `SELECT 1 AS c FROM workflow_webhooks WHERE is_active = 1 LIMIT 1`
    );

    items['user-1'] =
      (await scalar(`SELECT COUNT(*) AS c FROM users WHERE deleted_at IS NULL AND status = 'active'`)) >= 2;
    const distinctGroups = await scalar(
      `SELECT COUNT(DISTINCT user_group_id) AS c FROM users
       WHERE deleted_at IS NULL AND user_group_id IS NOT NULL`
    );
    items['user-2'] = distinctGroups >= 2;
    const ugCount = await scalar(`SELECT COUNT(*) AS c FROM user_groups WHERE deleted_at IS NULL`);
    items['user-3'] = ugCount >= 2;

    items['com-1'] =
      (await scalar(`SELECT COUNT(*) AS c FROM email_templates WHERE is_active = 1`)) > 0;
    items['com-2'] =
      (await scalar(`SELECT COUNT(*) AS c FROM email_automations WHERE deleted_at IS NULL AND status = 'active'`)) >
      0;

    const whatsappMeta = await safeExists(
      `SELECT 1 AS c FROM booking_channels WHERE deleted_at IS NULL AND slug = 'whatsapp'
         AND metadata IS NOT NULL AND JSON_LENGTH(metadata) > 0 LIMIT 1`
    );
    items['com-3'] = whatsappMeta;

    return { items };
  }
}
