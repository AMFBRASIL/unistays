import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Globe,
  Store,
  Phone,
  Building2,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Sparkles,
  Settings,
  Link2,
  DollarSign,
  Percent,
  Calendar,
  Clock,
  Eye,
  Edit,
  Trash2,
  Search,
  ArrowUpRight,
  Zap,
  BarChart3,
  TrendingUp,
  Users,
  Star,
  CircleDollarSign,
  FileText,
  Send,
  Download,
  Share2,
  Printer,
  ExternalLink,
  Hotel,
  Plane,
  Briefcase,
  Heart,
  ShoppingCart,
  MessageSquare,
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface SalesChannelsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ChannelType = "ota" | "direct" | "corporate" | "metasearch" | "social" | "gds";

interface SalesChannel {
  id: string;
  name: string;
  type: ChannelType;
  logo: string;
  status: "active" | "inactive" | "pending" | "suspended";
  commission: number;
  bookings: number;
  revenue: number;
  lastSync?: string;
}

interface CatalogItem {
  id: string;
  code: string;
  name: string;
  logo: string;
  type: ChannelType;
  description: string | null;
  popularity: number;
}

const channelTypeConfig: Record<ChannelType, { label: string; color: string; icon: typeof Globe; description: string }> = {
  ota: { 
    label: "OTA", 
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20", 
    icon: Globe,
    description: "Agências de viagem online"
  },
  direct: { 
    label: "Direto", 
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", 
    icon: Store,
    description: "Canais próprios do hotel"
  },
  corporate: { 
    label: "Corporativo", 
    color: "bg-violet-500/10 text-violet-600 border-violet-500/20", 
    icon: Building2,
    description: "Contratos empresariais"
  },
  metasearch: { 
    label: "Metasearch", 
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20", 
    icon: Search,
    description: "Comparadores de preços"
  },
  social: { 
    label: "Social", 
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20", 
    icon: Heart,
    description: "Redes sociais e influenciadores"
  },
  gds: { 
    label: "GDS", 
    color: "bg-slate-500/10 text-slate-600 border-slate-500/20", 
    icon: Plane,
    description: "Sistemas de distribuição global"
  },
};

function formatLastSync(d: string | null | undefined): string | undefined {
  if (!d) return undefined;
  const date = new Date(d);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Agora";
  if (diffMin < 60) return `${diffMin} min atrás`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD} dia(s) atrás`;
}

const steps = [
  { id: 1, title: "Visão Geral", icon: BarChart3 },
  { id: 2, title: "Adicionar Canal", icon: Plus },
  { id: 3, title: "Configuração", icon: Settings },
  { id: 4, title: "Comissões", icon: Percent },
  { id: 5, title: "Ativação", icon: Zap },
];

export function SalesChannelsModal({ open, onOpenChange }: SalesChannelsModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<ChannelType | "all">("all");
  const [selectedChannel, setSelectedChannel] = useState<CatalogItem | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [channels, setChannels] = useState<SalesChannel[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [propertyId, setPropertyId] = useState<number | null>(null);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchChannels = useCallback(async () => {
    setLoadingChannels(true);
    try {
      const res = await api.getBookingChannels({ all: true, propertyId: propertyId ?? undefined });
      const list = (res?.data as { channels?: unknown[] })?.channels ?? [];
      const raw = Array.isArray(list) ? list : [];
      setChannels(
        raw.map((ch: Record<string, unknown>) => ({
          id: String(ch.id),
          name: String(ch.name ?? ""),
          type: (ch.type as ChannelType) ?? "direct",
          logo: String(ch.logo ?? ""),
          status: (ch.status as SalesChannel["status"]) ?? "pending",
          commission: Number(ch.commissionValue ?? 0),
          bookings: Number(ch.totalBookings ?? 0),
          revenue: Number(ch.totalRevenue ?? 0),
          lastSync: formatLastSync(ch.lastSyncAt as string | null),
        }))
      );
    } catch {
      setChannels([]);
    } finally {
      setLoadingChannels(false);
    }
  }, [propertyId]);

  const fetchCatalog = useCallback(async () => {
    setLoadingCatalog(true);
    try {
      const res = await api.getBookingChannelCatalog();
      const list = (res?.data as { catalog?: unknown[] })?.catalog ?? [];
      const raw = Array.isArray(list) ? list : [];
      setCatalog(
        raw.map((c: Record<string, unknown>) => ({
          id: String(c.id ?? c.code),
          code: String(c.code ?? c.id),
          name: String(c.name ?? ""),
          logo: String(c.logo ?? ""),
          type: (c.type as ChannelType) ?? "direct",
          description: (c.description as string) ?? null,
          popularity: Number(c.popularity ?? 50),
        }))
      );
    } catch {
      setCatalog([]);
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  const fetchFirstProperty = useCallback(async () => {
    try {
      const res = await api.getProperties();
      const list = (res?.data as { properties?: { id: number }[] })?.properties ?? res?.data ?? [];
      const arr = Array.isArray(list) ? list : [];
      const first = arr[0] as { id: number } | undefined;
      if (first?.id) setPropertyId(first.id);
    } catch {
      setPropertyId(null);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchFirstProperty();
      fetchChannels();
      fetchCatalog();
    }
  }, [open, fetchFirstProperty, fetchChannels, fetchCatalog]);

  useEffect(() => {
    if (open && propertyId != null) fetchChannels();
  }, [open, propertyId, fetchChannels]);

  // Form states
  const [channelConfig, setChannelConfig] = useState({
    apiKey: "",
    hotelId: "",
    autoSync: true,
    syncInterval: "15",
    rateMapping: "automatic",
    availabilitySync: true,
    restrictionsSync: true,
    priceSync: true,
  });

  const [commissionConfig, setCommissionConfig] = useState({
    commissionType: "percentage",
    commissionValue: "",
    paymentTerms: "monthly",
    minCommission: "",
    maxCommission: "",
    applyToAllRates: true,
  });

  const [activationConfig, setActivationConfig] = useState({
    activateNow: true,
    scheduledDate: "",
    notifyTeam: true,
    testMode: false,
    syncInventory: true,
  });

  const totalBookings = channels.reduce((acc, ch) => acc + ch.bookings, 0);
  const totalRevenue = channels.reduce((acc, ch) => acc + ch.revenue, 0);
  const activeChannelsCount = channels.filter(ch => ch.status === "active").length;
  const withCommission = channels.filter(ch => ch.commission > 0);
  const avgCommission = withCommission.length > 0 ? withCommission.reduce((acc, ch) => acc + ch.commission, 0) / withCommission.length : 0;

  const filteredAvailableChannels = catalog.filter(ch => {
    const matchesSearch = ch.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || ch.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedChannel || !propertyId) {
      toast.error("Selecione um canal e verifique a propriedade.");
      return;
    }
    setSubmitting(true);
    try {
      const commissionVal = commissionConfig.commissionType === "percentage"
        ? Number(commissionConfig.commissionValue) || 0
        : 0;
      const res = await api.createBookingChannel({
        propertyId,
        name: selectedChannel.name,
        slug: selectedChannel.code,
        catalogCode: selectedChannel.code,
        type: selectedChannel.type,
        logo: selectedChannel.logo || null,
        description: selectedChannel.description ?? null,
        status: activationConfig.activateNow ? "active" : "pending",
        commissionType: selectedChannel.type === "direct" ? "none" : (commissionConfig.commissionType as "percentage" | "fixed" | "none"),
        commissionValue: selectedChannel.type === "direct" ? 0 : commissionVal,
        apiKey: selectedChannel.type !== "direct" ? (channelConfig.apiKey || null) : null,
        hotelId: selectedChannel.type !== "direct" ? (channelConfig.hotelId || null) : null,
        autoSync: channelConfig.autoSync,
        syncInterval: Number(channelConfig.syncInterval) || 15,
        syncPrices: channelConfig.priceSync,
        syncAvailability: channelConfig.availabilitySync,
        syncRestrictions: channelConfig.restrictionsSync,
        paymentTerms: commissionConfig.paymentTerms as string,
        applyToAllRates: commissionConfig.applyToAllRates,
        notifyTeamOnBooking: activationConfig.notifyTeam,
        activateNow: activationConfig.activateNow,
        testMode: activationConfig.testMode,
      });
      if (res.success) {
        setIsSubmitted(true);
        fetchChannels();
        toast.success("Canal configurado com sucesso.");
      } else {
        toast.error((res.error as { message?: string })?.message ?? "Erro ao criar canal.");
      }
    } catch {
      toast.error("Erro ao criar canal.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewChannel = () => {
    setCurrentStep(1);
    setSelectedChannel(null);
    setIsSubmitted(false);
    setChannelConfig({
      apiKey: "",
      hotelId: "",
      autoSync: true,
      syncInterval: "15",
      rateMapping: "automatic",
      availabilitySync: true,
      restrictionsSync: true,
      priceSync: true,
    });
    setCommissionConfig({
      commissionType: "percentage",
      commissionValue: "",
      paymentTerms: "monthly",
      minCommission: "",
      maxCommission: "",
      applyToAllRates: true,
    });
    setActivationConfig({
      activateNow: true,
      scheduledDate: "",
      notifyTeam: true,
      testMode: false,
      syncInventory: true,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      handleNewChannel();
    }, 300);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return selectedChannel !== null;
      case 3:
        return channelConfig.apiKey.length > 0 || selectedChannel?.type === "direct";
      case 4:
        return commissionConfig.commissionValue.length > 0 || selectedChannel?.type === "direct";
      case 5:
        return true;
      default:
        return false;
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  const renderStepContent = () => {
    if (isSubmitted) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-6 animate-in zoom-in duration-300">
            <Check className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Canal Conectado!</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            O canal <span className="font-semibold text-foreground">{selectedChannel?.name}</span> foi configurado com sucesso e está pronto para receber reservas.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-lg">
            <div className="bg-emerald-500/10 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{selectedChannel?.logo}</div>
              <p className="text-xs text-muted-foreground">Canal</p>
              <p className="font-semibold text-foreground text-sm">{selectedChannel?.name}</p>
            </div>
            <div className="bg-blue-500/10 rounded-xl p-4 text-center">
              <Percent className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Comissão</p>
              <p className="font-semibold text-foreground text-sm">{commissionConfig.commissionValue || "0"}%</p>
            </div>
            <div className="bg-violet-500/10 rounded-xl p-4 text-center">
              <Zap className="h-6 w-6 text-violet-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-semibold text-emerald-600 text-sm">Ativo</p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              Ver Detalhes
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Sincronizar Agora
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Abrir Painel
            </Button>
          </div>

          <Separator className="my-8 w-full max-w-lg" />

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleNewChannel} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Outro Canal
            </Button>
            <Button onClick={handleClose} className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white gap-2">
              <Check className="h-4 w-4" />
              Concluir
            </Button>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col gap-6 min-h-[calc(100vh-14rem)]">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
              <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-xl p-4 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <Globe className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">Canais Ativos</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{activeChannelsCount}</p>
                <p className="text-xs text-emerald-600">de {channels.length} configurados</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-violet-500/10 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <ShoppingCart className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">Total Reservas</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{totalBookings.toLocaleString()}</p>
                <p className="text-xs text-blue-600">+23% este mês</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <CircleDollarSign className="h-4 w-4 text-amber-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">Receita Total</span>
                </div>
                <p className="text-2xl font-bold text-foreground">R$ {(totalRevenue / 1000).toFixed(0)}k</p>
                <p className="text-xs text-amber-600">+15% este mês</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-xl p-4 border border-pink-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-pink-500/20">
                    <Percent className="h-4 w-4 text-pink-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">Comissão Média</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{avgCommission.toFixed(1)}%</p>
                <p className="text-xs text-pink-600">Canais pagos</p>
              </div>
            </div>

            {/* Channels List - ocupa o espaço restante até o final */}
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="font-semibold text-foreground">Canais Configurados</h3>
                <Button 
                  size="sm" 
                  onClick={() => setCurrentStep(2)}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Novo Canal
                </Button>
              </div>

              <ScrollArea className="flex-1 min-h-[280px]">
                <div className="space-y-3 pr-4">
                  {loadingChannels ? (
                    <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span>Carregando canais...</span>
                    </div>
                  ) : channels.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      Nenhum canal configurado. Clique em &quot;Novo Canal&quot; para adicionar.
                    </div>
                  ) : channels.map((channel) => {
                    const typeConfig = channelTypeConfig[channel.type];
                    return (
                      <div
                        key={channel.id}
                        className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{channel.logo}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground">{channel.name}</h4>
                              <Badge className={cn("text-xs", typeConfig.color)}>
                                {typeConfig.label}
                              </Badge>
                              {channel.status === "active" && (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Ativo
                                </Badge>
                              )}
                              {channel.status === "pending" && (
                                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pendente
                                </Badge>
                              )}
                              {channel.status === "inactive" && (
                                <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20 text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Inativo
                                </Badge>
                              )}
                              {channel.status === "suspended" && (
                                <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20 text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Suspenso
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <ShoppingCart className="h-3 w-3" />
                                {channel.bookings} reservas
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                R$ {channel.revenue.toLocaleString()}
                              </span>
                              {channel.commission > 0 && (
                                <span className="flex items-center gap-1">
                                  <Percent className="h-3 w-3" />
                                  {channel.commission}%
                                </span>
                              )}
                              {channel.lastSync && (
                                <span className="flex items-center gap-1">
                                  <RefreshCw className="h-3 w-3" />
                                  {channel.lastSync}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={async () => {
                                try {
                                  const res = await api.deleteBookingChannel(Number(channel.id));
                                  if (res.success) {
                                    toast.success("Canal removido.");
                                    fetchChannels();
                                  } else {
                                    toast.error((res.error as { message?: string })?.message ?? "Erro ao remover.");
                                  }
                                } catch {
                                  toast.error("Erro ao remover canal.");
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar canal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedType} onValueChange={(v) => setSelectedType(v as ChannelType | "all")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  {Object.entries(channelTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Channel Type Cards */}
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
              {Object.entries(channelTypeConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedType(selectedType === key ? "all" : key as ChannelType)}
                  className={cn(
                    "p-3 rounded-xl border text-center transition-all",
                    selectedType === key
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <config.icon className={cn("h-5 w-5 mx-auto mb-1", selectedType === key ? "text-primary" : "text-muted-foreground")} />
                  <p className="text-xs font-medium">{config.label}</p>
                </button>
              ))}
            </div>

            {/* Available Channels */}
            <ScrollArea className="h-[350px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-4">
                {loadingCatalog ? (
                  <div className="col-span-2 flex items-center justify-center py-12 gap-2 text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span>Carregando catálogo...</span>
                  </div>
                ) : filteredAvailableChannels.length === 0 ? (
                  <div className="col-span-2 py-12 text-center text-muted-foreground">
                    Nenhum canal encontrado no catálogo.
                  </div>
                ) : filteredAvailableChannels.map((channel) => {
                  const typeConfig = channelTypeConfig[channel.type];
                  const isSelected = selectedChannel?.id === channel.id;
                  return (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{channel.logo}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{channel.name}</h4>
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{channel.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={cn("text-xs", typeConfig.color)}>
                              {typeConfig.label}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              {channel.popularity}% popular
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Selected Channel Preview */}
            {selectedChannel && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{selectedChannel.logo}</div>
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedChannel.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedChannel.description}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedChannel?.type === "direct" ? (
              <div className="space-y-4">
                <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Canal Direto - Sem Configuração Externa</h3>
                  <p className="text-sm text-muted-foreground">
                    Canais diretos como recepção e motor de reservas não requerem integração com APIs externas.
                    O sistema já está preparado para registrar reservas deste canal.
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <Label className="text-foreground">Registrar Automaticamente</Label>
                      <p className="text-xs text-muted-foreground">Novas reservas são atribuídas a este canal</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <Label className="text-foreground">Relatórios Separados</Label>
                      <p className="text-xs text-muted-foreground">Exibir métricas deste canal em relatórios</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="apiKey">Chave de API / Token</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Digite sua chave de API"
                      value={channelConfig.apiKey}
                      onChange={(e) => setChannelConfig({ ...channelConfig, apiKey: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Encontre sua chave no painel do {selectedChannel?.name}
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="hotelId">ID do Hotel / Propriedade</Label>
                    <Input
                      id="hotelId"
                      placeholder="Ex: 12345678"
                      value={channelConfig.hotelId}
                      onChange={(e) => setChannelConfig({ ...channelConfig, hotelId: e.target.value })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Sincronização</h4>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <Label className="text-foreground">Sincronização Automática</Label>
                      <p className="text-xs text-muted-foreground">Manter inventário sincronizado</p>
                    </div>
                    <Switch 
                      checked={channelConfig.autoSync}
                      onCheckedChange={(checked) => setChannelConfig({ ...channelConfig, autoSync: checked })}
                    />
                  </div>

                  {channelConfig.autoSync && (
                    <div className="grid gap-2">
                      <Label>Intervalo de Sincronização</Label>
                      <Select 
                        value={channelConfig.syncInterval}
                        onValueChange={(v) => setChannelConfig({ ...channelConfig, syncInterval: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">A cada 5 minutos</SelectItem>
                          <SelectItem value="15">A cada 15 minutos</SelectItem>
                          <SelectItem value="30">A cada 30 minutos</SelectItem>
                          <SelectItem value="60">A cada hora</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div className={cn(
                      "p-3 rounded-lg border text-center cursor-pointer transition-all",
                      channelConfig.availabilitySync ? "border-primary bg-primary/5" : "border-border"
                    )}
                      onClick={() => setChannelConfig({ ...channelConfig, availabilitySync: !channelConfig.availabilitySync })}
                    >
                      <Calendar className={cn("h-5 w-5 mx-auto mb-1", channelConfig.availabilitySync ? "text-primary" : "text-muted-foreground")} />
                      <p className="text-xs font-medium">Disponibilidade</p>
                    </div>
                    <div className={cn(
                      "p-3 rounded-lg border text-center cursor-pointer transition-all",
                      channelConfig.priceSync ? "border-primary bg-primary/5" : "border-border"
                    )}
                      onClick={() => setChannelConfig({ ...channelConfig, priceSync: !channelConfig.priceSync })}
                    >
                      <DollarSign className={cn("h-5 w-5 mx-auto mb-1", channelConfig.priceSync ? "text-primary" : "text-muted-foreground")} />
                      <p className="text-xs font-medium">Preços</p>
                    </div>
                    <div className={cn(
                      "p-3 rounded-lg border text-center cursor-pointer transition-all",
                      channelConfig.restrictionsSync ? "border-primary bg-primary/5" : "border-border"
                    )}
                      onClick={() => setChannelConfig({ ...channelConfig, restrictionsSync: !channelConfig.restrictionsSync })}
                    >
                      <Settings className={cn("h-5 w-5 mx-auto mb-1", channelConfig.restrictionsSync ? "text-primary" : "text-muted-foreground")} />
                      <p className="text-xs font-medium">Restrições</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Selected Channel Preview */}
            {selectedChannel && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/5 to-orange-500/10 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{selectedChannel.logo}</div>
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedChannel.name}</h3>
                    <p className="text-sm text-muted-foreground">Configuração de comissões e pagamentos</p>
                  </div>
                </div>
              </div>
            )}

            {selectedChannel?.type === "direct" ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <CircleDollarSign className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Sem Comissão</h3>
                <p className="text-sm text-muted-foreground">
                  Canais diretos não possuem comissão. Todo o valor da reserva fica com você!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Tipo de Comissão</Label>
                    <Select 
                      value={commissionConfig.commissionType}
                      onValueChange={(v) => setCommissionConfig({ ...commissionConfig, commissionType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                        <SelectItem value="mixed">Misto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>
                      {commissionConfig.commissionType === "percentage" ? "Porcentagem de Comissão" : "Valor da Comissão"}
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder={commissionConfig.commissionType === "percentage" ? "15" : "50.00"}
                        value={commissionConfig.commissionValue}
                        onChange={(e) => setCommissionConfig({ ...commissionConfig, commissionValue: e.target.value })}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {commissionConfig.commissionType === "percentage" ? "%" : "R$"}
                      </span>
                    </div>
                    {selectedChannel?.type === "ota" && (
                      <p className="text-xs text-amber-600">
                        ⚠️ Comissão média do {selectedChannel.name}: 15-18%
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Condições de Pagamento</Label>
                    <Select 
                      value={commissionConfig.paymentTerms}
                      onValueChange={(v) => setCommissionConfig({ ...commissionConfig, paymentTerms: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">No Check-out</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="biweekly">Quinzenal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <Label className="text-foreground">Aplicar a Todas as Tarifas</Label>
                      <p className="text-xs text-muted-foreground">Usar mesma comissão para todos os planos</p>
                    </div>
                    <Switch 
                      checked={commissionConfig.applyToAllRates}
                      onCheckedChange={(checked) => setCommissionConfig({ ...commissionConfig, applyToAllRates: checked })}
                    />
                  </div>
                </div>

                {/* Commission Preview */}
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <h4 className="font-medium text-foreground mb-3">Simulação de Impacto</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Diária Média</p>
                      <p className="font-semibold text-foreground">R$ 350,00</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Comissão</p>
                      <p className="font-semibold text-amber-600">
                        - R$ {(350 * (Number(commissionConfig.commissionValue) || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Líquido</p>
                      <p className="font-semibold text-emerald-600">
                        R$ {(350 - (350 * (Number(commissionConfig.commissionValue) || 0) / 100)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-violet-500/5 to-purple-500/10 border border-violet-500/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">{selectedChannel?.logo}</div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedChannel?.name}</h3>
                  <p className="text-muted-foreground">{selectedChannel?.description}</p>
                  <Badge className={cn("mt-2", channelTypeConfig[selectedChannel?.type || "ota"].color)}>
                    {channelTypeConfig[selectedChannel?.type || "ota"].label}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground">Comissão</p>
                  <p className="font-semibold text-foreground">
                    {selectedChannel?.type === "direct" ? "0%" : `${commissionConfig.commissionValue || "0"}%`}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground">Sincronização</p>
                  <p className="font-semibold text-foreground">
                    {channelConfig.autoSync ? `A cada ${channelConfig.syncInterval} min` : "Manual"}
                  </p>
                </div>
              </div>
            </div>

            {/* Activation Options */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Opções de Ativação</h4>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <Label className="text-foreground">Ativar Imediatamente</Label>
                  <p className="text-xs text-muted-foreground">Canal começa a receber reservas agora</p>
                </div>
                <Switch 
                  checked={activationConfig.activateNow}
                  onCheckedChange={(checked) => setActivationConfig({ ...activationConfig, activateNow: checked })}
                />
              </div>

              {!activationConfig.activateNow && (
                <div className="grid gap-2">
                  <Label>Data de Ativação</Label>
                  <Input
                    type="date"
                    value={activationConfig.scheduledDate}
                    onChange={(e) => setActivationConfig({ ...activationConfig, scheduledDate: e.target.value })}
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <Label className="text-foreground">Modo de Teste</Label>
                  <p className="text-xs text-muted-foreground">Simular reservas sem efetivar</p>
                </div>
                <Switch 
                  checked={activationConfig.testMode}
                  onCheckedChange={(checked) => setActivationConfig({ ...activationConfig, testMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <Label className="text-foreground">Sincronizar Inventário</Label>
                  <p className="text-xs text-muted-foreground">Enviar disponibilidade atual ao canal</p>
                </div>
                <Switch 
                  checked={activationConfig.syncInventory}
                  onCheckedChange={(checked) => setActivationConfig({ ...activationConfig, syncInventory: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <Label className="text-foreground">Notificar Equipe</Label>
                  <p className="text-xs text-muted-foreground">Enviar e-mail sobre nova conexão</p>
                </div>
                <Switch 
                  checked={activationConfig.notifyTeam}
                  onCheckedChange={(checked) => setActivationConfig({ ...activationConfig, notifyTeam: checked })}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-72 bg-gradient-to-b from-emerald-600 via-cyan-600 to-teal-700 p-6 flex flex-col text-white shrink-0">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-white/20">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Canais de Venda</h2>
                  <p className="text-emerald-100 text-sm">Distribuição & Revenue</p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-emerald-100">Progresso</span>
                <span className="font-medium">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-white/20" />
            </div>

            {/* Steps */}
            <nav className="space-y-2 flex-1">
              {steps.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => !isSubmitted && step.id <= currentStep && setCurrentStep(step.id)}
                    disabled={isSubmitted || step.id > currentStep}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                      isActive
                        ? "bg-white/20 text-white"
                        : isCompleted
                        ? "text-emerald-100 hover:bg-white/10"
                        : "text-emerald-200/50 cursor-not-allowed"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium shrink-0",
                        isActive
                          ? "bg-white text-emerald-600"
                          : isCompleted
                          ? "bg-emerald-400/30 text-white"
                          : "bg-white/10 text-emerald-200/50"
                      )}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                    </div>
                    <span className="font-medium text-sm">{step.title}</span>
                  </button>
                );
              })}
            </nav>

            {/* Selected Channel Preview */}
            {selectedChannel && currentStep > 1 && !isSubmitted && (
              <div className="mt-4 p-4 rounded-xl bg-white/10 backdrop-blur">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">{selectedChannel.logo}</div>
                  <div>
                    <p className="font-medium text-sm">{selectedChannel.name}</p>
                    <Badge className="bg-white/20 text-white border-0 text-xs">
                      {channelTypeConfig[selectedChannel.type].label}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            {!isSubmitted && (
              <div className="mt-4 p-4 rounded-xl bg-white/10 backdrop-blur">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span className="font-medium text-sm">Dica</span>
                </div>
                <p className="text-xs text-emerald-100">
                  {currentStep === 1 && "Analise seus canais atuais para identificar oportunidades de diversificação."}
                  {currentStep === 2 && "OTAs trazem volume, mas canais diretos têm maior margem."}
                  {currentStep === 3 && "Configure a sincronização automática para evitar overbooking."}
                  {currentStep === 4 && "Negocie comissões com base no seu volume de reservas."}
                  {currentStep === 5 && "Ative o modo de teste primeiro para validar a integração."}
                </p>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-background">
            {/* Header */}
            {!isSubmitted && (
              <div className="p-6 border-b border-border shrink-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <span>Etapa {currentStep}</span>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-foreground font-medium">{steps[currentStep - 1]?.title}</span>
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  {currentStep === 1 && "Seus Canais de Venda"}
                  {currentStep === 2 && "Escolha um Canal"}
                  {currentStep === 3 && "Configure a Integração"}
                  {currentStep === 4 && "Defina Comissões"}
                  {currentStep === 5 && "Revise e Ative"}
                </h2>
              </div>
            )}

            {/* Content Area */}
            <ScrollArea className="flex-1 p-6">
              {renderStepContent()}
            </ScrollArea>

            {/* Footer */}
            {!isSubmitted && (
              <div className="p-6 border-t border-border flex items-center justify-between shrink-0">
                <Button
                  variant="outline"
                  onClick={currentStep === 1 ? handleClose : handleBack}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {currentStep === 1 ? "Fechar" : "Voltar"}
                </Button>

                <div className="flex items-center gap-3">
                  {currentStep === 1 && (
                    <Button
                      onClick={() => setCurrentStep(2)}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar Canal
                    </Button>
                  )}
                  {currentStep > 1 && (
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed() || submitting}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white gap-2"
                    >
                      {currentStep === 5 && submitting ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Registrando...
                        </>
                      ) : currentStep === 5 ? (
                        <>
                          Ativar Canal
                          <Zap className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Continuar
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
