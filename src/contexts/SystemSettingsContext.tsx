import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  type DateLocaleConfig,
  extractDateOnlyInTimezone,
  formatDateByLocale,
  parseCalendarDateInTimezone,
  toDateOnlyKeyInTimezone,
} from "@/lib/systemLocale";

export interface SystemLocaleSettings extends DateLocaleConfig {
  currency: string;
  timeFormat: "12h" | "24h";
  isLoading: boolean;
}

const FALLBACK: SystemLocaleSettings = {
  timezone: "UTC",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  language: "en-US",
  currency: "USD",
  isLoading: false,
};

const SystemSettingsContext = createContext<SystemLocaleSettings>(FALLBACK);

export function SystemSettingsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ["general-settings", "locale"],
    queryFn: async () => {
      const res = await api.getGeneralSettings();
      if (!res.success || !res.data) return null;
      const d = res.data as Record<string, unknown>;
      return {
        timezone: String(d.timezone || FALLBACK.timezone),
        dateFormat: String(d.dateFormat || FALLBACK.dateFormat),
        timeFormat: (d.timeFormat === "12h" ? "12h" : "24h") as "12h" | "24h",
        language: String(d.language || FALLBACK.language),
        currency: String(d.currency || FALLBACK.currency),
      };
    },
    staleTime: 60_000,
  });

  const value = useMemo<SystemLocaleSettings>(
    () => ({
      timezone: data?.timezone ?? FALLBACK.timezone,
      dateFormat: data?.dateFormat ?? FALLBACK.dateFormat,
      timeFormat: data?.timeFormat ?? FALLBACK.timeFormat,
      language: data?.language ?? FALLBACK.language,
      currency: data?.currency ?? FALLBACK.currency,
      isLoading,
    }),
    [data, isLoading],
  );

  return (
    <SystemSettingsContext.Provider value={value}>{children}</SystemSettingsContext.Provider>
  );
}

export function useSystemSettings(): SystemLocaleSettings {
  return useContext(SystemSettingsContext);
}

/** Helpers ligados às configurações gerais (fuso + formato). */
export function useDateLocale() {
  const settings = useSystemSettings();
  const locale: DateLocaleConfig = settings;

  return {
    settings,
    locale,
    parseDateOnly: (value: string) => parseCalendarDateInTimezone(value, settings.timezone),
    extractDateOnly: (value: string | Date) => extractDateOnlyInTimezone(value, settings.timezone),
    formatDateOnly: (value: string | Date) => formatDateByLocale(value, locale),
    toDateOnlyKey: (date: Date) => toDateOnlyKeyInTimezone(date, settings.timezone),
  };
}
