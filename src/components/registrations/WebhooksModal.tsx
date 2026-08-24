import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Webhook,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  Clock,
  Shield,
  Eye,
  EyeOff,
  Activity,
  Send,
  Globe,
  Bell,
  ArrowRight,
  ArrowLeft,
  PlayCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface WebhooksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WebhookRow {
  id: number;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastTriggeredAt: string | null;
  lastStatus: string | null;
  successRate: number;
  totalCalls: number;
}

const steps = [
  { id: 1, title: "Visão Geral", description: "Dashboard e webhooks existentes" },
  { id: 2, title: "Endpoint", description: "URL e identificação" },
  { id: 3, title: "Eventos", description: "Selecionar gatilhos" },
  { id: 4, title: "Segurança", description: "Chave secreta e validação" },
  { id: 5, title: "Teste", description: "Validar conexão" },
];

const availableEvents = [
  {
    category: "Reservas",
    events: [
      { id: "reservation.created", label: "Reserva Criada", description: "Nova reserva no PMS ou site" },
      { id: "reservation.cancelled", label: "Reserva Cancelada", description: "Cancelamento de reserva" },
      { id: "reservation.checkin", label: "Check-in", description: "Hóspede fez check-in" },
      { id: "reservation.checkout", label: "Check-out", description: "Hóspede fez check-out" },
    ],
  },
  {
    category: "Hóspedes",
    events: [
      { id: "guest.created", label: "Hóspede Cadastrado", description: "Novo cadastro de hóspede" },
    ],
  },
  {
    category: "Pagamentos",
    events: [
      { id: "payment.received", label: "Pagamento Recebido", description: "Pagamento processado" },
      { id: "financial.reservation_payment", label: "Pagamento de Reserva", description: "Entrada financeira de reserva" },
    ],
  },
];

export function WebhooksModal({ open, onOpenChange }: WebhooksModalProps) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSecrets, setShowSecrets] = useState<Record<number, boolean>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);
  const [saving, setSaving] = useState(false);

  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    events: [] as string[],
    secret: "",
  });

  const progress = (currentStep / steps.length) * 100;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getOutboundWebhooks();
      if (res.success && res.data?.webhooks) {
        setWebhooks(res.data.webhooks as WebhookRow[]);
      } else {
        setWebhooks([]);
        toast.error(res.error?.message || "Falha ao carregar webhooks");
      }
    } catch {
      toast.error("Falha ao carregar webhooks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setIsCreating(false);
      setTestResult(null);
      void load();
    }
  }, [open, load]);

  const activeCount = useMemo(() => webhooks.filter((w) => w.isActive).length, [webhooks]);
  const totalCalls = useMemo(() => webhooks.reduce((acc, w) => acc + (w.totalCalls || 0), 0), [webhooks]);
  const avgSuccess = useMemo(() => {
    const withCalls = webhooks.filter((w) => w.totalCalls > 0);
    if (!withCalls.length) return 100;
    return Math.round(
      (withCalls.reduce((acc, w) => acc + w.successRate, 0) / withCalls.length) * 10,
    ) / 10;
  }, [webhooks]);

  const handleAddWebhook = async () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast.error("Preencha nome, URL e ao menos um evento");
      return;
    }
    setSaving(true);
    try {
      const res = await api.createOutboundWebhook({
        name: newWebhook.name.trim(),
        url: newWebhook.url.trim(),
        events: newWebhook.events,
        secret: newWebhook.secret.trim() || undefined,
      });
      if (!res.success) {
        toast.error(res.error?.message || "Falha ao criar webhook");
        return;
      }
      toast.success("Webhook criado e salvo no banco");
      setNewWebhook({ name: "", url: "", events: [], secret: "" });
      setIsCreating(false);
      setCurrentStep(1);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Excluir este webhook?")) return;
    const res = await api.deleteOutboundWebhook(id);
    if (!res.success) {
      toast.error(res.error?.message || "Falha ao excluir");
      return;
    }
    toast.success("Webhook removido");
    await load();
  };

  const handleToggleActive = async (wh: WebhookRow, active: boolean) => {
    const res = await api.updateOutboundWebhook(wh.id, { isActive: active });
    if (!res.success) {
      toast.error(res.error?.message || "Falha ao atualizar");
      return;
    }
    await load();
  };

  const handleTestExisting = async (id: number) => {
    setIsTesting(true);
    try {
      const res = await api.testOutboundWebhook(id);
      if (res.success && res.data?.ok) {
        toast.success(res.data.message || "Teste OK");
      } else {
        toast.error(res.data?.message || res.error?.message || "Teste falhou");
      }
      await load();
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestNew = async () => {
    // Cria temporariamente se ainda não salvou — ou só valida campos
    if (!newWebhook.name || !newWebhook.url || !newWebhook.events.length) {
      toast.error("Preencha os passos anteriores antes de testar");
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    setSaving(true);
    try {
      const createRes = await api.createOutboundWebhook({
        name: newWebhook.name.trim(),
        url: newWebhook.url.trim(),
        events: newWebhook.events,
        secret: newWebhook.secret.trim() || undefined,
      });
      if (!createRes.success || !createRes.data) {
        setTestResult("error");
        toast.error(createRes.error?.message || "Falha ao criar para teste");
        return;
      }
      const created = createRes.data as { id: number };
      const testRes = await api.testOutboundWebhook(created.id);
      setTestResult(testRes.data?.ok ? "success" : "error");
      if (testRes.data?.ok) {
        toast.success("Webhook criado e teste OK");
        setIsCreating(false);
        setCurrentStep(1);
        setNewWebhook({ name: "", url: "", events: [], secret: "" });
      } else {
        toast.error(testRes.data?.message || "Teste falhou — webhook foi criado mesmo assim");
        setIsCreating(false);
        setCurrentStep(1);
      }
      await load();
    } finally {
      setIsTesting(false);
      setSaving(false);
    }
  };

  const toggleEvent = (eventId: string) => {
    setNewWebhook((prev) => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter((e) => e !== eventId)
        : [...prev.events, eventId],
    }));
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Webhook className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Webhooks Ativos</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgSuccess}%</p>
              <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCalls.toLocaleString("pt-BR")}</p>
              <p className="text-sm text-muted-foreground">Total de Chamadas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/80 text-sm">
        <div className="flex gap-2">
          <Shield className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">Segurança dos Webhooks</p>
            <p className="text-amber-800/80 mt-1">
              Cada webhook tem uma assinatura HMAC (<code className="text-xs">X-Unistays-Signature</code>).
              Isto é diferente do webhook da Channex (entrada de reservas OTA), configurado em Integrações.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Webhooks Configurados</h3>
        <Button
          size="sm"
          className="gap-1"
          onClick={() => {
            setIsCreating(true);
            setCurrentStep(2);
            setNewWebhook({
              name: "",
              url: "",
              events: [],
              secret: `whsec_${Math.random().toString(36).slice(2, 18)}`,
            });
          }}
        >
          <Plus className="h-4 w-4" />
          Novo Webhook
        </Button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
        </div>
      ) : webhooks.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm border rounded-xl">
          Nenhum webhook no banco. Clique em Novo Webhook ou reinicie o backend para criar o seed interno.
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <div key={wh.id} className="p-4 rounded-xl border bg-card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{wh.name}</p>
                    <Badge variant={wh.isActive ? "default" : "outline"}>
                      {wh.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                    {wh.lastStatus === "error" && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Erro
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mt-1 break-all">{wh.url}</p>
                </div>
                <Switch
                  checked={wh.isActive}
                  onCheckedChange={(v) => void handleToggleActive(wh, v)}
                />
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {wh.lastTriggeredAt
                    ? new Date(wh.lastTriggeredAt).toLocaleString("pt-BR")
                    : "Nunca disparado"}
                </span>
                <span>{wh.successRate}% sucesso</span>
                <span>{wh.totalCalls} chamadas</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {wh.events.map((ev) => (
                  <Badge key={ev} variant="outline" className="text-[10px] font-mono">
                    {ev}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  type={showSecrets[wh.id] ? "text" : "password"}
                  value={wh.secret}
                  className="font-mono text-xs h-8"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowSecrets((s) => ({ ...s, [wh.id]: !s[wh.id] }))}
                >
                  {showSecrets[wh.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    void navigator.clipboard.writeText(wh.secret);
                    toast.success("Secret copiado");
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={isTesting}
                  onClick={() => void handleTestExisting(wh.id)}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-rose-600"
                  onClick={() => void handleDelete(wh.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCreateSteps = () => {
    switch (currentStep) {
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={newWebhook.name}
                onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                placeholder="Ex.: CRM, ERP, Slack"
              />
            </div>
            <div className="space-y-2">
              <Label>URL do endpoint</Label>
              <Input
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                placeholder="https://seu-sistema.com/webhooks/unistays"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            {availableEvents.map((cat) => (
              <div key={cat.category}>
                <p className="text-sm font-medium mb-2">{cat.category}</p>
                <div className="space-y-2">
                  {cat.events.map((ev) => {
                    const selected = newWebhook.events.includes(ev.id);
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => toggleEvent(ev.id)}
                        className={`w-full text-left p-3 rounded-lg border transition ${
                          selected ? "border-orange-400 bg-orange-50" : "hover:bg-muted/50"
                        }`}
                      >
                        <p className="font-medium text-sm">{ev.label}</p>
                        <p className="text-xs text-muted-foreground">{ev.description}</p>
                        <p className="text-[10px] font-mono text-muted-foreground mt-1">{ev.id}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Secret (HMAC)</Label>
              <Input
                value={newWebhook.secret}
                onChange={(e) => setNewWebhook({ ...newWebhook, secret: e.target.value })}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enviado no header <code>X-Unistays-Signature: sha256=...</code>
              </p>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 text-center py-6">
            <PlayCircle className="h-12 w-12 mx-auto text-orange-500" />
            <p className="font-medium">Pronto para salvar e testar</p>
            <p className="text-sm text-muted-foreground">
              Vamos criar o webhook no banco e enviar um evento de teste para a URL.
            </p>
            {testResult === "success" && (
              <Badge className="bg-emerald-500">Teste OK</Badge>
            )}
            {testResult === "error" && (
              <Badge variant="destructive">Teste falhou</Badge>
            )}
            <Button
              onClick={() => void handleTestNew()}
              disabled={isTesting || saving}
              className="gap-2"
            >
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Salvar e testar
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <div className="flex min-h-[520px]">
          <aside className="w-56 border-r bg-muted/30 p-4 space-y-4 shrink-0">
            <div>
              <h2 className="font-semibold flex items-center gap-2">
                <Webhook className="h-4 w-4 text-orange-600" />
                Webhooks
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Notificações automáticas</p>
            </div>
            {isCreating && (
              <>
                <Progress value={progress} className="h-1.5" />
                <p className="text-xs text-muted-foreground">Progresso {Math.round(progress)}%</p>
                <nav className="space-y-1">
                  {steps.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      disabled={s.id === 1}
                      onClick={() => s.id > 1 && setCurrentStep(s.id)}
                      className={`w-full text-left px-2 py-2 rounded-md text-sm ${
                        currentStep === s.id ? "bg-background shadow-sm font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </nav>
              </>
            )}
            {!isCreating && (
              <button
                type="button"
                className="w-full text-left px-2 py-2 rounded-md text-sm bg-background shadow-sm font-medium flex items-center gap-2"
              >
                <Activity className="h-3.5 w-3.5" />
                Visão Geral
              </button>
            )}
            <div className="p-3 rounded-lg bg-orange-500/10 text-xs text-orange-900">
              <Bell className="h-4 w-4 mb-1" />
              Receba notificações em tempo real dos eventos do sistema
            </div>
          </aside>

          <div className="flex-1 flex flex-col min-w-0">
            <DialogHeader className="px-6 pt-5 pb-3 border-b">
              <DialogTitle className="flex items-center gap-2">
                {isCreating ? (
                  <>
                    <Globe className="h-5 w-5 text-orange-600" />
                    Novo Webhook
                  </>
                ) : (
                  <>
                    <Activity className="h-5 w-5 text-orange-600" />
                    Webhooks do sistema
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="flex-1 px-6 py-4 max-h-[60vh]">
              {isCreating ? renderCreateSteps() : renderOverview()}
            </ScrollArea>

            {isCreating && (
              <div className="px-6 py-3 border-t flex justify-between">
                <Button
                  variant="outline"
                  className="gap-1"
                  onClick={() => {
                    if (currentStep <= 2) {
                      setIsCreating(false);
                      setCurrentStep(1);
                    } else {
                      setCurrentStep((s) => s - 1);
                    }
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
                {currentStep < 5 ? (
                  <Button
                    className="gap-1"
                    onClick={() => {
                      if (currentStep === 2 && (!newWebhook.name || !newWebhook.url)) {
                        toast.error("Informe nome e URL");
                        return;
                      }
                      if (currentStep === 3 && newWebhook.events.length === 0) {
                        toast.error("Selecione ao menos um evento");
                        return;
                      }
                      setCurrentStep((s) => s + 1);
                    }}
                  >
                    Próximo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    className="gap-1"
                    disabled={saving}
                    onClick={() => void handleAddWebhook()}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Salvar sem teste
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
