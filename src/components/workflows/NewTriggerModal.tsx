import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  Plus,
  Clock,
  Calendar,
  Mail,
  Bell,
  UserPlus,
  CreditCard,
  MessageSquare,
  Settings,
  Webhook,
  Database,
  FileText,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Timer,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NewTriggerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (trigger: any) => void;
}

const triggerTypes = [
  { id: "event", name: "Evento do Sistema", icon: Bell, description: "Disparado quando algo acontece no sistema" },
  { id: "schedule", name: "Agendamento", icon: Clock, description: "Executado em horários específicos" },
  { id: "webhook", name: "Webhook", icon: Webhook, description: "Chamada externa via API" },
  { id: "database", name: "Alteração no Banco", icon: Database, description: "Quando dados são criados/alterados" },
  { id: "manual", name: "Manual", icon: Settings, description: "Acionado manualmente pelo usuário" },
];

const eventCategories = [
  { id: "reservations", name: "Reservas", color: "bg-blue-500" },
  { id: "guests", name: "Hóspedes", color: "bg-emerald-500" },
  { id: "payments", name: "Pagamentos", color: "bg-amber-500" },
  { id: "housekeeping", name: "Governança", color: "bg-purple-500" },
  { id: "maintenance", name: "Manutenção", color: "bg-orange-500" },
  { id: "communications", name: "Comunicações", color: "bg-cyan-500" },
];

const iconOptions = [
  { id: "bell", icon: Bell, name: "Notificação" },
  { id: "mail", icon: Mail, name: "Email" },
  { id: "user", icon: UserPlus, name: "Usuário" },
  { id: "payment", icon: CreditCard, name: "Pagamento" },
  { id: "message", icon: MessageSquare, name: "Mensagem" },
  { id: "calendar", icon: Calendar, name: "Calendário" },
  { id: "clock", icon: Clock, name: "Tempo" },
  { id: "file", icon: FileText, name: "Documento" },
  { id: "zap", icon: Zap, name: "Gatilho" },
  { id: "refresh", icon: RefreshCw, name: "Atualização" },
  { id: "timer", icon: Timer, name: "Timer" },
  { id: "database", icon: Database, name: "Dados" },
];

const scheduleOptions = [
  { id: "hourly", name: "A cada hora" },
  { id: "daily", name: "Diariamente" },
  { id: "weekly", name: "Semanalmente" },
  { id: "monthly", name: "Mensalmente" },
  { id: "custom", name: "Personalizado (Cron)" },
];

export function NewTriggerModal({
  open,
  onOpenChange,
  onCreated,
}: NewTriggerModalProps) {
  const [step, setStep] = useState(1);
  const [triggerName, setTriggerName] = useState("");
  const [triggerDescription, setTriggerDescription] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string>("bell");
  const [scheduleType, setScheduleType] = useState<string>("daily");
  const [cronExpression, setCronExpression] = useState("");
  const [webhookPath, setWebhookPath] = useState("");

  const totalSteps = 3;

  const resetForm = () => {
    setStep(1);
    setTriggerName("");
    setTriggerDescription("");
    setSelectedType(null);
    setSelectedCategory(null);
    setSelectedIcon("bell");
    setScheduleType("daily");
    setCronExpression("");
    setWebhookPath("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleCreate = () => {
    const IconComponent = iconOptions.find(i => i.id === selectedIcon)?.icon || Bell;
    const newTrigger = {
      id: `custom-${Date.now()}`,
      name: triggerName,
      description: triggerDescription,
      type: selectedType,
      category: eventCategories.find(c => c.id === selectedCategory)?.name || "Personalizado",
      icon: IconComponent,
      config: {
        scheduleType: selectedType === "schedule" ? scheduleType : undefined,
        cronExpression: selectedType === "schedule" && scheduleType === "custom" ? cronExpression : undefined,
        webhookPath: selectedType === "webhook" ? webhookPath : undefined,
      }
    };
    onCreated?.(newTrigger);
    handleClose();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedType !== null;
      case 2:
        return triggerName.trim().length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const getSelectedTypeData = () => triggerTypes.find(t => t.id === selectedType);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0 flex flex-col overflow-hidden">
        {/* Header com Gradiente */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-6 flex-shrink-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2Mmgydi0yem0tNiAwSDI4djJoMnYtMnptMTIgMGgtMnYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Novo Gatilho</h2>
                <p className="text-white/80 text-sm">
                  Configure um gatilho personalizado para seus workflows
                </p>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="relative mt-6 flex items-center justify-between max-w-md">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                    step > s
                      ? "bg-white text-amber-600"
                      : step === s
                      ? "bg-white/30 text-white border-2 border-white"
                      : "bg-white/10 text-white/50"
                  )}
                >
                  {step > s ? <Check className="h-5 w-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2 rounded-full transition-all",
                      step > s ? "bg-white" : "bg-white/20"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="relative mt-2 flex justify-between text-xs text-white/70 max-w-md">
            <span className="w-10 text-center">Tipo</span>
            <span className="w-10 text-center">Detalhes</span>
            <span className="w-10 text-center">Confirmar</span>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            {/* Step 1: Select Type */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 mb-4">
                    <Sparkles className="h-10 w-10 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Tipo de Gatilho</h3>
                  <p className="text-muted-foreground mt-1">
                    Escolha como o gatilho será acionado
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {triggerTypes.map((type) => (
                    <div
                      key={type.id}
                      className={cn(
                        "relative p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg",
                        selectedType === type.id
                          ? "border-amber-500 bg-gradient-to-br from-amber-500/10 to-orange-500/5 shadow-lg"
                          : "border-border hover:border-amber-500/50"
                      )}
                      onClick={() => setSelectedType(type.id)}
                    >
                      {selectedType === type.id && (
                        <div className="absolute top-3 right-3">
                          <div className="p-1 rounded-full bg-amber-500">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                      <div className={cn(
                        "p-4 rounded-xl w-fit transition-all mb-3",
                        selectedType === type.id
                          ? "bg-amber-500/20"
                          : "bg-muted"
                      )}>
                        <type.icon className={cn(
                          "h-7 w-7",
                          selectedType === type.id
                            ? "text-amber-500"
                            : "text-muted-foreground"
                        )} />
                      </div>
                      <p className={cn(
                        "font-semibold text-lg",
                        selectedType === type.id && "text-amber-700 dark:text-amber-400"
                      )}>
                        {type.name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {type.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 mb-4">
                    <Settings className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Configurar Gatilho</h3>
                  <p className="text-muted-foreground mt-1">
                    Defina os detalhes do seu gatilho
                  </p>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Basic Info */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-slate-500/5 to-slate-500/10 border space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-500" />
                      Informações Básicas
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Nome do Gatilho *</Label>
                        <Input
                          value={triggerName}
                          onChange={(e) => setTriggerName(e.target.value)}
                          placeholder="Ex: Nova Reserva Confirmada"
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Descrição</Label>
                        <Textarea
                          value={triggerDescription}
                          onChange={(e) => setTriggerDescription(e.target.value)}
                          placeholder="Descreva quando este gatilho deve ser acionado..."
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category & Icon */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/5 to-purple-500/10 border space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Bell className="h-4 w-4 text-purple-500" />
                      Categoria & Ícone
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Categoria</Label>
                        <Select value={selectedCategory || ""} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                <div className="flex items-center gap-2">
                                  <div className={cn("w-3 h-3 rounded-full", cat.color)} />
                                  {cat.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Ícone</Label>
                        <div className="flex flex-wrap gap-2">
                          {iconOptions.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              className={cn(
                                "p-2.5 rounded-lg border-2 transition-all",
                                selectedIcon === opt.id
                                  ? "border-purple-500 bg-purple-500/20"
                                  : "border-border hover:border-purple-500/50"
                              )}
                              onClick={() => setSelectedIcon(opt.id)}
                              title={opt.name}
                            >
                              <opt.icon className={cn(
                                "h-5 w-5",
                                selectedIcon === opt.id ? "text-purple-500" : "text-muted-foreground"
                              )} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Type-specific config */}
                  {selectedType === "schedule" && (
                    <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-emerald-500" />
                        Configuração de Agendamento
                      </h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Frequência</Label>
                          <Select value={scheduleType} onValueChange={setScheduleType}>
                            <SelectTrigger className="h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {scheduleOptions.map((opt) => (
                                <SelectItem key={opt.id} value={opt.id}>
                                  {opt.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {scheduleType === "custom" && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Expressão Cron</Label>
                            <Input
                              value={cronExpression}
                              onChange={(e) => setCronExpression(e.target.value)}
                              placeholder="Ex: 0 9 * * 1-5"
                              className="h-12 font-mono"
                            />
                            <p className="text-xs text-muted-foreground">
                              Formato: minuto hora dia-mês mês dia-semana
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedType === "webhook" && (
                    <div className="p-5 rounded-xl bg-gradient-to-br from-cyan-500/5 to-cyan-500/10 border space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Webhook className="h-4 w-4 text-cyan-500" />
                        Configuração do Webhook
                      </h4>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Caminho do Endpoint</Label>
                        <Input
                          value={webhookPath}
                          onChange={(e) => setWebhookPath(e.target.value)}
                          placeholder="/api/webhooks/meu-gatilho"
                          className="h-12 font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                          URL completa: https://seu-dominio.com{webhookPath || "/api/webhooks/..."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 mb-4">
                    <Check className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Revisar & Confirmar</h3>
                  <p className="text-muted-foreground mt-1">
                    Verifique as configurações do novo gatilho
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">
                  {/* Summary Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700">
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-start gap-4">
                        <div className="p-4 rounded-xl bg-amber-500/20">
                          {(() => {
                            const IconComp = iconOptions.find(i => i.id === selectedIcon)?.icon || Bell;
                            return <IconComp className="h-8 w-8 text-amber-400" />;
                          })()}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-white">{triggerName || "Sem nome"}</h4>
                          {triggerDescription && (
                            <p className="text-slate-400 text-sm mt-1">{triggerDescription}</p>
                          )}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5">
                          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Tipo</p>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const typeData = getSelectedTypeData();
                              if (!typeData) return null;
                              return (
                                <>
                                  <typeData.icon className="h-4 w-4 text-amber-400" />
                                  <span className="text-white font-medium">{typeData.name}</span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5">
                          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Categoria</p>
                          <Badge className={cn(
                            eventCategories.find(c => c.id === selectedCategory)?.color || "bg-slate-500"
                          )}>
                            {eventCategories.find(c => c.id === selectedCategory)?.name || "Personalizado"}
                          </Badge>
                        </div>
                        {selectedType === "schedule" && (
                          <div className="p-4 rounded-xl bg-white/5 col-span-2">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Agendamento</p>
                            <span className="text-white font-medium">
                              {scheduleOptions.find(s => s.id === scheduleType)?.name}
                              {scheduleType === "custom" && cronExpression && `: ${cronExpression}`}
                            </span>
                          </div>
                        )}
                        {selectedType === "webhook" && webhookPath && (
                          <div className="p-4 rounded-xl bg-white/5 col-span-2">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Endpoint</p>
                            <code className="text-cyan-400 font-mono text-sm">{webhookPath}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4 flex items-center justify-between bg-muted/30 flex-shrink-0">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            {step < totalSteps ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                Próximo
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Plus className="h-4 w-4" />
                Criar Gatilho
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}