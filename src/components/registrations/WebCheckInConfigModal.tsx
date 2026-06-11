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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MonitorSmartphone,
  ArrowLeft,
  Check,
  Settings,
  FileText,
  Shield,
  Palette,
  Bell,
  Clock,
  Globe,
  Camera,
  CreditCard,
  Mail,
  MessageSquare,
  Key,
  Fingerprint,
  Upload,
  Eye,
  Smartphone,
  Laptop,
  QrCode,
  Sparkles,
  CheckCircle2,
  Image,
  Type,
  PaintBucket,
  LayoutTemplate,
  Link2,
  AlertCircle,
  Timer,
  Calendar,
  UserCheck,
  Building2,
} from "lucide-react";

interface WebCheckInConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  { id: 1, title: "Geral", icon: Settings, color: "from-cyan-500 to-blue-600" },
  { id: 2, title: "Documentos", icon: FileText, color: "from-emerald-500 to-teal-600" },
  { id: 3, title: "Segurança", icon: Shield, color: "from-violet-500 to-purple-600" },
  { id: 4, title: "Aparência", icon: Palette, color: "from-pink-500 to-rose-600" },
  { id: 5, title: "Notificações", icon: Bell, color: "from-amber-500 to-orange-600" },
];

const documentTypes = [
  { id: "rg", label: "RG", required: true },
  { id: "cpf", label: "CPF", required: true },
  { id: "passport", label: "Passaporte", required: false },
  { id: "driver_license", label: "CNH", required: false },
  { id: "cnh", label: "Carteira de Motorista", required: false },
  { id: "address_proof", label: "Comprovante de Endereço", required: false },
];

const verificationMethods = [
  { id: "selfie", label: "Selfie com Documento", icon: Camera, description: "Foto do hóspede segurando documento" },
  { id: "biometric", label: "Biometria Facial", icon: Fingerprint, description: "Reconhecimento facial avançado" },
  { id: "manual", label: "Verificação Manual", icon: UserCheck, description: "Aprovação pela equipe do hotel" },
];

const themes = [
  { id: "light", label: "Claro", preview: "bg-white border-gray-200" },
  { id: "dark", label: "Escuro", preview: "bg-slate-900 border-slate-700" },
  { id: "brand", label: "Personalizado", preview: "bg-gradient-to-br from-cyan-500 to-blue-600" },
];

export function WebCheckInConfigModal({ open, onOpenChange }: WebCheckInConfigModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1 - General Settings
  const [isEnabled, setIsEnabled] = useState(true);
  const [checkInWindow, setCheckInWindow] = useState("24");
  const [language, setLanguage] = useState("pt-BR");
  const [allowEarlyCheckIn, setAllowEarlyCheckIn] = useState(true);
  const [requirePayment, setRequirePayment] = useState(false);
  const [autoAssignRoom, setAutoAssignRoom] = useState(true);
  
  // Step 2 - Document Settings
  const [requiredDocs, setRequiredDocs] = useState<string[]>(["rg", "cpf"]);
  const [allowPhotoUpload, setAllowPhotoUpload] = useState(true);
  const [requireSignature, setRequireSignature] = useState(true);
  const [termsAcceptance, setTermsAcceptance] = useState(true);
  
  // Step 3 - Security Settings
  const [verificationMethod, setVerificationMethod] = useState("selfie");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("15");
  const [ipRestriction, setIpRestriction] = useState(false);
  
  // Step 4 - Appearance Settings
  const [theme, setTheme] = useState("light");
  const [primaryColor, setPrimaryColor] = useState("#0891b2");
  const [logoUrl, setLogoUrl] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("Bem-vindo! Complete seu check-in online.");
  
  // Step 5 - Notification Settings
  const [emailConfirmation, setEmailConfirmation] = useState(true);
  const [smsNotification, setSmsNotification] = useState(false);
  const [whatsappNotification, setWhatsappNotification] = useState(true);
  const [staffAlert, setStaffAlert] = useState(true);

  const progress = (currentStep / steps.length) * 100;

  const toggleDocument = (docId: string) => {
    setRequiredDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(d => d !== docId)
        : [...prev, docId]
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Hero Image */}
            <div className="relative h-48 rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
                alt="Web Check-in"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white text-xl font-bold">Configurações Gerais</h3>
                    <p className="text-white/80 text-sm">Defina o comportamento do web check-in</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                    <span className="text-white text-sm font-medium">
                      {isEnabled ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enable Toggle Card */}
            <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500">
                    <MonitorSmartphone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Web Check-in</h4>
                    <p className="text-sm text-muted-foreground">Permitir check-in online pelos hóspedes</p>
                  </div>
                </div>
                <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
              </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Janela de Check-in
                </Label>
                <Select value={checkInWindow} onValueChange={setCheckInWindow}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 horas antes</SelectItem>
                    <SelectItem value="24">24 horas antes</SelectItem>
                    <SelectItem value="48">48 horas antes</SelectItem>
                    <SelectItem value="72">72 horas antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  Idioma Padrão
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (BR)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                    <SelectItem value="fr-FR">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Toggle Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3">
                  <Timer className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="font-medium text-foreground">Check-in Antecipado</p>
                    <p className="text-sm text-muted-foreground">Permitir antes do horário padrão</p>
                  </div>
                </div>
                <Switch checked={allowEarlyCheckIn} onCheckedChange={setAllowEarlyCheckIn} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-violet-500" />
                  <div>
                    <p className="font-medium text-foreground">Pagamento Obrigatório</p>
                    <p className="text-sm text-muted-foreground">Exigir pagamento no check-in</p>
                  </div>
                </div>
                <Switch checked={requirePayment} onCheckedChange={setRequirePayment} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-medium text-foreground">Atribuição Automática</p>
                    <p className="text-sm text-muted-foreground">Definir quarto automaticamente</p>
                  </div>
                </div>
                <Switch checked={autoAssignRoom} onCheckedChange={setAutoAssignRoom} />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Hero Image */}
            <div className="relative h-48 rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800"
                alt="Documents"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white text-xl font-bold">Documentos Requeridos</h3>
                <p className="text-white/80 text-sm">Configure quais documentos serão solicitados</p>
              </div>
            </div>

            {/* Document Types */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Tipos de Documento</Label>
              <div className="grid grid-cols-2 gap-3">
                {documentTypes.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => toggleDocument(doc.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      requiredDocs.includes(doc.id)
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-border bg-card hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{doc.label}</span>
                      {requiredDocs.includes(doc.id) && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                    {doc.required && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Recomendado
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Opções Adicionais</Label>
              
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Camera className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Upload de Fotos</p>
                    <p className="text-sm text-muted-foreground">Permitir envio de fotos do documento</p>
                  </div>
                </div>
                <Switch checked={allowPhotoUpload} onCheckedChange={setAllowPhotoUpload} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <FileText className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Assinatura Digital</p>
                    <p className="text-sm text-muted-foreground">Exigir assinatura do hóspede</p>
                  </div>
                </div>
                <Switch checked={requireSignature} onCheckedChange={setRequireSignature} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Shield className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Aceite de Termos</p>
                    <p className="text-sm text-muted-foreground">Exigir aceite dos termos e condições</p>
                  </div>
                </div>
                <Switch checked={termsAcceptance} onCheckedChange={setTermsAcceptance} />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Hero Image */}
            <div className="relative h-48 rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800"
                alt="Security"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white text-xl font-bold">Segurança</h3>
                <p className="text-white/80 text-sm">Configure métodos de verificação e proteção</p>
              </div>
            </div>

            {/* Verification Methods */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Método de Verificação</Label>
              <div className="space-y-3">
                {verificationMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setVerificationMethod(method.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${
                      verificationMethod === method.id
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-border bg-card hover:border-primary/30'
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${
                      verificationMethod === method.id
                        ? 'bg-violet-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <method.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{method.label}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    {verificationMethod === method.id && (
                      <CheckCircle2 className="h-5 w-5 text-violet-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Security Options */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Configurações de Segurança</Label>
              
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <Smartphone className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Autenticação 2 Fatores</p>
                    <p className="text-sm text-muted-foreground">Código SMS ou e-mail</p>
                  </div>
                </div>
                <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Shield className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Restrição de IP</p>
                    <p className="text-sm text-muted-foreground">Limitar acesso por localização</p>
                  </div>
                </div>
                <Switch checked={ipRestriction} onCheckedChange={setIpRestriction} />
              </div>

              <div className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Timer className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Timeout da Sessão</p>
                    <p className="text-sm text-muted-foreground">Tempo de inatividade permitido</p>
                  </div>
                </div>
                <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutos</SelectItem>
                    <SelectItem value="10">10 minutos</SelectItem>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Preview Banner */}
            <div className="relative h-48 rounded-xl overflow-hidden">
              <div 
                className="w-full h-full"
                style={{ backgroundColor: primaryColor }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mx-auto mb-3 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-white text-xl font-bold">Prévia do Tema</h3>
                  <p className="text-white/80 text-sm">{welcomeMessage}</p>
                </div>
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Tema Visual</Label>
              <div className="grid grid-cols-3 gap-3">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      theme === t.id
                        ? 'border-pink-500 ring-2 ring-pink-500/30'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className={`w-full h-16 rounded-lg mb-2 ${t.preview}`} />
                    <span className="text-sm font-medium text-foreground">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color & Logo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <PaintBucket className="h-4 w-4 text-muted-foreground" />
                  Cor Principal
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 rounded-lg border border-border cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  URL do Logo
                </Label>
                <Input
                  placeholder="https://..."
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Welcome Message */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                Mensagem de Boas-Vindas
              </Label>
              <Textarea
                placeholder="Bem-vindo! Complete seu check-in online."
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={3}
              />
            </div>

            {/* Device Preview */}
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Prévia em Dispositivos
              </Label>
              <div className="flex items-center justify-center gap-6 pt-2">
                <div className="text-center">
                  <div className="w-20 h-36 rounded-xl border-2 border-border bg-card p-1 mx-auto mb-2">
                    <div 
                      className="w-full h-8 rounded-t-lg"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div className="p-2">
                      <div className="w-full h-2 bg-muted rounded mb-1" />
                      <div className="w-3/4 h-2 bg-muted rounded" />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Smartphone className="h-3 w-3" /> Mobile
                  </span>
                </div>
                <div className="text-center">
                  <div className="w-40 h-28 rounded-xl border-2 border-border bg-card p-1 mx-auto mb-2">
                    <div 
                      className="w-full h-6 rounded-t-lg"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div className="p-2">
                      <div className="w-full h-2 bg-muted rounded mb-1" />
                      <div className="w-3/4 h-2 bg-muted rounded" />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Laptop className="h-3 w-3" /> Desktop
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {/* Hero Image */}
            <div className="relative h-48 rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800"
                alt="Notifications"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white text-xl font-bold">Notificações</h3>
                <p className="text-white/80 text-sm">Configure alertas e confirmações</p>
              </div>
            </div>

            {/* Guest Notifications */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Notificações ao Hóspede</Label>
              
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">E-mail de Confirmação</p>
                    <p className="text-sm text-muted-foreground">Enviar confirmação por e-mail</p>
                  </div>
                </div>
                <Switch checked={emailConfirmation} onCheckedChange={setEmailConfirmation} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <MessageSquare className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">Enviar via WhatsApp Business</p>
                  </div>
                </div>
                <Switch checked={whatsappNotification} onCheckedChange={setWhatsappNotification} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <Smartphone className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">SMS</p>
                    <p className="text-sm text-muted-foreground">Enviar notificação por SMS</p>
                  </div>
                </div>
                <Switch checked={smsNotification} onCheckedChange={setSmsNotification} />
              </div>
            </div>

            {/* Staff Notifications */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Alertas para Equipe</Label>
              
              <div className="flex items-center justify-between p-4 rounded-xl border border-amber-500/30 bg-amber-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Alerta para Recepção</p>
                    <p className="text-sm text-muted-foreground">Notificar quando check-in for concluído</p>
                  </div>
                </div>
                <Switch checked={staffAlert} onCheckedChange={setStaffAlert} />
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <Label className="text-base font-semibold">Resumo das Configurações</Label>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-muted-foreground">Web Check-in: {isEnabled ? 'Ativo' : 'Inativo'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-muted-foreground">Documentos: {requiredDocs.length} tipos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-muted-foreground">Verificação: {verificationMethods.find(v => v.id === verificationMethod)?.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-muted-foreground">Tema: {themes.find(t => t.id === theme)?.label}</span>
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
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col overflow-hidden bg-background border-border p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <MonitorSmartphone className="h-7 w-7 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                Configuração Web Check-in
              </DialogTitle>
              <p className="text-muted-foreground mt-1">
                Configure a experiência de check-in online dos hóspedes
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="px-6 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Etapa {currentStep} de {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {steps[currentStep - 1].title}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0">
          {/* Sidebar Steps */}
          <div className="w-64 border-r border-border bg-muted/30 p-4 flex-shrink-0">
            <div className="space-y-2">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    currentStep === step.id
                      ? 'bg-card border border-primary/30 shadow-sm'
                      : currentStep > step.id
                      ? 'bg-card/50 border border-border'
                      : 'hover:bg-card/50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    currentStep === step.id
                      ? `bg-gradient-to-r ${step.color}`
                      : currentStep > step.id
                      ? 'bg-emerald-500'
                      : 'bg-muted'
                  }`}>
                    {currentStep > step.id ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <step.icon className={`h-4 w-4 ${currentStep === step.id ? 'text-white' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      currentStep === step.id ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {currentStep === step.id && (
                    <Badge variant="secondary" className="text-xs">
                      Atual
                    </Badge>
                  )}
                </button>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="h-4 w-4 text-cyan-500" />
                <span className="text-sm font-medium text-foreground">Acesso Rápido</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={isEnabled ? 'bg-emerald-500' : 'bg-gray-500'}>
                    {isEnabled ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Check-ins Hoje</span>
                  <span className="font-medium text-foreground">12</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <ScrollArea className="h-full">
              <div className="p-6">
                {renderStepContent()}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            Voltar
          </Button>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            {currentStep < steps.length ? (
              <Button
                onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                Próximo
              </Button>
            ) : (
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
