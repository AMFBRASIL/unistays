import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Moon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  DollarSign,
  CreditCard,
  Banknote,
  Receipt,
  FileText,
  Play,
  Pause,
  RotateCcw,
  Download,
  Printer,
  Calendar,
  BedDouble,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCheck,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditTask {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "completed" | "error" | "warning";
  progress?: number;
  details?: string;
}

const auditTasks: AuditTask[] = [
  { id: "1", name: "Verificar Check-outs Pendentes", description: "Identificar hóspedes que não fizeram checkout", status: "completed", details: "2 checkouts pendentes identificados" },
  { id: "2", name: "Reconciliar Pagamentos", description: "Verificar todas as transações do dia", status: "completed", details: "R$ 45.890,00 reconciliados" },
  { id: "3", name: "Aplicar No-Shows", description: "Marcar reservas não confirmadas como no-show", status: "completed", details: "3 no-shows registrados" },
  { id: "4", name: "Calcular Tarifas Automáticas", description: "Aplicar tarifas do dia seguinte", status: "running", progress: 65 },
  { id: "5", name: "Gerar Lançamentos Diários", description: "Criar lançamentos de diárias e extras", status: "pending" },
  { id: "6", name: "Verificar Discrepâncias", description: "Identificar diferenças de caixa", status: "pending" },
  { id: "7", name: "Gerar Relatório DRE", description: "Demonstrativo de resultado do dia", status: "pending" },
  { id: "8", name: "Backup Diário", description: "Realizar backup dos dados do dia", status: "pending" },
];

const paymentSummary = [
  { method: "Cartão de Crédito", icon: CreditCard, amount: 28450.00, transactions: 45, color: "from-blue-500 to-cyan-500" },
  { method: "Cartão de Débito", icon: CreditCard, amount: 8920.00, transactions: 23, color: "from-green-500 to-emerald-500" },
  { method: "PIX", icon: Banknote, amount: 12340.00, transactions: 38, color: "from-purple-500 to-pink-500" },
  { method: "Dinheiro", icon: DollarSign, amount: 5680.00, transactions: 12, color: "from-amber-500 to-orange-500" },
  { method: "Faturado", icon: FileText, amount: 15200.00, transactions: 8, color: "from-slate-500 to-gray-500" },
];

const discrepancies = [
  { id: 1, type: "warning", description: "Diferença de R$ 45,00 no fechamento do caixa 01", time: "18:45" },
  { id: 2, type: "error", description: "Pagamento não confirmado - Reserva #12847", time: "20:30" },
  { id: 3, type: "warning", description: "Consumo não lançado - Quarto 205", time: "21:15" },
];

export default function NightAudit() {
  const [auditStatus, setAuditStatus] = useState<"idle" | "running" | "paused" | "completed">("idle");
  const [tasks, setTasks] = useState(auditTasks);

  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const totalTasks = tasks.length;
  const overallProgress = (completedTasks / totalTasks) * 100;

  const totalRevenue = paymentSummary.reduce((acc, p) => acc + p.amount, 0);

  const getStatusIcon = (status: AuditTask["status"]) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "running": return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case "error": return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning": return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const startAudit = () => {
    setAuditStatus("running");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Moon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Auditoria Noturna</h1>
              <p className="text-muted-foreground">Fechamento diário e reconciliação de caixa</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">15/12/2024</span>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button variant="outline" className="gap-2">
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
            {auditStatus === "idle" && (
              <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700" onClick={startAudit}>
                <Play className="w-4 h-4" />
                Iniciar Auditoria
              </Button>
            )}
            {auditStatus === "running" && (
              <Button variant="outline" className="gap-2" onClick={() => setAuditStatus("paused")}>
                <Pause className="w-4 h-4" />
                Pausar
              </Button>
            )}
            {auditStatus === "paused" && (
              <Button className="gap-2" onClick={() => setAuditStatus("running")}>
                <Play className="w-4 h-4" />
                Continuar
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita do Dia</p>
                  <p className="text-2xl font-bold text-emerald-500">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Check-ins Hoje</p>
                  <p className="text-2xl font-bold text-blue-500">24</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Check-outs Hoje</p>
                  <p className="text-2xl font-bold text-purple-500">18</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <BedDouble className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transações</p>
                  <p className="text-2xl font-bold text-amber-500">126</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/5 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendências</p>
                  <p className="text-2xl font-bold text-red-500">3</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Audit Tasks */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCheck className="w-5 h-5 text-primary" />
                    Tarefas da Auditoria
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{completedTasks}/{totalTasks} concluídas</span>
                    <Badge variant="outline" className={cn(
                      auditStatus === "completed" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                      auditStatus === "running" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                      auditStatus === "paused" && "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {auditStatus === "idle" ? "Aguardando" : auditStatus === "running" ? "Em Execução" : auditStatus === "paused" ? "Pausado" : "Concluído"}
                    </Badge>
                  </div>
                </div>
                <Progress value={overallProgress} className="h-2 mt-4" />
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {tasks.map((task, index) => (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border transition-all",
                          task.status === "completed" && "bg-emerald-500/5 border-emerald-500/20",
                          task.status === "running" && "bg-blue-500/5 border-blue-500/20",
                          task.status === "error" && "bg-red-500/5 border-red-500/20",
                          task.status === "warning" && "bg-amber-500/5 border-amber-500/20",
                          task.status === "pending" && "bg-card border-border"
                        )}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                          {index + 1}
                        </div>
                        {getStatusIcon(task.status)}
                        <div className="flex-1">
                          <p className="font-medium">{task.name}</p>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          {task.details && (
                            <p className="text-xs text-primary mt-1">{task.details}</p>
                          )}
                          {task.progress !== undefined && (
                            <Progress value={task.progress} className="h-1 mt-2" />
                          )}
                        </div>
                        {task.status === "pending" && (
                          <Button variant="ghost" size="sm">
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        {task.status === "error" && (
                          <Button variant="ghost" size="sm">
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Resumo de Pagamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paymentSummary.map((payment) => (
                    <div
                      key={payment.method}
                      className="p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", payment.color)}>
                          <payment.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{payment.method}</p>
                          <p className="text-xs text-muted-foreground">{payment.transactions} transações</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold">R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Discrepancies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Discrepâncias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {discrepancies.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-3 rounded-lg border",
                        item.type === "error" ? "bg-red-500/5 border-red-500/20" : "bg-amber-500/5 border-amber-500/20"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {item.type === "error" ? (
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm">{item.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 gap-2">
                  Ver Todas
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="w-4 h-4" />
                  Gerar Relatório DRE
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Receipt className="w-4 h-4" />
                  Imprimir Fechamento
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Download className="w-4 h-4" />
                  Exportar Movimentações
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reprocessar Auditoria
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
