import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  TrendingUp,
  GitBranch,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WorkflowStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WorkflowStats {
  total: number;
  active: number;
  paused: number;
  draft: number;
  totalExecutions: number;
  totalSuccess: number;
  totalFailures: number;
  failedExecutions: Array<{
    id: number;
    uuid: string;
    workflowId: number;
    workflowName: string;
    executionStatus: string;
    errorMessage: string | null;
    startedAt: string;
    completedAt: string | null;
  }>;
}

export function WorkflowStatusModal({ open, onOpenChange }: WorkflowStatusModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Não passar propertyId por enquanto (null = workflows globais)
      const response = await api.getWorkflowStatus(undefined);
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        toast.error("Erro ao carregar status dos workflows");
      }
    } catch (error: any) {
      console.error("Erro ao carregar status:", error);
      toast.error("Erro ao carregar status dos workflows");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const successRate =
    stats && stats.totalExecutions > 0
      ? ((stats.totalSuccess / stats.totalExecutions) * 100).toFixed(1)
      : "0.0";

  const failureRate =
    stats && stats.totalExecutions > 0
      ? ((stats.totalFailures / stats.totalExecutions) * 100).toFixed(1)
      : "0.0";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative px-6 py-5 border-b bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 flex-shrink-0">
          <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-purple-500">
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
            </svg>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            <Activity className="h-32 w-32 text-purple-500" />
          </div>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl shadow-lg bg-gradient-to-br from-purple-500 to-blue-500">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-purple-600">
                    Status dos Workflows
                  </DialogTitle>
                  <p className="text-sm font-normal text-purple-500 mt-1">
                    Monitore execuções, estatísticas e problemas dos workflows
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={loadData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : stats ? (
            <div className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="executions">Execuções</TabsTrigger>
                  <TabsTrigger value="issues">Problemas</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* KPIs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Workflows</CardTitle>
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stats.active} ativos, {stats.paused} pausados, {stats.draft} rascunhos
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Execuções</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalExecutions.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Todas as execuções desde o início
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{successRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stats.totalSuccess.toLocaleString()} execuções bem-sucedidas
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Falhas</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.totalFailures.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {failureRate}% de taxa de falha
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Status Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          Workflows Ativos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600">{stats.active}</div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Workflows em execução e monitoramento ativo
                        </p>
                        <Badge variant="outline" className="mt-4 bg-green-50 text-green-700 border-green-200">
                          Operacional
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-yellow-500" />
                          Workflows Pausados
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">{stats.paused}</div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Workflows temporariamente desativados
                        </p>
                        <Badge variant="outline" className="mt-4 bg-yellow-50 text-yellow-700 border-yellow-200">
                          Pausado
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <GitBranch className="h-5 w-5 text-gray-500" />
                          Rascunhos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-gray-600">{stats.draft}</div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Workflows em desenvolvimento, não executados
                        </p>
                        <Badge variant="outline" className="mt-4 bg-gray-50 text-gray-700 border-gray-200">
                          Rascunho
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Executions Tab */}
                <TabsContent value="executions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Estatísticas de Execução</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-green-900 dark:text-green-100">
                              Execuções Bem-Sucedidas
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                            {stats.totalSuccess.toLocaleString()}
                          </div>
                          <div className="text-sm text-green-600 dark:text-green-300 mt-1">
                            {successRate}% do total
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <span className="font-semibold text-red-900 dark:text-red-100">
                              Execuções com Falha
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                            {stats.totalFailures.toLocaleString()}
                          </div>
                          <div className="text-sm text-red-600 dark:text-red-300 mt-1">
                            {failureRate}% do total
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold text-blue-900 dark:text-blue-100">
                            Total de Execuções
                          </span>
                        </div>
                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                          {stats.totalExecutions.toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                          Desde o início do sistema
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Issues Tab */}
                <TabsContent value="issues" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Execuções com Problemas (Últimas 24h)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stats.failedExecutions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                          <p className="text-lg font-semibold">Nenhum problema encontrado!</p>
                          <p className="text-sm mt-2">
                            Todas as execuções dos últimos 24 horas foram bem-sucedidas.
                          </p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-4">
                            {stats.failedExecutions.map((execution) => (
                              <div
                                key={execution.id}
                                className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge
                                        variant="destructive"
                                        className={
                                          execution.executionStatus === "partial"
                                            ? "bg-yellow-500"
                                            : ""
                                        }
                                      >
                                        {execution.executionStatus === "partial"
                                          ? "Parcial"
                                          : "Falhou"}
                                      </Badge>
                                      <span className="font-semibold text-sm">
                                        {execution.workflowName}
                                      </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(execution.startedAt).toLocaleString("pt-BR")}
                                    </div>
                                  </div>
                                </div>
                                {execution.errorMessage && (
                                  <div className="mt-3 p-3 rounded bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800">
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                      <strong>Erro:</strong> {execution.errorMessage}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Nenhum dado disponível</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/50 flex-shrink-0">
          <div className="flex items-center justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
