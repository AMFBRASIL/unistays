import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Bell,
    AlertTriangle,
    AlertCircle,
    Info,
    CheckCircle2,
    Clock,
    Calendar,
    MapPin,
    Wrench,
    Settings,
    Filter,
    Search,
    RefreshCw,
    Eye,
    EyeOff,
    Trash2,
    MoreVertical,
    Play,
    Pause,
    Volume2,
    VolumeX,
    Mail,
    MessageSquare,
    Smartphone,
    Zap,
    Shield,
    Building,
    Wind,
    Droplets,
    BedDouble,
    ChevronRight,
    XCircle,
    Timer,
    TrendingUp,
    Activity,
    BarChart3,
    ArrowUp,
    ArrowDown,
    History,
    Archive,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { format } from "date-fns";

// ... mocks removed

const categoryIcons: Record<string, any> = {
    elevator: Building,
    security: Shield,
    hvac: Wind,
    electrical: Zap,
    hydraulic: Droplets,
    rooms: BedDouble,
};

interface MaintenanceAlertsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MaintenanceAlertsModal({ open, onOpenChange }: MaintenanceAlertsModalProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("active");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterPriority, setFilterPriority] = useState("all");
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [pushAlerts, setPushAlerts] = useState(true);
    const [smsAlerts, setSmsAlerts] = useState(false);

    const [alerts, setAlerts] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        critical: 0,
        warning: 0,
        info: 0,
        unread: 0,
        resolvedToday: 0
    });

    useEffect(() => {
        if (open) {
            loadAlerts();
        }
    }, [open]);

    const loadAlerts = async () => {
        setLoading(true);
        try {
            const response = await api.getMaintenanceOrders();
            if (response.success && response.data) {
                const allOrders = response.data.maintenanceOrders || []; // Adjusted based on previous findings

                // Filter for Active Alerts
                const active = allOrders.filter((o: any) =>
                    (o.status === 'overdue' || o.priority === 'critical' || o.priority === 'high') &&
                    o.status !== 'completed' && o.status !== 'cancelled'
                ).map((o: any) => ({
                    ...o,
                    type: o.priority === 'critical' ? 'critical' : o.status === 'overdue' ? 'warning' : 'info', // Map to alert types
                    message: `${o.equipment} - ${o.title}`,
                    createdAt: o.createdAt ? format(new Date(o.createdAt), "dd/MM HH:mm") : '-',
                    dueDate: o.dueDate ? format(new Date(o.dueDate), "dd/MM/yyyy") : null,
                    isRead: false // TODO: Backend support for read status
                }));

                setAlerts(active);

                // History
                const hist = allOrders.filter((o: any) => o.status === 'completed')
                    .sort((a: any, b: any) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime())
                    .slice(0, 50)
                    .map((o: any) => ({
                        id: o.id,
                        title: o.title,
                        equipment: o.equipment,
                        date: o.completedDate ? format(new Date(o.completedDate), "dd/MM") : '-',
                        status: 'resolved'
                    }));
                setHistory(hist);

                // Stats
                setStats({
                    total: active.length,
                    critical: active.filter((a: any) => a.priority === 'critical').length,
                    warning: active.filter((a: any) => a.type === 'warning').length,
                    info: active.filter((a: any) => a.type === 'info').length,
                    unread: active.length, // Assuming all unread for now
                    resolvedToday: hist.filter((h: any) => h.date === format(new Date(), "dd/MM")).length
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro",
                description: "Falha ao carregar alertas.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case "critical":
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case "warning":
                return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case "info":
                return <Info className="w-5 h-5 text-blue-500" />;
            default:
                return <Bell className="w-5 h-5 text-muted-foreground" />;
        }
    };

    const getAlertStyle = (type: string) => {
        switch (type) {
            case "critical":
                return "border-red-500/30 bg-red-500/5";
            case "warning":
                return "border-amber-500/30 bg-amber-500/5";
            case "info":
                return "border-blue-500/30 bg-blue-500/5";
            default:
                return "border-border/50 bg-background/50";
        }
    };

    const getPriorityBadge = (priority: string) => {
        const styles: Record<string, string> = {
            critical: "bg-red-500/10 text-red-500 border-red-500/20",
            high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
            medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
            low: "bg-green-500/10 text-green-500 border-green-500/20",
        };
        const labels: Record<string, string> = {
            critical: "Crítico",
            high: "Alta",
            medium: "Média",
            low: "Baixa",
        };
        return (
            <Badge variant="outline" className={styles[priority]}>
                {labels[priority]}
            </Badge>
        );
    };

    const handleMarkAsRead = (id: number) => {
        toast({
            title: "Alerta Marcado",
            description: "O alerta foi marcado como lido.",
        });
    };

    const handleResolveAlert = (id: number) => {
        toast({
            title: "Alerta Resolvido",
            description: "O alerta foi marcado como resolvido.",
        });
    };

    const handleDeleteAlert = (id: number) => {
        toast({
            title: "Alerta Removido",
            description: "O alerta foi removido da lista.",
        });
    };

    const handleMarkAllAsRead = () => {
        toast({
            title: "Todos Lidos",
            description: "Todos os alertas foram marcados como lidos.",
        });
    };

    const filteredAlerts = alerts.filter(alert => {
        const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "all" || alert.type === filterType;
        const matchesPriority = filterPriority === "all" || alert.priority === filterPriority;
        return matchesSearch && matchesType && matchesPriority;
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b border-border/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 relative">
                                <Bell className="w-5 h-5 text-amber-500" />
                                {stats.unread > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {stats.unread}
                                    </span>
                                )}
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold">Central de Alertas</DialogTitle>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    Gerencie todos os alertas de manutenção
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Marcar Todos como Lidos
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                {/* Stats Cards */}
                <div className="px-6 py-4 bg-muted/20 border-b border-border/50">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                        <Card className="bg-card/50 border-border/50">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-blue-500/10">
                                        <Bell className="w-3.5 h-3.5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold">{stats.total}</p>
                                        <p className="text-xs text-muted-foreground">Total</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 border-red-500/20">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-red-500/10">
                                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-red-500">{stats.critical}</p>
                                        <p className="text-xs text-muted-foreground">Críticos</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 border-amber-500/20">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-amber-500/10">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-amber-500">{stats.warning}</p>
                                        <p className="text-xs text-muted-foreground">Avisos</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 border-blue-500/20">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-blue-500/10">
                                        <Info className="w-3.5 h-3.5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-blue-500">{stats.info}</p>
                                        <p className="text-xs text-muted-foreground">Info</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 border-purple-500/20">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-purple-500/10">
                                        <Eye className="w-3.5 h-3.5 text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-purple-500">{stats.unread}</p>
                                        <p className="text-xs text-muted-foreground">Não Lidos</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 border-emerald-500/20">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-emerald-500/10">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-emerald-500">{stats.resolvedToday}</p>
                                        <p className="text-xs text-muted-foreground">Resolvidos Hoje</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex h-[calc(90vh-300px)]">
                    {/* Sidebar */}
                    <div className="w-56 border-r border-border/50 bg-muted/20">
                        <ScrollArea className="h-full py-4">
                            <div className="px-3 space-y-1">
                                {[
                                    { id: "active", label: "Alertas Ativos", icon: Bell, count: stats.total },
                                    { id: "critical", label: "Críticos", icon: AlertCircle, count: stats.critical, color: "text-red-500" },
                                    { id: "warning", label: "Avisos", icon: AlertTriangle, count: stats.warning, color: "text-amber-500" },
                                    { id: "info", label: "Informativos", icon: Info, count: stats.info, color: "text-blue-500" },
                                    { id: "history", label: "Histórico", icon: History, count: null },
                                    { id: "settings", label: "Configurações", icon: Settings, count: null },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                            activeTab === item.id
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className={cn("w-4 h-4", item.color && activeTab !== item.id && item.color)} />
                                            {item.label}
                                        </div>
                                        {item.count !== null && (
                                            <Badge variant="secondary" className="text-xs h-5">
                                                {item.count}
                                            </Badge>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Main Content */}
                    <ScrollArea className="flex-1">
                        <div className="p-6">
                            {/* Active Alerts */}
                            {(activeTab === "active" || activeTab === "critical" || activeTab === "warning" || activeTab === "info") && (
                                <div className="space-y-4">
                                    {/* Filters */}
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Buscar alertas..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                        <Select value={filterType} onValueChange={setFilterType}>
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue placeholder="Tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos os tipos</SelectItem>
                                                <SelectItem value="critical">Crítico</SelectItem>
                                                <SelectItem value="warning">Aviso</SelectItem>
                                                <SelectItem value="info">Informativo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={filterPriority} onValueChange={setFilterPriority}>
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue placeholder="Prioridade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas</SelectItem>
                                                <SelectItem value="critical">Crítica</SelectItem>
                                                <SelectItem value="high">Alta</SelectItem>
                                                <SelectItem value="medium">Média</SelectItem>
                                                <SelectItem value="low">Baixa</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button variant="outline" size="icon">
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Alert List */}
                                    <div className="space-y-3">
                                        {filteredAlerts
                                            .filter(a => activeTab === "active" || a.type === activeTab)
                                            .map((alert) => {
                                                const CategoryIcon = categoryIcons[alert.category] || Wrench;
                                                return (
                                                    <div
                                                        key={alert.id}
                                                        className={cn(
                                                            "p-4 rounded-xl border transition-all",
                                                            getAlertStyle(alert.type),
                                                            !alert.isRead && "ring-1 ring-primary/20"
                                                        )}
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div className={cn(
                                                                "p-2 rounded-lg",
                                                                alert.type === "critical" ? "bg-red-500/10" :
                                                                    alert.type === "warning" ? "bg-amber-500/10" : "bg-blue-500/10"
                                                            )}>
                                                                {getAlertIcon(alert.type)}
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <h4 className="font-semibold">{alert.title}</h4>
                                                                            {!alert.isRead && (
                                                                                <Badge className="bg-primary text-primary-foreground text-xs h-5">
                                                                                    Novo
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                                                                    </div>
                                                                    {getPriorityBadge(alert.priority)}
                                                                </div>

                                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                                                    <span className="flex items-center gap-1">
                                                                        <CategoryIcon className="w-3 h-3" />
                                                                        {alert.equipment}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <MapPin className="w-3 h-3" />
                                                                        {alert.location}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {alert.createdAt}
                                                                    </span>
                                                                    {alert.dueDate && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Calendar className="w-3 h-3" />
                                                                            Vence: {alert.dueDate}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(alert.id)}>
                                                                        <Eye className="w-3 h-3 mr-1" />
                                                                        {alert.isRead ? "Lido" : "Marcar como Lido"}
                                                                    </Button>
                                                                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => handleResolveAlert(alert.id)}>
                                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                        Resolver
                                                                    </Button>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button size="icon" variant="ghost" className="h-8 w-8">
                                                                                <MoreVertical className="w-4 h-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem>
                                                                                <Wrench className="w-4 h-4 mr-2" />
                                                                                Criar Ordem de Serviço
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem>
                                                                                <Timer className="w-4 h-4 mr-2" />
                                                                                Adiar Alerta
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem>
                                                                                <Archive className="w-4 h-4 mr-2" />
                                                                                Arquivar
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem
                                                                                className="text-red-500"
                                                                                onClick={() => handleDeleteAlert(alert.id)}
                                                                            >
                                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                                Excluir
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                        {filteredAlerts.length === 0 && (
                                            <div className="text-center py-12">
                                                <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                                                <h3 className="font-semibold mb-1">Nenhum alerta encontrado</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Não há alertas correspondentes aos filtros selecionados
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* History Tab */}
                            {activeTab === "history" && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Histórico de Alertas</h3>
                                    <div className="space-y-3">
                                        {history.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "p-2 rounded-lg",
                                                        item.status === "resolved" ? "bg-emerald-500/10" : "bg-muted"
                                                    )}>
                                                        {item.status === "resolved" ? (
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                        ) : (
                                                            <Archive className="w-4 h-4 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{item.title}</p>
                                                        <p className="text-sm text-muted-foreground">{item.equipment}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-muted-foreground">{item.date}</span>
                                                    <Badge variant="outline" className={
                                                        item.status === "resolved"
                                                            ? "bg-emerald-500/10 text-emerald-500"
                                                            : "bg-muted text-muted-foreground"
                                                    }>
                                                        {item.status === "resolved" ? "Resolvido" : "Arquivado"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Settings Tab */}
                            {activeTab === "settings" && (
                                <div className="space-y-6">
                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Bell className="w-4 h-4 text-amber-500" />
                                                Notificações
                                            </CardTitle>
                                            <CardDescription>Configure como deseja receber alertas</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                                        <Volume2 className="w-4 h-4 text-blue-500" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label>Som de Alerta</Label>
                                                        <p className="text-sm text-muted-foreground">Tocar som para alertas críticos</p>
                                                    </div>
                                                </div>
                                                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-purple-500/10">
                                                        <Mail className="w-4 h-4 text-purple-500" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label>E-mail</Label>
                                                        <p className="text-sm text-muted-foreground">Receber alertas por e-mail</p>
                                                    </div>
                                                </div>
                                                <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-emerald-500/10">
                                                        <Smartphone className="w-4 h-4 text-emerald-500" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label>Push Notifications</Label>
                                                        <p className="text-sm text-muted-foreground">Notificações no navegador</p>
                                                    </div>
                                                </div>
                                                <Switch checked={pushAlerts} onCheckedChange={setPushAlerts} />
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-cyan-500/10">
                                                        <MessageSquare className="w-4 h-4 text-cyan-500" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label>SMS</Label>
                                                        <p className="text-sm text-muted-foreground">Alertas críticos por SMS</p>
                                                    </div>
                                                </div>
                                                <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Filter className="w-4 h-4 text-blue-500" />
                                                Regras de Alerta
                                            </CardTitle>
                                            <CardDescription>Configure quando os alertas devem ser enviados</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Alertas antes do vencimento</Label>
                                                    <p className="text-sm text-muted-foreground">Dias antes da data de vencimento</p>
                                                </div>
                                                <Select defaultValue="7">
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="3">3 dias</SelectItem>
                                                        <SelectItem value="7">7 dias</SelectItem>
                                                        <SelectItem value="14">14 dias</SelectItem>
                                                        <SelectItem value="30">30 dias</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Lembrete de acompanhamento</Label>
                                                    <p className="text-sm text-muted-foreground">Intervalo para reenvio de alertas não resolvidos</p>
                                                </div>
                                                <Select defaultValue="24">
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="6">6 horas</SelectItem>
                                                        <SelectItem value="12">12 horas</SelectItem>
                                                        <SelectItem value="24">24 horas</SelectItem>
                                                        <SelectItem value="48">48 horas</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Timer className="w-4 h-4 text-emerald-500" />
                                                Horário de Silêncio
                                            </CardTitle>
                                            <CardDescription>Período em que não serão enviadas notificações</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Início</Label>
                                                    <Input type="time" defaultValue="22:00" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Fim</Label>
                                                    <Input type="time" defaultValue="07:00" />
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-3">
                                                * Alertas críticos serão enviados mesmo durante o horário de silêncio
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border/50 bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Activity className="w-4 h-4" />
                        Última atualização: agora
                    </div>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Fechar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
