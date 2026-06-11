import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    Cake,
    Plus,
    Search,
    Calendar,
    DollarSign,
    Users,
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    ChefHat,
    ClipboardList,
    TrendingUp
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const banquets = [
    {
        id: "BNQ001",
        name: "Casamento Silva & Santos",
        date: "2024-01-20",
        time: "19:00",
        guests: 150,
        venue: "Salão Nobre",
        type: "Casamento",
        status: "confirmed",
        revenue: 45000,
        costEstimate: 22500,
        contact: "Maria Silva",
        phone: "(11) 98765-4321"
    },
    {
        id: "BNQ002",
        name: "Conferência Tech Summit",
        date: "2024-01-22",
        time: "08:00",
        guests: 200,
        venue: "Centro de Convenções",
        type: "Corporativo",
        status: "pending",
        revenue: 35000,
        costEstimate: 15000,
        contact: "João Pedro",
        phone: "(11) 91234-5678"
    },
    {
        id: "BNQ003",
        name: "Aniversário 50 Anos - Empresa ABC",
        date: "2024-01-25",
        time: "20:00",
        guests: 80,
        venue: "Terraço Panorâmico",
        type: "Corporativo",
        status: "confirmed",
        revenue: 28000,
        costEstimate: 12000,
        contact: "Ana Costa",
        phone: "(11) 99876-5432"
    },
];

const beoItems = [
    { id: 1, event: "Casamento Silva", item: "Entrada: Carpaccio", quantity: 150, unitCost: 25, status: "confirmed" },
    { id: 2, event: "Casamento Silva", item: "Prato Principal: Filé", quantity: 150, unitCost: 65, status: "confirmed" },
    { id: 3, event: "Casamento Silva", item: "Sobremesa: Bolo", quantity: 1, unitCost: 1200, status: "pending" },
    { id: 4, event: "Tech Summit", item: "Coffee Break Manhã", quantity: 200, unitCost: 35, status: "pending" },
    { id: 5, event: "Tech Summit", item: "Almoço Executivo", quantity: 200, unitCost: 55, status: "pending" },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const BanquetManagement = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "confirmed":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle className="h-3 w-3 mr-1" />Confirmado</Badge>;
            case "pending":
                return <Badge className="bg-amber-500 hover:bg-amber-600"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
            case "cancelled":
                return <Badge variant="destructive">Cancelado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const totalRevenue = banquets.reduce((sum, b) => sum + b.revenue, 0);
    const totalGuests = banquets.reduce((sum, b) => sum + b.guests, 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Gestão de Banquetes</h1>
                        <p className="text-muted-foreground">
                            Orçamentos, BEOs e controle de custos por evento
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Gerar BEO
                        </Button>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Evento
                        </Button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Eventos no Mês</p>
                                    <p className="text-2xl font-bold">{banquets.length}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Receita Projetada</p>
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
                                    <p className="text-sm text-muted-foreground">Total de Convidados</p>
                                    <p className="text-2xl font-bold">{totalGuests}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Margem Média</p>
                                    <p className="text-2xl font-bold text-emerald-500">52%</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-emerald-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="events" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="events">Eventos</TabsTrigger>
                        <TabsTrigger value="beo">BEOs</TabsTrigger>
                        <TabsTrigger value="costs">Controle de Custos</TabsTrigger>
                        <TabsTrigger value="calendar">Calendário</TabsTrigger>
                    </TabsList>

                    <TabsContent value="events" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Eventos Programados</CardTitle>
                                        <CardDescription>Lista de banquetes e eventos</CardDescription>
                                    </div>
                                    <div className="relative w-64">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar evento..."
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
                                            <TableHead>Evento</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Local</TableHead>
                                            <TableHead>Convidados</TableHead>
                                            <TableHead>Receita</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {banquets.map((banquet) => (
                                            <TableRow key={banquet.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{banquet.name}</p>
                                                        <p className="text-sm text-muted-foreground">{banquet.type}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p>{banquet.date}</p>
                                                        <p className="text-sm text-muted-foreground">{banquet.time}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{banquet.venue}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-4 w-4" />
                                                        {banquet.guests}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold">{formatCurrency(banquet.revenue)}</TableCell>
                                                <TableCell>{getStatusBadge(banquet.status)}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="sm">Ver</Button>
                                                        <Button variant="ghost" size="sm">BEO</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="beo" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Banquet Event Orders (BEOs)</CardTitle>
                                <CardDescription>Ordens de evento detalhadas para a cozinha e operação</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Evento</TableHead>
                                            <TableHead>Item</TableHead>
                                            <TableHead>Quantidade</TableHead>
                                            <TableHead>Custo Unit.</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {beoItems.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.event}</TableCell>
                                                <TableCell>{item.item}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>{formatCurrency(item.unitCost)}</TableCell>
                                                <TableCell className="font-bold">{formatCurrency(item.quantity * item.unitCost)}</TableCell>
                                                <TableCell>{getStatusBadge(item.status)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="costs" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {banquets.map((banquet) => (
                                <Card key={banquet.id}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{banquet.name}</CardTitle>
                                        <CardDescription>{banquet.date} • {banquet.venue}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span>Receita</span>
                                                <span className="font-bold text-emerald-500">{formatCurrency(banquet.revenue)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>Custo Estimado</span>
                                                <span className="font-bold text-destructive">{formatCurrency(banquet.costEstimate)}</span>
                                            </div>
                                            <div className="border-t pt-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold">Margem Bruta</span>
                                                    <span className="font-bold text-lg">
                                                        {formatCurrency(banquet.revenue - banquet.costEstimate)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm text-muted-foreground">
                                                    <span>Margem %</span>
                                                    <span className="text-emerald-500">
                                                        {Math.round(((banquet.revenue - banquet.costEstimate) / banquet.revenue) * 100)}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span>Custo por Convidado</span>
                                                <span>{formatCurrency(banquet.costEstimate / banquet.guests)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="calendar" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Calendário de Eventos</CardTitle>
                                <CardDescription>Visualização mensal dos banquetes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-7 gap-2">
                                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                                        <div key={day} className="text-center font-semibold p-2 bg-muted rounded">
                                            {day}
                                        </div>
                                    ))}
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                                        const hasEvent = banquets.some(b => parseInt(b.date.split("-")[2]) === day);
                                        return (
                                            <div
                                                key={day}
                                                className={`text-center p-4 border rounded cursor-pointer hover:bg-muted transition-colors ${hasEvent ? "bg-primary/10 border-primary" : ""
                                                    }`}
                                            >
                                                <span className="font-medium">{day}</span>
                                                {hasEvent && (
                                                    <div className="mt-1">
                                                        <div className="w-2 h-2 rounded-full bg-primary mx-auto" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default BanquetManagement;
