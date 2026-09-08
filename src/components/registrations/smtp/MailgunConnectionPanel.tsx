import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Info,
  Key,
  Loader2,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import type { ApiProviderConfig, MailgunVerifyState } from "./types";

interface MailgunConnectionPanelProps {
  apiConfig: ApiProviderConfig;
  onChange: (patch: Partial<ApiProviderConfig>) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  configId?: number;
  verifyResult: MailgunVerifyState | null;
  isValidating: boolean;
  onValidate: () => void;
  canValidate: boolean;
}

export function MailgunConnectionPanel({
  apiConfig,
  onChange,
  showPassword,
  onTogglePassword,
  verifyResult,
  isValidating,
  onValidate,
  canValidate,
}: MailgunConnectionPanelProps) {
  const isSendingKey = apiConfig.mailgunKeyType === "sending";

  return (
    <div className="space-y-5 pt-2">
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
          <div className="space-y-2">
            <p className="font-medium">Mailgun API v3 (HTTP Basic: usuário <code>api</code>)</p>
            <ul className="list-disc space-y-1 pl-4 text-orange-800">
              <li>
                <strong>Chave da conta</strong> — Account Settings → API Keys (lista domínios e envia por qualquer domínio)
              </li>
              <li>
                <strong>Chave de envio</strong> — Sending → Domínio → Sending API keys (só POST /v3/&#123;domínio&#125;/messages)
              </li>
              <li>
                Não use Webhook Signing Key nem Verification Public Key
              </li>
            </ul>
            <a
              href="https://documentation.mailgun.com/docs/mailgun/api-reference/mg-auth"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-orange-700 underline-offset-2 hover:underline"
            >
              Documentação oficial
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Tipo de chave</Label>
          <Select
            value={apiConfig.mailgunKeyType}
            onValueChange={(value: "account" | "sending") => {
              onChange({ mailgunKeyType: value });
            }}
          >
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="account">Chave da conta (recomendado)</SelectItem>
              <SelectItem value="sending">Chave de envio do domínio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Região</Label>
          <Select
            value={apiConfig.mailgunRegion}
            onValueChange={(value: "auto" | "us" | "eu") => onChange({ mailgunRegion: value })}
          >
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Automático (US → EU)</SelectItem>
              <SelectItem value="us">US — api.mailgun.net</SelectItem>
              <SelectItem value="eu">EU — api.eu.mailgun.net</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          API Key *
        </Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={isSendingKey ? "Chave de envio do domínio" : "Private API key da conta"}
            value={apiConfig.apiKey}
            onChange={(e) => onChange({ apiKey: e.target.value })}
            className="h-11 pr-20 font-mono text-sm"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
            <button
              type="button"
              onClick={onTogglePassword}
              className="rounded p-1.5 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(apiConfig.apiKey);
                toast.success("Copiado!");
              }}
              className="rounded p-1.5 text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          A chave completa só aparece uma vez ao criar no painel Mailgun.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Domínio de envio {isSendingKey ? "*" : "(opcional)"}</Label>
          <Input
            placeholder={isSendingKey ? "mail.seudominio.com" : "Detectado via API se vazio"}
            value={apiConfig.domain}
            onChange={(e) => onChange({ domain: e.target.value })}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            {isSendingKey
              ? "Obrigatório para chaves de envio. Use o domínio verificado no Mailgun."
              : "Com chave da conta, listamos os domínios via GET /v3/domains."}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Limite diário</Label>
          <Input
            type="number"
            placeholder="10000"
            value={apiConfig.dailyLimit}
            onChange={(e) => onChange({ dailyLimit: e.target.value })}
            className="h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="h-10"
          disabled={isValidating || !canValidate}
          onClick={onValidate}
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validando na API v3...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Validar credenciais (modo teste, sem enviar e-mail)
            </>
          )}
        </Button>

        {verifyResult && (
          <div
            className={cn(
              "rounded-lg border px-3 py-2 text-sm",
              verifyResult.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            )}
          >
            {verifyResult.message}
          </div>
        )}
      </div>
    </div>
  );
}
