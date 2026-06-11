import { useState } from "react";
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
  AlertCircle,
  Clock,
  Zap,
  Shield,
  Eye,
  EyeOff,
  Activity,
  Send,
  Globe,
  Lock,
  Bell,
  Settings,
  ArrowRight,
  ArrowLeft,
  Check,
  PlayCircle,
  RefreshCw,
  Code,
  Link2,
  Server,
  FileJson,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WebhooksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
  lastTriggered?: string;
  status: "active" | "error" | "pending";
  successRate?: number;
  totalCalls?: number;
}

const steps = [
  { id: 1, title: "Visão Geral", icon: Activity, description: "Dashboard e webhooks existentes" },
  { id: 2, title: "Endpoint", icon: Globe, description: "URL e identificação" },
  { id: 3, title: "Eventos", icon: Bell, description: "Selecionar gatilhos" },
  { id: 4, title: "Segurança", icon: Shield, description: "Chave secreta e validação" },
  { id: 5, title: "Teste", icon: PlayCircle, description: "Validar conexão" },
];

const availableEvents = [
  { category: "Reservas", icon: "🏨", events: [
    { id: "reservation.created", label: "Reserva Criada", description: "Quando uma nova reserva é feita" },
    { id: "reservation.confirmed", label: "Reserva Confirmada", description: "Quando uma reserva é confirmada" },
    { id: "reservation.cancelled", label: "Reserva Cancelada", description: "Quando uma reserva é cancelada" },
    { id: "reservation.modified", label: "Reserva Modificada", description: "Quando uma reserva é alterada" },
  ]},
  { category: "Hóspedes", icon: "👤", events: [
    { id: "guest.created", label: "Hóspede Cadastrado", description: "Novo cadastro de hóspede" },
    { id: "guest.checkin", label: "Check-in Realizado", description: "Quando o hóspede faz check-in" },
    { id: "guest.checkout", label: "Check-out Realizado", description: "Quando o hóspede faz check-out" },
  ]},
  { category: "Pagamentos", icon: "💳", events: [
    { id: "payment.completed", label: "Pagamento Concluído", description: "Pagamento processado com sucesso" },
    { id: "payment.failed", label: "Pagamento Falhou", description: "Erro no processamento" },
    { id: "payment.refunded", label: "Estorno Realizado", description: "Valor estornado ao cliente" },
  ]},
  { category: "Sistema", icon: "⚙️", events: [
    { id: "room.status_changed", label: "Status do Quarto", description: "Mudança de status do quarto" },
    { id: "invoice.generated", label: "Nota Fiscal Gerada", description: "Emissão de NF automática" },
  ]},
];

export function WebhooksModal({ open, onOpenChange }: WebhooksModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: "1",
      name: "Sistema de Pagamentos",
      url: "https://api.pagamentos.com/webhook",
      events: ["payment.completed", "payment.failed"],
      active: true,
      secret: "whsec_xxxxxxxxxxxxxxxxxxxx",
      lastTriggered: "2024-01-15T10:30:00",
      status: "active",
      successRate: 98.5,
      totalCalls: 1247,
    },
    {
      id: "2",
      name: "CRM Integration",
      url: "https://crm.exemplo.com/api/webhooks",
      events: ["guest.created", "reservation.confirmed"],
      active: true,
      secret: "whsec_yyyyyyyyyyyyyyyyyyyy",
      lastTriggered: "2024-01-15T09:15:00",
      status: "active",
      successRate: 99.2,
      totalCalls: 856,
    },
  ]);

  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    events: [] as string[],
    secret: `whsec_${Math.random().toString(36).substring(2, 24)}`,
  });

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddWebhook = () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos e selecione ao menos um evento.",
        variant: "destructive",
      });
      return;
    }

    const webhook: WebhookConfig = {
      id: Date.now().toString(),
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events,
      active: true,
      secret: newWebhook.secret,
      status: "pending",
      successRate: 0,
      totalCalls: 0,
    };

    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ 
      name: "", 
      url: "", 
      events: [], 
      secret: `whsec_${Math.random().toString(36).substring(2, 24)}` 
    });
    setIsCreating(false);
    setCurrentStep(1);
    
    toast({
      title: "Webhook criado!",
      description: "O webhook foi configurado com sucesso.",
    });
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    toast({
      title: "Webhook removido",
      description: "O webhook foi excluído com sucesso.",
    });
  };

  const handleTestWebhook = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsTesting(false);
    setTestResult("success");
    
    toast({
      title: "Teste enviado!",
      description: "O evento de teste foi disparado com sucesso.",
    });
  };

  const toggleSecret = (id: string) => {
    setShowSecrets({ ...showSecrets, [id]: !showSecrets[id] });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!" });
  };

  const toggleEvent = (eventId: string) => {
    if (newWebhook.events.includes(eventId)) {
      setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(e => e !== eventId) });
    } else {
      setNewWebhook({ ...newWebhook, events: [...newWebhook.events, eventId] });
    }
  };

  const startCreating = () => {
    setIsCreating(true);
    setCurrentStep(2);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Webhook className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{webhooks.length}</p>
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
                    <p className="text-2xl font-bold text-foreground">98.7%</p>
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
                    <p className="text-2xl font-bold text-foreground">
                      {webhooks.reduce((acc, w) => acc + (w.totalCalls || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Total de Chamadas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-1">Segurança dos Webhooks</h4>
                  <p className="text-sm text-muted-foreground">
                    Cada webhook possui uma assinatura secreta única. Use-a para validar que as requisições vêm do Unistays.
                  </p>
                </div>
              </div>
            </div>

            {/* Webhooks List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-500" />
                  Webhooks Configurados
                </h3>
                <Button
                  onClick={startCreating}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Webhook
                </Button>
              </div>

              {webhooks.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-muted/30 border border-border">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                    <Webhook className="h-8 w-8 text-orange-500" />
                  </div>
                  <p className="text-muted-foreground mb-4">Nenhum webhook configurado</p>
                  <Button
                    variant="outline"
                    onClick={startCreating}
                  >
                    Criar primeiro webhook
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {webhooks.map((webhook) => (
                    <div
                      key={webhook.id}
                      className="p-4 rounded-xl bg-card border border-border hover:border-orange-300 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${webhook.active ? "bg-emerald-100" : "bg-muted"}`}>
                            <Zap className={`h-5 w-5 ${webhook.active ? "text-emerald-600" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground">{webhook.name}</h4>
                              <Badge
                                variant={webhook.status === "active" ? "default" : webhook.status === "error" ? "destructive" : "secondary"}
                                className={webhook.status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : ""}
                              >
                                {webhook.status === "active" ? "Ativo" : webhook.status === "error" ? "Erro" : "Pendente"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground font-mono truncate max-w-md">{webhook.url}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={webhook.active} />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteWebhook(webhook.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm mb-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            Último: {webhook.lastTriggered 
                              ? new Date(webhook.lastTriggered).toLocaleString("pt-BR")
                              : "Nunca"
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span>{webhook.successRate}% sucesso</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Activity className="h-4 w-4" />
                          <span>{webhook.totalCalls?.toLocaleString()} chamadas</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                            {event}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <code className="flex-1 text-sm text-muted-foreground font-mono">
                          {showSecrets[webhook.id] ? webhook.secret : "whsec_••••••••••••••••••••"}
                        </code>
                        <button
                          onClick={() => toggleSecret(webhook.id)}
                          className="p-1 text-muted-foreground hover:text-foreground"
                        >
                          {showSecrets[webhook.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(webhook.secret)}
                          className="p-1 text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Configure o Endpoint</h3>
              <p className="text-muted-foreground">Defina a URL que receberá as notificações</p>
            </div>

            <div className="space-y-4 max-w-lg mx-auto">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Nome do Webhook</Label>
                <Input
                  placeholder="Ex: Integração ERP"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                  className="bg-background border-border"
                />
                <p className="text-xs text-muted-foreground">Um nome descritivo para identificar este webhook</p>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-medium">URL do Endpoint</Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://api.exemplo.com/webhook"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    className="bg-background border-border pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">A URL deve aceitar requisições POST com payload JSON</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <Server className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Requisitos do Endpoint</p>
                    <ul className="text-xs text-amber-700 mt-1 space-y-1">
                      <li>• Deve retornar status 2xx em até 30 segundos</li>
                      <li>• HTTPS obrigatório para produção</li>
                      <li>• Suportar Content-Type: application/json</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mx-auto mb-4">
                <Bell className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Selecione os Eventos</h3>
              <p className="text-muted-foreground">Escolha quais eventos dispararão notificações</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {availableEvents.map((category) => (
                <div key={category.category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{category.icon}</span>
                    <h4 className="font-medium text-foreground">{category.category}</h4>
                  </div>
                  <div className="space-y-2">
                    {category.events.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => toggleEvent(event.id)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                          newWebhook.events.includes(event.id)
                            ? "bg-orange-100 border-2 border-orange-400"
                            : "bg-muted/50 border-2 border-transparent hover:border-orange-200"
                        }`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          newWebhook.events.includes(event.id)
                            ? "border-orange-500 bg-orange-500"
                            : "border-muted-foreground"
                        }`}>
                          {newWebhook.events.includes(event.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">{event.label}</p>
                          <p className="text-xs text-muted-foreground">{event.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {newWebhook.events.length > 0 && (
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                <p className="text-sm font-medium text-orange-800 mb-2">
                  {newWebhook.events.length} evento(s) selecionado(s)
                </p>
                <div className="flex flex-wrap gap-2">
                  {newWebhook.events.map(eventId => (
                    <Badge key={eventId} className="bg-orange-200 text-orange-800">
                      {eventId}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Configuração de Segurança</h3>
              <p className="text-muted-foreground">Chave secreta para validação das requisições</p>
            </div>

            <div className="max-w-lg mx-auto space-y-6">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Chave Secreta (Signing Secret)</Label>
                <div className="flex items-center gap-2 p-4 rounded-xl bg-muted/50 border border-border">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <code className="flex-1 text-sm font-mono text-foreground">
                    {newWebhook.secret}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(newWebhook.secret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNewWebhook({ 
                      ...newWebhook, 
                      secret: `whsec_${Math.random().toString(36).substring(2, 24)}` 
                    })}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use esta chave para verificar a autenticidade das requisições
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Code className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-2">Como validar a assinatura</p>
                    <div className="p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                      <pre>{`const crypto = require('crypto');

const signature = req.headers['x-unistays-signature'];
const payload = JSON.stringify(req.body);
const expected = crypto
  .createHmac('sha256', '${newWebhook.secret}')
  .update(payload)
  .digest('hex');

if (signature === expected) {
  // Requisição válida
}`}</pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Importante</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Guarde esta chave em um local seguro. Ela não será exibida novamente após a criação do webhook.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mx-auto mb-4">
                <PlayCircle className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Testar Conexão</h3>
              <p className="text-muted-foreground">Envie um evento de teste para validar a configuração</p>
            </div>

            <div className="max-w-lg mx-auto space-y-6">
              {/* Summary Card */}
              <div className="p-4 rounded-xl bg-card border border-border">
                <h4 className="font-medium text-foreground mb-3">Resumo do Webhook</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nome:</span>
                    <span className="font-medium text-foreground">{newWebhook.name || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">URL:</span>
                    <span className="font-mono text-xs text-foreground truncate max-w-[200px]">{newWebhook.url || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Eventos:</span>
                    <span className="font-medium text-foreground">{newWebhook.events.length} selecionado(s)</span>
                  </div>
                </div>
              </div>

              {/* Test Payload */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <FileJson className="h-5 w-5 text-orange-500" />
                  <h4 className="font-medium text-foreground">Payload de Teste</h4>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                  <pre>{JSON.stringify({
                    event: "test.webhook",
                    timestamp: new Date().toISOString(),
                    data: {
                      message: "Este é um evento de teste",
                      webhook_id: "new_webhook"
                    }
                  }, null, 2)}</pre>
                </div>
              </div>

              {/* Test Button */}
              <Button
                onClick={handleTestWebhook}
                disabled={isTesting || !newWebhook.url}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white h-12"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Enviando teste...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Evento de Teste
                  </>
                )}
              </Button>

              {/* Test Result */}
              {testResult && (
                <div className={`p-4 rounded-xl ${
                  testResult === "success" 
                    ? "bg-emerald-50 border border-emerald-200" 
                    : "bg-red-50 border border-red-200"
                }`}>
                  <div className="flex items-center gap-3">
                    {testResult === "success" ? (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        <div>
                          <p className="font-medium text-emerald-800">Conexão bem-sucedida!</p>
                          <p className="text-sm text-emerald-700">O endpoint respondeu corretamente ao teste.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-6 w-6 text-red-600" />
                        <div>
                          <p className="font-medium text-red-800">Falha na conexão</p>
                          <p className="text-sm text-red-700">Verifique a URL e tente novamente.</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 bg-background border-border overflow-hidden">
        <div className="flex h-full">
          {/* Left Sidebar */}
          <div className="w-72 bg-gradient-to-b from-orange-500 via-amber-500 to-orange-600 p-6 flex flex-col">
            <DialogHeader className="mb-6">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 rounded-xl bg-white/20">
                  <Webhook className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">Webhooks</DialogTitle>
                  <p className="text-white/80 text-sm">Notificações automáticas</p>
                </div>
              </div>
            </DialogHeader>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-white/80 text-sm mb-2">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-white/20" />
            </div>

            {/* Steps */}
            <nav className="flex-1 space-y-2">
              {steps.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                const isClickable = step.id === 1 || isCreating;

                return (
                  <button
                    key={step.id}
                    onClick={() => isClickable && setCurrentStep(step.id)}
                    disabled={!isClickable}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                      isActive
                        ? "bg-white text-orange-600 shadow-lg"
                        : isCompleted
                        ? "bg-white/20 text-white hover:bg-white/30"
                        : "text-white/60 hover:bg-white/10"
                    } ${!isClickable ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive
                        ? "bg-orange-100"
                        : isCompleted
                        ? "bg-white/20"
                        : "bg-white/10"
                    }`}>
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <step.icon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{step.title}</p>
                      <p className={`text-xs truncate ${isActive ? "text-orange-500" : "text-white/60"}`}>
                        {step.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Illustration */}
            <div className="mt-6 p-4 rounded-xl bg-white/10">
              <div className="text-center">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-white/80 text-sm">
                  Receba notificações em tempo real de todos os eventos do sistema
                </p>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-6">
              {renderStepContent()}
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/30 flex justify-between">
              {isCreating ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentStep === 2) {
                        setIsCreating(false);
                        setCurrentStep(1);
                      } else {
                        handleBack();
                      }
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {currentStep === 2 ? "Cancelar" : "Voltar"}
                  </Button>
                  {currentStep < 5 ? (
                    <Button
                      onClick={handleNext}
                      disabled={
                        (currentStep === 2 && (!newWebhook.name || !newWebhook.url)) ||
                        (currentStep === 3 && newWebhook.events.length === 0)
                      }
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                    >
                      Próximo
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleAddWebhook}
                      className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Criar Webhook
                    </Button>
                  )}
                </>
              ) : (
                <div className="flex justify-end w-full">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Fechar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
