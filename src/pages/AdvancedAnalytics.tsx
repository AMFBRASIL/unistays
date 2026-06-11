import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  BedDouble,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Target,
  Percent,
  Clock,
  Star,
  Globe,
  CreditCard,
  ArrowUp,
  ArrowDown,
  PieChart,
  LineChart,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  LineChart as RechartsLineChart,
  Line
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 245000, adr: 380, occupancy: 68 },
  { month: "Fev", revenue: 289000, adr: 420, occupancy: 72 },
  { month: "Mar", revenue: 312000, adr: 450, occupancy: 78 },
  { month: "Abr", revenue: 278000, adr: 400, occupancy: 71 },
  { month: "Mai", revenue: 345000, adr: 480, occupancy: 82 },
  { month: "Jun", revenue: 398000, adr: 520, occupancy: 88 },
  { month: "Jul", revenue: 456000, adr: 580, occupancy: 92 },
  { month: "Ago", revenue: 423000, adr: 550, occupancy: 89 },
  { month: "Set", revenue: 367000, adr: 490, occupancy: 84 },
  { month: "Out", revenue: 334000, adr: 460, occupancy: 79 },
  { month: "Nov", revenue: 356000, adr: 470, occupancy: 81 },
  { month: "Dez", revenue: 412000, adr: 540, occupancy: 86 },
];

const channelData = [
  { name: "Direto", value: 35, color: "#3B82F6" },
  { name: "Booking.com", value: 28, color: "#EF4444" },
  { name: "Airbnb", value: 18, color: "#F97316" },
  { name: "Expedia", value: 12, color: "#8B5CF6" },
  { name: "Outros", value: 7, color: "#6B7280" },
];

const roomTypeData = [
  { type: "Standard", revenue: 125000, bookings: 450 },
  { type: "Superior", revenue: 198000, bookings: 380 },
  { type: "Luxo", revenue: 267000, bookings: 290 },
  { type: "Suite", revenue: 312000, bookings: 180 },
  { type: "Presidencial", revenue: 156000, bookings: 45 },
];

const kpis = [
  { 
    label: "RevPAR", 
    value: "R$ 425", 
    change: 12.5, 
    icon: DollarSign,
    description: "Receita por quarto disponível",
    color: "from-emerald-500 to-green-500"
  },
  { 
    label: "ADR", 
    value: "R$ 520", 
    change: 8.3, 
    icon: Target,
    description: "Tarifa média diária",
    color: "from-blue-500 to-cyan-500"
  },
  { 
    label: "Ocupação", 
    value: "86%", 
    change: 5.2, 
    icon: BedDouble,
    description: "Taxa de ocupação",
    color: "from-purple-500 to-pink-500"
  },
  { 
    label: "TRevPAR", 
    value: "R$ 580", 
    change: 15.8, 
    icon: TrendingUp,
    description: "Receita total por quarto disponível",
    color: "from-amber-500 to-orange-500"
  },
];

const performanceMetrics = [
  { label: "Tempo Médio de Estadia", value: "3.2 noites", icon: Clock },
  { label: "Lead Time Médio", value: "18 dias", icon: Calendar },
  { label: "Taxa de Cancelamento", value: "8.5%", icon: Percent },
  { label: "NPS Score", value: "78", icon: Star },
  { label: "Market Share", value: "12.4%", icon: Globe },
  { label: "Reservas Diretas", value: "35%", icon: CreditCard },
];

export default function AdvancedAnalytics() {
  const [period, setPeriod] = useState("year");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Business Intelligence</h1>
              <p className="text-muted-foreground">Análises avançadas e métricas de performance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="quarter">Este Trimestre</SelectItem>
                <SelectItem value="year">Este Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="overflow-hidden">
              <div className={cn("h-1 bg-gradient-to-r", kpi.color)} />
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
                    <p className="text-3xl font-bold">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", kpi.color)}>
                      <kpi.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge className={cn(
                      "gap-1",
                      kpi.change > 0 
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                      {kpi.change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(kpi.change)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="revenue" className="gap-2">
              <LineChart className="w-4 h-4" />
              Receita
            </TabsTrigger>
            <TabsTrigger value="occupancy" className="gap-2">
              <Activity className="w-4 h-4" />
              Ocupação
            </TabsTrigger>
            <TabsTrigger value="channels" className="gap-2">
              <PieChart className="w-4 h-4" />
              Canais
            </TabsTrigger>
            <TabsTrigger value="rooms" className="gap-2">
              <BedDouble className="w-4 h-4" />
              Categorias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Evolução da Receita</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                        <Tooltip 
                          formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {performanceMetrics.map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <metric.icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm">{metric.label}</span>
                      </div>
                      <span className="font-semibold">{metric.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="occupancy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ocupação e ADR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis yAxisId="left" className="text-xs" />
                      <YAxis yAxisId="right" orientation="right" className="text-xs" tickFormatter={(value) => `R$ ${value}`} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="occupancy" stroke="#3B82F6" strokeWidth={2} name="Ocupação (%)" />
                      <Line yAxisId="right" type="monotone" dataKey="adr" stroke="#8B5CF6" strokeWidth={2} name="ADR (R$)" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Canal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={channelData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {channelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance por Canal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {channelData.map((channel) => (
                      <div key={channel.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.color }} />
                            <span className="font-medium">{channel.name}</span>
                          </div>
                          <span className="text-muted-foreground">{channel.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all" 
                            style={{ width: `${channel.value}%`, backgroundColor: channel.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rooms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Receita por Categoria de Quarto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roomTypeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="type" className="text-xs" width={100} />
                      <Tooltip 
                        formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Bar dataKey="revenue" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
