import { AppError } from '@/middlewares/error.middleware';

export type MailgunRegion = 'us' | 'eu' | 'auto';
export type MailgunKeyType = 'account' | 'sending';

export interface MailgunStoredSettings {
  region: MailgunRegion;
  keyType: MailgunKeyType;
  webhookUrl?: string;
}

const MAILGUN_URLS: Record<'us' | 'eu', string> = {
  us: 'https://api.mailgun.net',
  eu: 'https://api.eu.mailgun.net',
};

export function parseMailgunSettings(value?: string | null): MailgunStoredSettings {
  const defaults: MailgunStoredSettings = { region: 'auto', keyType: 'account', webhookUrl: '' };
  if (!value) return defaults;

  const trimmed = String(value).trim();
  const structured = trimmed.match(/^mg:(account|sending):(auto|us|eu)(?:\|(.+))?$/i);
  if (structured) {
    return {
      keyType: structured[1].toLowerCase() as MailgunKeyType,
      region: structured[2].toLowerCase() as MailgunRegion,
      webhookUrl: structured[3] || '',
    };
  }

  const legacyRegion = trimmed.match(/^region:(us|eu)(?:\|(.+))?$/i);
  if (legacyRegion) {
    return {
      region: legacyRegion[1].toLowerCase() as MailgunRegion,
      keyType: 'account',
      webhookUrl: legacyRegion[2] || '',
    };
  }

  if (/^(us|eu|auto)$/i.test(trimmed)) {
    return { ...defaults, region: trimmed.toLowerCase() as MailgunRegion };
  }

  return { ...defaults, webhookUrl: trimmed };
}

/** @deprecated use parseMailgunSettings */
export function parseMailgunRegion(value?: string | null): MailgunRegion {
  return parseMailgunSettings(value).region;
}

export function serializeMailgunSettings(settings: MailgunStoredSettings): string | null {
  const region = settings.region || 'auto';
  const keyType = settings.keyType || 'account';
  const webhook = settings.webhookUrl?.trim();
  const base = `mg:${keyType}:${region}`;
  if (webhook) return `${base}|${webhook}`;
  if (keyType !== 'account' || region !== 'auto') return base;
  return null;
}

function normalizeApiKey(apiKey: string): string {
  return String(apiKey || '').trim();
}

function createMailgunSdk(apiKey: string, region: 'us' | 'eu') {
  const formData = require('form-data');
  const Mailgun = require('mailgun.js');
  const mailgun = new Mailgun(formData);
  return mailgun.client({
    username: 'api',
    key: normalizeApiKey(apiKey),
    url: MAILGUN_URLS[region],
  });
}

function regionOrder(preference: MailgunRegion): Array<'us' | 'eu'> {
  if (preference === 'eu') return ['eu', 'us'];
  if (preference === 'us') return ['us', 'eu'];
  return ['us', 'eu'];
}

function extractDomainItems(listResponse: any): Array<{ name: string; state?: string }> {
  const items = listResponse?.items ?? listResponse?.body?.items ?? [];
  return Array.isArray(items) ? items : [];
}

export function resolveMailgunDomain(
  domains: Array<{ name: string; state?: string }>,
  explicitDomain?: string | null,
  fromEmail?: string | null
): string {
  const configured = explicitDomain?.trim().toLowerCase();
  if (configured) return configured;

  if (fromEmail?.includes('@')) {
    const host = fromEmail.split('@')[1]?.trim().toLowerCase();
    if (host) {
      const hostMatch = domains.find((d) => {
        const name = String(d.name).toLowerCase();
        return host === name || host.endsWith(`.${name}`) || name.endsWith(host);
      });
      if (hostMatch?.name) return hostMatch.name;
    }
  }

  const active = domains.find((d) => d.state === 'active') ?? domains[0];
  if (active?.name) return active.name;

  throw new AppError(
    'Nenhum domínio encontrado na conta Mailgun. Informe o domínio de envio ou cadastre um domínio verificado no painel Mailgun.',
    400
  );
}

function extractMailgunErrorMessage(error: any): string {
  return (
    error?.body?.message ||
    error?.details ||
    error?.message ||
    (typeof error === 'string' ? error : 'Erro desconhecido')
  );
}

function formatMailgunError(error: any, region: 'us' | 'eu'): AppError {
  const status = error?.status ?? error?.statusCode;
  const detail = extractMailgunErrorMessage(error);

  if (status === 401) {
    const isForbidden = /forbidden/i.test(String(detail));
    const ipHint = isForbidden
      ? ' Se a chave foi criada agora e o portal Mailgun funciona, verifique Account Settings → API Security → IP allow list (desative ou inclua o IP do servidor).'
      : '';
    return new AppError(
      `Autenticação Mailgun rejeitada (${region.toUpperCase()}, API v3): ${detail}.${ipHint} Chave da conta: Account Settings → API Keys. Chave de envio: Sending → Domínio → Sending API keys. Região US: api.mailgun.net.`,
      401
    );
  }
  if (status === 403) {
    return new AppError(
      `Acesso negado no Mailgun (${region.toUpperCase()}). Esta chave pode não ter permissão para esta operação. Chaves de envio só funcionam em POST /v3/{domínio}/messages.`,
      403
    );
  }
  if (status === 404) {
    return new AppError(
      `Domínio não encontrado no Mailgun (${region.toUpperCase()}). Confirme o domínio verificado na mesma região da conta.`,
      404
    );
  }
  if (status === 400) {
    return new AppError(`Erro na requisição Mailgun (${region.toUpperCase()}): ${detail}`, 400);
  }
  return new AppError(`Erro Mailgun (${region.toUpperCase()}): ${detail}`, status || 500);
}

export type MailgunVerifyAttempt = {
  region: 'us' | 'eu';
  ok: boolean;
  status?: number;
  message: string;
  domains?: string[];
};

export type MailgunVerifyResult =
  | { valid: true; region: 'us' | 'eu'; domains: string[]; keyType: MailgunKeyType }
  | { valid: false; attempts: MailgunVerifyAttempt[]; keyType: MailgunKeyType };

async function verifyAccountKey(
  apiKey: string,
  regionPreference: MailgunRegion
): Promise<MailgunVerifyResult> {
  const attempts: MailgunVerifyAttempt[] = [];

  for (const region of regionOrder(regionPreference)) {
    try {
      const mg = createMailgunSdk(apiKey, region);
      const listResponse = await mg.domains.list({ limit: 20 });
      const domains = extractDomainItems(listResponse)
        .map((d) => d.name)
        .filter(Boolean);
      return { valid: true, region, domains, keyType: 'account' };
    } catch (error: any) {
      attempts.push({
        region,
        ok: false,
        status: error?.status ?? error?.statusCode,
        message: extractMailgunErrorMessage(error),
      });
    }
  }

  return { valid: false, attempts, keyType: 'account' };
}

async function verifySendingKey(
  apiKey: string,
  domain: string,
  regionPreference: MailgunRegion
): Promise<MailgunVerifyResult> {
  const normalizedDomain = domain.trim().toLowerCase();
  const attempts: MailgunVerifyAttempt[] = [];

  for (const region of regionOrder(regionPreference)) {
    try {
      const mg = createMailgunSdk(apiKey, region);
      await mg.messages.create(normalizedDomain, {
        from: `verify@${normalizedDomain}`,
        to: 'verify@example.com',
        subject: 'Unistays Mailgun validation',
        text: 'validation',
        'o:testmode': 'yes',
      });
      return { valid: true, region, domains: [normalizedDomain], keyType: 'sending' };
    } catch (error: any) {
      const status = error?.status ?? error?.statusCode;
      const message = extractMailgunErrorMessage(error);
      attempts.push({ region, ok: false, status, message });

      if (status === 404) {
        return {
          valid: false,
          attempts: [
            ...attempts,
            {
              region,
              ok: false,
              status: 404,
              message: `Domínio "${normalizedDomain}" não encontrado na região ${region.toUpperCase()}.`,
            },
          ],
          keyType: 'sending',
        };
      }
    }
  }

  return { valid: false, attempts, keyType: 'sending' };
}

function isInvalidAccountKeyError(attempts: MailgunVerifyAttempt[]): boolean {
  return (
    attempts.length > 0 &&
    attempts.every(
      (a) => a.status === 401 && /invalid private key/i.test(String(a.message))
    )
  );
}

export async function verifyMailgunCredentials(
  apiKey: string,
  regionPreference: MailgunRegion = 'auto',
  keyType: MailgunKeyType = 'account',
  domain?: string | null
): Promise<MailgunVerifyResult> {
  const key = normalizeApiKey(apiKey);
  if (!key) {
    return {
      valid: false,
      keyType,
      attempts: [
        { region: 'us', ok: false, message: 'API Key do Mailgun é obrigatória' },
        { region: 'eu', ok: false, message: 'API Key do Mailgun é obrigatória' },
      ],
    };
  }

  if (keyType === 'sending') {
    if (!domain?.trim()) {
      return {
        valid: false,
        keyType: 'sending',
        attempts: [
          {
            region: 'us',
            ok: false,
            message: 'Domínio de envio é obrigatório para chaves de envio (ex.: unistays.com.br)',
          },
        ],
      };
    }
    return verifySendingKey(key, domain, regionPreference);
  }

  const accountResult = await verifyAccountKey(key, regionPreference);
  if (accountResult.valid) {
    return accountResult;
  }

  if (isInvalidAccountKeyError(accountResult.attempts) && domain?.trim()) {
    const sendingResult = await verifySendingKey(key, domain, regionPreference);
    if (sendingResult.valid) {
      return sendingResult;
    }
    return {
      valid: false,
      keyType: 'sending',
      attempts: [
        ...accountResult.attempts.map((a) => ({
          ...a,
          message: `Conta: ${a.message}`,
        })),
        ...sendingResult.attempts.map((a) => ({
          ...a,
          message: `Envio (${domain.trim()}): ${a.message}`,
        })),
      ],
    };
  }

  if (isInvalidAccountKeyError(accountResult.attempts)) {
    return {
      valid: false,
      keyType: 'account',
      attempts: [
        ...accountResult.attempts,
        {
          region: 'us',
          ok: false,
          message:
            'Esta chave parece ser Sending API Key. Selecione "Chave de envio do domínio" e informe unistays.com.br.',
        },
      ],
    };
  }

  return accountResult;
}

export function formatMailgunVerifyFailure(result: MailgunVerifyResult & { valid: false }): AppError {
  const summary = result.attempts
    .map((a) => `${a.region.toUpperCase()}: ${a.message}`)
    .join(' | ');

  const invalidKey = result.attempts.every(
    (a) => a.status === 401 || /invalid private key|forbidden/i.test(a.message)
  );

  if (result.keyType === 'sending') {
    if (invalidKey) {
      return new AppError(
        `Chave de envio Mailgun rejeitada. ${summary}. Confirme domínio exato (ex.: unistays.com.br), região US e IP allow list em Account Settings → API Security.`,
        401
      );
    }
    return new AppError(
      `Falha ao validar chave de envio Mailgun. ${summary}. Use o domínio exato verificado no painel (mesma região US/EU).`,
      401
    );
  }

  if (invalidKey) {
    return new AppError(
      `Chave da conta Mailgun rejeitada em US e EU. ${summary}. Use Account Settings → API Keys → Private API key. Se usar Sending API key, selecione tipo "Chave de envio" e domínio unistays.com.br. Verifique também IP allow list em API Security.`,
      401
    );
  }

  return new AppError(
    `Falha na validação Mailgun (API v3). ${summary}. Confirme região (US/EU) e tipo de chave.`,
    401
  );
}

export async function sendMailgunMessage(params: {
  apiKey: string;
  region?: MailgunRegion;
  keyType?: MailgunKeyType;
  domain?: string | null;
  fromEmail: string;
  fromName: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string | null;
}): Promise<void> {
  const regionPreference = params.region ?? 'auto';
  const key = normalizeApiKey(params.apiKey);

  if (!key) {
    throw new AppError('API Key do Mailgun é obrigatória', 400);
  }

  const sendDomain =
    params.domain?.trim() ||
    (params.fromEmail?.includes('@') ? params.fromEmail.split('@')[1]?.trim() : undefined);

  const verification = await verifyMailgunCredentials(
    key,
    regionPreference,
    params.keyType ?? 'account',
    sendDomain
  );

  if (!verification.valid) {
    throw formatMailgunVerifyFailure(verification);
  }

  const mg = createMailgunSdk(key, verification.region);
  const messageDomain =
    verification.keyType === 'sending'
      ? (sendDomain || verification.domains[0])
      : resolveMailgunDomain(
          verification.domains.map((name) => ({ name, state: 'active' })),
          params.domain,
          params.fromEmail
        );

  const messageData: Record<string, unknown> = {
    from: `"${params.fromName}" <${params.fromEmail}>`,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text || params.subject,
  };
  if (params.replyTo) {
    messageData['h:Reply-To'] = params.replyTo;
  }

  try {
    await mg.messages.create(messageDomain, messageData);
  } catch (error) {
    throw formatMailgunError(error, verification.region);
  }
}
