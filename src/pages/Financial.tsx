import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewTransactionModal } from "@/components/financial/NewTransactionModal";
import { AllTransactionsModal } from "@/components/financial/AllTransactionsModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Filter,
  Search,
  PieChart,
  BarChart3,
  Receipt,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Building2,
  Users,
  Plane,
  Globe,
  Banknote,
  CircleDollarSign,
  Target,
  Activity
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";

interface FinancialTransaction {
  id?: number;
  type?: string;
  description?: string;
  amount?: number;
  status?: string;
  paymentDate?: string;
  dueDate?: string;
  createdAt?: string;
  created_at?: string;
  channel?: string;
  paymentMethodName?: string;
  paymentMethod?: string;
  categoryName?: string;
  category?: string;
  propertyName?: string;
  supplierName?: string;
  supplier?: string;
  transactionNumber?: string;
  date?: string;
  notes?: string;
}

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingReceivable: number;
  pendingPayable: number;
  pendingCount: number;
}

const Financial = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("month");
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [isAllTransactionsModalOpen, setIsAllTransactionsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);

  // Get date range based on periodFilter
  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    switch (periodFilter) {
      case "today":
        start.setHours(0, 0, 0, 0);
        break;
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "month":
        start.setMonth(end.getMonth() - 1);
        break;
      case "quarter":
        start.setMonth(end.getMonth() - 3);
        break;
      case "year":
        start.setFullYear(end.getFullYear() - 1);
        break;
    }
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  }, [periodFilter]);

  // Fetch Stats
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['financial-stats', dateRange],
    queryFn: () => api.getFinancialStats(dateRange),
  });

  // Fetch Transactions (com filtro de período para a página principal)
  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions', dateRange, searchTerm],
    queryFn: () => api.getTransactions({ ...dateRange, search: searchTerm }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] });
      toast.success("Transação excluída com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir transação");
    }
  });

  const summary: FinancialSummary = (statsData?.data?.summary as FinancialSummary) || {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingReceivable: 0,
    pendingPayable: 0,
    pendingCount: 0
  };

  const chartData = statsData?.data?.chartData || [];
  const transactions = useMemo(
    () => (transactionsData?.data?.transactions || []) as FinancialTransaction[],
    [transactionsData?.data?.transactions]
  );

  // Modal: mesmos dados da tela (transactions), últimas 50 por createdAt
  const transactionsForModal = useMemo(() => {
    const list = [...(transactions || [])];
    return list
      .sort((a, b) => {
        const getCreatedAt = (t: FinancialTransaction) => t.createdAt ?? t.created_at;
        const rawA = getCreatedAt(a);
        const rawB = getCreatedAt(b);
        const timeA = rawA ? new Date(rawA).getTime() : 0;
        const timeB = rawB ? new Date(rawB).getTime() : 0;
        const diff = timeB - timeA;
        if (diff !== 0) return diff;
        return (b.id ?? 0) - (a.id ?? 0);
      })
      .slice(0, 50);
  }, [transactions]);

  const normalizedTransactionsForModal = useMemo(() => {
    return transactionsForModal.map((t: FinancialTransaction) => {
      const paymentDate = t.paymentDate ?? t.dueDate ?? t.createdAt ?? t.created_at;
      const dateForDisplay = t.date ?? (paymentDate ? format(new Date(paymentDate), 'dd/MM/yyyy') : '-');
      return {
        id: t.id ?? 0,
        type: t.type ?? 'income',
        description: t.description ?? '',
        amount: Number(t.amount ?? 0),
        status: t.status ?? 'pending',
        paymentDate: paymentDate ?? '',
        date: dateForDisplay,
        transactionNumber: t.transactionNumber ?? `TXN-${t.id ?? ''}`,
        categoryName: t.categoryName,
        category: t.category,
        propertyName: t.propertyName,
        notes: t.notes,
        channel: t.channel,
      };
    });
  }, [transactionsForModal]);

  // Transações Recentes: ordenar pela data de criação (created_at) - mais novos em cima
  const recentTransactions = useMemo(() => {
    const list = [...(transactions || [])];
    return list
      .sort((a, b) => {
        const getCreatedAt = (t: FinancialTransaction) =>
          t.createdAt ?? t.created_at;
        const rawA = getCreatedAt(a);
        const rawB = getCreatedAt(b);
        const timeA = rawA ? new Date(rawA).getTime() : 0;
        const timeB = rawB ? new Date(rawB).getTime() : 0;
        const diff = timeB - timeA;
        if (diff !== 0) return diff;
        return (b.id ?? 0) - (a.id ?? 0);
      })
      .slice(0, 5);
  }, [transactions]);

  const channelData = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    transactions.filter((t) => t.type === 'income').forEach((t) => {
      const channel = t.channel || 'Direto';
      counts[channel] = (counts[channel] || 0) + Number(t.amount);
      total += Number(t.amount);
    });

    if (total === 0) return [];

    const colors = ["#3b82f6", "#10b981", "#f43f5e", "#f59e0b", "#8b5cf6"];
    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value: Math.round((value / total) * 100),
      color: colors[index % colors.length]
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const paymentMethodsData = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    transactions.forEach((t) => {
      const method = t.paymentMethodName || t.paymentMethod || 'Não informado';
      counts[method] = (counts[method] || 0) + 1;
      total += 1;
    });

    if (total === 0) return [];

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value: Math.round((value / total) * 100)
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Contas a Pagar e Receber
  const accountsPayable = transactions.filter((t) => t.type === 'expense' && t.status === 'pending');
  const accountsReceivable = transactions.filter((t) => t.type === 'income' && t.status === 'pending');

  const payableStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const pending = accountsPayable.reduce((s, t) => s + Number(t.amount || 0), 0);
    const overdue = accountsPayable
      .filter((t) => t.dueDate && new Date(t.dueDate) < today)
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const paidThisMonth = transactions
      .filter((t) => t.type === 'expense' && t.status === 'completed' && t.paymentDate && new Date(t.paymentDate) >= startOfMonth)
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    return { pending, overdue, paidThisMonth };
  }, [accountsPayable, transactions]);

  const receivableStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const pending = accountsReceivable.reduce((s, t) => s + Number(t.amount || 0), 0);
    const overdue = accountsReceivable
      .filter((t) => t.dueDate && new Date(t.dueDate) < today)
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const receivedThisMonth = transactions
      .filter((t) => t.type === 'income' && t.status === 'completed' && t.paymentDate && new Date(t.paymentDate) >= startOfMonth)
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    return { pending, overdue, receivedThisMonth };
  }, [accountsReceivable, transactions]);

  // Métricas rápidas (ADR, RevPAR etc - calculadas a partir dos dados disponíveis)
  const quickMetrics = useMemo(() => {
    const incomeCompleted = transactions.filter((t) => t.type === 'income' && t.status === 'completed');
    const totalRevenue = incomeCompleted.reduce((s, t) => s + Number(t.amount || 0), 0);
    const count = incomeCompleted.length;
    const ticketMedio = count > 0 ? totalRevenue / count : 0;
    return {
      adr: 0, // Requer dados de noites/quartos - não disponível em transactions
      revpar: 0,
      ticketMedio,
      ocupacao: 0 // Requer dados de occupancy
    };
  }, [transactions]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Pago
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1">
            <Clock className="h-3 w-3" />
            Pendente
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1">
            <AlertCircle className="h-3 w-3" />
            Vencido
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "Booking.com":
        return <Globe className="h-4 w-4 text-blue-400" />;
      case "Airbnb":
        return <Building2 className="h-4 w-4 text-rose-400" />;
      case "Expedia":
        return <Plane className="h-4 w-4 text-amber-400" />;
      case "Direto":
        return <Users className="h-4 w-4 text-emerald-400" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Gestão Financeira
            </h1>
            <p className="text-muted-foreground mt-1">
              Controle completo de receitas, despesas e fluxo de caixa
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[140px] bg-card/50 border-border/50">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Este Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button
              onClick={() => setIsNewTransactionModalOpen(true)}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              <Receipt className="h-4 w-4" />
              Nova Transação
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue Card */}
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-0 gap-1">
                  Ativo
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-3xl font-bold text-emerald-400">
                  R$ {summary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">No período selecionado</p>
            </CardContent>
          </Card>

          {/* Expenses Card */}
          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <TrendingDown className="h-6 w-6 text-red-400" />
                </div>
                <Badge className="bg-red-500/20 text-red-400 border-0 gap-1">
                  Ativo
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Despesas Total</p>
                <p className="text-3xl font-bold text-red-400">
                  R$ {summary.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">No período selecionado</p>
            </CardContent>
          </Card>

          {/* Profit Card */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <CircleDollarSign className="h-6 w-6 text-blue-400" />
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-0 gap-1">
                  {summary.totalRevenue > 0 ? ((summary.netProfit / summary.totalRevenue) * 100).toFixed(1) : "0"}% margem
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                <p className="text-3xl font-bold text-blue-400">
                  R$ {summary.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Saldo final do período</p>
            </CardContent>
          </Card>

          {/* Pending Card */}
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <Clock className="h-6 w-6 text-amber-400" />
                </div>
                <Badge className="bg-amber-500/20 text-amber-400 border-0">
                  {summary.pendingCount} pendentes
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">A Receber Pendente</p>
                <p className="text-3xl font-bold text-amber-400">
                  R$ {summary.pendingReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Total em aberto</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card/50 border border-border/50 p-1 h-auto">
            <TabsTrigger
              value="overview"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20"
            >
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20"
            >
              <Receipt className="h-4 w-4" />
              Transações
            </TabsTrigger>
            <TabsTrigger
              value="payable"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20"
            >
              <ArrowDownRight className="h-4 w-4" />
              Contas a Pagar
            </TabsTrigger>
            <TabsTrigger
              value="receivable"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20"
            >
              <ArrowUpRight className="h-4 w-4" />
              Contas a Receber
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20"
            >
              <FileText className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <Card className="lg:col-span-2 bg-card/50 border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Fluxo de Caixa</CardTitle>
                    <p className="text-sm text-muted-foreground">Receitas vs Despesas vs Lucro</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground">Receita</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-muted-foreground">Despesas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-muted-foreground">Lucro</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `${value / 1000}k`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          formatter={(value: number) => [`R$ ${value.toLocaleString()}`, '']}
                        />
                        <Area type="monotone" dataKey="receita" stroke="#10b981" fillOpacity={1} fill="url(#colorReceita)" strokeWidth={2} />
                        <Area type="monotone" dataKey="despesas" stroke="#ef4444" fillOpacity={1} fill="url(#colorDespesas)" strokeWidth={2} />
                        <Area type="monotone" dataKey="lucro" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLucro)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue by Channel */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Receita por Canal</CardTitle>
                  <p className="text-sm text-muted-foreground">Distribuição de vendas</p>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={channelData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {channelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          formatter={(value: number) => [`${value}%`, '']}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {channelData.map((channel, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.color }} />
                          <span className="text-muted-foreground">{channel.name}</span>
                        </div>
                        <span className="font-medium">{channel.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Methods */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-purple-400" />
                    Formas de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={paymentMethodsData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `${value}%`} />
                        <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          formatter={(value: number) => [`${value}%`, '']}
                        />
                        <Bar dataKey="value" fill="url(#purpleGradient)" radius={[0, 4, 4, 0]} />
                        <defs>
                          <linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#a78bfa" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-cyan-400" />
                    Métricas Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center gap-2 text-emerald-400 mb-2">
                        <Target className="h-4 w-4" />
                        <span className="text-sm font-medium">ADR</span>
                      </div>
                      <p className="text-2xl font-bold">{quickMetrics.adr > 0 ? `R$ ${quickMetrics.adr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "-"}</p>
                      <p className="text-xs text-muted-foreground">Diária Média (requer dados de hospedagem)</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                      <div className="flex items-center gap-2 text-blue-400 mb-2">
                        <Banknote className="h-4 w-4" />
                        <span className="text-sm font-medium">RevPAR</span>
                      </div>
                      <p className="text-2xl font-bold">{quickMetrics.revpar > 0 ? `R$ ${quickMetrics.revpar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "-"}</p>
                      <p className="text-xs text-muted-foreground">Receita por Quarto</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                      <div className="flex items-center gap-2 text-purple-400 mb-2">
                        <Wallet className="h-4 w-4" />
                        <span className="text-sm font-medium">Ticket Médio</span>
                      </div>
                      <p className="text-2xl font-bold">R$ {quickMetrics.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-xs text-muted-foreground">Por transação de receita</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                      <div className="flex items-center gap-2 text-amber-400 mb-2">
                        <PieChart className="h-4 w-4" />
                        <span className="text-sm font-medium">Ocupação</span>
                      </div>
                      <p className="text-2xl font-bold">{quickMetrics.ocupacao > 0 ? `${quickMetrics.ocupacao}%` : "-"}</p>
                      <p className="text-xs text-muted-foreground">Média do Mês</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Transações Recentes</CardTitle>
                  <p className="text-sm text-muted-foreground">Últimas movimentações financeiras</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsAllTransactionsModalOpen(true)}
                >
                  Ver todas
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.map((transaction: FinancialTransaction) => {
                    const isIncome = transaction.type === 'income';
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isIncome
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                            }`}>
                            {isIncome ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{transaction.description}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{transaction.categoryName || transaction.category || "-"}</span>
                              {transaction.propertyName && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    <span>{transaction.propertyName}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          {getStatusBadge(transaction.status ?? 'pending')}
                          <div>
                            <p className={`font-semibold ${isIncome ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                              {isIncome ? '+' : '-'} R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {transaction.date ?? (transaction.paymentDate ? format(new Date(transaction.paymentDate), 'dd/MM/yyyy') : '-')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-semibold">Todas as Transações</CardTitle>
                    <p className="text-sm text-muted-foreground">Histórico completo de movimentações</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar transações..."
                        className="pl-9 w-[250px] bg-muted/30 border-border/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction: FinancialTransaction) => {
                      const isIncome = transaction.type === 'income';

                      return (
                        <TableRow key={transaction.id} className="border-border/50 hover:bg-muted/30">
                          <TableCell>
                            <div className={`p-2 rounded-lg w-fit ${isIncome
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                              }`}>
                              {isIncome ? (
                                <ArrowUpRight className="h-4 w-4" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{transaction.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-muted/30">
                              {transaction.categoryName || transaction.category || "-"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {transaction.channel !== "-" ? (
                              <div className="flex items-center gap-2">
                                {getChannelIcon(transaction.channel)}
                                <span className="text-sm">{transaction.channel}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{transaction.date}</TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell className={`text-right font-semibold ${isIncome ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                            {isIncome ? '+' : '-'} R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accounts Payable Tab */}
          <TabsContent value="payable" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/20 rounded-xl">
                      <Clock className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pendentes</p>
                      <p className="text-2xl font-bold text-amber-400">R$ {payableStats.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-500/20 rounded-xl">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vencidas</p>
                      <p className="text-2xl font-bold text-red-400">R$ {payableStats.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pagas (mês)</p>
                      <p className="text-2xl font-bold text-emerald-400">R$ {payableStats.paidThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Contas a Pagar</CardTitle>
                  <p className="text-sm text-muted-foreground">Compromissos com fornecedores</p>
                </div>
                <Button className="gap-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600">
                  <DollarSign className="h-4 w-4" />
                  Nova Conta
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountsPayable.map((account: FinancialTransaction) => (
                      <TableRow key={account.id} className="border-border/50 hover:bg-muted/30">
                        <TableCell className="font-medium">{account.supplierName || account.supplier || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{account.description ?? ""}</TableCell>
                        <TableCell>{account.dueDate ? format(new Date(account.dueDate), 'dd/MM/yyyy') : "-"}</TableCell>
                        <TableCell>{getStatusBadge(account.status ?? 'pending')}</TableCell>
                        <TableCell className="text-right font-semibold text-red-400">
                          R$ {Number(account.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          {account.status !== 'completed' && account.status !== 'paid' && (
                            <Button size="sm" variant="outline" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Pagar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accounts Receivable Tab */}
          <TabsContent value="receivable" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/20 rounded-xl">
                      <Clock className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">A Receber</p>
                      <p className="text-2xl font-bold text-amber-400">R$ {receivableStats.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-500/20 rounded-xl">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Inadimplente</p>
                      <p className="text-2xl font-bold text-red-400">R$ {receivableStats.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Recebido (mês)</p>
                      <p className="text-2xl font-bold text-emerald-400">R$ {receivableStats.receivedThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Contas a Receber</CardTitle>
                  <p className="text-sm text-muted-foreground">Valores pendentes de clientes</p>
                </div>
                <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                  <DollarSign className="h-4 w-4" />
                  Nova Cobrança
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead>Cliente</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountsReceivable.map((account: FinancialTransaction) => (
                      <TableRow key={account.id} className="border-border/50 hover:bg-muted/30">
                        <TableCell className="font-medium">{account.description?.split('-')[0]?.trim() || "Cliente"}</TableCell>
                        <TableCell className="text-muted-foreground">{account.description ?? ""}</TableCell>
                        <TableCell>{account.dueDate ? format(new Date(account.dueDate), 'dd/MM/yyyy') : "-"}</TableCell>
                        <TableCell>{getStatusBadge(account.status ?? 'pending')}</TableCell>
                        <TableCell className="text-right font-semibold text-emerald-400">
                          R$ {Number(account.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Receipt className="h-3 w-3" />
                            Registrar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "DRE - Demonstrativo de Resultados", icon: FileText, color: "emerald", description: "Receitas, custos e lucro do período" },
                { title: "Fluxo de Caixa", icon: Activity, color: "blue", description: "Entradas e saídas detalhadas" },
                { title: "Conciliação Bancária", icon: CreditCard, color: "purple", description: "Conferência de extratos" },
                { title: "Relatório de Canais", icon: Globe, color: "amber", description: "Performance por canal de vendas" },
                { title: "Comissões OTAs", icon: Building2, color: "rose", description: "Valores pagos às agências" },
                { title: "Relatório Fiscal", icon: Receipt, color: "cyan", description: "Notas e impostos do período" },
              ].map((report, index) => (
                <Card
                  key={index}
                  className={`bg-gradient-to-br from-${report.color}-500/10 to-${report.color}-500/5 border-${report.color}-500/20 hover:border-${report.color}-500/40 transition-all cursor-pointer group`}
                >
                  <CardContent className="p-6">
                    <div className={`p-3 bg-${report.color}-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
                      <report.icon className={`h-6 w-6 text-${report.color}-400`} />
                    </div>
                    <h3 className="font-semibold mb-1">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                    <Button variant="ghost" size="sm" className="mt-4 gap-2 p-0 h-auto">
                      Gerar Relatório
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* New Transaction Modal */}
        <NewTransactionModal
          open={isNewTransactionModalOpen}
          onOpenChange={setIsNewTransactionModalOpen}
        />

        {/* All Transactions Modal - usa TODAS as transações (sem filtro de data) */}
        <AllTransactionsModal
          open={isAllTransactionsModalOpen}
          onOpenChange={setIsAllTransactionsModalOpen}
          transactions={normalizedTransactionsForModal}
        />
      </div>
    </DashboardLayout>
  );
};

export default Financial;
