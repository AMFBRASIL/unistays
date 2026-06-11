import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Activity,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Target,
    BarChart3,
    PieChart as PieChartIcon,
    ArrowUp,
    ArrowDown,
    Globe,
    Smartphone,
    Monitor,
    Users
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";

const channelData = [
    { channel: "Direto (Website)", revenue: 450000, bookings: 320, cac: 45, roi: 8.5, share: 35, trend: 12 },
    { channel: "Booking.com", revenue: 280000, bookings: 180, cac: 85, roi: 4.2, share: 22, trend: -3 },
    { channel: "Expedia", revenue: 180000, bookings: 120, cac: 92, roi: 3.8, share: 14, trend: -5 },
    { channel: "Google Ads", revenue: 150000, bookings: 95, cac: 68, roi: 5.2, share: 12, trend: 8 },
    { channel: "Agências", revenue: 120000, bookings: 85, cac: 35, roi: 6.8, share: 9, trend: 2 },
    { channel: "Meta Ads", revenue: 100000, bookings: 70, cac: 72, roi: 4.5, share: 8, trend: 15 },
];

const segmentProfitability = [
    { segment: "Corporativo", revenue: 380000, costs: 190000, margin: 50, adr: 520, los: 1.8 },
    { segment: "Lazer", revenue: 320000, costs: 144000, margin: 55, adr: 420, los: 2.5 },
    { segment: "Grupos", revenue: 250000, costs: 137500, margin: 45, adr: 380, los: 3.2 },
    { segment: "OTAs", revenue: 280000, costs: 168000, margin: 40, adr: 400, los: 2.0 },
];

const monthlyTrend = [
    { month: "Jan", direct: 120, ota: 85, agency: 35 },
    { month: "Fev", direct: 135, ota: 80, agency: 38 },
    { month: "Mar", direct: 145, ota: 75, agency: 42 },
    { month: "Abr", direct: 155, ota: 72, agency: 45 },
    { month: "Mai", direct: 170, ota: 68, agency: 48 },
    { month: "Jun", direct: 180, ota: 65, agency: 50 },
];

const deviceData = [
    { name: "Desktop", value: 45, color: "#10b981" },
    { name: "Mobile", value: 40, color: "#3b82f6" },
    { name: "Tablet", value: 15, color: "#f59e0b" },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const RevenueAttribution = () => {
    const totalRevenue = channelData.reduce((sum, c) => sum + c.revenue, 0);
    const avgCAC = channelData.reduce((sum, c) => sum + c.cac, 0) / channelData.length;
    const avgROI = channelData.reduce((sum, c) => sum + c.roi, 0) / channelData.length;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Revenue Attribution</h1>
                        <p className="text-muted-foreground">
                            ROI por canal, custo de aquisição e análise de rentabilidade
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Button>
                            <Target className="h-4 w-4 mr-2" />
                            Otimizar Mix
                        </Button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Receita Total</p>
                                    <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">CAC Médio</p>
                                    <p className="text-2xl font-bold">{formatCurrency(avgCAC)}</p>
                                </div>
                                <Target className="h-8 w-8 text-amber-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">ROI Médio</p>
                                    <p className="text-2xl font-bold">{avgROI.toFixed(1)}x</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-emerald-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Reservas Diretas</p>
                                    <p className="text-2xl font-bold">35%</p>
                                </div>
                                <Globe className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="channels" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="channels">ROI por Canal</TabsTrigger>
                        <TabsTrigger value="segments">Rentabilidade por Segmento</TabsTrigger>
                        <TabsTrigger value="cac">Custo de Aquisição</TabsTrigger>
                        <TabsTrigger value="trends">Tendências</TabsTrigger>
                    </TabsList>

                    <TabsContent value="channels" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance por Canal</CardTitle>
                                <CardDescription>Análise detalhada de cada canal de distribuição</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Canal</TableHead>
                                            <TableHead>Receita</TableHead>
                                            <TableHead>Reservas</TableHead>
                                            <TableHead>CAC</TableHead>
                                            <TableHead>ROI</TableHead>
                                            <TableHead>Share</TableHead>
                                            <TableHead>Tendência</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {channelData.map((channel, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">{channel.channel}</TableCell>
                                                <TableCell className="font-bold">{formatCurrency(channel.revenue)}</TableCell>
                                                <TableCell>{channel.bookings}</TableCell>
                                                <TableCell>{formatCurrency(channel.cac)}</TableCell>
                                                <TableCell>
                                                    <Badge className={channel.roi >= 5 ? "bg-emerald-500" : "bg-amber-500"}>
                                                        {channel.roi}x
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{channel.share}%</TableCell>
                                                <TableCell>
                                                    {channel.trend > 0 ? (
                                                        <span className="text-emerald-500 flex items-center gap-1">
                                                            <ArrowUp className="h-4 w-4" />{channel.trend}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-destructive flex items-center gap-1">
                                                            <ArrowDown className="h-4 w-4" />{Math.abs(channel.trend)}%
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Recomendações IA</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                                            <span className="font-semibold text-emerald-500">Investir Mais</span>
                                        </div>
                                        <p className="text-sm">
                                            <strong>Direto e Meta Ads</strong> - Maior ROI e tendência positiva. Aumente orçamento em 20%.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-amber-500/10 border border-amber-500/50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Target className="h-5 w-5 text-amber-500" />
                                            <span className="font-semibold text-amber-500">Otimizar</span>
                                        </div>
                                        <p className="text-sm">
                                            <strong>Booking.com e Expedia</strong> - Renegociar comissões ou reduzir dependência.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Dispositivos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={deviceData}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    dataKey="value"
                                                    label={({ name, value }) => `${name}: ${value}%`}
                                                >
                                                    {deviceData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="segments" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Rentabilidade por Segmento</CardTitle>
                                <CardDescription>Análise de margem e performance por tipo de cliente</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Segmento</TableHead>
                                            <TableHead>Receita</TableHead>
                                            <TableHead>Custos</TableHead>
                                            <TableHead>Margem</TableHead>
                                            <TableHead>ADR</TableHead>
                                            <TableHead>LOS</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {segmentProfitability.map((segment, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">{segment.segment}</TableCell>
                                                <TableCell className="font-bold text-emerald-500">{formatCurrency(segment.revenue)}</TableCell>
                                                <TableCell className="text-destructive">{formatCurrency(segment.costs)}</TableCell>
                                                <TableCell>
                                                    <Badge className={segment.margin >= 50 ? "bg-emerald-500" : "bg-amber-500"}>
                                                        {segment.margin}%
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{formatCurrency(segment.adr)}</TableCell>
                                                <TableCell>{segment.los} noites</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {segmentProfitability.map((segment, idx) => (
                                <Card key={idx}>
                                    <CardContent className="pt-6">
                                        <h4 className="font-semibold text-center mb-4">{segment.segment}</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Lucro</span>
                                                <span className="font-bold text-emerald-500">
                                                    {formatCurrency(segment.revenue - segment.costs)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Margem</span>
                                                <Badge className={segment.margin >= 50 ? "bg-emerald-500" : "bg-amber-500"}>
                                                    {segment.margin}%
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="cac" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Custo de Aquisição por Canal</CardTitle>
                                <CardDescription>Quanto custa adquirir cada reserva</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={channelData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="channel" angle={-45} textAnchor="end" height={100} />
                                            <YAxis />
                                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                            <Bar dataKey="cac" name="CAC" fill="#f59e0b" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="border-emerald-500/50">
                                <CardHeader>
                                    <CardTitle className="text-lg text-emerald-500">Menor CAC</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">Agências</p>
                                    <p className="text-3xl font-bold text-emerald-500">{formatCurrency(35)}</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Relacionamento direto, sem custo de mídia
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">CAC Médio</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">Todos os Canais</p>
                                    <p className="text-3xl font-bold">{formatCurrency(avgCAC)}</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Média ponderada por volume
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-destructive/50">
                                <CardHeader>
                                    <CardTitle className="text-lg text-destructive">Maior CAC</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">Expedia</p>
                                    <p className="text-3xl font-bold text-destructive">{formatCurrency(92)}</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Comissões elevadas, considere reduzir
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="trends" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Evolução de Reservas por Tipo</CardTitle>
                                <CardDescription>Tendência dos últimos 6 meses (em milhares R$)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={monthlyTrend}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="direct" name="Direto" stroke="#10b981" strokeWidth={2} />
                                            <Line type="monotone" dataKey="ota" name="OTAs" stroke="#f59e0b" strokeWidth={2} />
                                            <Line type="monotone" dataKey="agency" name="Agências" stroke="#3b82f6" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Insights de Tendência</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-emerald-500/10 rounded-lg">
                                        <TrendingUp className="h-8 w-8 text-emerald-500 mb-3" />
                                        <h4 className="font-semibold">Crescimento Direto</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Reservas diretas cresceram 50% em 6 meses. Continue investindo no canal.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-amber-500/10 rounded-lg">
                                        <TrendingDown className="h-8 w-8 text-amber-500 mb-3" />
                                        <h4 className="font-semibold">Redução OTAs</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Dependência de OTAs caiu 23%. Meta de 30% até fim do ano está no caminho.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-blue-500/10 rounded-lg">
                                        <Users className="h-8 w-8 text-blue-500 mb-3" />
                                        <h4 className="font-semibold">Agências Estáveis</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Canal de agências mantém crescimento constante com melhor margem.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default RevenueAttribution;
