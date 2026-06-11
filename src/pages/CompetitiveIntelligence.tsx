import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Target,
    TrendingUp,
    TrendingDown,
    Star,
    DollarSign,
    BarChart3,
    Eye,
    RefreshCw,
    ArrowUp,
    ArrowDown,
    Minus
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const competitors = [
    { id: 1, name: "Hotel Concorrente A", stars: 5, avgRate: 520, occupancy: 78, rating: 4.6, reviews: 1250, change: 5 },
    { id: 2, name: "Hotel Concorrente B", stars: 4, avgRate: 380, occupancy: 82, rating: 4.4, reviews: 890, change: -3 },
    { id: 3, name: "Hotel Concorrente C", stars: 5, avgRate: 480, occupancy: 75, rating: 4.7, reviews: 1580, change: 2 },
    { id: 4, name: "Seu Hotel", stars: 5, avgRate: 450, occupancy: 80, rating: 4.5, reviews: 1120, change: 8, isYou: true },
    { id: 5, name: "Hotel Concorrente D", stars: 4, avgRate: 320, occupancy: 85, rating: 4.3, reviews: 650, change: 0 },
];

const priceHistory = [
    { date: "01/01", you: 450, compA: 520, compB: 380, compC: 480 },
    { date: "08/01", you: 420, compA: 500, compB: 390, compC: 470 },
    { date: "15/01", you: 480, compA: 550, compB: 400, compC: 490 },
    { date: "22/01", you: 450, compA: 520, compB: 385, compC: 485 },
    { date: "29/01", you: 500, compA: 580, compB: 420, compC: 520 },
];

const reviewAnalysis = [
    { category: "Localização", you: 4.8, market: 4.5 },
    { category: "Limpeza", you: 4.6, market: 4.4 },
    { category: "Serviço", you: 4.5, market: 4.3 },
    { category: "Custo-Benefício", you: 4.3, market: 4.2 },
    { category: "Conforto", you: 4.5, market: 4.4 },
    { category: "Amenidades", you: 4.4, market: 4.3 },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const CompetitiveIntelligence = () => {
    const yourHotel = competitors.find(c => c.isYou);
    const avgMarketRate = competitors.filter(c => !c.isYou).reduce((sum, c) => sum + c.avgRate, 0) / (competitors.length - 1);
    const marketShare = 22;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Competitive Intelligence</h1>
                        <p className="text-muted-foreground">
                            Monitoramento de preços, market share e análise de reviews
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Atualizar Dados
                        </Button>
                        <Button>
                            <Eye className="h-4 w-4 mr-2" />
                            Monitorar Novo
                        </Button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Sua Tarifa Média</p>
                                    <p className="text-2xl font-bold">{formatCurrency(yourHotel?.avgRate || 0)}</p>
                                    <p className="text-xs text-emerald-500 flex items-center gap-1">
                                        <ArrowUp className="h-3 w-3" /> 8% vs mercado
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Market Share</p>
                                    <p className="text-2xl font-bold">{marketShare}%</p>
                                    <p className="text-xs text-emerald-500 flex items-center gap-1">
                                        <ArrowUp className="h-3 w-3" /> +2% este mês
                                    </p>
                                </div>
                                <Target className="h-8 w-8 text-emerald-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Sua Avaliação</p>
                                    <p className="text-2xl font-bold">{yourHotel?.rating} ⭐</p>
                                    <p className="text-xs text-muted-foreground">
                                        {yourHotel?.reviews} avaliações
                                    </p>
                                </div>
                                <Star className="h-8 w-8 text-amber-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Posição no Ranking</p>
                                    <p className="text-2xl font-bold">#2</p>
                                    <p className="text-xs text-emerald-500 flex items-center gap-1">
                                        <ArrowUp className="h-3 w-3" /> subiu 1 posição
                                    </p>
                                </div>
                                <BarChart3 className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="pricing" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="pricing">Preços</TabsTrigger>
                        <TabsTrigger value="competitors">Concorrentes</TabsTrigger>
                        <TabsTrigger value="reviews">Análise de Reviews</TabsTrigger>
                        <TabsTrigger value="trends">Tendências</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pricing" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Comparativo de Tarifas</CardTitle>
                                <CardDescription>Evolução de preços no período</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={priceHistory}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                            <Area type="monotone" dataKey="you" name="Seu Hotel" stroke="#10b981" fill="#10b98140" strokeWidth={2} />
                                            <Area type="monotone" dataKey="compA" name="Concorrente A" stroke="#3b82f6" fill="#3b82f640" strokeWidth={1} />
                                            <Area type="monotone" dataKey="compB" name="Concorrente B" stroke="#f59e0b" fill="#f59e0b40" strokeWidth={1} />
                                            <Area type="monotone" dataKey="compC" name="Concorrente C" stroke="#8b5cf6" fill="#8b5cf640" strokeWidth={1} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Posicionamento de Preço</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span>Sua Tarifa</span>
                                            <span className="font-bold">{formatCurrency(450)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Média do Mercado</span>
                                            <span className="font-bold">{formatCurrency(avgMarketRate)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t">
                                            <span>Diferença</span>
                                            <Badge className={450 > avgMarketRate ? "bg-emerald-500" : "bg-amber-500"}>
                                                {450 > avgMarketRate ? "+" : ""}{Math.round(((450 - avgMarketRate) / avgMarketRate) * 100)}%
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Recomendação IA</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-4 bg-primary/10 rounded-lg">
                                        <p className="text-sm">
                                            Com base na análise competitiva, recomendamos <strong>aumentar a tarifa em 5%</strong> para o próximo final de semana devido à alta demanda e tarifas elevadas dos concorrentes.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Alertas de Preço</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <ArrowDown className="h-4 w-4 text-destructive" />
                                            <span>Concorrente B baixou 5%</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <ArrowUp className="h-4 w-4 text-emerald-500" />
                                            <span>Concorrente A subiu 10%</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Minus className="h-4 w-4 text-muted-foreground" />
                                            <span>Concorrente C manteve</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="competitors" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Análise de Concorrentes</CardTitle>
                                <CardDescription>Comparativo detalhado com a concorrência</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Hotel</TableHead>
                                            <TableHead>Categoria</TableHead>
                                            <TableHead>Tarifa Média</TableHead>
                                            <TableHead>Ocupação</TableHead>
                                            <TableHead>Avaliação</TableHead>
                                            <TableHead>Reviews</TableHead>
                                            <TableHead>Tendência</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {competitors.map((competitor) => (
                                            <TableRow key={competitor.id} className={competitor.isYou ? "bg-primary/5" : ""}>
                                                <TableCell className="font-medium">
                                                    {competitor.name}
                                                    {competitor.isYou && <Badge className="ml-2 bg-primary">Você</Badge>}
                                                </TableCell>
                                                <TableCell>{"⭐".repeat(competitor.stars)}</TableCell>
                                                <TableCell className="font-bold">{formatCurrency(competitor.avgRate)}</TableCell>
                                                <TableCell>{competitor.occupancy}%</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                                        {competitor.rating}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{competitor.reviews.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    {competitor.change > 0 ? (
                                                        <Badge className="bg-emerald-500"><ArrowUp className="h-3 w-3 mr-1" />{competitor.change}%</Badge>
                                                    ) : competitor.change < 0 ? (
                                                        <Badge variant="destructive"><ArrowDown className="h-3 w-3 mr-1" />{Math.abs(competitor.change)}%</Badge>
                                                    ) : (
                                                        <Badge variant="secondary"><Minus className="h-3 w-3 mr-1" />0%</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reviews" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Análise de Reviews por Categoria</CardTitle>
                                <CardDescription>Comparativo com a média do mercado</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={reviewAnalysis} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" domain={[0, 5]} />
                                            <YAxis dataKey="category" type="category" width={100} />
                                            <Tooltip />
                                            <Bar dataKey="you" name="Seu Hotel" fill="#10b981" />
                                            <Bar dataKey="market" name="Mercado" fill="#94a3b8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Pontos Fortes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                                            <span>Localização</span>
                                            <Badge className="bg-emerald-500">+0.3 acima do mercado</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                                            <span>Limpeza</span>
                                            <Badge className="bg-emerald-500">+0.2 acima do mercado</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                                            <span>Serviço</span>
                                            <Badge className="bg-emerald-500">+0.2 acima do mercado</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Oportunidades de Melhoria</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
                                            <span>Custo-Benefício</span>
                                            <Badge className="bg-amber-500">+0.1 vs mercado</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                            <span>Conforto</span>
                                            <Badge variant="secondary">igual ao mercado</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                            <span>Amenidades</span>
                                            <Badge variant="secondary">igual ao mercado</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="trends" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tendências do Mercado</CardTitle>
                                <CardDescription>Insights sobre o comportamento do mercado</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 border rounded-lg">
                                        <TrendingUp className="h-8 w-8 text-emerald-500 mb-3" />
                                        <h4 className="font-semibold">Demanda em Alta</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Previsão de aumento de 15% na demanda para o próximo mês
                                        </p>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <DollarSign className="h-8 w-8 text-blue-500 mb-3" />
                                        <h4 className="font-semibold">Pressão de Preços</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Concorrentes estão elevando tarifas para eventos especiais
                                        </p>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <Star className="h-8 w-8 text-amber-500 mb-3" />
                                        <h4 className="font-semibold">Foco em Experiência</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Reviews destacam importância de experiências únicas
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

export default CompetitiveIntelligence;
