import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { saveSelfmartConfig, loadSelfmartConfig, type SelfmartConfig } from "@/lib/selfmart";
import { toast } from "sonner";

interface SelfmartIntegrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (config: SelfmartConfig) => void;
}

export function SelfmartIntegrationModal({
  open,
  onOpenChange,
  onSaved,
}: SelfmartIntegrationModalProps) {
  const [config, setConfig] = useState<SelfmartConfig>(loadSelfmartConfig());

  useEffect(() => {
    if (open) {
      setConfig(loadSelfmartConfig());
    }
  }, [open]);

  const updateField = (field: keyof SelfmartConfig, value: string | boolean) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveSelfmartConfig(config);
    toast.success("Integracao Selfmart salva com sucesso");
    onSaved?.(config);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Integracao Selfmart</DialogTitle>
          <DialogDescription>
            Integracao isolada da Unistays. Se desativar, nada muda no motor de reservas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Habilitar Selfmart</p>
              <p className="text-xs text-muted-foreground">
                Ativa somente a pagina de relatorio em <code>/selfmart</code>.
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(value) => updateField("enabled", value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="selfmart-base-url">Base URL</Label>
            <Input
              id="selfmart-base-url"
              value={config.baseUrl}
              onChange={(e) => updateField("baseUrl", e.target.value)}
              placeholder="https://apiselfmart.couplerewind.com.br"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="selfmart-api-token">Token Bearer</Label>
            <Input
              id="selfmart-api-token"
              type="password"
              value={config.apiToken}
              onChange={(e) => updateField("apiToken", e.target.value)}
              placeholder="MASTER_KEY_..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
