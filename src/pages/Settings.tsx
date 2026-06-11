import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmailTemplateEditorModal } from "@/components/settings/EmailTemplateEditorModal";
import { DynamicVariablesModal } from "@/components/settings/DynamicVariablesModal";
import { SMTPConfigModal } from "@/components/registrations/SMTPConfigModal";
import { EmailTemplateModal } from "@/components/registrations/EmailTemplateModal";
import { cn } from "@/lib/utils";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Building2,
  Mail,
  Lock,
  Smartphone,
  Moon,
  Sun,
  Check,
  Server,
  Database,
  Key,
  Globe,
  CreditCard,
  FileText,
  Webhook,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Send,
  TestTube,
  Eye,
  EyeOff,
  RefreshCw,
  HardDrive,
  Cloud,
  Monitor,
  Upload,
  Download,
  Trash2,
  Clock,
  Calendar,
  MapPin,
  Phone,
  Image,
  Link2,
  ChevronRight,
  Coins,
  Languages,
  DollarSign,
  Hash,
  Percent,
  Type,
  BookOpen,
  FileCode,
  Flag,
  MailCheck,
  MailOpen,
  Pencil,
  Copy as CopyIcon,
  ToggleLeft,
  MessageSquare,
  UserCheck,
  CalendarCheck,
  Star,
  Gift,
  AlertCircle,
  Loader2,
  Wifi,
} from "lucide-react";

interface SettingsSection {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
}

const settingsSections: SettingsSection[] = [
  { id: "general", icon: Building2, label: "Geral", description: "Informações da empresa" },
  { id: "wifi", icon: Wifi, label: "Wi-Fi", description: "Rede e senha por propriedade" },
  { id: "currency", icon: Coins, label: "Moeda", description: "Configurações de moeda" },
  { id: "translation", icon: Languages, label: "Tradução", description: "Idiomas e traduções" },
  { id: "smtp", icon: Mail, label: "Email (SMTP)", description: "Configurações de envio" },
  { id: "email-templates", icon: MailCheck, label: "Templates de Email", description: "Modelos de emails" },
  { id: "notifications", icon: Bell, label: "Notificações", description: "Alertas e avisos" },
  { id: "security", icon: Shield, label: "Segurança", description: "Autenticação e senhas" },
  { id: "integrations", icon: Webhook, label: "Integrações", description: "APIs e webhooks" },
  { id: "backup", icon: Database, label: "Backup", description: "Dados e restauração" },
  { id: "appearance", icon: Palette, label: "Aparência", description: "Tema e visual" },
];

interface WifiProperty {
  id: number;
  name: string;
  city: string | null;
  wifiNetwork: string | null;
  wifiPassword: string | null;
  wifi_network?: string | null;
  wifi_password?: string | null;
}

function WifiSettings() {
  const [properties, setProperties] = useState<WifiProperty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [wifiData, setWifiData] = useState<Record<number, { network: string; password: string }>>({});
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setIsLoading(true);
    try {
      const res = await api.getProperties();
      if (res.success && res.data?.properties) {
        const props = res.data.properties as WifiProperty[];
        setProperties(props);
        const initial: Record<number, { network: string; password: string }> = {};
        props.forEach(p => {
          initial[p.id] = {
            network: p.wifiNetwork || p.wifi_network || '',
            password: p.wifiPassword || p.wifi_password || '',
          };
        });
        setWifiData(initial);
      }
    } catch {
      toast.error('Erro ao carregar propriedades');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (propertyId: number) => {
    const data = wifiData[propertyId];
    if (!data) return;
    setSavingId(propertyId);
    try {
      const res = await api.updateProperty(propertyId, {
        wifiNetwork: data.network,
        wifiPassword: data.password,
      });
      if (res.success) {
        toast.success('Wi-Fi atualizado com sucesso!');
      } else {
        toast.error('Erro ao salvar Wi-Fi');
      }
    } catch {
      toast.error('Erro ao salvar Wi-Fi');
    } finally {
      setSavingId(null);
    }
  };

  const updateField = (propertyId: number, field: 'network' | 'password', value: string) => {
    setWifiData(prev => ({
      ...prev,
      [propertyId]: { ...prev[propertyId], [field]: value },
    }));
  };

  return (
    <Card className="bg-card/50 backdrop-blur-xl border-white/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Wifi className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <CardTitle>Configurações de Wi-Fi</CardTitle>
            <CardDescription>Configure a rede e senha Wi-Fi de cada propriedade. Essas informações são usadas nos templates de email com as variáveis <code className="bg-muted px-1 rounded text-xs">[wifi_password]</code> e <code className="bg-muted px-1 rounded text-xs">[wifi_network]</code>.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhuma propriedade cadastrada.
          </div>
        ) : (
          properties.map((property, index) => {
            const data = wifiData[property.id] || { network: '', password: '' };
            const isEven = index % 2 === 0;
            const isSaving = savingId === property.id;
            const showPw = showPasswords[property.id] || false;
            return (
              <div
                key={property.id}
                className={cn(
                  "p-5 rounded-xl border transition-all",
                  isEven ? "bg-muted/30 border-border/60" : "bg-card/80 border-border/40"
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Building2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{property.name}</h4>
                    {property.city && <p className="text-xs text-muted-foreground">{property.city}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Nome da Rede (SSID)</Label>
                    <div className="relative">
                      <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={data.network}
                        onChange={(e) => updateField(property.id, 'network', e.target.value)}
                        placeholder="Ex: Hotel_Guest"
                        className="pl-9 bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Senha do Wi-Fi</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPw ? 'text' : 'password'}
                        value={data.password}
                        onChange={(e) => updateField(property.id, 'password', e.target.value)}
                        placeholder="Senha da rede"
                        className="pl-9 pr-10 bg-background/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, [property.id]: !showPw }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    size="sm"
                    onClick={() => handleSave(property.id)}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                    Salvar Wi-Fi
                  </Button>
                </div>
              </div>
            );
          })
        )}

        <Separator />

        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm text-foreground">Variáveis disponíveis nos templates</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Use estas variáveis nos templates de email para incluir as informações de Wi-Fi automaticamente:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="font-mono text-xs bg-background/50">[wifi_network]</Badge>
                <Badge variant="outline" className="font-mono text-xs bg-background/50">[wifi_password]</Badge>
                <Badge variant="outline" className="font-mono text-xs bg-background/50">[senha-wifi]</Badge>
                <Badge variant="outline" className="font-mono text-xs bg-background/50">[hotel_name]</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState("general");
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [variablesModalOpen, setVariablesModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{ id: string; name: string; desc: string; color: string } | null>(null);
  
  // Estados para dados das configurações gerais
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settingsData, setSettingsData] = useState({
    // Informações da Empresa
    hotelName: '',
    legalName: '',
    cnpj: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    instagram: '',
    logoUrl: '',
    // Configurações Regionais
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    language: 'pt-BR',
    dateFormat: 'DD/MM/YYYY',
    // Formatação de Moeda
    currencySymbol: 'R$',
    currencyDecimalPlaces: 2,
    currencyThousandsSeparator: '.',
    currencyDecimalSeparator: ',',
    currencySymbolPosition: 'before' as 'before' | 'after',
    // Ano Fiscal
    fiscalYearStart: '01',
    fiscalYearEnd: '12',
    // Horário de Funcionamento
    businessHoursStart: '',
    businessHoursEnd: '',
  });

  // Estados para modais
  const [smtpModalOpen, setSmtpModalOpen] = useState(false);
  const [emailTemplateModalOpen, setEmailTemplateModalOpen] = useState(false);

  // Carregar configurações ao montar o componente
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await api.getGeneralSettings();
      if (response.success && response.data) {
        setSettingsData({
          hotelName: response.data.hotelName || '',
          legalName: response.data.legalName || '',
          cnpj: response.data.cnpj || '',
          address: response.data.address || '',
          contactEmail: response.data.contactEmail || '',
          contactPhone: response.data.contactPhone || '',
          website: response.data.website || '',
          instagram: response.data.instagram || '',
          logoUrl: response.data.logoUrl || '',
          timezone: response.data.timezone || 'America/Sao_Paulo',
          currency: response.data.currency || 'BRL',
          language: response.data.language || 'pt-BR',
          dateFormat: response.data.dateFormat || 'DD/MM/YYYY',
          currencySymbol: response.data.currencySymbol || 'R$',
          currencyDecimalPlaces: response.data.currencyDecimalPlaces ?? 2,
          currencyThousandsSeparator: response.data.currencyThousandsSeparator || '.',
          currencyDecimalSeparator: response.data.currencyDecimalSeparator || ',',
          currencySymbolPosition: response.data.currencySymbolPosition || 'before',
          fiscalYearStart: response.data.fiscalYearStart || '01',
          fiscalYearEnd: response.data.fiscalYearEnd || '12',
          businessHoursStart: response.data.businessHoursStart || '',
          businessHoursEnd: response.data.businessHoursEnd || '',
        });
      }
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGeneralSettings = async () => {
    setIsSaving(true);
    try {
      const response = await api.createOrUpdateGeneralSettings({
        hotelName: settingsData.hotelName || null,
        legalName: settingsData.legalName || null,
        cnpj: settingsData.cnpj || null,
        address: settingsData.address || null,
        contactEmail: settingsData.contactEmail || null,
        contactPhone: settingsData.contactPhone || null,
        website: settingsData.website || null,
        instagram: settingsData.instagram || null,
        logoUrl: settingsData.logoUrl || null,
        timezone: settingsData.timezone,
        currency: settingsData.currency,
        language: settingsData.language,
        dateFormat: settingsData.dateFormat,
        currencySymbol: settingsData.currencySymbol || null,
        currencyDecimalPlaces: settingsData.currencyDecimalPlaces,
        currencyThousandsSeparator: settingsData.currencyThousandsSeparator || null,
        currencyDecimalSeparator: settingsData.currencyDecimalSeparator || null,
        currencySymbolPosition: settingsData.currencySymbolPosition,
        fiscalYearStart: settingsData.fiscalYearStart,
        fiscalYearEnd: settingsData.fiscalYearEnd,
        businessHoursStart: settingsData.businessHoursStart || null,
        businessHoursEnd: settingsData.businessHoursEnd || null,
      });

      if (response.success) {
        toast.success('Configurações salvas com sucesso!');
      } else {
        throw new Error(response.error?.message || 'Erro ao salvar');
      }
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      toast.error(error.message || 'Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTemplate = (template: { id: string; name: string; desc: string; color: string }) => {
    setSelectedTemplate(template);
    setTemplateEditorOpen(true);
  };

  const handleTestSmtp = () => {
    setSmtpTesting(true);
    setTimeout(() => setSmtpTesting(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-slate-500/20 to-gray-500/20">
                <SettingsIcon className="h-7 w-7 text-slate-400" />
              </div>
              Configurações
            </h1>
            <p className="text-muted-foreground mt-1">Gerencie todas as configurações do sistema</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-white/10">
              <RefreshCw className="h-4 w-4 mr-2" />
              Restaurar Padrões
            </Button>
            <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
              <Check className="h-4 w-4 mr-2" />
              Salvar Tudo
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-72 shrink-0">
            <Card className="bg-card/50 backdrop-blur-xl border-white/10 sticky top-6">
              <CardContent className="p-3">
                <nav className="space-y-1">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all",
                        activeSection === section.id
                          ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30"
                          : "hover:bg-white/5"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        activeSection === section.id ? "bg-emerald-500/20" : "bg-white/5"
                      )}>
                        <section.icon className={cn(
                          "h-4 w-4",
                          activeSection === section.id ? "text-emerald-400" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium text-sm",
                          activeSection === section.id ? "text-emerald-400" : "text-foreground"
                        )}>
                          {section.label}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{section.description}</p>
                      </div>
                      <ChevronRight className={cn(
                        "h-4 w-4 transition-transform",
                        activeSection === section.id ? "text-emerald-400 rotate-90" : "text-muted-foreground"
                      )} />
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="flex-1 space-y-6">
            {/* General */}
            {activeSection === "general" && (
              <>
                <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Building2 className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle>Informações da Empresa</CardTitle>
                        <CardDescription>Dados cadastrais do estabelecimento</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                        <Building2 className="h-10 w-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">{settingsData.hotelName || 'Nome do Hotel'}</h3>
                        <p className="text-sm text-muted-foreground">{settingsData.cnpj ? `CNPJ: ${settingsData.cnpj}` : 'CNPJ não cadastrado'}</p>
                        <Button variant="link" className="p-0 h-auto text-blue-400 mt-1">
                          <Upload className="h-3 w-3 mr-1" />
                          Alterar logo
                        </Button>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-400">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          Nome da Empresa
                        </Label>
                        <Input 
                          value={settingsData.hotelName}
                          onChange={(e) => setSettingsData(prev => ({ ...prev, hotelName: e.target.value }))}
                          placeholder="Nome do hotel"
                          className="bg-background/50 border-white/10" 
                          disabled={isLoading || isSaving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          CNPJ
                        </Label>
                        <Input 
                          value={settingsData.cnpj}
                          onChange={(e) => setSettingsData(prev => ({ ...prev, cnpj: e.target.value }))}
                          placeholder="00.000.000/0000-00"
                          className="bg-background/50 border-white/10" 
                          disabled={isLoading || isSaving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          Email Principal
                        </Label>
                        <Input 
                          type="email"
                          value={settingsData.contactEmail}
                          onChange={(e) => setSettingsData(prev => ({ ...prev, contactEmail: e.target.value }))}
                          placeholder="contato@hotel.com"
                          className="bg-background/50 border-white/10" 
                          disabled={isLoading || isSaving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          Telefone
                        </Label>
                        <Input 
                          value={settingsData.contactPhone}
                          onChange={(e) => setSettingsData(prev => ({ ...prev, contactPhone: e.target.value }))}
                          placeholder="(00) 0000-0000"
                          className="bg-background/50 border-white/10" 
                          disabled={isLoading || isSaving}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          Endereço Completo
                        </Label>
                        <Input 
                          value={settingsData.address}
                          onChange={(e) => setSettingsData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Endereço completo"
                          className="bg-background/50 border-white/10" 
                          disabled={isLoading || isSaving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                          Website
                        </Label>
                        <Input 
                          value={settingsData.website}
                          onChange={(e) => setSettingsData(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="www.hotel.com"
                          className="bg-background/50 border-white/10" 
                          disabled={isLoading || isSaving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                          Instagram
                        </Label>
                        <Input 
                          value={settingsData.instagram}
                          onChange={(e) => setSettingsData(prev => ({ ...prev, instagram: e.target.value }))}
                          placeholder="@hotel"
                          className="bg-background/50 border-white/10" 
                          disabled={isLoading || isSaving}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={handleSaveGeneralSettings}
                        disabled={isLoading || isSaving}
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Salvar Configurações
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-violet-500/10">
                        <Globe className="h-5 w-5 text-violet-400" />
                      </div>
                      <div>
                        <CardTitle>Configurações Regionais</CardTitle>
                        <CardDescription>Idioma, moeda e fuso horário</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Idioma</Label>
                        <Input 
                          value={settingsData.language}
                          onChange={(e) => setSettingsData(prev => ({ ...prev, language: e.target.value }))}
                          placeholder="pt-BR"
                          className="bg-background/50 border-white/10" 
                          disabled={isLoading || isSaving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Moeda</Label>
                        <Input 
                          value={settingsData.currency}
                          onChange={(e) => setSettingsData(prev => ({ ...prev, currency: e.target.value }))}
                          placeholder="BRL"
                          className="bg-background/50 border-white/10" 
                          disabled={isLoading || isSaving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fuso Horário</Label>
                        <Input 
                          value={settingsData.timezone}
                          onChange={(e) => setSettingsData(prev => ({ ...prev, timezone: e.target.value }))}
                          placeholder="America/Sao_Paulo"
                          className="bg-background/50 border-white/10" 
                          disabled={isLoading || isSaving}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={handleSaveGeneralSettings}
                        disabled={isLoading || isSaving}
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Salvar Configurações Regionais
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-violet-500/10">
                        <Calendar className="h-5 w-5 text-violet-400" />
                      </div>
                      <div>
                        <CardTitle>Ano Fiscal</CardTitle>
                        <CardDescription>Defina o período do ano fiscal</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          Mês de Início do Ano Fiscal
                        </Label>
                        <Select
                          value={settingsData.fiscalYearStart}
                          onValueChange={(value) => setSettingsData(prev => ({ ...prev, fiscalYearStart: value }))}
                          disabled={isLoading || isSaving}
                        >
                          <SelectTrigger className="bg-background/50 border-white/10">
                            <SelectValue placeholder="Selecione o mês" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => {
                              const month = String(i + 1).padStart(2, '0');
                              const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                              return (
                                <SelectItem key={month} value={month}>
                                  {month} - {monthNames[i]}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          Mês de Fim do Ano Fiscal
                        </Label>
                        <Select
                          value={settingsData.fiscalYearEnd}
                          onValueChange={(value) => setSettingsData(prev => ({ ...prev, fiscalYearEnd: value }))}
                          disabled={isLoading || isSaving}
                        >
                          <SelectTrigger className="bg-background/50 border-white/10">
                            <SelectValue placeholder="Selecione o mês" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => {
                              const month = String(i + 1).padStart(2, '0');
                              const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                              return (
                                <SelectItem key={month} value={month}>
                                  {month} - {monthNames[i]}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={handleSaveGeneralSettings}
                        disabled={isLoading || isSaving}
                        className="bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Salvar Ano Fiscal
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <Clock className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <CardTitle>Horário de Funcionamento</CardTitle>
                        <CardDescription>Defina os horários de abertura e fechamento</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          Horário de Abertura
                        </Label>
                        <Input 
                          type="time"
                          value={settingsData.businessHoursStart}
                          onChange={(e) => setSettingsData(prev => ({ ...prev, businessHoursStart: e.target.value }))}
                          className="bg-background/50 border-white/10" 
                          disabled={isLoading || isSaving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          Horário de Fechamento
                        </Label>
                        <Input 
                          type="time"
                          value={settingsData.businessHoursEnd}
                          onChange={(e) => setSettingsData(prev => ({ ...prev, businessHoursEnd: e.target.value }))}
                          className="bg-background/50 border-white/10" 
                          disabled={isLoading || isSaving}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={handleSaveGeneralSettings}
                        disabled={isLoading || isSaving}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Salvar Horário de Funcionamento
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* SMTP Configuration */}
            {activeSection === "smtp" && (
              <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <Mail className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <CardTitle>Configuração de E-mail (SMTP)</CardTitle>
                        <CardDescription>Configure o servidor de envio de emails</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                    <div className="flex items-start gap-3">
                      <Server className="h-5 w-5 text-amber-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground">Configuração do Servidor</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Configure as credenciais do seu servidor SMTP para envio de emails transacionais como confirmações de reserva, notificações e comunicação com hóspedes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button 
                      onClick={() => setSmtpModalOpen(true)}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                      size="lg"
                    >
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      Abrir Configuração de E-mail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications */}
            {activeSection === "notifications" && (
              <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-pink-500/10">
                      <Bell className="h-5 w-5 text-pink-400" />
                    </div>
                    <div>
                      <CardTitle>Preferências de Notificação</CardTitle>
                      <CardDescription>Escolha como deseja ser notificado</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { icon: Mail, title: "Novas Reservas", desc: "Receber email quando houver nova reserva", enabled: true, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { icon: Bell, title: "Check-in/Check-out", desc: "Alertas de chegadas e saídas do dia", enabled: true, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { icon: CreditCard, title: "Pagamentos", desc: "Notificações de pagamentos recebidos", enabled: false, color: "text-amber-400", bg: "bg-amber-500/10" },
                    { icon: Smartphone, title: "Push Mobile", desc: "Notificações no aplicativo mobile", enabled: false, color: "text-violet-400", bg: "bg-violet-500/10" },
                    { icon: AlertTriangle, title: "Alertas Críticos", desc: "Overbooking, cancelamentos em massa", enabled: true, color: "text-red-400", bg: "bg-red-500/10" },
                    { icon: Zap, title: "Automações", desc: "Notificar quando automações executarem", enabled: false, color: "text-cyan-400", bg: "bg-cyan-500/10" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${item.bg}`}>
                          <item.icon className={`h-5 w-5 ${item.color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <Switch defaultChecked={item.enabled} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Security */}
            {activeSection === "security" && (
              <>
                <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-500/10">
                        <Shield className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <CardTitle>Segurança da Conta</CardTitle>
                        <CardDescription>Proteja sua conta com autenticação adicional</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20">
                          <Lock className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Autenticação em Duas Etapas (2FA)</p>
                          <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                        </div>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-500/10">
                          <Clock className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Timeout de Sessão</p>
                          <p className="text-sm text-muted-foreground">Desconectar após período de inatividade</p>
                        </div>
                      </div>
                      <Input defaultValue="30 minutos" className="w-32 bg-background/50 border-white/10 text-right" />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Monitor className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Sessões Ativas</p>
                          <p className="text-sm text-muted-foreground">2 dispositivos conectados</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-white/10 text-red-400">
                        Encerrar Todas
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle>Alterar Senha</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Senha Atual</Label>
                        <Input type="password" className="bg-background/50 border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <Label>Nova Senha</Label>
                        <Input type="password" className="bg-background/50 border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirmar Nova Senha</Label>
                        <Input type="password" className="bg-background/50 border-white/10" />
                      </div>
                    </div>
                    <Button variant="outline" className="border-white/10">
                      <Lock className="h-4 w-4 mr-2" />
                      Atualizar Senha
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Integrations */}
            {activeSection === "integrations" && (
              <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                      <Webhook className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <CardTitle>APIs e Webhooks</CardTitle>
                      <CardDescription>Gerencie suas chaves de API e endpoints</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-cyan-400" />
                        <span className="font-medium text-foreground">API Key</span>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-400">Ativa</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        value="sk_live_••••••••••••••••••••••••" 
                        readOnly 
                        className="bg-background/50 border-white/10 font-mono text-sm" 
                      />
                      <Button variant="outline" className="border-white/10">Copiar</Button>
                      <Button variant="outline" className="border-white/10">Regenerar</Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Webhook Endpoints</Label>
                    {[
                      { url: "https://seu-site.com/webhook/reservas", events: "Reservas", status: "active" },
                      { url: "https://seu-site.com/webhook/pagamentos", events: "Pagamentos", status: "active" },
                    ].map((webhook, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${webhook.status === 'active' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                          <div>
                            <p className="text-sm font-mono text-foreground">{webhook.url}</p>
                            <p className="text-xs text-muted-foreground">{webhook.events}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-400">Remover</Button>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed border-white/10">
                      + Adicionar Webhook
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Backup */}
            {activeSection === "backup" && (
              <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Database className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <CardTitle>Backup e Restauração</CardTitle>
                      <CardDescription>Gerencie backups dos seus dados</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="font-medium text-foreground">Último backup: Hoje, 03:00</p>
                          <p className="text-sm text-muted-foreground">Próximo backup agendado: Amanhã, 03:00</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500/10 text-green-400">Automático</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Cloud className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Backup Automático</p>
                        <p className="text-sm text-muted-foreground">Backup diário às 03:00</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="border-white/10">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Backup
                    </Button>
                    <Button variant="outline" className="border-white/10">
                      <Upload className="h-4 w-4 mr-2" />
                      Restaurar Backup
                    </Button>
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      <HardDrive className="h-4 w-4 mr-2" />
                      Criar Backup Agora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Currency */}
            {activeSection === "currency" && (
              <>
                <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <Coins className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <CardTitle>Configurações de Moeda</CardTitle>
                        <CardDescription>Defina como os valores monetários serão exibidos</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-amber-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-foreground">Formato de Moeda</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Configure o formato padrão para exibição de valores em todo o sistema, incluindo reservas, relatórios financeiros e cobranças.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                          Moeda Principal
                        </Label>
                        <Input defaultValue="BRL - Real Brasileiro" className="bg-background/50 border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                          Símbolo
                        </Label>
                        <Input defaultValue="R$" className="bg-background/50 border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                          Código ISO
                        </Label>
                        <Input defaultValue="BRL" className="bg-background/50 border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                          Casas Decimais
                        </Label>
                        <Input type="number" defaultValue="2" className="bg-background/50 border-white/10" />
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <Type className="h-4 w-4 text-muted-foreground" />
                        Formato de Exibição
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Separador de Milhares</Label>
                          <Input defaultValue="." className="bg-background/50 border-white/10" />
                        </div>
                        <div className="space-y-2">
                          <Label>Separador Decimal</Label>
                          <Input defaultValue="," className="bg-background/50 border-white/10" />
                        </div>
                        <div className="space-y-2">
                          <Label>Posição do Símbolo</Label>
                          <Input defaultValue="Antes do valor (R$ 100,00)" className="bg-background/50 border-white/10" />
                        </div>
                        <div className="space-y-2">
                          <Label>Exemplo de Formatação</Label>
                          <div className="h-10 px-3 py-2 rounded-md bg-background/50 border border-white/10 flex items-center text-lg font-semibold text-amber-400">
                            R$ 1.234,56
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        Moedas Alternativas (Multi-Currency)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { code: "USD", name: "Dólar Americano", symbol: "$", rate: "4,97", active: true },
                          { code: "EUR", name: "Euro", symbol: "€", rate: "5,42", active: true },
                          { code: "GBP", name: "Libra Esterlina", symbol: "£", rate: "6,28", active: false },
                        ].map((currency) => (
                          <div
                            key={currency.code}
                            className={cn(
                              "p-4 rounded-xl border transition-all",
                              currency.active
                                ? "border-amber-500/30 bg-amber-500/5"
                                : "border-white/10 bg-background/50"
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-amber-400">{currency.symbol}</span>
                                <Badge variant="outline" className="border-white/20">{currency.code}</Badge>
                              </div>
                              <Switch checked={currency.active} />
                            </div>
                            <p className="text-sm text-foreground">{currency.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">Taxa: R$ {currency.rate}</p>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" className="border-white/10">
                        <Coins className="h-4 w-4 mr-2" />
                        Adicionar Moeda
                      </Button>
                    </div>

                    <div className="flex justify-end">
                      <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                        <Check className="h-4 w-4 mr-2" />
                        Salvar Configurações de Moeda
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Translation */}
            {activeSection === "translation" && (
              <>
                <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Languages className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle>Configurações de Tradução</CardTitle>
                        <CardDescription>Gerencie idiomas e traduções do sistema</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                      <div className="flex items-start gap-3">
                        <Globe className="h-5 w-5 text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-foreground">Sistema Multi-Idioma</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Configure os idiomas disponíveis para o sistema, motor de reservas, comunicações com hóspedes e documentos.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <Flag className="h-4 w-4 text-muted-foreground" />
                        Idioma Principal
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Idioma do Sistema</Label>
                          <Input defaultValue="Português (Brasil)" className="bg-background/50 border-white/10" />
                        </div>
                        <div className="space-y-2">
                          <Label>Código do Idioma</Label>
                          <Input defaultValue="pt-BR" className="bg-background/50 border-white/10" />
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <Languages className="h-4 w-4 text-muted-foreground" />
                        Idiomas Disponíveis
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷", default: true, active: true, progress: 100 },
                          { code: "en-US", name: "English (US)", flag: "🇺🇸", default: false, active: true, progress: 95 },
                          { code: "es-ES", name: "Español", flag: "🇪🇸", default: false, active: true, progress: 88 },
                          { code: "fr-FR", name: "Français", flag: "🇫🇷", default: false, active: false, progress: 45 },
                        ].map((lang) => (
                          <div
                            key={lang.code}
                            className={cn(
                              "p-4 rounded-xl border transition-all",
                              lang.active
                                ? "border-blue-500/30 bg-blue-500/5"
                                : "border-white/10 bg-background/50"
                            )}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{lang.flag}</span>
                                <div>
                                  <p className="font-medium text-foreground">{lang.name}</p>
                                  <p className="text-xs text-muted-foreground">{lang.code}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {lang.default && (
                                  <Badge className="bg-blue-500/20 text-blue-400">Padrão</Badge>
                                )}
                                <Switch checked={lang.active} />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Tradução completa</span>
                                <span className={lang.progress === 100 ? "text-emerald-400" : "text-amber-400"}>{lang.progress}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    lang.progress === 100 ? "bg-emerald-500" : "bg-amber-500"
                                  )}
                                  style={{ width: `${lang.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" className="border-white/10">
                        <Languages className="h-4 w-4 mr-2" />
                        Adicionar Idioma
                      </Button>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-muted-foreground" />
                        Traduções Personalizadas
                      </h4>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-violet-500/10">
                            <BookOpen className="h-5 w-5 text-violet-400" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Editor de Traduções</p>
                            <p className="text-sm text-muted-foreground">Personalize textos e mensagens do sistema</p>
                          </div>
                        </div>
                        <Button variant="outline" className="border-white/10">
                          Abrir Editor
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-cyan-500/10">
                            <Mail className="h-5 w-5 text-cyan-400" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Templates de Email</p>
                            <p className="text-sm text-muted-foreground">Traduções de emails automáticos</p>
                          </div>
                        </div>
                        <Button variant="outline" className="border-white/10">
                          Gerenciar
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                      <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-violet-400" />
                        <div>
                          <p className="font-medium text-foreground">Tradução Automática com IA</p>
                          <p className="text-sm text-muted-foreground">Use IA para traduzir conteúdos automaticamente</p>
                        </div>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex justify-end">
                      <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                        <Check className="h-4 w-4 mr-2" />
                        Salvar Configurações de Tradução
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Appearance */}
            {activeSection === "appearance" && (
              <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Palette className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle>Tema do Sistema</CardTitle>
                      <CardDescription>Personalize a aparência do sistema</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { icon: Moon, label: "Escuro", desc: "Tema escuro para ambientes com pouca luz", active: true },
                      { icon: Sun, label: "Claro", desc: "Tema claro para ambientes iluminados", active: false },
                      { icon: Monitor, label: "Automático", desc: "Segue configuração do sistema", active: false },
                    ].map((theme, index) => (
                      <button
                        key={index}
                        className={`p-5 rounded-xl border-2 transition-all text-left ${
                          theme.active 
                            ? 'border-emerald-500 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10' 
                            : 'border-white/10 hover:border-white/20 bg-background/50'
                        }`}
                      >
                        <theme.icon className={`h-8 w-8 mb-3 ${theme.active ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                        <p className={`font-medium ${theme.active ? 'text-emerald-400' : 'text-foreground'}`}>{theme.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{theme.desc}</p>
                        {theme.active && (
                          <Badge className="mt-3 bg-emerald-500/20 text-emerald-400">
                            <Check className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>

                  <Separator className="bg-white/10" />

                  <div>
                    <Label className="mb-3 block">Cor de Destaque</Label>
                    <div className="flex gap-3">
                      {[
                        { color: "from-emerald-500 to-cyan-500", name: "Esmeralda" },
                        { color: "from-blue-500 to-violet-500", name: "Oceano" },
                        { color: "from-pink-500 to-rose-500", name: "Rosa" },
                        { color: "from-amber-500 to-orange-500", name: "Âmbar" },
                        { color: "from-violet-500 to-purple-500", name: "Violeta" },
                      ].map((accent, index) => (
                        <button
                          key={index}
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent.color} transition-transform hover:scale-110 ${index === 0 ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : ''}`}
                          title={accent.name}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Wi-Fi Settings */}
            {activeSection === "wifi" && <WifiSettings />}

            {/* Email Templates */}
            {activeSection === "email-templates" && (
              <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/10">
                      <MailCheck className="h-5 w-5 text-rose-400" />
                    </div>
                    <div>
                      <CardTitle>Templates de Email</CardTitle>
                      <CardDescription>Personalize os emails enviados pelo sistema</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20">
                    <div className="flex items-start gap-3">
                      <MailOpen className="h-5 w-5 text-rose-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground">Modelos de Email Automáticos</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Configure o conteúdo e aparência dos emails enviados automaticamente pelo sistema para confirmações, notificações e comunicações com hóspedes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button 
                      onClick={() => setEmailTemplateModalOpen(true)}
                      className="bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                      size="lg"
                    >
                      <MailCheck className="h-4 w-4 mr-2" />
                      Gerenciar Templates de Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <EmailTemplateEditorModal 
        open={templateEditorOpen} 
        onOpenChange={setTemplateEditorOpen}
        template={selectedTemplate}
      />
      <DynamicVariablesModal 
        open={variablesModalOpen} 
        onOpenChange={setVariablesModalOpen} 
      />
      <SMTPConfigModal
        open={smtpModalOpen}
        onOpenChange={setSmtpModalOpen}
      />
      <EmailTemplateModal
        open={emailTemplateModalOpen}
        onOpenChange={setEmailTemplateModalOpen}
      />
    </DashboardLayout>
  );
}
