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
  Play,
  Plus,
  Mail,
  Bell,
  MessageSquare,
  Send,
  FileText,
  Database,
  Webhook,
  Gift,
  Users,
  Clock,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CreditCard,
  Phone,
  Globe,
  Printer,
  Upload,
  Download,
  Share2,
  Tag,
  Folder,
  Settings,
  Zap,
  Bot,
  BarChart3,
  Calendar,
  MapPin,
  Shield,
  Lock,
  Unlock,
  RefreshCw,
  Trash2,
  Edit,
  Copy,
  Archive,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NewActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (action: any) => void;
}

const actionTypes = [
  { id: "communication", name: "Comunicação", icon: Send, description: "Enviar mensagens e notificações" },
  { id: "data", name: "Manipulação de Dados", icon: Database, description: "Criar, atualizar ou excluir dados" },
  { id: "integration", name: "Integração", icon: Webhook, description: "Conectar com sistemas externos" },
  { id: "automation", name: "Automação", icon: Bot, description: "Ações automatizadas internas" },
  { id: "control", name: "Controle de Fluxo", icon: Settings, description: "Atrasos, loops e condições" },
];

const actionCategories = [
  { id: "communication", name: "Comunicação", color: "bg-blue-500" },
  { id: "operational", name: "Operacional", color: "bg-emerald-500" },
  { id: "financial", name: "Financeiro", color: "bg-amber-500" },
  { id: "loyalty", name: "Fidelidade", color: "bg-purple-500" },
  { id: "integrations", name: "Integrações", color: "bg-orange-500" },
  { id: "system", name: "Sistema", color: "bg-cyan-500" },
  { id: "control", name: "Controle", color: "bg-pink-500" },
];

const iconOptions = [
  { id: "mail", icon: Mail, name: "Email" },
  { id: "bell", icon: Bell, name: "Notificação" },
  { id: "message", icon: MessageSquare, name: "Mensagem" },
  { id: "send", icon: Send, name: "Enviar" },
  { id: "file", icon: FileText, name: "Documento" },
  { id: "database", icon: Database, name: "Banco de Dados" },
  { id: "webhook", icon: Webhook, name: "Webhook" },
  { id: "gift", icon: Gift, name: "Presente" },
  { id: "users", icon: Users, name: "Usuários" },
  { id: "clock", icon: Clock, name: "Tempo" },
  { id: "credit-card", icon: CreditCard, name: "Pagamento" },
  { id: "phone", icon: Phone, name: "Telefone" },
  { id: "globe", icon: Globe, name: "Web" },
  { id: "printer", icon: Printer, name: "Imprimir" },
  { id: "upload", icon: Upload, name: "Upload" },
  { id: "download", icon: Download, name: "Download" },
  { id: "share", icon: Share2, name: "Compartilhar" },
  { id: "tag", icon: Tag, name: "Tag" },
  { id: "folder", icon: Folder, name: "Pasta" },
  { id: "zap", icon: Zap, name: "Ação" },
  { id: "bot", icon: Bot, name: "Bot/AI" },
  { id: "chart", icon: BarChart3, name: "Relatório" },
  { id: "calendar", icon: Calendar, name: "Calendário" },
  { id: "map", icon: MapPin, name: "Localização" },
  { id: "shield", icon: Shield, name: "Segurança" },
  { id: "lock", icon: Lock, name: "Bloquear" },
  { id: "unlock", icon: Unlock, name: "Desbloquear" },
  { id: "refresh", icon: RefreshCw, name: "Atualizar" },
  { id: "trash", icon: Trash2, name: "Excluir" },
  { id: "edit", icon: Edit, name: "Editar" },
  { id: "copy", icon: Copy, name: "Copiar" },
  { id: "archive", icon: Archive, name: "Arquivar" },
  { id: "star", icon: Star, name: "Favorito" },
];

const httpMethods = [
  { id: "GET", name: "GET" },
  { id: "POST", name: "POST" },
  { id: "PUT", name: "PUT" },
  { id: "PATCH", name: "PATCH" },
  { id: "DELETE", name: "DELETE" },
];

export function NewActionModal({
  open,
  onOpenChange,
  onCreated,
}: NewActionModalProps) {
  const [step, setStep] = useState(1);
  const [actionName, setActionName] = useState("");
  const [actionDescription, setActionDescription] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string>("send");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [httpMethod, setHttpMethod] = useState("POST");
  const [webhookHeaders, setWebhookHeaders] = useState("");
  const [webhookBody, setWebhookBody] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("");
  const [delayValue, setDelayValue] = useState("1");
  const [delayUnit, setDelayUnit] = useState("hours");

  const totalSteps = 3;

  const resetForm = () => {
    setStep(1);
    setActionName("");
    setActionDescription("");
    setSelectedType(null);
    setSelectedCategory(null);
    setSelectedIcon("send");
    setWebhookUrl("");
    setHttpMethod("POST");
    setWebhookHeaders("");
    setWebhookBody("");
    setEmailTemplate("");
    setDelayValue("1");
    setDelayUnit("hours");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleCreate = () => {
    const IconComponent = iconOptions.find(i => i.id === selectedIcon)?.icon || Send;
    const newAction = {
      id: `custom-action-${Date.now()}`,
      name: actionName,
      description: actionDescription,
      type: selectedType,
      category: actionCategories.find(c => c.id === selectedCategory)?.name || "Personalizado",
      icon: IconComponent,
      config: {
        webhookUrl: selectedType === "integration" ? webhookUrl : undefined,
        httpMethod: selectedType === "integration" ? httpMethod : undefined,
        webhookHeaders: selectedType === "integration" ? webhookHeaders : undefined,
        webhookBody: selectedType === "integration" ? webhookBody : undefined,
        emailTemplate: selectedType === "communication" ? emailTemplate : undefined,
        delayValue: selectedType === "control" ? delayValue : undefined,
        delayUnit: selectedType === "control" ? delayUnit : undefined,
      }
    };
    onCreated?.(newAction);
    handleClose();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedType !== null;
      case 2:
        return actionName.trim().length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const getSelectedTypeData = () => {
    return actionTypes.find(t => t.id === selectedType);
  };

  const getSelectedIconComponent = () => {
    return iconOptions.find(i => i.id === selectedIcon)?.icon || Send;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
        {/* Header com Gradiente */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 p-6 flex-shrink-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2Mmgydi0yem0tNiAwSDI4djJoMnYtMnptMTIgMGgtMnYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Nova Ação Personalizada</h2>
                <p className="text-white/80 text-sm">
                  Crie uma ação customizada para seus workflows
                </p>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="relative mt-6 flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                    step > s
                      ? "bg-white text-blue-600"
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
          <div className="relative mt-2 flex justify-between text-xs text-white/70">
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
                  <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 mb-4">
                    <Play className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Tipo de Ação</h3>
                  <p className="text-muted-foreground mt-1">
                    Selecione o tipo de ação que deseja criar
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {actionTypes.map((type) => (
                    <div
                      key={type.id}
                      className={cn(
                        "relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
                        selectedType === type.id
                          ? "border-blue-500 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 shadow-md"
                          : "border-border hover:border-blue-500/50"
                      )}
                      onClick={() => setSelectedType(type.id)}
                    >
                      {selectedType === type.id && (
                        <div className="absolute top-3 right-3">
                          <div className="p-1 rounded-full bg-blue-500">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-3 rounded-xl transition-all",
                          selectedType === type.id
                            ? "bg-blue-500/20"
                            : "bg-muted"
                        )}>
                          <type.icon className={cn(
                            "h-5 w-5",
                            selectedType === type.id
                              ? "text-blue-500"
                              : "text-muted-foreground"
                          )} />
                        </div>
                        <div className="flex-1">
                          <p className={cn(
                            "font-medium",
                            selectedType === type.id && "text-blue-700 dark:text-blue-400"
                          )}>
                            {type.name}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Action Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-teal-500/10 mb-4">
                    {(() => {
                      const TypeIcon = getSelectedTypeData()?.icon || Play;
                      return <TypeIcon className="h-10 w-10 text-cyan-500" />;
                    })()}
                  </div>
                  <h3 className="text-xl font-semibold">Detalhes da Ação</h3>
                  <p className="text-muted-foreground mt-1">
                    Configure as informações da sua ação
                  </p>
                </div>

                <div className="max-w-lg mx-auto space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Nome da Ação *</Label>
                    <Input
                      value={actionName}
                      onChange={(e) => setActionName(e.target.value)}
                      placeholder="Ex: Enviar Notificação ao Gerente"
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Descrição</Label>
                    <Textarea
                      value={actionDescription}
                      onChange={(e) => setActionDescription(e.target.value)}
                      placeholder="Descreva o que esta ação faz..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Categoria</Label>
                    <Select value={selectedCategory || ""} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {actionCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", cat.color)} />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Ícone</Label>
                    <div className="grid grid-cols-8 gap-2">
                      {iconOptions.map((icon) => (
                        <button
                          key={icon.id}
                          type="button"
                          className={cn(
                            "p-3 rounded-lg border transition-all",
                            selectedIcon === icon.id
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-border hover:border-blue-500/50"
                          )}
                          onClick={() => setSelectedIcon(icon.id)}
                          title={icon.name}
                        >
                          <icon.icon className={cn(
                            "h-4 w-4 mx-auto",
                            selectedIcon === icon.id ? "text-blue-500" : "text-muted-foreground"
                          )} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type-specific fields */}
                  {selectedType === "integration" && (
                    <div className="space-y-4 p-4 rounded-xl bg-muted/50 border">
                      <h4 className="font-medium flex items-center gap-2">
                        <Webhook className="h-4 w-4 text-orange-500" />
                        Configuração do Webhook
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-1">
                            <Label className="text-xs">Método</Label>
                            <Select value={httpMethod} onValueChange={setHttpMethod}>
                              <SelectTrigger className="h-10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {httpMethods.map((method) => (
                                  <SelectItem key={method.id} value={method.id}>
                                    {method.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">URL do Endpoint</Label>
                            <Input
                              value={webhookUrl}
                              onChange={(e) => setWebhookUrl(e.target.value)}
                              placeholder="https://api.exemplo.com/webhook"
                              className="h-10"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Headers (JSON)</Label>
                          <Textarea
                            value={webhookHeaders}
                            onChange={(e) => setWebhookHeaders(e.target.value)}
                            placeholder='{"Authorization": "Bearer token"}'
                            rows={2}
                            className="font-mono text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Body (JSON)</Label>
                          <Textarea
                            value={webhookBody}
                            onChange={(e) => setWebhookBody(e.target.value)}
                            placeholder='{"key": "value"}'
                            rows={3}
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedType === "communication" && (
                    <div className="space-y-4 p-4 rounded-xl bg-muted/50 border">
                      <h4 className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        Template da Mensagem
                      </h4>
                      <div>
                        <Label className="text-xs">Template (use variáveis como {"{nome}"}, {"{email}"})</Label>
                        <Textarea
                          value={emailTemplate}
                          onChange={(e) => setEmailTemplate(e.target.value)}
                          placeholder="Olá {nome}, sua reserva foi confirmada!"
                          rows={4}
                        />
                      </div>
                    </div>
                  )}

                  {selectedType === "control" && (
                    <div className="space-y-4 p-4 rounded-xl bg-muted/50 border">
                      <h4 className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        Configuração de Tempo
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Valor</Label>
                          <Input
                            type="number"
                            value={delayValue}
                            onChange={(e) => setDelayValue(e.target.value)}
                            min="1"
                            className="h-10"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Unidade</Label>
                          <Select value={delayUnit} onValueChange={setDelayUnit}>
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minutes">Minutos</SelectItem>
                              <SelectItem value="hours">Horas</SelectItem>
                              <SelectItem value="days">Dias</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
                    Verifique as informações antes de criar a ação
                  </p>
                </div>

                <div className="max-w-lg mx-auto">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-blue-500/20">
                        {(() => {
                          const IconComponent = getSelectedIconComponent();
                          return <IconComponent className="h-8 w-8 text-blue-400" />;
                        })()}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white">{actionName}</h4>
                        <p className="text-slate-400 text-sm">{actionDescription || "Sem descrição"}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                        <span className="text-slate-400 text-sm">Tipo</span>
                        <Badge variant="outline" className="border-blue-500/50 text-blue-300">
                          {getSelectedTypeData()?.name}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                        <span className="text-slate-400 text-sm">Categoria</span>
                        <Badge variant="outline" className="border-cyan-500/50 text-cyan-300">
                          {actionCategories.find(c => c.id === selectedCategory)?.name || "Personalizado"}
                        </Badge>
                      </div>
                      {selectedType === "integration" && webhookUrl && (
                        <div className="p-3 rounded-lg bg-slate-800/50">
                          <span className="text-slate-400 text-sm block mb-1">Webhook</span>
                          <code className="text-xs text-orange-300 break-all">
                            {httpMethod} {webhookUrl}
                          </code>
                        </div>
                      )}
                      {selectedType === "control" && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                          <span className="text-slate-400 text-sm">Tempo</span>
                          <span className="text-white font-medium">
                            {delayValue} {delayUnit === "minutes" ? "minutos" : delayUnit === "hours" ? "horas" : "dias"}
                          </span>
                        </div>
                      )}
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
                className="gap-2"
              >
                Próximo
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Plus className="h-4 w-4" />
                Criar Ação
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}