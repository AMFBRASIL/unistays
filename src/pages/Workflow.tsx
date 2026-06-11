import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GitBranch,
  Plus,
  Search,
  Play,
  Settings,
  Trash2,
  Copy,
  MoreVertical,
  Zap,
  Mail,
  Bell,
  MessageSquare,
  UserPlus,
  CalendarCheck,
  CreditCard,
  LogOut,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Database,
  Webhook,
  FileText,
  Send,
  Users,
  DoorOpen,
  Star,
  Gift,
  TrendingUp,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  History,
  Calendar,
  LogIn,
  Wrench,
  Phone,
  CheckSquare,
  Globe,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkflowEditorModal } from "@/components/workflows/WorkflowEditorModal";
import { NewWorkflowModal } from "@/components/workflows/NewWorkflowModal";
import { WorkflowHistoryModal } from "@/components/workflows/WorkflowHistoryModal";
import { api } from "@/lib/api";
import { toast } from "sonner";

const WORKFLOW_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Mail, Bell, MessageSquare, UserPlus, CalendarCheck, CreditCard, LogOut, LogIn, DoorOpen,
  Star, Gift, TrendingUp, Settings, Wrench, Play, Database, Webhook, FileText, Send, Users, Clock,
  CheckSquare, Globe, Phone, Calendar,
};

function mapIcon(iconName: string) {
  return WORKFLOW_ICON_MAP[iconName] || Zap;
}

interface WorkflowItem {
  id: string;
  name?: string;
  description?: string;
  trigger?: string;
  triggerName?: string;
  actions?: string[];
  status?: string;
  executions?: number;
  successRate?: number;
  lastRun?: string;
  hasFailed?: boolean;
}

interface ApiData {
  workflows?: unknown[];
  triggers?: { id: string; name?: string; icon?: string; [k: string]: unknown }[];
  actions?: { id: string; name?: string; icon?: string; [k: string]: unknown }[];
  executions?: { id: string; workflowName?: string; triggeredBy?: string; triggerData?: unknown; status?: string; duration?: string; time?: string }[];
  total?: number;
  active?: number;
  totalExecutions?: number;
}

/** Item de gatilho ou ação da API, com ícone mapeado para componente Lucide */
interface TriggerActionItem {
  id: string;
  name?: string;
  icon?: string | React.ComponentType<{ className?: string }>;
  category?: string;
  description?: string;
  [k: string]: unknown;
}

const Workflow = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewWorkflowOpen, setIsNewWorkflowOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [workflowForHistory, setWorkflowForHistory] = useState<WorkflowItem | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [triggers, setTriggers] = useState<TriggerActionItem[]>([]);
  const [actions, setActions] = useState<TriggerActionItem[]>([]);
  const [executionHistory, setExecutionHistory] = useState<{ id: string; workflow: string; trigger: string; status: string; duration: string; time: string }[]>([]);
  const [status, setStatus] = useState<{ total: number; active: number; totalExecutions: number }>({ total: 0, active: 0, totalExecutions: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingExecutions, setLoadingExecutions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [wfRes, trigRes, actRes, statusRes] = await Promise.all([
        api.getWorkflows(),
        api.getWorkflowTriggerTypes(),
        api.getWorkflowActionTypes(),
        api.getWorkflowStatus(),
      ]);
      const wfData = wfRes.data as ApiData | undefined;
      const trigData = trigRes.data as ApiData | undefined;
      const actData = actRes.data as ApiData | undefined;
      const statusData = statusRes.data as ApiData | undefined;
      if (wfRes.success && wfData?.workflows) {
        setWorkflows(Array.isArray(wfData.workflows) ? (wfData.workflows as WorkflowItem[]) : []);
      }
      if (trigRes.success && trigData?.triggers) {
        const list = Array.isArray(trigData.triggers) ? trigData.triggers : [];
        setTriggers(list.map((t) => ({ ...t, icon: mapIcon((t.icon as string) || "Zap") })));
      }
      if (actRes.success && actData?.actions) {
        const list = Array.isArray(actData.actions) ? actData.actions : [];
        setActions(list.map((a) => ({ ...a, icon: mapIcon((a.icon as string) || "Play") })));
      }
      if (statusRes.success && statusData) {
        setStatus({
          total: Number(statusData.total) || 0,
          active: Number(statusData.active) || 0,
          totalExecutions: Number(statusData.totalExecutions) || 0,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExecutions = useCallback(async () => {
    setLoadingExecutions(true);
    try {
      const res = await api.getWorkflowExecutions(undefined, 50);
      const data = res.data as ApiData | undefined;
      if (res.success && data?.executions) {
        const list = Array.isArray(data.executions) ? data.executions : [];
        setExecutionHistory(list.map((e) => ({
          id: e.id,
          workflow: e.workflowName || "",
          trigger: e.triggeredBy || (e.triggerData && typeof e.triggerData === "object" ? JSON.stringify(e.triggerData).slice(0, 40) : ""),
          status: e.status === "completed" ? "success" : "failed",
          duration: e.duration || "",
          time: e.time || "",
        })));
      }
    } finally {
      setLoadingExecutions(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRefresh = () => {
    fetchAll();
    fetchExecutions();
  };

  const handleDeleteWorkflow = async (workflow: WorkflowItem) => {
    if (!workflow?.id) return;
    const res = await api.deleteWorkflow(workflow.id);
    if (res.success) {
      setWorkflows((prev) => prev.filter((w) => w.id !== workflow.id));
      if (selectedWorkflow?.id === workflow.id) {
        setSelectedWorkflow(null);
        setIsEditorOpen(false);
      }
    }
  };

  const handleToggleWorkflow = async (workflow: WorkflowItem, checked: boolean) => {
    if (!workflow?.id) return;
    const newStatus = checked ? 'active' : 'paused';
    const res = await api.updateWorkflow(workflow.id, { status: newStatus });
    if (res.success) {
      setWorkflows((prev) =>
        prev.map((w) => (w.id === workflow.id ? { ...w, status: newStatus } : w))
      );
      // Atualiza o contador de ativos
      setStatus((prev) => ({
        ...prev,
        active: checked ? prev.active + 1 : Math.max(0, prev.active - 1),
      }));
    }
  };

  const handleRerunLastFailed = async (workflow: WorkflowItem) => {
    if (!workflow?.id) return;
    try {
      const res = await api.rerunLastFailedWorkflow(workflow.id);
      if (res.success) {
        const data = res.data as { success?: boolean } | undefined;
        const executed = data?.success !== false;
        toast.success(
          executed ? "Última execução falhada reexecutada com sucesso" : "Reexecução concluída com avisos",
          { description: `${workflow.name} — usando os mesmos dados da execução que falhou.` }
        );
        fetchAll();
      } else {
        toast.error("Erro ao reexecutar", {
          description: res.error?.message || "Não foi possível reexecutar a última execução falhada.",
        });
      }
    } catch (e) {
      toast.error("Erro ao reexecutar", {
        description: e instanceof Error ? e.message : "Erro desconhecido.",
      });
    }
  };

  const handleExecuteWorkflow = async (workflow: WorkflowItem) => {
    if (!workflow?.id) return;
    try {
      const res = await api.executeWorkflow(workflow.id);
      if (res.success) {
        toast.success("Workflow executado", {
          description: `${workflow.name} foi executado manualmente.`,
        });
        fetchAll();
      } else {
        toast.error("Erro ao executar workflow", {
          description: res.error?.message || "Não foi possível executar o workflow.",
        });
      }
    } catch (e) {
      toast.error("Erro ao executar workflow", {
        description: e instanceof Error ? e.message : "Erro desconhecido.",
      });
    }
  };

  const triggersWithIcons = triggers.map((t) => ({ ...t, icon: typeof t.icon === "string" ? mapIcon(t.icon) : t.icon }));
  const actionsWithIcons = actions.map((a) => ({ ...a, icon: typeof a.icon === "string" ? mapIcon(a.icon) : a.icon }));

  const kpis = [
    { label: "Workflows Ativos", value: String(status.active), icon: GitBranch, change: "", color: "text-green-500" },
    { label: "Total Execuções", value: String(status.totalExecutions), icon: Play, change: "", color: "text-blue-500" },
    { label: "Workflows", value: String(status.total), icon: CheckCircle2, change: "", color: "text-emerald-500" },
    { label: "Taxa", value: status.totalExecutions > 0 ? "—" : "—", icon: Clock, change: "", color: "text-purple-500" },
  ];

  const getTriggerIcon = (triggerId: string) => {
    const trigger = triggersWithIcons.find((t) => t.id === triggerId);
    return trigger?.icon ?? Zap;
  };

  const getActionIcon = (actionId: string) => {
    const action = actionsWithIcons.find((a) => a.id === actionId);
    return action?.icon ?? Zap;
  };

  const filteredWorkflows = workflows.filter(
    (w) =>
      (w.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Workflow Automation
            </h1>
            <p className="text-muted-foreground mt-1">
              Automatize processos e crie fluxos inteligentes para seu sistema
            </p>
          </div>
          <Button onClick={() => setIsNewWorkflowOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Workflow
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-3xl font-bold mt-1">{kpi.value}</p>
                    <p className={`text-sm ${kpi.color} mt-1`}>{kpi.change}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-primary/10`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="workflows" className="space-y-4" onValueChange={(v) => v === "history" && fetchExecutions()}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="workflows" className="gap-2">
              <GitBranch className="h-4 w-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="triggers" className="gap-2">
              <Zap className="h-4 w-4" />
              Gatilhos
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-2">
              <Play className="h-4 w-4" />
              Ações
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                {error}
              </div>
            )}
            {loading && workflows.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">Carregando workflows...</div>
            ) : (
            <div className="grid gap-4">
              {filteredWorkflows.map((workflow) => {
                const TriggerIcon = getTriggerIcon(workflow.trigger);
                return (
                  <Card key={workflow.id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${workflow.status === 'active' ? 'bg-green-500/10' : 'bg-muted'}`}>
                            <TriggerIcon className={`h-6 w-6 ${workflow.status === 'active' ? 'text-green-500' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{workflow.name}</h3>
                              <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                                {workflow.status === 'active' ? 'Ativo' : 'Pausado'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{workflow.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Zap className="h-3 w-3" />
                                {workflow.triggerName}
                              </div>
                              <div className="flex items-center gap-1">
                                {(workflow.actions ?? []).map((actionId, index) => {
                                  const ActionIcon = getActionIcon(actionId);
                                  return (
                                    <div key={index} className="flex items-center">
                                      {index > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground mx-1" />}
                                      <div className="p-1 rounded bg-muted">
                                        <ActionIcon className="h-3 w-3 text-muted-foreground" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                          <div className="grid grid-cols-3 gap-6 text-center">
                            <div>
                              <p className="text-2xl font-bold">{(workflow.executions ?? 0).toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Execuções</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-green-500">{workflow.successRate ?? 0}%</p>
                              <p className="text-xs text-muted-foreground">Sucesso</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{workflow.lastRun || '—'}</p>
                              <p className="text-xs text-muted-foreground">Última exec.</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={workflow.status === 'active'}
                              onCheckedChange={(checked) => handleToggleWorkflow(workflow, checked)}
                            />
                            <Button variant="outline" size="icon" onClick={() => {
                              setSelectedWorkflow(workflow);
                              setIsEditorOpen(true);
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {workflow.hasFailed && (
                                  <DropdownMenuItem
                                    onClick={() => handleRerunLastFailed(workflow)}
                                    className="text-amber-600"
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Executar Novamente (última falha)
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleExecuteWorkflow(workflow)}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Executar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setWorkflowForHistory(workflow);
                                  setHistoryModalOpen(true);
                                }}>
                                  <History className="h-4 w-4 mr-2" />
                                  Histórico
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteWorkflow(workflow)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            )}
          </TabsContent>

          {/* Triggers Tab */}
          <TabsContent value="triggers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Gatilhos Disponíveis
                </CardTitle>
                <CardDescription>
                  Eventos que podem iniciar um workflow automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {triggersWithIcons.map((trigger) => (
                    <Card key={trigger.id} className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-yellow-500/10">
                            <trigger.icon className="h-5 w-5 text-yellow-500" />
                          </div>
                          <div>
                            <h4 className="font-medium">{trigger.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{trigger.description}</p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {trigger.category}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-blue-500" />
                  Ações Disponíveis
                </CardTitle>
                <CardDescription>
                  Ações que podem ser executadas nos workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {actionsWithIcons.map((action) => (
                    <Card key={action.id} className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <action.icon className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <h4 className="font-medium">{action.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {action.category}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Histórico de Execuções
                </CardTitle>
                <CardDescription>
                  Últimas execuções de workflows em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {loadingExecutions ? (
                    <div className="py-8 text-center text-muted-foreground">Carregando execuções...</div>
                  ) : executionHistory.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">Nenhuma execução registrada.</div>
                  ) : (
                  <div className="space-y-3">
                    {executionHistory.map((execution) => (
                      <div
                        key={execution.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                            execution.status === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'
                          }`}>
                            {execution.status === 'success' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{execution.workflow}</p>
                            <p className="text-sm text-muted-foreground">{execution.trigger}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-right">
                            <p className="font-medium">{execution.duration}</p>
                            <p className="text-muted-foreground">Duração</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{execution.time}</p>
                            <p className="text-muted-foreground">Horário</p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New Workflow Modal */}
        <NewWorkflowModal
          open={isNewWorkflowOpen}
          onOpenChange={setIsNewWorkflowOpen}
          triggers={triggersWithIcons}
          actions={actionsWithIcons}
          onCreated={() => {
            fetchAll();
            setIsNewWorkflowOpen(false);
          }}
        />

        {/* Workflow Editor Modal */}
        <WorkflowEditorModal
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          workflow={selectedWorkflow}
          triggers={triggersWithIcons}
          actions={actionsWithIcons}
          onSave={() => {
            fetchAll();
            setIsEditorOpen(false);
            setSelectedWorkflow(null);
          }}
        />

        {/* Histórico de Execuções do Workflow */}
        <WorkflowHistoryModal
          open={historyModalOpen}
          onOpenChange={(open) => {
            setHistoryModalOpen(open);
            if (!open) setWorkflowForHistory(null);
          }}
          workflow={workflowForHistory}
        />
      </div>
    </DashboardLayout>
  );
};

export default Workflow;
