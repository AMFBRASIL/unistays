import { createHmac, randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '@/config/database';
import { AppError } from '@/middlewares/error.middleware';
import { ensureOutboundWebhookSchema } from './ensureOutboundWebhookSchema';

export interface OutboundWebhook {
  id: number;
  uuid: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  lastTriggeredAt: string | null;
  lastStatus: 'success' | 'error' | 'pending' | null;
  successCount: number;
  errorCount: number;
  successRate: number;
  totalCalls: number;
  createdAt: string;
  updatedAt: string;
}

const SUPPORTED_EVENTS = new Set([
  'reservation.created',
  'reservation.cancelled',
  'reservation.checkin',
  'reservation.checkout',
  'guest.created',
  'payment.received',
  'financial.reservation_payment',
  'financial.reservation_commission',
]);

/** Aliases da UI antiga → eventos reais do EventBus */
const EVENT_ALIASES: Record<string, string> = {
  'reservation.confirmed': 'reservation.created',
  'reservation.modified': 'reservation.created',
  'guest.checkin': 'reservation.checkin',
  'guest.checkout': 'reservation.checkout',
  'payment.completed': 'payment.received',
};

function normalizeEvents(events: string[]): string[] {
  const out = new Set<string>();
  for (const raw of events) {
    const mapped = EVENT_ALIASES[raw] || raw;
    if (SUPPORTED_EVENTS.has(mapped)) out.add(mapped);
  }
  return [...out];
}

export class OutboundWebhookService {
  static async list(): Promise<OutboundWebhook[]> {
    await ensureOutboundWebhookSchema();
    const rows = await AppDataSource.query(
      `SELECT * FROM outbound_webhooks ORDER BY id DESC`,
    );
    return rows.map((r: any) => this.mapRow(r));
  }

  static async get(id: number): Promise<OutboundWebhook> {
    await ensureOutboundWebhookSchema();
    const rows = await AppDataSource.query(
      `SELECT * FROM outbound_webhooks WHERE id = ? LIMIT 1`,
      [id],
    );
    if (!rows.length) throw new AppError('Webhook não encontrado', 404);
    return this.mapRow(rows[0]);
  }

  static async create(input: {
    name: string;
    url: string;
    events: string[];
    secret?: string;
    isActive?: boolean;
  }): Promise<OutboundWebhook> {
    await ensureOutboundWebhookSchema();
    const events = normalizeEvents(input.events || []);
    if (!input.name?.trim() || !input.url?.trim() || !events.length) {
      throw new AppError('name, url e ao menos um evento válido são obrigatórios', 400);
    }
    try {
      // eslint-disable-next-line no-new
      new URL(input.url);
    } catch {
      throw new AppError('URL inválida', 400);
    }

    const secret = input.secret?.trim() || `whsec_${randomBytes(18).toString('hex')}`;
    const result = await AppDataSource.query(
      `INSERT INTO outbound_webhooks (uuid, name, url, secret, events, is_active, last_status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        uuidv4(),
        input.name.trim(),
        input.url.trim(),
        secret,
        JSON.stringify(events),
        input.isActive === false ? 0 : 1,
      ],
    );
    return this.get(Number(result.insertId));
  }

  static async update(
    id: number,
    input: {
      name?: string;
      url?: string;
      events?: string[];
      secret?: string;
      isActive?: boolean;
    },
  ): Promise<OutboundWebhook> {
    await ensureOutboundWebhookSchema();
    await this.get(id);

    const sets: string[] = [];
    const params: unknown[] = [];

    if (input.name != null) {
      sets.push('name = ?');
      params.push(input.name.trim());
    }
    if (input.url != null) {
      try {
        // eslint-disable-next-line no-new
        new URL(input.url);
      } catch {
        throw new AppError('URL inválida', 400);
      }
      sets.push('url = ?');
      params.push(input.url.trim());
    }
    if (input.events != null) {
      const events = normalizeEvents(input.events);
      if (!events.length) throw new AppError('Informe ao menos um evento válido', 400);
      sets.push('events = ?');
      params.push(JSON.stringify(events));
    }
    if (input.secret != null && input.secret.trim()) {
      sets.push('secret = ?');
      params.push(input.secret.trim());
    }
    if (input.isActive != null) {
      sets.push('is_active = ?');
      params.push(input.isActive ? 1 : 0);
    }

    if (!sets.length) return this.get(id);

    params.push(id);
    await AppDataSource.query(
      `UPDATE outbound_webhooks SET ${sets.join(', ')}, updated_at = NOW() WHERE id = ?`,
      params,
    );
    return this.get(id);
  }

  static async remove(id: number): Promise<void> {
    await ensureOutboundWebhookSchema();
    const result = await AppDataSource.query(`DELETE FROM outbound_webhooks WHERE id = ?`, [id]);
    if (!result.affectedRows) throw new AppError('Webhook não encontrado', 404);
  }

  static async test(id: number): Promise<{ ok: boolean; status?: number; message: string }> {
    const webhook = await this.get(id);
    return this.deliver(webhook, 'webhook.test', {
      message: 'Teste manual Unistays',
      webhookId: webhook.id,
      webhookName: webhook.name,
      at: new Date().toISOString(),
    });
  }

  /** Dispara todos os webhooks ativos inscritos no evento. */
  static async dispatch(eventName: string, payload: unknown): Promise<void> {
    await ensureOutboundWebhookSchema();
    const event = EVENT_ALIASES[eventName] || eventName;
    const rows = await AppDataSource.query(
      `SELECT * FROM outbound_webhooks WHERE is_active = 1`,
    );

    for (const row of rows) {
      const webhook = this.mapRow(row);
      if (!webhook.events.includes(event) && !webhook.events.includes(eventName)) continue;
      try {
        await this.deliver(webhook, event, payload);
      } catch (err) {
        console.error(`[OutboundWebhook] falha no webhook #${webhook.id}:`, err);
      }
    }
  }

  private static async deliver(
    webhook: OutboundWebhook,
    eventName: string,
    payload: unknown,
  ): Promise<{ ok: boolean; status?: number; message: string }> {
    const body = {
      event: eventName,
      timestamp: new Date().toISOString(),
      data: payload,
    };
    const raw = JSON.stringify(body);
    const signature = createHmac('sha256', webhook.secret).update(raw).digest('hex');

    let ok = false;
    let status: number | undefined;
    let responseBody = '';
    let errorMessage: string | null = null;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Unistays-Event': eventName,
          'X-Unistays-Signature': `sha256=${signature}`,
          'User-Agent': 'Unistays-Webhooks/1.0',
        },
        body: raw,
        signal: controller.signal,
      });
      clearTimeout(timer);
      status = res.status;
      responseBody = (await res.text()).slice(0, 2000);
      ok = res.ok;
      if (!ok) errorMessage = `HTTP ${res.status}`;
    } catch (err: any) {
      errorMessage = err?.message || String(err);
      ok = false;
    }

    await AppDataSource.query(
      `INSERT INTO outbound_webhook_deliveries
        (webhook_id, event_name, request_body, response_status, response_body, status, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        webhook.id,
        eventName,
        raw,
        status ?? null,
        responseBody || null,
        ok ? 'success' : 'error',
        errorMessage,
      ],
    );

    await AppDataSource.query(
      `UPDATE outbound_webhooks SET
         last_triggered_at = NOW(),
         last_status = ?,
         success_count = success_count + ?,
         error_count = error_count + ?,
         updated_at = NOW()
       WHERE id = ?`,
      [ok ? 'success' : 'error', ok ? 1 : 0, ok ? 0 : 1, webhook.id],
    );

    return {
      ok,
      status,
      message: ok ? 'Entrega OK' : errorMessage || 'Falha na entrega',
    };
  }

  private static mapRow(row: any): OutboundWebhook {
    let events: string[] = [];
    try {
      events =
        typeof row.events === 'string'
          ? JSON.parse(row.events || '[]')
          : Array.isArray(row.events)
            ? row.events
            : [];
    } catch {
      events = [];
    }

    const successCount = Number(row.success_count) || 0;
    const errorCount = Number(row.error_count) || 0;
    const totalCalls = successCount + errorCount;
    const successRate = totalCalls > 0 ? Math.round((successCount / totalCalls) * 1000) / 10 : 100;

    return {
      id: Number(row.id),
      uuid: row.uuid,
      name: row.name,
      url: row.url,
      secret: row.secret,
      events,
      isActive: row.is_active === 1 || row.is_active === true,
      lastTriggeredAt: row.last_triggered_at
        ? new Date(row.last_triggered_at).toISOString()
        : null,
      lastStatus: row.last_status,
      successCount,
      errorCount,
      successRate,
      totalCalls,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }
}
