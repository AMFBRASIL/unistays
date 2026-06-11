import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Puzzle,
  Search,
  CheckCircle2,
  AlertCircle,
  Settings2,
  RefreshCw,
  Clock,
  Zap,
  Shield,
  Globe,
  CreditCard,
  Calendar,
  MessageSquare,
  BarChart3,
  Building2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Check,
  PlayCircle,
  Layers,
  Key,
  Eye,
  EyeOff,
  Copy,
  Plug,
  Store,
  Mail,
  Phone,
  Activity,
  Database,
  Server,
  Wifi,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ConnectedAppsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ConnectedApp {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  status: "connected" | "disconnected" | "error";
  lastSync?: string;
  permissions: string[];
  color: string;
  apiCalls?: number;
  successRate?: number;
}

interface AvailableApp {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  color: string;
  features: string[];
  popular?: boolean;
}

const steps = [
  { id: 1, title: "Visão Geral", icon: Activity, description: "Dashboard e apps conectados" },
  { id: 2, title: "Catálogo", icon: Store, description: "Explorar integrações" },
  { id: 3, title: "Configurar", icon: Settings2, description: "Credenciais e API" },
  { id: 4, title: "Permissões", icon: Shield, description: "Escopos de acesso" },
  { id: 5, title: "Ativar", icon: PlayCircle, description: "Testar e ativar" },
];

const categories = [
  { id: "all", label: "Todos", icon: Layers },
  { id: "channels", label: "Canais", icon: Globe },
  { id: "payments", label: "Pagamentos", icon: CreditCard },
  { id: "communication", label: "Comunicação", icon: MessageSquare },
  { id: "productivity", label: "Produtividade", icon: Calendar },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const availableApps: AvailableApp[] = [
  {
    id: "booking",
    name: "Booking.com",
    description: "Channel Manager para sincronização de reservas",
    icon: Globe,
    category: "channels",
    color: "text-blue-600",
    features: ["Reservas", "Disponibilidade", "Tarifas", "Reviews"],
    popular: true,
  },
  {
    id: "airbnb",
    name: "Airbnb",
    description: "Integração completa com Airbnb",
    icon: Building2,
    category: "channels",
    color: "text-pink-600",
    features: ["Reservas", "Mensagens", "Disponibilidade"],
    popular: true,
  },
  {
    id: "expedia",
    name: "Expedia",
    description: "Integração com Expedia Group",
    icon: Globe,
    category: "channels",
    color: "text-amber-600",
    features: ["Reservas", "Disponibilidade", "Tarifas"],
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Gateway de pagamentos online",
    icon: CreditCard,
    category: "payments",
    color: "text-violet-600",
    features: ["Pagamentos", "Reembolsos", "Assinaturas"],
    popular: true,
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    description: "Pagamentos via Mercado Pago e PIX",
    icon: CreditCard,
    category: "payments",
    color: "text-cyan-600",
    features: ["PIX", "Cartões", "Boleto"],
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Mensagens automatizadas para hóspedes",
    icon: MessageSquare,
    category: "communication",
    color: "text-emerald-600",
    features: ["Mensagens", "Templates", "Notificações"],
    popular: true,
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Email marketing e automação",
    icon: Mail,
    category: "communication",
    color: "text-amber-600",
    features: ["Campanhas", "Listas", "Automação"],
  },
  {
    id: "gcalendar",
    name: "Google Calendar",
    description: "Sincronização de eventos e reservas",
    icon: Calendar,
    category: "productivity",
    color: "text-blue-600",
    features: ["Eventos", "Calendários", "Lembretes"],
  },
  {
    id: "ganalytics",
    name: "Google Analytics",
    description: "Análise de tráfego e conversões",
    icon: BarChart3,
    category: "analytics",
    color: "text-orange-600",
    features: ["Tráfego", "Conversões", "Relatórios"],
  },
  {
    id: "slack",
    name: "Slack",
    description: "Notificações para sua equipe",
    icon: MessageSquare,
    category: "communication",
    color: "text-purple-600",
    features: ["Notificações", "Alertas", "Integrações"],
  },
];

export function ConnectedAppsModal({ open, onOpenChange }: ConnectedAppsModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedApp, setSelectedApp] = useState<AvailableApp | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [credentials, setCredentials] = useState({
    apiKey: "",
    secretKey: "",
    webhookUrl: "",
  });

  const [permissions, setPermissions] = useState({
    read: true,
    write: true,
    delete: false,
    admin: false,
  });

  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([
    {
      id: "1",
      name: "Booking.com",
      description: "Channel Manager para sincronização de reservas",
      icon: Globe,
      category: "channels",
      status: "connected",
      lastSync: "2024-01-15T10:30:00",
      permissions: ["Reservas", "Disponibilidade", "Tarifas"],
      color: "text-blue-600",
      apiCalls: 12453,
      successRate: 99.2,
    },
    {
      id: "2",
      name: "Stripe",
      description: "Gateway de pagamentos online",
      icon: CreditCard,
      category: "payments",
      status: "connected",
      lastSync: "2024-01-15T11:00:00",
      permissions: ["Pagamentos", "Reembolsos"],
      color: "text-violet-600",
      apiCalls: 8721,
      successRate: 99.8,
    },
    {
      id: "3",
      name: "WhatsApp Business",
      description: "Mensagens automatizadas para hóspedes",
      icon: MessageSquare,
      category: "communication",
      status: "error",
      lastSync: "2024-01-14T18:30:00",
      permissions: ["Mensagens", "Templates"],
      color: "text-emerald-600",
      apiCalls: 3245,
      successRate: 87.3,
    },
  ]);

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectApp = (app: AvailableApp) => {
    setSelectedApp(app);
    setIsConnecting(true);
    setCurrentStep(3);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsTesting(false);
    setTestResult(credentials.apiKey ? "success" : "error");
  };

  const handleActivate = () => {
    if (selectedApp) {
      const newApp: ConnectedApp = {
        id: Date.now().toString(),
        name: selectedApp.name,
        description: selectedApp.description,
        icon: selectedApp.icon,
        category: selectedApp.category,
        status: "connected",
        lastSync: new Date().toISOString(),
        permissions: Object.entries(permissions)
          .filter(([_, value]) => value)
          .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1)),
        color: selectedApp.color,
        apiCalls: 0,
        successRate: 100,
      };
      
      setConnectedApps([...connectedApps, newApp]);
      toast({
        title: "App conectado!",
        description: `${selectedApp.name} foi integrado com sucesso.`,
      });
      
      // Reset state
      setSelectedApp(null);
      setIsConnecting(false);
      setCredentials({ apiKey: "", secretKey: "", webhookUrl: "" });
      setTestResult(null);
      setCurrentStep(1);
    }
  };

  const handleDisconnect = (id: string) => {
    setConnectedApps(connectedApps.filter(app => app.id !== id));
    toast({
      title: "App desconectado",
      description: "A integração foi removida com sucesso.",
    });
  };

  const handleSync = (id: string) => {
    toast({
      title: "Sincronizando...",
      description: "Aguarde enquanto sincronizamos os dados.",
    });
    
    setTimeout(() => {
      setConnectedApps(connectedApps.map(app => 
        app.id === id ? { ...app, lastSync: new Date().toISOString() } : app
      ));
      toast({
        title: "Sincronização concluída",
        description: "Os dados foram atualizados com sucesso.",
      });
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!" });
  };

  const filteredApps = availableApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || app.category === activeCategory;
    const notConnected = !connectedApps.find(c => c.name === app.name);
    return matchesSearch && matchesCategory && notConnected;
  });

  const startConnecting = () => {
    setIsConnecting(true);
    setCurrentStep(2);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col h-full">
            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4 flex-shrink-0">
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <Plug className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{connectedApps.length}</p>
                    <p className="text-sm text-muted-foreground">Apps Conectados</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {connectedApps.filter(a => a.status === "connected").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Ativos</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <Database className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {connectedApps.reduce((acc, a) => acc + (a.apiCalls || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Chamadas API</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 mt-6 flex-shrink-0">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Shield className="h-5 w-5 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-1">Segurança OAuth 2.0</h4>
                  <p className="text-sm text-muted-foreground">
                    Todas as integrações utilizam protocolos seguros. Você pode revogar o acesso a qualquer momento.
                  </p>
                </div>
              </div>
            </div>

            {/* Connected Apps List - Scrollable */}
            <div className="flex flex-col flex-1 min-h-0 mt-6">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Zap className="h-5 w-5 text-cyan-500" />
                  Apps Integrados
                </h3>
                <Button
                  onClick={startConnecting}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                >
                  <Plug className="h-4 w-4 mr-2" />
                  Conectar App
                </Button>
              </div>

              {connectedApps.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-muted/30 border border-border">
                  <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-4">
                    <Puzzle className="h-8 w-8 text-cyan-500" />
                  </div>
                  <p className="text-muted-foreground mb-4">Nenhum app conectado</p>
                  <Button variant="outline" onClick={startConnecting}>
                    Explorar integrações
                  </Button>
                </div>
              ) : (
                <div className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-3 scrollbar-thin">
                  {connectedApps.map((app) => (
                    <div
                      key={app.id}
                      className={`p-4 rounded-xl bg-card border transition-all hover:shadow-md ${
                        app.status === "error" ? "border-red-300" : "border-border hover:border-cyan-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${app.status === "connected" ? "bg-emerald-100" : "bg-red-100"}`}>
                            <app.icon className={`h-5 w-5 ${app.color}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground">{app.name}</h4>
                              <Badge
                                variant={app.status === "connected" ? "default" : "destructive"}
                                className={app.status === "connected" 
                                  ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                                  : "bg-red-100 text-red-700 border-red-200"
                                }
                              >
                                {app.status === "connected" ? "Ativo" : "Erro"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{app.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSync(app.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Settings2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDisconnect(app.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm mb-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Última sync: {app.lastSync ? new Date(app.lastSync).toLocaleString("pt-BR") : "Nunca"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Activity className="h-4 w-4" />
                          <span>{app.apiCalls?.toLocaleString()} chamadas</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span>{app.successRate}% sucesso</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {app.permissions.map((perm) => (
                          <Badge key={perm} variant="secondary" className="bg-cyan-100 text-cyan-700 border-cyan-200">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mx-auto mb-4">
                <Store className="h-10 w-10 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Catálogo de Integrações</h3>
              <p className="text-muted-foreground">Escolha o app que deseja conectar</p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar apps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat.id)}
                  className={activeCategory === cat.id 
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0" 
                    : ""
                  }
                >
                  <cat.icon className="h-4 w-4 mr-1" />
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Apps Grid */}
            <div className="grid grid-cols-2 gap-4">
              {filteredApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleSelectApp(app)}
                  className={`p-4 rounded-xl text-left transition-all border-2 hover:shadow-lg ${
                    selectedApp?.id === app.id
                      ? "border-cyan-400 bg-cyan-50"
                      : "border-border bg-card hover:border-cyan-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <app.icon className={`h-6 w-6 ${app.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{app.name}</h4>
                        {app.popular && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{app.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {app.features.slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredApps.length === 0 && (
              <div className="p-8 text-center rounded-xl bg-muted/30 border border-border">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum app encontrado</p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mx-auto mb-4">
                <Key className="h-10 w-10 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Configurar {selectedApp?.name}
              </h3>
              <p className="text-muted-foreground">Insira as credenciais de API</p>
            </div>

            <div className="max-w-lg mx-auto space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">API Key</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showApiKey ? "text" : "password"}
                    placeholder="Insira sua API Key"
                    value={credentials.apiKey}
                    onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                    className="bg-background border-border pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-medium">Secret Key (opcional)</Label>
                <Input
                  type="password"
                  placeholder="Insira sua Secret Key"
                  value={credentials.secretKey}
                  onChange={(e) => setCredentials({ ...credentials, secretKey: e.target.value })}
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-medium">Webhook URL</Label>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <code className="flex-1 text-sm text-foreground font-mono">
                    https://api.unistays.com/webhooks/{selectedApp?.id}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(`https://api.unistays.com/webhooks/${selectedApp?.id}`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Configure esta URL no painel do {selectedApp?.name}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Onde encontrar as credenciais?</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Acesse o painel do desenvolvedor do {selectedApp?.name} para gerar suas chaves de API.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-10 w-10 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Permissões de Acesso</h3>
              <p className="text-muted-foreground">Defina os escopos de acesso para esta integração</p>
            </div>

            <div className="max-w-lg mx-auto space-y-4">
              {[
                { id: "read", label: "Leitura", description: "Acessar dados existentes", icon: Eye },
                { id: "write", label: "Escrita", description: "Criar e atualizar dados", icon: Plug },
                { id: "delete", label: "Exclusão", description: "Remover dados", icon: Lock },
                { id: "admin", label: "Administração", description: "Acesso total ao sistema", icon: Shield },
              ].map((perm) => (
                <div
                  key={perm.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    permissions[perm.id as keyof typeof permissions]
                      ? "border-cyan-400 bg-cyan-50"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        permissions[perm.id as keyof typeof permissions] ? "bg-cyan-100" : "bg-muted"
                      }`}>
                        <perm.icon className={`h-5 w-5 ${
                          permissions[perm.id as keyof typeof permissions] ? "text-cyan-600" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{perm.label}</p>
                        <p className="text-sm text-muted-foreground">{perm.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={permissions[perm.id as keyof typeof permissions]}
                      onCheckedChange={(checked) => 
                        setPermissions({ ...permissions, [perm.id]: checked })
                      }
                    />
                  </div>
                </div>
              ))}

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Princípio do Menor Privilégio</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Conceda apenas as permissões necessárias para o funcionamento da integração.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mx-auto mb-4">
                <PlayCircle className="h-10 w-10 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Testar e Ativar</h3>
              <p className="text-muted-foreground">Valide a conexão antes de ativar</p>
            </div>

            <div className="max-w-lg mx-auto space-y-6">
              {/* Summary Card */}
              <div className="p-4 rounded-xl bg-card border border-border">
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <selectedApp.icon className={`h-5 w-5 ${selectedApp?.color}`} />
                  {selectedApp?.name}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API Key:</span>
                    <span className="font-mono text-foreground">
                      {credentials.apiKey ? `${credentials.apiKey.slice(0, 8)}...` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Permissões:</span>
                    <span className="font-medium text-foreground">
                      {Object.entries(permissions).filter(([_, v]) => v).length} ativas
                    </span>
                  </div>
                </div>
              </div>

              {/* Connection Status */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Wifi className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-medium text-foreground">Status da Conexão</h4>
                </div>
                <div className="flex items-center gap-2">
                  {testResult === null ? (
                    <Badge variant="secondary">Não testado</Badge>
                  ) : testResult === "success" ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Conexão OK
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Falha
                    </Badge>
                  )}
                </div>
              </div>

              {/* Test Button */}
              <Button
                onClick={handleTestConnection}
                disabled={isTesting || !credentials.apiKey}
                variant="outline"
                className="w-full h-12"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testando conexão...
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4 mr-2" />
                    Testar Conexão
                  </>
                )}
              </Button>

              {/* Test Result */}
              {testResult && (
                <div className={`p-4 rounded-xl ${
                  testResult === "success" 
                    ? "bg-emerald-50 border border-emerald-200" 
                    : "bg-red-50 border border-red-200"
                }`}>
                  <div className="flex items-center gap-3">
                    {testResult === "success" ? (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        <div>
                          <p className="font-medium text-emerald-800">Conexão bem-sucedida!</p>
                          <p className="text-sm text-emerald-700">O app está pronto para ser ativado.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-6 w-6 text-red-600" />
                        <div>
                          <p className="font-medium text-red-800">Falha na conexão</p>
                          <p className="text-sm text-red-700">Verifique as credenciais e tente novamente.</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 bg-background border-border overflow-hidden flex flex-col">
        <div className="flex h-full">
          {/* Left Sidebar */}
          <div className="w-72 bg-gradient-to-b from-cyan-500 via-blue-500 to-cyan-600 p-6 flex flex-col">
            <DialogHeader className="mb-6">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 rounded-xl bg-white/20">
                  <Puzzle className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">Apps Conectados</DialogTitle>
                  <p className="text-white/80 text-sm">Integrações externas</p>
                </div>
              </div>
            </DialogHeader>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-white/80 text-sm mb-2">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-white/20" />
            </div>

            {/* Steps */}
            <nav className="flex-1 space-y-2">
              {steps.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                const isClickable = step.id === 1 || isConnecting;

                return (
                  <button
                    key={step.id}
                    onClick={() => isClickable && setCurrentStep(step.id)}
                    disabled={!isClickable}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                      isActive
                        ? "bg-white text-cyan-600 shadow-lg"
                        : isCompleted
                        ? "bg-white/20 text-white hover:bg-white/30"
                        : "text-white/60 hover:bg-white/10"
                    } ${!isClickable ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive
                        ? "bg-cyan-100"
                        : isCompleted
                        ? "bg-white/20"
                        : "bg-white/10"
                    }`}>
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <step.icon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{step.title}</p>
                      <p className={`text-xs truncate ${isActive ? "text-cyan-500" : "text-white/60"}`}>
                        {step.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Illustration */}
            <div className="mt-6 p-4 rounded-xl bg-white/10">
              <div className="text-center">
                <div className="text-4xl mb-2">🔗</div>
                <p className="text-white/80 text-sm">
                  Conecte suas ferramentas favoritas e automatize processos
                </p>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto p-6">
              {renderStepContent()}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/30 flex justify-between">
              {isConnecting ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentStep === 2) {
                        setIsConnecting(false);
                        setSelectedApp(null);
                        setCurrentStep(1);
                      } else if (currentStep === 3) {
                        setCurrentStep(2);
                      } else {
                        handleBack();
                      }
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {currentStep === 2 ? "Cancelar" : "Voltar"}
                  </Button>
                  {currentStep < 5 ? (
                    <Button
                      onClick={handleNext}
                      disabled={
                        (currentStep === 2 && !selectedApp) ||
                        (currentStep === 3 && !credentials.apiKey)
                      }
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                    >
                      Próximo
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleActivate}
                      disabled={testResult !== "success"}
                      className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Ativar Integração
                    </Button>
                  )}
                </>
              ) : (
                <div className="flex justify-end w-full">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Fechar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
