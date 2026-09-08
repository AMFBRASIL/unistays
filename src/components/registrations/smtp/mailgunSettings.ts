import type { ApiProviderConfig, MailgunKeyType, MailgunRegion } from "./types";

export interface MailgunStoredSettings {
  region: MailgunRegion;
  keyType: MailgunKeyType;
  webhookUrl: string;
}

export function parseMailgunSettings(value?: string | null): MailgunStoredSettings {
  const defaults: MailgunStoredSettings = { region: "auto", keyType: "account", webhookUrl: "" };
  if (!value) return defaults;

  const trimmed = value.trim();
  const structured = trimmed.match(/^mg:(account|sending):(auto|us|eu)(?:\|(.+))?$/i);
  if (structured) {
    return {
      keyType: structured[1].toLowerCase() as MailgunKeyType,
      region: structured[2].toLowerCase() as MailgunRegion,
      webhookUrl: structured[3] || "",
    };
  }

  const legacyRegion = trimmed.match(/^region:(us|eu)(?:\|(.+))?$/i);
  if (legacyRegion) {
    return {
      region: legacyRegion[1].toLowerCase() as MailgunRegion,
      keyType: "account",
      webhookUrl: legacyRegion[2] || "",
    };
  }

  if (/^(us|eu|auto)$/i.test(trimmed)) {
    return { ...defaults, region: trimmed.toLowerCase() as MailgunRegion };
  }

  return { ...defaults, webhookUrl: trimmed };
}

export function serializeMailgunSettings(apiConfig: ApiProviderConfig): string | undefined {
  const webhook = apiConfig.webhookUrl.trim();
  const base = `mg:${apiConfig.mailgunKeyType}:${apiConfig.mailgunRegion}`;
  if (webhook) return `${base}|${webhook}`;
  if (apiConfig.mailgunKeyType !== "account" || apiConfig.mailgunRegion !== "auto") return base;
  return undefined;
}

/** @deprecated use serializeMailgunSettings */
export function buildApiWebhookUrl(apiConfig: ApiProviderConfig): string | undefined {
  return serializeMailgunSettings(apiConfig);
}
