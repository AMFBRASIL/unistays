import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Building2,
    Plus,
    ArrowRightLeft,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    BedDouble,
    DollarSign,
    Star,
    MapPin,
    Phone,
    Mail,
    Globe,
    Settings,
    Eye,
    RefreshCw,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle2,
    Zap,
    Target,
    Award,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Download,
    Maximize2,
    MoreVertical,
} from "lucide-react";
import { NewPropertyModal } from "@/components/multiproperty/NewPropertyModal";
import { TransferReservationModal } from "@/components/multiproperty/TransferReservationModal";
import { ComparativeReportsModal } from "@/components/multiproperty/ComparativeReportsModal";
import { PropertyDetailsModal } from "@/components/multiproperty/PropertyDetailsModal";

// Mock data for properties
const properties = [
    {
        id: "1",
        name: "Grand Hotel São Paulo",
        location: "São Paulo, SP",
        type: "Hotel",
        status: "active",
        rooms: 120,
        occupancy: 87,
        revenue: 485000,
        revpar: 320,
        adr: 368,
        rating: 4.8,
        reservationsToday: 23,
        checkinsToday: 15,
        checkoutsToday: 12,
        pendingPayments: 8500,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
        trend: "up",
        trendValue: 12,
    },
    {
        id: "2",
        name: "Resort Praia do Forte",
        location: "Bahia, BA",
        type: "Resort",
        status: "active",
        rooms: 85,
        occupancy: 92,
        revenue: 620000,
        revpar: 485,
        adr: 527,
        rating: 4.9,
        reservationsToday: 18,
        checkinsToday: 8,
        checkoutsToday: 6,
        pendingPayments: 12300,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400",
        trend: "up",
        trendValue: 18,
    },
    {
        id: "3",
        name: "Pousada Serra Gaúcha",
        location: "Gramado, RS",
        type: "Pousada",
        status: "active",
        rooms: 32,
        occupancy: 78,
        revenue: 145000,
        revpar: 280,
        adr: 359,
        rating: 4.7,
        reservationsToday: 8,
        checkinsToday: 5,
        checkoutsToday: 3,
        pendingPayments: 2100,
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400",
        trend: "down",
        trendValue: 5,
    },
    {
        id: "4",
        name: "Business Hotel Brasília",
        location: "Brasília, DF",
        type: "Hotel",
        status: "active",
        rooms: 200,
        occupancy: 65,
        revenue: 380000,
        revpar: 195,
        adr: 300,
        rating: 4.5,
        reservationsToday: 32,
        checkinsToday: 20,
        checkoutsToday: 18,
        pendingPayments: 15600,
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400",
        trend: "up",
        trendValue: 8,
    },
    {
        id: "5",
        name: "Hostel Centro Rio",
        location: "Rio de Janeiro, RJ",
        type: "Hostel",
        status: "maintenance",
        rooms: 45,
        occupancy: 0,
        revenue: 0,
        revpar: 0,
        adr: 0,
        rating: 4.3,
        reservationsToday: 0,
        checkinsToday: 0,
        checkoutsToday: 0,
        pendingPayments: 0,
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400",
        trend: "neutral",
        trendValue: 0,
    },
];

// Consolidated KPIs
const consolidatedKPIs = {
    totalRooms: 482,
    totalOccupancy: 76.4,
    totalRevenue: 1630000,
    avgRevpar: 338,
    avgAdr: 388.5,
    avgRating: 4.64,
    totalReservations: 81,
    totalCheckins: 48,
    totalCheckouts: 39,
    totalPendingPayments: 38500,
    propertiesActive: 4,
    propertiesMaintenance: 1,
};

// Recent transfers
const recentTransfers = [
    {
        id: "1",
        guest: "Carlos Mendes",
        from: "Grand Hotel São Paulo",
        to: "Resort Praia do Forte",
        date: "2024-01-15",
        status: "completed",
        reason: "Upgrade de categoria",
    },
    {
        id: "2",
        guest: "Maria Santos",
        from: "Pousada Serra Gaúcha",
        to: "Grand Hotel São Paulo",
        date: "2024-01-14",
        status: "pending",
        reason: "Mudança de destino",
    },
    {
        id: "3",
        guest: "João Silva",
        from: "Business Hotel Brasília",
        to: "Resort Praia do Forte",
        date: "2024-01-13",
        status: "completed",
        reason: "Férias adicionais",
    },
];

// Alerts
const alerts = [
    {
        id: "1",
        type: "warning",
        property: "Pousada Serra Gaúcha",
        message: "Ocupação abaixo da meta (78% vs 85%)",
        time: "2h atrás",
    },
    {
        id: "2",
        type: "info",
        property: "Resort Praia do Forte",
        message: "Novo recorde de RevPAR: R$ 485",
        time: "4h atrás",
    },
    {
        id: "3",
        type: "error",
        property: "Hostel Centro Rio",
        message: "Propriedade em manutenção",
        time: "1d atrás",
    },
    {
        id: "4",
        type: "success",
        property: "Grand Hotel São Paulo",
        message: "Meta mensal atingida!",
        time: "1d atrás",
    },
];

export default function MultiProperty() {
    const [isNewPropertyModalOpen, setIsNewPropertyModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
    const [isPropertyDetailsModalOpen, setIsPropertyDetailsModalOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<typeof properties[0] | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState("month");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const handlePropertyClick = (property: typeof properties[0]) => {
        setSelectedProperty(property);
        setIsPropertyDetailsModalOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "maintenance":
                return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "inactive":
                return "bg-red-500/10 text-red-500 border-red-500/20";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case "warning":
                return <AlertCircle className="w-4 h-4 text-amber-500" />;
            case "error":
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            case "success":
                return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            default:
                return <Zap className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                                <Building2 className="w-8 h-8 text-primary" />
                            </div>
                            Central Multi-Property
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Gestão centralizada de todas as propriedades da rede
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                            <SelectTrigger className="w-[140px]">
                                <Calendar className="w-4 h-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Hoje</SelectItem>
                                <SelectItem value="week">Semana</SelectItem>
                                <SelectItem value="month">Mês</SelectItem>
                                <SelectItem value="quarter">Trimestre</SelectItem>
                                <SelectItem value="year">Ano</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => setIsReportsModalOpen(true)}>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Relatórios
                        </Button>
                        <Button variant="outline" onClick={() => setIsTransferModalOpen(true)}>
                            <ArrowRightLeft className="w-4 h-4 mr-2" />
                            Transferir
                        </Button>
                        <Button onClick={() => setIsNewPropertyModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Propriedade
                        </Button>
                    </div>
                </div>

                {/* Consolidated KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Building2 className="w-5 h-5 text-blue-500" />
                                <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20">
                                    {consolidatedKPIs.propertiesActive} ativas
                                </Badge>
                            </div>
                            <div className="text-2xl font-bold">{consolidatedKPIs.totalRooms}</div>
                            <p className="text-xs text-muted-foreground">Total de UHs</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <BedDouble className="w-5 h-5 text-emerald-500" />
                                <div className="flex items-center gap-1 text-emerald-500">
                                    <TrendingUp className="w-3 h-3" />
                                    <span className="text-xs">+5%</span>
                                </div>
                            </div>
                            <div className="text-2xl font-bold">{consolidatedKPIs.totalOccupancy}%</div>
                            <p className="text-xs text-muted-foreground">Ocupação Média</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <DollarSign className="w-5 h-5 text-violet-500" />
                                <div className="flex items-center gap-1 text-emerald-500">
                                    <TrendingUp className="w-3 h-3" />
                                    <span className="text-xs">+12%</span>
                                </div>
                            </div>
                            <div className="text-2xl font-bold">{formatCurrency(consolidatedKPIs.totalRevenue)}</div>
                            <p className="text-xs text-muted-foreground">Receita Total</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Target className="w-5 h-5 text-amber-500" />
                                <div className="flex items-center gap-1 text-emerald-500">
                                    <TrendingUp className="w-3 h-3" />
                                    <span className="text-xs">+8%</span>
                                </div>
                            </div>
                            <div className="text-2xl font-bold">{formatCurrency(consolidatedKPIs.avgRevpar)}</div>
                            <p className="text-xs text-muted-foreground">RevPAR Médio</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Star className="w-5 h-5 text-pink-500" />
                            </div>
                            <div className="text-2xl font-bold">{consolidatedKPIs.avgRating}</div>
                            <p className="text-xs text-muted-foreground">Avaliação Média</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Users className="w-5 h-5 text-cyan-500" />
                            </div>
                            <div className="text-2xl font-bold">{consolidatedKPIs.totalCheckins}</div>
                            <p className="text-xs text-muted-foreground">Check-ins Hoje</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="properties" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="properties">Propriedades</TabsTrigger>
                            <TabsTrigger value="transfers">Transferências</TabsTrigger>
                            <TabsTrigger value="alerts">Alertas</TabsTrigger>
                            <TabsTrigger value="performance">Performance</TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <Filter className="w-4 h-4 mr-2" />
                                Filtros
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Exportar
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                            >
                                <Maximize2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="properties" className="space-y-4">
                        <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
                            {properties.map((property) => (
                                <Card
                                    key={property.id}
                                    className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                                    onClick={() => handlePropertyClick(property)}
                                >
                                    <div className="relative h-40">
                                        <img
                                            src={property.image}
                                            alt={property.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute top-3 right-3">
                                            <Badge className={getStatusColor(property.status)}>
                                                {property.status === "active" ? "Ativo" : property.status === "maintenance" ? "Manutenção" : "Inativo"}
                                            </Badge>
                                        </div>
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <h3 className="text-white font-semibold text-lg">{property.name}</h3>
                                            <div className="flex items-center gap-2 text-white/80 text-sm">
                                                <MapPin className="w-3 h-3" />
                                                {property.location}
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-lg font-bold">{property.occupancy}%</div>
                                                <p className="text-xs text-muted-foreground">Ocupação</p>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold">{formatCurrency(property.revpar)}</div>
                                                <p className="text-xs text-muted-foreground">RevPAR</p>
                                            </div>
                                            <div className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                    <span className="text-lg font-bold">{property.rating}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Avaliação</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <BedDouble className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm">{property.rooms} UHs</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {property.trend === "up" ? (
                                                    <div className="flex items-center gap-1 text-emerald-500">
                                                        <ArrowUpRight className="w-4 h-4" />
                                                        <span className="text-sm font-medium">+{property.trendValue}%</span>
                                                    </div>
                                                ) : property.trend === "down" ? (
                                                    <div className="flex items-center gap-1 text-red-500">
                                                        <ArrowDownRight className="w-4 h-4" />
                                                        <span className="text-sm font-medium">-{property.trendValue}%</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">—</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Receita do mês</span>
                                                <span className="font-semibold">{formatCurrency(property.revenue)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="transfers" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Transferências Recentes</CardTitle>
                                        <CardDescription>Movimentação de reservas entre propriedades</CardDescription>
                                    </div>
                                    <Button onClick={() => setIsTransferModalOpen(true)}>
                                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                                        Nova Transferência
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[400px]">
                                    <div className="space-y-4">
                                        {recentTransfers.map((transfer) => (
                                            <div
                                                key={transfer.id}
                                                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <ArrowRightLeft className="w-6 h-6 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold">{transfer.guest}</span>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                transfer.status === "completed"
                                                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                            }
                                                        >
                                                            {transfer.status === "completed" ? "Concluída" : "Pendente"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <span>{transfer.from}</span>
                                                        <ArrowRightLeft className="w-3 h-3" />
                                                        <span>{transfer.to}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">{transfer.reason}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-muted-foreground">{transfer.date}</div>
                                                    <Button variant="ghost" size="sm" className="mt-1">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="alerts" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Central de Alertas</CardTitle>
                                        <CardDescription>Notificações e alertas de todas as propriedades</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Atualizar
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[400px]">
                                    <div className="space-y-3">
                                        {alerts.map((alert) => (
                                            <div
                                                key={alert.id}
                                                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                                            >
                                                <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium">{alert.property}</span>
                                                        <span className="text-xs text-muted-foreground">• {alert.time}</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                                                </div>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="w-5 h-5 text-primary" />
                                        Ranking de Ocupação
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {properties
                                            .filter((p) => p.status === "active")
                                            .sort((a, b) => b.occupancy - a.occupancy)
                                            .map((property, index) => (
                                                <div key={property.id} className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0
                                                                        ? "bg-amber-500 text-white"
                                                                        : index === 1
                                                                            ? "bg-gray-400 text-white"
                                                                            : index === 2
                                                                                ? "bg-amber-700 text-white"
                                                                                : "bg-muted text-muted-foreground"
                                                                    }`}
                                                            >
                                                                {index + 1}
                                                            </span>
                                                            <span className="font-medium">{property.name}</span>
                                                        </div>
                                                        <span className="font-bold">{property.occupancy}%</span>
                                                    </div>
                                                    <Progress value={property.occupancy} className="h-2" />
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-primary" />
                                        Ranking de RevPAR
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {properties
                                            .filter((p) => p.status === "active")
                                            .sort((a, b) => b.revpar - a.revpar)
                                            .map((property, index) => (
                                                <div key={property.id} className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0
                                                                        ? "bg-amber-500 text-white"
                                                                        : index === 1
                                                                            ? "bg-gray-400 text-white"
                                                                            : index === 2
                                                                                ? "bg-amber-700 text-white"
                                                                                : "bg-muted text-muted-foreground"
                                                                    }`}
                                                            >
                                                                {index + 1}
                                                            </span>
                                                            <span className="font-medium">{property.name}</span>
                                                        </div>
                                                        <span className="font-bold">{formatCurrency(property.revpar)}</span>
                                                    </div>
                                                    <Progress value={(property.revpar / 500) * 100} className="h-2" />
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="w-5 h-5 text-primary" />
                                    Distribuição de Receita por Propriedade
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-4 gap-4">
                                    {properties
                                        .filter((p) => p.status === "active")
                                        .map((property) => {
                                            const percentage = (property.revenue / consolidatedKPIs.totalRevenue) * 100;
                                            return (
                                                <div key={property.id} className="p-4 rounded-lg border bg-card">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <img
                                                            src={property.image}
                                                            alt={property.name}
                                                            className="w-10 h-10 rounded-lg object-cover"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium truncate">{property.name}</h4>
                                                            <p className="text-xs text-muted-foreground">{property.type}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-2xl font-bold mb-1">{formatCurrency(property.revenue)}</div>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={percentage} className="h-2 flex-1" />
                                                        <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modals */}
            <NewPropertyModal
                open={isNewPropertyModalOpen}
                onOpenChange={setIsNewPropertyModalOpen}
            />
            <TransferReservationModal
                open={isTransferModalOpen}
                onOpenChange={setIsTransferModalOpen}
                properties={properties}
            />
            <ComparativeReportsModal
                open={isReportsModalOpen}
                onOpenChange={setIsReportsModalOpen}
                properties={properties}
            />
            {selectedProperty && (
                <PropertyDetailsModal
                    open={isPropertyDetailsModalOpen}
                    onOpenChange={setIsPropertyDetailsModalOpen}
                    property={selectedProperty}
                />
            )}
        </DashboardLayout>
    );
}
