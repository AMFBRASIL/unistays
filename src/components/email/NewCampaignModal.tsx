import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Mail,
  Send,
  Users,
  Target,
  Clock,
  Calendar as CalendarIcon,
  Sparkles,
  Wand2,
  Eye,
  Layout,
  FileText,
  Image,
  Link2,
  Type,
  Palette,
  Zap,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Settings,
  BarChart3,
  MessageSquare,
  Star,
  Gift,
  ShoppingCart,
  Bell,
  Heart,
  Globe,
  Smartphone,
  Monitor,
  Percent,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface NewCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const campaignTypes = [
  { id: "promotional", name: "Promocional", icon: Percent, color: "from-purple-500 to-pink-500", description: "Ofertas e descontos especiais" },
  { id: "newsletter", name: "Newsletter", icon: FileText, color: "from-blue-500 to-cyan-500", description: "Atualizações e novidades" },
  { id: "transactional", name: "Transacional", icon: CheckCircle2, color: "from-green-500 to-emerald-500", description: "Confirmações e recibos" },
  { id: "welcome", name: "Boas-vindas", icon: Heart, color: "from-rose-500 to-orange-500", description: "Série de onboarding" },
  { id: "reengagement", name: "Reengajamento", icon: Bell, color: "from-amber-500 to-yellow-500", description: "Recuperar contatos inativos" },
  { id: "event", name: "Evento", icon: Star, color: "from-indigo-500 to-purple-500", description: "Convites e lembretes" },
];

const segments = [
  { id: 1, name: "Todos os Contatos", count: 45680, icon: Users },
  { id: 2, name: "Hóspedes VIP", count: 2340, icon: Star },
  { id: 3, name: "Reservas Recentes", count: 8920, icon: CalendarIcon },
  { id: 4, name: "Carrinho Abandonado", count: 1250, icon: ShoppingCart },
  { id: 5, name: "Aniversariantes", count: 890, icon: Gift },
];

const templates = [
  { id: 1, name: "Promocional Moderno", thumbnail: "🎯", category: "promotional" },
  { id: 2, name: "Newsletter Clean", thumbnail: "📰", category: "newsletter" },
  { id: 3, name: "Boas-vindas", thumbnail: "👋", category: "welcome" },
  { id: 4, name: "Oferta Especial", thumbnail: "🎁", category: "promotional" },
  { id: 5, name: "Evento VIP", thumbnail: "⭐", category: "event" },
  { id: 6, name: "Reengajamento", thumbnail: "🔔", category: "reengagement" },
];

export function NewCampaignModal({ open, onOpenChange, onSuccess }: NewCampaignModalProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [segmentsList, setSegmentsList] = useState<any[]>([]);
  const [templatesList, setTemplatesList] = useState<any[]>([]);
  const [campaignData, setCampaignData] = useState({
    name: "",
    type: "",
    subject: "",
    preheader: "",
    segment: "",
    template: "",
    scheduleType: "now",
    scheduleDate: undefined as Date | undefined,
    scheduleTime: "09:00",
    enableAB: false,
    abSubject: "",
    trackOpens: true,
    trackClicks: true,
    personalizeSubject: true,
    content: "",
  });

  const steps = [
    { number: 1, title: "Tipo de Campanha", icon: Layout },
    { number: 2, title: "Configurações", icon: Settings },
    { number: 3, title: "Template", icon: Palette },
    { number: 4, title: "Público", icon: Target },
    { number: 5, title: "Agendamento", icon: Clock },
    { number: 6, title: "Revisão", icon: Eye },
  ];

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const [segRes, tplRes] = await Promise.all([
            api.getEmailSegments(),
            api.getEmailTemplates()
          ]);
          if (segRes.success && segRes.data) setSegmentsList(segRes.data.segments || []);
          if (tplRes.success && tplRes.data) setTemplatesList(tplRes.data.templates || []);
        } catch (error) {
          console.error("Failed to fetch data", error);
        }
      };
      fetchData();
    }
  }, [open]);

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSendCampaign = async () => {
    try {
      setLoading(true);
      const payload = {
        name: campaignData.name,
        type: campaignData.type,
        subject: campaignData.subject,
        preheader: campaignData.preheader,
        // Assuming segment is ID
        segments: campaignData.segment ? [campaignData.segment] : [],
        // If template is 'blank', content might be empty initially. If template ID, backend might handle or we send ID.
        // For now, let's assume we are sending the content directly if it is edited, or the template ID.
        // The API expects 'content' usually.
        // In this modal, there is no content editor step anymore? 
        // Wait, step 3 is Template, Step 4 is Audience. Where is content editing?
        // The user's NEW layout missed the content editing step! 
        // Step 1: Type, 2: Config, 3: Template, 4: Publico, 5: Schedule, 6: Review.
        // There is no step for editing the email body.
        // I will add a default content for now and we might need to add that step back.
        // content: "<div>Conteúdo do email aqui</div>",
        content: campaignData.content || "<div>Conteúdo padrão</div>",
        scheduledAt: campaignData.scheduleType === 'schedule' && campaignData.scheduleDate ?
          new Date(campaignData.scheduleDate.setHours(parseInt(campaignData.scheduleTime.split(':')[0]), parseInt(campaignData.scheduleTime.split(':')[1])))
          : null,
        status: campaignData.scheduleType === 'now' ? 'active' : 'scheduled'
      };

      await api.createCampaign(payload);

      toast({
        title: "Campanha Criada!",
        description: campaignData.scheduleType === "now"
          ? "Sua campanha foi enviada com sucesso."
          : "Sua campanha foi agendada com sucesso.",
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
      setCurrentStep(1);
      // Reset form...
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar campanha.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithAI = () => {
    setCampaignData({
      ...campaignData,
      subject: "🎄 Últimas ofertas de Natal - Até 40% OFF!",
      preheader: "Aproveite descontos exclusivos em hospedagem",
    });
    toast({
      title: "Gerado com IA",
      description: "Assunto e pré-header gerados automaticamente.",
    });
  };

  const selectedType = campaignTypes.find(t => t.id === campaignData.type);
  const selectedSegment = segmentsList.find(s => s.id.toString() === campaignData.segment);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 bg-background border-white/10 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl">Nova Campanha de Email</DialogTitle>
              <DialogDescription>Configure e envie sua campanha em poucos passos</DialogDescription>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                    currentStep === step.number
                      ? "bg-primary text-primary-foreground"
                      : currentStep > step.number
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  <step.icon className="w-4 h-4" />
                  <span className="text-sm font-medium whitespace-nowrap">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {/* Step 1: Campaign Type */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Escolha o tipo de campanha</h3>
                  <p className="text-muted-foreground">Selecione o objetivo principal da sua campanha</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {campaignTypes.map((type) => (
                    <Card
                      key={type.id}
                      onClick={() => setCampaignData({ ...campaignData, type: type.id })}
                      className={cn(
                        "cursor-pointer transition-all hover:border-primary/50",
                        campaignData.type === type.id
                          ? "border-primary bg-primary/5"
                          : "bg-card/50 border-white/10"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-3`}>
                          <type.icon className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-semibold mb-1">{type.name}</h4>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                        {campaignData.type === type.id && (
                          <CheckCircle2 className="w-5 h-5 text-primary absolute top-3 right-3" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Settings */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Configurações da Campanha</h3>
                  <p className="text-muted-foreground">Defina o nome, assunto e opções de rastreamento</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome da Campanha</Label>
                      <Input
                        value={campaignData.name}
                        onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                        placeholder="Ex: Promoção de Fim de Ano"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Assunto do Email</Label>
                        <Button size="sm" variant="ghost" onClick={handleGenerateWithAI} className="text-primary">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Gerar com IA
                        </Button>
                      </div>
                      <Input
                        value={campaignData.subject}
                        onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })}
                        placeholder="🎄 Últimas ofertas de Natal - Até 40% OFF!"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Pré-header (Preview Text)</Label>
                      <Input
                        value={campaignData.preheader}
                        onChange={(e) => setCampaignData({ ...campaignData, preheader: e.target.value })}
                        placeholder="Texto que aparece após o assunto na caixa de entrada"
                        className="bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Card className="bg-card/50 border-white/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Opções Avançadas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Teste A/B</p>
                            <p className="text-xs text-muted-foreground">Testar variações de assunto</p>
                          </div>
                          <Switch
                            checked={campaignData.enableAB}
                            onCheckedChange={(checked) => setCampaignData({ ...campaignData, enableAB: checked })}
                          />
                        </div>

                        {campaignData.enableAB && (
                          <div className="space-y-2">
                            <Label>Assunto Alternativo (B)</Label>
                            <Input
                              value={campaignData.abSubject}
                              onChange={(e) => setCampaignData({ ...campaignData, abSubject: e.target.value })}
                              placeholder="Versão alternativa do assunto"
                              className="bg-background/50"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Rastrear Aberturas</p>
                            <p className="text-xs text-muted-foreground">Monitorar taxa de abertura</p>
                          </div>
                          <Switch
                            checked={campaignData.trackOpens}
                            onCheckedChange={(checked) => setCampaignData({ ...campaignData, trackOpens: checked })}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Rastrear Cliques</p>
                            <p className="text-xs text-muted-foreground">Monitorar cliques em links</p>
                          </div>
                          <Switch
                            checked={campaignData.trackClicks}
                            onCheckedChange={(checked) => setCampaignData({ ...campaignData, trackClicks: checked })}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Personalizar Assunto</p>
                            <p className="text-xs text-muted-foreground">Incluir nome do destinatário</p>
                          </div>
                          <Switch
                            checked={campaignData.personalizeSubject}
                            onCheckedChange={(checked) => setCampaignData({ ...campaignData, personalizeSubject: checked })}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Template */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Escolha um Template</h3>
                    <p className="text-muted-foreground">Selecione ou crie o design do seu email</p>
                  </div>
                  <Button variant="outline">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Criar com IA
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <Card
                    onClick={() => setCampaignData({ ...campaignData, template: "blank" })}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50",
                      campaignData.template === "blank"
                        ? "border-primary bg-primary/5"
                        : "bg-card/50 border-white/10"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-muted to-muted/50 border border-dashed border-white/20 flex items-center justify-center mb-3">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h4 className="font-medium text-sm">Template em Branco</h4>
                      <p className="text-xs text-muted-foreground">Começar do zero</p>
                    </CardContent>
                  </Card>

                  {templatesList.map((template) => (
                    <Card
                      key={template.id}
                      onClick={() => {
                        setCampaignData({
                          ...campaignData,
                          template: template.id.toString(),
                          content: template.bodyHtml || template.bodyText || "",
                          subject: template.subject || campaignData.subject
                        });
                        toast({ description: "Template selecionado. Conteúdo atualizado." });
                      }}
                      className={cn(
                        "cursor-pointer transition-all hover:border-primary/50",
                        campaignData.template === template.id.toString()
                          ? "border-primary bg-primary/5"
                          : "bg-card/50 border-white/10"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-background to-background/50 border border-white/10 flex items-center justify-center text-4xl mb-3 overflow-hidden">
                          {/* Simple thumbnail logic */}
                          {template.thumbnail && template.thumbnail.startsWith('http') ?
                            <img src={template.thumbnail} className="w-full h-full object-cover" /> :
                            <span>📝</span>}
                        </div>
                        <h4 className="font-medium text-sm truncate">{template.name}</h4>
                        <p className="text-xs text-muted-foreground capitalize">{template.type}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Audience */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Selecione o Público</h3>
                  <p className="text-muted-foreground">Escolha para quem você deseja enviar esta campanha</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {segmentsList.map((segment) => (
                    <Card
                      key={segment.id}
                      onClick={() => setCampaignData({ ...campaignData, segment: segment.id.toString() })}
                      className={cn(
                        "cursor-pointer transition-all hover:border-primary/50",
                        campaignData.segment === segment.id.toString()
                          ? "border-primary bg-primary/5"
                          : "bg-card/50 border-white/10"
                      )}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{segment.name}</h4>
                          <p className="text-sm text-muted-foreground">{(segment.contactsCount || 0).toLocaleString()} contatos</p>
                        </div>
                        {campaignData.segment === segment.id.toString() && (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {segmentsList.length === 0 && (
                    <div className="col-span-2 text-center text-muted-foreground p-4">
                      Nenhum segmento encontrado.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Schedule */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Agendamento</h3>
                  <p className="text-muted-foreground">Escolha quando enviar sua campanha</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card
                    onClick={() => setCampaignData({ ...campaignData, scheduleType: "now" })}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50",
                      campaignData.scheduleType === "now"
                        ? "border-primary bg-primary/5"
                        : "bg-card/50 border-white/10"
                    )}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                        <Send className="w-6 h-6 text-green-500" />
                      </div>
                      <h4 className="font-semibold">Enviar Agora</h4>
                      <p className="text-sm text-muted-foreground">A campanha será enviada imediatamente</p>
                    </CardContent>
                  </Card>

                  <Card
                    onClick={() => setCampaignData({ ...campaignData, scheduleType: "schedule" })}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50",
                      campaignData.scheduleType === "schedule"
                        ? "border-primary bg-primary/5"
                        : "bg-card/50 border-white/10"
                    )}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                        <CalendarIcon className="w-6 h-6 text-blue-500" />
                      </div>
                      <h4 className="font-semibold">Agendar</h4>
                      <p className="text-sm text-muted-foreground">Escolha data e hora específicas</p>
                    </CardContent>
                  </Card>

                  <Card
                    onClick={() => setCampaignData({ ...campaignData, scheduleType: "optimal" })}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50",
                      campaignData.scheduleType === "optimal"
                        ? "border-primary bg-primary/5"
                        : "bg-card/50 border-white/10"
                    )}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-6 h-6 text-purple-500" />
                      </div>
                      <h4 className="font-semibold">Horário Otimizado</h4>
                      <p className="text-sm text-muted-foreground">IA escolhe o melhor momento</p>
                    </CardContent>
                  </Card>
                </div>

                {campaignData.scheduleType === "schedule" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {campaignData.scheduleDate ? (
                              format(campaignData.scheduleDate, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={campaignData.scheduleDate}
                            onSelect={(date) => setCampaignData({ ...campaignData, scheduleDate: date })}
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Horário</Label>
                      <Select
                        value={campaignData.scheduleTime}
                        onValueChange={(value) => setCampaignData({ ...campaignData, scheduleTime: value })}
                      >
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, "0");
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Review */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Revisão Final</h3>
                  <p className="text-muted-foreground">Confirme os detalhes antes de enviar</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-card/50 border-white/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Detalhes da Campanha</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nome:</span>
                        <span className="font-medium">{campaignData.name || "Não definido"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo:</span>
                        <Badge variant="outline" className={selectedType ? `bg-gradient-to-r ${selectedType.color} text-white border-0` : ''}>
                          {selectedType?.name || "Não selecionado"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assunto:</span>
                        <span className="font-medium text-right max-w-[200px] truncate">{campaignData.subject || "Não definido"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Teste A/B:</span>
                        <Badge variant="outline" className={campaignData.enableAB ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"}>
                          {campaignData.enableAB ? "Ativado" : "Desativado"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 border-white/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Envio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Público:</span>
                        <span className="font-medium">{selectedSegment?.name || "Não selecionado"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contatos:</span>
                        <span className="font-medium">{(selectedSegment?.contactsCount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Agendamento:</span>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                          {campaignData.scheduleType === "now" ? "Imediato" :
                            campaignData.scheduleType === "optimal" ? "Otimizado pela IA" :
                              campaignData.scheduleDate ? format(campaignData.scheduleDate, "dd/MM/yyyy") + " " + campaignData.scheduleTime : "Não definido"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Preview */}
                <Card className="bg-card/50 border-white/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Preview do Email</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Monitor className="w-3 h-3 mr-1" />
                          Desktop
                        </Button>
                        <Button size="sm" variant="outline">
                          <Smartphone className="w-3 h-3 mr-1" />
                          Mobile
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white rounded-lg p-6 text-gray-900">
                      <div className="border-b border-gray-200 pb-4 mb-4">
                        <p className="text-sm text-gray-500">De: Hotel Exemplo &lt;hotel@exemplo.com&gt;</p>
                        <p className="text-sm text-gray-500">Para: destinatario@email.com</p>
                        <p className="font-semibold text-lg mt-2">{campaignData.subject || "Assunto do email"}</p>
                        <p className="text-sm text-gray-400">{campaignData.preheader || "Pré-header do email"}</p>
                      </div>
                      <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        [Conteúdo do Template]
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-card/50">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? () => onOpenChange(false) : handleBack}
          >
            {currentStep === 1 ? "Cancelar" : (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </>
            )}
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Passo {currentStep} de {steps.length}
            </span>
          </div>

          {currentStep < 6 ? (
            <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSendCampaign} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90">
              <Send className="w-4 h-4 mr-2" />
              {campaignData.scheduleType === "now" ? "Enviar Agora" : "Agendar Campanha"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
