import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  MessageSquare,
  Mail,
  Phone,
  Star,
  Crown,
  Award,
  Heart,
  Send,
  Calendar,
  Search,
  Filter,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smile,
  Meh,
  Frown,
  Gift,
  Cake,
  MapPin,
  Building2,
  Sparkles,
  Zap,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Eye,
  Edit,
  MoreHorizontal,
  MessageCircle,
  BellRing,
  Settings,
  UserPlus,
  FileText,
  Globe,
  Repeat,
  Hotel,
  Home,
  Palmtree,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// Property type configuration for hybrid system
type PropertyType = 'hotel' | 'apart-hotel' | 'loft' | 'temporada';

const propertyTypeConfig: Record<PropertyType, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  'hotel': { label: 'Hotel', icon: Hotel, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  'apart-hotel': { label: 'Apart-Hotel', icon: Building2, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  'loft': { label: 'Loft', icon: Home, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  'temporada': { label: 'Temporada', icon: Palmtree, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
};

// Mock data for NPS chart
const npsData = [
  { month: "Jan", promoters: 65, passives: 25, detractors: 10 },
  { month: "Fev", promoters: 70, passives: 20, detractors: 10 },
  { month: "Mar", promoters: 68, passives: 22, detractors: 10 },
  { month: "Abr", promoters: 75, passives: 18, detractors: 7 },
  { month: "Mai", promoters: 72, passives: 20, detractors: 8 },
  { month: "Jun", promoters: 78, passives: 17, detractors: 5 },
];

// Mock data for guest segments
const segmentData = [
  { name: "VIP", value: 15, color: "#f59e0b" },
  { name: "Frequente", value: 28, color: "#8b5cf6" },
  { name: "Corporativo", value: 22, color: "#3b82f6" },
  { name: "Lazer", value: 35, color: "#10b981" },
];

// Mock data for communication stats
const communicationStats = [
  { channel: "WhatsApp", sent: 245, opened: 228, responded: 156 },
  { channel: "Email", sent: 580, opened: 312, responded: 89 },
  { channel: "SMS", sent: 120, opened: 115, responded: 42 },
];

// Mock guests data
const guests = [
  {
    id: 1,
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "+55 11 99999-1234",
    avatar: "",
    tier: "VIP",
    stays: 12,
    totalSpent: 28500,
    lastStay: "2024-01-10",
    nextStay: "2024-02-15",
    nps: 10,
    preferences: ["Quarto alto", "Travesseiro extra", "Late checkout"],
    city: "São Paulo, SP",
    birthday: "1985-03-15",
    propertyType: "hotel" as PropertyType,
    stayType: "Diária",
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria.santos@empresa.com",
    phone: "+55 21 98888-5678",
    avatar: "",
    tier: "Corporativo",
    stays: 8,
    totalSpent: 15200,
    lastStay: "2024-01-08",
    nextStay: null,
    nps: 9,
    preferences: ["Não fumante", "Café da manhã cedo"],
    city: "Rio de Janeiro, RJ",
    birthday: "1990-07-22",
    propertyType: "apart-hotel" as PropertyType,
    stayType: "Mensal",
  },
  {
    id: 3,
    name: "Pedro Costa",
    email: "pedro.costa@gmail.com",
    phone: "+55 31 97777-9012",
    avatar: "",
    tier: "Frequente",
    stays: 5,
    totalSpent: 8900,
    lastStay: "2023-12-20",
    nextStay: "2024-01-25",
    nps: 8,
    preferences: ["Quarto silencioso"],
    city: "Belo Horizonte, MG",
    birthday: "1978-11-08",
    propertyType: "loft" as PropertyType,
    stayType: "Semanal",
  },
  {
    id: 4,
    name: "Ana Oliveira",
    email: "ana.oliveira@hotmail.com",
    phone: "+55 41 96666-3456",
    avatar: "",
    tier: "Regular",
    stays: 2,
    totalSpent: 2400,
    lastStay: "2023-11-15",
    nextStay: null,
    nps: 7,
    preferences: [],
    city: "Curitiba, PR",
    birthday: "1995-01-30",
    propertyType: "temporada" as PropertyType,
    stayType: "Long Stay",
  },
  {
    id: 5,
    name: "Carlos Ferreira",
    email: "carlos.f@empresa.com.br",
    phone: "+55 51 95555-7890",
    avatar: "",
    tier: "VIP",
    stays: 18,
    totalSpent: 42000,
    lastStay: "2024-01-12",
    nextStay: "2024-01-20",
    nps: 10,
    preferences: ["Suite", "Champagne no quarto", "Transfer aeroporto"],
    city: "Porto Alegre, RS",
    birthday: "1970-05-12",
    propertyType: "hotel" as PropertyType,
    stayType: "Diária",
  },
];

// Mock campaigns data
const campaigns = [
  {
    id: 1,
    name: "Promoção Verão 2024",
    type: "Email",
    status: "active",
    sent: 1250,
    opened: 680,
    clicked: 245,
    converted: 42,
    revenue: 18500,
    startDate: "2024-01-01",
  },
  {
    id: 2,
    name: "Aniversariantes do Mês",
    type: "WhatsApp",
    status: "active",
    sent: 85,
    opened: 82,
    clicked: 45,
    converted: 12,
    revenue: 4200,
    startDate: "2024-01-15",
  },
  {
    id: 3,
    name: "Reativação de Clientes",
    type: "Email",
    status: "paused",
    sent: 520,
    opened: 180,
    clicked: 35,
    converted: 8,
    revenue: 3600,
    startDate: "2023-12-01",
  },
  {
    id: 4,
    name: "Pós-Estadia NPS",
    type: "SMS",
    status: "active",
    sent: 320,
    opened: 310,
    clicked: 156,
    converted: 0,
    revenue: 0,
    startDate: "2024-01-01",
  },
];

// Mock automations data
const automations = [
  {
    id: 1,
    name: "Pré Check-in",
    trigger: "3 dias antes do check-in",
    channel: "WhatsApp",
    status: "active",
    sent: 156,
    engagement: 92,
  },
  {
    id: 2,
    name: "Boas-vindas",
    trigger: "No check-in",
    channel: "Email",
    status: "active",
    sent: 142,
    engagement: 78,
  },
  {
    id: 3,
    name: "Pesquisa de Satisfação",
    trigger: "1 dia após check-out",
    channel: "Email",
    status: "active",
    sent: 138,
    engagement: 45,
  },
  {
    id: 4,
    name: "Aniversário",
    trigger: "No dia do aniversário",
    channel: "WhatsApp",
    status: "active",
    sent: 24,
    engagement: 88,
  },
  {
    id: 5,
    name: "Reativação",
    trigger: "90 dias sem reserva",
    channel: "Email",
    status: "paused",
    sent: 85,
    engagement: 22,
  },
];

// Mock reviews
const reviews = [
  {
    id: 1,
    guest: "João Silva",
    rating: 5,
    comment: "Excelente estadia! Equipe muito atenciosa e quarto impecável.",
    date: "2024-01-12",
    source: "Google",
    responded: true,
  },
  {
    id: 2,
    guest: "Maria Santos",
    rating: 4,
    comment: "Ótima localização e café da manhã delicioso. Wi-fi poderia ser melhor.",
    date: "2024-01-10",
    source: "Booking",
    responded: true,
  },
  {
    id: 3,
    guest: "Pedro Costa",
    rating: 5,
    comment: "Simplesmente perfeito! Já é minha terceira vez e sempre superam expectativas.",
    date: "2024-01-08",
    source: "TripAdvisor",
    responded: false,
  },
  {
    id: 4,
    guest: "Ana Oliveira",
    rating: 3,
    comment: "Bom, mas o ar condicionado do quarto fazia barulho.",
    date: "2024-01-05",
    source: "Google",
    responded: true,
  },
];

const CRM = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "VIP":
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 gap-1">
            <Crown className="h-3 w-3" />
            VIP
          </Badge>
        );
      case "Corporativo":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 gap-1">
            <Building2 className="h-3 w-3" />
            Corporativo
          </Badge>
        );
      case "Frequente":
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 gap-1">
            <Award className="h-3 w-3" />
            Frequente
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            Regular
          </Badge>
        );
    }
  };

  const getNPSIcon = (score: number) => {
    if (score >= 9) return <Smile className="h-4 w-4 text-emerald-400" />;
    if (score >= 7) return <Meh className="h-4 w-4 text-amber-400" />;
    return <Frown className="h-4 w-4 text-red-400" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Ativa
          </Badge>
        );
      case "paused":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1">
            <Clock className="h-3 w-3" />
            Pausada
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`}
      />
    ));
  };

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === "all" || guest.tier === tierFilter;
    const matchesPropertyType = propertyTypeFilter === "all" || guest.propertyType === propertyTypeFilter;
    return matchesSearch && matchesTier && matchesPropertyType;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              CRM & Relacionamento
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestão completa de hóspedes, comunicações e fidelização
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Property Type Filter */}
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
              <Button
                variant={propertyTypeFilter === "all" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPropertyTypeFilter("all")}
                className="h-8"
              >
                Todos
              </Button>
              {(Object.keys(propertyTypeConfig) as PropertyType[]).map((type) => {
                const config = propertyTypeConfig[type];
                const Icon = config.icon;
                return (
                  <Button
                    key={type}
                    variant={propertyTypeFilter === type ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setPropertyTypeFilter(type)}
                    className={`h-8 gap-1 ${propertyTypeFilter === type ? config.color : ""}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">{config.label}</span>
                  </Button>
                );
              })}
            </div>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Relatórios
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <UserPlus className="h-4 w-4" />
              Novo Hóspede
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Guests */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-purple-500/20 rounded-xl">
                  <Users className="h-5 w-5 text-purple-400" />
                </div>
                <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                  +8.2%
                </Badge>
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Total Hóspedes</p>
                <p className="text-2xl font-bold text-purple-400">2.847</p>
              </div>
            </CardContent>
          </Card>

          {/* VIP Guests */}
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-amber-500/20 rounded-xl">
                  <Crown className="h-5 w-5 text-amber-400" />
                </div>
                <Badge className="bg-amber-500/20 text-amber-400 border-0 text-xs">
                  156
                </Badge>
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Hóspedes VIP</p>
                <p className="text-2xl font-bold text-amber-400">5.5%</p>
              </div>
            </CardContent>
          </Card>

          {/* NPS Score */}
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-emerald-500/20 rounded-xl">
                  <Target className="h-5 w-5 text-emerald-400" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +5
                </Badge>
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">NPS Score</p>
                <p className="text-2xl font-bold text-emerald-400">72</p>
              </div>
            </CardContent>
          </Card>

          {/* Response Rate */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-blue-500/20 rounded-xl">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                  Excelente
                </Badge>
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Taxa de Resposta</p>
                <p className="text-2xl font-bold text-blue-400">94%</p>
              </div>
            </CardContent>
          </Card>

          {/* Retention Rate */}
          <Card className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 border-rose-500/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-rose-500/20 rounded-xl">
                  <Heart className="h-5 w-5 text-rose-400" />
                </div>
                <Badge className="bg-rose-500/20 text-rose-400 border-0 text-xs gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +3.1%
                </Badge>
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Retenção</p>
                <p className="text-2xl font-bold text-rose-400">68%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card/50 border border-border/50 p-1 h-auto flex-wrap">
            <TabsTrigger
              value="overview"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20"
            >
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="guests"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20"
            >
              <Users className="h-4 w-4" />
              Hóspedes
            </TabsTrigger>
            <TabsTrigger
              value="campaigns"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20"
            >
              <Send className="h-4 w-4" />
              Campanhas
            </TabsTrigger>
            <TabsTrigger
              value="automations"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20"
            >
              <Zap className="h-4 w-4" />
              Automações
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20"
            >
              <Star className="h-4 w-4" />
              Avaliações
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* NPS Chart */}
              <Card className="lg:col-span-2 bg-card/50 border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Evolução NPS</CardTitle>
                    <p className="text-sm text-muted-foreground">Promotores vs Detratores</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground">Promotores</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-muted-foreground">Neutros</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-muted-foreground">Detratores</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={npsData}>
                        <defs>
                          <linearGradient id="colorPromoters" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorPassives" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorDetractors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area type="monotone" dataKey="promoters" stroke="#10b981" fillOpacity={1} fill="url(#colorPromoters)" strokeWidth={2} />
                        <Area type="monotone" dataKey="passives" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPassives)" strokeWidth={2} />
                        <Area type="monotone" dataKey="detractors" stroke="#ef4444" fillOpacity={1} fill="url(#colorDetractors)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Guest Segments */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Segmentação</CardTitle>
                  <p className="text-sm text-muted-foreground">Por tipo de hóspede</p>
                </CardHeader>
                <CardContent>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={segmentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {segmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`${value}%`, ""]}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-2">
                    {segmentData.map((segment, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
                          <span className="text-muted-foreground">{segment.name}</span>
                        </div>
                        <span className="font-medium">{segment.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Communication Stats & Upcoming */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Communication Stats */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                    Performance de Comunicações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {communicationStats.map((stat, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{stat.channel}</span>
                          <span className="text-muted-foreground">{stat.sent} enviados</span>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Abertos</span>
                              <span className="text-blue-400">{Math.round((stat.opened / stat.sent) * 100)}%</span>
                            </div>
                            <Progress value={(stat.opened / stat.sent) * 100} className="h-2 bg-muted" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Respondidos</span>
                              <span className="text-emerald-400">{Math.round((stat.responded / stat.sent) * 100)}%</span>
                            </div>
                            <Progress value={(stat.responded / stat.sent) * 100} className="h-2 bg-muted" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    Próximos Eventos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Upcoming stays */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Calendar className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Carlos Ferreira</p>
                          <p className="text-xs text-muted-foreground">Check-in em 20/01</p>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">VIP</Badge>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <Calendar className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Pedro Costa</p>
                          <p className="text-xs text-muted-foreground">Check-in em 25/01</p>
                        </div>
                        <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">Frequente</Badge>
                      </div>
                    </div>
                    {/* Birthdays */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-500/20 rounded-lg">
                          <Cake className="h-4 w-4 text-rose-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Ana Oliveira</p>
                          <p className="text-xs text-muted-foreground">Aniversário em 30/01</p>
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                          <Gift className="h-3 w-3" />
                          Enviar
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                          <Repeat className="h-4 w-4 text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">8 hóspedes</p>
                          <p className="text-xs text-muted-foreground">Sem reserva há 90+ dias</p>
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                          <Send className="h-3 w-3" />
                          Reativar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Reviews */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Avaliações Recentes</CardTitle>
                  <p className="text-sm text-muted-foreground">Últimos feedbacks de hóspedes</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  Ver todas
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div
                      key={review.id}
                      className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                              {review.guest.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{review.guest}</p>
                              <Badge variant="outline" className="text-xs">{review.source}</Badge>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {getRatingStars(review.rating)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                          {review.responded ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs mt-1">
                              Respondido
                            </Badge>
                          ) : (
                            <Button size="sm" variant="ghost" className="h-7 text-xs mt-1 gap-1">
                              <MessageCircle className="h-3 w-3" />
                              Responder
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guests Tab */}
          <TabsContent value="guests" className="space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-semibold">Base de Hóspedes</CardTitle>
                    <p className="text-sm text-muted-foreground">Gestão completa de clientes</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar hóspedes..."
                        className="pl-9 w-[250px] bg-muted/30 border-border/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={tierFilter} onValueChange={setTierFilter}>
                      <SelectTrigger className="w-[140px] bg-muted/30 border-border/50">
                        <SelectValue placeholder="Filtrar tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                        <SelectItem value="Corporativo">Corporativo</SelectItem>
                        <SelectItem value="Frequente">Frequente</SelectItem>
                        <SelectItem value="Regular">Regular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead>Hóspede</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Estadias</TableHead>
                      <TableHead>Total Gasto</TableHead>
                      <TableHead>NPS</TableHead>
                      <TableHead>Última Estadia</TableHead>
                      <TableHead>Próxima</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGuests.map((guest) => (
                      <TableRow key={guest.id} className="border-border/50 hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                                {guest.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{guest.name}</p>
                              <p className="text-xs text-muted-foreground">{guest.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getTierBadge(guest.tier)}</TableCell>
                        <TableCell className="font-medium">{guest.stays}</TableCell>
                        <TableCell className="font-medium text-emerald-400">
                          R$ {guest.totalSpent.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getNPSIcon(guest.nps)}
                            <span className="font-medium">{guest.nps}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{guest.lastStay}</TableCell>
                        <TableCell>
                          {guest.nextStay ? (
                            <Badge className="bg-blue-500/20 text-blue-400 border-0">{guest.nextStay}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Campanhas de Marketing</h2>
                <p className="text-sm text-muted-foreground">Gerencie suas campanhas de comunicação</p>
              </div>
              <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Plus className="h-4 w-4" />
                Nova Campanha
              </Button>
            </div>

            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="bg-card/50 border-border/50">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${
                            campaign.type === "Email" 
                              ? "bg-blue-500/20" 
                              : campaign.type === "WhatsApp" 
                              ? "bg-emerald-500/20" 
                              : "bg-purple-500/20"
                          }`}>
                            {campaign.type === "Email" ? (
                              <Mail className={`h-5 w-5 text-blue-400`} />
                            ) : campaign.type === "WhatsApp" ? (
                              <MessageSquare className={`h-5 w-5 text-emerald-400`} />
                            ) : (
                              <Phone className={`h-5 w-5 text-purple-400`} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{campaign.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{campaign.type}</Badge>
                              {getStatusBadge(campaign.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{campaign.sent}</p>
                          <p className="text-xs text-muted-foreground">Enviados</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-400">
                            {Math.round((campaign.opened / campaign.sent) * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Abertos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-400">
                            {Math.round((campaign.clicked / campaign.sent) * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Cliques</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-400">
                            {campaign.revenue > 0 ? `R$ ${(campaign.revenue / 1000).toFixed(1)}k` : "-"}
                          </p>
                          <p className="text-xs text-muted-foreground">Receita</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" className="h-9 w-9">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-9 w-9">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-9 w-9">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Automations Tab */}
          <TabsContent value="automations" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Automações</h2>
                <p className="text-sm text-muted-foreground">Mensagens automáticas baseadas em gatilhos</p>
              </div>
              <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Plus className="h-4 w-4" />
                Nova Automação
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {automations.map((automation) => (
                <Card
                  key={automation.id}
                  className={`bg-card/50 border-border/50 ${
                    automation.status === "paused" ? "opacity-60" : ""
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2.5 rounded-xl ${
                        automation.channel === "WhatsApp" 
                          ? "bg-emerald-500/20" 
                          : "bg-blue-500/20"
                      }`}>
                        {automation.channel === "WhatsApp" ? (
                          <MessageSquare className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <Mail className="h-5 w-5 text-blue-400" />
                        )}
                      </div>
                      {getStatusBadge(automation.status)}
                    </div>
                    <h3 className="font-semibold mb-1">{automation.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Zap className="h-3.5 w-3.5" />
                      <span>{automation.trigger}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                      <div>
                        <p className="text-lg font-bold">{automation.sent}</p>
                        <p className="text-xs text-muted-foreground">Enviados</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-400">{automation.engagement}%</p>
                        <p className="text-xs text-muted-foreground">Engajamento</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1 gap-1">
                        <Edit className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
                <CardContent className="p-5 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {getRatingStars(5)}
                  </div>
                  <p className="text-3xl font-bold text-amber-400">4.7</p>
                  <p className="text-xs text-muted-foreground">Média Geral</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <CardContent className="p-5 text-center">
                  <p className="text-3xl font-bold text-blue-400">156</p>
                  <p className="text-xs text-muted-foreground">Total de Avaliações</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-5 text-center">
                  <p className="text-3xl font-bold text-emerald-400">94%</p>
                  <p className="text-xs text-muted-foreground">Taxa de Resposta</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                <CardContent className="p-5 text-center">
                  <p className="text-3xl font-bold text-purple-400">3</p>
                  <p className="text-xs text-muted-foreground">Aguardando Resposta</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Todas as Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                              {review.guest.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold">{review.guest}</p>
                              <Badge variant="outline" className="text-xs">{review.source}</Badge>
                              <span className="text-xs text-muted-foreground">{review.date}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {getRatingStars(review.rating)}
                            </div>
                            <p className="text-sm mt-3">{review.comment}</p>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {review.responded ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-0 gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Respondido
                            </Badge>
                          ) : (
                            <Button size="sm" className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                              <MessageCircle className="h-4 w-4" />
                              Responder
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CRM;
