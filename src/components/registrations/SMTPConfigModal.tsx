import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Server,
  Shield,
  CheckCircle2,
  AlertCircle,
  Send,
  Settings2,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Copy,
  TestTube,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  Check,
  User,
  Globe,
  Bell,
  FileText,
  Activity,
  RefreshCw,
  Key,
  Link,
  Clock,
  MailCheck,
  AlertTriangle,
  Info,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { GenericApiConnectionPanel } from "@/components/registrations/smtp/GenericApiConnectionPanel";
import { MailgunConnectionPanel } from "@/components/registrations/smtp/MailgunConnectionPanel";
import {
  parseMailgunSettings,
  serializeMailgunSettings,
} from "@/components/registrations/smtp/mailgunSettings";
import { SmtpServerConnectionPanel } from "@/components/registrations/smtp/SmtpServerConnectionPanel";
import type { ApiProviderConfig, MailgunVerifyState, API_PROVIDERS } from "@/components/registrations/smtp/types";

interface SMTPConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se informado, pré-seleciona a propriedade e carrega a config atual */
  initialPropertyId?: number | null;
}

type ProviderType = "smtp" | "api" | "default";

/** Resposta do backend (getCurrent / getById) */
interface BackendSmtpConfig {
  id?: number;
  uuid?: string;
  propertyId?: number | null;
  name?: string;
  description?: string | null;
  providerType?: string;
  emailProviderId?: number | null;
  providerSlug?: string | null;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpEncryption?: string | null;
  smtpUsername?: string | null;
  smtpTimeout?: number | null;
  dailyLimit?: number | null;
  apiKey?: string;
  apiDomain?: string | null;
  apiWebhookUrl?: string | null;
  trackOpens?: boolean;
  trackClicks?: boolean;
  lastTestEmail?: string | null;
  templateIds?: number[];
  isActive?: boolean;
  isDefault?: boolean;
  lastTestAt?: string | null;
  lastTestResult?: string | null;
  lastTestMessage?: string | null;
  fromEmail?: string | null;
  fromName?: string | null;
  replyTo?: string | null;
  bounceAlert?: boolean;
  deliveryReport?: boolean;
  weeklyDigest?: boolean;
  alertEmail?: string | null;
  retryOnFail?: boolean;
  retryAttempts?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SMTPConfig {
  server: string;
  port: string;
  security: string;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  replyTo: string;
  timeout: string;
  maxRetries: string;
}

interface APIConfig extends ApiProviderConfig {}

interface NotificationSettings {
  bounceAlert: boolean;
  deliveryReport: boolean;
  weeklyDigest: boolean;
  alertEmail: string;
  retryOnFail: boolean;
  retryAttempts: string;
}

const wizardSteps = [
  { id: "provider", title: "Provedor", description: "Tipo de serviço", icon: Mail },
  { id: "connection", title: "Conexão", description: "Dados do servidor", icon: Server },
  { id: "sender", title: "Remetente", description: "Identidade de envio", icon: User },
  { id: "security", title: "Segurança", description: "Autenticação", icon: Shield },
  { id: "notifications", title: "Notificações", description: "Alertas e logs", icon: Bell },
  { id: "templates", title: "Templates", description: "Modelos ativos", icon: FileText },
  { id: "test", title: "Teste", description: "Verificar conexão", icon: TestTube },
  { id: "confirm", title: "Confirmar", description: "Revisar e salvar", icon: CheckCircle2 },
];

const activeTemplates = [
  { id: "1", name: "Confirmação de Reserva", category: "Reservas", active: true },
  { id: "2", name: "Check-in Digital", category: "Check-in", active: true },
  { id: "3", name: "Pagamento Recebido", category: "Financeiro", active: true },
  { id: "4", name: "Lembrete Check-out", category: "Check-out", active: true },
  { id: "5", name: "Avaliação Pós-Estadia", category: "Feedback", active: true },
  { id: "6", name: "Recuperação de Senha", category: "Sistema", active: true },
  { id: "7", name: "Boas-vindas", category: "Marketing", active: false },
  { id: "8", name: "Promoção Especial", category: "Marketing", active: false },
];

const defaultSmtpConfig: SMTPConfig = {
  server: "",
  port: "587",
  security: "tls",
  username: "",
  password: "",
  fromEmail: "",
  fromName: "",
  replyTo: "",
  timeout: "30",
  maxRetries: "3",
};

const defaultApiConfig: APIConfig = {
  provider: "",
  apiKey: "",
  domain: "",
  mailgunRegion: "us",
  mailgunKeyType: "sending",
  fromEmail: "",
  fromName: "",
  dailyLimit: "10000",
  webhookUrl: "",
  trackOpens: true,
  trackClicks: true,
};

const defaultNotificationSettings: NotificationSettings = {
  bounceAlert: true,
  deliveryReport: false,
  weeklyDigest: true,
  alertEmail: "",
  retryOnFail: true,
  retryAttempts: "3",
};

export function SMTPConfigModal({ open, onOpenChange, initialPropertyId }: SMTPConfigModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isValidatingMailgun, setIsValidatingMailgun] = useState(false);
  const [mailgunVerifyResult, setMailgunVerifyResult] = useState<MailgunVerifyState | null>(null);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [providerType, setProviderType] = useState<ProviderType>("smtp");

  const [properties, setProperties] = useState<{ id: number; name: string }[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [currentConfig, setCurrentConfig] = useState<BackendSmtpConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const [smtpConfig, setSmtpConfig] = useState<SMTPConfig>({ ...defaultSmtpConfig });

  const [apiConfig, setApiConfig] = useState<APIConfig>({ ...defaultApiConfig });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    ...defaultNotificationSettings,
  });

  const [templates, setTemplates] = useState(activeTemplates);

  const progressPercent = ((currentStep + 1) / wizardSteps.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === wizardSteps.length - 1;
  const prevSelectedPropertyIdRef = useRef<number | null>(null);

  // Ao abrir o modal: carregar propriedades e config da propriedade selecionada
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const propsRes = await api.getProperties();
        if (cancelled) return;
        const props = (propsRes.data as { properties?: { id: number; name: string }[] })?.properties ?? [];
        setProperties(props);

        // Buscar config "atual" (qualquer) para preencher o formulário ao reabrir
        const configRes = await api.getCurrentSmtpConfig(undefined);
        if (cancelled) return;
        const config = (configRes.data as BackendSmtpConfig | null) ?? null;
        const propId = config?.propertyId ?? initialPropertyId ?? (props[0] as { id: number })?.id ?? null;
        prevSelectedPropertyIdRef.current = propId;
        setSelectedPropertyId(propId);
        setCurrentConfig(config);
        if (config) {
          const pt = (config.providerType === "api" ? "api" : config.providerType === "unistays" ? "default" : "smtp") as ProviderType;
          setProviderType(pt);
          setSmtpConfig({
            server: config.smtpHost ?? "",
            port: String(config.smtpPort ?? 587),
            security: (config.smtpEncryption as string) ?? "tls",
            username: config.smtpUsername ?? "",
            password: "",
            fromEmail: config.fromEmail ?? "",
            fromName: config.fromName ?? "",
            replyTo: config.replyTo ?? "",
            timeout: String(config.smtpTimeout ?? 30),
            maxRetries: "3",
          });
          setApiConfig((prev) => ({
            ...prev,
            provider: config.providerSlug ?? "",
            apiKey: config.apiKey ?? (config as { api_key?: string; api_key_encrypted?: string }).api_key ?? (config as { api_key_encrypted?: string }).api_key_encrypted ?? "",
            domain: config.apiDomain ?? "",
            ...(() => {
              const mg = parseMailgunSettings(config.apiWebhookUrl);
              return { mailgunRegion: mg.region, mailgunKeyType: mg.keyType, webhookUrl: mg.webhookUrl };
            })(),
            fromEmail: config.fromEmail ?? "",
            fromName: config.fromName ?? "",
            dailyLimit: String(config.dailyLimit ?? 10000),
            trackOpens: config.trackOpens !== false,
            trackClicks: config.trackClicks !== false,
          }));
          setTestEmail(config.lastTestEmail ?? "");
          setNotificationSettings({
            bounceAlert: config.bounceAlert ?? true,
            deliveryReport: config.deliveryReport ?? false,
            weeklyDigest: config.weeklyDigest ?? true,
            alertEmail: config.alertEmail ?? "",
            retryOnFail: config.retryOnFail ?? true,
            retryAttempts: config.retryAttempts ?? "3",
          });
          if (Array.isArray(config.templateIds) && config.templateIds.length > 0) {
            setTemplates((prev) =>
              prev.map((t) => ({ ...t, active: config.templateIds!.includes(Number(t.id)) }))
            );
          }
        } else {
          setProviderType("smtp");
          setSmtpConfig({ ...defaultSmtpConfig });
          setApiConfig({ ...defaultApiConfig });
          setNotificationSettings({ ...defaultNotificationSettings });
        }
      } catch (e) {
        if (!cancelled) toast.error("Erro ao carregar dados", { description: String(e) });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, initialPropertyId]);

  // Quando o usuário trocar a propriedade no select, recarregar a config dessa propriedade
  useEffect(() => {
    if (!open || selectedPropertyId == null) return;
    if (prevSelectedPropertyIdRef.current === selectedPropertyId) return;
    prevSelectedPropertyIdRef.current = selectedPropertyId;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const configRes = await api.getCurrentSmtpConfig(selectedPropertyId);
        if (cancelled) return;
        const config = (configRes.data as BackendSmtpConfig | null) ?? null;
        setCurrentConfig(config);
        if (config) {
          const pt = (config.providerType === "api" ? "api" : config.providerType === "unistays" ? "default" : "smtp") as ProviderType;
          setProviderType(pt);
          setSmtpConfig({
            server: config.smtpHost ?? "",
            port: String(config.smtpPort ?? 587),
            security: (config.smtpEncryption as string) ?? "tls",
            username: config.smtpUsername ?? "",
            password: "",
            fromEmail: config.fromEmail ?? "",
            fromName: config.fromName ?? "",
            replyTo: config.replyTo ?? "",
            timeout: String(config.smtpTimeout ?? 30),
            maxRetries: "3",
          });
          setApiConfig((prev) => ({
            ...prev,
            provider: config.providerSlug ?? "",
            apiKey: config.apiKey ?? (config as { api_key?: string; api_key_encrypted?: string }).api_key ?? (config as { api_key_encrypted?: string }).api_key_encrypted ?? "",
            domain: config.apiDomain ?? "",
            ...(() => {
              const mg = parseMailgunSettings(config.apiWebhookUrl);
              return { mailgunRegion: mg.region, mailgunKeyType: mg.keyType, webhookUrl: mg.webhookUrl };
            })(),
            fromEmail: config.fromEmail ?? "",
            fromName: config.fromName ?? "",
            dailyLimit: String(config.dailyLimit ?? 10000),
            trackOpens: config.trackOpens !== false,
            trackClicks: config.trackClicks !== false,
          }));
          setTestEmail(config.lastTestEmail ?? "");
          setNotificationSettings({
            bounceAlert: config.bounceAlert ?? true,
            deliveryReport: config.deliveryReport ?? false,
            weeklyDigest: config.weeklyDigest ?? true,
            alertEmail: config.alertEmail ?? "",
            retryOnFail: config.retryOnFail ?? true,
            retryAttempts: config.retryAttempts ?? "3",
          });
          if (Array.isArray(config.templateIds) && config.templateIds.length > 0) {
            setTemplates((prev) =>
              prev.map((t) => ({ ...t, active: config.templateIds!.includes(Number(t.id)) }))
            );
          }
        } else {
          setProviderType("smtp");
          setSmtpConfig({ ...defaultSmtpConfig });
          setApiConfig({ ...defaultApiConfig });
          setNotificationSettings({ ...defaultNotificationSettings });
        }
      } catch (e) {
        if (!cancelled) {
          setCurrentConfig(null);
          toast.error("Erro ao carregar configuração", { description: String(e) });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, selectedPropertyId]);

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleValidateMailgun = async () => {
    if (!apiConfig.apiKey && !currentConfig?.id) {
      toast.error("Informe a API Key do Mailgun para validar.");
      return;
    }
    setIsValidatingMailgun(true);
    setMailgunVerifyResult(null);
    try {
      const res = await api.verifyMailgunCredentials({
        apiKey: apiConfig.apiKey && apiConfig.apiKey !== "••••••••" ? apiConfig.apiKey : undefined,
        mailgunRegion: apiConfig.mailgunRegion,
        mailgunKeyType: apiConfig.mailgunKeyType,
        apiDomain: apiConfig.domain || undefined,
        apiWebhookUrl: serializeMailgunSettings(apiConfig),
        configId: currentConfig?.id,
      });
      const data = res.data as { region?: string; domains?: string[]; message?: string } | undefined;
      const ok = (res as { success?: boolean }).success === true;
      if (ok) {
        const detectedKeyType = (data as { keyType?: "account" | "sending" })?.keyType;
        if (detectedKeyType) {
          setApiConfig((prev) => ({ ...prev, mailgunKeyType: detectedKeyType }));
        }
        const msg =
          data?.message ??
          `API Key válida (${data?.region?.toUpperCase() ?? "?"})` +
            (data?.domains?.length ? `. Domínios: ${data.domains.join(", ")}` : "");
        setMailgunVerifyResult({ ok: true, message: msg, region: data?.region, domains: data?.domains });
        toast.success("API Key válida", { description: msg });
      } else {
        const errMsg =
          (res as { error?: { message?: string } }).error?.message ?? data?.message ?? "Chave inválida";
        setMailgunVerifyResult({ ok: false, message: errMsg });
        toast.error("API Key inválida", { description: errMsg });
      }
    } catch (e) {
      const msg =
        (e as { error?: { message?: string }; message?: string })?.error?.message ??
        (e as Error)?.message ??
        "Falha na validação";
      setMailgunVerifyResult({ ok: false, message: msg });
      toast.error("API Key inválida", { description: msg });
    } finally {
      setIsValidatingMailgun(false);
    }
  };

  const handleTestConnection = async () => {
    const configId = currentConfig?.id;
    const email = testEmail?.trim();
    if (!email) {
      toast.error("Informe o e-mail de destino para o teste.");
      return;
    }
    if (providerType === "api" && !apiConfig.apiKey && !currentConfig?.id) {
      toast.error("Informe a API Key para testar a conexão.");
      return;
    }
    if (!configId && providerType !== "api") {
      toast.error("Salve a configuração primeiro para testar a conexão.");
      return;
    }
    if (providerType === "api" && apiConfig.provider === "mailgun") {
      setIsValidatingMailgun(true);
      try {
        const verifyRes = await api.verifyMailgunCredentials({
          apiKey: apiConfig.apiKey && apiConfig.apiKey !== "••••••••" ? apiConfig.apiKey : undefined,
          mailgunRegion: apiConfig.mailgunRegion,
          mailgunKeyType: apiConfig.mailgunKeyType,
          apiDomain: apiConfig.domain || undefined,
          apiWebhookUrl: serializeMailgunSettings(apiConfig),
          configId: currentConfig?.id,
        });
        const verifyOk = (verifyRes as { success?: boolean }).success === true;
        if (!verifyOk) {
          const errMsg =
            (verifyRes as { error?: { message?: string } }).error?.message ?? "Chave Mailgun inválida";
          setTestResult("error");
          toast.error("Valide a API Key antes do teste", { description: errMsg });
          return;
        }
      } catch (e) {
        const msg =
          (e as { error?: { message?: string }; message?: string })?.error?.message ??
          (e as Error)?.message ??
          "Chave Mailgun inválida";
        setTestResult("error");
        toast.error("Valide a API Key antes do teste", { description: msg });
        return;
      } finally {
        setIsValidatingMailgun(false);
      }
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const apiWebhookUrl = serializeMailgunSettings(apiConfig);
      const apiOverrides =
        providerType === "api"
          ? {
              providerSlug: apiConfig.provider,
              apiKey: apiConfig.apiKey !== "••••••••" ? apiConfig.apiKey : undefined,
              apiDomain: apiConfig.domain,
              mailgunRegion: apiConfig.mailgunRegion,
              mailgunKeyType: apiConfig.mailgunKeyType,
              apiWebhookUrl,
              fromEmail: apiConfig.fromEmail || undefined,
              fromName: apiConfig.fromName || undefined,
            }
          : undefined;

      const res = configId
        ? await api.testSmtpConfig(configId, email, apiOverrides)
        : await api.testSmtpConfigPreview(email, {
            providerSlug: apiConfig.provider,
            apiKey: apiConfig.apiKey,
            apiDomain: apiConfig.domain || undefined,
            mailgunRegion: apiConfig.mailgunRegion,
            mailgunKeyType: apiConfig.mailgunKeyType,
            apiWebhookUrl,
            fromEmail: apiConfig.fromEmail || undefined,
            fromName: apiConfig.fromName || undefined,
          });
      const data = res.data as { success?: boolean; lastTestResult?: string; message?: string } | undefined;
      const errMsg = (res as { error?: { message?: string } }).error?.message;
      const ok = (res as { success?: boolean }).success === true || data?.success === true;
      setTestResult(ok ? "success" : "error");
      if (ok) {
        toast.success("Conexão bem sucedida!", {
          description: data?.message ?? "O e-mail de teste foi enviado. Verifique a caixa de entrada.",
        });
      } else {
        toast.error("Falha na conexão", {
          description: errMsg ?? data?.message ?? "Verifique as credenciais e tente novamente.",
        });
      }
    } catch (e) {
      setTestResult("error");
      const msg = (e as { error?: { message?: string }; message?: string })?.error?.message ?? (e as Error)?.message;
      toast.error("Falha na conexão", {
        description: msg ?? "Verifique as credenciais e tente novamente.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    const propertyId = selectedPropertyId ?? initialPropertyId;
    if (propertyId == null) {
      toast.error("Selecione uma propriedade.");
      return;
    }
    setSaving(true);
    try {
      const templateIds = templates.filter((t) => t.active).map((t) => parseInt(String(t.id), 10)).filter((id) => !isNaN(id));

      if (currentConfig?.id) {
        const payload: Record<string, unknown> = {
          name: currentConfig.name ?? "Configuração de E-mail",
          providerType: providerType === "api" ? "api" : providerType === "default" ? "unistays" : "smtp",
          providerSlug: providerType === "api" ? apiConfig.provider : providerType === "default" ? "unistays" : "custom-smtp",
          fromEmail: providerType === "smtp" ? smtpConfig.fromEmail : apiConfig.fromEmail,
          fromName: providerType === "smtp" ? smtpConfig.fromName : apiConfig.fromName,
          replyTo: providerType === "smtp" ? smtpConfig.replyTo || undefined : undefined,
          lastTestEmail: testEmail?.trim() || undefined,
          trackOpens: apiConfig.trackOpens,
          trackClicks: apiConfig.trackClicks,
          apiWebhookUrl: serializeMailgunSettings(apiConfig),
          apiDomain: apiConfig.domain || undefined,
          templateIds,
          notificationSettings: {
            bounceAlert: notificationSettings.bounceAlert,
            deliveryReport: notificationSettings.deliveryReport,
            weeklyDigest: notificationSettings.weeklyDigest,
            alertEmail: notificationSettings.alertEmail || undefined,
            retryOnFail: notificationSettings.retryOnFail,
            retryAttempts: notificationSettings.retryAttempts,
          },
        };
        if (providerType === "smtp") {
          payload.smtpHost = smtpConfig.server || null;
          payload.smtpPort = parseInt(smtpConfig.port, 10) || 587;
          payload.smtpEncryption = smtpConfig.security || "tls";
          payload.smtpUsername = smtpConfig.username || null;
          if (smtpConfig.password) payload.smtpPassword = smtpConfig.password;
          payload.smtpTimeout = parseInt(smtpConfig.timeout, 10) || 30;
        }
        if (providerType === "api") {
          payload.dailyLimit = parseInt(apiConfig.dailyLimit, 10) || 0;
          if (apiConfig.apiKey && apiConfig.apiKey !== "••••••••") payload.apiKey = apiConfig.apiKey;
          payload.apiDomain = apiConfig.domain || undefined;
          payload.apiWebhookUrl = serializeMailgunSettings(apiConfig);
        }
        await api.updateSmtpConfig(currentConfig.id, payload);
        toast.success("Configuração atualizada com sucesso.");
      } else {
        const createPayload = {
          propertyId,
          name: "Configuração de E-mail",
          providerType: providerType === "api" ? "api" as const : providerType === "default" ? "default" as const : "smtp" as const,
          providerSlug: providerType === "api" ? apiConfig.provider : providerType === "default" ? "unistays" : "custom-smtp",
          fromEmail: providerType === "smtp" ? smtpConfig.fromEmail : apiConfig.fromEmail,
          fromName: providerType === "smtp" ? smtpConfig.fromName : apiConfig.fromName,
          replyTo: providerType === "smtp" ? (smtpConfig.replyTo || undefined) : undefined,
          lastTestEmail: testEmail?.trim() || undefined,
          trackOpens: apiConfig.trackOpens,
          trackClicks: apiConfig.trackClicks,
          apiWebhookUrl: serializeMailgunSettings(apiConfig),
          apiDomain: apiConfig.domain || undefined,
          templateIds,
          notificationSettings: {
            bounceAlert: notificationSettings.bounceAlert,
            deliveryReport: notificationSettings.deliveryReport,
            weeklyDigest: notificationSettings.weeklyDigest,
            alertEmail: notificationSettings.alertEmail || undefined,
            retryOnFail: notificationSettings.retryOnFail,
            retryAttempts: notificationSettings.retryAttempts,
          },
          ...(providerType === "smtp"
            ? {
                smtpHost: smtpConfig.server || undefined,
                smtpPort: parseInt(smtpConfig.port, 10) || 587,
                smtpEncryption: smtpConfig.security || "tls",
                smtpUsername: smtpConfig.username || undefined,
                smtpPassword: smtpConfig.password || undefined,
                smtpTimeout: parseInt(smtpConfig.timeout, 10) || 30,
              }
            : {}),
          ...(providerType === "api"
            ? {
                apiKey: apiConfig.apiKey && apiConfig.apiKey !== "••••••••" ? apiConfig.apiKey : undefined,
                dailyLimit: parseInt(apiConfig.dailyLimit, 10) || 0,
              }
            : {}),
          isDefault: true,
        };
        await api.createSmtpConfig(createPayload);
        toast.success("Configuração de e-mail criada com sucesso.");
      }
      onOpenChange(false);
      resetForm();
    } catch (e) {
      toast.error("Erro ao salvar", { description: (e as Error)?.message ?? String(e) });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setTestResult(null);
    setProviderType("smtp");
    setCurrentConfig(null);
    setSelectedPropertyId(initialPropertyId ?? null);
    setTestEmail("");
    setSmtpConfig({ ...defaultSmtpConfig });
    setApiConfig({ ...defaultApiConfig });
    setNotificationSettings({ ...defaultNotificationSettings });
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const canProceed = () => {
    switch (wizardSteps[currentStep].id) {
      case "provider":
        if (properties.length > 0 && selectedPropertyId == null) return false;
        return !!providerType;
      case "connection":
        if (providerType === "smtp") {
          return !!smtpConfig.server && !!smtpConfig.port;
        }
        if (providerType === "api") {
          if (!apiConfig.provider || !apiConfig.apiKey) return false;
          if (apiConfig.provider === "mailgun" && apiConfig.mailgunKeyType === "sending" && !apiConfig.domain.trim()) {
            return false;
          }
          return true;
        }
        return true;
      case "sender":
        if (providerType === "smtp") {
          return !!smtpConfig.fromEmail && !!smtpConfig.fromName;
        }
        if (providerType === "api") {
          return !!apiConfig.fromEmail && !!apiConfig.fromName;
        }
        return true;
      case "security":
        if (providerType === "smtp") {
          return !!smtpConfig.username;
        }
        return true;
      default:
        return true;
    }
  };

  const getSelectedProvider = () => API_PROVIDERS.find((p) => p.id === apiConfig.provider);

  const renderStepContent = () => {
    switch (wizardSteps[currentStep].id) {
      case "provider":
        return (
          <div className="space-y-6">
            {properties.length > 0 && (
              <div className="max-w-xl mx-auto space-y-2">
                <Label>Propriedade</Label>
                <Select
                  value={selectedPropertyId != null ? String(selectedPropertyId) : ""}
                  onValueChange={(v) => setSelectedPropertyId(v ? parseInt(v, 10) : null)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione a propriedade" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Mail className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Escolha o Provedor</h2>
              <p className="text-muted-foreground">
                Selecione como deseja enviar os e-mails do sistema
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <button
                onClick={() => setProviderType("smtp")}
                className={cn(
                  "p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg group relative overflow-hidden",
                  providerType === "smtp"
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : "border-border hover:border-blue-300 bg-card"
                )}
              >
                <div className="absolute top-2 right-2 text-4xl opacity-10">📧</div>
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-md",
                    providerType === "smtp"
                      ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                      : "bg-muted group-hover:bg-blue-100"
                  )}
                >
                  <Server
                    className={cn(
                      "h-7 w-7",
                      providerType === "smtp" ? "text-white" : "text-muted-foreground"
                    )}
                  />
                </div>
                <p className="font-semibold text-lg mb-1">SMTP Próprio</p>
                <p className="text-sm text-muted-foreground">
                  Configure seu servidor SMTP personalizado
                </p>
                {providerType === "smtp" && (
                  <CheckCircle2 className="absolute top-3 left-3 h-5 w-5 text-blue-500" />
                )}
              </button>

              <button
                onClick={() => setProviderType("api")}
                className={cn(
                  "p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg group relative overflow-hidden",
                  providerType === "api"
                    ? "border-emerald-500 bg-emerald-50 shadow-lg"
                    : "border-border hover:border-emerald-300 bg-card"
                )}
              >
                <div className="absolute top-2 right-2 text-4xl opacity-10">⚡</div>
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-md",
                    providerType === "api"
                      ? "bg-gradient-to-br from-emerald-500 to-green-500"
                      : "bg-muted group-hover:bg-emerald-100"
                  )}
                >
                  <Zap
                    className={cn(
                      "h-7 w-7",
                      providerType === "api" ? "text-white" : "text-muted-foreground"
                    )}
                  />
                </div>
                <p className="font-semibold text-lg mb-1">API Provider</p>
                <p className="text-sm text-muted-foreground">
                  SendGrid, Mailgun, Amazon SES, etc
                </p>
                {providerType === "api" && (
                  <CheckCircle2 className="absolute top-3 left-3 h-5 w-5 text-emerald-500" />
                )}
              </button>

              <button
                onClick={() => setProviderType("default")}
                className={cn(
                  "p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg group relative overflow-hidden",
                  providerType === "default"
                    ? "border-violet-500 bg-violet-50 shadow-lg"
                    : "border-border hover:border-violet-300 bg-card"
                )}
              >
                <div className="absolute top-2 right-2 text-4xl opacity-10">✨</div>
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-md",
                    providerType === "default"
                      ? "bg-gradient-to-br from-violet-500 to-purple-500"
                      : "bg-muted group-hover:bg-violet-100"
                  )}
                >
                  <Sparkles
                    className={cn(
                      "h-7 w-7",
                      providerType === "default" ? "text-white" : "text-muted-foreground"
                    )}
                  />
                </div>
                <p className="font-semibold text-lg mb-1">Uni | Stays</p>
                <p className="text-sm text-muted-foreground">
                  Serviço integrado sem configuração
                </p>
                {providerType === "default" && (
                  <CheckCircle2 className="absolute top-3 left-3 h-5 w-5 text-violet-500" />
                )}
              </button>
            </div>

            {providerType === "default" && (
              <div className="max-w-xl mx-auto mt-6 p-4 rounded-xl bg-violet-50 border border-violet-200">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-violet-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-violet-800">Serviço Uni | Stays</p>
                    <p className="text-sm text-violet-600 mt-1">
                      Inclui 1.000 e-mails/mês gratuitamente. Sem necessidade de configuração adicional.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "connection":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Server className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Configurar Conexão</h2>
              <p className="text-muted-foreground">
                {providerType === "smtp"
                  ? "Informe os dados do seu servidor SMTP"
                  : providerType === "api"
                  ? "Selecione o provedor e configure a API"
                  : "Configuração automática do Uni | Stays"}
              </p>
            </div>

            {providerType === "smtp" && (
              <div className="max-w-2xl mx-auto">
                <SmtpServerConnectionPanel
                  config={{
                    server: smtpConfig.server,
                    port: smtpConfig.port,
                    security: smtpConfig.security,
                    timeout: smtpConfig.timeout,
                    maxRetries: smtpConfig.maxRetries,
                  }}
                  onChange={(patch) => setSmtpConfig({ ...smtpConfig, ...patch })}
                />
              </div>
            )}

            {providerType === "api" && (
              <div className="max-w-2xl mx-auto space-y-4">
                <GenericApiConnectionPanel
                  apiConfig={apiConfig}
                  onChange={(patch) => {
                    setApiConfig({ ...apiConfig, ...patch });
                    if (patch.apiKey !== undefined) setMailgunVerifyResult(null);
                  }}
                  onSelectProvider={(providerId) =>
                    setApiConfig({
                      ...apiConfig,
                      provider: providerId,
                      mailgunKeyType: providerId === "mailgun" ? "sending" : "account",
                      mailgunRegion: providerId === "mailgun" ? "us" : "auto",
                      domain: providerId === "mailgun" && !apiConfig.domain ? "unistays.com.br" : apiConfig.domain,
                    })
                  }
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />

                {apiConfig.provider === "mailgun" && (
                  <MailgunConnectionPanel
                    apiConfig={apiConfig}
                    onChange={(patch) => {
                      setApiConfig({ ...apiConfig, ...patch });
                      if (patch.apiKey !== undefined) setMailgunVerifyResult(null);
                    }}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    configId={currentConfig?.id}
                    verifyResult={mailgunVerifyResult}
                    isValidating={isValidatingMailgun}
                    onValidate={handleValidateMailgun}
                    canValidate={!!apiConfig.apiKey || !!currentConfig?.id}
                  />
                )}
              </div>
            )}

            {providerType === "default" && (
              <div className="max-w-xl mx-auto">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 text-center">
                  <Sparkles className="h-16 w-16 text-violet-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Serviço Uni | Stays</h3>
                  <p className="text-muted-foreground mb-6">
                    Use o serviço integrado sem configurações adicionais
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-white border flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>1.000 e-mails/mês</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white border flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Configuração zero</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white border flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Alta entregabilidade</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white border flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Suporte incluso</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "sender":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Identidade do Remetente</h2>
              <p className="text-muted-foreground">
                Configure como seus e-mails aparecerão para os destinatários
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>E-mail do Remetente *</Label>
                  <Input
                    type="email"
                    placeholder="noreply@seuhotel.com"
                    value={providerType === "smtp" ? smtpConfig.fromEmail : apiConfig.fromEmail}
                    onChange={(e) =>
                      providerType === "smtp"
                        ? setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })
                        : setApiConfig({ ...apiConfig, fromEmail: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nome do Remetente *</Label>
                  <Input
                    placeholder="Hotel Exemplo"
                    value={providerType === "smtp" ? smtpConfig.fromName : apiConfig.fromName}
                    onChange={(e) =>
                      providerType === "smtp"
                        ? setSmtpConfig({ ...smtpConfig, fromName: e.target.value })
                        : setApiConfig({ ...apiConfig, fromName: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
              </div>

              {providerType === "smtp" && (
                <div className="space-y-2">
                  <Label>Reply-To (opcional)</Label>
                  <Input
                    type="email"
                    placeholder="contato@seuhotel.com"
                    value={smtpConfig.replyTo}
                    onChange={(e) =>
                      setSmtpConfig({ ...smtpConfig, replyTo: e.target.value })
                    }
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    E-mail que receberá as respostas dos clientes
                  </p>
                </div>
              )}

              {providerType === "api" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Webhook de Eventos (opcional)</Label>
                    <Input
                      placeholder="https://api.seuhotel.com/webhooks/email"
                      value={apiConfig.webhookUrl}
                      onChange={(e) =>
                        setApiConfig({ ...apiConfig, webhookUrl: e.target.value })
                      }
                      className="h-11"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
                      <div>
                        <Label>Rastrear Aberturas</Label>
                        <p className="text-xs text-muted-foreground">
                          Tracking de e-mails abertos
                        </p>
                      </div>
                      <Switch
                        checked={apiConfig.trackOpens}
                        onCheckedChange={(v) =>
                          setApiConfig({ ...apiConfig, trackOpens: v })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
                      <div>
                        <Label>Rastrear Cliques</Label>
                        <p className="text-xs text-muted-foreground">
                          Tracking de links clicados
                        </p>
                      </div>
                      <Switch
                        checked={apiConfig.trackClicks}
                        onCheckedChange={(v) =>
                          setApiConfig({ ...apiConfig, trackClicks: v })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="p-4 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">
                    Prévia do Remetente
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white border">
                  <p className="font-medium">
                    {(providerType === "smtp" ? smtpConfig.fromName : apiConfig.fromName) ||
                      "Nome do Remetente"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    &lt;
                    {(providerType === "smtp" ? smtpConfig.fromEmail : apiConfig.fromEmail) ||
                      "email@exemplo.com"}
                    &gt;
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Autenticação e Segurança</h2>
              <p className="text-muted-foreground">
                Configure as credenciais de acesso ao servidor
              </p>
            </div>

            {providerType === "smtp" && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-rose-600" />
                    <span className="text-sm font-medium text-rose-700">
                      Credenciais do Servidor SMTP
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Usuário *</Label>
                    <Input
                      placeholder="usuario@exemplo.com"
                      value={smtpConfig.username}
                      onChange={(e) =>
                        setSmtpConfig({ ...smtpConfig, username: e.target.value })
                      }
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Senha *</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={smtpConfig.password}
                        onChange={(e) =>
                          setSmtpConfig({ ...smtpConfig, password: e.target.value })
                        }
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Dica de Segurança</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Recomendamos usar uma senha de aplicativo específica em vez da
                        senha principal da conta de e-mail.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {providerType === "api" && (
              <div className="max-w-2xl mx-auto">
                <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Autenticação via API Key</h3>
                  <p className="text-muted-foreground">
                    A autenticação já está configurada através da API Key informada no
                    passo anterior.
                  </p>
                </div>
              </div>
            )}

            {providerType === "default" && (
              <div className="max-w-2xl mx-auto">
                <div className="p-6 rounded-xl bg-violet-50 border border-violet-200 text-center">
                  <CheckCircle2 className="h-12 w-12 text-violet-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Autenticação Automática</h3>
                  <p className="text-muted-foreground">
                    O serviço Uni | Stays gerencia a autenticação automaticamente.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Bell className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Notificações e Alertas</h2>
              <p className="text-muted-foreground">
                Configure alertas para falhas e relatórios de entrega
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              <div className="p-5 rounded-2xl border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Alertas de Entrega</h3>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações sobre problemas de envio
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label>Alerta de Bounce</Label>
                        <p className="text-xs text-muted-foreground">
                          E-mails que retornaram com erro
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.bounceAlert}
                      onCheckedChange={(v) =>
                        setNotificationSettings({ ...notificationSettings, bounceAlert: v })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <MailCheck className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label>Relatório de Entrega</Label>
                        <p className="text-xs text-muted-foreground">
                          Confirmação de e-mails entregues
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.deliveryReport}
                      onCheckedChange={(v) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          deliveryReport: v,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label>Resumo Semanal</Label>
                        <p className="text-xs text-muted-foreground">
                          Relatório consolidado toda segunda-feira
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyDigest}
                      onCheckedChange={(v) =>
                        setNotificationSettings({ ...notificationSettings, weeklyDigest: v })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                    <RefreshCw className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Reenvio Automático</h3>
                    <p className="text-sm text-muted-foreground">
                      Tentar novamente em caso de falha
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label>Retry em Falha</Label>
                      <p className="text-xs text-muted-foreground">
                        Reenviar automaticamente
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {notificationSettings.retryOnFail && (
                      <Select
                        value={notificationSettings.retryAttempts}
                        onValueChange={(v) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            retryAttempts: v,
                          })
                        }
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1x</SelectItem>
                          <SelectItem value="2">2x</SelectItem>
                          <SelectItem value="3">3x</SelectItem>
                          <SelectItem value="5">5x</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Switch
                      checked={notificationSettings.retryOnFail}
                      onCheckedChange={(v) =>
                        setNotificationSettings({ ...notificationSettings, retryOnFail: v })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>E-mail para Alertas</Label>
                <Input
                  type="email"
                  placeholder="admin@seuhotel.com"
                  value={notificationSettings.alertEmail}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      alertEmail: e.target.value,
                    })
                  }
                  className="h-11"
                />
              </div>
            </div>
          </div>
        );

      case "templates":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Templates Ativos</h2>
              <p className="text-muted-foreground">
                Visualize e gerencie os templates de e-mail configurados
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {templates.filter((t) => t.active).length} ativos
                  </Badge>
                  <Badge variant="outline">
                    {templates.filter((t) => !t.active).length} inativos
                  </Badge>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Gerenciar Templates
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={cn(
                      "p-4 rounded-xl border transition-all",
                      template.active
                        ? "bg-card hover:shadow-md"
                        : "bg-muted/30 opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            template.active
                              ? "bg-gradient-to-br from-cyan-500 to-blue-500"
                              : "bg-muted"
                          )}
                        >
                          <FileText
                            className={cn(
                              "h-5 w-5",
                              template.active ? "text-white" : "text-muted-foreground"
                            )}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {template.category}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={template.active}
                        onCheckedChange={(v) => {
                          setTemplates(
                            templates.map((t) =>
                              t.id === template.id ? { ...t, active: v } : t
                            )
                          );
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "test":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TestTube className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Testar Conexão</h2>
              <p className="text-muted-foreground">
                Envie um e-mail de teste para verificar se tudo está funcionando
              </p>
            </div>

            <div className="max-w-xl mx-auto space-y-6">
              <div className="space-y-2">
                <Label>E-mail de destino para o teste</Label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              {!currentConfig?.id && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Salve primeiro</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Conclua o assistente e clique em &quot;Salvar Configuração&quot;. Depois você poderá testar a conexão aqui.
                    </p>
                  </div>
                </div>
              )}
              <div className="p-6 rounded-2xl border bg-card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {testResult === "success" ? (
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      </div>
                    ) : testResult === "error" ? (
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <TestTube className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">
                        {testResult === "success"
                          ? "Conexão Estabelecida!"
                          : testResult === "error"
                          ? "Falha na Conexão"
                          : "Pronto para Testar"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testResult === "success"
                          ? "O servidor está configurado corretamente"
                          : testResult === "error"
                          ? "Verifique as credenciais e tente novamente"
                          : "Clique no botão para enviar um e-mail de teste"}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleTestConnection}
                  disabled={isTesting || !currentConfig?.id || !testEmail?.trim()}
                  className="w-full h-12 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                >
                  {isTesting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Testando Conexão...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Enviar E-mail de Teste
                    </>
                  )}
                </Button>
              </div>

              {testResult === "success" && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-emerald-800">Tudo Funcionando!</p>
                      <p className="text-sm text-emerald-700 mt-1">
                        Verifique sua caixa de entrada para confirmar o recebimento do
                        e-mail de teste.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {testResult === "error" && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Erro na Conexão</p>
                      <p className="text-sm text-red-700 mt-1">
                        Possíveis causas: credenciais incorretas, servidor bloqueado ou
                        porta fechada. Revise as configurações.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "confirm":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Revisar e Confirmar</h2>
              <p className="text-muted-foreground">
                Verifique todas as configurações antes de salvar
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              {/* Summary Card */}
              <div className="p-6 rounded-2xl border-2 border-blue-200 bg-blue-50/50 mb-6">
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className={`p-4 rounded-2xl shadow-lg ${
                      providerType === "smtp"
                        ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                        : providerType === "api"
                        ? "bg-gradient-to-br from-emerald-500 to-green-500"
                        : "bg-gradient-to-br from-violet-500 to-purple-500"
                    }`}
                  >
                    {providerType === "smtp" ? (
                      <Server className="h-8 w-8 text-white" />
                    ) : providerType === "api" ? (
                      <Zap className="h-8 w-8 text-white" />
                    ) : (
                      <Sparkles className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">
                      {providerType === "smtp"
                        ? "SMTP Próprio"
                        : providerType === "api"
                        ? getSelectedProvider()?.name || "API Provider"
                        : "Uni | Stays"}
                    </h3>
                    <p className="text-muted-foreground">
                      {providerType === "smtp"
                        ? smtpConfig.server
                        : providerType === "api"
                        ? apiConfig.domain || "Domínio não configurado"
                        : "Serviço integrado"}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge
                        variant={testResult === "success" ? "default" : "secondary"}
                      >
                        {testResult === "success" ? "Testado ✓" : "Não testado"}
                      </Badge>
                      <Badge variant="outline">
                        {templates.filter((t) => t.active).length} templates ativos
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-background border">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span className="text-xs text-muted-foreground">Remetente</span>
                    </div>
                    <p className="font-medium text-sm truncate">
                      {(providerType === "smtp"
                        ? smtpConfig.fromName
                        : apiConfig.fromName) || "-"}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-background border">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <span className="text-xs text-muted-foreground">E-mail</span>
                    </div>
                    <p className="font-medium text-sm truncate">
                      {(providerType === "smtp"
                        ? smtpConfig.fromEmail
                        : apiConfig.fromEmail) || "-"}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-background border">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="h-4 w-4 text-blue-500" />
                      <span className="text-xs text-muted-foreground">Alertas</span>
                    </div>
                    <p className="font-medium text-sm">
                      {notificationSettings.bounceAlert ? "Ativados" : "Desativados"}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-background border">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="h-4 w-4 text-blue-500" />
                      <span className="text-xs text-muted-foreground">Retry</span>
                    </div>
                    <p className="font-medium text-sm">
                      {notificationSettings.retryOnFail
                        ? `${notificationSettings.retryAttempts}x`
                        : "Desativado"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Configuration Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl border bg-card">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Server className="h-4 w-4 text-blue-500" />
                    Conexão
                  </h4>
                  <div className="space-y-2 text-sm">
                    {providerType === "smtp" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Servidor</span>
                          <span className="font-medium">{smtpConfig.server || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Porta</span>
                          <span className="font-medium">{smtpConfig.port}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Segurança</span>
                          <Badge variant="outline">{smtpConfig.security.toUpperCase()}</Badge>
                        </div>
                      </>
                    )}
                    {providerType === "api" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Provedor</span>
                          <span className="font-medium">
                            {getSelectedProvider()?.name || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Domínio</span>
                          <span className="font-medium">{apiConfig.domain || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Limite</span>
                          <span className="font-medium">{apiConfig.dailyLimit}/dia</span>
                        </div>
                      </>
                    )}
                    {providerType === "default" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plano</span>
                        <Badge variant="secondary">1.000 e-mails/mês</Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-card">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-cyan-500" />
                    Templates
                  </h4>
                  <div className="space-y-2">
                    {templates
                      .filter((t) => t.active)
                      .slice(0, 4)
                      .map((t) => (
                        <div key={t.id} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          <span className="truncate">{t.name}</span>
                        </div>
                      ))}
                    {templates.filter((t) => t.active).length > 4 && (
                      <p className="text-xs text-muted-foreground">
                        +{templates.filter((t) => t.active).length - 4} mais
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                <div>
                  <p className="font-medium text-emerald-700">Pronto para salvar!</p>
                  <p className="text-sm text-emerald-600">
                    Todas as configurações foram preenchidas corretamente
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
              <span className="text-sm text-muted-foreground">Carregando configuração...</span>
            </div>
          </div>
        )}
        <div className="flex h-full">
          {/* Left Sidebar */}
          <div className="w-72 bg-gradient-to-b from-blue-600 via-cyan-600 to-teal-600 text-white p-6 flex flex-col flex-shrink-0 min-h-0">
            {/* Header */}
            <div className="mb-8">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4">
                <Mail className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-xl font-bold">Configuração de E-mail</h2>
              <p className="text-white/70 text-sm mt-1">Servidor de envio</p>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-white/70">Progresso</span>
                <span className="font-semibold">{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Steps */}
            <ScrollArea className="flex-1 min-h-0 -mx-2 px-2">
              <div className="space-y-2">
                {wizardSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;
                  const isClickable = index <= currentStep;

                  return (
                    <button
                      key={step.id}
                      onClick={() => isClickable && setCurrentStep(index)}
                      disabled={!isClickable}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                        isCurrent && "bg-white/20 backdrop-blur",
                        isCompleted && "text-white/90 hover:bg-white/10",
                        !isCurrent && !isCompleted && "text-white/50",
                        isClickable && "cursor-pointer"
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0",
                          isCurrent && "bg-white text-blue-600",
                          isCompleted && "bg-emerald-400/30 text-white",
                          !isCurrent && !isCompleted && "bg-white/10"
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "font-medium text-sm",
                            isCurrent && "text-white",
                            !isCurrent && "text-white/80"
                          )}
                        >
                          {step.title}
                        </p>
                        <p
                          className={cn(
                            "text-xs truncate",
                            isCurrent && "text-white/70",
                            !isCurrent && "text-white/50"
                          )}
                        >
                          {step.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Close Button */}
            <Button
              variant="ghost"
              onClick={handleClose}
              className="mt-4 text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            {/* Content Header */}
            <div className="px-8 py-5 border-b flex-shrink-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Etapa {currentStep + 1} de {wizardSteps.length}
                </span>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-foreground">
                  {wizardSteps[currentStep].title}
                </span>
              </div>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-8">{renderStepContent()}</div>
            </ScrollArea>

            {/* Footer */}
            <div className="flex items-center justify-between gap-4 px-8 py-5 border-t bg-muted/30 flex-shrink-0">
              <Button variant="outline" onClick={handlePrevious} disabled={isFirstStep}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              <div className="flex items-center gap-1.5">
                {wizardSteps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      index === currentStep
                        ? "bg-blue-500 w-6"
                        : index < currentStep
                        ? "bg-emerald-500 w-2"
                        : "bg-muted-foreground/30 w-2"
                    )}
                  />
                ))}
              </div>

              {isLastStep ? (
                <Button
                  onClick={handleSave}
                  disabled={saving || (selectedPropertyId == null && properties.length > 0)}
                  className="min-w-[180px] bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configuração
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="min-w-[140px] bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
