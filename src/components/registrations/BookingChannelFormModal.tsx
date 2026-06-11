import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Globe } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { BookingChannelItem } from "./BookingChannelsListModal";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "bg-primary",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-slate-500",
];

interface BookingChannelFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: BookingChannelItem | null;
}

export function BookingChannelFormModal({
  open,
  onOpenChange,
  channel,
}: BookingChannelFormModalProps) {
  const isEdit = !!channel?.id;
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [color, setColor] = useState("bg-primary");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [defaultCommission, setDefaultCommission] = useState("");
  const [metadataJson, setMetadataJson] = useState("");

  useEffect(() => {
    if (open) {
      if (channel) {
        setName(channel.name);
        setSlug(channel.slug);
        setColor(channel.color || "bg-primary");
        setStatus((channel.status as "active" | "inactive") || "active");
        const comm = channel.defaultCommission ?? (channel as any).default_commission ?? 0;
        setDefaultCommission(String(comm));
        setMetadataJson(
          channel.metadata != null
            ? typeof channel.metadata === "string"
              ? channel.metadata
              : JSON.stringify(channel.metadata, null, 2)
            : ""
        );
      } else {
        setName("");
        setSlug("");
        setColor("bg-primary");
        setStatus("active");
        setDefaultCommission("0");
        setMetadataJson("");
      }
    }
  }, [open, channel]);

  const deriveSlug = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEdit) setSlug(deriveSlug(value));
  };

  const parseMetadata = (): any => {
    const t = metadataJson.trim();
    if (!t) return null;
    try {
      return JSON.parse(t);
    } catch {
      return undefined;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const comm = defaultCommission.replace(",", ".");
    const numComm = Number(comm);
    if (Number.isNaN(numComm) || numComm < 0 || numComm > 100) {
      toast.error("Comissão deve ser entre 0 e 100");
      return;
    }
    const meta = parseMetadata();
    if (metadataJson.trim() && meta === undefined) {
      toast.error("Metadados inválidos. Use JSON válido.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || deriveSlug(name),
        color,
        status,
        defaultCommission: numComm,
        metadata: meta ?? null,
      };
      if (isEdit && channel) {
        const res = await api.updateBookingChannel(channel.id, payload);
        if (res.success) {
          toast.success("Canal atualizado");
          onOpenChange(false);
        } else {
          toast.error((res as any).message || "Erro ao atualizar");
        }
      } else {
        const res = await api.createBookingChannel(payload);
        if (res.success) {
          toast.success("Canal cadastrado");
          onOpenChange(false);
        } else {
          toast.error((res as any).message || "Erro ao cadastrar");
        }
      }
    } catch {
      toast.error("Erro ao salvar canal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-md">
        <DialogHeader className="px-8 py-6 border-b bg-muted/20 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-600 shadow-lg shadow-rose-500/20">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {isEdit ? "Editar Canal de Venda" : "Novo Canal de Venda"}
              </DialogTitle>
              <p className="text-muted-foreground mt-1">
                {isEdit
                  ? "Altere os dados do canal de distribuição."
                  : "Cadastre um novo canal (OTA, agência ou direto)."}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <ScrollArea className="flex-1 px-8 py-6">
            <div className="space-y-6 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="channel-name">Nome *</Label>
                  <Input
                    id="channel-name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex: Booking.com, Agência XYZ"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="channel-slug">Slug *</Label>
                  <Input
                    id="channel-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="Ex: booking, agencia-xyz"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Identificador único (sem espaços, minúsculo). Usado em reservas.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cor (interface)</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        c,
                        color === c ? "border-foreground ring-2 ring-offset-2 ring-offset-background ring-foreground" : "border-transparent"
                      )}
                      title={c}
                    />
                  ))}
                </div>
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="mt-2 max-w-xs font-mono"
                  placeholder="bg-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="channel-commission">Comissão padrão (%)</Label>
                  <Input
                    id="channel-commission"
                    type="text"
                    inputMode="decimal"
                    value={defaultCommission}
                    onChange={(e) => setDefaultCommission(e.target.value)}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentual aplicado por padrão em reservas deste canal.
                  </p>
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <Label htmlFor="channel-status">Ativo</Label>
                      <p className="text-xs text-muted-foreground">
                        Canais inativos não aparecem na seleção de novas reservas.
                      </p>
                    </div>
                    <Switch
                      id="channel-status"
                      checked={status === "active"}
                      onCheckedChange={(checked) => setStatus(checked ? "active" : "inactive")}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="channel-metadata">Metadados (JSON)</Label>
                <Textarea
                  id="channel-metadata"
                  value={metadataJson}
                  onChange={(e) => setMetadataJson(e.target.value)}
                  placeholder='{"apiKey": "...", "externalId": "..."}'
                  className="font-mono text-sm min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  Dados extras (chaves de API, IDs externos, etc.) em JSON. Opcional.
                </p>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-8 py-4 border-t bg-muted/10 shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "Salvando…" : isEdit ? "Salvar alterações" : "Cadastrar canal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
