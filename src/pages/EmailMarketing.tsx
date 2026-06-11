import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Mail,
  Send,
  Users,
  BarChart3,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  MousePointer,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Play,
  Pause,
  Calendar,
  Sparkles,
  Zap,
  Heart,
  ShoppingCart,
  Gift,
  Star,
  MessageSquare,
  FileText,
  Image,
  Layout,
  Wand2,
  RefreshCw,
  Download,
  Upload,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  PieChart,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Bot,
  Layers,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { NewCampaignModal } from "@/components/email/NewCampaignModal";
import { NewTemplateModal } from "@/components/email/NewTemplateModal";
import { NewAutomationModal } from "@/components/email/NewAutomationModal";
import { NewSegmentModal } from "@/components/email/NewSegmentModal";

export default function EmailMarketing() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalSent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
    unsubscribeRate: 0,
  });

  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [editingAutomation, setEditingAutomation] = useState<any | null>(null);
  const [editingSegment, setEditingSegment] = useState<any | null>(null);
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);

  const deviceData = [
    { name: "Mobile", value: 0, color: "hsl(var(--primary))" },
    { name: "Desktop", value: 0, color: "hsl(var(--chart-2))" },
    { name: "Tablet", value: 0, color: "hsl(var(--chart-3))" },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, perfRes, campaignsRes, templatesRes, automationsRes, segmentsRes] = await Promise.all([
        api.getCampaignStats(),
        api.getCampaignPerformance(),
        api.getCampaigns(),
        api.getEmailTemplates(),
        api.getEmailAutomations(),
        api.getEmailSegments()
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }

      if (perfRes.success && perfRes.data) {
        setPerformanceData(perfRes.data.performance || []);
      }

      if (campaignsRes.success && campaignsRes.data) {
        const mappedCampaigns = (campaignsRes.data.campaigns || []).map((c: any) => ({
          ...c,
          openRate: c.sent > 0 ? ((c.opened / c.sent) * 100).toFixed(1) : 0,
          clickRate: c.sent > 0 ? ((c.clicked / c.sent) * 100).toFixed(1) : 0,
          scheduledDate: c.scheduledAt ? new Date(c.scheduledAt).toLocaleDateString() : null,
        }));
        setCampaigns(mappedCampaigns);
      }

      if (templatesRes.success && templatesRes.data) {
        console.log("Templates carregados:", templatesRes.data);
        setTemplates(templatesRes.data.templates || []);
      } else {
        console.warn("Falha ao carregar templates ou dados vazios:", templatesRes);
      }

      if (automationsRes.success && automationsRes.data) {
        setAutomations(automationsRes.data.automations || []);
      }

      if (segmentsRes.success && segmentsRes.data) {
        setSegments(segmentsRes.data.segments || []);
      }

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteCampaign = async (id: number) => {
    try {
      await api.deleteCampaign(id);
      toast.success("Campanha excluída com sucesso");
      loadData();
    } catch (error) {
      toast.error("Erro ao excluir campanha");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-500/10 text-green-500 border-green-500/20",
      scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      completed: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      paused: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };
    const labels = {
      active: "Ativo",
      scheduled: "Agendado",
      completed: "Concluído",
      paused: "Pausado",
      draft: "Rascunho",
    };
    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles] || styles.draft}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      promotional: "bg-purple-500/10 text-purple-400",
      newsletter: "bg-blue-500/10 text-blue-400",
      automation: "bg-green-500/10 text-green-400",
      transactional: "bg-orange-500/10 text-orange-400",
    };
    const labels = {
      promotional: "Promocional",
      newsletter: "Newsletter",
      automation: "Automação",
      transactional: "Transacional",
    };
    return (
      <Badge variant="secondary" className={styles[type as keyof typeof styles] || styles.promotional}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const handleDeleteAutomation = async (id: number) => {
    try {
      await api.deleteEmailAutomation(id);
      toast.success("Automação excluída com sucesso");
      loadData();
    } catch (error) {
      toast.error("Erro ao excluir automação");
    }
  };

  const handleDeleteSegment = async (id: number) => {
    try {
      await api.deleteEmailSegment(id);
      toast.success("Segmento excluído com sucesso");
      loadData();
    } catch (error) {
      toast.error("Erro ao excluir segmento");
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: any = { users: Users, star: Star, calendar: Calendar, shopping_cart: ShoppingCart, gift: Gift, clock: Clock };
    const Icon = icons[iconName?.toLowerCase()] || Users;
    return <Icon className="w-5 h-5" />;
  };

  const recentActivity = [
    { type: "sent", message: "Campanha 'Promoção de Fim de Ano' enviada para 12.500 contatos", time: "2h atrás" },
    { type: "opened", message: "Taxa de abertura de 45.4% alcançada na última campanha", time: "3h atrás" },
    { type: "click", message: "1.420 cliques registrados em 'Promoção de Fim de Ano'", time: "4h atrás" },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              Email Marketing
            </h1>
            <p className="text-muted-foreground mt-1">
              Crie, automatize e analise suas campanhas de email
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Importar Contatos
            </Button>
            <Button
              className="bg-gradient-primary hover:opacity-90"
              onClick={() => setIsNewCampaignOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Campanha
            </Button>

            <NewCampaignModal
              open={isNewCampaignOpen}
              onOpenChange={setIsNewCampaignOpen}
              onSuccess={() => {
                loadData();
                setIsNewCampaignOpen(false);
              }}
            />
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card/50 border border-white/10 p-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Send className="w-4 h-4 mr-2" />
              Campanhas
            </TabsTrigger>
            <TabsTrigger value="automations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Zap className="w-4 h-4 mr-2" />
              Automações
            </TabsTrigger>
            <TabsTrigger value="segments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Target className="w-4 h-4 mr-2" />
              Segmentos
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Layout className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Send className="w-4 h-4 text-blue-500" />
                    </div>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-xs">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      12%
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Emails Enviados</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-xs">
                      98.3%
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{stats.delivered.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Entregues</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Eye className="w-4 h-4 text-purple-500" />
                    </div>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-xs">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      8%
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{stats.openRate}%</p>
                    <p className="text-xs text-muted-foreground">Taxa de Abertura</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <MousePointer className="w-4 h-4 text-amber-500" />
                    </div>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-xs">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      5%
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{stats.clickRate}%</p>
                    <p className="text-xs text-muted-foreground">Taxa de Cliques</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <XCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 text-xs">
                      {stats.bounceRate}%
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{stats.bounced}</p>
                    <p className="text-xs text-muted-foreground">Bounces</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-slate-500/10">
                      <Users className="w-4 h-4 text-slate-400" />
                    </div>
                    <Badge variant="secondary" className="bg-red-500/10 text-red-500 text-xs">
                      {stats.unsubscribeRate}%
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{stats.unsubscribed}</p>
                    <p className="text-xs text-muted-foreground">Descadastros</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Chart */}
              <Card className="lg:col-span-2 bg-card/50 backdrop-blur-xl border-white/10">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Performance de Campanhas</CardTitle>
                      <CardDescription>Últimos 30 dias</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                        Enviados
                      </Badge>
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                        Abertos
                      </Badge>
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
                        Cliques
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="enviados" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="abertos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="cliques" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area type="monotone" dataKey="enviados" stroke="hsl(var(--chart-1))" fill="url(#enviados)" strokeWidth={2} />
                        <Area type="monotone" dataKey="abertos" stroke="hsl(var(--chart-2))" fill="url(#abertos)" strokeWidth={2} />
                        <Area type="monotone" dataKey="cliques" stroke="hsl(var(--chart-3))" fill="url(#cliques)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Device Distribution */}
              <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Dispositivos</CardTitle>
                  <CardDescription>Onde seus emails são lidos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={deviceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {deviceData.map((device) => (
                      <div key={device.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {device.name === "Mobile" && <Smartphone className="w-4 h-4 text-muted-foreground" />}
                          {device.name === "Desktop" && <Monitor className="w-4 h-4 text-muted-foreground" />}
                          {device.name === "Tablet" && <Globe className="w-4 h-4 text-muted-foreground" />}
                          <span className="text-sm">{device.name}</span>
                        </div>
                        <span className="text-sm font-medium">{device.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Campaigns */}
              <Card className="lg:col-span-2 bg-card/50 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Campanhas Recentes</CardTitle>
                    <Button variant="ghost" size="sm">
                      Ver todas
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {campaigns.slice(0, 4).map((campaign) => (
                        <div
                          key={campaign.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-background/40 border border-white/5 hover:border-primary/30 transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">{campaign.name}</h4>
                              {getStatusBadge(campaign.status)}
                              {getTypeBadge(campaign.type)}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{campaign.subject}</p>
                          </div>
                          <div className="flex items-center gap-6 ml-4">
                            <div className="text-center">
                              <p className="text-sm font-medium">{campaign.sent.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Enviados</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-green-500">{campaign.openRate}%</p>
                              <p className="text-xs text-muted-foreground">Abertura</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-blue-500">{campaign.clickRate}%</p>
                              <p className="text-xs text-muted-foreground">Cliques</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Quick Actions & Activity */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto py-3"
                      onClick={() => setIsNewCampaignOpen(true)}
                    >
                      <div className="p-2 rounded-lg bg-primary/10 mr-3">
                        <Send className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Nova Campanha</p>
                        <p className="text-xs text-muted-foreground">Criar email promocional</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-auto py-3">
                      <div className="p-2 rounded-lg bg-green-500/10 mr-3">
                        <Zap className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Nova Automação</p>
                        <p className="text-xs text-muted-foreground">Configurar fluxo automático</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-auto py-3">
                      <div className="p-2 rounded-lg bg-purple-500/10 mr-3">
                        <Target className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Criar Segmento</p>
                        <p className="text-xs text-muted-foreground">Segmentar sua base</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-auto py-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 mr-3">
                        <Wand2 className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Gerar com IA</p>
                        <p className="text-xs text-muted-foreground">Criar conteúdo com IA</p>
                      </div>
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Atividade Recente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px] pr-4">
                      <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                          <div key={index} className="flex gap-3">
                            <div className={`p-1.5 rounded-lg shrink-0 ${activity.type === "sent" ? "bg-blue-500/10" :
                              activity.type === "opened" ? "bg-green-500/10" :
                                activity.type === "click" ? "bg-purple-500/10" :
                                  activity.type === "automation" ? "bg-amber-500/10" :
                                    "bg-slate-500/10"
                              }`}>
                              {activity.type === "sent" && <Send className="w-3 h-3 text-blue-500" />}
                              {activity.type === "opened" && <Eye className="w-3 h-3 text-green-500" />}
                              {activity.type === "click" && <MousePointer className="w-3 h-3 text-purple-500" />}
                              {activity.type === "automation" && <Zap className="w-3 h-3 text-amber-500" />}
                              {activity.type === "segment" && <Target className="w-3 h-3 text-slate-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-muted-foreground">{activity.message}</p>
                              <p className="text-xs text-muted-foreground/60">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar campanhas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80 bg-background/50"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>
              <Button
                className="bg-gradient-primary hover:opacity-90"
                onClick={() => setIsNewCampaignOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Campanha
              </Button>
            </div>

            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="bg-card/50 backdrop-blur-xl border-white/10 hover:border-primary/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{campaign.name}</h3>
                          {getStatusBadge(campaign.status)}
                          {getTypeBadge(campaign.type)}
                        </div>
                        <p className="text-muted-foreground mb-4">{campaign.subject}</p>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Send className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{campaign.sent.toLocaleString()} enviados</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{campaign.openRate}% abertura</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MousePointer className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">{campaign.clickRate}% cliques</span>
                          </div>
                          {campaign.scheduledDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{campaign.scheduledDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {campaign.status === "active" && (
                          <Button variant="outline" size="sm">
                            <Pause className="w-4 h-4 mr-2" />
                            Pausar
                          </Button>
                        )}
                        {campaign.status === "paused" && (
                          <Button variant="outline" size="sm">
                            <Play className="w-4 h-4 mr-2" />
                            Retomar
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Relatório
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Exportar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                <h2 className="text-xl font-semibold">Automações de Email</h2>
                <p className="text-muted-foreground">Configure fluxos automáticos para engajar seus contatos</p>
              </div>
              <NewAutomationModal onSuccess={loadData}>
                <Button className="bg-gradient-primary hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Automação
                </Button>
              </NewAutomationModal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {automations.map((automation) => (
                <Card key={automation.id} className="bg-card/50 backdrop-blur-xl border-white/10 hover:border-primary/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      {getStatusBadge(automation.status)}
                    </div>
                    <h3 className="font-semibold mb-1">{automation.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      <span className="text-primary">Gatilho:</span> {automation.triggerType}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {automation.emailsCount} emails
                      </div>
                      <div className="flex items-center gap-1">
                        <Send className="w-4 h-4" />
                        {automation.sentCount || 0} enviados
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div>
                        <p className="text-lg font-semibold text-green-500">{automation.conversionsCount || 0}</p>
                        <p className="text-xs text-muted-foreground">Conversões</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon-sm" onClick={() => setEditingAutomation(automation)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteAutomation(automation.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <NewAutomationModal
              open={!!editingAutomation}
              onOpenChange={(open) => !open && setEditingAutomation(null)}
              automationToEdit={editingAutomation}
              onSuccess={() => {
                loadData();
                setEditingAutomation(null);
              }}
            />

            {/* Automation Suggestions */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Sugestões de IA</h3>
                    <p className="text-sm text-muted-foreground">
                      Baseado nos seus dados, recomendamos criar uma automação de "Reativação de Hóspedes" para os 5.670 contatos inativos.
                    </p>
                  </div>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Criar com IA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Segments Tab */}
          <TabsContent value="segments" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Segmentos de Contatos</h2>
                <p className="text-muted-foreground">Organize seus contatos em grupos para campanhas direcionadas</p>
              </div>
              <NewSegmentModal onSuccess={loadData}>
                <Button className="bg-gradient-primary hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Segmento
                </Button>
              </NewSegmentModal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {segments.map((segment) => (
                <Card key={segment.id} className="bg-card/50 backdrop-blur-xl border-white/10 hover:border-primary/30 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${segment.color}`}>
                        {getIconComponent(segment.icon)}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Campanha
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingSegment(segment)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar Segmento
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Exportar Contatos
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteSegment(segment.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <h3 className="font-semibold mb-2">{segment.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold">{(segment.contactsCount || 0).toLocaleString()}</p>
                      <Badge variant="outline" className="bg-background/50">
                        contatos
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <NewSegmentModal
              open={!!editingSegment}
              onOpenChange={(open) => !open && setEditingSegment(null)}
              segmentToEdit={editingSegment}
              onSuccess={() => {
                loadData();
                setEditingSegment(null);
              }}
            />
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Templates de Email</h2>
                <p className="text-muted-foreground">Escolha e personalize templates profissionais</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Importar HTML
                </Button>
                <Button
                  className="bg-gradient-primary hover:opacity-90"
                  onClick={() => setIsNewTemplateOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Template
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="bg-card/50 backdrop-blur-xl border-white/10 hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => setEditingTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-background to-background/50 border border-white/10 flex items-center justify-center text-4xl mb-3 group-hover:border-primary/30 transition-all overflow-hidden">
                      {template.thumbnail ? (
                        template.thumbnail.startsWith('http') ? (
                          <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{template.thumbnail}</span>
                        )
                      ) : (
                        <Layout className="w-10 h-10 text-muted-foreground/50" />
                      )}
                    </div>
                    <h4 className="font-medium text-sm truncate">{template.name}</h4>
                    <p className="text-xs text-muted-foreground capitalize">{template.type}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <NewTemplateModal
              open={isNewTemplateOpen}
              onOpenChange={setIsNewTemplateOpen}
              onSuccess={() => {
                loadData();
                setIsNewTemplateOpen(false);
              }}
            />

            <NewTemplateModal
              open={!!editingTemplate}
              onOpenChange={(open) => !open && setEditingTemplate(null)}
              templateToEdit={editingTemplate}
              onSuccess={() => {
                loadData();
                setEditingTemplate(null);
              }}
            />

            {/* AI Template Generator */}
            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/20">
                    <Wand2 className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Gerador de Templates com IA</h3>
                    <p className="text-sm text-muted-foreground">
                      Descreva o tipo de email que você precisa e nossa IA criará um template personalizado para você.
                    </p>
                  </div>
                  <Button variant="outline" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout >
  );
}
