import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Play,
  Search,
  Filter,
  RefreshCw,
  Download,
  ChevronRight,
  Code,
  FileText,
  Mail,
  MessageSquare,
  Send,
  Bell,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  Copy,
  Calendar,
  Timer,
  ArrowRight,
  Bug,
  Info,
  Server,
  Database,
  Webhook,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface StepError {
  code: string;
  message: string;
  details: string;
  stack?: string;
}

interface ExecutionStep {
  id: number;
  name: string;
  action: string;
  status: string;
  startedAt: string;
  completedAt: string;
  duration: string;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error?: StepError;
  warning?: string;
}

interface ExecutionTrigger {
  type: string;
  data: Record<string, unknown>;
}

interface Execution {
  id: string;
  status: string;
  startedAt: string;
  completedAt: string;
  duration: string;
  trigger: ExecutionTrigger;
  steps: ExecutionStep[];
  logs: { level: string; message: string; timestamp: string }[];
  errorMessage?: string;
}

interface WorkflowHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow: { id: string; name?: string } | null;
}

export function WorkflowHistoryModal({
  open,
  onOpenChange,
  workflow,
}: WorkflowHistoryModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [dateRange, setDateRange] = useState("7d");
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loadingExecutions, setLoadingExecutions] = useState(false);

  /** Mapeia resposta da API (workflow_executions) para o formato do modal */
  function mapApiExecutionToExecution(r: {
    id: string;
    status?: string;
    triggeredBy?: string;
    triggerData?: Record<string, unknown> | null;
    errorMessage?: string | null;
    startedAt?: string | null;
    completedAt?: string | null;
    duration?: string;
    durationMs?: number | null;
  }): Execution {
    const triggerData = r.triggerData && typeof r.triggerData === "object" ? r.triggerData : {};
    let duration = r.duration ?? "";
    if (!duration && r.durationMs != null) {
      const ms = Number(r.durationMs);
      duration = ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
    }
    const statusDisplay = r.status === "completed" ? "success" : r.status === "failed" ? "failed" : (r.status ?? "pending");
    const startedAt = r.startedAt ? String(r.startedAt) : "";
    const completedAt = r.completedAt ? String(r.completedAt) : "";
    const logs: { level: string; message: string; timestamp: string }[] = [];
    if (r.errorMessage) {
      logs.push({
        level: "error",
        message: r.errorMessage,
        timestamp: completedAt || startedAt,
      });
    }
    return {
      id: r.id,
      status: statusDisplay,
      startedAt,
      completedAt,
      duration: duration || "—",
      trigger: { type: r.triggeredBy ?? "unknown", data: triggerData },
      steps: [],
      logs,
      errorMessage: r.errorMessage ?? undefined,
    };
  }

  useEffect(() => {
    if (!open || !workflow?.id) {
      setExecutions([]);
      setSelectedExecution(null);
      return;
    }
    let cancelled = false;
    setLoadingExecutions(true);
    api
      .getWorkflowExecutions(workflow.id, 100)
      .then((res) => {
        if (cancelled) return;
        if (res.success && Array.isArray(res.data?.executions)) {
          const list = (res.data.executions as unknown[]).map((r) => mapApiExecutionToExecution(r as Parameters<typeof mapApiExecutionToExecution>[0]));
          setExecutions(list);
        } else {
          setExecutions([]);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Erro ao carregar histórico de execuções");
          setExecutions([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingExecutions(false);
      });
    return () => { cancelled = true; };
  }, [open, workflow?.id]);

  const handleRefresh = () => {
    if (!workflow?.id) return;
    setLoadingExecutions(true);
    api.getWorkflowExecutions(workflow.id, 100).then((res) => {
      if (res.success && Array.isArray(res.data?.executions)) {
        const list = (res.data.executions as unknown[]).map((r) => mapApiExecutionToExecution(r as Parameters<typeof mapApiExecutionToExecution>[0]));
        setExecutions(list);
      }
      setLoadingExecutions(false);
    }).catch(() => {
      toast.error("Erro ao atualizar histórico");
      setLoadingExecutions(false);
    });
  };

  const stats = (() => {
    const total = executions.length;
    const success = executions.filter((e) => e.status === "success").length;
    const failed = executions.filter((e) => e.status === "failed").length;
    const warning = executions.filter((e) => e.status === "warning").length;
    const successRate = total > 0 ? (success / total) * 100 : 0;
    const durationsMs = executions
      .map((e) => {
        const d = e.duration ?? "";
        const msMatch = d.match(/(\d+(?:\.\d+)?)\s*ms/);
        const sMatch = d.match(/(\d+(?:\.\d+)?)\s*s/);
        if (msMatch) return Number(msMatch[1]);
        if (sMatch) return Number(sMatch[1]) * 1000;
        return 0;
      })
      .filter((n) => n > 0);
    const avgMs = durationsMs.length ? durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length : 0;
    const avgDuration = avgMs < 1000 ? `${Math.round(avgMs)}ms` : `${(avgMs / 1000).toFixed(1)}s`;
    const lastExec = executions[0];
    const lastExecution = lastExec?.startedAt
      ? (() => {
          const d = new Date(lastExec.startedAt);
          const now = new Date();
          const diffMs = now.getTime() - d.getTime();
          if (diffMs < 60000) return "Agora";
          if (diffMs < 3600000) return "Há " + Math.floor(diffMs / 60000) + " min";
          if (diffMs < 86400000) return "Há " + Math.floor(diffMs / 3600000) + " h";
          return "Há " + Math.floor(diffMs / 86400000) + " dias";
        })()
      : "—";
    return { total, success, failed, warning, avgDuration, successRate, lastExecution };
  })();

  const filteredExecutions = executions.filter((exec) => {
    const data = exec.trigger?.data ?? {};
    const guestName = (data.guest as { firstName?: string; name?: string } | undefined)?.firstName ?? (data.guest as { name?: string } | undefined)?.name ?? data.guest_name ?? "";
    const reservationId = (data.reservation as { id?: string } | undefined)?.id ?? data.reservation_id ?? data.reservationNumber ?? "";
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchLower ||
      exec.id.toLowerCase().includes(searchLower) ||
      String(guestName).toLowerCase().includes(searchLower) ||
      String(reservationId).toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === "all" || exec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Sucesso</Badge>;
      case "failed":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Falhou</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Aviso</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const getLogLevelStyle = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-500 bg-red-500/10";
      case "warning":
        return "text-yellow-500 bg-yellow-500/10";
      case "success":
        return "text-green-500 bg-green-500/10";
      case "debug":
        return "text-purple-500 bg-purple-500/10";
      default:
        return "text-blue-500 bg-blue-500/10";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "send_email":
        return <Mail className="h-4 w-4" />;
      case "send_sms":
        return <MessageSquare className="h-4 w-4" />;
      case "send_whatsapp":
        return <Send className="h-4 w-4" />;
      case "push_notification":
        return <Bell className="h-4 w-4" />;
      case "add_points":
        return <Zap className="h-4 w-4" />;
      case "delay":
        return <Clock className="h-4 w-4" />;
      case "update_status":
        return <RefreshCw className="h-4 w-4" />;
      case "log_event":
        return <FileText className="h-4 w-4" />;
      case "webhook":
        return <Webhook className="h-4 w-4" />;
      case "update_database":
        return <Database className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header com gradiente */}
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border-b flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <History className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Histórico de Execuções
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {workflow?.name || "Workflow"} • Últimas execuções e logs detalhados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh} disabled={loadingExecutions}>
                <RefreshCw className={`h-4 w-4 ${loadingExecutions ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <Tabs defaultValue="executions" className="flex-1 min-h-0 flex flex-col">
            <div className="px-6 pt-4 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="executions" className="gap-2">
                  <Play className="h-4 w-4" />
                  Execuções
                </TabsTrigger>
                <TabsTrigger value="details" className="gap-2" disabled={!selectedExecution}>
                  <Eye className="h-4 w-4" />
                  Detalhes
                </TabsTrigger>
                <TabsTrigger value="errors" className="gap-2">
                  <Bug className="h-4 w-4" />
                  Erros
                </TabsTrigger>
                <TabsTrigger value="stats" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Estatísticas
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab: Execuções */}
            <TabsContent value="executions" className="flex-1 min-h-0 px-6 pb-6 mt-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* Filtros */}
                <div className="flex flex-col md:flex-row gap-4 py-4 flex-shrink-0">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por ID, hóspede ou reserva..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="success">Sucesso</SelectItem>
                      <SelectItem value="failed">Falhou</SelectItem>
                      <SelectItem value="warning">Aviso</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Última hora</SelectItem>
                      <SelectItem value="24h">Últimas 24h</SelectItem>
                      <SelectItem value="7d">Últimos 7 dias</SelectItem>
                      <SelectItem value="30d">Últimos 30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lista de Execuções */}
                <ScrollArea className="flex-1 min-h-0">
                  <div className="space-y-2 pr-4">
                    {loadingExecutions ? (
                      <div className="flex items-center justify-center py-12 text-muted-foreground">
                        <RefreshCw className="h-8 w-8 animate-spin mr-2" />
                        Carregando execuções...
                      </div>
                    ) : filteredExecutions.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        Nenhuma execução encontrada para este workflow.
                      </div>
                    ) : (
                    <>
                    {filteredExecutions.map((execution) => (
                      <Card
                        key={execution.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedExecution?.id === execution.id
                            ? "ring-2 ring-primary"
                            : ""
                        }`}
                        onClick={() => setSelectedExecution(execution)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-full ${
                                execution.status === "success"
                                  ? "bg-green-500/10"
                                  : execution.status === "failed"
                                  ? "bg-red-500/10"
                                  : "bg-yellow-500/10"
                              }`}>
                                {getStatusIcon(execution.status)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <code className="text-sm font-mono text-muted-foreground">
                                    {execution.id}
                                  </code>
                                  {getStatusBadge(execution.status)}
                                </div>
                                <p className="text-sm mt-1">
                                  <span className="text-muted-foreground">Trigger:</span>{" "}
                                  <span className="font-medium">{execution.trigger?.type ?? "—"}</span>
                                  {(() => {
                                    const d = execution.trigger?.data ?? {};
                                    const guestName = (d.guest as { firstName?: string; name?: string } | undefined)?.firstName ?? (d.guest as { name?: string } | undefined)?.name ?? d.guest_name;
                                    const resId = (d.reservation as { id?: string } | undefined)?.id ?? d.reservation_id ?? d.reservationNumber;
                                    const label = guestName || resId ? ` • ${guestName || resId}` : "";
                                    return label ? <span className="text-muted-foreground">{label}</span> : null;
                                  })()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <div className="flex items-center gap-1 text-sm">
                                  <Timer className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-medium">{execution.duration}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {execution.steps?.length ? `${execution.steps.length} ações` : "—"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {execution.startedAt ? (execution.startedAt.includes(" ") ? execution.startedAt.split(" ")[1] : execution.startedAt) : "—"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {execution.startedAt ? (execution.startedAt.includes(" ") ? execution.startedAt.split(" ")[0] : "") : "—"}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>

                          {/* Timeline de ações simplificada (vazio quando dados vêm só da API) */}
                          {(execution.steps?.length ?? 0) > 0 && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                            {execution.steps!.map((step, index) => (
                              <div key={step.id} className="flex items-center">
                                {index > 0 && (
                                  <ArrowRight className="h-3 w-3 text-muted-foreground mx-1" />
                                )}
                                <div className={`p-1.5 rounded ${
                                  step.status === "success"
                                    ? "bg-green-500/10"
                                    : step.status === "failed"
                                    ? "bg-red-500/10"
                                    : "bg-yellow-500/10"
                                }`}>
                                  {getActionIcon(step.action)}
                                </div>
                              </div>
                            ))}
                          </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    </>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            {/* Tab: Detalhes */}
            <TabsContent value="details" className="flex-1 min-h-0 px-6 pb-6 mt-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
              {selectedExecution ? (
                <ScrollArea className="flex-1 min-h-0">
                  <div className="space-y-6 pr-4 py-4">
                    {/* Resumo da Execução */}
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            Resumo da Execução
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Copy className="h-3 w-3" />
                              Copiar ID
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <ExternalLink className="h-3 w-3" />
                              Abrir Logs
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">ID</p>
                            <p className="font-mono text-sm">{selectedExecution.id}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Status</p>
                            <div className="mt-1">{getStatusBadge(selectedExecution.status)}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Duração</p>
                            <p className="font-medium">{selectedExecution.duration}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Ações</p>
                            <p className="font-medium">{selectedExecution.steps?.length ?? 0} executadas</p>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Dados do Trigger */}
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            Dados do Trigger
                          </h4>
                          <div className="bg-muted/30 rounded-lg p-3">
                            <pre className="text-xs font-mono overflow-x-auto">
                              {JSON.stringify(selectedExecution.trigger, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Timeline de Ações */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Activity className="h-5 w-5 text-primary" />
                          Timeline de Ações
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedExecution.steps?.length ? (
                        <Accordion type="multiple" className="w-full">
                          {selectedExecution.steps.map((step: ExecutionStep, index: number) => (
                            <AccordionItem key={step.id} value={`step-${step.id}`}>
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-4 w-full">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                      step.status === "success"
                                        ? "bg-green-500/10"
                                        : step.status === "failed"
                                        ? "bg-red-500/10"
                                        : "bg-yellow-500/10"
                                    }`}>
                                      {getActionIcon(step.action)}
                                    </div>
                                    <div className="text-left">
                                      <p className="font-medium">{step.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {step.startedAt} → {step.completedAt}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="ml-auto flex items-center gap-4 mr-4">
                                    <Badge variant="outline">{step.duration}</Badge>
                                    {getStatusBadge(step.status)}
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pl-14">
                                  {/* Input */}
                                  <div>
                                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                      <ArrowRight className="h-3 w-3" />
                                      Input
                                    </p>
                                    <div className="bg-muted/30 rounded-lg p-3">
                                      <pre className="text-xs font-mono overflow-x-auto">
                                        {JSON.stringify(step.input, null, 2)}
                                      </pre>
                                    </div>
                                  </div>

                                  {/* Output ou Error */}
                                  {step.error ? (
                                    <div>
                                      <p className="text-sm font-medium mb-2 flex items-center gap-2 text-red-500">
                                        <XCircle className="h-3 w-3" />
                                        Erro
                                      </p>
                                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                        <p className="text-sm font-medium text-red-500">{step.error.code}</p>
                                        <p className="text-sm mt-1">{step.error.message}</p>
                                        <p className="text-xs text-muted-foreground mt-2">{step.error.details}</p>
                                        {step.error.stack && (
                                          <pre className="text-xs font-mono mt-3 overflow-x-auto text-red-400">
                                            {step.error.stack}
                                          </pre>
                                        )}
                                      </div>
                                    </div>
                                  ) : step.warning ? (
                                    <div>
                                      <p className="text-sm font-medium mb-2 flex items-center gap-2 text-yellow-500">
                                        <AlertTriangle className="h-3 w-3" />
                                        Aviso
                                      </p>
                                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                                        <p className="text-sm">{step.warning}</p>
                                      </div>
                                      {step.output && (
                                        <div className="mt-3">
                                          <p className="text-sm font-medium mb-2">Output</p>
                                          <div className="bg-muted/30 rounded-lg p-3">
                                            <pre className="text-xs font-mono overflow-x-auto">
                                              {JSON.stringify(step.output, null, 2)}
                                            </pre>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="text-sm font-medium mb-2 flex items-center gap-2 text-green-500">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Output
                                      </p>
                                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                        <pre className="text-xs font-mono overflow-x-auto">
                                          {JSON.stringify(step.output, null, 2)}
                                        </pre>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                        ) : (
                          <p className="text-sm text-muted-foreground">Detalhes por passo não disponíveis para esta execução (dados vêm do histórico resumido).</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Logs */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Code className="h-5 w-5 text-primary" />
                          Logs de Execução
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs space-y-1 max-h-[300px] overflow-auto">
                          {selectedExecution.logs?.length ? selectedExecution.logs.map((log: { level: string; message: string; timestamp: string }, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <span className="text-muted-foreground w-24 flex-shrink-0">
                                {log.timestamp}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-xs uppercase w-16 text-center flex-shrink-0 ${getLogLevelStyle(log.level)}`}>
                                {log.level}
                              </span>
                              <span className={log.level === "error" ? "text-red-500" : ""}>
                                {log.message}
                              </span>
                            </div>
                          )) : (
                            <p className="text-muted-foreground">Nenhum log registrado para esta execução.</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              ) : (
                <div className="h-full flex items-center justify-center text-center py-12">
                  <div>
                    <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Selecione uma execução</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Clique em uma execução na lista para ver os detalhes
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab: Erros */}
            <TabsContent value="errors" className="flex-1 min-h-0 px-6 pb-6 mt-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-4 pr-4 py-4">
                  <Card className="border-red-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2 text-red-500">
                        <Bug className="h-5 w-5" />
                        Erros Recentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {executions
                          .filter((e) => e.status === "failed")
                          .map((execution) => {
                            const failedStep = execution.steps?.find((s) => s.status === "failed");
                            const message = failedStep?.error?.message ?? execution.errorMessage ?? "Erro desconhecido";
                            const details = failedStep?.error?.details ?? "";
                            return (
                              <div
                                key={execution.id}
                                className="p-4 rounded-lg border border-red-500/20 bg-red-500/5"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <code className="text-sm font-mono">{execution.id}</code>
                                      <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                                        {failedStep?.error?.code || "ERROR"}
                                      </Badge>
                                    </div>
                                    <p className="text-sm mt-2 font-medium">
                                      {message}
                                    </p>
                                    {details && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {details}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right text-sm">
                                    <p className="text-muted-foreground">{execution.startedAt}</p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="mt-2"
                                      onClick={() => setSelectedExecution(execution)}
                                    >
                                      Ver Detalhes
                                    </Button>
                                  </div>
                                </div>
                                {failedStep?.error?.stack && (
                                  <div className="mt-3 p-2 rounded bg-muted/50">
                                    <pre className="text-xs font-mono text-red-400 overflow-x-auto">
                                      {failedStep.error.stack}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2 text-yellow-500">
                        <AlertTriangle className="h-5 w-5" />
                        Avisos Recentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {executions
                          .filter((e) => e.status === "warning")
                          .map((execution) => {
                            const warningStep = execution.steps?.find((s) => s.status === "warning");
                            return (
                              <div
                                key={execution.id}
                                className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <code className="text-sm font-mono">{execution.id}</code>
                                      <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                        Aviso
                                      </Badge>
                                    </div>
                                    <p className="text-sm mt-2">{warningStep?.warning ?? execution.errorMessage ?? "—"}</p>
                                  </div>
                                  <div className="text-right text-sm">
                                    <p className="text-muted-foreground">{execution.startedAt}</p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="mt-2"
                                      onClick={() => setSelectedExecution(execution)}
                                    >
                                      Ver Detalhes
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Tab: Estatísticas */}
            <TabsContent value="stats" className="flex-1 min-h-0 px-6 pb-6 mt-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-6 pr-4 py-4">
                  {/* KPIs */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Play className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Total Execuções</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-500/10">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-500">{stats.successRate}%</p>
                            <p className="text-xs text-muted-foreground">Taxa de Sucesso</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-red-500/10">
                            <XCircle className="h-5 w-5 text-red-500" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
                            <p className="text-xs text-muted-foreground">Falhas</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-500/10">
                            <Timer className="h-5 w-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{stats.avgDuration}</p>
                            <p className="text-xs text-muted-foreground">Tempo Médio</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Distribuição por Status */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Distribuição por Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              Sucesso
                            </span>
                            <span className="text-sm font-medium">{stats.success} ({stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : "0"}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${(stats.success / stats.total) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              Avisos
                            </span>
                            <span className="text-sm font-medium">{stats.warning} ({stats.total > 0 ? ((stats.warning / stats.total) * 100).toFixed(1) : "0"}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-yellow-500 rounded-full"
                              style={{ width: `${stats.total > 0 ? (stats.warning / stats.total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-500" />
                              Falhas
                            </span>
                            <span className="text-sm font-medium">{stats.failed} ({((stats.failed / stats.total) * 100).toFixed(1)}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-red-500 rounded-full"
                              style={{ width: `${stats.total > 0 ? (stats.failed / stats.total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ações mais utilizadas */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Ações Mais Utilizadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ação</TableHead>
                            <TableHead className="text-right">Execuções</TableHead>
                            <TableHead className="text-right">Sucesso</TableHead>
                            <TableHead className="text-right">Tempo Médio</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-blue-500" />
                              Enviar E-mail
                            </TableCell>
                            <TableCell className="text-right">892</TableCell>
                            <TableCell className="text-right text-green-500">98.2%</TableCell>
                            <TableCell className="text-right">420ms</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="flex items-center gap-2">
                              <Send className="h-4 w-4 text-green-500" />
                              Enviar WhatsApp
                            </TableCell>
                            <TableCell className="text-right">654</TableCell>
                            <TableCell className="text-right text-green-500">96.8%</TableCell>
                            <TableCell className="text-right">380ms</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-purple-500" />
                              Enviar SMS
                            </TableCell>
                            <TableCell className="text-right">423</TableCell>
                            <TableCell className="text-right text-green-500">99.1%</TableCell>
                            <TableCell className="text-right">290ms</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-yellow-500" />
                              Adicionar Pontos
                            </TableCell>
                            <TableCell className="text-right">312</TableCell>
                            <TableCell className="text-right text-green-500">100%</TableCell>
                            <TableCell className="text-right">180ms</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="flex items-center gap-2">
                              <Bell className="h-4 w-4 text-orange-500" />
                              Notificação Push
                            </TableCell>
                            <TableCell className="text-right">287</TableCell>
                            <TableCell className="text-right text-green-500">97.5%</TableCell>
                            <TableCell className="text-right">250ms</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}