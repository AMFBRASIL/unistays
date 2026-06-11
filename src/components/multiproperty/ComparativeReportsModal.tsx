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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    BedDouble,
    Users,
    Star,
    Download,
    Calendar,
    Filter,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    Award,
    PieChart,
    LineChart,
    BarChart,
    Activity,
    Zap,
    Building2,
    MapPin,
    Clock,
    FileSpreadsheet,
    FileText,
    Mail,
    Printer,
    Share2,
    X,
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
}

interface ComparativeReportsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    properties: Property[];
}

// Extended mock data for reports
const performanceData = {
    occupancy: [
        { property: "Grand Hotel São Paulo", current: 87, previous: 82, target: 85 },
        { property: "Resort Praia do Forte", current: 92, previous: 88, target: 90 },
        { property: "Pousada Serra Gaúcha", current: 78, previous: 82, target: 85 },
        { property: "Business Hotel Brasília", current: 65, previous: 60, target: 75 },
    ],
    revenue: [
        { property: "Grand Hotel São Paulo", current: 485000, previous: 432000, target: 500000 },
        { property: "Resort Praia do Forte", current: 620000, previous: 525000, target: 600000 },
        { property: "Pousada Serra Gaúcha", current: 145000, previous: 152000, target: 160000 },
        { property: "Business Hotel Brasília", current: 380000, previous: 350000, target: 400000 },
    ],
    revpar: [
        { property: "Grand Hotel São Paulo", current: 320, previous: 290, target: 350 },
        { property: "Resort Praia do Forte", current: 485, previous: 420, target: 480 },
        { property: "Pousada Serra Gaúcha", current: 280, previous: 295, target: 320 },
        { property: "Business Hotel Brasília", current: 195, previous: 180, target: 220 },
    ],
    adr: [
        { property: "Grand Hotel São Paulo", current: 368, previous: 354, target: 400 },
        { property: "Resort Praia do Forte", current: 527, previous: 477, target: 530 },
        { property: "Pousada Serra Gaúcha", current: 359, previous: 360, target: 380 },
        { property: "Business Hotel Brasília", current: 300, previous: 300, target: 320 },
    ],
};

const channelData = [
    { channel: "Direto (Site)", percentage: 35, revenue: 570500 },
    { channel: "Booking.com", percentage: 25, revenue: 407500 },
    { channel: "Expedia", percentage: 15, revenue: 244500 },
    { channel: "Corporativo", percentage: 15, revenue: 244500 },
    { channel: "OTAs Outras", percentage: 10, revenue: 163000 },
];

const guestSegments = [
    { segment: "Lazer", percentage: 45, guests: 1250 },
    { segment: "Negócios", percentage: 30, guests: 833 },
    { segment: "Grupos", percentage: 15, guests: 417 },
    { segment: "Eventos", percentage: 10, guests: 278 },
];

export function ComparativeReportsModal({
    open,
    onOpenChange,
    properties,
}: ComparativeReportsModalProps) {
    const [selectedPeriod, setSelectedPeriod] = useState("month");
    const [selectedProperties, setSelectedProperties] = useState<string[]>(
        properties.filter((p) => p.status === "active").map((p) => p.id)
    );
    const [activeTab, setActiveTab] = useState("overview");

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatPercentage = (current: number, previous: number) => {
        const change = ((current - previous) / previous) * 100;
        return {
            value: Math.abs(change).toFixed(1),
            isPositive: change >= 0,
        };
    };

    const toggleProperty = (propertyId: string) => {
        setSelectedProperties((prev) =>
            prev.includes(propertyId)
                ? prev.filter((id) => id !== propertyId)
                : [...prev, propertyId]
        );
    };

    const activeProperties = properties.filter((p) => p.status === "active");

    const getProgressColor = (current: number, target: number) => {
        const percentage = (current / target) * 100;
        if (percentage >= 100) return "bg-emerald-500";
        if (percentage >= 80) return "bg-amber-500";
        return "bg-red-500";
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
                <div className="flex flex-col h-[85vh]">
                    {/* Header */}
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between mb-4">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3 text-xl">
                                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                                        <BarChart3 className="w-6 h-6 text-primary" />
                                    </div>
                                    Relatórios Comparativos
                                </DialogTitle>
                            </DialogHeader>
                            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-4">
                            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                <SelectTrigger className="w-[160px]">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="week">Última Semana</SelectItem>
                                    <SelectItem value="month">Último Mês</SelectItem>
                                    <SelectItem value="quarter">Último Trimestre</SelectItem>
                                    <SelectItem value="year">Último Ano</SelectItem>
                                    <SelectItem value="ytd">Ano Corrente</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-muted-foreground">Propriedades:</span>
                                {activeProperties.map((property) => (
                                    <Label
                                        key={property.id}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all text-sm",
                                            selectedProperties.includes(property.id)
                                                ? "bg-primary/10 border-primary/30 text-primary"
                                                : "border-border hover:border-primary/50"
                                        )}
                                    >
                                        <Checkbox
                                            checked={selectedProperties.includes(property.id)}
                                            onCheckedChange={() => toggleProperty(property.id)}
                                            className="w-4 h-4"
                                        />
                                        {property.name.split(" ")[0]}
                                    </Label>
                                ))}
                            </div>

                            <div className="ml-auto flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Atualizar
                                </Button>
                                <Button variant="outline" size="sm">
                                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                                    Excel
                                </Button>
                                <Button variant="outline" size="sm">
                                    <FileText className="w-4 h-4 mr-2" />
                                    PDF
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Email
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <div className="px-6 border-b">
                            <TabsList className="h-12">
                                <TabsTrigger value="overview" className="gap-2">
                                    <Activity className="w-4 h-4" />
                                    Visão Geral
                                </TabsTrigger>
                                <TabsTrigger value="occupancy" className="gap-2">
                                    <BedDouble className="w-4 h-4" />
                                    Ocupação
                                </TabsTrigger>
                                <TabsTrigger value="revenue" className="gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    Receita
                                </TabsTrigger>
                                <TabsTrigger value="kpis" className="gap-2">
                                    <Target className="w-4 h-4" />
                                    KPIs
                                </TabsTrigger>
                                <TabsTrigger value="channels" className="gap-2">
                                    <PieChart className="w-4 h-4" />
                                    Canais
                                </TabsTrigger>
                                <TabsTrigger value="guests" className="gap-2">
                                    <Users className="w-4 h-4" />
                                    Hóspedes
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            {/* Overview Tab */}
                            <TabsContent value="overview" className="m-0 space-y-6">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <BedDouble className="w-5 h-5 text-blue-500" />
                                            <div className="flex items-center gap-1 text-emerald-500">
                                                <ArrowUpRight className="w-3 h-3" />
                                                <span className="text-xs">+5.2%</span>
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold">76.4%</div>
                                        <p className="text-xs text-muted-foreground">Ocupação Média</p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <DollarSign className="w-5 h-5 text-emerald-500" />
                                            <div className="flex items-center gap-1 text-emerald-500">
                                                <ArrowUpRight className="w-3 h-3" />
                                                <span className="text-xs">+12.8%</span>
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold">{formatCurrency(1630000)}</div>
                                        <p className="text-xs text-muted-foreground">Receita Total</p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <Target className="w-5 h-5 text-violet-500" />
                                            <div className="flex items-center gap-1 text-emerald-500">
                                                <ArrowUpRight className="w-3 h-3" />
                                                <span className="text-xs">+8.4%</span>
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold">{formatCurrency(320)}</div>
                                        <p className="text-xs text-muted-foreground">RevPAR Médio</p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <Star className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div className="text-2xl font-bold">4.64</div>
                                        <p className="text-xs text-muted-foreground">Avaliação Média</p>
                                    </div>
                                </div>

                                {/* Property Comparison */}
                                <div className="rounded-xl border overflow-hidden">
                                    <div className="p-4 bg-muted/30 border-b">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <BarChart className="w-5 h-5 text-primary" />
                                            Comparativo por Propriedade
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-muted/20">
                                                <tr className="text-sm">
                                                    <th className="text-left p-4 font-medium">Propriedade</th>
                                                    <th className="text-center p-4 font-medium">Ocupação</th>
                                                    <th className="text-center p-4 font-medium">Receita</th>
                                                    <th className="text-center p-4 font-medium">RevPAR</th>
                                                    <th className="text-center p-4 font-medium">ADR</th>
                                                    <th className="text-center p-4 font-medium">Rating</th>
                                                    <th className="text-center p-4 font-medium">Tendência</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activeProperties.map((property) => (
                                                    <tr key={property.id} className="border-t hover:bg-muted/10">
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                    <Building2 className="w-5 h-5 text-primary" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{property.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{property.location}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <div className="inline-flex items-center gap-2">
                                                                <Progress value={property.occupancy} className="w-16 h-2" />
                                                                <span className="font-medium">{property.occupancy}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center font-medium">
                                                            {formatCurrency(property.revenue)}
                                                        </td>
                                                        <td className="p-4 text-center font-medium">
                                                            {formatCurrency(property.revpar)}
                                                        </td>
                                                        <td className="p-4 text-center font-medium">
                                                            {formatCurrency(property.adr)}
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <div className="inline-flex items-center gap-1">
                                                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                                <span className="font-medium">{property.rating}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <div className="inline-flex items-center gap-1 text-emerald-500">
                                                                <TrendingUp className="w-4 h-4" />
                                                                <span className="text-sm font-medium">+12%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Occupancy Tab */}
                            <TabsContent value="occupancy" className="m-0 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {performanceData.occupancy.map((data, index) => (
                                        <div key={index} className="p-4 rounded-xl border">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-medium">{data.property}</h4>
                                                <div
                                                    className={cn(
                                                        "flex items-center gap-1 text-sm font-medium",
                                                        data.current >= data.previous ? "text-emerald-500" : "text-red-500"
                                                    )}
                                                >
                                                    {data.current >= data.previous ? (
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    ) : (
                                                        <ArrowDownRight className="w-4 h-4" />
                                                    )}
                                                    {Math.abs(((data.current - data.previous) / data.previous) * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>Atual</span>
                                                        <span className="font-semibold">{data.current}%</span>
                                                    </div>
                                                    <Progress value={data.current} className="h-3" />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-muted-foreground">Período Anterior</span>
                                                        <span>{data.previous}%</span>
                                                    </div>
                                                    <Progress value={data.previous} className="h-2 opacity-50" />
                                                </div>
                                                <div className="pt-2 border-t">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Meta</span>
                                                        <span className="font-medium">{data.target}%</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Progress
                                                            value={(data.current / data.target) * 100}
                                                            className={cn("h-1.5 flex-1", getProgressColor(data.current, data.target))}
                                                        />
                                                        <span className="text-xs text-muted-foreground">
                                                            {((data.current / data.target) * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 rounded-xl bg-muted/50 border">
                                    <h4 className="font-medium flex items-center gap-2 mb-3">
                                        <Award className="w-5 h-5 text-primary" />
                                        Ranking de Ocupação
                                    </h4>
                                    <div className="space-y-3">
                                        {performanceData.occupancy
                                            .sort((a, b) => b.current - a.current)
                                            .map((data, index) => (
                                                <div key={index} className="flex items-center gap-4">
                                                    <div
                                                        className={cn(
                                                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                                            index === 0
                                                                ? "bg-amber-500 text-white"
                                                                : index === 1
                                                                    ? "bg-gray-400 text-white"
                                                                    : index === 2
                                                                        ? "bg-amber-700 text-white"
                                                                        : "bg-muted text-muted-foreground"
                                                        )}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium">{data.property}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-lg">{data.current}%</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {data.current >= data.target ? "✓ Meta atingida" : `Falta ${data.target - data.current}%`}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Revenue Tab */}
                            <TabsContent value="revenue" className="m-0 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {performanceData.revenue.map((data, index) => (
                                        <div key={index} className="p-4 rounded-xl border">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-medium">{data.property}</h4>
                                                <div
                                                    className={cn(
                                                        "flex items-center gap-1 text-sm font-medium",
                                                        data.current >= data.previous ? "text-emerald-500" : "text-red-500"
                                                    )}
                                                >
                                                    {data.current >= data.previous ? (
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    ) : (
                                                        <ArrowDownRight className="w-4 h-4" />
                                                    )}
                                                    {Math.abs(((data.current - data.previous) / data.previous) * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>Receita Atual</span>
                                                        <span className="font-semibold">{formatCurrency(data.current)}</span>
                                                    </div>
                                                    <Progress value={(data.current / data.target) * 100} className="h-3" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-2">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Período Anterior</p>
                                                        <p className="font-medium">{formatCurrency(data.previous)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Meta</p>
                                                        <p className="font-medium">{formatCurrency(data.target)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* KPIs Tab */}
                            <TabsContent value="kpis" className="m-0 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="rounded-xl border overflow-hidden">
                                        <div className="p-4 bg-muted/30 border-b">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <Target className="w-5 h-5 text-primary" />
                                                RevPAR Comparativo
                                            </h4>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            {performanceData.revpar.map((data, index) => (
                                                <div key={index} className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">{data.property}</span>
                                                        <span className="font-semibold">{formatCurrency(data.current)}</span>
                                                    </div>
                                                    <Progress value={(data.current / 500) * 100} className="h-2" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border overflow-hidden">
                                        <div className="p-4 bg-muted/30 border-b">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <DollarSign className="w-5 h-5 text-primary" />
                                                ADR Comparativo
                                            </h4>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            {performanceData.adr.map((data, index) => (
                                                <div key={index} className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">{data.property}</span>
                                                        <span className="font-semibold">{formatCurrency(data.current)}</span>
                                                    </div>
                                                    <Progress value={(data.current / 600) * 100} className="h-2" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Channels Tab */}
                            <TabsContent value="channels" className="m-0 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="rounded-xl border overflow-hidden">
                                        <div className="p-4 bg-muted/30 border-b">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <PieChart className="w-5 h-5 text-primary" />
                                                Distribuição por Canal
                                            </h4>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            {channelData.map((channel, index) => (
                                                <div key={index} className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium">{channel.channel}</span>
                                                        <span className="text-sm">{channel.percentage}%</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={channel.percentage} className="h-3 flex-1" />
                                                        <span className="text-xs text-muted-foreground w-24 text-right">
                                                            {formatCurrency(channel.revenue)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border overflow-hidden">
                                        <div className="p-4 bg-muted/30 border-b">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <Zap className="w-5 h-5 text-primary" />
                                                Insights de Canais
                                            </h4>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                                                    <span className="font-medium text-emerald-600">Canal Direto em Alta</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Reservas diretas cresceram 15% este mês, reduzindo custos de comissão.
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Activity className="w-4 h-4 text-amber-500" />
                                                    <span className="font-medium text-amber-600">Oportunidade Corporativo</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Segmento corporativo tem potencial de crescimento de 20%.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Guests Tab */}
                            <TabsContent value="guests" className="m-0 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="rounded-xl border overflow-hidden">
                                        <div className="p-4 bg-muted/30 border-b">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <Users className="w-5 h-5 text-primary" />
                                                Segmentos de Hóspedes
                                            </h4>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            {guestSegments.map((segment, index) => (
                                                <div key={index} className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium">{segment.segment}</span>
                                                        <span className="text-sm">{segment.percentage}%</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={segment.percentage} className="h-3 flex-1" />
                                                        <span className="text-xs text-muted-foreground w-20 text-right">
                                                            {segment.guests} hósp.
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border overflow-hidden">
                                        <div className="p-4 bg-muted/30 border-b">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <Star className="w-5 h-5 text-primary" />
                                                Satisfação por Propriedade
                                            </h4>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            {activeProperties
                                                .sort((a, b) => b.rating - a.rating)
                                                .map((property, index) => (
                                                    <div key={property.id} className="flex items-center gap-3">
                                                        <div
                                                            className={cn(
                                                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                                                index === 0 ? "bg-amber-500 text-white" : "bg-muted"
                                                            )}
                                                        >
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{property.name}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                            <span className="font-semibold">{property.rating}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
