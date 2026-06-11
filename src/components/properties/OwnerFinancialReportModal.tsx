import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  FileText,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  User,
  Percent,
  CreditCard,
  Wallet,
  CircleDollarSign,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
} from "lucide-react";

interface OwnerFinancialReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owner: {
    name: string;
    email: string;
    phone: string;
    commission: number;
  } | null;
  propertyName: string;
}

const mockFinancialData = {
  summary: {
    totalRevenue: 125800,
    ownerShare: 94350,
    operatorShare: 31450,
    pendingPayment: 15600,
    lastPayment: 28750,
    occupancyRate: 85,
  },
  monthlyRevenue: [
    { month: "Jan", revenue: 18500, occupancy: 78 },
    { month: "Fev", revenue: 21200, occupancy: 82 },
    { month: "Mar", revenue: 19800, occupancy: 80 },
    { month: "Abr", revenue: 22500, occupancy: 88 },
    { month: "Mai", revenue: 24300, occupancy: 92 },
    { month: "Jun", revenue: 19500, occupancy: 75 },
  ],
  transactions: [
    { id: 1, date: "2024-06-15", type: "revenue", description: "Reserva #R-2024-0892", amount: 2800 },
    { id: 2, date: "2024-06-14", type: "revenue", description: "Reserva #R-2024-0891", amount: 3500 },
    { id: 3, date: "2024-06-12", type: "payment", description: "Repasse mensal Mai/2024", amount: -28750 },
    { id: 4, date: "2024-06-10", type: "revenue", description: "Reserva #R-2024-0885", amount: 4200 },
    { id: 5, date: "2024-06-08", type: "expense", description: "Manutenção AC", amount: -450 },
    { id: 6, date: "2024-06-05", type: "revenue", description: "Reserva #R-2024-0878", amount: 2100 },
  ],
  pendingPayments: [
    { id: 1, period: "Jun/2024", amount: 15600, dueDate: "2024-07-10" },
  ],
};

export default function OwnerFinancialReportModal({ 
  open, 
  onOpenChange, 
  owner,
  propertyName 
}: OwnerFinancialReportModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const handleExportReport = () => {
    toast.success("Relatório exportado com sucesso!");
  };

  const handleSendReport = () => {
    toast.success(`Relatório enviado para ${owner?.email}`);
  };

  if (!owner) return null;

  const maxRevenue = Math.max(...mockFinancialData.monthlyRevenue.map(m => m.revenue));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 bg-gradient-to-br from-background via-background to-emerald-500/5 border-emerald-500/20 overflow-hidden">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-teal-500/20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
          
          <DialogHeader className="relative p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                    Relatório Financeiro
                  </DialogTitle>
                  <p className="text-muted-foreground mt-1">
                    Proprietário: {owner.name}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSendReport}>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 max-h-[calc(90vh-200px)]">
          <div className="p-6 pt-2 space-y-6">
            {/* Owner Info Card */}
            <Card className="bg-gradient-to-br from-primary/5 to-purple-500/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                      <User className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{owner.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {owner.email}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {owner.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Propriedade</p>
                    <p className="font-medium">{propertyName}</p>
                    <Badge className="bg-emerald-500/20 text-emerald-400 mt-1">
                      <Percent className="h-3 w-3 mr-1" />
                      {owner.commission}% comissão
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <CircleDollarSign className="h-5 w-5 text-emerald-400" />
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +12%
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">
                    R$ {(mockFinancialData.summary.totalRevenue / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-muted-foreground">Receita Total</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Wallet className="h-5 w-5 text-blue-400" />
                    <span className="text-xs text-muted-foreground">{100 - owner.commission}%</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">
                    R$ {(mockFinancialData.summary.ownerShare / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-muted-foreground">Parte Proprietário</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="h-5 w-5 text-amber-400" />
                    <Badge className="bg-amber-500/20 text-amber-400 text-xs">Pendente</Badge>
                  </div>
                  <p className="text-2xl font-bold text-amber-400">
                    R$ {(mockFinancialData.summary.pendingPayment / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-muted-foreground">A Receber</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-purple-400">
                    {mockFinancialData.summary.occupancyRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">Taxa de Ocupação</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-card/50 border border-border/50">
                <TabsTrigger value="overview">
                  <PieChart className="h-4 w-4 mr-2" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="transactions">
                  <FileText className="h-4 w-4 mr-2" />
                  Transações
                </TabsTrigger>
                <TabsTrigger value="payments">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pagamentos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Monthly Revenue Chart */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Receita Mensal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockFinancialData.monthlyRevenue.map((month) => (
                          <div key={month.month} className="flex items-center gap-3">
                            <span className="w-8 text-xs text-muted-foreground">{month.month}</span>
                            <div className="flex-1">
                              <div className="h-6 bg-muted/30 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-end pr-2"
                                  style={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
                                >
                                  <span className="text-xs font-medium text-white">
                                    R$ {(month.revenue / 1000).toFixed(1)}k
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs w-12 justify-center">
                              {month.occupancy}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Revenue Split */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-primary" />
                        Divisão de Receita
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-center py-4">
                          <div className="relative">
                            <div className="w-32 h-32 rounded-full border-8 border-emerald-500/30 flex items-center justify-center">
                              <div className="text-center">
                                <p className="text-2xl font-bold">{100 - owner.commission}%</p>
                                <p className="text-xs text-muted-foreground">Proprietário</p>
                              </div>
                            </div>
                            <div 
                              className="absolute inset-0 rounded-full border-8 border-transparent border-t-primary border-r-primary"
                              style={{ 
                                transform: `rotate(${((100 - owner.commission) / 100) * 360}deg)`,
                                transition: 'transform 1s ease-out'
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-emerald-500/10 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-3 h-3 rounded-full bg-emerald-500" />
                              <span className="text-xs">Proprietário</span>
                            </div>
                            <p className="font-bold text-emerald-400">
                              R$ {mockFinancialData.summary.ownerShare.toLocaleString("pt-BR")}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-3 h-3 rounded-full bg-primary" />
                              <span className="text-xs">Operador</span>
                            </div>
                            <p className="font-bold text-primary">
                              R$ {mockFinancialData.summary.operatorShare.toLocaleString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="transactions" className="mt-4">
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {mockFinancialData.transactions.map((tx) => (
                        <div 
                          key={tx.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              tx.type === "revenue" 
                                ? "bg-emerald-500/20" 
                                : tx.type === "payment"
                                  ? "bg-blue-500/20"
                                  : "bg-red-500/20"
                            }`}>
                              {tx.type === "revenue" ? (
                                <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                              ) : tx.type === "payment" ? (
                                <CreditCard className="h-4 w-4 text-blue-400" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{tx.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(tx.date).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                          <span className={`font-bold ${
                            tx.amount > 0 ? "text-emerald-400" : "text-red-400"
                          }`}>
                            {tx.amount > 0 ? "+" : ""}R$ {Math.abs(tx.amount).toLocaleString("pt-BR")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payments" className="mt-4">
                <div className="space-y-4">
                  {/* Pending Payments */}
                  <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-400" />
                        Pagamentos Pendentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {mockFinancialData.pendingPayments.map((payment) => (
                        <div 
                          key={payment.id}
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">Período: {payment.period}</p>
                            <p className="text-sm text-muted-foreground">
                              Vencimento: {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-amber-400">
                              R$ {payment.amount.toLocaleString("pt-BR")}
                            </p>
                            <Button size="sm" className="mt-2 bg-amber-500 hover:bg-amber-600">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pagar Agora
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Last Payment */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Último Pagamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-lg">
                        <div>
                          <p className="font-medium">Período: Mai/2024</p>
                          <p className="text-sm text-muted-foreground">
                            Pago em: 12/06/2024
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-400">
                            R$ {mockFinancialData.summary.lastPayment.toLocaleString("pt-BR")}
                          </p>
                          <Badge className="bg-emerald-500/20 text-emerald-400 mt-1">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Confirmado
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t border-border/50 bg-muted/20">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
