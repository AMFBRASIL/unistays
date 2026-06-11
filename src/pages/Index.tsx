import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { OccupancyChart } from "@/components/dashboard/OccupancyChart";
import { RevenueByChannel } from "@/components/dashboard/RevenueByChannel";
import { RecentReservations } from "@/components/dashboard/RecentReservations";
import { RoomMap } from "@/components/dashboard/RoomMap";
import { AIInsights } from "@/components/dashboard/AIInsights";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SetupAlert } from "@/components/dashboard/SetupAlert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Percent,
  DollarSign,
  TrendingUp,
  BedDouble,
  CalendarCheck,
  Users,
  Hotel,
  Building2,
  Home,
  Palmtree,
  FileText,
  Wallet,
  CalendarDays,
  Clock,
  UserCheck,
  Sparkles
} from "lucide-react";

type PropertyType = 'all' | 'hotel' | 'apart-hotel' | 'loft' | 'temporada';

const propertyTypeConfig = {
  hotel: { label: 'Hotel', icon: Hotel, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  'apart-hotel': { label: 'Apart-Hotel', icon: Building2, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  loft: { label: 'Loft', icon: Home, color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  temporada: { label: 'Temporada', icon: Palmtree, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
};

const Index = () => {
  const [selectedType, setSelectedType] = useState<PropertyType>('all');

  // Fetch dashboard stats from API
  const { data: dashboardResponse, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getDashboardStats(),
    refetchInterval: 60000, // Refresh every minute
  });

  // Use real data or fallback to empty structure
  const hybridStats = dashboardResponse?.data || {
    byPropertyType: {
      hotel: { units: 0, occupancy: 0, revenue: 0, longStay: 0 },
      'apart-hotel': { units: 0, occupancy: 0, revenue: 0, longStay: 0 },
      loft: { units: 0, occupancy: 0, revenue: 0, longStay: 0 },
      temporada: { units: 0, occupancy: 0, revenue: 0, longStay: 0 },
    },
    owners: { total: 0, activeContracts: 0, pendingPayments: 0, totalCommission: 0 },
    services: { coworking: 0, rooftop: 0, cleaning: 0 },
    kpis: { occupancyRate: 0, totalRevenue: 0, longStayContracts: 0, availableUnits: { occupied: 0, total: 0 } },
    monthlyStats: { reservations: 0, activeGuests: 0, monthlyRevenue: 0 },
    recentReservations: [],
  };

  const totalUnits = Object.values(hybridStats.byPropertyType).reduce((acc: number, curr: any) => acc + (curr.units || 0), 0);
  const totalOccupied = hybridStats.kpis.availableUnits.occupied;
  const totalRevenue = hybridStats.kpis.totalRevenue;
  const totalLongStay = hybridStats.kpis.longStayContracts;
  const avgOccupancy = hybridStats.kpis.occupancyRate;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Setup Alert Widget */}
        <SetupAlert />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Híbrido</h1>
            <p className="text-muted-foreground">
              Gerencie hotéis, apart-hotéis, lofts e temporada em um só lugar.
            </p>
          </div>
        </div>

        {/* Property Type Filters - Keep existing code */}

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('all')}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Todos
            <Badge variant="secondary" className="ml-1">{totalUnits || 0}</Badge>
          </Button>
          {Object.entries(propertyTypeConfig).map(([type, config]) => {
            const Icon = config.icon;
            const stats = hybridStats.byPropertyType[type as keyof typeof hybridStats.byPropertyType];
            return (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type as PropertyType)}
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {config.label}
                <Badge variant="secondary" className="ml-1">{stats?.units || 0}</Badge>
              </Button>
            );
          })}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Taxa de Ocupação"
            value={`${avgOccupancy}%`}
            change={8.2}
            changeLabel="vs. semana anterior"
            icon={Percent}
            iconColor="text-primary"
          />
          <KPICard
            title="Receita Total"
            value={`R$ ${(totalRevenue / 1000).toFixed(0)}k`}
            change={12.5}
            changeLabel="vs. mês anterior"
            icon={DollarSign}
            iconColor="text-success"
          />
          <KPICard
            title="Contratos Long Stay"
            value={totalLongStay.toString()}
            change={15.3}
            changeLabel="vs. mês anterior"
            icon={FileText}
            iconColor="text-accent"
          />
          <KPICard
            title="Unidades Disponíveis"
            value={`${(totalUnits || 0) - (totalOccupied || 0)}/${totalUnits || 0}`}
            change={-2}
            changeLabel="vs. ontem"
            icon={BedDouble}
            iconColor="text-warning"
          />
        </div>

        {/* Hybrid Stats by Property Type */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {Object.entries(propertyTypeConfig).map(([type, config]) => {
            const Icon = config.icon;
            const stats = hybridStats.byPropertyType[type as keyof typeof hybridStats.byPropertyType] || { units: 0, occupancy: 0, revenue: 0, longStay: 0 };
            const occupied = Math.round((stats.units || 0) * (stats.occupancy || 0) / 100);
            return (
              <Card key={type} className={`border ${selectedType === type || selectedType === 'all' ? 'opacity-100' : 'opacity-50'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{config.label}</p>
                      <p className="text-xs text-muted-foreground">{stats.units || 0} unidades</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ocupação</span>
                      <span className="font-medium">{stats.occupancy || 0}%</span>
                    </div>
                    <Progress value={stats.occupancy || 0} className="h-2" />
                    <div className="flex justify-between text-sm pt-1">
                      <span className="text-muted-foreground">Receita</span>
                      <span className="font-medium text-success">R$ {((stats.revenue || 0) / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Long Stay</span>
                      <Badge variant="outline" className="text-xs">{stats.longStay || 0} contratos</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OccupancyChart />
          </div>
          <div>
            <RevenueByChannel />
          </div>
        </div>

        {/* Owners & Services Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Owners Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                Proprietários & Anfitriões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-2xl font-bold text-foreground">{hybridStats.owners.total}</p>
                  <p className="text-xs text-muted-foreground">Proprietários Ativos</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-2xl font-bold text-foreground">{hybridStats.owners.activeContracts}</p>
                  <p className="text-xs text-muted-foreground">Contratos Vigentes</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-2xl font-bold text-warning">{hybridStats.owners.pendingPayments}</p>
                  <p className="text-xs text-muted-foreground">Pagamentos Pendentes</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-2xl font-bold text-success">R$ {(hybridStats.owners.totalCommission / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-muted-foreground">Comissões do Mês</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Serviços Híbridos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Building2 className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Coworking</p>
                      <p className="text-xs text-muted-foreground">Reservas este mês</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">{hybridStats.services.coworking}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Palmtree className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Rooftop</p>
                      <p className="text-xs text-muted-foreground">Reservas este mês</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">{hybridStats.services.rooftop}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Clock className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Limpezas</p>
                      <p className="text-xs text-muted-foreground">Executadas este mês</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{hybridStats.services.cleaning}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Room Map */}
        <RoomMap />

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentReservations data={hybridStats.recentReservations} />
          <AIInsights />
        </div>

        {/* Footer Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <div className="p-2 rounded-lg bg-primary/10">
              <CalendarCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{hybridStats.monthlyStats.reservations || 0}</p>
              <p className="text-xs text-muted-foreground">Reservas este mês</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <div className="p-2 rounded-lg bg-success/10">
              <Users className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {hybridStats.monthlyStats.activeGuests >= 1000
                  ? `${(hybridStats.monthlyStats.activeGuests / 1000).toFixed(1)}k`
                  : hybridStats.monthlyStats.activeGuests || 0}
              </p>
              <p className="text-xs text-muted-foreground">Hóspedes ativos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <div className="p-2 rounded-lg bg-accent/10">
              <Wallet className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                R$ {((hybridStats.monthlyStats.monthlyRevenue || 0) / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-muted-foreground">Receita mensal</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <div className="p-2 rounded-lg bg-warning/10">
              <CalendarDays className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalLongStay || 0}</p>
              <p className="text-xs text-muted-foreground">Contratos Long Stay</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
