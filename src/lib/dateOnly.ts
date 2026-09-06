/**
 * @deprecated Use useDateLocale() from SystemSettingsContext — datas vêm das Configurações Gerais.
 */
import type { DateLocaleConfig } from "@/lib/systemLocale";
import {
  extractDateOnlyInTimezone,
  formatDateByLocale,
  parseCalendarDateInTimezone,
  toDateOnlyKeyInTimezone,
} from "@/lib/systemLocale";

export type { DateLocaleConfig };

export function parseDateOnly(value: string, locale?: DateLocaleConfig): Date {
  return parseCalendarDateInTimezone(value, locale?.timezone ?? "UTC");
}

export function extractDateOnly(value: string | Date, locale?: DateLocaleConfig): string {
  return extractDateOnlyInTimezone(value, locale?.timezone ?? "UTC");
}

export function formatDateOnlyBR(value: string, locale?: DateLocaleConfig): string {
  return formatDateByLocale(value, locale ?? { timezone: "UTC", dateFormat: "DD/MM/YYYY" });
}

export function toDateOnlyKey(date: Date, locale?: DateLocaleConfig): string {
  return toDateOnlyKeyInTimezone(date, locale?.timezone ?? "UTC");
}
