import { AppDataSource } from '@/config/database';

export interface SystemLocaleConfig {
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  language: string;
  currency: string;
}

const FALLBACK: SystemLocaleConfig = {
  timezone: 'UTC',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  language: 'en-US',
  currency: 'USD',
};

const cacheByKey = new Map<string, { config: SystemLocaleConfig; at: number }>();
const CACHE_MS = 60_000;

export class GeneralSettingsService {
  static invalidateCache(): void {
    cacheByKey.clear();
  }

  private static cacheKey(propertyId?: number | null): string {
    return propertyId != null ? `property:${propertyId}` : 'global';
  }

  private static async loadLocaleConfig(propertyId?: number | null): Promise<SystemLocaleConfig> {
    const tryLoad = async (pid: number | null): Promise<SystemLocaleConfig | null> => {
      const propertyClause = pid != null ? '= ?' : 'IS NULL';
      const params = pid != null ? [pid] : [];
      const rows = await AppDataSource.query(
        `SELECT timezone, date_format, time_format, language, currency
         FROM general_settings
         WHERE property_id ${propertyClause}
         LIMIT 1`,
        params,
      );
      if (!rows.length) return null;
      const row = rows[0];
      return {
        timezone: row.timezone || FALLBACK.timezone,
        dateFormat: row.date_format || FALLBACK.dateFormat,
        timeFormat: row.time_format === '12h' ? '12h' : '24h',
        language: row.language || FALLBACK.language,
        currency: row.currency || FALLBACK.currency,
      };
    };

    if (propertyId != null) {
      const propertyConfig = await tryLoad(propertyId);
      if (propertyConfig) return propertyConfig;
    }

    const globalConfig = await tryLoad(null);
    return globalConfig ?? { ...FALLBACK };
  }

  static async getLocaleConfig(propertyId?: number | null): Promise<SystemLocaleConfig> {
    const key = this.cacheKey(propertyId);
    const hit = cacheByKey.get(key);
    if (hit && Date.now() - hit.at < CACHE_MS) {
      return hit.config;
    }

    const config = await this.loadLocaleConfig(propertyId);
    cacheByKey.set(key, { config, at: Date.now() });
    return config;
  }
}
