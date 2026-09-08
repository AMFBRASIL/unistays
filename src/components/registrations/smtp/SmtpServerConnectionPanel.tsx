import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Server } from "lucide-react";

export interface SmtpServerConfig {
  server: string;
  port: string;
  security: string;
  timeout: string;
  maxRetries: string;
}

interface SmtpServerConnectionPanelProps {
  config: SmtpServerConfig;
  onChange: (patch: Partial<SmtpServerConfig>) => void;
}

export function SmtpServerConnectionPanel({ config, onChange }: SmtpServerConnectionPanelProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Servidor SMTP (ex.: smtp.mailgun.org:587)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Servidor SMTP *</Label>
          <Input
            placeholder="smtp.exemplo.com"
            value={config.server}
            onChange={(e) => onChange({ server: e.target.value })}
            className="h-11"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Porta *</Label>
            <Select value={config.port} onValueChange={(v) => onChange({ port: v })}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="465">465 (SSL)</SelectItem>
                <SelectItem value="587">587 (TLS)</SelectItem>
                <SelectItem value="2525">2525</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Segurança</Label>
            <Select value={config.security} onValueChange={(v) => onChange({ security: v })}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                <SelectItem value="tls">TLS</SelectItem>
                <SelectItem value="ssl">SSL</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Timeout (segundos)</Label>
          <Input
            type="number"
            value={config.timeout}
            onChange={(e) => onChange({ timeout: e.target.value })}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label>Tentativas em falha</Label>
          <Input
            type="number"
            value={config.maxRetries}
            onChange={(e) => onChange({ maxRetries: e.target.value })}
            className="h-11"
          />
        </div>
      </div>
    </div>
  );
}
