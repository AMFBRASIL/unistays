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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GitBranch,
  Zap,
  Play,
  Settings,
  Trash2,
  Plus,
  PlusCircle,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Mail,
  MessageSquare,
  Bell,
  Send,
  FileText,
  Database,
  Webhook,
  Gift,
  Users,
  Clock,
  UserPlus,
  CalendarCheck,
  DoorOpen,
  LogOut,
  CreditCard,
  Star,
  XCircle,
  TrendingUp,
  GripVertical,
  Copy,
  AlertTriangle,
  Filter,
  Sparkles,
  Timer,
  Split,
  RotateCcw,
  Eye,
  Code,
  Variable,
  TestTube,
  Save,
  History,
  ChevronRight,
  Layers,
  Target,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { NewActionModal } from "@/components/workflows/NewActionModal";

/** Trigger/action items from parent (icon is a Lucide component) */
interface TriggerItem {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  icon: React.ComponentType<{ className?: string }>;
}
interface ActionItem {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  actionType?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface WorkflowData {
  id: string | number;
  name?: string;
  description?: string | null;
  status?: string;
  trigger?: string | null;
  steps?: Array<{ id?: string; type?: string; actionId?: string; action_id?: string; config?: Record<string, unknown>; delaySeconds?: number }>;
  actions?: string[];
  executions?: number;
}

interface WorkflowEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow?: WorkflowData | null;
  triggers: TriggerItem[];
  actions: ActionItem[];
  onSave?: () => void;
}

interface WorkflowStep {
  id: string;
  type: "trigger" | "action" | "condition" | "delay" | "split";
  config: Record<string, unknown> & {
    actionId?: string;
    delay?: string;
    condition?: string;
    template_id?: string;
    subject?: string;
    to?: string;
  };
}

function delayValueToSeconds(value: string): number {
  if (!value) return 0;
  const m = value.match(/^(\d+)(m|h|d)$/);
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  if (m[2] === "m") return n * 60;
  if (m[2] === "h") return n * 3600;
  if (m[2] === "d") return n * 86400;
  return 0;
}

export function WorkflowEditorModal({
  open,
  onOpenChange,
  workflow,
  triggers,
  actions,
  onSave,
}: WorkflowEditorModalProps) {
  const [activeTab, setActiveTab] = useState("builder");
  const [workflowName, setWorkflowName] = useState(workflow?.name || "");
  const [workflowDescription, setWorkflowDescription] = useState(workflow?.description || "");
  const [isActive, setIsActive] = useState(workflow?.status === "active");
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(workflow?.trigger || null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [showAddAction, setShowAddAction] = useState(false);
  const [showNewActionModal, setShowNewActionModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadedWorkflow, setLoadedWorkflow] = useState<WorkflowData | null>(null);
  const [emailTemplates, setEmailTemplates] = useState<{ id?: string; uuid?: string; name?: string; subject?: string; type?: string; isActive?: boolean }[]>([]);
  const [retryEnabled, setRetryEnabled] = useState(true);
  const [retryCount, setRetryCount] = useState("3");
  const [retryDelaySeconds, setRetryDelaySeconds] = useState(60);
  const [executionHistory, setExecutionHistory] = useState<Array<{ id: string; status: string; time: string; duration: string; trigger: string; errorMessage?: string }>>([]);
  const [loadingExecutions, setLoadingExecutions] = useState(false);

  const fetchExecutions = async () => {
    if (!workflow?.id) return;
    setLoadingExecutions(true);
    try {
      const res = await api.getWorkflowExecutions(workflow.id, 20);
      const data = res.data as { executions?: Array<{ id: string; status?: string; triggeredBy?: string; triggerData?: unknown; duration?: string; time?: string; errorMessage?: string }> } | undefined;
      const list = data?.executions ?? [];
      setExecutionHistory(
        list.map((e) => {
          let trigger = e.triggeredBy || "Sistema";
          if (e.triggerData && typeof e.triggerData === "object") {
            const td = e.triggerData as Record<string, unknown>;
            const res = td.reservation as { confirmationCode?: string; reservationNumber?: string } | undefined;
            const guest = td.guest as { firstName?: string; lastName?: string; email?: string } | undefined;
            if (res?.reservationNumber) trigger = `Reserva #${res.reservationNumber}`;
            else if (res?.confirmationCode) trigger = `Reserva #${res.confirmationCode}`;
            else if (guest?.firstName || guest?.lastName) trigger = `Hóspede: ${[guest.firstName, guest.lastName].filter(Boolean).join(" ")}`;
            else if (guest?.email) trigger = `Hóspede: ${guest.email}`;
          }
          return {
            id: e.id,
            status: e.status === "completed" ? "success" : "failed",
            time: e.time || "",
            duration: e.duration || "",
            trigger,
            errorMessage: e.errorMessage,
          };
        })
      );
    } finally {
      setLoadingExecutions(false);
    }
  };

  useEffect(() => {
    if (workflow) {
      setWorkflowName(workflow.name);
      setWorkflowDescription(workflow.description ?? "");
      setIsActive(workflow.status === "active");
      setSelectedTrigger(workflow.trigger ?? null);
      if (workflow.steps && Array.isArray(workflow.steps)) {
        const stepsArr = workflow.steps as Array<{ type?: string; step_type?: string; retry_count?: number; retry_delay_seconds?: number }>;
        const actionSteps = stepsArr.filter((s) => s.type === "action" || s.step_type === "action");
        const firstActionWithRetry = actionSteps.find((s) => s.retry_count != null || s.retry_delay_seconds != null) ?? actionSteps[0];
        if (firstActionWithRetry != null) {
          const rc = firstActionWithRetry.retry_count ?? 0;
          setRetryEnabled(rc > 0);
          setRetryCount(String(rc > 0 ? rc : 3));
          setRetryDelaySeconds(firstActionWithRetry.retry_delay_seconds ?? 60);
        }
        const steps: WorkflowStep[] = workflow.steps
          .filter((s: { type?: string }) => s.type !== "trigger")
          .map((s: { id?: string; type?: string; actionId?: string; action_id?: string; config?: Record<string, unknown>; delaySeconds?: number }, i: number) => ({
            id: s.id || `step-${i}`,
            type: (s.type === "condition" ? "split" : s.type) as WorkflowStep["type"],
            config: {
              actionId: s.actionId ?? s.action_id,
              delay: s.delaySeconds != null ? undefined : (s.config?.delay ?? (s.config as { delaySeconds?: string })?.delaySeconds) as string | undefined,
              ...(s.config || {}),
            } as WorkflowStep["config"],
          }));
        setWorkflowSteps(steps);
      } else {
        const steps: WorkflowStep[] = (workflow.actions || []).map((actionId: string, index: number) => ({
          id: `step-${index}`,
          type: "action" as const,
          config: { actionId, settings: {} },
        }));
        setWorkflowSteps(steps);
      }
      setLoadedWorkflow(workflow);
    }
  }, [workflow]);

  useEffect(() => {
    if (open && workflow?.id && !loadedWorkflow?.steps) {
      api.getWorkflowById(workflow.id).then((res) => {
        if (res.success && res.data) {
          const raw = res.data as { data?: WorkflowData } | WorkflowData;
          const w: WorkflowData | undefined =
            typeof raw === "object" && raw !== null && "data" in raw && raw.data !== undefined
              ? raw.data
              : (raw as WorkflowData);
          if (!w) return;
          setWorkflowName(w.name ?? "");
          setWorkflowDescription(w.description ?? "");
          setIsActive(w.status === "active");
          setSelectedTrigger(w.trigger ?? null);
          if (w.steps && Array.isArray(w.steps)) {
            const stepsArr = w.steps as Array<{ type?: string; step_type?: string; retry_count?: number; retry_delay_seconds?: number }>;
            const actionSteps = stepsArr.filter((s) => s.type === "action" || s.step_type === "action");
            const firstActionWithRetry = actionSteps.find((s) => s.retry_count != null || s.retry_delay_seconds != null) ?? actionSteps[0];
            if (firstActionWithRetry != null) {
              const rc = firstActionWithRetry.retry_count ?? 0;
              setRetryEnabled(rc > 0);
              setRetryCount(String(rc > 0 ? rc : 3));
              setRetryDelaySeconds(firstActionWithRetry.retry_delay_seconds ?? 60);
            }
            const steps: WorkflowStep[] = w.steps
              .filter((s: { type?: string }) => s.type !== "trigger")
              .map((s: { id?: string; type?: string; actionId?: string; action_id?: string; config?: Record<string, unknown> }, i: number) => ({
                id: s.id || `step-${i}`,
                type: (s.type === "condition" ? "split" : s.type) as WorkflowStep["type"],
                config: {
                  actionId: s.actionId ?? s.action_id,
                  delay: (s.config as { delay?: string } | undefined)?.delay,
                  ...(s.config || {}),
                } as WorkflowStep["config"],
              }));
            setWorkflowSteps(steps);
          } else {
            const steps: WorkflowStep[] = (w.actions || []).map((actionId: string, i: number) => ({
              id: `step-${i}`,
              type: "action" as const,
              config: { actionId, settings: {} },
            }));
            setWorkflowSteps(steps);
          }
          setLoadedWorkflow(w);
        }
      });
    }
  }, [open, workflow?.id, loadedWorkflow?.steps]);

  const handleSave = async () => {
    if (!workflow?.id) return;
    setSaving(true);
    setSaveError(null);
    try {
      const steps: Array<{
        stepType: string;
        triggerId?: string;
        actionId?: string | null;
        config?: Record<string, unknown>;
        stepOrder?: number;
        delaySeconds?: number;
        retryCount?: number;
        retry_count?: number;
        retryDelaySeconds?: number;
        retry_delay_seconds?: number;
      }> = [];
      if (selectedTrigger) {
        steps.push({ stepType: "trigger", triggerId: selectedTrigger });
      }
      const rCount = retryEnabled ? parseInt(retryCount, 10) || 0 : 0;
      workflowSteps.forEach((s, i) => {
        if (s.type === "action") {
          steps.push({
            stepType: "action",
            actionId: s.config?.actionId ?? null,
            config: s.config ?? {},
            stepOrder: i,
            retryCount: rCount,
            retry_count: rCount,
            retryDelaySeconds: rCount > 0 ? retryDelaySeconds : 0,
            retry_delay_seconds: rCount > 0 ? retryDelaySeconds : 0,
          });
        } else if (s.type === "delay") {
          steps.push({
            stepType: "delay",
            config: s.config ?? {},
            delaySeconds: delayValueToSeconds(s.config?.delay ?? ""),
            stepOrder: i,
          });
        } else if (s.type === "split" || s.type === "condition") {
          steps.push({
            stepType: "condition",
            config: s.config ?? {},
            stepOrder: i,
          });
        }
      });
      const res = await api.updateWorkflow(workflow.id, {
        name: workflowName.trim(),
        description: workflowDescription.trim() || undefined,
        status: isActive ? "active" : "paused",
        steps,
      });
      if (res.success) {
        toast.success("Workflow salvo com sucesso");
        onSave?.();
        onOpenChange(false);
      } else {
        setSaveError(res.error?.message ?? "Erro ao salvar");
      }
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const getTriggerData = (triggerId: string) => {
    return triggers.find((t) => t.id === triggerId);
  };

  const getActionData = (actionId: string) => {
    return actions.find((a) => a.id === actionId);
  };

  const isEmailAction = (actionId: string) => {
    const action = getActionData(actionId);
    return action?.name === "Enviar Email" || action?.actionType === "email";
  };

  const updateStepConfig = (update: Record<string, unknown>) => {
    if (selectedStepIndex === null) return;
    setWorkflowSteps((prev) => {
      const next = [...prev];
      next[selectedStepIndex] = {
        ...next[selectedStepIndex],
        config: { ...next[selectedStepIndex].config, ...update },
      };
      return next;
    });
  };

  useEffect(() => {
    if (open) {
      api.getEmailTemplates().then((res) => {
        if (res.success && res.data?.templates) {
          const list = Array.isArray(res.data.templates) ? res.data.templates : [];
          setEmailTemplates(list);
        }
      });
    }
  }, [open]);

  const addStep = (type: WorkflowStep["type"], config: WorkflowStep["config"]) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type,
      config,
    };
    setWorkflowSteps([...workflowSteps, newStep]);
    setShowAddAction(false);
  };

  const removeStep = (index: number) => {
    const newSteps = [...workflowSteps];
    newSteps.splice(index, 1);
    setWorkflowSteps(newSteps);
    setSelectedStepIndex(null);
  };

  const duplicateStep = (index: number) => {
    const step = workflowSteps[index];
    const newStep: WorkflowStep = {
      ...step,
      id: `step-${Date.now()}`,
    };
    const newSteps = [...workflowSteps];
    newSteps.splice(index + 1, 0, newStep);
    setWorkflowSteps(newSteps);
  };

  const moveStep = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= workflowSteps.length) return;
    
    const newSteps = [...workflowSteps];
    [newSteps[fromIndex], newSteps[toIndex]] = [newSteps[toIndex], newSteps[fromIndex]];
    setWorkflowSteps(newSteps);
  };

  const stepTypes = [
    { id: "action", name: "Ação", icon: Play, color: "blue", description: "Executar uma ação" },
    { id: "condition", name: "Condição", icon: Split, color: "purple", description: "Lógica condicional" },
    { id: "delay", name: "Aguardar", icon: Timer, color: "orange", description: "Esperar um tempo" },
  ];

  const conditionOptions = [
    { value: "all", label: "Todos os casos" },
    { value: "vip", label: "Apenas hóspedes VIP" },
    { value: "new", label: "Apenas novos hóspedes" },
    { value: "returning", label: "Apenas hóspedes recorrentes" },
    { value: "corporate", label: "Reservas corporativas" },
    { value: "direct", label: "Reservas diretas" },
    { value: "ota", label: "Reservas de OTA" },
  ];

  const delayOptions = [
    { value: "5m", label: "5 minutos" },
    { value: "15m", label: "15 minutos" },
    { value: "30m", label: "30 minutos" },
    { value: "1h", label: "1 hora" },
    { value: "2h", label: "2 horas" },
    { value: "6h", label: "6 horas" },
    { value: "12h", label: "12 horas" },
    { value: "24h", label: "24 horas" },
    { value: "48h", label: "48 horas" },
    { value: "72h", label: "72 horas" },
    { value: "7d", label: "7 dias" },
  ];

  const renderStepIcon = (step: WorkflowStep) => {
    if (step.type === "action") {
      const action = getActionData(step.config.actionId ?? "");
      if (action) {
        const Icon = action.icon;
        return <Icon className="h-5 w-5" />;
      }
      return <Play className="h-5 w-5" />;
    }
    if (step.type === "condition" || step.type === "split") return <Split className="h-5 w-5" />;
    if (step.type === "delay") return <Timer className="h-5 w-5" />;
    return <Play className="h-5 w-5" />;
  };

  const getStepColor = (step: WorkflowStep) => {
    if (step.type === "action") return "blue";
    if (step.type === "condition" || step.type === "split") return "purple";
    if (step.type === "delay") return "orange";
    return "gray";
  };

  const getStepName = (step: WorkflowStep) => {
    if (step.type === "action") {
      const action = getActionData(step.config.actionId ?? "");
      return action?.name || "Ação";
    }
    if (step.type === "condition" || step.type === "split") return "Condição";
    if (step.type === "delay") {
      const delay = delayOptions.find(d => d.value === step.config.delay);
      return delay ? `Aguardar ${delay.label}` : "Aguardar";
    }
    return "Etapa";
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] h-[95vh] p-0 flex flex-col overflow-hidden">
        {/* Header com Gradiente */}
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6 flex-shrink-0 shrink-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2Mmgydi0yem0tNiAwSDI4djJoMnYtMnptMTIgMGgtMnYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Workflow className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Editor de Workflow</h2>
                <p className="text-white/80 text-sm">
                  {workflow ? "Editando workflow existente" : "Criando novo workflow"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={cn(
                "px-3 py-1.5 text-sm font-medium",
                isActive 
                  ? "bg-emerald-500/20 text-emerald-100 border-emerald-400/30" 
                  : "bg-white/20 text-white/80"
              )}>
                {isActive ? "Ativo" : "Inativo"}
              </Badge>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Tabs de Navegação */}
        <div className="border-b bg-muted/30 px-6 flex-shrink-0 shrink-0">
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v);
              if (v === "history" && workflow?.id) fetchExecutions();
            }}
          >
            <TabsList className="h-12 bg-transparent gap-4">
              <TabsTrigger
                value="builder"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 px-4"
              >
                <Layers className="h-4 w-4" />
                Construtor Visual
              </TabsTrigger>
              <TabsTrigger
                value="config"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 px-4"
              >
                <Settings className="h-4 w-4" />
                Configurações
              </TabsTrigger>
              <TabsTrigger
                value="conditions"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 px-4"
              >
                <Filter className="h-4 w-4" />
                Condições
              </TabsTrigger>
              <TabsTrigger
                value="variables"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 px-4"
              >
                <Variable className="h-4 w-4" />
                Variáveis
              </TabsTrigger>
              <TabsTrigger
                value="test"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 px-4"
              >
                <TestTube className="h-4 w-4" />
                Testar
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 px-4"
              >
                <History className="h-4 w-4" />
                Histórico
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Conteúdo - área rolável no meio do modal */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="p-6 pb-8">
            <Tabs value={activeTab}>
              {/* Tab: Construtor Visual */}
              <TabsContent value="builder" className="m-0 space-y-6">
                {/* Info do Workflow */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Nome do Workflow</Label>
                    <Input
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      placeholder="Ex: Boas-vindas Novo Hóspede"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Descrição</Label>
                    <Input
                      value={workflowDescription}
                      onChange={(e) => setWorkflowDescription(e.target.value)}
                      placeholder="Descreva o objetivo deste workflow"
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Visual Builder */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Flow Canvas */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-primary" />
                        Fluxo do Workflow
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          Visualizar
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Code className="h-4 w-4" />
                          JSON
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 h-[450px] overflow-hidden">
                      <ScrollArea className="h-[450px] w-full">
                        <div className="flex flex-col items-center gap-4 p-6 pb-10">
                        {/* Trigger */}
                        <div
                          className={cn(
                            "w-full max-w-sm p-4 rounded-xl border-2 cursor-pointer transition-all",
                            selectedTrigger
                              ? "bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-amber-500/50 hover:border-amber-500"
                              : "bg-slate-800 border-dashed border-slate-600 hover:border-amber-500/50"
                          )}
                          onClick={() => setSelectedStepIndex(null)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-amber-500/20">
                              {selectedTrigger ? (
                                (() => {
                                  const TriggerIcon = getTriggerData(selectedTrigger)?.icon || Zap;
                                  return <TriggerIcon className="h-6 w-6 text-amber-400" />;
                                })()
                              ) : (
                                <Zap className="h-6 w-6 text-amber-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-white">
                                {selectedTrigger
                                  ? getTriggerData(selectedTrigger)?.name
                                  : "Selecione um Gatilho"}
                              </p>
                              <p className="text-sm text-slate-400">
                                {selectedTrigger
                                  ? getTriggerData(selectedTrigger)?.description
                                  : "Clique para escolher o evento inicial"}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-500" />
                          </div>
                        </div>

                        {selectedTrigger && (
                          <>
                            <ArrowDown className="h-6 w-6 text-slate-500" />

                            {/* Steps */}
                            {workflowSteps.map((step, index) => (
                              <div key={step.id} className="w-full max-w-sm space-y-4">
                                <div
                                  className={cn(
                                    "p-4 rounded-xl border-2 cursor-pointer transition-all group",
                                    selectedStepIndex === index
                                      ? `bg-gradient-to-br from-${getStepColor(step)}-500/20 to-${getStepColor(step)}-500/10 border-${getStepColor(step)}-500`
                                      : "bg-slate-800 border-slate-600 hover:border-slate-500"
                                  )}
                                  onClick={() => setSelectedStepIndex(index)}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 cursor-grab">
                                      <GripVertical className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <div className={cn(
                                      "p-3 rounded-xl",
                                      step.type === "action" && "bg-blue-500/20",
                                      step.type === "condition" && "bg-purple-500/20",
                                      step.type === "delay" && "bg-orange-500/20"
                                    )}>
                                      {renderStepIcon(step)}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-white">{getStepName(step)}</p>
                                      <p className="text-sm text-slate-400">
                                        {step.type === "action" && getActionData(step.config.actionId)?.category}
                                        {step.type === "condition" && "Lógica condicional"}
                                        {step.type === "delay" && "Controle de tempo"}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-white"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          duplicateStep(index);
                                        }}
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-red-400"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeStep(index);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                {index < workflowSteps.length - 1 && (
                                  <div className="flex justify-center">
                                    <ArrowDown className="h-6 w-6 text-slate-500" />
                                  </div>
                                )}
                              </div>
                            ))}

                            {/* Add Step Button */}
                            {!showAddAction ? (
                              <div className="flex justify-center pt-2">
                                <Button
                                  variant="outline"
                                  className="rounded-full border-dashed border-2 border-slate-600 bg-transparent text-slate-400 hover:border-primary hover:text-primary gap-2"
                                  onClick={() => setShowAddAction(true)}
                                >
                                  <Plus className="h-4 w-4" />
                                  Adicionar Etapa
                                </Button>
                              </div>
                            ) : (
                              <div className="w-full max-w-sm p-4 rounded-xl bg-slate-800 border-2 border-dashed border-primary/50 space-y-3">
                                <p className="text-sm font-medium text-slate-300 text-center">
                                  Escolha o tipo de etapa
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                  {stepTypes.map((type) => (
                                    <button
                                      key={type.id}
                                      className={cn(
                                        "p-3 rounded-lg border border-slate-600 hover:border-slate-500 transition-all text-center",
                                        type.color === "blue" && "hover:bg-blue-500/10 hover:border-blue-500/50",
                                        type.color === "purple" && "hover:bg-purple-500/10 hover:border-purple-500/50",
                                        type.color === "orange" && "hover:bg-orange-500/10 hover:border-orange-500/50"
                                      )}
                                      onClick={() => {
                                        if (type.id === "action") {
                                          // Will show action picker in side panel
                                          setSelectedStepIndex(-1);
                                        } else if (type.id === "delay") {
                                          addStep("delay", { delay: "1h" });
                                        } else if (type.id === "condition") {
                                          addStep("condition", { condition: "all" });
                                        }
                                      }}
                                    >
                                      <type.icon className={cn(
                                        "h-5 w-5 mx-auto mb-1",
                                        type.color === "blue" && "text-blue-400",
                                        type.color === "purple" && "text-purple-400",
                                        type.color === "orange" && "text-orange-400"
                                      )} />
                                      <p className="text-xs text-slate-300">{type.name}</p>
                                    </button>
                                  ))}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full text-slate-400"
                                  onClick={() => setShowAddAction(false)}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>

                  {/* Side Panel - Trigger/Action Picker or Config */}
                  <div className="space-y-4">
                    {!selectedTrigger ? (
                      /* Trigger Selection */
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Zap className="h-4 w-4 text-amber-500" />
                          Selecione o Gatilho
                        </h3>
                        <ScrollArea className="h-[450px] pr-4">
                          <div className="space-y-2">
                            {triggers.map((trigger) => (
                              <div
                                key={trigger.id}
                                className={cn(
                                  "p-3 rounded-lg border cursor-pointer transition-all",
                                  selectedTrigger === trigger.id
                                    ? "bg-amber-500/10 border-amber-500/50"
                                    : "bg-card hover:bg-muted border-border"
                                )}
                                onClick={() => setSelectedTrigger(trigger.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-amber-500/10">
                                    <trigger.icon className="h-4 w-4 text-amber-500" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{trigger.name}</p>
                                    <p className="text-xs text-muted-foreground">{trigger.description}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    ) : selectedStepIndex === -1 ? (
                      /* Action Selection */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Play className="h-4 w-4 text-blue-500" />
                            Selecione a Ação
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowNewActionModal(true)}
                            className="gap-1.5 text-xs border-dashed border-blue-500/50 text-blue-600 hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-700"
                          >
                            <PlusCircle className="h-3.5 w-3.5" />
                            Nova Ação
                          </Button>
                        </div>
                        <ScrollArea className="h-[450px] pr-4">
                          <div className="space-y-2">
                            {actions.map((action) => (
                              <div
                                key={action.id}
                                className="p-3 rounded-lg border bg-card hover:bg-muted cursor-pointer transition-all"
                                onClick={() => {
                                  addStep("action", { actionId: action.id, settings: {} });
                                  setSelectedStepIndex(null);
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-blue-500/10">
                                    <action.icon className="h-4 w-4 text-blue-500" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{action.name}</p>
                                    <p className="text-xs text-muted-foreground">{action.description}</p>
                                    <Badge variant="outline" className="mt-1 text-xs">
                                      {action.category}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    ) : selectedStepIndex !== null && workflowSteps[selectedStepIndex] ? (
                      /* Step Configuration */
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Settings className="h-4 w-4 text-primary" />
                          Configurar Etapa
                        </h3>
                        <Card>
                          <CardContent className="p-4 space-y-4">
                            {workflowSteps[selectedStepIndex].type === "action" && (
                              <>
                                <div className="space-y-2">
                                  <Label className="text-sm">Ação Selecionada</Label>
                                  <div className="p-3 rounded-lg bg-muted flex items-center gap-3">
                                    <div className="p-2 rounded bg-blue-500/10">
                                      {(() => {
                                        const action = getActionData(workflowSteps[selectedStepIndex].config.actionId ?? "");
                                        const Icon = action?.icon || Play;
                                        return <Icon className="h-4 w-4 text-blue-500" />;
                                      })()}
                                    </div>
                                    <span className="font-medium">
                                      {getActionData(workflowSteps[selectedStepIndex].config.actionId ?? "")?.name}
                                    </span>
                                  </div>
                                </div>

                                {/* Enviar Email: templates da tabela email_templates */}
                                {isEmailAction(workflowSteps[selectedStepIndex].config.actionId ?? "") && (
                                  <>
                                    <div className="space-y-2">
                                      <Label className="text-sm">Template de E-mail</Label>
                                      {workflowSteps[selectedStepIndex].config.template_id ? (
                                        <div className="space-y-2">
                                          <div className="p-3 rounded-lg border bg-muted/50 flex items-center justify-between">
                                            <div>
                                              <p className="font-medium">
                                                {emailTemplates.find(
                                                  (t) => (t.uuid ?? String(t.id ?? "")) === workflowSteps[selectedStepIndex].config.template_id
                                                )?.name ?? "Template"}
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                {emailTemplates.find(
                                                  (t) => (t.uuid ?? String(t.id ?? "")) === workflowSteps[selectedStepIndex].config.template_id
                                                )?.type ?? ""}
                                              </p>
                                            </div>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className="h-auto py-1 text-xs"
                                              onClick={() =>
                                                updateStepConfig({
                                                  template_id: undefined,
                                                  subject: undefined,
                                                })
                                              }
                                            >
                                              Remover template
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <Select
                                          value={String(workflowSteps[selectedStepIndex].config.template_id ?? "")}
                                          onValueChange={(value) => {
                                            const selectedTemplate = emailTemplates.find(
                                              (t) => (t.uuid ?? String(t.id ?? "")) === value
                                            );
                                            updateStepConfig({
                                              template_id: value,
                                              subject: selectedTemplate?.subject ?? workflowSteps[selectedStepIndex].config.subject,
                                            });
                                          }}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Selecione um template (opcional)" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {emailTemplates.map((template) => (
                                              <SelectItem
                                                key={template.uuid ?? template.id ?? ""}
                                                value={String(template.uuid ?? template.id ?? "")}
                                              >
                                                <div className="flex flex-col">
                                                  <span className="font-medium">{template.name ?? "Sem nome"}</span>
                                                  {template.type && (
                                                    <span className="text-xs text-muted-foreground">{template.type}</span>
                                                  )}
                                                </div>
                                              </SelectItem>
                                            ))}
                                            {emailTemplates.length === 0 && (
                                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                                Nenhum template disponível. Crie em Configurações / Templates de E-mail.
                                              </div>
                                            )}
                                          </SelectContent>
                                        </Select>
                                      )}
                                      <p className="text-xs text-muted-foreground">
                                        {workflowSteps[selectedStepIndex].config.template_id
                                          ? "O template será usado com as variáveis do evento."
                                          : "Selecione um template da tabela email_templates ou configure manualmente abaixo."}
                                      </p>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm">Assunto do E-mail</Label>
                                      <Input
                                        placeholder="Assunto (ou use o do template)"
                                          value={
                                          String(workflowSteps[selectedStepIndex].config.subject ?? "") ||
                                          (workflowSteps[selectedStepIndex].config.template_id
                                            ? emailTemplates.find(
                                                (t) =>
                                                  (t.uuid ?? String(t.id ?? "")) === workflowSteps[selectedStepIndex].config.template_id
                                              )?.subject ?? ""
                                            : "")
                                        }
                                        onChange={(e) => updateStepConfig({ subject: e.target.value })}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm">Destinatário (opcional)</Label>
                                      <Input
                                        placeholder="email@exemplo.com (vazio = e-mail do evento)"
                                        value={String(workflowSteps[selectedStepIndex].config.to ?? "")}
                                        onChange={(e) => updateStepConfig({ to: e.target.value })}
                                      />
                                    </div>
                                    {!workflowSteps[selectedStepIndex].config.template_id && (
                                      <div className="space-y-2">
                                        <Label className="text-sm">Conteúdo HTML (opcional)</Label>
                                        <Textarea
                                          placeholder="<html>...</html>"
                                          rows={4}
                                          className="font-mono text-sm"
                                          value={String(workflowSteps[selectedStepIndex].config.html ?? "")}
                                          onChange={(e) => updateStepConfig({ html: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                          Use variáveis: [nome], [email], [numero-reserva], [data-checkin], etc.
                                        </p>
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* SMS / WhatsApp: configuração simples */}
                                {getActionData(workflowSteps[selectedStepIndex].config.actionId ?? "")?.name === "Enviar SMS" && (
                                  <div className="space-y-2">
                                    <Label className="text-sm">Mensagem</Label>
                                    <Textarea
                                      placeholder="Texto da mensagem SMS"
                                      rows={3}
                                      value={String(workflowSteps[selectedStepIndex].config.message ?? "")}
                                      onChange={(e) => updateStepConfig({ message: e.target.value })}
                                    />
                                  </div>
                                )}
                                {getActionData(workflowSteps[selectedStepIndex].config.actionId ?? "")?.name === "Enviar WhatsApp" && (
                                  <div className="space-y-2">
                                    <Label className="text-sm">Mensagem</Label>
                                    <Textarea
                                      placeholder="Texto da mensagem WhatsApp"
                                      rows={3}
                                      value={String(workflowSteps[selectedStepIndex].config.message ?? "")}
                                      onChange={(e) => updateStepConfig({ message: e.target.value })}
                                    />
                                  </div>
                                )}

                                {workflowSteps[selectedStepIndex].config.actionId === "add_points" && (
                                  <div className="space-y-2">
                                    <Label className="text-sm">Quantidade de Pontos</Label>
                                    <Input type="number" placeholder="100" defaultValue="100" />
                                  </div>
                                )}

                                {workflowSteps[selectedStepIndex].config.actionId === "create_task" && (
                                  <>
                                    <div className="space-y-2">
                                      <Label className="text-sm">Título da Tarefa</Label>
                                      <Input placeholder="Título da tarefa" />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm">Atribuir para</Label>
                                      <Select>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="manager">Gerente</SelectItem>
                                          <SelectItem value="reception">Recepção</SelectItem>
                                          <SelectItem value="housekeeping">Governança</SelectItem>
                                          <SelectItem value="maintenance">Manutenção</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm">Prioridade</Label>
                                      <Select defaultValue="medium">
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="low">Baixa</SelectItem>
                                          <SelectItem value="medium">Média</SelectItem>
                                          <SelectItem value="high">Alta</SelectItem>
                                          <SelectItem value="urgent">Urgente</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </>
                                )}

                                {workflowSteps[selectedStepIndex].config.actionId === "webhook" && (
                                  <>
                                    <div className="space-y-2">
                                      <Label className="text-sm">URL do Webhook</Label>
                                      <Input placeholder="https://api.exemplo.com/webhook" />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm">Método</Label>
                                      <Select defaultValue="POST">
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="POST">POST</SelectItem>
                                          <SelectItem value="GET">GET</SelectItem>
                                          <SelectItem value="PUT">PUT</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </>
                                )}
                              </>
                            )}

                            {workflowSteps[selectedStepIndex].type === "delay" && (
                              <div className="space-y-2">
                                <Label className="text-sm">Tempo de Espera</Label>
                                <Select
                                  value={String(workflowSteps[selectedStepIndex].config.delay ?? "")}
                                  onValueChange={(value) => {
                                    const newSteps = [...workflowSteps];
                                    newSteps[selectedStepIndex].config.delay = value;
                                    setWorkflowSteps(newSteps);
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {delayOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {workflowSteps[selectedStepIndex].type === "condition" && (
                              <>
                                <div className="space-y-2">
                                  <Label className="text-sm">Condição</Label>
                                  <Select
                                    value={String(workflowSteps[selectedStepIndex].config.condition ?? "")}
                                    onValueChange={(value) => {
                                      const newSteps = [...workflowSteps];
                                      newSteps[selectedStepIndex].config.condition = value;
                                      setWorkflowSteps(newSteps);
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {conditionOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch id="advanced-filter" />
                                  <Label htmlFor="advanced-filter" className="text-sm">
                                    Usar filtro avançado
                                  </Label>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      /* Default - Trigger Config */
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Target className="h-4 w-4 text-amber-500" />
                          Configurar Gatilho
                        </h3>
                        <Card>
                          <CardContent className="p-4 space-y-4">
                            <div className="p-3 rounded-lg bg-amber-500/10 flex items-center gap-3">
                              {(() => {
                                const TriggerIcon = getTriggerData(selectedTrigger!)?.icon || Zap;
                                return <TriggerIcon className="h-5 w-5 text-amber-500" />;
                              })()}
                              <div>
                                <p className="font-medium">{getTriggerData(selectedTrigger!)?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {getTriggerData(selectedTrigger!)?.category}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm">Aplicar para</Label>
                              <Select defaultValue="all">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {conditionOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center gap-2">
                              <Switch id="filter-trigger" />
                              <Label htmlFor="filter-trigger" className="text-sm">
                                Aplicar filtros avançados
                              </Label>
                            </div>

                            <Button variant="outline" size="sm" className="w-full gap-2">
                              <Settings className="h-4 w-4" />
                              Configurações Avançadas
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Configurações */}
              <TabsContent value="config" className="m-0 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-5 space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Settings className="h-4 w-4 text-primary" />
                        Configurações Gerais
                      </h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Nome do Workflow</Label>
                          <Input
                            value={workflowName}
                            onChange={(e) => setWorkflowName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Descrição</Label>
                          <Textarea
                            value={workflowDescription}
                            onChange={(e) => setWorkflowDescription(e.target.value)}
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Categoria</Label>
                          <Select defaultValue="communication">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="communication">Comunicação</SelectItem>
                              <SelectItem value="operations">Operações</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="finance">Financeiro</SelectItem>
                              <SelectItem value="loyalty">Fidelidade</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-5 space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Controle de Execução
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Ativar Workflow</p>
                            <p className="text-xs text-muted-foreground">
                              Workflow será executado automaticamente
                            </p>
                          </div>
                          <Switch checked={isActive} onCheckedChange={setIsActive} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Modo de Teste</p>
                            <p className="text-xs text-muted-foreground">
                              Executa sem enviar mensagens reais
                            </p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Limitar Execuções</p>
                            <p className="text-xs text-muted-foreground">
                              1x por cliente por período
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Limite por Período</Label>
                          <Select defaultValue="24h">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1h">1 hora</SelectItem>
                              <SelectItem value="24h">24 horas</SelectItem>
                              <SelectItem value="7d">7 dias</SelectItem>
                              <SelectItem value="30d">30 dias</SelectItem>
                              <SelectItem value="never">Nunca repetir</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-5 space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        Horários de Execução
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Respeitar Horário Comercial</p>
                            <p className="text-xs text-muted-foreground">
                              Só executa entre 8h e 20h
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm">Início</Label>
                            <Input type="time" defaultValue="08:00" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Fim</Label>
                            <Input type="time" defaultValue="20:00" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Executar nos Finais de Semana</p>
                            <p className="text-xs text-muted-foreground">
                              Sábados e domingos
                            </p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-5 space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <RotateCcw className="h-4 w-4 text-purple-500" />
                        Tratamento de Erros
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Retry Automático</p>
                            <p className="text-xs text-muted-foreground">
                              Tentar novamente em caso de falha
                            </p>
                          </div>
                          <Switch checked={retryEnabled} onCheckedChange={setRetryEnabled} />
                        </div>
                        {retryEnabled && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-sm">Número de Tentativas</Label>
                              <Select value={retryCount} onValueChange={setRetryCount}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 tentativa</SelectItem>
                                  <SelectItem value="2">2 tentativas</SelectItem>
                                  <SelectItem value="3">3 tentativas</SelectItem>
                                  <SelectItem value="5">5 tentativas</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">Intervalo entre tentativas (segundos)</Label>
                              <Input
                                type="number"
                                min={1}
                                max={3600}
                                value={retryDelaySeconds}
                                onChange={(e) => setRetryDelaySeconds(Math.max(1, parseInt(e.target.value, 10) || 60))}
                              />
                            </div>
                          </>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Notificar em Falha</p>
                            <p className="text-xs text-muted-foreground">
                              Enviar alerta para administrador
                            </p>
                          </div>
                          <Switch defaultChecked disabled />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab: Condições */}
              <TabsContent value="conditions" className="m-0 space-y-6">
                <Card>
                  <CardContent className="p-5 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Filter className="h-4 w-4 text-primary" />
                      Condições de Execução
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Defina quando este workflow deve ser executado
                    </p>

                    <div className="space-y-4 pt-4">
                      <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">Tipo de Hóspede</span>
                          <Select defaultValue="all">
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              <SelectItem value="vip">VIP</SelectItem>
                              <SelectItem value="new">Novo</SelectItem>
                              <SelectItem value="returning">Recorrente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">Canal de Reserva</span>
                          <Select defaultValue="all">
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              <SelectItem value="direct">Direto</SelectItem>
                              <SelectItem value="booking">Booking.com</SelectItem>
                              <SelectItem value="airbnb">Airbnb</SelectItem>
                              <SelectItem value="expedia">Expedia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">Tipo de Reserva</span>
                          <Select defaultValue="all">
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todas</SelectItem>
                              <SelectItem value="individual">Individual</SelectItem>
                              <SelectItem value="group">Grupo</SelectItem>
                              <SelectItem value="corporate">Corporativa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">Valor Mínimo</span>
                          <Input
                            type="number"
                            placeholder="R$ 0,00"
                            className="w-48"
                          />
                        </div>
                      </div>

                      <Button variant="outline" className="w-full gap-2">
                        <Plus className="h-4 w-4" />
                        Adicionar Condição
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Variáveis */}
              <TabsContent value="variables" className="m-0 space-y-6">
                <Card>
                  <CardContent className="p-5 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Variable className="h-4 w-4 text-primary" />
                      Variáveis Disponíveis
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Use essas variáveis para personalizar suas mensagens
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 pt-4">
                      {[
                        { var: "{{guest.name}}", desc: "Nome do hóspede" },
                        { var: "{{guest.email}}", desc: "E-mail do hóspede" },
                        { var: "{{guest.phone}}", desc: "Telefone do hóspede" },
                        { var: "{{reservation.id}}", desc: "ID da reserva" },
                        { var: "{{reservation.checkin}}", desc: "Data de check-in" },
                        { var: "{{reservation.checkout}}", desc: "Data de check-out" },
                        { var: "{{reservation.room}}", desc: "Número do quarto" },
                        { var: "{{reservation.total}}", desc: "Valor total" },
                        { var: "{{hotel.name}}", desc: "Nome do hotel" },
                        { var: "{{hotel.phone}}", desc: "Telefone do hotel" },
                        { var: "{{hotel.address}}", desc: "Endereço do hotel" },
                        { var: "{{current.date}}", desc: "Data atual" },
                      ].map((item) => (
                        <div
                          key={item.var}
                          className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between"
                        >
                          <div>
                            <code className="text-sm font-mono text-primary">{item.var}</code>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Testar */}
              <TabsContent value="test" className="m-0 space-y-6">
                <Card>
                  <CardContent className="p-5 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <TestTube className="h-4 w-4 text-primary" />
                      Testar Workflow
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Execute o workflow em modo de teste para validar
                    </p>

                    <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/5 to-cyan-500/10 border border-blue-500/20 space-y-4">
                      <div className="space-y-2">
                        <Label>Simular com Dados</Label>
                        <Select defaultValue="sample">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sample">Dados de exemplo</SelectItem>
                            <SelectItem value="real">Hóspede real (teste)</SelectItem>
                            <SelectItem value="custom">Dados personalizados</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Nome do Hóspede</Label>
                          <Input defaultValue="João Silva" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">E-mail</Label>
                          <Input defaultValue="joao.silva@email.com" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Switch id="dry-run" defaultChecked />
                        <Label htmlFor="dry-run" className="text-sm">
                          Modo Dry-Run (não envia mensagens reais)
                        </Label>
                      </div>

                      <Button className="w-full gap-2">
                        <Play className="h-4 w-4" />
                        Executar Teste
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Histórico */}
              <TabsContent value="history" className="m-0 space-y-6">
                <Card>
                  <CardContent className="p-5 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <History className="h-4 w-4 text-primary" />
                      Últimas Execuções
                    </h4>

                    {loadingExecutions ? (
                      <div className="py-8 text-center text-muted-foreground">Carregando execuções...</div>
                    ) : executionHistory.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">Nenhuma execução registrada para este workflow.</div>
                    ) : (
                      <div className="space-y-3">
                        {executionHistory.map((exec) => (
                          <div
                            key={exec.id}
                            className="flex flex-col gap-2 p-4 rounded-lg border bg-card"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div
                                  className={cn(
                                    "p-2 rounded-full flex-shrink-0",
                                    exec.status === "success" ? "bg-green-500/10" : "bg-red-500/10"
                                  )}
                                >
                                  {exec.status === "success" ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{exec.trigger}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Duração: {exec.duration}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-medium text-sm">{exec.time}</p>
                                <p className="text-xs text-muted-foreground">
                                  {exec.status === "success" ? "Sucesso" : "Falhou"}
                                </p>
                              </div>
                            </div>
                            {exec.status === "failed" && exec.errorMessage && (
                              <div className="mt-2 pl-12 text-xs text-destructive bg-destructive/10 rounded p-2">
                                <span className="font-medium">Erro: </span>
                                {exec.errorMessage}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex items-center justify-between bg-muted/30 flex-shrink-0 shrink-0">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <Layers className="h-3 w-3" />
              {workflowSteps.length} etapas
            </Badge>
            {workflow && (
              <Badge variant="outline" className="gap-1">
                <History className="h-3 w-3" />
                {workflow.executions?.toLocaleString() || 0} execuções
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            {saveError && (
              <span className="text-sm text-destructive">{saveError}</span>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button className="gap-2" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar Workflow"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <NewActionModal
      open={showNewActionModal}
      onOpenChange={setShowNewActionModal}
      onCreated={(action) => {
        addStep("action", { actionId: action.id, settings: {} });
        setSelectedStepIndex(null);
        setShowNewActionModal(false);
      }}
    />
  </>
  );
}
