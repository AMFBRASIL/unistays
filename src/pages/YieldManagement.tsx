import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    Brain,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Calendar,
    AlertTriangle,
    CheckCircle2,
    Zap,
    Target,
    BarChart3,
    Settings,
    Play,
    Pause,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight,
    Info,
    Sparkles
} from 'lucide-react';
import { DynamicPricingModal } from '@/components/yield/DynamicPricingModal';
import { OverbookingModal } from '@/components/yield/OverbookingModal';
import { ForecastDetailModal } from '@/components/yield/ForecastDetailModal';

// Mock data
const demandForecast = [
    { date: '01/03', forecast: 72, actual: 75, optimal: 78 },
    { date: '02/03', forecast: 78, actual: 80, optimal: 82 },
    { date: '03/03', forecast: 85, actual: 83, optimal: 88 },
    { date: '04/03', forecast: 90, actual: null, optimal: 92 },
    { date: '05/03', forecast: 88, actual: null, optimal: 90 },
    { date: '06/03', forecast: 95, actual: null, optimal: 96 },
    { date: '07/03', forecast: 98, actual: null, optimal: 98 },
    { date: '08/03', forecast: 92, actual: null, optimal: 94 },
];

const pricingRecommendations = [
    {
        date: '2024-03-04',
        roomType: 'Standard',
        currentPrice: 350,
        suggestedPrice: 420,
        change: 20,
        reason: 'Alta demanda prevista',
        confidence: 92,
        status: 'pending'
    },
    {
        date: '2024-03-05',
        roomType: 'Superior',
        currentPrice: 450,
        suggestedPrice: 520,
        change: 15.5,
        reason: 'Evento na região',
        confidence: 88,
        status: 'pending'
    },
    {
        date: '2024-03-06',
        roomType: 'Luxo',
        currentPrice: 650,
        suggestedPrice: 780,
        change: 20,
        reason: 'Ocupação crítica',
        confidence: 95,
        status: 'approved'
    },
    {
        date: '2024-03-07',
        roomType: 'Standard',
        currentPrice: 350,
        suggestedPrice: 290,
        change: -17,
        reason: 'Baixa demanda',
        confidence: 78,
        status: 'pending'
    },
];

const segmentForecast = [
    { segment: 'Corporativo', current: 35, forecast: 42, potential: 50 },
    { segment: 'Lazer', current: 28, forecast: 35, potential: 40 },
    { segment: 'OTAs', current: 20, forecast: 18, potential: 22 },
    { segment: 'Grupos', current: 12, forecast: 15, potential: 18 },
    { segment: 'Direto', current: 5, forecast: 8, potential: 12 },
];

const overbookingData = [
    { date: '04/03', occupancy: 98, overbooking: 3, risk: 'low' },
    { date: '05/03', occupancy: 95, overbooking: 2, risk: 'low' },
    { date: '06/03', occupancy: 102, overbooking: 5, risk: 'medium' },
    { date: '07/03', occupancy: 105, overbooking: 7, risk: 'high' },
    { date: '08/03', occupancy: 100, overbooking: 4, risk: 'medium' },
];

const revenueMetrics = [
    { name: 'ADR', value: 485, change: 12, target: 500 },
    { name: 'RevPAR', value: 412, change: 8, target: 450 },
    { name: 'GOPPAR', value: 285, change: 15, target: 300 },
    { name: 'TRevPAR', value: 580, change: 10, target: 600 },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function YieldManagement() {
    const [isPricingAuto, setIsPricingAuto] = useState(true);
    const [overbookingLevel, setOverbookingLevel] = useState([3]);
    const [isDynamicPricingOpen, setIsDynamicPricingOpen] = useState(false);
    const [isOverbookingOpen, setIsOverbookingOpen] = useState(false);
    const [isForecastOpen, setIsForecastOpen] = useState(false);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const getRiskBadge = (risk: string) => {
        const styles: Record<string, string> = {
            low: 'bg-success/10 text-success border-success/20',
            medium: 'bg-warning/10 text-warning border-warning/20',
            high: 'bg-destructive/10 text-destructive border-destructive/20'
        };
        const labels: Record<string, string> = {
            low: 'Baixo',
            medium: 'Médio',
            high: 'Alto'
        };
        return <Badge variant="outline" className={styles[risk]}>{labels[risk]}</Badge>;
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Brain className="h-7 w-7 text-primary" />
                            Yield Management Avançado
                        </h1>
                        <p className="text-muted-foreground">Precificação dinâmica com IA e forecast de demanda</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsForecastOpen(true)}>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Forecast Detalhado
                        </Button>
                        <Button variant="outline" onClick={() => setIsOverbookingOpen(true)}>
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Overbooking
                        </Button>
                        <Button onClick={() => setIsDynamicPricingOpen(true)}>
                            <Zap className="h-4 w-4 mr-2" />
                            Configurar IA
                        </Button>
                    </div>
                </div>

                {/* AI Status Card */}
                <Card className="glass border-primary/20">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                                    <Sparkles className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Motor de Precificação IA</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {isPricingAuto ? 'Ajustes automáticos ativos' : 'Modo manual ativado'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Última atualização</p>
                                    <p className="text-sm font-medium text-foreground">Há 5 minutos</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        {isPricingAuto ? 'Automático' : 'Manual'}
                                    </span>
                                    <Switch
                                        checked={isPricingAuto}
                                        onCheckedChange={setIsPricingAuto}
                                    />
                                </div>
                                <Button variant={isPricingAuto ? "outline" : "default"} size="sm">
                                    {isPricingAuto ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {revenueMetrics.map((metric) => (
                        <Card key={metric.name} className="glass">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-sm text-muted-foreground">{metric.name}</p>
                                    <Badge
                                        variant="outline"
                                        className={metric.change >= 0
                                            ? 'bg-success/10 text-success border-success/20'
                                            : 'bg-destructive/10 text-destructive border-destructive/20'
                                        }
                                    >
                                        {metric.change >= 0 ? '+' : ''}{metric.change}%
                                    </Badge>
                                </div>
                                <p className="text-2xl font-bold text-foreground">{formatCurrency(metric.value)}</p>
                                <div className="mt-2">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-muted-foreground">Meta: {formatCurrency(metric.target)}</span>
                                        <span className="text-muted-foreground">
                                            {Math.round((metric.value / metric.target) * 100)}%
                                        </span>
                                    </div>
                                    <Progress value={(metric.value / metric.target) * 100} className="h-1" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content */}
                <Tabs defaultValue="forecast" className="space-y-4">
                    <TabsList className="bg-muted/50">
                        <TabsTrigger value="forecast">Forecast de Demanda</TabsTrigger>
                        <TabsTrigger value="pricing">Precificação Dinâmica</TabsTrigger>
                        <TabsTrigger value="overbooking">Overbooking</TabsTrigger>
                        <TabsTrigger value="segments">Segmentos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="forecast" className="space-y-4">
                        <div className="grid lg:grid-cols-3 gap-4">
                            <Card className="glass lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-foreground flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        Previsão de Ocupação
                                    </CardTitle>
                                    <CardDescription>Próximos 8 dias com base em IA</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={demandForecast}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                            <XAxis dataKey="date" className="text-muted-foreground" />
                                            <YAxis className="text-muted-foreground" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--card))',
                                                    border: '1px solid hsl(var(--border))',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Legend />
                                            <Area
                                                type="monotone"
                                                dataKey="optimal"
                                                stroke="hsl(var(--success))"
                                                fill="hsl(var(--success) / 0.1)"
                                                name="Ocupação Ideal"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="forecast"
                                                stroke="hsl(var(--primary))"
                                                fill="hsl(var(--primary) / 0.2)"
                                                name="Previsão IA"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="actual"
                                                stroke="hsl(var(--accent))"
                                                strokeWidth={2}
                                                dot={{ fill: 'hsl(var(--accent))' }}
                                                name="Realizado"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="glass">
                                <CardHeader>
                                    <CardTitle className="text-foreground">Insights da IA</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                                        <div className="flex items-center gap-2 mb-1">
                                            <ArrowUpRight className="h-4 w-4 text-success" />
                                            <span className="text-sm font-medium text-success">Oportunidade</span>
                                        </div>
                                        <p className="text-sm text-foreground">
                                            Alta demanda prevista para 06-07/03. Aumente preços em 15-20%.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className="h-4 w-4 text-warning" />
                                            <span className="text-sm font-medium text-warning">Atenção</span>
                                        </div>
                                        <p className="text-sm text-foreground">
                                            Evento na região em 05/03 pode gerar pico de demanda corporativa.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Target className="h-4 w-4 text-primary" />
                                            <span className="text-sm font-medium text-primary">Recomendação</span>
                                        </div>
                                        <p className="text-sm text-foreground">
                                            Considere pacotes promocionais para 08/03 - ocupação abaixo do ideal.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-muted rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Info className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium text-foreground">Precisão</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Modelo com 94% de acurácia nos últimos 30 dias.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="pricing" className="space-y-4">
                        <Card className="glass">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-foreground">Recomendações de Preços</CardTitle>
                                        <CardDescription>Sugestões baseadas em demanda e competição</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Atualizar
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Preço Atual</TableHead>
                                            <TableHead>Sugerido</TableHead>
                                            <TableHead>Variação</TableHead>
                                            <TableHead>Motivo</TableHead>
                                            <TableHead>Confiança</TableHead>
                                            <TableHead>Ação</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pricingRecommendations.map((rec, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium text-foreground">
                                                    {new Date(rec.date).toLocaleDateString('pt-BR')}
                                                </TableCell>
                                                <TableCell>{rec.roomType}</TableCell>
                                                <TableCell>{formatCurrency(rec.currentPrice)}</TableCell>
                                                <TableCell className="font-medium text-primary">
                                                    {formatCurrency(rec.suggestedPrice)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={rec.change >= 0
                                                            ? 'bg-success/10 text-success border-success/20'
                                                            : 'bg-destructive/10 text-destructive border-destructive/20'
                                                        }
                                                    >
                                                        {rec.change >= 0 ? (
                                                            <ArrowUpRight className="h-3 w-3 mr-1" />
                                                        ) : (
                                                            <ArrowDownRight className="h-3 w-3 mr-1" />
                                                        )}
                                                        {Math.abs(rec.change)}%
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{rec.reason}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={rec.confidence} className="w-16 h-2" />
                                                        <span className="text-sm text-muted-foreground">{rec.confidence}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {rec.status === 'pending' ? (
                                                        <div className="flex gap-1">
                                                            <Button variant="outline" size="sm" className="text-success">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="text-destructive">
                                                                ✕
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Badge className="bg-success/10 text-success border-success/20">
                                                            Aprovado
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="overbooking" className="space-y-4">
                        <div className="grid lg:grid-cols-2 gap-4">
                            <Card className="glass">
                                <CardHeader>
                                    <CardTitle className="text-foreground">Controle de Overbooking</CardTitle>
                                    <CardDescription>Gerenciamento inteligente de sobrevenda</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-foreground">Nível de Overbooking</span>
                                            <span className="text-sm text-muted-foreground">{overbookingLevel[0]}%</span>
                                        </div>
                                        <Slider
                                            value={overbookingLevel}
                                            onValueChange={setOverbookingLevel}
                                            max={10}
                                            step={1}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Conservador (0%)</span>
                                            <span>Agressivo (10%)</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                        <h4 className="font-medium text-foreground">Baseado no nível atual:</h4>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            <li>• Máximo de {Math.round(105 * (1 + overbookingLevel[0] / 100))} quartos vendidos</li>
                                            <li>• Risco estimado de walk-out: {(overbookingLevel[0] * 0.3).toFixed(1)}%</li>
                                            <li>• Receita adicional potencial: {formatCurrency(overbookingLevel[0] * 1500)}</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="glass">
                                <CardHeader>
                                    <CardTitle className="text-foreground">Previsão de Overbooking</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Data</TableHead>
                                                <TableHead>Ocupação</TableHead>
                                                <TableHead>Overbooking</TableHead>
                                                <TableHead>Risco</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {overbookingData.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium text-foreground">{item.date}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={item.occupancy > 100 ? 'destructive' : 'secondary'}>
                                                            {item.occupancy}%
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{item.overbooking} quartos</TableCell>
                                                    <TableCell>{getRiskBadge(item.risk)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="segments" className="space-y-4">
                        <div className="grid lg:grid-cols-2 gap-4">
                            <Card className="glass">
                                <CardHeader>
                                    <CardTitle className="text-foreground">Demanda por Segmento</CardTitle>
                                    <CardDescription>Previsão vs atual por canal</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={segmentForecast} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                            <XAxis type="number" className="text-muted-foreground" />
                                            <YAxis dataKey="segment" type="category" className="text-muted-foreground" width={80} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--card))',
                                                    border: '1px solid hsl(var(--border))',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="current" fill="hsl(var(--muted-foreground))" name="Atual" />
                                            <Bar dataKey="forecast" fill="hsl(var(--primary))" name="Previsão" />
                                            <Bar dataKey="potential" fill="hsl(var(--success))" name="Potencial" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="glass">
                                <CardHeader>
                                    <CardTitle className="text-foreground">Mix de Segmentos Ideal</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={segmentForecast}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                dataKey="potential"
                                                nameKey="segment"
                                                label={({ segment, percent }) => `${segment}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {segmentForecast.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--card))',
                                                    border: '1px solid hsl(var(--border))',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modals */}
            <DynamicPricingModal open={isDynamicPricingOpen} onOpenChange={setIsDynamicPricingOpen} />
            <OverbookingModal open={isOverbookingOpen} onOpenChange={setIsOverbookingOpen} />
            <ForecastDetailModal open={isForecastOpen} onOpenChange={setIsForecastOpen} />
        </DashboardLayout>
    );
}
