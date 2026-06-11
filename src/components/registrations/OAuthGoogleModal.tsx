import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Chrome,
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Key,
  Globe,
  Users,
  Lock,
  RefreshCw,
  Settings2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Mail,
  Calendar,
  HardDrive,
  UserCheck,
  Zap,
  TestTube,
  Link2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface OAuthGoogleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  { id: 1, title: "Visão Geral", icon: Globe, description: "Status e instruções" },
  { id: 2, title: "Credenciais", icon: Key, description: "Client ID e Secret" },
  { id: 3, title: "Escopos", icon: Shield, description: "Permissões de acesso" },
  { id: 4, title: "Configurações", icon: Settings2, description: "Opções de login" },
  { id: 5, title: "Teste", icon: TestTube, description: "Validar conexão" },
];

const availableScopes = [
  { id: "profile", label: "Perfil", description: "Informações básicas do perfil do usuário", icon: Users, category: "Básico" },
  { id: "email", label: "E-mail", description: "Endereço de e-mail do usuário", icon: Mail, category: "Básico" },
  { id: "calendar", label: "Calendário", description: "Acesso ao Google Calendar para sincronização", icon: Calendar, category: "Avançado" },
  { id: "drive", label: "Drive", description: "Acesso ao Google Drive para documentos", icon: HardDrive, category: "Avançado" },
];

export function OAuthGoogleModal({ open, onOpenChange }: OAuthGoogleModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSecret, setShowSecret] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  
  const [config, setConfig] = useState({
    clientId: "",
    clientSecret: "",
    redirectUri: "https://app.unistays.com/auth/google/callback",
    scopes: ["profile", "email"],
    guestLogin: true,
    staffLogin: false,
    autoCreateUser: true,
  });

  const progress = (currentStep / steps.length) * 100;

  const handleToggleScope = (scope: string) => {
    if (config.scopes.includes(scope)) {
      setConfig({ ...config, scopes: config.scopes.filter(s => s !== scope) });
    } else {
      setConfig({ ...config, scopes: [...config.scopes, scope] });
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsConnected(true);
    setTestSuccess(true);
    setIsTesting(false);
    toast({
      title: "Conexão validada!",
      description: "OAuth Google está configurado corretamente.",
    });
  };

  const handleSave = () => {
    toast({
      title: "Configurações salvas!",
      description: "OAuth Google foi configurado com sucesso.",
    });
    onOpenChange(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado para a área de transferência!" });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 2:
        return config.clientId.length > 10 && config.clientSecret.length > 10;
      case 3:
        return config.scopes.length > 0;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Status Card */}
            <div className={`p-6 rounded-2xl border-2 ${isConnected ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${isConnected ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                  {isConnected ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-amber-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${isConnected ? 'text-emerald-900' : 'text-amber-900'}`}>
                    {isConnected ? 'Google OAuth Conectado' : 'Não Configurado'}
                  </h3>
                  <p className={`${isConnected ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isConnected 
                      ? 'Seus usuários podem fazer login com suas contas Google' 
                      : 'Configure as credenciais para habilitar o login com Google'}
                  </p>
                </div>
                <Badge variant={isConnected ? "default" : "secondary"} className={isConnected ? "bg-emerald-500" : "bg-amber-500 text-white"}>
                  {isConnected ? "Ativo" : "Pendente"}
                </Badge>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Zap, title: "Login Rápido", desc: "Um clique para autenticar" },
                { icon: Shield, title: "Segurança", desc: "Autenticação OAuth 2.0" },
                { icon: Users, title: "Experiência", desc: "Familiar para usuários" },
                { icon: UserCheck, title: "Verificado", desc: "E-mails já confirmados" },
              ].map((benefit) => (
                <div key={benefit.title} className="p-4 rounded-xl bg-muted/50 border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-red-100 to-yellow-100">
                      <benefit.icon className="h-5 w-5 text-red-600" />
                    </div>
                    <span className="font-semibold text-foreground">{benefit.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-100">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-2">Como Configurar</h4>
                  <ol className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-700 text-xs flex items-center justify-center font-medium">1</span>
                      <span>Acesse o Google Cloud Console e crie um novo projeto</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-700 text-xs flex items-center justify-center font-medium">2</span>
                      <span>Configure a tela de consentimento OAuth</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-700 text-xs flex items-center justify-center font-medium">3</span>
                      <span>Crie credenciais OAuth 2.0 (Web Application)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-700 text-xs flex items-center justify-center font-medium">4</span>
                      <span>Copie o Client ID e Secret para este formulário</span>
                    </li>
                  </ol>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 border-blue-300 text-blue-700 hover:bg-blue-100"
                    onClick={() => window.open("https://console.cloud.google.com/apis/credentials", "_blank")}
                  >
                    Abrir Google Cloud Console
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-100">
                  <Key className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900">Credenciais OAuth</h4>
                  <p className="text-sm text-amber-700">Insira as credenciais do seu projeto Google Cloud</p>
                </div>
              </div>
            </div>

            {/* Client ID */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Client ID</Label>
              <div className="relative">
                <Input
                  placeholder="123456789012-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
                  value={config.clientId}
                  onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                  className="h-12 pr-12 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(config.clientId)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Encontre em: APIs e Serviços → Credenciais → OAuth 2.0 Client IDs
              </p>
            </div>

            {/* Client Secret */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Client Secret</Label>
              <div className="relative">
                <Input
                  type={showSecret ? "text" : "password"}
                  placeholder="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={config.clientSecret}
                  onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                  className="h-12 pr-24 font-mono text-sm"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(config.clientSecret)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                ⚠️ Mantenha este valor em segredo. Nunca compartilhe publicamente.
              </p>
            </div>

            {/* Redirect URI */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                Redirect URI
                <Badge variant="secondary" className="text-xs">Somente leitura</Badge>
              </Label>
              <div className="relative">
                <Input
                  value={config.redirectUri}
                  readOnly
                  className="h-12 pr-12 font-mono text-sm bg-muted/50"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(config.redirectUri)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="p-3 rounded-lg bg-violet-50 border border-violet-200">
                <p className="text-sm text-violet-800">
                  <strong>Importante:</strong> Adicione esta URL nas "URIs de redirecionamento autorizadas" no Google Cloud Console.
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-violet-100">
                  <Shield className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-violet-900">Escopos de Permissão</h4>
                  <p className="text-sm text-violet-700">Selecione quais dados o Google irá compartilhar</p>
                </div>
              </div>
            </div>

            {/* Scopes by Category */}
            {["Básico", "Avançado"].map((category) => (
              <div key={category} className="space-y-3">
                <h5 className="font-semibold text-foreground flex items-center gap-2">
                  {category}
                  {category === "Básico" && (
                    <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">Recomendado</Badge>
                  )}
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  {availableScopes
                    .filter((scope) => scope.category === category)
                    .map((scope) => {
                      const isSelected = config.scopes.includes(scope.id);
                      return (
                        <button
                          key={scope.id}
                          onClick={() => handleToggleScope(scope.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? "bg-violet-50 border-violet-400 shadow-sm"
                              : "bg-background border-border hover:border-violet-200 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-violet-100' : 'bg-muted'}`}>
                              <scope.icon className={`h-5 w-5 ${isSelected ? 'text-violet-600' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`font-medium ${isSelected ? 'text-violet-900' : 'text-foreground'}`}>
                                  {scope.label}
                                </span>
                                {isSelected && (
                                  <CheckCircle2 className="h-4 w-4 text-violet-600 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">{scope.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}

            {/* Selected Summary */}
            <div className="p-4 rounded-xl bg-muted/50 border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Escopos selecionados:</span>
                <div className="flex gap-2">
                  {config.scopes.map((scope) => (
                    <Badge key={scope} variant="secondary" className="bg-violet-100 text-violet-700">
                      {availableScopes.find(s => s.id === scope)?.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-100">
                  <Settings2 className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-900">Configurações de Login</h4>
                  <p className="text-sm text-cyan-700">Defina quem pode usar o login com Google</p>
                </div>
              </div>
            </div>

            {/* Settings Cards */}
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-background border-2 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-100">
                      <Users className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Login para Hóspedes</p>
                      <p className="text-sm text-muted-foreground">Permitir que hóspedes façam login com Google no portal</p>
                    </div>
                  </div>
                  <Switch 
                    checked={config.guestLogin}
                    onCheckedChange={(checked) => setConfig({ ...config, guestLogin: checked })}
                  />
                </div>
              </div>

              <div className="p-5 rounded-xl bg-background border-2 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-100">
                      <Lock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Login para Staff</p>
                      <p className="text-sm text-muted-foreground">Permitir que funcionários façam login com Google</p>
                    </div>
                  </div>
                  <Switch 
                    checked={config.staffLogin}
                    onCheckedChange={(checked) => setConfig({ ...config, staffLogin: checked })}
                  />
                </div>
              </div>

              <div className="p-5 rounded-xl bg-background border-2 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-amber-100">
                      <RefreshCw className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Auto-criar Usuário</p>
                      <p className="text-sm text-muted-foreground">Criar conta automaticamente no primeiro login</p>
                    </div>
                  </div>
                  <Switch 
                    checked={config.autoCreateUser}
                    onCheckedChange={(checked) => setConfig({ ...config, autoCreateUser: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-muted/50 border">
              <h5 className="font-medium text-foreground mb-3">Resumo das Configurações</h5>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className={`p-3 rounded-lg ${config.guestLogin ? 'bg-emerald-100 text-emerald-800' : 'bg-muted text-muted-foreground'}`}>
                  <Users className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">Hóspedes</span>
                </div>
                <div className={`p-3 rounded-lg ${config.staffLogin ? 'bg-blue-100 text-blue-800' : 'bg-muted text-muted-foreground'}`}>
                  <Lock className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">Staff</span>
                </div>
                <div className={`p-3 rounded-lg ${config.autoCreateUser ? 'bg-amber-100 text-amber-800' : 'bg-muted text-muted-foreground'}`}>
                  <RefreshCw className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">Auto-criar</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {/* Test Status */}
            <div className={`p-6 rounded-2xl border-2 ${testSuccess ? 'bg-emerald-50 border-emerald-200' : 'bg-background border-dashed'}`}>
              <div className="flex flex-col items-center text-center">
                {testSuccess ? (
                  <>
                    <div className="p-4 rounded-full bg-emerald-100 mb-4">
                      <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-900 mb-2">Conexão Validada!</h3>
                    <p className="text-emerald-700 mb-4">O OAuth Google está configurado e funcionando corretamente.</p>
                    <Badge className="bg-emerald-500">Pronto para uso</Badge>
                  </>
                ) : (
                  <>
                    <div className="p-4 rounded-full bg-muted mb-4">
                      <TestTube className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Testar Conexão</h3>
                    <p className="text-muted-foreground mb-6">Clique no botão abaixo para validar suas credenciais OAuth</p>
                    <Button
                      size="lg"
                      onClick={handleTest}
                      disabled={isTesting || !config.clientId || !config.clientSecret}
                      className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 hover:from-red-600 hover:via-yellow-600 hover:to-green-600 text-white gap-2"
                    >
                      {isTesting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                          Validando...
                        </>
                      ) : (
                        <>
                          <Chrome className="h-5 w-5" />
                          Testar Conexão com Google
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Configuration Summary */}
            <div className="p-5 rounded-xl bg-muted/50 border">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Resumo da Configuração
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Client ID</span>
                  <span className="font-mono text-sm">
                    {config.clientId ? `${config.clientId.slice(0, 20)}...` : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Escopos</span>
                  <div className="flex gap-1">
                    {config.scopes.map((scope) => (
                      <Badge key={scope} variant="secondary" className="text-xs">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Login Hóspedes</span>
                  <Badge variant={config.guestLogin ? "default" : "secondary"}>
                    {config.guestLogin ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Login Staff</span>
                  <Badge variant={config.staffLogin ? "default" : "secondary"}>
                    {config.staffLogin ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Auto-criar Usuário</span>
                  <Badge variant={config.autoCreateUser ? "default" : "secondary"}>
                    {config.autoCreateUser ? "Sim" : "Não"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Help Link */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-3">
                <Link2 className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800">
                    Precisa de ajuda? Consulte a <a href="#" className="font-medium underline">documentação do OAuth Google</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-72 bg-gradient-to-b from-red-500 via-yellow-500 to-green-500 p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Chrome className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">OAuth Google</h2>
                <p className="text-sm text-white/80">Configuração</p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-white/80 mb-2">
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
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                      isActive
                        ? "bg-white text-gray-900 shadow-lg"
                        : isCompleted
                        ? "bg-white/20 text-white hover:bg-white/30"
                        : "text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      isActive
                        ? "bg-gradient-to-br from-red-100 to-yellow-100"
                        : isCompleted
                        ? "bg-white/20"
                        : "bg-white/10"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-white'}`} />
                      ) : (
                        <step.icon className={`h-5 w-5 ${isActive ? 'text-red-600' : 'text-white/80'}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isActive ? 'text-gray-900' : ''}`}>
                        {step.title}
                      </p>
                      <p className={`text-xs truncate ${isActive ? 'text-gray-500' : 'text-white/60'}`}>
                        {step.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Status Badge */}
            <div className="mt-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white">
                {isConnected ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Conectado</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Não Configurado</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col bg-background">
            {/* Header */}
            <div className="px-8 py-5 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {steps[currentStep - 1].title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Etapa {currentStep} de {steps.length} • {steps[currentStep - 1].description}
                  </p>
                </div>
                <Badge variant="outline" className="text-sm">
                  {Math.round(progress)}% concluído
                </Badge>
              </div>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 px-8 py-6">
              {renderStepContent()}
            </ScrollArea>

            {/* Footer */}
            <div className="px-8 py-4 border-t bg-muted/30 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                {currentStep < steps.length ? (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canProceed()}
                    className="gap-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 hover:from-red-600 hover:via-yellow-600 hover:to-green-600 text-white"
                  >
                    Próximo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSave}
                    disabled={!testSuccess}
                    className="gap-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 hover:from-red-600 hover:via-yellow-600 hover:to-green-600 text-white"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Salvar Configurações
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
