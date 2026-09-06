/**
 * Datas de calendário — sempre via Configurações Gerais (timezone, dateFormat, language).
 */

export interface DateLocaleConfig {
  timezone: string;
  dateFormat?: string;
  language?: string;
}

function partsFromDate(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    hour12: false,
  });
  const map: Record<string, number> = {};
  for (const p of formatter.formatToParts(date)) {
    if (p.type !== "literal") map[p.type] = Number(p.value);
  }
  return map;
}

export function parseCalendarDateInTimezone(dateStr: string, timeZone: string): Date {
  const match = String(dateStr).split("T")[0].match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return new Date(NaN);

  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const probe = Date.UTC(y, m - 1, d, 12, 0, 0);

  for (let delta = -36; delta <= 36; delta++) {
    const cand = new Date(probe + delta * 3600000);
    const p = partsFromDate(cand, timeZone);
    if (p.year === y && p.month === m && p.day === d && p.hour === 12) {
      return cand;
    }
  }

  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

export function extractDateOnlyInTimezone(value: string | Date, timeZone: string): string {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(date);
}

export function toDateOnlyKeyInTimezone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(date);
}

export function formatDateByLocale(value: string | Date, locale: DateLocaleConfig): string {
  const iso =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? value
      : extractDateOnlyInTimezone(value, locale.timezone);
  if (!iso) return "";

  const date = parseCalendarDateInTimezone(iso, locale.timezone);
  const pattern = locale.dateFormat || "DD/MM/YYYY";
  const lang = locale.language || "en-US";
  const tz = locale.timezone;

  if (pattern === "YYYY-MM-DD") {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(date);
  }
  if (pattern === "MM/DD/YYYY") {
    return new Intl.DateTimeFormat(lang, {
      timeZone: tz,
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  }
  return new Intl.DateTimeFormat(lang, {
    timeZone: tz,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
