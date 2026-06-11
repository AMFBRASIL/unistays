import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  MapPin, 
  Bed, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  Mail, 
  Users, 
  Puzzle, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  Plus,
  Trash2,
  Globe,
  Clock,
  Languages,
  Hotel,
  Home,
  Building,
  TreePine,
  Layers,
  Send,
  Server,
  Zap,
  Shield,
  Settings,
  Sparkles,
  PartyPopper,
  Rocket
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const STEPS = [
  { id: 1, title: "Empresa", icon: Building2, description: "Dados da empresa" },
  { id: 2, title: "Empreendimento", icon: MapPin, description: "Primeiro local" },
  { id: 3, title: "Unidades", icon: Bed, description: "Quartos e apartamentos" },
  { id: 4, title: "Estadias", icon: Calendar, description: "Modelos de estadia" },
  { id: 5, title: "Tarifas", icon: DollarSign, description: "Preços iniciais" },
  { id: 6, title: "Pagamentos", icon: CreditCard, description: "Formas de pagamento" },
  { id: 7, title: "E-mail", icon: Mail, description: "Configuração de envio" },
  { id: 8, title: "Usuários", icon: Users, description: "Equipe inicial" },
  { id: 9, title: "Integrações", icon: Puzzle, description: "Conectar sistemas" },
  { id: 10, title: "Ativação", icon: CheckCircle2, description: "Revisar e ativar" },
];

const OPERATION_TYPES = [
  { id: "hotel", label: "Hotel", icon: Hotel, description: "Operação hoteleira tradicional" },
  { id: "apart-hotel", label: "Apart-Hotel", icon: Building, description: "Apartamentos com serviços" },
  { id: "temporada", label: "Temporada", icon: TreePine, description: "Aluguel por temporada" },
  { id: "misto", label: "Misto", icon: Layers, description: "Operação híbrida" },
];

const PROPERTY_TYPES = [
  { id: "hotel", label: "Hotel", icon: Hotel },
  { id: "apart-hotel", label: "Apart-Hotel", icon: Building },
  { id: "pousada", label: "Pousada", icon: Home },
  { id: "loft", label: "Loft / Flats", icon: Building2 },
  { id: "chacara", label: "Chácara / Temporada", icon: TreePine },
  { id: "misto", label: "Misto", icon: Layers },
];

const EMAIL_METHODS = [
  { id: "api", label: "API de Envio", icon: Zap, description: "Recomendado - Maior entregabilidade", recommended: true },
  { id: "smtp", label: "Servidor SMTP", icon: Server, description: "Servidor próprio" },
  { id: "unistays", label: "Serviço Unistays", icon: Shield, description: "Configuração simplificada" },
];

const API_PROVIDERS = [
  { id: "sendgrid", label: "SendGrid" },
  { id: "ses", label: "Amazon SES" },
  { id: "mailgun", label: "Mailgun" },
  { id: "brevo", label: "Brevo" },
  { id: "resend", label: "Resend" },
  { id: "outro", label: "Outro" },
];

const USER_ROLES = [
  { id: "admin", label: "Administrador", color: "bg-red-500" },
  { id: "recepcao", label: "Recepção", color: "bg-blue-500" },
  { id: "governanca", label: "Governança", color: "bg-green-500" },
  { id: "manutencao", label: "Manutenção", color: "bg-orange-500" },
  { id: "financeiro", label: "Financeiro", color: "bg-purple-500" },
];

const INTEGRATIONS = [
  { id: "channel-manager", label: "Channel Manager", description: "Booking, Airbnb, Expedia", icon: Globe },
  { id: "smart-locks", label: "Smart Locks", description: "Fechaduras eletrônicas", icon: Shield },
  { id: "contabilidade", label: "Contabilidade", description: "Sistemas contábeis", icon: Building2 },
  { id: "nota-fiscal", label: "Nota Fiscal", description: "Emissão automática", icon: Settings },
  { id: "portaria", label: "Portaria Remota", description: "Controle de acesso", icon: Users },
];

export default function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 - Company
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    pais: "Brasil",
    fusoHorario: "America/Sao_Paulo",
    idioma: "pt-BR",
    moeda: "BRL",
    logo: null as File | null,
    tipoOperacao: "",
    qtdEmpreendimentos: "1",
    
    // Step 2 - Property
    nomeEmpreendimento: "",
    tipoEmpreendimento: "",
    endereco: "",
    cidade: "",
    estado: "",
    paisEmpreendimento: "Brasil",
    checkinPadrao: "14:00",
    checkoutPadrao: "12:00",
    politicaCancelamento: "",
    recepcao24h: false,
    telefoneEmpreendimento: "",
    emailEmpreendimento: "",
    websiteEmpreendimento: "",
    
    // Step 3 - Units
    modoCriacaoUnidades: "",
    unidades: [] as Array<{
      id: string;
      identificador: string;
      tipo: string;
      capacidade: string;
      permiteOTA: boolean;
      permiteLongStay: boolean;
      smartLock: boolean;
      bloco: string;
      andar: string;
    }>,
    
    // Step 4 - Stay Models
    modeloHotel: true,
    modeloTemporada: false,
    modeloLongStay: false,
    configHotel: { minNoites: "1", limpeza: "diaria", contrato: false, caucao: false, cobranca: "diaria" },
    configTemporada: { minNoites: "3", limpeza: "semanal", contrato: false, caucao: true, cobranca: "antecipada" },
    configLongStay: { minNoites: "30", limpeza: "mensal", contrato: true, caucao: true, cobranca: "mensal" },
    
    // Step 5 - Rates
    modoCriacaoTarifas: "",
    tarifas: [] as Array<{
      id: string;
      nome: string;
      valorBase: string;
      tipo: string;
      validadeInicio: string;
      validadeFim: string;
    }>,
    
    // Step 6 - Payments
    moedaPagamento: "BRL",
    formasPagamento: { pix: true, cartao: true, boleto: false, dinheiro: true },
    gateway: "",
    prePagamento: false,
    multaNoShow: "",
    
    // Step 7 - Email
    metodoEmail: "",
    // API
    provedorApi: "",
    apiKey: "",
    dominioAutenticado: "",
    emailRemetente: "",
    nomeRemetente: "",
    limiteApiDiario: "",
    webhookEventos: "",
    // SMTP
    servidorSmtp: "",
    portaSmtp: "587",
    segurancaSmtp: "tls",
    usuarioSmtp: "",
    senhaSmtp: "",
    // Unistays
    limiteMensal: "1000",
    brandingUnistays: true,
    // Global
    idiomaEmail: "pt-BR",
    replyTo: "",
    assinaturaAutomatica: true,
    templatesAtivos: {
      confirmacaoReserva: true,
      checkinDigital: true,
      pagamentoRecebido: true,
      lembreteCheckout: true,
      avaliacaoPosEstadia: true,
    },
    
    // Step 8 - Users
    usuarios: [] as Array<{
      id: string;
      nome: string;
      email: string;
      papel: string;
    }>,
    
    // Step 9 - Integrations
    integracoesAtivas: [] as string[],
  });

  const progress = (currentStep / STEPS.length) * 100;

  const updateFormData = (key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      toast.success("Progresso salvo automaticamente");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipStep = () => {
    nextStep();
    toast.info("Etapa pulada - você pode configurar depois");
  };

  const addUnit = () => {
    const newUnit = {
      id: Date.now().toString(),
      identificador: "",
      tipo: "quarto",
      capacidade: "2",
      permiteOTA: true,
      permiteLongStay: false,
      smartLock: false,
      bloco: "",
      andar: "",
    };
    updateFormData("unidades", [...formData.unidades, newUnit]);
  };

  const removeUnit = (id: string) => {
    updateFormData("unidades", formData.unidades.filter(u => u.id !== id));
  };

  const updateUnit = (id: string, field: string, value: unknown) => {
    updateFormData("unidades", formData.unidades.map(u => 
      u.id === id ? { ...u, [field]: value } : u
    ));
  };

  const addTarifa = () => {
    const newTarifa = {
      id: Date.now().toString(),
      nome: "",
      valorBase: "",
      tipo: "flexivel",
      validadeInicio: "",
      validadeFim: "",
    };
    updateFormData("tarifas", [...formData.tarifas, newTarifa]);
  };

  const removeTarifa = (id: string) => {
    updateFormData("tarifas", formData.tarifas.filter(t => t.id !== id));
  };

  const addUsuario = () => {
    const newUsuario = {
      id: Date.now().toString(),
      nome: "",
      email: "",
      papel: "recepcao",
    };
    updateFormData("usuarios", [...formData.usuarios, newUsuario]);
  };

  const removeUsuario = (id: string) => {
    updateFormData("usuarios", formData.usuarios.filter(u => u.id !== id));
  };

  const updateUsuario = (id: string, field: string, value: unknown) => {
    updateFormData("usuarios", formData.usuarios.map(u => 
      u.id === id ? { ...u, [field]: value } : u
    ));
  };

  const toggleIntegration = (id: string) => {
    const current = formData.integracoesAtivas;
    if (current.includes(id)) {
      updateFormData("integracoesAtivas", current.filter(i => i !== id));
    } else {
      updateFormData("integracoesAtivas", [...current, id]);
    }
  };

  const [isInstalling, setIsInstalling] = useState(false);

  const handleActivate = async () => {
    // Validações básicas
    if (!formData.razaoSocial || !formData.nomeFantasia) {
      toast.error("Preencha os dados da empresa");
      return;
    }

    if (!formData.nomeEmpreendimento || !formData.tipoEmpreendimento) {
      toast.error("Preencha os dados do empreendimento");
      return;
    }

    if (formData.usuarios.length === 0) {
      toast.error("Adicione pelo menos um usuário");
      return;
    }

    // Validar usuários
    for (const usuario of formData.usuarios) {
      if (!usuario.nome || !usuario.email || !usuario.papel) {
        toast.error("Preencha todos os dados dos usuários");
        return;
      }
    }

    setIsInstalling(true);

    try {
      const response = await api.installSetup(formData);

      if (response.success && response.data) {
        toast.success("🎉 Unistays instalado com sucesso!", {
          description: "Seu sistema está pronto para operar! Redirecionando..."
        });

        // Redirecionar após 2 segundos
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        toast.error(response.error?.message || "Erro ao instalar o sistema");
      }
    } catch (error: any) {
      console.error("Erro na instalação:", error);
      toast.error(error?.message || "Erro ao processar instalação. Tente novamente.");
    } finally {
      setIsInstalling(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Header Illustration */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Dados da Empresa</h2>
                    <p className="text-blue-100">Base do seu ambiente multi-tenant</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Razão Social *</Label>
                <Input 
                  placeholder="Nome legal da empresa"
                  value={formData.razaoSocial}
                  onChange={(e) => updateFormData("razaoSocial", e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nome Fantasia *</Label>
                <Input 
                  placeholder="Nome comercial"
                  value={formData.nomeFantasia}
                  onChange={(e) => updateFormData("nomeFantasia", e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">CNPJ / Documento Fiscal *</Label>
                <Input 
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={(e) => updateFormData("cnpj", e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">País *</Label>
                <Select value={formData.pais} onValueChange={(v) => updateFormData("pais", v)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brasil">🇧🇷 Brasil</SelectItem>
                    <SelectItem value="Portugal">🇵🇹 Portugal</SelectItem>
                    <SelectItem value="USA">🇺🇸 Estados Unidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Regional Settings */}
            <div className="p-5 rounded-xl bg-muted/50 border space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Configurações Regionais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Fuso Horário</Label>
                  <Select value={formData.fusoHorario} onValueChange={(v) => updateFormData("fusoHorario", v)}>
                    <SelectTrigger className="h-11">
                      <Clock className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                      <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                      <SelectItem value="America/Recife">Recife (GMT-3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Idioma</Label>
                  <Select value={formData.idioma} onValueChange={(v) => updateFormData("idioma", v)}>
                    <SelectTrigger className="h-11">
                      <Languages className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (BR)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Moeda</Label>
                  <Select value={formData.moeda} onValueChange={(v) => updateFormData("moeda", v)}>
                    <SelectTrigger className="h-11">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">R$ Real (BRL)</SelectItem>
                      <SelectItem value="USD">$ Dólar (USD)</SelectItem>
                      <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Logo da Empresa</Label>
              <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30">
                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Arraste ou clique para enviar</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG até 2MB</p>
              </div>
            </div>

            {/* Operation Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tipo de Operação Predominante</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {OPERATION_TYPES.map((type) => (
                  <Card 
                    key={type.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.tipoOperacao === type.id 
                        ? "ring-2 ring-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => updateFormData("tipoOperacao", type.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <type.icon className={`w-8 h-8 mx-auto mb-2 ${
                        formData.tipoOperacao === type.id ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <p className="font-medium text-sm">{type.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Number of Properties */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quantidade de Empreendimentos</Label>
              <Select value={formData.qtdEmpreendimentos} onValueChange={(v) => updateFormData("qtdEmpreendimentos", v)}>
                <SelectTrigger className="h-12 w-full md:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 empreendimento</SelectItem>
                  <SelectItem value="2-5">2 a 5 empreendimentos</SelectItem>
                  <SelectItem value="6-10">6 a 10 empreendimentos</SelectItem>
                  <SelectItem value="10+">Mais de 10 empreendimentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Primeiro Empreendimento</h2>
                    <p className="text-emerald-100">Onde a operação acontece</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tipo de Empreendimento *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PROPERTY_TYPES.map((type) => (
                  <Card 
                    key={type.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.tipoEmpreendimento === type.id 
                        ? "ring-2 ring-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => updateFormData("tipoEmpreendimento", type.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <type.icon className={`w-8 h-8 mx-auto mb-2 ${
                        formData.tipoEmpreendimento === type.id ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <p className="font-medium text-sm">{type.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium">Nome do Empreendimento *</Label>
                <Input 
                  placeholder="Ex: Hotel Vista Mar"
                  value={formData.nomeEmpreendimento}
                  onChange={(e) => updateFormData("nomeEmpreendimento", e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium">Endereço Completo *</Label>
                <Input 
                  placeholder="Rua, número, bairro"
                  value={formData.endereco}
                  onChange={(e) => updateFormData("endereco", e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cidade *</Label>
                <Input 
                  placeholder="Cidade"
                  value={formData.cidade}
                  onChange={(e) => updateFormData("cidade", e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Estado *</Label>
                <Input 
                  placeholder="Estado"
                  value={formData.estado}
                  onChange={(e) => updateFormData("estado", e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            {/* Check-in/out Times */}
            <div className="p-5 rounded-xl bg-muted/50 border space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Horários Padrão
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Check-in Padrão</Label>
                  <Input 
                    type="time"
                    value={formData.checkinPadrao}
                    onChange={(e) => updateFormData("checkinPadrao", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Check-out Padrão</Label>
                  <Input 
                    type="time"
                    value={formData.checkoutPadrao}
                    onChange={(e) => updateFormData("checkoutPadrao", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Política de Cancelamento</Label>
              <Textarea 
                placeholder="Descreva a política básica de cancelamento..."
                value={formData.politicaCancelamento}
                onChange={(e) => updateFormData("politicaCancelamento", e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Extra Info */}
            <div className="p-5 rounded-xl bg-muted/50 border space-y-4">
              <h3 className="font-semibold">Informações Adicionais</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Recepção 24 horas</p>
                  <p className="text-sm text-muted-foreground">Atendimento disponível a qualquer hora</p>
                </div>
                <Switch 
                  checked={formData.recepcao24h}
                  onCheckedChange={(v) => updateFormData("recepcao24h", v)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-sm">Telefone</Label>
                  <Input 
                    placeholder="(00) 0000-0000"
                    value={formData.telefoneEmpreendimento}
                    onChange={(e) => updateFormData("telefoneEmpreendimento", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">E-mail</Label>
                  <Input 
                    type="email"
                    placeholder="contato@hotel.com"
                    value={formData.emailEmpreendimento}
                    onChange={(e) => updateFormData("emailEmpreendimento", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm">Website (opcional)</Label>
                  <Input 
                    placeholder="https://www.seuhotel.com"
                    value={formData.websiteEmpreendimento}
                    onChange={(e) => updateFormData("websiteEmpreendimento", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-8 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Bed className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Unidades</h2>
                    <p className="text-orange-100">Coração do Unistays (unit-based)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Creation Mode */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Como deseja criar as unidades?</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "agora", label: "Criar Agora", description: "Adicione unidades manualmente", icon: Plus },
                  { id: "csv", label: "Importar CSV", description: "Faça upload de planilha", icon: Upload },
                  { id: "depois", label: "Criar Depois", description: "Configure posteriormente", icon: Clock },
                ].map((mode) => (
                  <Card 
                    key={mode.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.modoCriacaoUnidades === mode.id 
                        ? "ring-2 ring-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => updateFormData("modoCriacaoUnidades", mode.id)}
                  >
                    <CardContent className="p-5">
                      <mode.icon className={`w-8 h-8 mb-3 ${
                        formData.modoCriacaoUnidades === mode.id ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <p className="font-medium">{mode.label}</p>
                      <p className="text-sm text-muted-foreground">{mode.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {formData.modoCriacaoUnidades === "agora" && (
              <>
                {/* Units List */}
                <div className="space-y-4">
                  {formData.unidades.map((unit, index) => (
                    <Card key={unit.id} className="border-2">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="secondary">Unidade {index + 1}</Badge>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeUnit(unit.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs">Identificador</Label>
                            <Input 
                              placeholder="101, A2..."
                              value={unit.identificador}
                              onChange={(e) => updateUnit(unit.id, "identificador", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Tipo</Label>
                            <Select 
                              value={unit.tipo} 
                              onValueChange={(v) => updateUnit(unit.id, "tipo", v)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="quarto">Quarto</SelectItem>
                                <SelectItem value="apartamento">Apartamento</SelectItem>
                                <SelectItem value="loft">Loft</SelectItem>
                                <SelectItem value="casa">Casa</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Capacidade</Label>
                            <Input 
                              type="number"
                              value={unit.capacidade}
                              onChange={(e) => updateUnit(unit.id, "capacidade", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Bloco/Andar</Label>
                            <Input 
                              placeholder="A / 1"
                              value={unit.bloco}
                              onChange={(e) => updateUnit(unit.id, "bloco", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-4">
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox 
                              checked={unit.permiteOTA}
                              onCheckedChange={(v) => updateUnit(unit.id, "permiteOTA", v)}
                            />
                            Permite OTA
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox 
                              checked={unit.permiteLongStay}
                              onCheckedChange={(v) => updateUnit(unit.id, "permiteLongStay", v)}
                            />
                            Permite Long Stay
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox 
                              checked={unit.smartLock}
                              onCheckedChange={(v) => updateUnit(unit.id, "smartLock", v)}
                            />
                            Smart Lock
                          </label>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full h-14 border-dashed"
                  onClick={addUnit}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Unidade
                </Button>
              </>
            )}

            {formData.modoCriacaoUnidades === "csv" && (
              <div className="border-2 border-dashed rounded-xl p-10 text-center bg-muted/30">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium mb-2">Arraste seu arquivo CSV aqui</p>
                <p className="text-sm text-muted-foreground mb-4">ou clique para selecionar</p>
                <Button variant="outline">Selecionar Arquivo</Button>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-8 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Modelos de Estadia</h2>
                    <p className="text-purple-100">Automação híbrida para diferentes tipos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stay Models */}
            <div className="space-y-4">
              {/* Hotel Model */}
              <Card className={`transition-all ${formData.modeloHotel ? "ring-2 ring-primary" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Hotel className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Hotel (Diária)</p>
                        <p className="text-sm text-muted-foreground">Reservas por noite</p>
                      </div>
                    </div>
                    <Switch 
                      checked={formData.modeloHotel}
                      onCheckedChange={(v) => updateFormData("modeloHotel", v)}
                    />
                  </div>
                  {formData.modeloHotel && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label className="text-xs">Mín. Noites</Label>
                        <Input value={formData.configHotel.minNoites} onChange={(e) => updateFormData("configHotel", {...formData.configHotel, minNoites: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Limpeza</Label>
                        <Select value={formData.configHotel.limpeza} onValueChange={(v) => updateFormData("configHotel", {...formData.configHotel, limpeza: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="diaria">Diária</SelectItem>
                            <SelectItem value="sob-demanda">Sob demanda</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Cobrança</Label>
                        <Select value={formData.configHotel.cobranca} onValueChange={(v) => updateFormData("configHotel", {...formData.configHotel, cobranca: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="diaria">Diária</SelectItem>
                            <SelectItem value="antecipada">Antecipada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox checked={formData.configHotel.contrato} onCheckedChange={(v) => updateFormData("configHotel", {...formData.configHotel, contrato: v})} />
                          Contrato
                        </label>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Temporada Model */}
              <Card className={`transition-all ${formData.modeloTemporada ? "ring-2 ring-primary" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TreePine className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Temporada</p>
                        <p className="text-sm text-muted-foreground">Aluguel sazonal</p>
                      </div>
                    </div>
                    <Switch 
                      checked={formData.modeloTemporada}
                      onCheckedChange={(v) => updateFormData("modeloTemporada", v)}
                    />
                  </div>
                  {formData.modeloTemporada && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label className="text-xs">Mín. Noites</Label>
                        <Input value={formData.configTemporada.minNoites} onChange={(e) => updateFormData("configTemporada", {...formData.configTemporada, minNoites: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Limpeza</Label>
                        <Select value={formData.configTemporada.limpeza} onValueChange={(v) => updateFormData("configTemporada", {...formData.configTemporada, limpeza: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="semanal">Semanal</SelectItem>
                            <SelectItem value="por-estadia">Por estadia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Cobrança</Label>
                        <Select value={formData.configTemporada.cobranca} onValueChange={(v) => updateFormData("configTemporada", {...formData.configTemporada, cobranca: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="antecipada">Antecipada</SelectItem>
                            <SelectItem value="parcelada">Parcelada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox checked={formData.configTemporada.caucao} onCheckedChange={(v) => updateFormData("configTemporada", {...formData.configTemporada, caucao: v})} />
                          Caução
                        </label>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Long Stay Model */}
              <Card className={`transition-all ${formData.modeloLongStay ? "ring-2 ring-primary" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Building className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Long Stay / Mensal</p>
                        <p className="text-sm text-muted-foreground">Estadias prolongadas</p>
                      </div>
                    </div>
                    <Switch 
                      checked={formData.modeloLongStay}
                      onCheckedChange={(v) => updateFormData("modeloLongStay", v)}
                    />
                  </div>
                  {formData.modeloLongStay && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label className="text-xs">Mín. Noites</Label>
                        <Input value={formData.configLongStay.minNoites} onChange={(e) => updateFormData("configLongStay", {...formData.configLongStay, minNoites: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Limpeza</Label>
                        <Select value={formData.configLongStay.limpeza} onValueChange={(v) => updateFormData("configLongStay", {...formData.configLongStay, limpeza: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mensal">Mensal</SelectItem>
                            <SelectItem value="quinzenal">Quinzenal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Cobrança</Label>
                        <Select value={formData.configLongStay.cobranca} onValueChange={(v) => updateFormData("configLongStay", {...formData.configLongStay, cobranca: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mensal">Mensal</SelectItem>
                            <SelectItem value="antecipada">Antecipada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox checked={formData.configLongStay.contrato} onCheckedChange={(v) => updateFormData("configLongStay", {...formData.configLongStay, contrato: v})} />
                          Contrato
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox checked={formData.configLongStay.caucao} onCheckedChange={(v) => updateFormData("configLongStay", {...formData.configLongStay, caucao: v})} />
                          Caução
                        </label>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-8 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <DollarSign className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Tarifas Iniciais</h2>
                    <p className="text-green-100">Configure seus preços base</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Creation Mode */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Como deseja configurar tarifas?</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "agora", label: "Criar Agora", description: "Configure tarifas manualmente", icon: Plus },
                  { id: "importar", label: "Importar", description: "Upload de planilha", icon: Upload },
                  { id: "depois", label: "Configurar Depois", description: "Faça isso posteriormente", icon: Clock },
                ].map((mode) => (
                  <Card 
                    key={mode.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.modoCriacaoTarifas === mode.id 
                        ? "ring-2 ring-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => updateFormData("modoCriacaoTarifas", mode.id)}
                  >
                    <CardContent className="p-5">
                      <mode.icon className={`w-8 h-8 mb-3 ${
                        formData.modoCriacaoTarifas === mode.id ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <p className="font-medium">{mode.label}</p>
                      <p className="text-sm text-muted-foreground">{mode.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {formData.modoCriacaoTarifas === "agora" && (
              <>
                <div className="space-y-4">
                  {formData.tarifas.map((tarifa, index) => (
                    <Card key={tarifa.id} className="border-2">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="secondary">Tarifa {index + 1}</Badge>
                          <Button variant="ghost" size="icon" onClick={() => removeTarifa(tarifa.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs">Nome da Tarifa</Label>
                            <Input placeholder="Ex: Tarifa Padrão" value={tarifa.nome} onChange={(e) => {
                              const updated = formData.tarifas.map(t => t.id === tarifa.id ? {...t, nome: e.target.value} : t);
                              updateFormData("tarifas", updated);
                            }} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Valor Base (R$)</Label>
                            <Input type="number" placeholder="150,00" value={tarifa.valorBase} onChange={(e) => {
                              const updated = formData.tarifas.map(t => t.id === tarifa.id ? {...t, valorBase: e.target.value} : t);
                              updateFormData("tarifas", updated);
                            }} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Tipo</Label>
                            <Select value={tarifa.tipo} onValueChange={(v) => {
                              const updated = formData.tarifas.map(t => t.id === tarifa.id ? {...t, tipo: v} : t);
                              updateFormData("tarifas", updated);
                            }}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="flexivel">Flexível</SelectItem>
                                <SelectItem value="nao-reembolsavel">Não Reembolsável</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button variant="outline" className="w-full h-14 border-dashed" onClick={addTarifa}>
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Tarifa
                </Button>
              </>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-600 via-rose-600 to-red-600 p-8 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Pagamentos</h2>
                    <p className="text-pink-100">Configure formas de recebimento</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Formas de Pagamento Aceitas</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: "pix", label: "PIX", icon: "⚡" },
                  { id: "cartao", label: "Cartão de Crédito", icon: "💳" },
                  { id: "boleto", label: "Boleto", icon: "📄" },
                  { id: "dinheiro", label: "Dinheiro", icon: "💵" },
                ].map((method) => (
                  <Card 
                    key={method.id}
                    className={`cursor-pointer transition-all ${
                      formData.formasPagamento[method.id as keyof typeof formData.formasPagamento]
                        ? "ring-2 ring-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => updateFormData("formasPagamento", {
                      ...formData.formasPagamento,
                      [method.id]: !formData.formasPagamento[method.id as keyof typeof formData.formasPagamento]
                    })}
                  >
                    <CardContent className="p-5 text-center">
                      <span className="text-3xl mb-2 block">{method.icon}</span>
                      <p className="font-medium text-sm">{method.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Gateway */}
            <div className="p-5 rounded-xl bg-muted/50 border space-y-4">
              <h3 className="font-semibold">Gateway de Pagamento</h3>
              <Select value={formData.gateway} onValueChange={(v) => updateFormData("gateway", v)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione um gateway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="pagarme">Pagar.me</SelectItem>
                  <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                  <SelectItem value="cielo">Cielo</SelectItem>
                  <SelectItem value="nenhum">Configurar depois</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Additional Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
                <div>
                  <p className="font-medium">Pré-pagamento Obrigatório</p>
                  <p className="text-sm text-muted-foreground">Exigir pagamento antes do check-in</p>
                </div>
                <Switch 
                  checked={formData.prePagamento}
                  onCheckedChange={(v) => updateFormData("prePagamento", v)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Multa de No-Show (%)</Label>
                <Input 
                  type="number"
                  placeholder="Ex: 100"
                  value={formData.multaNoShow}
                  onChange={(e) => updateFormData("multaNoShow", e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-600 p-8 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Mail className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Comunicação & E-mail</h2>
                    <p className="text-cyan-100">Configure o envio de mensagens</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Method Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Como deseja enviar e-mails?</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {EMAIL_METHODS.map((method) => (
                  <Card 
                    key={method.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.metodoEmail === method.id 
                        ? "ring-2 ring-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => updateFormData("metodoEmail", method.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <method.icon className={`w-8 h-8 ${
                          formData.metodoEmail === method.id ? "text-primary" : "text-muted-foreground"
                        }`} />
                        {method.recommended && (
                          <Badge className="bg-green-500 text-white text-xs">Recomendado</Badge>
                        )}
                      </div>
                      <p className="font-medium">{method.label}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* API Configuration */}
            {formData.metodoEmail === "api" && (
              <div className="p-5 rounded-xl bg-muted/50 border space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Configuração de API
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Provedor</Label>
                    <Select value={formData.provedorApi} onValueChange={(v) => updateFormData("provedorApi", v)}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {API_PROVIDERS.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">API Key</Label>
                    <Input type="password" placeholder="Sua chave de API" value={formData.apiKey} onChange={(e) => updateFormData("apiKey", e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">E-mail Remetente</Label>
                    <Input placeholder="noreply@seuhotel.com" value={formData.emailRemetente} onChange={(e) => updateFormData("emailRemetente", e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Nome do Remetente</Label>
                    <Input placeholder="Hotel Vista Mar" value={formData.nomeRemetente} onChange={(e) => updateFormData("nomeRemetente", e.target.value)} className="h-11" />
                  </div>
                </div>
                <Button variant="outline" className="mt-4">
                  <Send className="w-4 h-4 mr-2" />
                  Testar Conexão
                </Button>
              </div>
            )}

            {/* SMTP Configuration */}
            {formData.metodoEmail === "smtp" && (
              <div className="p-5 rounded-xl bg-muted/50 border space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Server className="w-5 h-5 text-primary" />
                  Configuração SMTP
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Servidor SMTP</Label>
                    <Input placeholder="smtp.seuservidor.com" value={formData.servidorSmtp} onChange={(e) => updateFormData("servidorSmtp", e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Porta</Label>
                    <Input placeholder="587" value={formData.portaSmtp} onChange={(e) => updateFormData("portaSmtp", e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Segurança</Label>
                    <Select value={formData.segurancaSmtp} onValueChange={(v) => updateFormData("segurancaSmtp", v)}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                        <SelectItem value="none">Nenhum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Usuário</Label>
                    <Input placeholder="usuario@email.com" value={formData.usuarioSmtp} onChange={(e) => updateFormData("usuarioSmtp", e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm">Senha</Label>
                    <Input type="password" placeholder="Senha SMTP" value={formData.senhaSmtp} onChange={(e) => updateFormData("senhaSmtp", e.target.value)} className="h-11" />
                  </div>
                </div>
                <Button variant="outline" className="mt-4">
                  <Send className="w-4 h-4 mr-2" />
                  Testar Conexão
                </Button>
              </div>
            )}

            {/* Unistays Service */}
            {formData.metodoEmail === "unistays" && (
              <div className="p-5 rounded-xl bg-muted/50 border space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Serviço Unistays
                </h3>
                <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                  <div>
                    <p className="font-medium">Branding Unistays no rodapé</p>
                    <p className="text-sm text-muted-foreground">Mostrar "Enviado via Unistays"</p>
                  </div>
                  <Switch 
                    checked={formData.brandingUnistays}
                    onCheckedChange={(v) => updateFormData("brandingUnistays", v)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  ✓ Até 1.000 e-mails/mês inclusos no plano
                </p>
              </div>
            )}

            {/* Email Templates */}
            {formData.metodoEmail && (
              <div className="p-5 rounded-xl bg-muted/50 border space-y-4">
                <h3 className="font-semibold">Templates Ativos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: "confirmacaoReserva", label: "Confirmação de Reserva" },
                    { id: "checkinDigital", label: "Check-in Digital" },
                    { id: "pagamentoRecebido", label: "Pagamento Recebido" },
                    { id: "lembreteCheckout", label: "Lembrete de Check-out" },
                    { id: "avaliacaoPosEstadia", label: "Avaliação Pós-Estadia" },
                  ].map((template) => (
                    <label key={template.id} className="flex items-center gap-3 p-3 bg-background rounded-lg cursor-pointer hover:bg-muted/50">
                      <Checkbox 
                        checked={formData.templatesAtivos[template.id as keyof typeof formData.templatesAtivos]}
                        onCheckedChange={(v) => updateFormData("templatesAtivos", {
                          ...formData.templatesAtivos,
                          [template.id]: v
                        })}
                      />
                      <span className="text-sm">{template.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 p-8 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Usuários & Permissões</h2>
                    <p className="text-indigo-100">Configure sua equipe inicial</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="space-y-4">
              {formData.usuarios.map((usuario, index) => (
                <Card key={usuario.id} className="border-2">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary">Usuário {index + 1}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => removeUsuario(usuario.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Nome</Label>
                        <Input 
                          placeholder="Nome completo"
                          value={usuario.nome}
                          onChange={(e) => updateUsuario(usuario.id, "nome", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">E-mail</Label>
                        <Input 
                          type="email"
                          placeholder="email@exemplo.com"
                          value={usuario.email}
                          onChange={(e) => updateUsuario(usuario.id, "email", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Papel</Label>
                        <Select 
                          value={usuario.papel} 
                          onValueChange={(v) => updateUsuario(usuario.id, "papel", v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {USER_ROLES.map(role => (
                              <SelectItem key={role.id} value={role.id}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${role.color}`} />
                                  {role.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button variant="outline" className="w-full h-14 border-dashed" onClick={addUsuario}>
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Usuário
            </Button>

            {/* Quick Add Roles */}
            <div className="p-5 rounded-xl bg-muted/50 border">
              <h3 className="font-semibold mb-4">Adicionar Rapidamente por Papel</h3>
              <div className="flex flex-wrap gap-2">
                {USER_ROLES.map(role => (
                  <Button 
                    key={role.id}
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const newUser = {
                        id: Date.now().toString(),
                        nome: "",
                        email: "",
                        papel: role.id,
                      };
                      updateFormData("usuarios", [...formData.usuarios, newUser]);
                    }}
                  >
                    <div className={`w-2 h-2 rounded-full ${role.color} mr-2`} />
                    + {role.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Puzzle className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Integrações</h2>
                    <p className="text-amber-100">Conecte sistemas externos (opcional)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Integrations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INTEGRATIONS.map((integration) => (
                <Card 
                  key={integration.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.integracoesAtivas.includes(integration.id)
                      ? "ring-2 ring-primary bg-primary/5" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => toggleIntegration(integration.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${
                        formData.integracoesAtivas.includes(integration.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}>
                        <integration.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{integration.label}</p>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                      <Checkbox 
                        checked={formData.integracoesAtivas.includes(integration.id)}
                        onCheckedChange={() => toggleIntegration(integration.id)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Dica:</strong> Você pode configurar integrações a qualquer momento após ativar o sistema.
              </p>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-8 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10 text-center">
                <div className="inline-flex p-4 bg-white/20 rounded-2xl backdrop-blur-sm mb-4">
                  <Sparkles className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Revisão Final</h2>
                <p className="text-green-100">Seu Unistays está quase pronto!</p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Building2 className="w-6 h-6 text-blue-600" />
                    <h3 className="font-semibold">Empresa</h3>
                  </div>
                  <p className="text-sm">{formData.nomeFantasia || "Não configurado"}</p>
                  <p className="text-xs text-muted-foreground">{formData.cnpj || "-"}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                    <h3 className="font-semibold">Empreendimento</h3>
                  </div>
                  <p className="text-sm">{formData.nomeEmpreendimento || "Não configurado"}</p>
                  <p className="text-xs text-muted-foreground">{formData.cidade}, {formData.estado}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50 border-orange-200 dark:border-orange-800">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Bed className="w-6 h-6 text-orange-600" />
                    <h3 className="font-semibold">Unidades</h3>
                  </div>
                  <p className="text-sm">{formData.unidades.length} unidades configuradas</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/50 border-pink-200 dark:border-pink-800">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard className="w-6 h-6 text-pink-600" />
                    <h3 className="font-semibold">Pagamentos</h3>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {formData.formasPagamento.pix && <Badge variant="secondary">PIX</Badge>}
                    {formData.formasPagamento.cartao && <Badge variant="secondary">Cartão</Badge>}
                    {formData.formasPagamento.boleto && <Badge variant="secondary">Boleto</Badge>}
                    {formData.formasPagamento.dinheiro && <Badge variant="secondary">Dinheiro</Badge>}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/50 dark:to-sky-950/50 border-cyan-200 dark:border-cyan-800">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="w-6 h-6 text-cyan-600" />
                    <h3 className="font-semibold">E-mail</h3>
                  </div>
                  <p className="text-sm">
                    {formData.metodoEmail === "api" && "API de Envio"}
                    {formData.metodoEmail === "smtp" && "Servidor SMTP"}
                    {formData.metodoEmail === "unistays" && "Serviço Unistays"}
                    {!formData.metodoEmail && "Não configurado"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50 border-violet-200 dark:border-violet-800">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-6 h-6 text-violet-600" />
                    <h3 className="font-semibold">Usuários</h3>
                  </div>
                  <p className="text-sm">{formData.usuarios.length} usuários configurados</p>
                </CardContent>
              </Card>
            </div>

            {/* Activation */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-700 text-center">
              <PartyPopper className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Tudo pronto!</h3>
              <p className="text-muted-foreground mb-6">
                Clique no botão abaixo para ativar seu Unistays e começar a operar.
              </p>
              <Button 
                size="lg" 
                className="h-14 px-10 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                onClick={handleActivate}
                disabled={isInstalling}
              >
                {isInstalling ? (
                  <>
                    <div className="w-6 h-6 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Instalando...
                  </>
                ) : (
                  <>
                    <Rocket className="w-6 h-6 mr-2" />
                    Ativar Unistays
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container max-w-5xl mx-auto py-8 px-4">
        {/* Logo & Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2 bg-primary rounded-xl">
              <Layers className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Uni | Stays</h1>
              <p className="text-sm text-muted-foreground">Assistente de Configuração</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-muted-foreground">Etapa {currentStep} de {STEPS.length}</span>
              <span className="text-xs text-muted-foreground">{Math.round(progress)}% completo</span>
            </div>
          </div>

          {/* Steps Indicator */}
          <div className="hidden md:flex items-center justify-between overflow-x-auto pb-2">
            {STEPS.map((step, index) => (
              <div 
                key={step.id}
                className={`flex flex-col items-center cursor-pointer transition-all ${
                  currentStep === step.id 
                    ? "opacity-100" 
                    : currentStep > step.id 
                      ? "opacity-70" 
                      : "opacity-40"
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-colors ${
                  currentStep === step.id 
                    ? "bg-primary text-primary-foreground" 
                    : currentStep > step.id 
                      ? "bg-green-500 text-white"
                      : "bg-muted"
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs font-medium text-center hidden lg:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="border-2 shadow-xl">
          <CardContent className="p-6 md:p-8">
            <ScrollArea className="h-[calc(100vh-380px)] min-h-[400px] pr-4">
              {renderStepContent()}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="h-12"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Anterior
          </Button>

          <div className="flex gap-3">
            {currentStep < 10 && currentStep > 2 && (
              <Button
                variant="ghost"
                onClick={skipStep}
                className="h-12"
              >
                Pular Etapa
              </Button>
            )}
            {currentStep < 10 && (
              <Button
                onClick={nextStep}
                className="h-12 px-6"
              >
                Próximo
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
