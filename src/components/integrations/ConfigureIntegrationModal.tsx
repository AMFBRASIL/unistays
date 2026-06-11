import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Settings,
  Key,
  Globe,
  RefreshCw,
  Shield,
  Bell,
  Clock,
  Activity,
  Zap,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  TestTube2,
  Save,
  Trash2,
  AlertCircle,
  Link2,
  Unlink,
  History,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

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

interface ConfigureIntegrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: Integration | null;
}

const integrationConfigs: Record<string, {
  illustration: string;
  color: string;
  gradient: string;
  fields: { key: string; label: string; type: "text" | "password" | "select"; placeholder: string; required?: boolean }[];
  syncOptions: string[];
  webhookSupport: boolean;
}> = {
  booking: {
    illustration: "🏨",
    color: "from-blue-500 to-blue-600",
    gradient: "from-blue-500/20 to-blue-600/20",
    fields: [
      { key: "property_id", label: "Property ID", type: "text", placeholder: "Ex: 12345678", required: true },
      { key: "api_key", label: "API Key", type: "password", placeholder: "Sua API Key do Booking.com", required: true },
      { key: "secret_key", label: "Secret Key", type: "password", placeholder: "Sua Secret Key", required: true },
    ],
    syncOptions: ["Disponibilidade", "Tarifas", "Reservas", "Avaliações", "Fotos"],
    webhookSupport: true,
  },
  airbnb: {
    illustration: "🏠",
    color: "from-rose-500 to-pink-500",
    gradient: "from-rose-500/20 to-pink-500/20",
    fields: [
      { key: "listing_id", label: "Listing ID", type: "text", placeholder: "Ex: 123456789", required: true },
      { key: "access_token", label: "Access Token", type: "password", placeholder: "Token de acesso OAuth", required: true },
      { key: "refresh_token", label: "Refresh Token", type: "password", placeholder: "Token de refresh" },
    ],
    syncOptions: ["Calendário iCal", "Disponibilidade", "Preços", "Mensagens", "Reservas"],
    webhookSupport: true,
  },
  expedia: {
    illustration: "✈️",
    color: "from-yellow-500 to-amber-500",
    gradient: "from-yellow-500/20 to-amber-500/20",
    fields: [
      { key: "hotel_id", label: "Hotel ID", type: "text", placeholder: "Ex: EXP123456", required: true },
      { key: "username", label: "Username", type: "text", placeholder: "Usuário da API", required: true },
      { key: "password", label: "Password", type: "password", placeholder: "Senha da API", required: true },
    ],
    syncOptions: ["Inventário", "Tarifas", "Promoções", "Reservas", "Reviews"],
    webhookSupport: true,
  },
  decolar: {
    illustration: "🌎",
    color: "from-cyan-500 to-teal-500",
    gradient: "from-cyan-500/20 to-teal-500/20",
    fields: [
      { key: "hotel_code", label: "Código do Hotel", type: "text", placeholder: "Ex: DEC789", required: true },
      { key: "api_token", label: "Token de API", type: "password", placeholder: "Token de autenticação", required: true },
    ],
    syncOptions: ["Disponibilidade", "Tarifas", "Reservas"],
    webhookSupport: false,
  },
  pricelabs: {
    illustration: "📊",
    color: "from-emerald-500 to-green-500",
    gradient: "from-emerald-500/20 to-green-500/20",
    fields: [
      { key: "account_id", label: "Account ID", type: "text", placeholder: "ID da sua conta", required: true },
      { key: "api_key", label: "API Key", type: "password", placeholder: "Chave de API PriceLabs", required: true },
    ],
    syncOptions: ["Preços dinâmicos", "Dados de mercado", "Análise competitiva", "Ocupação mínima"],
    webhookSupport: true,
  },
  stripe: {
    illustration: "💳",
    color: "from-violet-500 to-purple-500",
    gradient: "from-violet-500/20 to-purple-500/20",
    fields: [
      { key: "publishable_key", label: "Publishable Key", type: "text", placeholder: "pk_live_...", required: true },
      { key: "secret_key", label: "Secret Key", type: "password", placeholder: "sk_live_...", required: true },
      { key: "webhook_secret", label: "Webhook Secret", type: "password", placeholder: "whsec_..." },
    ],
    syncOptions: ["Pagamentos", "Reembolsos", "Assinaturas", "Faturas"],
    webhookSupport: true,
  },
  whatsapp_business: {
    illustration: "💬",
    color: "from-green-500 to-emerald-500",
    gradient: "from-green-500/20 to-emerald-500/20",
    fields: [
      { key: "phone_number_id", label: "Phone Number ID", type: "text", placeholder: "ID do número", required: true },
      { key: "access_token", label: "Access Token", type: "password", placeholder: "Token permanente", required: true },
      { key: "business_id", label: "Business Account ID", type: "text", placeholder: "ID da conta business" },
    ],
    syncOptions: ["Mensagens de template", "Notificações", "Chatbot", "Status de leitura"],
    webhookSupport: true,
  },
  api_publica: {
    illustration: "🔌",
    color: "from-slate-500 to-zinc-500",
    gradient: "from-slate-500/20 to-zinc-500/20",
    fields: [
      { key: "client_id", label: "Client ID", type: "text", placeholder: "Seu Client ID", required: true },
      { key: "client_secret", label: "Client Secret", type: "password", placeholder: "Seu Client Secret", required: true },
    ],
    syncOptions: ["Leitura de dados", "Escrita de dados", "Webhooks", "Rate limiting"],
    webhookSupport: true,
  },
  webhooks: {
    illustration: "🪝",
    color: "from-orange-500 to-red-500",
    gradient: "from-orange-500/20 to-red-500/20",
    fields: [
      { key: "endpoint_url", label: "Endpoint URL", type: "text", placeholder: "https://seu-servidor.com/webhook", required: true },
      { key: "secret", label: "Signing Secret", type: "password", placeholder: "Secret para validação" },
    ],
    syncOptions: ["Reservas", "Check-in/out", "Pagamentos", "Hóspedes", "Quartos"],
    webhookSupport: true,
  },
};

const defaultConfig = {
  illustration: "⚙️",
  color: "from-gray-500 to-slate-500",
  gradient: "from-gray-500/20 to-slate-500/20",
  fields: [
    { key: "api_key", label: "API Key", type: "password" as const, placeholder: "Sua chave de API", required: true },
  ],
  syncOptions: ["Dados básicos"],
  webhookSupport: false,
};

export function ConfigureIntegrationModal({
  open,
  onOpenChange,
  integration,
}: ConfigureIntegrationModalProps) {
  const [activeTab, setActiveTab] = useState("credentials");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [syncEnabled, setSyncEnabled] = useState<Record<string, boolean>>({});
  const [isAutoSync, setIsAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState("15");
  const [isTesting, setIsTesting] = useState(false);

  if (!integration) return null;

  const config = integrationConfigs[integration.id] || defaultConfig;
  const isConnected = integration.status === "connected";

  const togglePassword = (key: string) => {
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsTesting(false);
    toast.success("Conexão testada com sucesso!", {
      description: "As credenciais estão válidas e funcionando.",
    });
  };

  const handleSave = () => {
    toast.success("Configurações salvas!", {
      description: `A integração com ${integration.name} foi atualizada.`,
    });
    onOpenChange(false);
  };

  const handleDisconnect = () => {
    toast.success("Integração desconectada", {
      description: `${integration.name} foi removido das suas integrações.`,
    });
    onOpenChange(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  // Mock activity data
  const recentActivity = [
    { action: "Sincronização", status: "success", time: "Há 5 minutos" },
    { action: "Reserva recebida #12345", status: "success", time: "Há 32 minutos" },
    { action: "Atualização de tarifa", status: "success", time: "Há 1 hora" },
    { action: "Webhook recebido", status: "warning", time: "Há 2 horas" },
    { action: "Sincronização", status: "success", time: "Há 3 horas" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header com gradiente */}
        <div className={`relative bg-gradient-to-r ${config.color} p-6 flex-shrink-0`}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl shadow-lg">
              {config.illustration}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <DialogTitle className="text-2xl font-bold text-white">
                  {integration.name}
                </DialogTitle>
                {isConnected ? (
                  <Badge className="bg-white/20 text-white border-white/30 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Conectado
                  </Badge>
                ) : (
                  <Badge className="bg-white/20 text-white border-white/30">
                    Disponível
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-white/80 text-base">
                {integration.description}
              </DialogDescription>
              {integration.features && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {integration.features.map((feature, idx) => (
                    <Badge
                      key={idx}
                      className="bg-white/10 text-white border-white/20 text-xs"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => window.open("#", "_blank")}
            >
              <ExternalLink className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs de navegação */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="w-full justify-start rounded-none border-b bg-muted/30 px-6 gap-2 flex-shrink-0">
            <TabsTrigger value="credentials" className="gap-2 data-[state=active]:bg-background">
              <Key className="h-4 w-4" />
              Credenciais
            </TabsTrigger>
            <TabsTrigger value="sync" className="gap-2 data-[state=active]:bg-background">
              <RefreshCw className="h-4 w-4" />
              Sincronização
            </TabsTrigger>
            {config.webhookSupport && (
              <TabsTrigger value="webhooks" className="gap-2 data-[state=active]:bg-background">
                <Zap className="h-4 w-4" />
                Webhooks
              </TabsTrigger>
            )}
            {isConnected && (
              <TabsTrigger value="activity" className="gap-2 data-[state=active]:bg-background">
                <Activity className="h-4 w-4" />
                Atividade
              </TabsTrigger>
            )}
          </TabsList>

          <ScrollArea className="flex-1 min-h-0">
            <div className="p-6 pb-24">
              {/* Tab Credenciais */}
              <TabsContent value="credentials" className="mt-0 space-y-6">
                <div className={`p-4 rounded-xl bg-gradient-to-r ${config.gradient} border border-border/50`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-background/80">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Credenciais Seguras</h4>
                      <p className="text-sm text-muted-foreground">
                        Suas credenciais são criptografadas e armazenadas com segurança. 
                        Nunca compartilhamos suas chaves com terceiros.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {config.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label className="flex items-center gap-2">
                        {field.label}
                        {field.required && (
                          <span className="text-destructive">*</span>
                        )}
                      </Label>
                      <div className="relative">
                        <Input
                          type={
                            field.type === "password" && !showPasswords[field.key]
                              ? "password"
                              : "text"
                          }
                          placeholder={field.placeholder}
                          value={formData[field.key] || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              [field.key]: e.target.value,
                            }))
                          }
                          className="pr-20"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                          {field.type === "password" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => togglePassword(field.key)}
                            >
                              {showPasswords[field.key] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyToClipboard(formData[field.key] || "")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                  >
                    {isTesting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube2 className="h-4 w-4" />
                    )}
                    {isTesting ? "Testando..." : "Testar Conexão"}
                  </Button>
                </div>
              </TabsContent>

              {/* Tab Sincronização */}
              <TabsContent value="sync" className="mt-0 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <RefreshCw className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Sincronização Automática</h4>
                      <p className="text-sm text-muted-foreground">
                        Manter dados sincronizados automaticamente
                      </p>
                    </div>
                  </div>
                  <Switch checked={isAutoSync} onCheckedChange={setIsAutoSync} />
                </div>

                {isAutoSync && (
                  <div className="space-y-2">
                    <Label>Intervalo de Sincronização</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {["5", "15", "30", "60"].map((interval) => (
                        <Button
                          key={interval}
                          variant={syncInterval === interval ? "default" : "outline"}
                          onClick={() => setSyncInterval(interval)}
                          className="gap-1"
                        >
                          <Clock className="h-4 w-4" />
                          {interval} min
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Dados para Sincronizar
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {config.syncOptions.map((option) => (
                      <div
                        key={option}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                      >
                        <span className="text-sm">{option}</span>
                        <Switch
                          checked={syncEnabled[option] ?? true}
                          onCheckedChange={(checked) =>
                            setSyncEnabled((prev) => ({ ...prev, [option]: checked }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Sincronizar Agora
                  </Button>
                </div>
              </TabsContent>

              {/* Tab Webhooks */}
              {config.webhookSupport && (
                <TabsContent value="webhooks" className="mt-0 space-y-6">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/20">
                        <Zap className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Webhooks em Tempo Real</h4>
                        <p className="text-sm text-muted-foreground">
                          Configure endpoints para receber notificações instantâneas 
                          de eventos do {integration.name}.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>URL do Webhook (fornecido pelo HotelFlow)</Label>
                      <div className="relative">
                        <Input
                          readOnly
                          value={`https://api.hotelflow.com/webhooks/${integration.id}/inbound`}
                          className="pr-10 bg-muted/30"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={() =>
                            copyToClipboard(
                              `https://api.hotelflow.com/webhooks/${integration.id}/inbound`
                            )
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Configure este URL no painel do {integration.name} para receber eventos.
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Eventos Suportados
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {["Reserva criada", "Reserva cancelada", "Modificação de tarifa", "Disponibilidade atualizada", "Pagamento recebido", "Avaliação recebida"].map(
                          (event) => (
                            <div
                              key={event}
                              className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                            >
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              <span className="text-sm">{event}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* Tab Atividade */}
              {isConnected && (
                <TabsContent value="activity" className="mt-0 space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm text-muted-foreground">Última Sync</span>
                      </div>
                      <p className="text-xl font-semibold">Há 5 min</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-muted-foreground">Eventos Hoje</span>
                      </div>
                      <p className="text-xl font-semibold">47</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-500" />
                        <span className="text-sm text-muted-foreground">Taxa de Sucesso</span>
                      </div>
                      <p className="text-xl font-semibold">99.8%</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Atividade Recente
                    </h4>
                    <div className="space-y-2">
                      {recentActivity.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex items-center gap-3">
                            {item.status === "success" ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                            )}
                            <span className="text-sm">{item.action}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {item.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              )}
            </div>
          </ScrollArea>

          {/* Footer fixo */}
          <div className="p-4 border-t bg-background flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                {isConnected && (
                  <Button
                    variant="ghost"
                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleDisconnect}
                  >
                    <Unlink className="h-4 w-4" />
                    Desconectar
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button
                  className={`gap-2 bg-gradient-to-r ${config.color} hover:opacity-90`}
                  onClick={handleSave}
                >
                  <Save className="h-4 w-4" />
                  {isConnected ? "Salvar Alterações" : "Conectar"}
                </Button>
              </div>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
