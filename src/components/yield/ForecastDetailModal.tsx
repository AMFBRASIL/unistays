import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    Legend
} from 'recharts';
import {
    BarChart3,
    Calendar,
    TrendingUp,
    TrendingDown,
    Users,
    Building2,
    Plane,
    PartyPopper,
    Download
} from 'lucide-react';
import { useState } from 'react';

interface ForecastDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const weeklyForecast = [
    { week: 'Sem 10', corporate: 35, leisure: 28, ota: 15, group: 10, direct: 7, total: 95 },
    { week: 'Sem 11', corporate: 40, leisure: 25, ota: 18, group: 8, direct: 9, total: 100 },
    { week: 'Sem 12', corporate: 38, leisure: 32, ota: 20, group: 12, direct: 8, total: 110 },
    { week: 'Sem 13', corporate: 42, leisure: 35, ota: 16, group: 15, direct: 10, total: 118 },
];

const dailyDetail = [
    { day: 'Seg', occupancy: 78, adr: 420, revpar: 328, demand: 'medium' },
    { day: 'Ter', occupancy: 82, adr: 440, revpar: 361, demand: 'medium' },
    { day: 'Qua', occupancy: 85, adr: 450, revpar: 383, demand: 'high' },
    { day: 'Qui', occupancy: 88, adr: 480, revpar: 422, demand: 'high' },
    { day: 'Sex', occupancy: 95, adr: 550, revpar: 523, demand: 'very-high' },
    { day: 'Sáb', occupancy: 98, adr: 600, revpar: 588, demand: 'very-high' },
    { day: 'Dom', occupancy: 72, adr: 380, revpar: 274, demand: 'low' },
];

const events = [
    { date: '2024-03-06', name: 'Conferência Tech', impact: 'high', rooms: 45 },
    { date: '2024-03-08', name: 'Casamento VIP', impact: 'medium', rooms: 25 },
    { date: '2024-03-15', name: 'Feriado Nacional', impact: 'high', rooms: 0 },
    { date: '2024-03-20', name: 'Feira de Negócios', impact: 'very-high', rooms: 60 },
];

export function ForecastDetailModal({ open, onOpenChange }: ForecastDetailModalProps) {
    const [period, setPeriod] = useState('30d');

    const getImpactBadge = (impact: string) => {
        const styles: Record<string, string> = {
            low: 'bg-muted text-muted-foreground',
            medium: 'bg-warning/10 text-warning border-warning/20',
            high: 'bg-success/10 text-success border-success/20',
            'very-high': 'bg-primary/10 text-primary border-primary/20'
        };
        const labels: Record<string, string> = {
            low: 'Baixo',
            medium: 'Médio',
            high: 'Alto',
            'very-high': 'Muito Alto'
        };
        return <Badge variant="outline" className={styles[impact]}>{labels[impact]}</Badge>;
    };

    const getDemandBadge = (demand: string) => {
        const styles: Record<string, string> = {
            low: 'bg-muted text-muted-foreground',
            medium: 'bg-warning/10 text-warning',
            high: 'bg-success/10 text-success',
            'very-high': 'bg-primary/10 text-primary'
        };
        return <Badge className={styles[demand]}>{demand.replace('-', ' ').toUpperCase()}</Badge>;
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Forecast Detalhado de Demanda
                    </DialogTitle>
                    <DialogDescription>
                        Previsões por segmento, período e eventos
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-between items-center py-2">
                    <div className="flex gap-2">
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">Próximos 7 dias</SelectItem>
                                <SelectItem value="14d">Próximos 14 dias</SelectItem>
                                <SelectItem value="30d">Próximos 30 dias</SelectItem>
                                <SelectItem value="90d">Próximos 90 dias</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Relatório
                    </Button>
                </div>

                <Tabs defaultValue="weekly" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="weekly">Visão Semanal</TabsTrigger>
                        <TabsTrigger value="daily">Detalhamento Diário</TabsTrigger>
                        <TabsTrigger value="segments">Por Segmento</TabsTrigger>
                        <TabsTrigger value="events">Eventos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="weekly" className="space-y-4">
                        <Card className="glass">
                            <CardHeader>
                                <CardTitle className="text-foreground">Previsão Semanal por Segmento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={350}>
                                    <AreaChart data={weeklyForecast}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                        <XAxis dataKey="week" className="text-muted-foreground" />
                                        <YAxis className="text-muted-foreground" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                        <Area type="monotone" dataKey="corporate" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Corporativo" />
                                        <Area type="monotone" dataKey="leisure" stackId="1" stroke="#10b981" fill="#10b981" name="Lazer" />
                                        <Area type="monotone" dataKey="ota" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="OTAs" />
                                        <Area type="monotone" dataKey="group" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Grupos" />
                                        <Area type="monotone" dataKey="direct" stackId="1" stroke="#ec4899" fill="#ec4899" name="Direto" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="daily" className="space-y-4">
                        <div className="grid grid-cols-7 gap-2">
                            {dailyDetail.map((day) => (
                                <Card key={day.day} className="glass">
                                    <CardContent className="p-4 text-center">
                                        <p className="font-medium text-foreground">{day.day}</p>
                                        <div className="my-2">
                                            {getDemandBadge(day.demand)}
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p className="text-muted-foreground">Ocp: <span className="text-foreground font-medium">{day.occupancy}%</span></p>
                                            <p className="text-muted-foreground">ADR: <span className="text-foreground font-medium">{formatCurrency(day.adr)}</span></p>
                                            <p className="text-muted-foreground">RevPAR: <span className="text-primary font-medium">{formatCurrency(day.revpar)}</span></p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Card className="glass">
                            <CardHeader>
                                <CardTitle className="text-foreground">Tendência de RevPAR</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={dailyDetail}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                        <XAxis dataKey="day" className="text-muted-foreground" />
                                        <YAxis className="text-muted-foreground" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px'
                                            }}
                                            formatter={(value) => formatCurrency(value as number)}
                                        />
                                        <Line type="monotone" dataKey="revpar" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))' }} name="RevPAR" />
                                        <Line type="monotone" dataKey="adr" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: 'hsl(var(--accent))' }} name="ADR" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="segments" className="space-y-4">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Card className="glass">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Building2 className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">Corporativo</p>
                                            <p className="text-sm text-muted-foreground">40% do mix</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Demanda prevista</span>
                                            <span className="flex items-center text-success">
                                                <TrendingUp className="h-4 w-4 mr-1" />
                                                +12%
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">ADR médio</span>
                                            <span className="text-foreground">{formatCurrency(480)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="glass">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 rounded-lg bg-success/10">
                                            <Plane className="h-5 w-5 text-success" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">Lazer</p>
                                            <p className="text-sm text-muted-foreground">32% do mix</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Demanda prevista</span>
                                            <span className="flex items-center text-success">
                                                <TrendingUp className="h-4 w-4 mr-1" />
                                                +8%
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">ADR médio</span>
                                            <span className="text-foreground">{formatCurrency(420)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="glass">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 rounded-lg bg-warning/10">
                                            <Users className="h-5 w-5 text-warning" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">OTAs</p>
                                            <p className="text-sm text-muted-foreground">18% do mix</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Demanda prevista</span>
                                            <span className="flex items-center text-destructive">
                                                <TrendingDown className="h-4 w-4 mr-1" />
                                                -5%
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">ADR médio</span>
                                            <span className="text-foreground">{formatCurrency(380)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="events" className="space-y-4">
                        <Card className="glass">
                            <CardHeader>
                                <CardTitle className="text-foreground flex items-center gap-2">
                                    <PartyPopper className="h-5 w-5" />
                                    Eventos Impactando Demanda
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {events.map((event, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <Calendar className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{event.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(event.date).toLocaleDateString('pt-BR')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {event.rooms > 0 && (
                                                    <Badge variant="secondary">{event.rooms} quartos</Badge>
                                                )}
                                                {getImpactBadge(event.impact)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
