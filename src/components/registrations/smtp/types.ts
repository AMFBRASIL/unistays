export type MailgunRegion = "auto" | "us" | "eu";
export type MailgunKeyType = "account" | "sending";

export interface ApiProviderConfig {
  provider: string;
  apiKey: string;
  domain: string;
  mailgunRegion: MailgunRegion;
  mailgunKeyType: MailgunKeyType;
  fromEmail: string;
  fromName: string;
  dailyLimit: string;
  webhookUrl: string;
  trackOpens: boolean;
  trackClicks: boolean;
}

export interface MailgunVerifyState {
  ok: boolean;
  message: string;
  region?: string;
  domains?: string[];
  keyType?: MailgunKeyType;
}

export const API_PROVIDERS = [
  { id: "sendgrid", name: "SendGrid", description: "Popular e robusto", color: "from-blue-500 to-cyan-500" },
  { id: "mailgun", name: "Mailgun", description: "Alta entregabilidade", color: "from-red-500 to-orange-500" },
  { id: "amazon-ses", name: "Amazon SES", description: "Escalável e econômico", color: "from-amber-500 to-yellow-500" },
  { id: "brevo", name: "Brevo", description: "Tudo-em-um", color: "from-blue-600 to-indigo-600" },
  { id: "resend", name: "Resend", description: "Moderno para devs", color: "from-violet-500 to-purple-500" },
  { id: "postmark", name: "Postmark", description: "Transacional", color: "from-yellow-500 to-amber-500" },
] as const;
