/**
 * Debounce outbound ARI pushes (skill: coalesce bursts into one push).
 * Keyed by connectionId + roomType / ratePlan.
 */

type PendingJob = {
  timer: NodeJS.Timeout;
  run: () => Promise<void>;
};

const pending = new Map<string, PendingJob>();
const DEFAULT_MS = 2500;

export function scheduleChannexPush(
  key: string,
  run: () => Promise<void>,
  delayMs: number = DEFAULT_MS,
): void {
  const existing = pending.get(key);
  if (existing) clearTimeout(existing.timer);

  const timer = setTimeout(() => {
    pending.delete(key);
    void run().catch((err) => {
      console.error(`[ChannexAriDebouncer] push failed (${key}):`, err?.message || err);
    });
  }, delayMs);

  // Don't keep the process alive solely for debounce in serverless
  if (typeof timer.unref === 'function') timer.unref();

  pending.set(key, { timer, run });
}

export function flushChannexPush(key: string): void {
  const existing = pending.get(key);
  if (!existing) return;
  clearTimeout(existing.timer);
  pending.delete(key);
  void existing.run().catch((err) => {
    console.error(`[ChannexAriDebouncer] flush failed (${key}):`, err?.message || err);
  });
}
