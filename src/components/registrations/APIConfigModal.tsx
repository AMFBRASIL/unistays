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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Code2,
  Key,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
  Clock,
  Activity,
  FileJson,
  Lock,
  Globe,
  CheckCircle2,
  Settings2,
  Zap,
  BookOpen,
  Server,
  Webhook,
  Check,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Terminal,
  Link2,
  Play,
  ExternalLink,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface APIConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  secret: string;
  permissions: string[];
  lastUsed?: string;
  createdAt: string;
  active: boolean;
  rateLimit: number;
  environment: "production" | "sandbox";
}

const steps = [
  { id: 1, title: "Visão Geral", icon: Code2, description: "API e Chaves" },
  { id: 2, title: "Nova Chave", icon: Key, description: "Criar credenciais" },
  { id: 3, title: "Permissões", icon: Shield, description: "Escopos de acesso" },
  { id: 4, title: "Configurações", icon: Settings2, description: "Rate limits" },
  { id: 5, title: "Documentação", icon: BookOpen, description: "Referência" },
];

const environments = [
  { 
    id: "production", 
    label: "Produção", 
    description: "Ambiente real com dados de produção", 
    color: "from-emerald-500 to-green-500",
    badge: "LIVE"
  },
  { 
    id: "sandbox", 
    label: "Sandbox", 
    description: "Ambiente de testes isolado", 
    color: "from-amber-500 to-orange-500",
    badge: "TEST"
  },
];

const availablePermissions = [
  { 
    category: "Reservas", 
    icon: Calendar,
    color: "violet",
    permissions: [
      { id: "read:reservations", label: "Ler Reservas", description: "Consultar reservas e disponibilidade" },
      { id: "write:reservations", label: "Criar/Editar Reservas", description: "Criar e modificar reservas" },
      { id: "delete:reservations", label: "Cancelar Reservas", description: "Cancelar e excluir reservas" },
    ]
  },
  { 
    category: "Hóspedes", 
    icon: Users,
    color: "emerald",
    permissions: [
      { id: "read:guests", label: "Ler Hóspedes", description: "Consultar perfis de hóspedes" },
      { id: "write:guests", label: "Criar/Editar Hóspedes", description: "Gerenciar cadastros" },
    ]
  },
  { 
    category: "Financeiro", 
    icon: CreditCard,
    color: "blue",
    permissions: [
      { id: "read:payments", label: "Ler Pagamentos", description: "Consultar transações" },
      { id: "write:payments", label: "Processar Pagamentos", description: "Executar cobranças" },
    ]
  },
  { 
    category: "Sistema", 
    icon: Server,
    color: "rose",
    permissions: [
      { id: "read:all", label: "Leitura Total", description: "Acesso completo de leitura" },
      { id: "write:all", label: "Escrita Total", description: "Acesso completo de escrita" },
    ]
  },
];

import { Calendar, Users, CreditCard } from "lucide-react";

export function APIConfigModal({ open, onOpenChange }: APIConfigModalProps) {
  const [step, setStep] = useState(1);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: "1",
      name: "Produção - ERP",
      key: "pk_live_xxxxxxxxxxxxxxxxxxxxx",
      secret: "sk_live_xxxxxxxxxxxxxxxxxxxxx",
      permissions: ["read:reservations", "write:reservations", "read:guests"],
      lastUsed: "2024-01-15T10:30:00",
      createdAt: "2023-06-15T10:00:00",
      active: true,
      rateLimit: 1000,
      environment: "production",
    },
    {
      id: "2",
      name: "Desenvolvimento",
      key: "pk_test_yyyyyyyyyyyyyyyyyyyyy",
      secret: "sk_test_yyyyyyyyyyyyyyyyyyyyy",
      permissions: ["read:all", "write:all"],
      lastUsed: "2024-01-14T15:45:00",
      createdAt: "2023-08-20T14:00:00",
      active: true,
      rateLimit: 100,
      environment: "sandbox",
    },
  ]);

  const [newKey, setNewKey] = useState({
    name: "",
    environment: "sandbox" as "production" | "sandbox",
    permissions: [] as string[],
    rateLimit: 1000,
  });

  const handleCreateKey = () => {
    if (!newKey.name || newKey.permissions.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e selecione ao menos uma permissão.",
        variant: "destructive",
      });
      return;
    }

    const prefix = newKey.environment === "production" ? "live" : "test";
    const key: APIKey = {
      id: Date.now().toString(),
      name: newKey.name,
      key: `pk_${prefix}_${Math.random().toString(36).substring(2, 26)}`,
      secret: `sk_${prefix}_${Math.random().toString(36).substring(2, 26)}`,
      permissions: newKey.permissions,
      createdAt: new Date().toISOString(),
      active: true,
      rateLimit: newKey.rateLimit,
      environment: newKey.environment,
    };

    setApiKeys([...apiKeys, key]);
    setNewKey({ name: "", environment: "sandbox", permissions: [], rateLimit: 1000 });
    setStep(1);
    
    toast({
      title: "API Key criada!",
      description: "Guarde o secret em um local seguro.",
    });
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
    toast({
      title: "API Key removida",
      description: "A chave foi revogada com sucesso.",
    });
  };

  const handleRegenerateKey = (id: string) => {
    setApiKeys(apiKeys.map(k => {
      if (k.id === id) {
        const prefix = k.environment === "production" ? "live" : "test";
        return {
          ...k,
          secret: `sk_${prefix}_${Math.random().toString(36).substring(2, 26)}`,
        };
      }
      return k;
    }));
    toast({
      title: "Secret regenerado!",
      description: "O secret anterior foi invalidado.",
    });
  };

  const togglePermission = (permId: string) => {
    if (newKey.permissions.includes(permId)) {
      setNewKey({ ...newKey, permissions: newKey.permissions.filter(p => p !== permId) });
    } else {
      setNewKey({ ...newKey, permissions: [...newKey.permissions, permId] });
    }
  };

  const toggleSecret = (id: string) => {
    setShowSecrets({ ...showSecrets, [id]: !showSecrets[id] });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!" });
  };

  const canProceed = () => {
    switch (step) {
      case 2: return newKey.name.length > 0;
      case 3: return newKey.permissions.length > 0;
      default: return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header with Progress */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-violet-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <Code2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  API REST
                </DialogTitle>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Gerencie integrações e credenciais de acesso
                </p>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Etapa {step} de 5</span>
              <div className="flex gap-1">
                {steps.map((s) => (
                  <div
                    key={s.id}
                    className={`h-2 w-8 rounded-full transition-all ${
                      step >= s.id 
                        ? "bg-gradient-to-r from-violet-500 to-purple-500" 
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Main Content Area */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left Sidebar - Steps Navigation */}
          <div className="w-72 bg-gradient-to-b from-violet-600 via-purple-600 to-indigo-700 p-4 flex flex-col flex-shrink-0">
            <div className="space-y-2 flex-1">
              {steps.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    step === s.id
                      ? "bg-white/20 shadow-lg"
                      : "hover:bg-white/10"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    step === s.id ? "bg-white/20" : "bg-white/10"
                  }`}>
                    <s.icon className={`h-5 w-5 ${
                      step === s.id ? "text-white" : "text-white/70"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      step === s.id ? "text-white" : "text-white/70"
                    }`}>
                      {s.title}
                    </p>
                    <p className="text-xs text-white/50 truncate">{s.description}</p>
                  </div>
                  {step > s.id && (
                    <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  )}
                  {step === s.id && (
                    <ChevronRight className="h-5 w-5 text-white flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Sidebar Illustration */}
            <div className="mt-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="h-5 w-5 text-yellow-300" />
                <span className="text-white font-medium text-sm">API em Tempo Real</span>
              </div>
              <p className="text-white/70 text-xs leading-relaxed">
                Integre seu sistema com nossa API RESTful. Suporte a webhooks, rate limiting e autenticação OAuth 2.0.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                  OpenAPI 3.0
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                  JSON
                </Badge>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col min-h-0 bg-background">
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                
                {/* Step 1: Overview */}
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/10">
                            <Key className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-emerald-700">{apiKeys.filter(k => k.active).length}</p>
                            <p className="text-sm text-emerald-600">Chaves Ativas</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <Activity className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-blue-700">2.4K</p>
                            <p className="text-sm text-blue-600">Requisições/Hoje</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-violet-500/10">
                            <Webhook className="h-5 w-5 text-violet-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-violet-700">5</p>
                            <p className="text-sm text-violet-600">Webhooks Ativos</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Security Info */}
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                          <Shield className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-amber-800">Segurança das API Keys</h4>
                          <p className="text-sm text-amber-700 mt-1">
                            As chaves de API são credenciais sensíveis. Nunca as compartilhe publicamente ou as exponha em código client-side.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* API Keys List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Key className="h-5 w-5 text-violet-500" />
                          Chaves de API
                        </h3>
                        <Button
                          onClick={() => setStep(2)}
                          className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nova Chave
                        </Button>
                      </div>

                      {apiKeys.length === 0 ? (
                        <div className="p-8 text-center rounded-xl border-2 border-dashed border-muted">
                          <Key className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                          <p className="text-muted-foreground font-medium">Nenhuma API Key configurada</p>
                          <p className="text-sm text-muted-foreground mt-1">Crie sua primeira chave para começar a integrar</p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => setStep(2)}
                          >
                            Criar primeira API Key
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {apiKeys.map((apiKey) => (
                            <div
                              key={apiKey.id}
                              className="p-4 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${
                                    apiKey.environment === "production" 
                                      ? "bg-emerald-500/10" 
                                      : "bg-amber-500/10"
                                  }`}>
                                    <Key className={`h-5 w-5 ${
                                      apiKey.environment === "production" 
                                        ? "text-emerald-600" 
                                        : "text-amber-600"
                                    }`} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold text-foreground">{apiKey.name}</h4>
                                      <Badge
                                        className={`text-xs ${
                                          apiKey.environment === "production"
                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                            : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                        }`}
                                      >
                                        {apiKey.environment === "production" ? "LIVE" : "TEST"}
                                      </Badge>
                                      <Badge
                                        variant={apiKey.active ? "default" : "secondary"}
                                        className={apiKey.active ? "bg-emerald-500/10 text-emerald-600" : ""}
                                      >
                                        {apiKey.active ? "Ativo" : "Inativo"}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Criado em {new Date(apiKey.createdAt).toLocaleDateString("pt-BR")}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Activity className="h-3 w-3" />
                                        {apiKey.rateLimit} req/min
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch checked={apiKey.active} />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRegenerateKey(apiKey.id)}
                                    className="text-muted-foreground hover:text-amber-600"
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteKey(apiKey.id)}
                                    className="text-muted-foreground hover:text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                  <Globe className="h-4 w-4 text-muted-foreground" />
                                  <code className="flex-1 text-sm text-muted-foreground font-mono truncate">
                                    {apiKey.key}
                                  </code>
                                  <button
                                    onClick={() => copyToClipboard(apiKey.key)}
                                    className="p-1 text-muted-foreground hover:text-foreground"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                  <code className="flex-1 text-sm text-muted-foreground font-mono truncate">
                                    {showSecrets[apiKey.id] ? apiKey.secret : "sk_••••••••••••••••••••"}
                                  </code>
                                  <button
                                    onClick={() => toggleSecret(apiKey.id)}
                                    className="p-1 text-muted-foreground hover:text-foreground"
                                  >
                                    {showSecrets[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                  <button
                                    onClick={() => copyToClipboard(apiKey.secret)}
                                    className="p-1 text-muted-foreground hover:text-foreground"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-3">
                                {apiKey.permissions.map((perm) => (
                                  <Badge key={perm} variant="secondary" className="bg-violet-500/10 text-violet-600 border-violet-500/30">
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
                )}

                {/* Step 2: Create New Key - Name & Environment */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Key className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">Nova API Key</h2>
                      <p className="text-muted-foreground mt-2">
                        Configure uma nova chave para integração externa
                      </p>
                    </div>

                    {/* Key Name */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Nome da Chave</Label>
                      <Input
                        placeholder="Ex: Integração ERP, Channel Manager, App Mobile..."
                        value={newKey.name}
                        onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                        className="h-12 text-base"
                      />
                      <p className="text-sm text-muted-foreground">
                        Use um nome descritivo para identificar facilmente a integração
                      </p>
                    </div>

                    {/* Environment Selection */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Ambiente</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {environments.map((env) => (
                          <button
                            key={env.id}
                            onClick={() => setNewKey({ ...newKey, environment: env.id as "production" | "sandbox" })}
                            className={`p-5 rounded-xl border-2 transition-all text-left ${
                              newKey.environment === env.id
                                ? "border-violet-500 bg-violet-50 shadow-md"
                                : "border-border hover:border-violet-300 bg-card"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${env.color}`}>
                                {env.id === "production" ? (
                                  <Server className="h-5 w-5 text-white" />
                                ) : (
                                  <Terminal className="h-5 w-5 text-white" />
                                )}
                              </div>
                              <Badge className={`${
                                env.id === "production" 
                                  ? "bg-emerald-500/10 text-emerald-600" 
                                  : "bg-amber-500/10 text-amber-600"
                              }`}>
                                {env.badge}
                              </Badge>
                            </div>
                            <p className="font-semibold text-foreground">{env.label}</p>
                            <p className="text-sm text-muted-foreground mt-1">{env.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {newKey.environment === "production" && (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-amber-800">Ambiente de Produção</p>
                            <p className="text-sm text-amber-700 mt-1">
                              Esta chave terá acesso aos dados reais. Certifique-se de configurar as permissões adequadamente.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Permissions */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Shield className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">Permissões</h2>
                      <p className="text-muted-foreground mt-2">
                        Selecione os escopos de acesso para esta chave
                      </p>
                    </div>

                    <div className="space-y-4">
                      {availablePermissions.map((category) => (
                        <div 
                          key={category.category} 
                          className={`p-4 rounded-xl border bg-${category.color}-50/50 border-${category.color}-200/50`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg bg-${category.color}-500/10`}>
                              <category.icon className={`h-5 w-5 text-${category.color}-600`} />
                            </div>
                            <h4 className="font-semibold text-foreground">{category.category}</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {category.permissions.map((perm) => (
                              <button
                                key={perm.id}
                                onClick={() => togglePermission(perm.id)}
                                className={`flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
                                  newKey.permissions.includes(perm.id)
                                    ? "bg-violet-100 border-2 border-violet-500"
                                    : "bg-white border-2 border-transparent hover:border-violet-200"
                                }`}
                              >
                                {newKey.permissions.includes(perm.id) ? (
                                  <CheckCircle2 className="h-5 w-5 text-violet-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <p className="font-medium text-foreground text-sm">{perm.label}</p>
                                  <p className="text-xs text-muted-foreground">{perm.description}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {newKey.permissions.length > 0 && (
                      <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
                        <p className="text-sm font-medium text-violet-800 mb-2">
                          Permissões selecionadas ({newKey.permissions.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {newKey.permissions.map((perm) => (
                            <Badge key={perm} className="bg-violet-500/10 text-violet-600 border-violet-500/30">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Rate Limits & Settings */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Settings2 className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">Configurações</h2>
                      <p className="text-muted-foreground mt-2">
                        Defina limites e comportamentos da API
                      </p>
                    </div>

                    <div className="grid gap-6">
                      {/* Rate Limit */}
                      <div className="p-5 rounded-xl bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <Activity className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">Rate Limiting</h4>
                            <p className="text-sm text-muted-foreground">Limite de requisições por minuto</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          {[100, 500, 1000, 5000].map((limit) => (
                            <button
                              key={limit}
                              onClick={() => setNewKey({ ...newKey, rateLimit: limit })}
                              className={`p-3 rounded-lg text-center transition-all ${
                                newKey.rateLimit === limit
                                  ? "bg-blue-500 text-white font-semibold"
                                  : "bg-white border border-blue-200 hover:border-blue-400"
                              }`}
                            >
                              {limit.toLocaleString()}
                              <span className="text-xs block opacity-70">req/min</span>
                            </button>
                          ))}
                        </div>
                        <div className="mt-4">
                          <Label className="text-sm">Valor personalizado</Label>
                          <Input
                            type="number"
                            value={newKey.rateLimit}
                            onChange={(e) => setNewKey({ ...newKey, rateLimit: parseInt(e.target.value) || 0 })}
                            className="mt-2"
                            min={10}
                            max={10000}
                          />
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="p-5 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
                        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-violet-500" />
                          Resumo da Configuração
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-violet-200/50">
                            <span className="text-muted-foreground">Nome</span>
                            <span className="font-medium">{newKey.name || "—"}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-violet-200/50">
                            <span className="text-muted-foreground">Ambiente</span>
                            <Badge className={newKey.environment === "production" 
                              ? "bg-emerald-500/10 text-emerald-600" 
                              : "bg-amber-500/10 text-amber-600"
                            }>
                              {newKey.environment === "production" ? "Produção" : "Sandbox"}
                            </Badge>
                          </div>
                          <div className="flex justify-between py-2 border-b border-violet-200/50">
                            <span className="text-muted-foreground">Permissões</span>
                            <span className="font-medium">{newKey.permissions.length} selecionadas</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Rate Limit</span>
                            <span className="font-medium">{newKey.rateLimit.toLocaleString()} req/min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Documentation */}
                {step === 5 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <BookOpen className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">Documentação</h2>
                      <p className="text-muted-foreground mt-2">
                        Referência completa da API REST
                      </p>
                    </div>

                    {/* Quick Start */}
                    <div className="p-5 rounded-xl bg-slate-900 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Terminal className="h-5 w-5 text-emerald-400" />
                          <span className="font-semibold">Quick Start</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white/70 hover:text-white"
                          onClick={() => copyToClipboard(`curl -X GET "https://api.unistays.com/v1/reservations" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar
                        </Button>
                      </div>
                      <pre className="text-sm font-mono text-emerald-300 overflow-x-auto">
{`curl -X GET "https://api.unistays.com/v1/reservations" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                      </pre>
                    </div>

                    {/* Endpoints */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-violet-500" />
                        Endpoints Disponíveis
                      </h4>
                      
                      <div className="grid gap-3">
                        {[
                          { method: "GET", path: "/reservations", desc: "Listar reservas" },
                          { method: "POST", path: "/reservations", desc: "Criar reserva" },
                          { method: "GET", path: "/guests", desc: "Listar hóspedes" },
                          { method: "POST", path: "/guests", desc: "Cadastrar hóspede" },
                          { method: "GET", path: "/availability", desc: "Consultar disponibilidade" },
                          { method: "POST", path: "/payments", desc: "Processar pagamento" },
                        ].map((endpoint) => (
                          <div key={endpoint.path + endpoint.method} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                            <Badge className={`font-mono ${
                              endpoint.method === "GET" 
                                ? "bg-emerald-500/10 text-emerald-600" 
                                : "bg-blue-500/10 text-blue-600"
                            }`}>
                              {endpoint.method}
                            </Badge>
                            <code className="flex-1 text-sm font-mono text-foreground">/v1{endpoint.path}</code>
                            <span className="text-sm text-muted-foreground">{endpoint.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Documentation Links */}
                    <div className="grid grid-cols-2 gap-4">
                      <a 
                        href="#" 
                        className="p-4 rounded-xl border bg-card hover:shadow-md transition-all flex items-center gap-3"
                      >
                        <div className="p-2 rounded-lg bg-violet-500/10">
                          <FileJson className="h-5 w-5 text-violet-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">OpenAPI Spec</p>
                          <p className="text-sm text-muted-foreground">Download do schema</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                      <a 
                        href="#" 
                        className="p-4 rounded-xl border bg-card hover:shadow-md transition-all flex items-center gap-3"
                      >
                        <div className="p-2 rounded-lg bg-orange-500/10">
                          <Play className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">Postman Collection</p>
                          <p className="text-sm text-muted-foreground">Testar endpoints</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                    </div>
                  </div>
                )}

              </div>
            </ScrollArea>

            {/* Footer with Navigation */}
            <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => step > 1 ? setStep(step - 1) : onOpenChange(false)}
              >
                {step === 1 ? "Fechar" : "Voltar"}
              </Button>

              <div className="flex gap-3">
                {step >= 2 && step <= 4 && (
                  <Button
                    onClick={handleCreateKey}
                    variant="outline"
                    disabled={!newKey.name || newKey.permissions.length === 0}
                  >
                    Criar e Finalizar
                  </Button>
                )}
                {step < 5 && (
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                    className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
                  >
                    {step === 1 ? "Nova Chave" : "Continuar"}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
