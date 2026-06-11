/** Query key compartilhada (SetupProgress + SetupAlert). */
export const SETUP_PROGRESS_QUERY_KEY = ["setupProgress"] as const;

/**
 * Pontuação por item — manter alinhado com `setupCategoryDefs` em SetupProgress.tsx.
 */
const SETUP_ITEM_POINTS: Record<string, number> = {
  "prop-1": 15,
  "prop-2": 5,
  "prop-3": 5,
  "prop-4": 5,
  "unit-1": 15,
  "unit-2": 5,
  "unit-3": 5,
  "unit-4": 5,
  "rate-1": 15,
  "rate-2": 10,
  "rate-3": 5,
  "rate-4": 5,
  "inv-1": 5,
  "inv-2": 10,
  "inv-3": 5,
  "inv-4": 5,
  "pay-1": 10,
  "pay-2": 15,
  "pay-3": 5,
  "pay-4": 5,
  "int-1": 10,
  "int-2": 15,
  "int-3": 10,
  "int-4": 5,
  "user-1": 10,
  "user-2": 5,
  "user-3": 5,
  "com-1": 10,
  "com-2": 5,
  "com-3": 10,
};

export function computeSetupPercentage(flags: Record<string, boolean>): number {
  let total = 0;
  let done = 0;
  for (const [id, pts] of Object.entries(SETUP_ITEM_POINTS)) {
    total += pts;
    if (flags[id]) done += pts;
  }
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}
