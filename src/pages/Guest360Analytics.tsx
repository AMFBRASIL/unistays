import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    UserCheck,
    DollarSign,
    TrendingUp,
    Heart,
    ShoppingCart,
    Calendar,
    Search,
    Star,
    Clock,
    Target,
    Activity,
    ArrowUp,
    Gift
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const topGuests = [
    { id: 1, name: "Carlos Oliveira", ltv: 45000, stays: 28, avgSpend: 1607, lastVisit: "2024-01-10", segment: "VIP", propensity: 92 },
    { id: 2, name: "Maria Santos", ltv: 38500, stays: 22, avgSpend: 1750, lastVisit: "2024-01-12", segment: "VIP", propensity: 88 },
    { id: 3, name: "João Pedro", ltv: 28000, stays: 15, avgSpend: 1867, lastVisit: "2024-01-08", segment: "Frequente", propensity: 75 },
    { id: 4, name: "Ana Costa", ltv: 22500, stays: 18, avgSpend: 1250, lastVisit: "2024-01-14", segment: "Frequente", propensity: 82 },
    { id: 5, name: "Pedro Alves", ltv: 18000, stays: 12, avgSpend: 1500, lastVisit: "2024-01-05", segment: "Regular", propensity: 65 },
];

const behaviorPatterns = [
    { pattern: "Reserva Antecipada", percentage: 45 },
    { pattern: "Last Minute", percentage: 25 },
    { pattern: "Fins de Semana", percentage: 55 },
    { pattern: "Business Travel", percentage: 35 },
    { pattern: "Lazer/Férias", percentage: 40 },
];

const segmentData = [
    { name: "VIP", value: 15, color: "#10b981" },
    { name: "Frequente", value: 25, color: "#3b82f6" },
    { name: "Regular", value: 35, color: "#f59e0b" },
    { name: "Ocasional", value: 25, color: "#94a3b8" },
];

const propensityData = [
    { service: "Spa", propensity: 78 },
    { service: "Room Service", propensity: 65 },
    { service: "Restaurante", propensity: 82 },
    { service: "Upgrade", propensity: 45 },
    { service: "Late Checkout", propensity: 55 },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const Guest360Analytics = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const getSegmentBadge = (segment: string) => {
        switch (segment) {
            case "VIP":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600"><Star className="h-3 w-3 mr-1" />VIP</Badge>;
            case "Frequente":
                return <Badge className="bg-blue-500 hover:bg-blue-600">Frequente</Badge>;
            case "Regular":
                return <Badge className="bg-amber-500 hover:bg-amber-600">Regular</Badge>;
            default:
                return <Badge variant="secondary">Ocasional</Badge>;
        }
    };

    const totalLTV = topGuests.reduce((sum, g) => sum + g.ltv, 0);
    const avgLTV = totalLTV / topGuests.length;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Guest 360° Analytics</h1>
                        <p className="text-muted-foreground">
                            Lifetime value, padrões de comportamento e propensão de compra
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Gift className="h-4 w-4 mr-2" />
                            Campanhas
                        </Button>
                        <Button>
                            <Target className="h-4 w-4 mr-2" />
                            Segmentar
                        </Button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">LTV Médio</p>
                                    <p className="text-2xl font-bold">{formatCurrency(avgLTV)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Hóspedes VIP</p>
                                    <p className="text-2xl font-bold">{topGuests.filter(g => g.segment === "VIP").length}</p>
                                </div>
                                <Star className="h-8 w-8 text-emerald-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Taxa de Retorno</p>
                                    <p className="text-2xl font-bold">68%</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Satisfação</p>
                                    <p className="text-2xl font-bold">4.7 ⭐</p>
                                </div>
                                <Heart className="h-8 w-8 text-destructive" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="ltv" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="ltv">Lifetime Value</TabsTrigger>
                        <TabsTrigger value="behavior">Comportamento</TabsTrigger>
                        <TabsTrigger value="propensity">Propensão de Compra</TabsTrigger>
                        <TabsTrigger value="segments">Segmentos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ltv" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Top Hóspedes por LTV</CardTitle>
                                        <CardDescription>Hóspedes com maior valor ao longo do tempo</CardDescription>
                                    </div>
                                    <div className="relative w-64">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar hóspede..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Hóspede</TableHead>
                                            <TableHead>LTV</TableHead>
                                            <TableHead>Estadias</TableHead>
                                            <TableHead>Gasto Médio</TableHead>
                                            <TableHead>Última Visita</TableHead>
                                            <TableHead>Segmento</TableHead>
                                            <TableHead>Propensão</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {topGuests.map((guest) => (
                                            <TableRow key={guest.id}>
                                                <TableCell className="font-medium">{guest.name}</TableCell>
                                                <TableCell className="font-bold text-emerald-500">{formatCurrency(guest.ltv)}</TableCell>
                                                <TableCell>{guest.stays}</TableCell>
                                                <TableCell>{formatCurrency(guest.avgSpend)}</TableCell>
                                                <TableCell>{guest.lastVisit}</TableCell>
                                                <TableCell>{getSegmentBadge(guest.segment)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary"
                                                                style={{ width: `${guest.propensity}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm">{guest.propensity}%</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="behavior" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Padrões de Comportamento</CardTitle>
                                    <CardDescription>Como seus hóspedes se comportam</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {behaviorPatterns.map((pattern, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium">{pattern.pattern}</span>
                                                    <span className="text-sm text-muted-foreground">{pattern.percentage}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{ width: `${pattern.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Insights de Comportamento</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-primary/10 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="h-5 w-5 text-primary" />
                                            <span className="font-semibold">Janela de Reserva</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Média de <strong>14 dias</strong> de antecedência para reservas de lazer e <strong>3 dias</strong> para business.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-primary/10 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="h-5 w-5 text-primary" />
                                            <span className="font-semibold">Frequência</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Hóspedes VIP visitam em média <strong>4x por ano</strong>, com intervalo de 90 dias entre visitas.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-primary/10 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShoppingCart className="h-5 w-5 text-primary" />
                                            <span className="font-semibold">Consumo Adicional</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            <strong>72%</strong> dos hóspedes frequentes utilizam serviços adicionais (spa, restaurante).
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="propensity" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Propensão de Compra por Serviço</CardTitle>
                                <CardDescription>Probabilidade de compra de serviços adicionais</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={propensityData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" domain={[0, 100]} />
                                            <YAxis dataKey="service" type="category" width={100} />
                                            <Tooltip formatter={(value) => `${value}%`} />
                                            <Bar dataKey="propensity" fill="#10b981" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Oportunidades de Upsell</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                                            <span>Upgrade de Quarto</span>
                                            <Badge className="bg-emerald-500">Alta</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                                            <span>Pacote Romântico</span>
                                            <Badge className="bg-blue-500">Média</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
                                            <span>Early Check-in</span>
                                            <Badge className="bg-amber-500">Média</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Cross-sell Recomendado</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                                            <span>Jantar + Spa</span>
                                            <Badge className="bg-emerald-500">85%</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                                            <span>Transfer + Tour</span>
                                            <Badge className="bg-blue-500">72%</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
                                            <span>Café + Room Service</span>
                                            <Badge className="bg-amber-500">68%</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Ações Sugeridas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <Button className="w-full" variant="outline">
                                            <Gift className="h-4 w-4 mr-2" />
                                            Enviar Oferta VIP
                                        </Button>
                                        <Button className="w-full" variant="outline">
                                            <Target className="h-4 w-4 mr-2" />
                                            Criar Campanha
                                        </Button>
                                        <Button className="w-full" variant="outline">
                                            <Activity className="h-4 w-4 mr-2" />
                                            Analisar Churn
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="segments" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Distribuição de Segmentos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={segmentData}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    dataKey="value"
                                                    label={({ name, value }) => `${name}: ${value}%`}
                                                >
                                                    {segmentData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Características por Segmento</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {segmentData.map((segment) => (
                                            <div key={segment.name} className="p-4 border rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
                                                        <span className="font-semibold">{segment.name}</span>
                                                    </div>
                                                    <Badge variant="outline">{segment.value}%</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {segment.name === "VIP" && "Alta frequência, alto gasto, preferências premium"}
                                                    {segment.name === "Frequente" && "Visitas regulares, bom histórico de consumo"}
                                                    {segment.name === "Regular" && "Visitas ocasionais, potencial de crescimento"}
                                                    {segment.name === "Ocasional" && "Primeira visita ou baixa frequência"}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default Guest360Analytics;
