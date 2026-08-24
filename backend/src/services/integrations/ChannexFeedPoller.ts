/**
 * Feed poller Channex — backstop do webhook (skill: ~15 min com webhook, ~1 min feed-only).
 * Drain até vazio; janela de 30 min no feed.
 */

import { AppDataSource } from '@/config/database';
import { logger } from '@/utils/logger';
import { ensureIntegrationSchema } from './ensureIntegrationSchema';
import { IntegrationService } from './IntegrationService';

let timer: NodeJS.Timeout | null = null;
let running = false;
let lastPollAt: string | null = null;
let lastPollResult: { processed: number; errors: number; message: string } | null = null;
let consecutiveFailures = 0;

const INTERVAL_MS = Number(process.env.CHANNEX_FEED_POLL_MS || 60_000); // 1 min default

export function getChannexFeedPollerStatus() {
  return {
    running: !!timer,
    intervalMs: INTERVAL_MS,
    lastPollAt,
    lastPollResult,
    consecutiveFailures,
    inFlight: running,
  };
}

export function startChannexFeedPoller(): void {
  if (timer) return;
  logger.info(`[ChannexFeedPoller] iniciado (interval=${INTERVAL_MS}ms)`);
  // first tick after short delay so DB is ready
  timer = setInterval(() => {
    void tick();
  }, INTERVAL_MS);
  if (typeof timer.unref === 'function') timer.unref();
  setTimeout(() => void tick(), 8_000);
}

export function stopChannexFeedPoller(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

async function tick(): Promise<void> {
  if (running) return;
  running = true;
  try {
    if (!AppDataSource.isInitialized) return;
    await ensureIntegrationSchema();

    const rows = await AppDataSource.query(
      `SELECT c.id
       FROM integration_connections c
       INNER JOIN integration_providers p ON p.id = c.provider_id
       WHERE p.code = 'channex' AND c.status = 'connected'`,
    );

    let processed = 0;
    let errors = 0;
    for (const row of rows) {
      try {
        const modules = await getModules(Number(row.id));
        if (modules.reservations === false) continue;
        const result = await IntegrationService.pullChannexBookings(Number(row.id), {
          drain: true,
        });
        processed += result.processed || 0;
      } catch (err: any) {
        errors += 1;
        logger.warn(`[ChannexFeedPoller] connection ${row.id}: ${err?.message || err}`);
      }
    }

    lastPollAt = new Date().toISOString();
    lastPollResult = {
      processed,
      errors,
      message: errors
        ? `Poll com ${errors} erro(s); ${processed} processada(s)`
        : `${processed} revision(s) processada(s)`,
    };
    consecutiveFailures = errors ? consecutiveFailures + 1 : 0;

    if (consecutiveFailures >= 3) {
      logger.error(
        `[ChannexFeedPoller] ${consecutiveFailures} falhas consecutivas — risco de perder bookings (janela 30 min)`,
      );
    }
  } catch (err: any) {
    consecutiveFailures += 1;
    lastPollAt = new Date().toISOString();
    lastPollResult = {
      processed: 0,
      errors: 1,
      message: err?.message || String(err),
    };
    logger.error('[ChannexFeedPoller] tick failed', err);
  } finally {
    running = false;
  }
}

async function getModules(connectionId: number): Promise<Record<string, boolean>> {
  try {
    const conn = await IntegrationService.getConnection(connectionId);
    return (conn.settings?.modules || {}) as Record<string, boolean>;
  } catch {
    return {};
  }
}
