import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Calendar,
  DollarSign,
  Target,
  AlertCircle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  RefreshCw,
  Download,
  Settings,
  Lightbulb,
  BedDouble,
  Users,
  Percent
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
  ReferenceLine,
  ComposedChart,
  Bar,
  Line
} from "recharts";

const forecastData = [
  { date: "Jan", actual: 245000, forecast: 240000, budget: 230000 },
  { date: "Fev", actual: 289000, forecast: 275000, budget: 250000 },
  { date: "Mar", actual: 312000, forecast: 305000, budget: 280000 },
  { date: "Abr", actual: 278000, forecast: 290000, budget: 270000 },
  { date: "Mai", actual: 345000, forecast: 330000, budget: 300000 },
  { date: "Jun", actual: 398000, forecast: 380000, budget: 350000 },
  { date: "Jul", actual: null, forecast: 450000, budget: 400000 },
  { date: "Ago", actual: null, forecast: 420000, budget: 380000 },
  { date: "Set", actual: null, forecast: 380000, budget: 350000 },
  { date: "Out", actual: null, forecast: 350000, budget: 320000 },
  { date: "Nov", actual: null, forecast: 370000, budget: 340000 },
  { date: "Dez", actual: null, forecast: 430000, budget: 400000 },
];

const occupancyForecast = [
  { week: "Sem 1", current: 78, forecast: 82, optimal: 85 },
  { week: "Sem 2", current: 85, forecast: 88, optimal: 85 },
  { week: "Sem 3", current: 72, forecast: 75, optimal: 85 },
  { week: "Sem 4", current: 68, forecast: 70, optimal: 85 },
];

const aiInsights = [
  {
    type: "opportunity",
    title: "Oportunidade de Receita",
    description: "Aumento de 15% na demanda previsto para o próximo feriado. Considere ajustar tarifas.",
    impact: "+R$ 45.000",
    confidence: 92
  },
  {
    type: "alert",
    title: "Baixa Ocupação Prevista",
    description: "Semana 3 de Julho com ocupação 13% abaixo do ideal. Recomendamos promoção direcionada.",
    impact: "-R$ 28.000",
    confidence: 88
  },
  {
    type: "recommendation",
    title: "Otimização de Preços",
    description: "Quartos superiores com alta demanda. Sugerimos aumento de 8% na tarifa.",
    impact: "+R$ 18.500",
    confidence: 85
  },
];

const kpiForecast = [
  { label: "Receita Projetada", value: "R$ 4.2M", target: "R$ 4.0M", status: "above", change: 5.2 },
  { label: "Ocupação Média", value: "82%", target: "80%", status: "above", change: 2.5 },
  { label: "ADR Projetado", value: "R$ 485", target: "R$ 460", status: "above", change: 5.4 },
  { label: "RevPAR Projetado", value: "R$ 398", target: "R$ 380", status: "above", change: 4.7 },
];

export default function RevenueForecast() {
  const [period, setPeriod] = useState("year");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Forecast de Receita</h1>
              <p className="text-muted-foreground">Previsões e projeções com inteligência artificial</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="gap-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              <Sparkles className="w-3 h-3" />
              IA Ativa
            </Badge>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Próximo Mês</SelectItem>
                <SelectItem value="quarter">Próximo Trimestre</SelectItem>
                <SelectItem value="year">Próximo Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* KPI Forecast Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiForecast.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  </div>
                  <Badge className={cn(
                    "gap-1",
                    kpi.status === "above" 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                      : "bg-red-500/10 text-red-500 border-red-500/20"
                  )}>
                    {kpi.status === "above" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {kpi.change}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Meta: {kpi.target}</span>
                  <span className={cn(
                    "font-medium",
                    kpi.status === "above" ? "text-emerald-500" : "text-red-500"
                  )}>
                    {kpi.status === "above" ? "Acima da meta" : "Abaixo da meta"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Forecast Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Projeção de Receita</CardTitle>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Realizado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Previsão</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>Budget</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={forecastData}>
                    <defs>
                      <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => value ? [`R$ ${value.toLocaleString('pt-BR')}`, ''] : ['-', '']}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Bar dataKey="actual" fill="#10B981" radius={[4, 4, 0, 0]} name="Realizado" />
                    <Area type="monotone" dataKey="forecast" stroke="#3B82F6" fillOpacity={1} fill="url(#colorForecast)" strokeWidth={2} strokeDasharray="5 5" name="Previsão" />
                    <Line type="monotone" dataKey="budget" stroke="#F59E0B" strokeWidth={2} dot={false} name="Budget" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Insights da IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-4 rounded-xl border",
                    insight.type === "opportunity" && "bg-emerald-500/5 border-emerald-500/20",
                    insight.type === "alert" && "bg-amber-500/5 border-amber-500/20",
                    insight.type === "recommendation" && "bg-blue-500/5 border-blue-500/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      insight.type === "opportunity" && "bg-emerald-500/20",
                      insight.type === "alert" && "bg-amber-500/20",
                      insight.type === "recommendation" && "bg-blue-500/20"
                    )}>
                      {insight.type === "opportunity" && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                      {insight.type === "alert" && <AlertCircle className="w-4 h-4 text-amber-500" />}
                      {insight.type === "recommendation" && <Lightbulb className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="outline" className={cn(
                          insight.impact.startsWith('+') 
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                          {insight.impact}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{insight.confidence}% confiança</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Occupancy Forecast */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Previsão de Ocupação - Próximas 4 Semanas</CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Configurar Alertas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {occupancyForecast.map((week) => {
                const diff = week.forecast - week.optimal;
                const status = diff >= 0 ? "good" : diff >= -10 ? "warning" : "critical";
                
                return (
                  <Card key={week.week} className={cn(
                    "border",
                    status === "good" && "border-emerald-500/20 bg-emerald-500/5",
                    status === "warning" && "border-amber-500/20 bg-amber-500/5",
                    status === "critical" && "border-red-500/20 bg-red-500/5"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">{week.week}</span>
                        {status === "good" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        {status === "warning" && <AlertCircle className="w-5 h-5 text-amber-500" />}
                        {status === "critical" && <AlertCircle className="w-5 h-5 text-red-500" />}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Atual</span>
                          <span className="font-medium">{week.current}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Previsão</span>
                          <span className={cn(
                            "font-bold text-lg",
                            status === "good" && "text-emerald-500",
                            status === "warning" && "text-amber-500",
                            status === "critical" && "text-red-500"
                          )}>{week.forecast}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Meta</span>
                          <span className="font-medium">{week.optimal}%</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all",
                              status === "good" && "bg-emerald-500",
                              status === "warning" && "bg-amber-500",
                              status === "critical" && "bg-red-500"
                            )}
                            style={{ width: `${Math.min(week.forecast, 100)}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
