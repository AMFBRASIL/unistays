import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Eye, EyeOff, Mail, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { API_PROVIDERS, type ApiProviderConfig } from "./types";

interface GenericApiConnectionPanelProps {
  apiConfig: ApiProviderConfig;
  onChange: (patch: Partial<ApiProviderConfig>) => void;
  onSelectProvider: (providerId: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
}

export function GenericApiConnectionPanel({
  apiConfig,
  onChange,
  onSelectProvider,
  showPassword,
  onTogglePassword,
}: GenericApiConnectionPanelProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">Provedor de API transacional</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {API_PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() => onSelectProvider(provider.id)}
            className={cn(
              "rounded-xl border-2 p-4 text-left transition-all hover:shadow-md",
              apiConfig.provider === provider.id
                ? "border-emerald-500 bg-emerald-50"
                : "border-border bg-card hover:border-emerald-300"
            )}
          >
            <div
              className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${provider.color}`}
            >
              <Mail className="h-5 w-5 text-white" />
            </div>
            <p className="font-medium">{provider.name}</p>
            <p className="text-xs text-muted-foreground">{provider.description}</p>
          </button>
        ))}
      </div>

      {apiConfig.provider && apiConfig.provider !== "mailgun" && (
        <div className="space-y-4 border-t pt-4">
          <div className="space-y-2">
            <Label>API Key *</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Cole sua API Key"
                value={apiConfig.apiKey}
                onChange={(e) => onChange({ apiKey: e.target.value })}
                className="h-11 pr-20 font-mono"
              />
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
                <button
                  type="button"
                  onClick={onTogglePassword}
                  className="p-1.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(apiConfig.apiKey);
                    toast.success("Copiado!");
                  }}
                  className="p-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Domínio autenticado</Label>
              <Input
                placeholder="mail.seuhotel.com"
                value={apiConfig.domain}
                onChange={(e) => onChange({ domain: e.target.value })}
                className="h-11"
              />
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
        </div>
      )}
    </div>
  );
}
