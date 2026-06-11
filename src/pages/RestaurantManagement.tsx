import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    UtensilsCrossed,
    Plus,
    Search,
    Users,
    Clock,
    DollarSign,
    ChefHat,
    Printer,
    Bell,
    CheckCircle,
    AlertTriangle,
    Timer,
    Utensils,
    Coffee,
    Wine
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const tables = [
    { id: 1, number: "01", capacity: 4, status: "occupied", guests: 3, waiter: "Carlos", openTime: "19:30", total: 245.90 },
    { id: 2, number: "02", capacity: 2, status: "available", guests: 0, waiter: "-", openTime: "-", total: 0 },
    { id: 3, number: "03", capacity: 6, status: "occupied", guests: 5, waiter: "Maria", openTime: "19:15", total: 412.50 },
    { id: 4, number: "04", capacity: 4, status: "reserved", guests: 0, waiter: "-", openTime: "20:00", total: 0 },
    { id: 5, number: "05", capacity: 8, status: "occupied", guests: 8, waiter: "João", openTime: "18:45", total: 678.30 },
    { id: 6, number: "06", capacity: 2, status: "cleaning", guests: 0, waiter: "-", openTime: "-", total: 0 },
    { id: 7, number: "07", capacity: 4, status: "available", guests: 0, waiter: "-", openTime: "-", total: 0 },
    { id: 8, number: "08", capacity: 4, status: "occupied", guests: 2, waiter: "Ana", openTime: "19:45", total: 156.00 },
];

const activeOrders = [
    { id: "CMD001", table: "01", items: 3, status: "preparing", time: "15 min", waiter: "Carlos" },
    { id: "CMD002", table: "03", items: 5, status: "ready", time: "2 min", waiter: "Maria" },
    { id: "CMD003", table: "05", items: 8, status: "preparing", time: "10 min", waiter: "João" },
    { id: "CMD004", table: "08", items: 2, status: "sent", time: "1 min", waiter: "Ana" },
];

const menuItems = [
    { id: 1, name: "Filé Mignon ao Molho Madeira", category: "Pratos Principais", price: 89.90, popularity: 95, margin: 45 },
    { id: 2, name: "Risoto de Camarão", category: "Pratos Principais", price: 78.90, popularity: 88, margin: 52 },
    { id: 3, name: "Salada Caesar", category: "Entradas", price: 32.90, popularity: 72, margin: 68 },
    { id: 4, name: "Tiramisu", category: "Sobremesas", price: 28.90, popularity: 85, margin: 72 },
    { id: 5, name: "Vinho Tinto Casa Valduga", category: "Bebidas", price: 120.00, popularity: 65, margin: 40 },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const RestaurantManagement = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "occupied":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600">Ocupada</Badge>;
            case "available":
                return <Badge variant="secondary">Disponível</Badge>;
            case "reserved":
                return <Badge className="bg-blue-500 hover:bg-blue-600">Reservada</Badge>;
            case "cleaning":
                return <Badge className="bg-amber-500 hover:bg-amber-600">Limpeza</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getOrderStatus = (status: string) => {
        switch (status) {
            case "ready":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle className="h-3 w-3 mr-1" />Pronto</Badge>;
            case "preparing":
                return <Badge className="bg-amber-500 hover:bg-amber-600"><Timer className="h-3 w-3 mr-1" />Preparando</Badge>;
            case "sent":
                return <Badge className="bg-blue-500 hover:bg-blue-600"><Bell className="h-3 w-3 mr-1" />Enviado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const occupiedTables = tables.filter(t => t.status === "occupied").length;
    const totalRevenue = tables.reduce((sum, t) => sum + t.total, 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Gestão de Restaurantes</h1>
                        <p className="text-muted-foreground">
                            Comandas digitais, controle de mesas e menu engineering
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Printer className="h-4 w-4 mr-2" />
                            Relatório
                        </Button>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Comanda
                        </Button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Mesas Ocupadas</p>
                                    <p className="text-2xl font-bold">{occupiedTables}/{tables.length}</p>
                                </div>
                                <Utensils className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Faturamento Hoje</p>
                                    <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-emerald-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pedidos Ativos</p>
                                    <p className="text-2xl font-bold">{activeOrders.length}</p>
                                </div>
                                <ChefHat className="h-8 w-8 text-amber-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Ticket Médio</p>
                                    <p className="text-2xl font-bold">{formatCurrency(totalRevenue / Math.max(occupiedTables, 1))}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="tables" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="tables">Mapa de Mesas</TabsTrigger>
                        <TabsTrigger value="orders">Comandas Ativas</TabsTrigger>
                        <TabsTrigger value="kitchen">Integração Cozinha</TabsTrigger>
                        <TabsTrigger value="menu">Menu Engineering</TabsTrigger>
                    </TabsList>

                    <TabsContent value="tables" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {tables.map((table) => (
                                <Card
                                    key={table.id}
                                    className={`cursor-pointer hover:border-primary transition-colors ${table.status === "occupied" ? "border-emerald-500/50" :
                                            table.status === "reserved" ? "border-blue-500/50" : ""
                                        }`}
                                >
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold mb-2">#{table.number}</div>
                                            {getStatusBadge(table.status)}
                                            <div className="mt-4 text-sm text-muted-foreground">
                                                <p><Users className="inline h-3 w-3 mr-1" />{table.capacity} lugares</p>
                                                {table.status === "occupied" && (
                                                    <>
                                                        <p className="mt-1">{table.guests} clientes</p>
                                                        <p className="mt-1 font-semibold text-foreground">{formatCurrency(table.total)}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="orders" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Comandas Ativas</CardTitle>
                                <CardDescription>Pedidos em preparação ou aguardando entrega</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Comanda</TableHead>
                                            <TableHead>Mesa</TableHead>
                                            <TableHead>Itens</TableHead>
                                            <TableHead>Garçom</TableHead>
                                            <TableHead>Tempo</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activeOrders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-mono">{order.id}</TableCell>
                                                <TableCell className="font-bold">#{order.table}</TableCell>
                                                <TableCell>{order.items} itens</TableCell>
                                                <TableCell>{order.waiter}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {order.time}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getOrderStatus(order.status)}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm">Ver</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="kitchen" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="border-amber-500/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Timer className="h-5 w-5 text-amber-500" />
                                        Preparando
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {activeOrders.filter(o => o.status === "preparing").map((order) => (
                                        <div key={order.id} className="p-3 bg-muted rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold">Mesa #{order.table}</span>
                                                <span className="text-sm text-muted-foreground">{order.time}</span>
                                            </div>
                                            <p className="text-sm">{order.items} itens</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            <Card className="border-emerald-500/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                                        Prontos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {activeOrders.filter(o => o.status === "ready").map((order) => (
                                        <div key={order.id} className="p-3 bg-muted rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold">Mesa #{order.table}</span>
                                                <Badge className="bg-emerald-500">Pronto!</Badge>
                                            </div>
                                            <p className="text-sm">{order.items} itens</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            <Card className="border-blue-500/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5 text-blue-500" />
                                        Entregues
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {activeOrders.filter(o => o.status === "sent").map((order) => (
                                        <div key={order.id} className="p-3 bg-muted rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold">Mesa #{order.table}</span>
                                                <span className="text-sm text-muted-foreground">há {order.time}</span>
                                            </div>
                                            <p className="text-sm">{order.items} itens</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="menu" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Menu Engineering</CardTitle>
                                <CardDescription>Análise de popularidade e margem de contribuição</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead>Categoria</TableHead>
                                            <TableHead>Preço</TableHead>
                                            <TableHead>Popularidade</TableHead>
                                            <TableHead>Margem</TableHead>
                                            <TableHead>Classificação</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {menuItems.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{item.category}</Badge>
                                                </TableCell>
                                                <TableCell>{formatCurrency(item.price)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary"
                                                                style={{ width: `${item.popularity}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm">{item.popularity}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={item.margin >= 50 ? "text-emerald-500" : "text-amber-500"}>
                                                        {item.margin}%
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {item.popularity >= 80 && item.margin >= 50 ? (
                                                        <Badge className="bg-emerald-500">⭐ Estrela</Badge>
                                                    ) : item.popularity >= 80 ? (
                                                        <Badge className="bg-blue-500">🐴 Cavalo de Batalha</Badge>
                                                    ) : item.margin >= 50 ? (
                                                        <Badge className="bg-amber-500">🧩 Quebra-Cabeça</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">🐕 Cachorro</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default RestaurantManagement;
