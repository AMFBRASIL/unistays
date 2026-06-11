import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  Check,
  Info,
  X,
  Mail,
  MessageSquare,
  Send,
  Bell,
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
  TrendingUp,
  Settings,
  XCircle,
  ArrowRight,
  Save,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

interface WorkflowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId?: number | null;
  onSuccess?: () => void;
}

// Icon mapping
const iconMap: Record<string, any> = {
  new_guest: UserPlus,
  new_reservation: CalendarCheck,
  checkin: DoorOpen,
  checkout: LogOut,
  payment_received: CreditCard,
  review_received: Star,
  birthday: Gift,
  reservation_cancelled: XCircle,
  low_occupancy: TrendingUp,
  maintenance_request: Settings,
  send_email: Mail,
  send_sms: MessageSquare,
  send_whatsapp: Send,
  push_notification: Bell,
  create_task: FileText,
  update_database: Database,
  webhook: Webhook,
  add_points: Gift,
  assign_team: Users,
  delay: Clock,
};

export function WorkflowModal({ open, onOpenChange, workflowId, onSuccess }: WorkflowModalProps) {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [triggerTypes, setTriggerTypes] = useState<any[]>([]);
  const [actionTypes, setActionTypes] = useState<any[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    triggerType: "",
    triggerConfig: {} as any,
    actions: [] as Array<{ action_id: string; config: any }>,
    status: "draft" as "active" | "paused" | "draft",
  });

  // Load data on mount; ao editar, carregar workflow depois dos trigger types para popular trigger_config
  useEffect(() => {
    if (open) {
      if (workflowId) {
        setMode("edit");
        loadData().then(() => loadWorkflow(Number(workflowId)));
      } else {
        loadData();
        setMode("list");
      }
    } else {
      resetForm();
      setMode("list");
    }
  }, [open, workflowId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [workflowsRes, triggersRes, actionsRes, emailTemplatesRes] = await Promise.all([
        api.getWorkflows(),
        api.getWorkflowTriggerTypes(),
        api.getWorkflowActionTypes(),
        api.getEmailTemplates(undefined, undefined, 'active').catch(() => ({ success: false, data: { templates: [] } })),
      ]);

      if (workflowsRes.success && workflowsRes.data?.workflows) {
        setWorkflows(workflowsRes.data.workflows);
      }
      if (triggersRes.success && triggersRes.data?.triggers) {
        setTriggerTypes(triggersRes.data.triggers);
      }
      if (actionsRes.success && actionsRes.data?.actions) {
        setActionTypes(actionsRes.data.actions);
      }
      if (emailTemplatesRes.success && emailTemplatesRes.data?.templates) {
        setEmailTemplates(emailTemplatesRes.data.templates);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkflow = async (id: number) => {
    try {
      setIsLoading(true);
      const res = await api.getWorkflowById(id);
      if (res.success && res.data) {
        const workflow = res.data as Record<string, unknown>;
        setSelectedWorkflow(workflow);
        const rawTriggerType =
          (workflow.triggerType as string) ||
          (workflow.trigger_type as string) ||
          "";
        // Normalizar: a coluna trigger_type no banco deve guardar o trigger_id (ex: "new_guest"), nunca o nome ("Novo Hóspede")
        // Se o valor vindo da API for o nome, resolver para o triggerId usando a lista de triggerTypes
        let triggerType = rawTriggerType;
        if (triggerTypes.length > 0 && rawTriggerType) {
          const byId = triggerTypes.find(
            (t) => (t.triggerId ?? (t as Record<string, unknown>).trigger_id) === rawTriggerType
          );
          const byName = triggerTypes.find((t) => t.name === rawTriggerType);
          const resolved = byId ?? byName;
          if (resolved) {
            triggerType = (resolved.triggerId ?? (resolved as Record<string, unknown>).trigger_id) as string;
          }
        }
        let triggerConfig: Record<string, unknown> =
          (workflow.triggerConfig as Record<string, unknown>) ||
          (workflow.trigger_config as Record<string, unknown>) ||
          {};
        if (typeof triggerConfig !== "object" || Array.isArray(triggerConfig)) {
          triggerConfig = {};
        }
        if (triggerType && triggerTypes.length > 0) {
          const triggerMeta = triggerTypes.find(
            (t) => (t.triggerId ?? (t as Record<string, unknown>).trigger_id) === triggerType
          );
          triggerConfig = {
            ...triggerConfig,
            triggerId: triggerType,
            triggerName: triggerMeta?.name ?? triggerType,
            category: triggerMeta?.category ?? "",
          };
        }
        const actions = Array.isArray(workflow.actions) ? workflow.actions : [];
        setFormData({
          name: (workflow.name as string) || "",
          description: (workflow.description as string) || "",
          triggerType,
          triggerConfig,
          actions,
          status: ((workflow.status as string) || "draft") as "active" | "paused" | "draft",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar workflow:", error);
      toast.error("Erro ao carregar workflow");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      triggerType: "",
      triggerConfig: {},
      actions: [],
      status: "draft",
    });
    setSelectedWorkflow(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (!formData.triggerType) {
      toast.error("Selecione um gatilho");
      return;
    }

    if (formData.actions.length === 0) {
      toast.error("Adicione pelo menos uma ação");
      return;
    }

    try {
      setIsSubmitting(true);

      if (selectedWorkflow) {
        const w = selectedWorkflow as Record<string, unknown>;
        let triggerType =
          formData.triggerType ||
          (w.triggerType as string) ||
          (w.trigger_type as string) ||
          "";
        // Garantir que enviamos sempre o trigger_id (ex: "new_guest"), nunca o nome ("Novo Hóspede")
        if (triggerType && triggerTypes.length > 0) {
          const byId = triggerTypes.find(
            (t) => (t.triggerId ?? (t as Record<string, unknown>).trigger_id) === triggerType
          );
          const byName = triggerTypes.find((t) => t.name === triggerType);
          const resolved = byId ?? byName;
          if (resolved) {
            triggerType = String(resolved.triggerId ?? (resolved as Record<string, unknown>).trigger_id);
          }
        }
        const triggerConfig =
          formData.triggerConfig && typeof formData.triggerConfig === "object"
            ? formData.triggerConfig
            : (w.triggerConfig && typeof w.triggerConfig === "object" ? w.triggerConfig : {});
        const updatePayload = {
          name: formData.name.trim(),
          description: formData.description?.trim() || null,
          triggerType,
          triggerConfig: triggerConfig && typeof triggerConfig === "object" ? triggerConfig : {},
          actions: formData.actions,
          status: formData.status,
        };
        const res = await api.updateWorkflow(selectedWorkflow.id, updatePayload);
        if (res.success) {
          toast.success("Workflow atualizado com sucesso");
          await loadData();
          setMode("list");
          resetForm();
          onSuccess?.();
        } else {
          throw new Error(res.error?.message || "Erro ao atualizar workflow");
        }
      } else {
        // Create: garantir que enviamos trigger_id (ex: "new_guest"), nunca o nome
        let createTriggerType = formData.triggerType;
        if (createTriggerType && triggerTypes.length > 0) {
          const byId = triggerTypes.find(
            (t) => (t.triggerId ?? (t as Record<string, unknown>).trigger_id) === createTriggerType
          );
          const byName = triggerTypes.find((t) => t.name === createTriggerType);
          const resolved = byId ?? byName;
          if (resolved) {
            createTriggerType = String(resolved.triggerId ?? (resolved as Record<string, unknown>).trigger_id);
          }
        }
        const createPayload = { ...formData, triggerType: createTriggerType };
        const res = await api.createWorkflow(createPayload);
        if (res.success) {
          toast.success("Workflow criado com sucesso");
          await loadData();
          setMode("list");
          resetForm();
          onSuccess?.();
        } else {
          throw new Error(res.error?.message || "Erro ao criar workflow");
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar workflow:", error);
      toast.error(error.message || "Erro ao salvar workflow");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!workflowToDelete) return;

    try {
      const res = await api.deleteWorkflow(workflowToDelete.id);
      if (res.success) {
        toast.success("Workflow excluído com sucesso");
        await loadData();
        setDeleteDialogOpen(false);
        setWorkflowToDelete(null);
        onSuccess?.();
      } else {
        throw new Error(res.error?.message || "Erro ao excluir workflow");
      }
    } catch (error: any) {
      console.error("Erro ao excluir workflow:", error);
      toast.error(error.message || "Erro ao excluir workflow");
    }
  };

  const handleAddAction = () => {
    if (actionTypes.length > 0) {
      setFormData({
        ...formData,
        actions: [
          ...formData.actions,
          {
            action_id: actionTypes[0].actionId,
            config: {},
          },
        ],
      });
    }
  };

  const handleRemoveAction = (index: number) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter((_, i) => i !== index),
    });
  };

  const handleUpdateAction = (index: number, field: string, value: any) => {
    const newActions = [...formData.actions];
    if (field === "action_id") {
      newActions[index] = { ...newActions[index], action_id: value, config: {} };
    } else if (field === "config") {
      newActions[index] = { ...newActions[index], config: { ...newActions[index].config, ...value } };
    }
    setFormData({ ...formData, actions: newActions });
  };

  const filteredWorkflows = workflows.filter((w: any) =>
    w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTrigger = triggerTypes.find(
    (t) => (t.triggerId ?? (t as Record<string, unknown>).trigger_id) === formData.triggerType
  );

  // List Mode
  if (mode === "list") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0 gap-0 overflow-hidden">
          <div className="relative px-6 py-5 border-b bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10">
            <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none">
              <svg viewBox="0 0 200 200" className="w-full h-full text-purple-500">
                <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
              <GitBranch className="h-32 w-32 text-purple-500" />
            </div>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl shadow-lg bg-gradient-to-br from-purple-500 to-blue-500">
                    <GitBranch className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-purple-600">Workflows</DialogTitle>
                    <p className="text-sm font-normal text-purple-500 mt-1">
                      Gerencie seus workflows de automação
                    </p>
                  </div>
                </div>
                <Button onClick={() => setMode("create")} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Workflow
                </Button>
              </div>
            </DialogHeader>
          </div>

          <div className="px-6 py-4 border-b">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Buscar workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-[calc(95vh-200px)]">
            <div className="p-6 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredWorkflows.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhum workflow encontrado
                </div>
              ) : (
                filteredWorkflows.map((workflow: any) => {
                  const triggerInfo = triggerTypes.find((t) => t.triggerId === workflow.triggerType);
                  const TriggerIcon = triggerInfo ? iconMap[triggerInfo.triggerId] || Zap : Zap;

                  return (
                    <Card
                      key={workflow.id}
                      className="hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedWorkflow(workflow);
                        loadWorkflow(workflow.id);
                        setMode("edit");
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div
                              className={`p-3 rounded-xl ${workflow.status === "active" ? "bg-green-500/10" : "bg-muted"
                                }`}
                            >
                              <TriggerIcon
                                className={`h-6 w-6 ${workflow.status === "active" ? "text-green-500" : "text-muted-foreground"
                                  }`}
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{workflow.name}</h3>
                                <Badge variant={workflow.status === "active" ? "default" : "secondary"}>
                                  {workflow.status === "active" ? "Ativo" : workflow.status === "paused" ? "Pausado" : "Rascunho"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{workflow.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Gatilho: {triggerInfo?.name || workflow.triggerType}</span>
                                <span>Ações: {workflow.actions?.length || 0}</span>
                                <span>Execuções: {workflow.executionCount || 0}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedWorkflow(workflow);
                                loadWorkflow(workflow.id);
                                setMode("edit");
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setWorkflowToDelete(workflow);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </DialogContent>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Workflow</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o workflow "{workflowToDelete?.name}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Dialog>
    );
  }

  // Create/Edit Mode
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] h-[95vh] p-0 gap-0 overflow-hidden flex flex-col">
        <div className="relative px-6 py-5 border-b bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 flex-shrink-0">
          <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-purple-500">
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
            </svg>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            <GitBranch className="h-32 w-32 text-purple-500" />
          </div>
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl shadow-lg bg-gradient-to-br from-purple-500 to-blue-500">
                <GitBranch className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-purple-600">
                  {selectedWorkflow ? "Editar Workflow" : "Novo Workflow"}
                </DialogTitle>
                <p className="text-sm font-normal text-purple-500 mt-1">
                  {selectedWorkflow
                    ? "Configure e atualize seu workflow de automação"
                    : "Crie um novo workflow de automação para seu sistema"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMode("list")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Workflow *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Boas-vindas Novo Hóspede"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o que este workflow faz..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="status"
                      checked={formData.status === "active"}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, status: checked ? "active" : "paused" })
                      }
                    />
                    <Label htmlFor="status">Workflow Ativo</Label>
                  </div>
                  <Badge variant={formData.status === "active" ? "default" : "secondary"}>
                    {formData.status === "active" ? "Ativo" : formData.status === "paused" ? "Pausado" : "Rascunho"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Gatilho */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Gatilho
                </CardTitle>
                <CardDescription>Escolha o evento que inicia este workflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="triggerType">Tipo de Gatilho *</Label>
                  <Select
                    value={formData.triggerType}
                    onValueChange={(value) => {
                      const triggerId = value;
                      const selectedTrigger = triggerTypes.find(
                        (t) => (t.triggerId ?? (t as Record<string, unknown>).trigger_id) === triggerId
                      );
                      const newTriggerConfig: Record<string, unknown> = {
                        triggerId: triggerId,
                        triggerName: selectedTrigger?.name ?? triggerId,
                        category: selectedTrigger?.category ?? "",
                        ...(formData.triggerConfig && typeof formData.triggerConfig === "object" && !Array.isArray(formData.triggerConfig)
                          ? (formData.triggerConfig as Record<string, unknown>)
                          : {}),
                      };
                      setFormData({ ...formData, triggerType: triggerId, triggerConfig: newTriggerConfig });
                    }}
                  >
                    <SelectTrigger id="triggerType">
                      <SelectValue placeholder="Selecione um gatilho" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTypes.map((trigger) => {
                        const tid = trigger.triggerId ?? (trigger as Record<string, unknown>).trigger_id;
                        const TriggerIcon = iconMap[String(tid)] || Zap;
                        return (
                          <SelectItem key={String(tid)} value={String(tid)}>
                            <div className="flex items-center gap-2">
                              <TriggerIcon className="h-4 w-4" />
                              <span>{trigger.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTrigger && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-yellow-500/10">
                        {(() => {
                          const TriggerIcon = iconMap[selectedTrigger.triggerId ?? (selectedTrigger as Record<string, unknown>).trigger_id as string] || Zap;
                          return <TriggerIcon className="h-5 w-5 text-yellow-500" />;
                        })()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{selectedTrigger.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{selectedTrigger.description}</p>
                        <Badge variant="outline" className="mt-2">
                          {selectedTrigger.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ações */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5 text-blue-500" />
                      Ações
                    </CardTitle>
                    <CardDescription>Configure as ações que serão executadas</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddAction} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Ação
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.actions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma ação adicionada. Clique em "Adicionar Ação" para começar.
                  </div>
                ) : (
                  formData.actions.map((action, index) => {
                    const actionInfo = actionTypes.find((a) => a.actionId === action.action_id);
                    const ActionIcon = actionInfo ? iconMap[actionInfo.actionId] || Play : Play;

                    return (
                      <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                              <ActionIcon className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-medium">Ação {index + 1}</p>
                              {actionInfo && (
                                <p className="text-sm text-muted-foreground">{actionInfo.name}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveAction(index)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label>Ação</Label>
                          <Select
                            value={action.action_id}
                            onValueChange={(value) => handleUpdateAction(index, "action_id", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {actionTypes.map((a) => {
                                const Icon = iconMap[a.actionId] || Play;
                                return (
                                  <SelectItem key={a.actionId} value={a.actionId}>
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-4 w-4" />
                                      <span>{a.name}</span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Configurações específicas para ação send_email */}
                        {action.action_id === 'send_email' && (
                          <div className="space-y-4 pt-2 border-t">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Template de E-mail</Label>
                                {action.config?.template_id && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      handleUpdateAction(index, "config", {
                                        ...action.config,
                                        template_id: undefined,
                                      });
                                    }}
                                    className="h-auto py-1 text-xs"
                                  >
                                    Remover template
                                  </Button>
                                )}
                              </div>
                              {!action.config?.template_id ? (
                                <Select
                                  value={action.config?.template_id || undefined}
                                  onValueChange={(value) => {
                                    const selectedTemplate = emailTemplates.find((t) => t.uuid === value);
                                    handleUpdateAction(index, "config", {
                                      ...action.config,
                                      template_id: value,
                                      subject: selectedTemplate?.subject || action.config?.subject,
                                    });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um template (opcional)" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {emailTemplates.map((template) => (
                                      <SelectItem key={template.uuid} value={template.uuid}>
                                        <div className="flex flex-col">
                                          <span className="font-medium">{template.name}</span>
                                          <span className="text-xs text-muted-foreground">{template.type}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                    {emailTemplates.length === 0 && (
                                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                        Nenhum template disponível
                                      </div>
                                    )}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="p-3 rounded-lg border bg-muted/50">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium">
                                        {emailTemplates.find((t) => t.uuid === action.config?.template_id)?.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {emailTemplates.find((t) => t.uuid === action.config?.template_id)?.type}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {!action.config?.template_id
                                  ? "Selecione um template criado ou configure manualmente abaixo"
                                  : "O template será usado com as variáveis do evento"}
                              </p>
                            </div>

                            {!action.config?.template_id && (
                              <>
                                <div className="space-y-2">
                                  <Label>Assunto do E-mail</Label>
                                  <Input
                                    value={action.config?.subject || ''}
                                    onChange={(e) => handleUpdateAction(index, "config", {
                                      ...action.config,
                                      subject: e.target.value,
                                    })}
                                    placeholder="Assunto do e-mail"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Conteúdo HTML</Label>
                                  <Textarea
                                    value={action.config?.html || ''}
                                    onChange={(e) => handleUpdateAction(index, "config", {
                                      ...action.config,
                                      html: e.target.value,
                                    })}
                                    placeholder="<html>...</html>"
                                    rows={6}
                                    className="font-mono text-sm"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Use variáveis como [cliente], [email], [telefone], etc.
                                  </p>
                                </div>
                              </>
                            )}

                            {action.config?.template_id && (
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">
                                  <strong>Template selecionado:</strong> {
                                    emailTemplates.find((t) => t.uuid === action.config?.template_id)?.name
                                  }
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  O template será usado com as variáveis do evento. Você ainda pode personalizar o assunto abaixo.
                                </p>
                                <div className="space-y-2 mt-3">
                                  <Label>Assunto Personalizado (opcional)</Label>
                                  <Input
                                    value={action.config?.subject || emailTemplates.find((t) => t.uuid === action.config?.template_id)?.subject || ''}
                                    onChange={(e) => handleUpdateAction(index, "config", {
                                      ...action.config,
                                      subject: e.target.value,
                                    })}
                                    placeholder="Deixe vazio para usar o assunto do template"
                                  />
                                </div>
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label>Destinatário (opcional)</Label>
                              <Input
                                value={action.config?.to || ''}
                                onChange={(e) => handleUpdateAction(index, "config", {
                                  ...action.config,
                                  to: e.target.value,
                                })}
                                placeholder="email@exemplo.com (deixe vazio para usar o e-mail do evento)"
                              />
                              <p className="text-xs text-muted-foreground">
                                Se não informado, será usado o e-mail do evento que disparou o workflow
                              </p>
                            </div>
                          </div>
                        )}

                        {index < formData.actions.length - 1 && (
                          <div className="flex justify-center py-2">
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          <div className="px-6 py-4 border-t bg-muted/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <Button type="button" variant="outline" onClick={() => setMode("list")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {selectedWorkflow ? "Salvar Alterações" : "Criar Workflow"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
