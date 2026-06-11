import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ConciergeBell,
    Clock,
    DollarSign,
    CheckCircle,
    Timer,
    MapPin,
    User,
    Phone,
    MessageSquare,
    TrendingUp,
    Package,
    Utensils
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const activeOrders = [
    {
        id: "RS001",
        room: "301",
        guest: "Carlos Oliveira",
        items: ["Clube Sandwich", "Refrigerante"],
        total: 68.90,
        status: "preparing",
        orderedAt: "19:45",
        estimatedDelivery: "20:15"
    },
    {
        id: "RS002",
        room: "512",
        guest: "Maria Santos",
        items: ["Salada Caesar", "Água com Gás", "Tiramisu"],
        total: 98.70,
        status: "ready",
        orderedAt: "19:30",
        estimatedDelivery: "19:55"
    },
    {
        id: "RS003",
        room: "205",
        guest: "João Pedro",
        items: ["Café da Manhã Completo"],
        total: 85.00,
        status: "delivering",
        orderedAt: "19:40",
        estimatedDelivery: "20:00"
    },
    {
        id: "RS004",
        room: "408",
        guest: "Ana Costa",
        items: ["Vinho Tinto", "Tábua de Queijos"],
        total: 189.00,
        status: "new",
        orderedAt: "19:50",
        estimatedDelivery: "20:20"
    },
];

const orderHistory = [
    { id: "RS095", room: "301", guest: "Carlos Oliveira", total: 52.90, date: "2024-01-15 12:30", rating: 5 },
    { id: "RS094", room: "512", guest: "Maria Santos", total: 78.50, date: "2024-01-15 08:15", rating: 4 },
    { id: "RS093", room: "205", guest: "João Pedro", total: 45.00, date: "2024-01-14 20:45", rating: 5 },
    { id: "RS092", room: "408", guest: "Ana Costa", total: 120.00, date: "2024-01-14 19:30", rating: 5 },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const RoomService = () => {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "new":
                return <Badge className="bg-blue-500 hover:bg-blue-600"><Clock className="h-3 w-3 mr-1" />Novo</Badge>;
            case "preparing":
                return <Badge className="bg-amber-500 hover:bg-amber-600"><Timer className="h-3 w-3 mr-1" />Preparando</Badge>;
            case "ready":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle className="h-3 w-3 mr-1" />Pronto</Badge>;
            case "delivering":
                return <Badge className="bg-purple-500 hover:bg-purple-600"><MapPin className="h-3 w-3 mr-1" />Entregando</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const totalRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
    const avgDeliveryTime = 25;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Room Service Digital</h1>
                        <p className="text-muted-foreground">
                            Pedidos via app/tablet com tracking em tempo real
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Notificações
                        </Button>
                        <Button>
                            <Phone className="h-4 w-4 mr-2" />
                            Atender Chamado
                        </Button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pedidos Ativos</p>
                                    <p className="text-2xl font-bold">{activeOrders.length}</p>
                                </div>
                                <Package className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Receita Hoje</p>
                                    <p className="text-2xl font-bold">{formatCurrency(1247.80)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-emerald-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Tempo Médio</p>
                                    <p className="text-2xl font-bold">{avgDeliveryTime} min</p>
                                </div>
                                <Clock className="h-8 w-8 text-amber-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Avaliação</p>
                                    <p className="text-2xl font-bold">4.8 ⭐</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="active" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="active">Pedidos Ativos</TabsTrigger>
                        <TabsTrigger value="tracking">Tracking</TabsTrigger>
                        <TabsTrigger value="history">Histórico</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeOrders.map((order) => (
                                <Card key={order.id} className="hover:border-primary transition-colors">
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl font-bold">🚪 {order.room}</span>
                                                    {getStatusBadge(order.status)}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    <User className="inline h-3 w-3 mr-1" />
                                                    {order.guest}
                                                </p>
                                            </div>
                                            <span className="font-mono text-sm text-muted-foreground">{order.id}</span>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm">
                                                    <Utensils className="h-3 w-3 text-muted-foreground" />
                                                    {item}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-center pt-4 border-t">
                                            <div className="text-sm text-muted-foreground">
                                                <Clock className="inline h-3 w-3 mr-1" />
                                                Pedido às {order.orderedAt}
                                            </div>
                                            <span className="font-bold text-lg">{formatCurrency(order.total)}</span>
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <MessageSquare className="h-4 w-4 mr-1" />
                                                Mensagem
                                            </Button>
                                            <Button size="sm" className="flex-1">
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Atualizar
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="tracking" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tracking em Tempo Real</CardTitle>
                                <CardDescription>Acompanhe o status de cada pedido</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {activeOrders.map((order) => (
                                        <div key={order.id} className="p-4 border rounded-lg">
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <span className="font-bold">Quarto {order.room}</span>
                                                    <span className="text-muted-foreground ml-2">• {order.id}</span>
                                                </div>
                                                {getStatusBadge(order.status)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`flex-1 h-2 rounded-full ${order.status !== "new" ? "bg-emerald-500" : "bg-muted"}`} />
                                                <div className={`flex-1 h-2 rounded-full ${["preparing", "ready", "delivering"].includes(order.status) ? "bg-emerald-500" : "bg-muted"}`} />
                                                <div className={`flex-1 h-2 rounded-full ${["ready", "delivering"].includes(order.status) ? "bg-emerald-500" : "bg-muted"}`} />
                                                <div className={`flex-1 h-2 rounded-full ${order.status === "delivering" ? "bg-emerald-500" : "bg-muted"}`} />
                                            </div>
                                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                                <span>Recebido</span>
                                                <span>Preparando</span>
                                                <span>Pronto</span>
                                                <span>Entregue</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Histórico de Pedidos</CardTitle>
                                <CardDescription>Últimos pedidos realizados</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Pedido</TableHead>
                                            <TableHead>Quarto</TableHead>
                                            <TableHead>Hóspede</TableHead>
                                            <TableHead>Data/Hora</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Avaliação</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orderHistory.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-mono">{order.id}</TableCell>
                                                <TableCell className="font-bold">{order.room}</TableCell>
                                                <TableCell>{order.guest}</TableCell>
                                                <TableCell>{order.date}</TableCell>
                                                <TableCell>{formatCurrency(order.total)}</TableCell>
                                                <TableCell>{"⭐".repeat(order.rating)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Horários de Pico</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span>08:00 - 10:00</span>
                                            <Badge>Alto</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>12:00 - 14:00</span>
                                            <Badge variant="secondary">Médio</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>19:00 - 21:00</span>
                                            <Badge>Alto</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Itens Mais Pedidos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span>Café da Manhã Completo</span>
                                            <span className="font-bold">32%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Clube Sandwich</span>
                                            <span className="font-bold">18%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Salada Caesar</span>
                                            <span className="font-bold">12%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Métricas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span>Ticket Médio</span>
                                            <span className="font-bold">{formatCurrency(78.50)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Taxa de Uso</span>
                                            <span className="font-bold">45%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>NPS</span>
                                            <span className="font-bold text-emerald-500">85</span>
                                        </div>
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

export default RoomService;
