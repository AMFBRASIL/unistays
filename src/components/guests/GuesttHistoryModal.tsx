import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
    User,
    CalendarDays,
    BedDouble,
    CreditCard,
    Star,
    Phone,
    Mail,
    MapPin,
    Clock,
    DollarSign,
    TrendingUp,
    MessageSquare,
    Heart,
    Award,
    Gift,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Coffee,
    UtensilsCrossed,
    Sparkles,
    Crown,
    ThumbsUp,
    ThumbsDown,
    History,
    BarChart3,
    PieChart,
    Calendar,
    Building2,
    Wifi,
    Car,
    ShowerHead,
    X,
    Download,
    Share2,
    Printer,
    FileText,
    Receipt,
    TrendingDown,
    Percent,
    Users,
    Globe,
    Briefcase,
    Shield,
    Zap,
    Target,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GuestHistoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    loyaltyTier?: string;
    totalStays?: number;
}

// Mock data for guest history
const guestData = {
    id: "g-001",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "(11) 99876-5432",
    cpf: "123.456.789-00",
    birthdate: "1985-03-15",
    nationality: "Brasileira",
    occupation: "Diretora de Marketing",
    company: "Tech Solutions Ltda",
    address: "Av. Paulista, 1500 - Apto 1201",
    city: "São Paulo",
    state: "SP",
    country: "Brasil",
    memberSince: "2021-06-10",
    loyaltyTier: "platinum",
    loyaltyPoints: 12450,
    totalStays: 18,
    totalNights: 67,
    totalSpent: 48750.00,
    avgDailyRate: 727.61,
    avgStayLength: 3.7,
    lastStay: "2024-12-15",
    preferredRoomType: "Suíte Premium",
    preferredBedConfig: "King Size",
    preferredFloor: "Alto",
    preferredPayment: "Cartão de Crédito",
    tags: ["VIP", "Corporate", "Returning", "High Value"],
    alerts: [
        { type: "positive", message: "Sempre deixa avaliações 5 estrelas" },
        { type: "positive", message: "Prefere early check-in" },
        { type: "info", message: "Alérgica a amendoim" },
    ],
    engagementScore: 92,
    satisfactionScore: 4.8,
    lifetimeValue: 85000,
    predictedNextStay: "2025-02-20",
};

const stayHistory = [
    {
        id: "res-001",
        checkIn: "2024-12-15",
        checkOut: "2024-12-18",
        nights: 3,
        room: "302 - Suíte Premium",
        property: "Hotel Luxo Centro",
        total: 2850.00,
        rating: 5,
        status: "completed",
        services: ["Café da manhã", "Spa", "Transfer"],
        notes: "Celebração de aniversário",
    },
    {
        id: "res-002",
        checkIn: "2024-10-05",
        checkOut: "2024-10-09",
        nights: 4,
        room: "301 - Luxo",
        property: "Hotel Luxo Centro",
        total: 2400.00,
        rating: 5,
        status: "completed",
        services: ["Café da manhã", "Estacionamento"],
        notes: "Viagem de negócios",
    },
    {
        id: "res-003",
        checkIn: "2024-08-20",
        checkOut: "2024-08-22",
        nights: 2,
        room: "203 - Standard Master",
        property: "Apart-Hotel Business",
        total: 890.00,
        rating: 4,
        status: "completed",
        services: ["Estacionamento"],
        notes: "",
    },
    {
        id: "res-004",
        checkIn: "2024-06-10",
        checkOut: "2024-06-15",
        nights: 5,
        room: "Cobertura",
        property: "Resort Praia Azul",
        total: 5250.00,
        rating: 5,
        status: "completed",
        services: ["All-inclusive", "Spa", "Transfer"],
        notes: "Lua de mel",
    },
    {
        id: "res-005",
        checkIn: "2024-03-22",
        checkOut: "2024-03-25",
        nights: 3,
        room: "302 - Suíte Premium",
        property: "Hotel Luxo Centro",
        total: 2700.00,
        rating: 5,
        status: "completed",
        services: ["Café da manhã", "Room Service"],
        notes: "",
    },
];

const transactions = [
    { id: "t001", date: "2024-12-18", description: "Hospedagem - Suíte Premium", amount: 2850.00, type: "debit", method: "Cartão Visa" },
    { id: "t002", date: "2024-12-17", description: "Spa - Massagem Relaxante", amount: 280.00, type: "debit", method: "Conta Quarto" },
    { id: "t003", date: "2024-12-16", description: "Restaurante - Jantar", amount: 320.00, type: "debit", method: "Conta Quarto" },
    { id: "t004", date: "2024-10-09", description: "Hospedagem - Luxo", amount: 2400.00, type: "debit", method: "Cartão Mastercard" },
    { id: "t005", date: "2024-08-22", description: "Hospedagem - Standard", amount: 890.00, type: "debit", method: "PIX" },
];

const interactions = [
    { id: "i001", date: "2024-12-18", type: "checkout", title: "Check-out realizado", details: "Saída às 11:45 - Expressou satisfação" },
    { id: "i002", date: "2024-12-17", type: "request", title: "Solicitação Room Service", details: "Jantar no quarto às 20:00" },
    { id: "i003", date: "2024-12-16", type: "feedback", title: "Elogio recebido", details: "Agradeceu a decoração de aniversário no quarto" },
    { id: "i004", date: "2024-12-15", type: "checkin", title: "Check-in realizado", details: "Early check-in às 12:30" },
    { id: "i005", date: "2024-10-09", type: "checkout", title: "Check-out realizado", details: "Saída às 10:00 - Sem intercorrências" },
];

const preferences = {
    room: [
        { label: "Andar alto", icon: Building2, priority: "high" },
        { label: "Vista cidade", icon: MapPin, priority: "high" },
        { label: "Cama King", icon: BedDouble, priority: "medium" },
        { label: "Longe do elevador", icon: Building2, priority: "low" },
    ],
    amenities: [
        { label: "Café da manhã", icon: Coffee, frequency: 90 },
        { label: "Spa", icon: Sparkles, frequency: 70 },
        { label: "Estacionamento", icon: Car, frequency: 60 },
        { label: "Wi-Fi Premium", icon: Wifi, frequency: 100 },
    ],
    dining: [
        { label: "Vegetariana", type: "restriction" },
        { label: "Sem amendoim", type: "allergy" },
        { label: "Água com gás", type: "preference" },
    ],
};

const loyaltyTierColors = {
    bronze: { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/30" },
    silver: { bg: "bg-slate-400/10", text: "text-slate-400", border: "border-slate-400/30" },
    gold: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
    platinum: { bg: "bg-violet-500/10", text: "text-violet-500", border: "border-violet-500/30" },
};

export function GuestHistoryModal({
    open,
    onOpenChange,
    guestName,
    guestEmail,
    guestPhone,
    loyaltyTier = "platinum",
    totalStays = 18
}: GuestHistoryModalProps) {
    const tierColors = loyaltyTierColors[loyaltyTier as keyof typeof loyaltyTierColors] || loyaltyTierColors.bronze;

    const formatCurrency = (value: number) => {
        return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden">
                {/* Hero Header */}
                <div className="relative bg-gradient-to-br from-primary/10 via-violet-500/10 to-primary/5 border-b">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-4 right-20 w-32 h-32 rounded-full bg-primary blur-3xl" />
                        <div className="absolute bottom-0 left-20 w-40 h-40 rounded-full bg-violet-500 blur-3xl" />
                    </div>

                    <div className="relative p-6">
                        {/* Close Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-4 rounded-full"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        <div className="flex items-start gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-xl">
                                    <User className="h-12 w-12 text-white" />
                                </div>
                                <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-full ${tierColors.bg} border-2 border-background`}>
                                    <Crown className={`h-4 w-4 ${tierColors.text}`} />
                                </div>
                            </div>

                            {/* Guest Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold text-foreground">{guestName || guestData.name}</h2>
                                    <Badge className={`${tierColors.bg} ${tierColors.text} ${tierColors.border} border uppercase text-xs font-bold`}>
                                        <Crown className="h-3 w-3 mr-1" />
                                        {loyaltyTier}
                                    </Badge>
                                    {guestData.tags.slice(0, 3).map((tag, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                                    ))}
                                </div>

                                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="h-4 w-4" />
                                        {guestEmail || guestData.email}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="h-4 w-4" />
                                        {guestPhone || guestData.phone}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4" />
                                        {guestData.city}, {guestData.state}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Briefcase className="h-4 w-4" />
                                        {guestData.occupation}
                                    </span>
                                </div>

                                {/* Quick Stats */}
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/60 backdrop-blur-sm border">
                                        <CalendarDays className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-semibold">{totalStays || guestData.totalStays} estadias</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/60 backdrop-blur-sm border">
                                        <BedDouble className="h-4 w-4 text-emerald-500" />
                                        <span className="text-sm font-semibold">{guestData.totalNights} noites</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/60 backdrop-blur-sm border">
                                        <DollarSign className="h-4 w-4 text-amber-500" />
                                        <span className="text-sm font-semibold">{formatCurrency(guestData.totalSpent)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/60 backdrop-blur-sm border">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        <span className="text-sm font-semibold">{guestData.satisfactionScore}/5</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/60 backdrop-blur-sm border">
                                        <Award className="h-4 w-4 text-violet-500" />
                                        <span className="text-sm font-semibold">{guestData.loyaltyPoints.toLocaleString()} pts</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Printer className="h-4 w-4" />
                                    Imprimir
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Download className="h-4 w-4" />
                                    Exportar
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Share2 className="h-4 w-4" />
                                    Compartilhar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content with Tabs */}
                <Tabs defaultValue="overview" className="flex-1 flex flex-col h-[calc(90vh-200px)]">
                    <div className="border-b px-6">
                        <TabsList className="bg-transparent h-12 gap-4">
                            <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg px-4">
                                <BarChart3 className="h-4 w-4" />
                                Visão Geral
                            </TabsTrigger>
                            <TabsTrigger value="stays" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg px-4">
                                <History className="h-4 w-4" />
                                Histórico de Estadias
                            </TabsTrigger>
                            <TabsTrigger value="transactions" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg px-4">
                                <CreditCard className="h-4 w-4" />
                                Financeiro
                            </TabsTrigger>
                            <TabsTrigger value="preferences" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg px-4">
                                <Heart className="h-4 w-4" />
                                Preferências
                            </TabsTrigger>
                            <TabsTrigger value="interactions" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg px-4">
                                <MessageSquare className="h-4 w-4" />
                                Interações
                            </TabsTrigger>
                            <TabsTrigger value="insights" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg px-4">
                                <Zap className="h-4 w-4" />
                                Insights IA
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1">
                        {/* Overview Tab */}
                        <TabsContent value="overview" className="p-6 mt-0">
                            <div className="grid grid-cols-3 gap-6">
                                {/* KPI Cards */}
                                <div className="col-span-2 grid grid-cols-4 gap-4">
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="p-2 rounded-lg bg-blue-500/20">
                                                <TrendingUp className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <span className="text-xs text-emerald-500 flex items-center gap-1">
                                                <ArrowUpRight className="h-3 w-3" />
                                                +12%
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold">{formatCurrency(guestData.avgDailyRate)}</p>
                                        <p className="text-xs text-muted-foreground">Diária Média</p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="p-2 rounded-lg bg-emerald-500/20">
                                                <BedDouble className="h-5 w-5 text-emerald-500" />
                                            </div>
                                            <span className="text-xs text-emerald-500 flex items-center gap-1">
                                                <ArrowUpRight className="h-3 w-3" />
                                                +0.5
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold">{guestData.avgStayLength}</p>
                                        <p className="text-xs text-muted-foreground">Noites/Estadia</p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="p-2 rounded-lg bg-amber-500/20">
                                                <Target className="h-5 w-5 text-amber-500" />
                                            </div>
                                        </div>
                                        <p className="text-2xl font-bold">{guestData.engagementScore}%</p>
                                        <p className="text-xs text-muted-foreground">Engajamento</p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="p-2 rounded-lg bg-violet-500/20">
                                                <DollarSign className="h-5 w-5 text-violet-500" />
                                            </div>
                                        </div>
                                        <p className="text-2xl font-bold">{formatCurrency(guestData.lifetimeValue)}</p>
                                        <p className="text-xs text-muted-foreground">Valor Vitalício</p>
                                    </div>
                                </div>

                                {/* Alerts Card */}
                                <div className="p-4 rounded-xl bg-muted/30 border">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-primary" />
                                        Alertas do Hóspede
                                    </h4>
                                    <div className="space-y-2">
                                        {guestData.alerts.map((alert, i) => (
                                            <div key={i} className={`p-2 rounded-lg flex items-start gap-2 text-sm ${alert.type === "positive" ? "bg-emerald-500/10 text-emerald-700" :
                                                    alert.type === "info" ? "bg-amber-500/10 text-amber-700" :
                                                        "bg-rose-500/10 text-rose-700"
                                                }`}>
                                                {alert.type === "positive" ? <ThumbsUp className="h-4 w-4 shrink-0 mt-0.5" /> :
                                                    alert.type === "info" ? <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> :
                                                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />}
                                                {alert.message}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Stays */}
                                <div className="col-span-2 p-4 rounded-xl bg-muted/30 border">
                                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <History className="h-4 w-4 text-primary" />
                                        Estadias Recentes
                                    </h4>
                                    <div className="space-y-3">
                                        {stayHistory.slice(0, 3).map((stay) => (
                                            <div key={stay.id} className="flex items-center gap-4 p-3 rounded-lg bg-background/60 border hover:border-primary/30 transition-colors">
                                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <BedDouble className="h-6 w-6 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">{stay.room}</p>
                                                        <Badge variant="outline" className="text-xs">{stay.property}</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(new Date(stay.checkIn), "dd/MM/yyyy", { locale: ptBR })} - {format(new Date(stay.checkOut), "dd/MM/yyyy", { locale: ptBR })} • {stay.nights} noites
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{formatCurrency(stay.total)}</p>
                                                    <div className="flex items-center gap-1 justify-end">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star key={star} className={`h-3 w-3 ${star <= stay.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Preferences Summary */}
                                <div className="p-4 rounded-xl bg-muted/30 border">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Heart className="h-4 w-4 text-rose-500" />
                                        Preferências
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1.5">Quarto Favorito</p>
                                            <p className="font-medium">{guestData.preferredRoomType}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1.5">Configuração de Cama</p>
                                            <p className="font-medium">{guestData.preferredBedConfig}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1.5">Andar</p>
                                            <p className="font-medium">{guestData.preferredFloor}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1.5">Pagamento</p>
                                            <p className="font-medium">{guestData.preferredPayment}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Loyalty Progress */}
                                <div className="col-span-3 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 via-primary/10 to-amber-500/10 border">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-violet-500/20">
                                                <Award className="h-5 w-5 text-violet-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">Programa de Fidelidade</h4>
                                                <p className="text-sm text-muted-foreground">Membro desde {format(new Date(guestData.memberSince), "MMMM 'de' yyyy", { locale: ptBR })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-violet-500">{guestData.loyaltyPoints.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">Pontos Atuais</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold">2.550</p>
                                                <p className="text-xs text-muted-foreground">Para próximo nível</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Progresso para Diamond</span>
                                            <span className="font-medium">83%</span>
                                        </div>
                                        <Progress value={83} className="h-2" />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Platinum - 12.450 pts</span>
                                            <span>Diamond - 15.000 pts</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Stays Tab */}
                        <TabsContent value="stays" className="p-6 mt-0">
                            <div className="space-y-4">
                                {stayHistory.map((stay) => (
                                    <div key={stay.id} className="p-4 rounded-xl bg-muted/30 border hover:border-primary/30 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center">
                                                <BedDouble className="h-8 w-8 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-semibold text-lg">{stay.room}</h4>
                                                    <Badge variant="outline">{stay.property}</Badge>
                                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        {stay.status === "completed" ? "Concluída" : stay.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {format(new Date(stay.checkIn), "dd MMM", { locale: ptBR })} - {format(new Date(stay.checkOut), "dd MMM yyyy", { locale: ptBR })}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {stay.nights} noites
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {stay.services.map((service, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs">{service}</Badge>
                                                    ))}
                                                    {stay.notes && (
                                                        <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                                                            <MessageSquare className="h-3 w-3 mr-1" />
                                                            {stay.notes}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold">{formatCurrency(stay.total)}</p>
                                                <div className="flex items-center gap-1 justify-end mt-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star key={star} className={`h-4 w-4 ${star <= stay.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">Avaliação do hóspede</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Transactions Tab */}
                        <TabsContent value="transactions" className="p-6 mt-0">
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                                    <p className="text-sm text-muted-foreground mb-1">Total Gasto</p>
                                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(guestData.totalSpent)}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                                    <p className="text-sm text-muted-foreground mb-1">Hospedagem</p>
                                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(42500)}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20">
                                    <p className="text-sm text-muted-foreground mb-1">Serviços</p>
                                    <p className="text-2xl font-bold text-violet-600">{formatCurrency(4850)}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                                    <p className="text-sm text-muted-foreground mb-1">A&B</p>
                                    <p className="text-2xl font-bold text-amber-600">{formatCurrency(1400)}</p>
                                </div>
                            </div>

                            <div className="rounded-xl border overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="text-left p-4 font-semibold text-sm">Data</th>
                                            <th className="text-left p-4 font-semibold text-sm">Descrição</th>
                                            <th className="text-left p-4 font-semibold text-sm">Método</th>
                                            <th className="text-right p-4 font-semibold text-sm">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((t) => (
                                            <tr key={t.id} className="border-t hover:bg-muted/30 transition-colors">
                                                <td className="p-4 text-sm">{format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR })}</td>
                                                <td className="p-4 text-sm font-medium">{t.description}</td>
                                                <td className="p-4 text-sm text-muted-foreground">{t.method}</td>
                                                <td className="p-4 text-sm font-semibold text-right">{formatCurrency(t.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </TabsContent>

                        {/* Preferences Tab */}
                        <TabsContent value="preferences" className="p-6 mt-0">
                            <div className="grid grid-cols-3 gap-6">
                                {/* Room Preferences */}
                                <div className="p-4 rounded-xl bg-muted/30 border">
                                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <BedDouble className="h-4 w-4 text-primary" />
                                        Preferências de Quarto
                                    </h4>
                                    <div className="space-y-3">
                                        {preferences.room.map((pref, i) => (
                                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-background/60">
                                                <pref.icon className="h-4 w-4 text-muted-foreground" />
                                                <span className="flex-1 text-sm">{pref.label}</span>
                                                <Badge variant="outline" className={`text-xs ${pref.priority === "high" ? "border-rose-500 text-rose-500" :
                                                        pref.priority === "medium" ? "border-amber-500 text-amber-500" :
                                                            "border-slate-400 text-slate-400"
                                                    }`}>
                                                    {pref.priority === "high" ? "Alta" : pref.priority === "medium" ? "Média" : "Baixa"}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div className="p-4 rounded-xl bg-muted/30 border">
                                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-amber-500" />
                                        Serviços Frequentes
                                    </h4>
                                    <div className="space-y-4">
                                        {preferences.amenities.map((amenity, i) => (
                                            <div key={i}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <amenity.icon className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{amenity.label}</span>
                                                    </div>
                                                    <span className="text-sm font-medium">{amenity.frequency}%</span>
                                                </div>
                                                <Progress value={amenity.frequency} className="h-1.5" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Dining */}
                                <div className="p-4 rounded-xl bg-muted/30 border">
                                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <UtensilsCrossed className="h-4 w-4 text-emerald-500" />
                                        Alimentação
                                    </h4>
                                    <div className="space-y-2">
                                        {preferences.dining.map((item, i) => (
                                            <div key={i} className={`p-3 rounded-lg flex items-center gap-3 ${item.type === "allergy" ? "bg-rose-500/10 border border-rose-500/20" :
                                                    item.type === "restriction" ? "bg-amber-500/10 border border-amber-500/20" :
                                                        "bg-blue-500/10 border border-blue-500/20"
                                                }`}>
                                                {item.type === "allergy" ? <AlertTriangle className="h-4 w-4 text-rose-500" /> :
                                                    item.type === "restriction" ? <XCircle className="h-4 w-4 text-amber-500" /> :
                                                        <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                                                <span className="text-sm font-medium">{item.label}</span>
                                                <Badge variant="outline" className="ml-auto text-xs">
                                                    {item.type === "allergy" ? "Alergia" : item.type === "restriction" ? "Restrição" : "Preferência"}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Interactions Tab */}
                        <TabsContent value="interactions" className="p-6 mt-0">
                            <div className="space-y-4">
                                {interactions.map((interaction) => (
                                    <div key={interaction.id} className="flex gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${interaction.type === "checkin" ? "bg-emerald-500/10" :
                                                interaction.type === "checkout" ? "bg-blue-500/10" :
                                                    interaction.type === "feedback" ? "bg-amber-500/10" :
                                                        "bg-violet-500/10"
                                            }`}>
                                            {interaction.type === "checkin" ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> :
                                                interaction.type === "checkout" ? <XCircle className="h-5 w-5 text-blue-500" /> :
                                                    interaction.type === "feedback" ? <ThumbsUp className="h-5 w-5 text-amber-500" /> :
                                                        <MessageSquare className="h-5 w-5 text-violet-500" />}
                                        </div>
                                        <div className="flex-1 pb-4 border-b">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">{interaction.title}</h4>
                                                <span className="text-sm text-muted-foreground">
                                                    {format(new Date(interaction.date), "dd/MM/yyyy", { locale: ptBR })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{interaction.details}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Insights Tab */}
                        <TabsContent value="insights" className="p-6 mt-0">
                            <div className="grid grid-cols-2 gap-6">
                                {/* Prediction Card */}
                                <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 via-violet-500/10 to-primary/5 border border-primary/20">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-primary/20">
                                            <Zap className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Previsão de Retorno</h4>
                                            <p className="text-sm text-muted-foreground">Baseado em padrões anteriores</p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-background/60 border mb-4">
                                        <p className="text-sm text-muted-foreground mb-1">Próxima estadia prevista</p>
                                        <p className="text-xl font-bold">{format(new Date(guestData.predictedNextStay), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        O hóspede tem histórico de reservas a cada 2-3 meses, geralmente em datas próximas a eventos corporativos.
                                    </p>
                                </div>

                                {/* Recommendations */}
                                <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-emerald-500/20">
                                            <Gift className="h-5 w-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Recomendações</h4>
                                            <p className="text-sm text-muted-foreground">Ações personalizadas</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="p-3 rounded-lg bg-background/60 border flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium">Oferecer upgrade gratuito</p>
                                                <p className="text-xs text-muted-foreground">Hóspede VIP com alta fidelidade</p>
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-background/60 border flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium">Enviar promoção de aniversário</p>
                                                <p className="text-xs text-muted-foreground">Próximo em 15 de março</p>
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-background/60 border flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium">Reservar pacote Spa</p>
                                                <p className="text-xs text-muted-foreground">Serviço frequente nas últimas estadias</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Behavior Analysis */}
                                <div className="col-span-2 p-5 rounded-xl bg-muted/30 border">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-violet-500/20">
                                            <BarChart3 className="h-5 w-5 text-violet-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Análise de Comportamento</h4>
                                            <p className="text-sm text-muted-foreground">Insights baseados em IA</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 rounded-lg bg-background/60 border">
                                            <h5 className="font-medium mb-2">Padrão de Reserva</h5>
                                            <p className="text-sm text-muted-foreground">
                                                Reservas geralmente feitas com 2-3 semanas de antecedência. Prefere estadias de 3-5 noites em fins de semana prolongados.
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-background/60 border">
                                            <h5 className="font-medium mb-2">Sensibilidade a Preço</h5>
                                            <p className="text-sm text-muted-foreground">
                                                Baixa sensibilidade a preço. Prioriza qualidade e conveniência. Aceita tarifas premium por serviços diferenciados.
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-background/60 border">
                                            <h5 className="font-medium mb-2">Canais Preferidos</h5>
                                            <p className="text-sm text-muted-foreground">
                                                70% das reservas via site direto. 30% via app mobile. Responde bem a campanhas de e-mail marketing.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
