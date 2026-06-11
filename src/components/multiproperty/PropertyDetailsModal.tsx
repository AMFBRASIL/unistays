import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    Globe,
    Star,
    BedDouble,
    Users,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Calendar,
    Clock,
    Settings,
    Edit,
    BarChart3,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    AlertCircle,
    Wifi,
    Car,
    Coffee,
    Waves,
    Dumbbell,
    UtensilsCrossed,
    X,
    ExternalLink,
    Target,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Property {
    id: string;
    name: string;
    location: string;
    type: string;
    status: string;
    rooms: number;
    occupancy: number;
    revenue: number;
    revpar: number;
    adr: number;
    rating: number;
    reservationsToday: number;
    checkinsToday: number;
    checkoutsToday: number;
    pendingPayments: number;
    image: string;
    trend: string;
    trendValue: number;
}

interface PropertyDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    property: Property;
}

// Mock data for property details
const recentActivity = [
    { id: "1", type: "checkin", guest: "Carlos Mendes", room: "Suite 501", time: "10:30" },
    { id: "2", type: "checkout", guest: "Maria Santos", room: "Deluxe 302", time: "09:15" },
    { id: "3", type: "reservation", guest: "João Silva", room: "Standard 105", time: "08:45" },
    { id: "4", type: "payment", guest: "Ana Costa", amount: 1500, time: "08:00" },
];

const roomTypes = [
    { name: "Standard", total: 40, occupied: 35, rate: 280 },
    { name: "Deluxe", total: 35, occupied: 32, rate: 380 },
    { name: "Suite", total: 25, occupied: 22, rate: 520 },
    { name: "Suite Master", total: 15, occupied: 14, rate: 750 },
    { name: "Presidencial", total: 5, occupied: 4, rate: 1200 },
];

const alerts = [
    { id: "1", type: "warning", message: "3 quartos necessitam manutenção", time: "2h atrás" },
    { id: "2", type: "info", message: "Novo recorde de ocupação esta semana", time: "4h atrás" },
    { id: "3", type: "success", message: "Meta de receita mensal atingida", time: "1d atrás" },
];

export function PropertyDetailsModal({
    open,
    onOpenChange,
    property,
}: PropertyDetailsModalProps) {
    const [activeTab, setActiveTab] = useState("overview");

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "checkin":
                return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
            case "checkout":
                return <ArrowDownRight className="w-4 h-4 text-blue-500" />;
            case "reservation":
                return <Calendar className="w-4 h-4 text-violet-500" />;
            case "payment":
                return <DollarSign className="w-4 h-4 text-amber-500" />;
            default:
                return <Activity className="w-4 h-4 text-muted-foreground" />;
        }
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case "warning":
                return <AlertCircle className="w-4 h-4 text-amber-500" />;
            case "success":
                return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            default:
                return <Zap className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
                <div className="flex flex-col h-[85vh]">
                    {/* Header with Image */}
                    <div className="relative h-48">
                        <img
                            src={property.image}
                            alt={property.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-white hover:bg-white/20"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                        <div className="absolute bottom-4 left-6 right-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge
                                            className={cn(
                                                "text-xs",
                                                property.status === "active"
                                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                            )}
                                        >
                                            {property.status === "active" ? "Ativo" : "Manutenção"}
                                        </Badge>
                                        <Badge variant="outline" className="text-white/80 border-white/30">
                                            {property.type}
                                        </Badge>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-1">{property.name}</h2>
                                    <div className="flex items-center gap-2 text-white/80">
                                        <MapPin className="w-4 h-4" />
                                        <span>{property.location}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Editar
                                    </Button>
                                    <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Abrir
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KPI Bar */}
                    <div className="grid grid-cols-5 divide-x border-b">
                        <div className="p-4 text-center">
                            <div className="text-2xl font-bold">{property.occupancy}%</div>
                            <p className="text-xs text-muted-foreground">Ocupação</p>
                        </div>
                        <div className="p-4 text-center">
                            <div className="text-2xl font-bold">{formatCurrency(property.revpar)}</div>
                            <p className="text-xs text-muted-foreground">RevPAR</p>
                        </div>
                        <div className="p-4 text-center">
                            <div className="text-2xl font-bold">{formatCurrency(property.adr)}</div>
                            <p className="text-xs text-muted-foreground">ADR</p>
                        </div>
                        <div className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                <span className="text-2xl font-bold">{property.rating}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Avaliação</p>
                        </div>
                        <div className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                                {property.trend === "up" ? (
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                ) : (
                                    <TrendingDown className="w-5 h-5 text-red-500" />
                                )}
                                <span
                                    className={cn(
                                        "text-2xl font-bold",
                                        property.trend === "up" ? "text-emerald-500" : "text-red-500"
                                    )}
                                >
                                    {property.trend === "up" ? "+" : "-"}{property.trendValue}%
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Tendência</p>
                        </div>
                    </div>

                    {/* Tabs Content */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <div className="px-6 border-b">
                            <TabsList className="h-12">
                                <TabsTrigger value="overview" className="gap-2">
                                    <Activity className="w-4 h-4" />
                                    Visão Geral
                                </TabsTrigger>
                                <TabsTrigger value="rooms" className="gap-2">
                                    <BedDouble className="w-4 h-4" />
                                    Quartos
                                </TabsTrigger>
                                <TabsTrigger value="performance" className="gap-2">
                                    <BarChart3 className="w-4 h-4" />
                                    Performance
                                </TabsTrigger>
                                <TabsTrigger value="alerts" className="gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Alertas
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            {/* Overview Tab */}
                            <TabsContent value="overview" className="m-0 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Today Stats */}
                                    <div className="p-4 rounded-xl border space-y-4">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-primary" />
                                            Hoje
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 rounded-lg bg-emerald-500/10">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-sm text-muted-foreground">Check-ins</span>
                                                </div>
                                                <p className="text-2xl font-bold">{property.checkinsToday}</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-blue-500/10">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <ArrowDownRight className="w-4 h-4 text-blue-500" />
                                                    <span className="text-sm text-muted-foreground">Check-outs</span>
                                                </div>
                                                <p className="text-2xl font-bold">{property.checkoutsToday}</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-violet-500/10">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar className="w-4 h-4 text-violet-500" />
                                                    <span className="text-sm text-muted-foreground">Reservas</span>
                                                </div>
                                                <p className="text-2xl font-bold">{property.reservationsToday}</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-amber-500/10">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <DollarSign className="w-4 h-4 text-amber-500" />
                                                    <span className="text-sm text-muted-foreground">Pendente</span>
                                                </div>
                                                <p className="text-2xl font-bold">{formatCurrency(property.pendingPayments)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="p-4 rounded-xl border space-y-4">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-primary" />
                                            Atividade Recente
                                        </h3>
                                        <div className="space-y-3">
                                            {recentActivity.map((activity) => (
                                                <div
                                                    key={activity.id}
                                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                                        {getActivityIcon(activity.type)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{activity.guest}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {activity.type === "payment"
                                                                ? formatCurrency(activity.amount!)
                                                                : activity.room}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="w-3 h-3" />
                                                        {activity.time}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Revenue This Month */}
                                <div className="p-4 rounded-xl border">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <DollarSign className="w-5 h-5 text-primary" />
                                            Receita do Mês
                                        </h3>
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                            97% da meta
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Atual: {formatCurrency(property.revenue)}</span>
                                            <span className="text-muted-foreground">Meta: {formatCurrency(500000)}</span>
                                        </div>
                                        <Progress value={97} className="h-3" />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Rooms Tab */}
                            <TabsContent value="rooms" className="m-0 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">Tipos de Quarto</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {property.rooms} UHs no total
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Gerenciar
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {roomTypes.map((room, index) => (
                                        <div key={index} className="p-4 rounded-xl border">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <BedDouble className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{room.name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {room.occupied} de {room.total} ocupados
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{formatCurrency(room.rate)}</p>
                                                    <p className="text-xs text-muted-foreground">por noite</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Progress
                                                    value={(room.occupied / room.total) * 100}
                                                    className="h-2 flex-1"
                                                />
                                                <span className="text-sm font-medium">
                                                    {Math.round((room.occupied / room.total) * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* Performance Tab */}
                            <TabsContent value="performance" className="m-0 space-y-6">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl border">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-muted-foreground">Ocupação</span>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    property.occupancy >= 80
                                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                )}
                                            >
                                                {property.occupancy >= 80 ? "Acima da meta" : "Abaixo da meta"}
                                            </Badge>
                                        </div>
                                        <div className="text-3xl font-bold mb-2">{property.occupancy}%</div>
                                        <Progress value={property.occupancy} className="h-2" />
                                        <p className="text-xs text-muted-foreground mt-2">Meta: 85%</p>
                                    </div>

                                    <div className="p-4 rounded-xl border">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-muted-foreground">RevPAR</span>
                                            <div className="flex items-center gap-1 text-emerald-500">
                                                <TrendingUp className="w-4 h-4" />
                                                <span className="text-xs">+8%</span>
                                            </div>
                                        </div>
                                        <div className="text-3xl font-bold mb-2">{formatCurrency(property.revpar)}</div>
                                        <Progress value={(property.revpar / 400) * 100} className="h-2" />
                                        <p className="text-xs text-muted-foreground mt-2">Meta: R$ 400</p>
                                    </div>

                                    <div className="p-4 rounded-xl border">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-muted-foreground">ADR</span>
                                            <div className="flex items-center gap-1 text-emerald-500">
                                                <TrendingUp className="w-4 h-4" />
                                                <span className="text-xs">+5%</span>
                                            </div>
                                        </div>
                                        <div className="text-3xl font-bold mb-2">{formatCurrency(property.adr)}</div>
                                        <Progress value={(property.adr / 450) * 100} className="h-2" />
                                        <p className="text-xs text-muted-foreground mt-2">Meta: R$ 450</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-primary/20">
                                            <Target className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">Performance Geral</h4>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Esta propriedade está performando{" "}
                                                <span className="text-primary font-medium">12% acima</span> da média da rede.
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    <span>Receita: Excelente</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    <span>Ocupação: Boa</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    <span>Rating: Excelente</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Alerts Tab */}
                            <TabsContent value="alerts" className="m-0 space-y-4">
                                {alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={cn(
                                            "p-4 rounded-xl border flex items-start gap-4",
                                            alert.type === "warning"
                                                ? "bg-amber-500/5 border-amber-500/20"
                                                : alert.type === "success"
                                                    ? "bg-emerald-500/5 border-emerald-500/20"
                                                    : "bg-blue-500/5 border-blue-500/20"
                                        )}
                                    >
                                        <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                                        <div className="flex-1">
                                            <p className="font-medium">{alert.message}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            Ver Detalhes
                                        </Button>
                                    </div>
                                ))}

                                {alerts.length === 0 && (
                                    <div className="text-center py-12">
                                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                                        <h4 className="font-semibold mb-1">Tudo em ordem!</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Não há alertas pendentes para esta propriedade.
                                        </p>
                                    </div>
                                )}
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
