import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ConfigureIntegrationModal } from "@/components/integrations/ConfigureIntegrationModal";
import { SelfmartIntegrationModal } from "@/components/integrations/SelfmartIntegrationModal";
import { loadSelfmartConfig } from "@/lib/selfmart";
import { SMTPConfigModal } from "@/components/registrations/SMTPConfigModal";
import { OAuthGoogleModal } from "@/components/registrations/OAuthGoogleModal";
import { WebhooksModal } from "@/components/registrations/WebhooksModal";
import { APIConfigModal } from "@/components/registrations/APIConfigModal";
import { ConnectedAppsModal } from "@/components/registrations/ConnectedAppsModal";
import {
  Search,
  Plug,
  CheckCircle2,
  Circle,
  ExternalLink,
  Settings,
  RefreshCw,
  Zap,
  Globe,
  CreditCard,
  Mail,
  MessageSquare,
  Lock,
  BarChart3,
  Star,
  Calculator,
  Building2,
  Plane,
  Home,
  DollarSign,
  Send,
  Phone,
  Key,
  Webhook,
  Code,
  FileText,
  TrendingUp,
  Shield,
  Users,
  Calendar,
  Bot,
  Chrome,
  Code2,
  Puzzle,
  Server,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  status: "connected" | "available" | "coming_soon";
  popular?: boolean;
  features?: string[];
}

const integrations: Integration[] = [
  // Channel Managers / OTAs
  {
    id: "booking",
    name: "Booking.com",
    description: "Maior OTA do mundo. Sincronize disponibilidade, tarifas e reservas automaticamente.",
    category: "channel_manager",
    logo: "🅱️",
    status: "connected",
    popular: true,
    features: ["Sync automático", "Gestão de tarifas", "Reservas em tempo real"],
  },
  {
    id: "airbnb",
    name: "Airbnb",
    description: "Conecte seu inventário ao Airbnb para gestão unificada de reservas.",
    category: "channel_manager",
    logo: "🏠",
    status: "connected",
    popular: true,
    features: ["iCal sync", "Mensagens automáticas", "Gestão de preços"],
  },
  {
    id: "expedia",
    name: "Expedia Group",
    description: "Inclui Expedia, Hotels.com, Vrbo e mais de 200 sites parceiros.",
    category: "channel_manager",
    logo: "✈️",
    status: "available",
    popular: true,
    features: ["Multi-site", "Promoções", "Revenue management"],
  },
  {
    id: "decolar",
    name: "Decolar",
    description: "Maior agência de viagens online da América Latina.",
    category: "channel_manager",
    logo: "🌎",
    status: "available",
    features: ["Mercado LATAM", "Sync bidirecional"],
  },
  {
    id: "tripadvisor",
    name: "TripAdvisor",
    description: "Conecte suas avaliações e disponibilidade ao TripAdvisor.",
    category: "channel_manager",
    logo: "🦉",
    status: "available",
    features: ["Reviews sync", "Instant booking"],
  },
  {
    id: "google_hotels",
    name: "Google Hotel Ads",
    description: "Apareça diretamente nos resultados de busca do Google.",
    category: "channel_manager",
    logo: "🔍",
    status: "available",
    popular: true,
    features: ["Metasearch", "Free booking links"],
  },
  {
    id: "hostelworld",
    name: "Hostelworld",
    description: "Ideal para hostels e acomodações compartilhadas.",
    category: "channel_manager",
    logo: "🛏️",
    status: "available",
    features: ["Dorms management", "Backpackers market"],
  },

  // Revenue Management
  {
    id: "pricelabs",
    name: "PriceLabs",
    description: "Precificação dinâmica baseada em dados de mercado e demanda.",
    category: "revenue",
    logo: "📊",
    status: "connected",
    popular: true,
    features: ["Dynamic pricing", "Market data", "Competitor analysis"],
  },
  {
    id: "beyond_pricing",
    name: "Beyond Pricing",
    description: "Revenue management automatizado para maximizar receita.",
    category: "revenue",
    logo: "💹",
    status: "available",
    features: ["AI pricing", "Demand forecasting"],
  },
  {
    id: "wheelhouse",
    name: "Wheelhouse",
    description: "Estratégias de precificação personalizadas para seu mercado.",
    category: "revenue",
    logo: "🎯",
    status: "available",
    features: ["Custom strategies", "Performance tracking"],
  },
  {
    id: "rategenie",
    name: "RateGenie",
    description: "Otimização de tarifas com inteligência artificial.",
    category: "revenue",
    logo: "🧞",
    status: "coming_soon",
    features: ["AI optimization", "Seasonal adjustments"],
  },

  // Payment Gateways
  {
    id: "stripe",
    name: "Stripe",
    description: "Processamento de pagamentos online seguro e moderno.",
    category: "payments",
    logo: "💳",
    status: "connected",
    popular: true,
    features: ["Cards", "Apple Pay", "Google Pay", "PIX"],
  },
  {
    id: "pagarme",
    name: "Pagar.me",
    description: "Gateway de pagamentos brasileiro com split e recorrência.",
    category: "payments",
    logo: "🇧🇷",
    status: "available",
    popular: true,
    features: ["PIX", "Boleto", "Split payments"],
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    description: "Soluções de pagamento do Mercado Livre.",
    category: "payments",
    logo: "🤝",
    status: "available",
    features: ["PIX", "QR Code", "Link de pagamento"],
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Pagamentos internacionais seguros e reconhecidos mundialmente.",
    category: "payments",
    logo: "🅿️",
    status: "available",
    features: ["International", "Buyer protection"],
  },
  {
    id: "asaas",
    name: "Asaas",
    description: "Gestão financeira completa com cobrança automatizada.",
    category: "payments",
    logo: "💰",
    status: "available",
    features: ["Cobrança recorrente", "Nota fiscal"],
  },

  // Email Marketing
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Plataforma líder em email marketing e automação.",
    category: "email_marketing",
    logo: "🐵",
    status: "available",
    popular: true,
    features: ["Automações", "Templates", "Analytics"],
  },
  {
    id: "sendinblue",
    name: "Brevo (Sendinblue)",
    description: "Email marketing, SMS e chat em uma única plataforma.",
    category: "email_marketing",
    logo: "📧",
    status: "available",
    popular: true,
    features: ["Email + SMS", "Transactional", "CRM"],
  },
  {
    id: "rdstation",
    name: "RD Station",
    description: "Marketing digital e automação para o mercado brasileiro.",
    category: "email_marketing",
    logo: "🚀",
    status: "available",
    features: ["Landing pages", "Lead scoring", "Automação"],
  },
  {
    id: "activecampaign",
    name: "ActiveCampaign",
    description: "Automação avançada de marketing e vendas.",
    category: "email_marketing",
    logo: "⚡",
    status: "coming_soon",
    features: ["Advanced automation", "CRM integration"],
  },

  // Messaging
  {
    id: "whatsapp_business",
    name: "WhatsApp Business API",
    description: "Comunicação direta com hóspedes via WhatsApp oficial.",
    category: "messaging",
    logo: "💬",
    status: "connected",
    popular: true,
    features: ["Templates", "Automações", "Chatbot"],
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "SMS, voz e WhatsApp programável para comunicações.",
    category: "messaging",
    logo: "📱",
    status: "available",
    features: ["SMS", "Voice", "WhatsApp"],
  },
  {
    id: "zenvia",
    name: "Zenvia",
    description: "Plataforma brasileira de comunicação multicanal.",
    category: "messaging",
    logo: "🔔",
    status: "available",
    features: ["SMS", "WhatsApp", "RCS"],
  },
  {
    id: "intercom",
    name: "Intercom",
    description: "Chat ao vivo e suporte ao cliente integrado.",
    category: "messaging",
    logo: "💭",
    status: "available",
    features: ["Live chat", "Bots", "Help center"],
  },

  // Smart Locks
  {
    id: "nuki",
    name: "Nuki Smart Lock",
    description: "Fechaduras inteligentes com acesso remoto.",
    category: "smart_locks",
    logo: "🔐",
    status: "available",
    popular: true,
    features: ["Auto-unlock", "Access logs", "Remote control"],
  },
  {
    id: "ttlock",
    name: "TTLock",
    description: "Sistema de fechaduras eletrônicas com códigos temporários.",
    category: "smart_locks",
    logo: "🔑",
    status: "available",
    features: ["Temp codes", "Bluetooth", "WiFi gateway"],
  },
  {
    id: "yale",
    name: "Yale Smart",
    description: "Fechaduras inteligentes da marca Yale.",
    category: "smart_locks",
    logo: "🏠",
    status: "available",
    features: ["Pin codes", "App control", "History"],
  },
  {
    id: "igloohome",
    name: "Igloohome",
    description: "Acesso sem internet com códigos PIN offline.",
    category: "smart_locks",
    logo: "🐻‍❄️",
    status: "coming_soon",
    features: ["Offline codes", "No WiFi needed"],
  },

  // Accounting / ERP
  {
    id: "omie",
    name: "Omie",
    description: "ERP completo para gestão empresarial.",
    category: "accounting",
    logo: "📋",
    status: "available",
    popular: true,
    features: ["NF-e", "Financeiro", "Estoque"],
  },
  {
    id: "bling",
    name: "Bling",
    description: "Sistema de gestão online para pequenas empresas.",
    category: "accounting",
    logo: "🔔",
    status: "available",
    features: ["NF-e", "Vendas", "PDV"],
  },
  {
    id: "conta_azul",
    name: "Conta Azul",
    description: "Gestão financeira simplificada para PMEs.",
    category: "accounting",
    logo: "🔵",
    status: "available",
    features: ["Conciliação", "DRE", "Fluxo de caixa"],
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Software de contabilidade da Intuit.",
    category: "accounting",
    logo: "📊",
    status: "coming_soon",
    features: ["Invoicing", "Reports", "Tax"],
  },

  // Reviews & Reputation
  {
    id: "trustyou",
    name: "TrustYou",
    description: "Gestão de reputação e análise de avaliações.",
    category: "reviews",
    logo: "⭐",
    status: "available",
    features: ["Review aggregation", "Sentiment analysis"],
  },
  {
    id: "revinate",
    name: "Revinate",
    description: "CRM e gestão de reputação para hotelaria.",
    category: "reviews",
    logo: "🏆",
    status: "available",
    features: ["Guest feedback", "Surveys", "CRM"],
  },
  {
    id: "reviewpro",
    name: "ReviewPro",
    description: "Inteligência de hóspedes e gestão de reputação.",
    category: "reviews",
    logo: "📈",
    status: "coming_soon",
    features: ["ORM", "Guest intelligence"],
  },

  // Developers / API
  {
    id: "selfmart",
    name: "Selfmart",
    description: "Mini mercado independente com relatorio proprio de produtos e estoque.",
    category: "developers",
    logo: "🛒",
    status: "available",
    popular: true,
    features: ["Estoque", "Produtos", "Relatorio separado"],
  },
  {
    id: "smtp-config",
    name: "Configuração SMTP",
    description: "Configure servidor de e-mail e templates transacionais.",
    category: "developers",
    logo: "📧",
    status: "connected",
    popular: true,
    features: ["SMTP", "API Providers", "Templates"],
  },
  {
    id: "oauth-google",
    name: "OAuth Google",
    description: "Autenticação via Google para usuários e hóspedes.",
    category: "developers",
    logo: "🔐",
    status: "connected",
    popular: true,
    features: ["OAuth 2.0", "SSO", "Auto-criação"],
  },
  {
    id: "api-rest",
    name: "API REST",
    description: "Gerencie chaves de API e acesse a documentação completa.",
    category: "developers",
    logo: "🔌",
    status: "connected",
    popular: true,
    features: ["REST API", "API Keys", "Documentação"],
  },
  {
    id: "connected-apps",
    name: "Apps Conectados",
    description: "Gerencie integrações com serviços externos e apps.",
    category: "developers",
    logo: "🧩",
    status: "connected",
    popular: true,
    features: ["OAuth 2.0", "Sync automático", "Gestão centralizada"],
  },
  {
    id: "webhooks",
    name: "Webhooks",
    description: "Receba notificações em tempo real sobre eventos.",
    category: "developers",
    logo: "🪝",
    status: "connected",
    features: ["Real-time", "Custom endpoints", "Retry logic"],
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Conecte com mais de 5.000 aplicativos sem código.",
    category: "developers",
    logo: "⚡",
    status: "available",
    popular: true,
    features: ["No-code", "5000+ apps", "Automations"],
  },
  {
    id: "make",
    name: "Make (Integromat)",
    description: "Automação visual de workflows complexos.",
    category: "developers",
    logo: "🔄",
    status: "available",
    features: ["Visual builder", "Advanced logic"],
  },
  {
    id: "n8n",
    name: "n8n",
    description: "Automação de workflows open-source e self-hosted.",
    category: "developers",
    logo: "🔗",
    status: "available",
    features: ["Open source", "Self-hosted", "Custom nodes"],
  },
];

const categories = [
  { id: "all", name: "Todas", icon: Plug },
  { id: "channel_manager", name: "Channel Manager", icon: Globe },
  { id: "revenue", name: "Revenue Management", icon: TrendingUp },
  { id: "payments", name: "Pagamentos", icon: CreditCard },
  { id: "email_marketing", name: "Email Marketing", icon: Mail },
  { id: "messaging", name: "Mensageria", icon: MessageSquare },
  { id: "smart_locks", name: "Fechaduras", icon: Lock },
  { id: "accounting", name: "Contabilidade", icon: Calculator },
  { id: "reviews", name: "Avaliações", icon: Star },
  { id: "developers", name: "Desenvolvedores", icon: Code },
];

const Integrations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showOnlyConnected, setShowOnlyConnected] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selfmartModalOpen, setSelfmartModalOpen] = useState(false);
  const [selfmartEnabled, setSelfmartEnabled] = useState(false);
  
  // Developer modals
  const [smtpModalOpen, setSmtpModalOpen] = useState(false);
  const [oauthModalOpen, setOauthModalOpen] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [appsModalOpen, setAppsModalOpen] = useState(false);
  const [webhooksModalOpen, setWebhooksModalOpen] = useState(false);

  useEffect(() => {
    const config = loadSelfmartConfig();
    setSelfmartEnabled(config.enabled);
  }, []);

  const integrationsWithRuntimeStatus = integrations.map((integration) => {
    if (integration.id === "selfmart") {
      return {
        ...integration,
        status: (selfmartEnabled ? "connected" : "available") as Integration["status"],
      };
    }
    return integration;
  });

  const handleConfigureClick = (integration: Integration) => {
    // Handle developer-specific integrations
    switch (integration.id) {
      case "selfmart":
        setSelfmartModalOpen(true);
        return;
      case "smtp-config":
        setSmtpModalOpen(true);
        return;
      case "oauth-google":
        setOauthModalOpen(true);
        return;
      case "api-rest":
        setApiModalOpen(true);
        return;
      case "connected-apps":
        setAppsModalOpen(true);
        return;
      case "webhooks":
        setWebhooksModalOpen(true);
        return;
      default:
        // Handle other integrations with generic modal
        setSelectedIntegration(integration);
        setIsConfigModalOpen(true);
    }
  };

  const filteredIntegrations = integrationsWithRuntimeStatus.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || integration.category === activeCategory;
    const matchesConnected =
      !showOnlyConnected || integration.status === "connected";
    return matchesSearch && matchesCategory && matchesConnected;
  });

  const connectedCount = integrationsWithRuntimeStatus.filter((i) => i.status === "connected").length;
  const availableCount = integrationsWithRuntimeStatus.filter((i) => i.status === "available").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Conectado
          </Badge>
        );
      case "available":
        return (
          <Badge variant="outline" className="gap-1">
            <Circle className="h-3 w-3" />
            Disponível
          </Badge>
        );
      case "coming_soon":
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 gap-1">
            <Zap className="h-3 w-3" />
            Em breve
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      const Icon = category.icon;
      return <Icon className="h-5 w-5" />;
    }
    return <Plug className="h-5 w-5" />;
  };

  const getCategoryColor = (categoryId: string) => {
    const colors: Record<string, string> = {
      channel_manager: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
      revenue: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
      payments: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
      email_marketing: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
      messaging: "from-green-500/20 to-emerald-500/20 border-green-500/30",
      smart_locks: "from-slate-500/20 to-zinc-500/20 border-slate-500/30",
      accounting: "from-indigo-500/20 to-violet-500/20 border-indigo-500/30",
      reviews: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
      developers: "from-rose-500/20 to-red-500/20 border-rose-500/30",
    };
    return colors[categoryId] || "from-muted/30 to-muted/10 border-border/50";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Integrações
            </h1>
            <p className="text-muted-foreground mt-1">
              Conecte seu PMS com os melhores serviços do mercado
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar integrações..."
                className="pl-9 w-[280px] bg-card/50 border-border/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Webhook className="h-4 w-4" />
              Webhooks
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
              <Code className="h-4 w-4" />
              API Docs
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 rounded-xl">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">{connectedCount}</p>
                  <p className="text-xs text-muted-foreground">Conectadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/20 rounded-xl">
                  <Plug className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">{availableCount}</p>
                  <p className="text-xs text-muted-foreground">Disponíveis</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/20 rounded-xl">
                  <RefreshCw className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">24/7</p>
                  <p className="text-xs text-muted-foreground">Sync Automático</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 rounded-xl">
                  <Shield className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">100%</p>
                  <p className="text-xs text-muted-foreground">Seguro</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={showOnlyConnected}
              onCheckedChange={setShowOnlyConnected}
              id="show-connected"
            />
            <label htmlFor="show-connected" className="text-sm text-muted-foreground cursor-pointer">
              Mostrar apenas conectadas
            </label>
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredIntegrations.length} integração(ões) encontrada(s)
          </p>
        </div>

        {/* Categories Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-6">
          <TabsList className="bg-card/50 border border-border/50 p-1 h-auto flex-wrap gap-1">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20"
              >
                <category.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-6">
            {/* Group by category when showing all */}
            {activeCategory === "all" ? (
              <div className="space-y-8">
                {categories
                  .filter((c) => c.id !== "all")
                  .map((category) => {
                    const categoryIntegrations = filteredIntegrations.filter(
                      (i) => i.category === category.id
                    );
                    if (categoryIntegrations.length === 0) return null;
                    
                    return (
                      <div key={category.id}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${getCategoryColor(category.id)}`}>
                            <category.icon className="h-5 w-5" />
                          </div>
                          <h2 className="text-lg font-semibold">{category.name}</h2>
                          <Badge variant="outline" className="text-xs">
                            {categoryIntegrations.length}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryIntegrations.map((integration) => (
                            <IntegrationCard
                              key={integration.id}
                              integration={integration}
                              getStatusBadge={getStatusBadge}
                              getCategoryColor={getCategoryColor}
                              onConfigureClick={handleConfigureClick}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIntegrations.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    getStatusBadge={getStatusBadge}
                    getCategoryColor={getCategoryColor}
                    onConfigureClick={handleConfigureClick}
                  />
                ))}
              </div>
            )}

            {filteredIntegrations.length === 0 && (
              <div className="text-center py-12">
                <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma integração encontrada</h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou termos de busca
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Request Integration */}
        <Card className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Não encontrou a integração que precisa?</h3>
                  <p className="text-sm text-muted-foreground">
                    Solicite uma nova integração e nossa equipe irá avaliar
                  </p>
                </div>
              </div>
              <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Send className="h-4 w-4" />
                Solicitar Integração
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configure Integration Modal */}
        <ConfigureIntegrationModal
          open={isConfigModalOpen}
          onOpenChange={setIsConfigModalOpen}
          integration={selectedIntegration}
        />

        {/* Developer Modals */}
        <SMTPConfigModal open={smtpModalOpen} onOpenChange={setSmtpModalOpen} />
        <OAuthGoogleModal open={oauthModalOpen} onOpenChange={setOauthModalOpen} />
        <APIConfigModal open={apiModalOpen} onOpenChange={setApiModalOpen} />
        <ConnectedAppsModal open={appsModalOpen} onOpenChange={setAppsModalOpen} />
        <WebhooksModal open={webhooksModalOpen} onOpenChange={setWebhooksModalOpen} />
        <SelfmartIntegrationModal
          open={selfmartModalOpen}
          onOpenChange={setSelfmartModalOpen}
          onSaved={(config) => setSelfmartEnabled(config.enabled)}
        />
      </div>
    </DashboardLayout>
  );
};

// Integration Card Component
const IntegrationCard = ({
  integration,
  getStatusBadge,
  getCategoryColor,
  onConfigureClick,
}: {
  integration: Integration;
  getStatusBadge: (status: string) => React.ReactNode;
  getCategoryColor: (categoryId: string) => string;
  onConfigureClick: (integration: Integration) => void;
}) => {
  const isConnected = integration.status === "connected";
  const isComingSoon = integration.status === "coming_soon";
  const canOpenSelfmartDashboard = integration.id === "selfmart" && isConnected;

  return (
    <Card
      className={`bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 group ${
        isComingSoon ? "opacity-70" : ""
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${getCategoryColor(
                integration.category
              )}`}
            >
              {integration.logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{integration.name}</h3>
                {integration.popular && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-0 text-xs">
                    Popular
                  </Badge>
                )}
              </div>
              {getStatusBadge(integration.status)}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {integration.description}
        </p>

        {integration.features && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {integration.features.slice(0, 3).map((feature, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-muted/30 border-border/50"
              >
                {feature}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {isConnected ? (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 gap-1"
                onClick={() => onConfigureClick(integration)}
              >
                <Settings className="h-3.5 w-3.5" />
                Configurar
              </Button>
              {!canOpenSelfmartDashboard && (
                <Button size="sm" variant="outline" className="gap-1">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              )}
              {canOpenSelfmartDashboard && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => window.location.assign("/selfmart")}
                >
                  Abrir
                </Button>
              )}
            </>
          ) : isComingSoon ? (
            <Button size="sm" variant="outline" className="flex-1" disabled>
              Em breve
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1 gap-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              onClick={() => onConfigureClick(integration)}
            >
              <Plug className="h-3.5 w-3.5" />
              Conectar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Integrations;
