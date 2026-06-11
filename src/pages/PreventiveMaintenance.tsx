import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Search,
  Filter,
  Plus,
  Settings,
  Bell,
  Activity,
  Droplets,
  Zap,
  Wind,
  Shield,
  Eye,
  Play,
  BedDouble,
  Building,
  Target,
  FileText,
  Users,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NewMaintenanceModal } from "@/components/maintenance/NewMaintenanceModal";
import { MaintenanceDetailsModal } from "@/components/maintenance/MaintenanceDetailsModal";
import { MaintenanceAlertsModal } from "@/components/maintenance/MaintenanceAlertsModal";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PreventiveMaintenance() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewMaintenanceModalOpen, setIsNewMaintenanceModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    critical: 0,
    completionRate: 0,
    averageCost: 0,
    thisMonth: 0
  });

  const [orders, setOrders] = useState<any[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        api.getMaintenanceStats(),
        api.getMaintenanceOrders()
      ]);

      if (statsRes.success && statsRes.data) {
        setStats({
          total: statsRes.data.total,
          completed: statsRes.data.completed,
          pending: statsRes.data.pending,
          overdue: statsRes.data.overdue,
          critical: statsRes.data.critical,
          completionRate: statsRes.data.completionRate,
          averageCost: statsRes.data.averageCost,
          thisMonth: statsRes.data.thisMonth || 0
        });
      }

      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data.maintenanceOrders || []);
      }

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de manutenção.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartMaintenance = async (id: number) => {
    try {
      await api.updateMaintenanceOrder(id, { status: 'in_progress' });
      toast({
        title: "Sucesso",
        description: "Manutenção iniciada com sucesso.",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao iniciar manutenção.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleEditFromDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(false);
    setTimeout(() => setIsNewMaintenanceModalOpen(true), 150);
  };

  const handleCompleteMaintenance = async (id: number) => {
    try {
      await api.updateMaintenanceOrder(id, { status: 'completed', completedDate: new Date() });
      toast({ title: "Sucesso", description: "Manutenção concluída com sucesso." });
      setIsDetailsModalOpen(false);
      loadData();
    } catch {
      toast({ title: "Erro", description: "Erro ao concluir manutenção.", variant: "destructive" });
    }
  };

  const handleCancelMaintenance = async (id: number) => {
    try {
      await api.updateMaintenanceOrder(id, { status: 'cancelled' });
      toast({ title: "Sucesso", description: "Manutenção cancelada." });
      setIsDetailsModalOpen(false);
      loadData();
    } catch {
      toast({ title: "Erro", description: "Erro ao cancelar manutenção.", variant: "destructive" });
    }
  };

  const handleStartFromDetails = async (id: number) => {
    await handleStartMaintenance(id);
    setIsDetailsModalOpen(false);
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      critical: "bg-red-500/10 text-red-500 border-red-500/20",
      high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      low: "bg-green-500/10 text-green-500 border-green-500/20",
    };
    const labels = {
      critical: "Crítico",
      high: "Alta",
      medium: "Média",
      low: "Baixa",
    };
    return (
      <Badge variant="outline" className={styles[priority as keyof typeof styles] || styles.low}>
        {labels[priority as keyof typeof labels] || priority}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      in_progress: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      overdue: "bg-red-500/10 text-red-500 border-red-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      cancelled: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    };
    const labels = {
      scheduled: "Agendado",
      in_progress: "Em Andamento",
      pending: "Pendente",
      overdue: "Vencido",
      completed: "Concluído",
      cancelled: "Cancelado",
    };
    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles] || styles.pending}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  // Derived lists
  const upcomingMaintenance = orders
    .filter(o => o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'overdue')
    .filter(o => o.title.toLowerCase().includes(searchTerm.toLowerCase()) || o.equipment.toLowerCase().includes(searchTerm.toLowerCase()));

  const alerts = orders
    .filter(o => (o.status === 'overdue' || o.priority === 'critical') && o.status !== 'completed' && o.status !== 'cancelled')
    .map(o => ({
      id: o.id,
      type: o.priority === 'critical' ? 'critical' : 'warning',
      message: `${o.title} - ${o.status === 'overdue' ? 'Atrasado' : 'Prioridade Crítica'}`,
      equipment: o.equipment,
      time: o.createdAt // Simplification
    }));

  const maintenanceHistory = orders
    .filter(o => o.status === 'completed')
    .sort((a, b) => new Date(b.completedDate || b.updatedAt).getTime() - new Date(a.completedDate || a.updatedAt).getTime())
    .slice(0, 5);

  const equipmentCategories = [
    { id: 1, name: "HVAC", icon: Wind, count: 45, status: "healthy", color: "text-blue-500 bg-blue-500/10" },
    { id: 2, name: "Elevadores", icon: Building, count: 4, status: "warning", color: "text-amber-500 bg-amber-500/10" },
    { id: 3, name: "Elétrica", icon: Zap, count: 32, status: "healthy", color: "text-yellow-500 bg-yellow-500/10" },
    { id: 4, name: "Hidráulica", icon: Droplets, count: 28, status: "healthy", color: "text-cyan-500 bg-cyan-500/10" },
    { id: 5, name: "Segurança", icon: Shield, count: 18, status: "critical", color: "text-red-500 bg-red-500/10" },
    { id: 6, name: "Quartos", icon: BedDouble, count: 29, status: "healthy", color: "text-purple-500 bg-purple-500/10" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20">
                <Wrench className="w-6 h-6 text-orange-500" />
              </div>
              Manutenção Preventiva
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestão inteligente de manutenções com alertas automáticos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAlertsModalOpen(true)}>
              <Bell className="w-4 h-4 mr-2" />
              Alertas ({alerts.length})
            </Button>
            <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:opacity-90" onClick={() => { setSelectedOrder(null); setIsNewMaintenanceModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Manutenção
            </Button>
          </div>
        </div>

        <NewMaintenanceModal
          open={isNewMaintenanceModalOpen}
          onOpenChange={(open) => {
            setIsNewMaintenanceModalOpen(open);
            if (!open) setSelectedOrder(null);
          }}
          onSuccess={loadData}
          initialData={selectedOrder}
        />
        <MaintenanceDetailsModal
          open={isDetailsModalOpen}
          onOpenChange={(open) => {
            setIsDetailsModalOpen(open);
            if (!open) setSelectedOrder(null);
          }}
          order={selectedOrder}
          onEdit={handleEditFromDetails}
          onStart={handleStartFromDetails}
          onComplete={handleCompleteMaintenance}
          onCancel={handleCancelMaintenance}
        />
        <MaintenanceAlertsModal open={isAlertsModalOpen} onOpenChange={setIsAlertsModalOpen} />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="p-2 rounded-lg bg-blue-500/10 w-fit mb-2">
                <Settings className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Ordens</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="p-2 rounded-lg bg-green-500/10 w-fit mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Concluídas</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="p-2 rounded-lg bg-amber-500/10 w-fit mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="p-2 rounded-lg bg-red-500/10 w-fit mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold">{stats.critical}</p>
              <p className="text-xs text-muted-foreground">Críticos</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="p-2 rounded-lg bg-purple-500/10 w-fit mb-2">
                <Clock className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold">{stats.overdue}</p>
              <p className="text-xs text-muted-foreground">Vencidos</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="p-2 rounded-lg bg-cyan-500/10 w-fit mb-2">
                <Target className="w-4 h-4 text-cyan-500" />
              </div>
              <p className="text-2xl font-bold">{stats.thisMonth}</p>
              <p className="text-xs text-muted-foreground">Este Mês</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="p-2 rounded-lg bg-emerald-500/10 w-fit mb-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold">R$ {Number(stats.averageCost).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Custo Médio</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="p-2 rounded-lg bg-teal-500/10 w-fit mb-2">
                <Activity className="w-4 h-4 text-teal-500" />
              </div>
              <p className="text-2xl font-bold">{stats.completionRate}%</p>
              <p className="text-xs text-muted-foreground">Conformidade</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Maintenance List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-card/50 backdrop-blur-xl border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Próximas Manutenções</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar equipamento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-48 bg-background/50"
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[450px]">
                  <div className="space-y-3">
                    {upcomingMaintenance.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhuma manutenção agendada encontrada.
                      </div>
                    ) : (
                      upcomingMaintenance.map((item, index) => {
                        const isEven = index % 2 === 0;
                        const isOverdue = item.status === 'overdue';
                        const rowBg = isOverdue
                          ? 'bg-red-500/10 border-red-500/30'
                          : isEven
                            ? 'bg-muted/40 border-border/60'
                            : 'bg-card/80 border-border/40';

                        const priorityIcon = {
                          critical: { bg: 'bg-red-500/20', text: 'text-red-500' },
                          high: { bg: 'bg-orange-500/20', text: 'text-orange-500' },
                          medium: { bg: 'bg-amber-500/15', text: 'text-amber-500' },
                          low: { bg: 'bg-green-500/15', text: 'text-green-500' },
                        }[item.priority] || { bg: 'bg-amber-500/15', text: 'text-amber-500' };

                        return (
                          <div
                            key={item.id}
                            className={`p-4 rounded-xl border transition-all hover:shadow-md hover:border-orange-500/30 ${rowBg}`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg ${priorityIcon.bg}`}>
                                  <Wrench className={`w-5 h-5 ${priorityIcon.text}`} />
                                </div>
                                <div>
                                  <h4 className="font-semibold">{item.title}</h4>
                                  <p className="text-sm text-muted-foreground">{item.equipment} - {item.location}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getPriorityBadge(item.priority)}
                                {getStatusBadge(item.status)}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Tipo</p>
                                <p className="font-medium capitalize mt-0.5">{item.type}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Agendado Para</p>
                                <p className="font-medium mt-0.5">
                                  {item.scheduledDate ? format(new Date(item.scheduledDate), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Vencimento</p>
                                <p className={`font-medium mt-0.5 ${item.status === 'overdue' ? 'text-red-500 font-bold' : ''}`}>
                                  {item.dueDate ? format(new Date(item.dueDate), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Custo Est.</p>
                                <p className="font-medium mt-0.5">R$ {Number(item.cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-border/50">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="w-4 h-4" />
                                {item.assignedTo || 'Não atribuído'}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleViewDetails(item)}>
                                  <Eye className="w-3 h-3 mr-1" />
                                  Detalhes
                                </Button>
                                {(item.status === 'pending' || item.status === 'scheduled' || item.status === 'overdue') && (
                                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={() => handleStartMaintenance(item.id)}>
                                    <Play className="w-3 h-3 mr-1" />
                                    Iniciar
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Equipment Categories */}
            <Card className="bg-card/50 backdrop-blur-xl border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Categorias de Equipamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {equipmentCategories.map((category) => (
                    <div
                      key={category.id}
                      className="p-4 rounded-xl bg-background/50 border border-white/10 hover:border-primary/20 transition-all cursor-pointer"
                    >
                      <div className={`p-2 rounded-lg w-fit mb-2 ${category.color}`}>
                        <category.icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-medium text-sm">{category.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-lg font-bold">{category.count}</span>
                        <div className={`w-2 h-2 rounded-full ${category.status === 'healthy' ? 'bg-green-500' :
                          category.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Alerts */}
            <Card className="bg-card/50 backdrop-blur-xl border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-500" />
                    Alertas Recentes
                  </CardTitle>
                  <Badge variant="outline" className="bg-red-500/10 text-red-500">
                    {alerts.filter(a => a.type === 'critical').length} críticos
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[280px]">
                  <div className="space-y-3">
                    {alerts.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        Nenhum alerta recente.
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-lg border ${alert.type === 'critical'
                            ? 'bg-red-500/5 border-red-500/20'
                            : alert.type === 'warning'
                              ? 'bg-amber-500/5 border-amber-500/20'
                              : 'bg-blue-500/5 border-blue-500/20'
                            }`}
                        >
                          <div className="flex items-start gap-2">
                            <AlertTriangle className={`w-4 h-4 mt-0.5 ${alert.type === 'critical' ? 'text-red-500' :
                              alert.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                              }`} />
                            <div className="flex-1">
                              <p className="text-sm">{alert.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {alert.time ? format(new Date(alert.time), "dd/MM/yyyy HH:mm") : '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Recent History */}
            <Card className="bg-card/50 backdrop-blur-xl border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-500" />
                  Histórico Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {maintenanceHistory.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      Nenhum histórico recente.
                    </div>
                  ) : (
                    maintenanceHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-white/10"
                      >
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {item.type} • {item.completedDate ? format(new Date(item.completedDate), "dd/MM") : '-'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">R$ {item.cost}</p>
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 text-xs">
                            Concluído
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Sugestão de IA</h4>
                    <p className="text-xs text-muted-foreground">Análise preditiva</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Com base no histórico, o AC do Quarto 205 pode precisar de manutenção em 2 semanas. Agende preventivamente.
                </p>
                <Button variant="outline" className="w-full border-orange-500/30 text-orange-500 hover:bg-orange-500/10">
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Agora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
