import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Target,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Brain,
  BarChart3,
  MessageSquare,
  Gift,
  Bell,
  RefreshCw,
  Star,
  AlertTriangle,
  ChevronRight,
  Percent,
  Bed,
  Coffee,
  Utensils,
  Car,
  Wifi,
} from "lucide-react";

interface AISuggestionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Suggestion {
  id: string;
  type: "pricing" | "occupancy" | "upsell" | "marketing" | "operations" | "guest";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  confidence: number;
  potentialRevenue?: number;
  timeframe?: string;
  actions: string[];
  applied?: boolean;
}

const mockSuggestions: Suggestion[] = [
  {
    id: "1",
    type: "pricing",
    priority: "high",
    title: "Aumentar tarifas para o Réveillon",
    description: "Análise de demanda indica alta procura para 28/12 a 02/01. Concorrentes já ajustaram preços em +45%.",
    impact: "+R$ 12.500 receita estimada",
    confidence: 94,
    potentialRevenue: 12500,
    timeframe: "Próximos 14 dias",
    actions: ["Aplicar aumento de 40%", "Ajustar mínimo de noites para 3", "Ativar política de cancelamento restrita"],
  },
  {
    id: "2",
    type: "occupancy",
    priority: "high",
    title: "Preencher lacunas de ocupação",
    description: "Identificamos 12 quartos com gaps de 2-3 dias entre reservas. Promoção relâmpago pode preencher.",
    impact: "+8% ocupação semanal",
    confidence: 87,
    potentialRevenue: 4800,
    timeframe: "Esta semana",
    actions: ["Criar promoção last-minute", "Ativar desconto 15% para estadias curtas", "Notificar hóspedes frequentes"],
  },
  {
    id: "3",
    type: "upsell",
    priority: "medium",
    title: "Oferecer upgrade para suítes",
    description: "18 hóspedes com check-in hoje são elegíveis para upgrade. Histórico mostra 40% de aceitação.",
    impact: "+R$ 2.160 hoje",
    confidence: 78,
    potentialRevenue: 2160,
    timeframe: "Hoje",
    actions: ["Enviar oferta de upgrade", "Configurar desconto de 25%", "Preparar suítes prioritárias"],
  },
  {
    id: "4",
    type: "marketing",
    priority: "medium",
    title: "Campanha de reengajamento",
    description: "234 hóspedes não retornaram nos últimos 6 meses. Taxa de conversão histórica: 12%.",
    impact: "+28 reservas potenciais",
    confidence: 72,
    potentialRevenue: 8400,
    timeframe: "Próximo mês",
    actions: ["Disparar email marketing", "Oferecer cupom exclusivo", "Ativar remarketing"],
  },
  {
    id: "5",
    type: "operations",
    priority: "low",
    title: "Otimizar escala de governança",
    description: "Análise de check-outs indica concentração às 10h. Redistribuir equipe pode reduzir tempo de limpeza.",
    impact: "-25 min tempo médio",
    confidence: 85,
    timeframe: "Imediato",
    actions: ["Ajustar horários de entrada", "Realocar 2 funcionários", "Priorizar quartos VIP"],
  },
  {
    id: "6",
    type: "guest",
    priority: "medium",
    title: "Melhorar NPS de hóspedes corporativos",
    description: "Segmento corporativo com NPS 45 (abaixo da média 72). Principais reclamações: Wi-Fi e café da manhã.",
    impact: "+27 pontos NPS estimado",
    confidence: 68,
    actions: ["Upgrade de Wi-Fi para premium", "Café expresso no quarto", "Área de coworking dedicada"],
  },
];

const typeConfig = {
  pricing: { icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/20", label: "Precificação" },
  occupancy: { icon: Bed, color: "text-blue-400", bg: "bg-blue-500/20", label: "Ocupação" },
  upsell: { icon: Gift, color: "text-purple-400", bg: "bg-purple-500/20", label: "Upsell" },
  marketing: { icon: MessageSquare, color: "text-pink-400", bg: "bg-pink-500/20", label: "Marketing" },
  operations: { icon: Zap, color: "text-amber-400", bg: "bg-amber-500/20", label: "Operações" },
  guest: { icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/20", label: "Hóspedes" },
};

const priorityConfig = {
  high: { color: "bg-red-500/20 text-red-400", label: "Alta Prioridade" },
  medium: { color: "bg-amber-500/20 text-amber-400", label: "Média" },
  low: { color: "bg-slate-500/20 text-slate-400", label: "Baixa" },
};

export default function AISuggestionsModal({ open, onOpenChange }: AISuggestionsModalProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoApply, setAutoApply] = useState(false);

  const filteredSuggestions = activeTab === "all" 
    ? suggestions 
    : suggestions.filter(s => s.type === activeTab);

  const totalPotentialRevenue = suggestions
    .filter(s => !s.applied && s.potentialRevenue)
    .reduce((sum, s) => sum + (s.potentialRevenue || 0), 0);

  const highPrioritySuggestions = suggestions.filter(s => s.priority === "high" && !s.applied).length;

  const handleApplySuggestion = (id: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, applied: true } : s
    ));
    const suggestion = suggestions.find(s => s.id === id);
    toast.success(`Sugestão "${suggestion?.title}" aplicada com sucesso!`, {
      description: "As alterações foram implementadas automaticamente.",
    });
  };

  const handleDismissSuggestion = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
    toast.info("Sugestão descartada", {
      description: "A IA aprenderá com sua decisão.",
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Sugestões atualizadas!", {
        description: "Análise concluída com base nos dados mais recentes.",
      });
    }, 2000);
  };

  const handleApplyAll = () => {
    const unapplied = suggestions.filter(s => !s.applied && s.priority === "high");
    setSuggestions(prev => prev.map(s => 
      s.priority === "high" ? { ...s, applied: true } : s
    ));
    toast.success(`${unapplied.length} sugestões de alta prioridade aplicadas!`, {
      description: `Receita potencial: R$ ${totalPotentialRevenue.toLocaleString('pt-BR')}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 bg-gradient-to-br from-background via-background to-violet-950/20 border-violet-500/20">
        {/* Header with gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-pink-600/20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
          
          <DialogHeader className="relative p-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                    Sugestões Inteligentes
                  </DialogTitle>
                  <p className="text-muted-foreground mt-1">
                    IA analisou seus dados e encontrou {suggestions.filter(s => !s.applied).length} oportunidades
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="border-violet-500/30 hover:bg-violet-500/10"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-400">
                        R$ {totalPotentialRevenue.toLocaleString('pt-BR')}
                      </p>
                      <p className="text-xs text-muted-foreground">Receita Potencial</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-400">{highPrioritySuggestions}</p>
                      <p className="text-xs text-muted-foreground">Alta Prioridade</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-violet-500/20">
                        <Zap className="h-5 w-5 text-violet-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Auto-aplicar</p>
                        <p className="text-xs text-muted-foreground">Sugestões de alta confiança</p>
                      </div>
                    </div>
                    <Switch checked={autoApply} onCheckedChange={setAutoApply} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogHeader>
        </div>

        {/* Tabs and content */}
        <div className="px-6 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-background/50 border border-border/50">
                <TabsTrigger value="all" className="data-[state=active]:bg-violet-500/20">
                  Todas
                </TabsTrigger>
                <TabsTrigger value="pricing" className="data-[state=active]:bg-emerald-500/20">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Preços
                </TabsTrigger>
                <TabsTrigger value="occupancy" className="data-[state=active]:bg-blue-500/20">
                  <Bed className="h-4 w-4 mr-1" />
                  Ocupação
                </TabsTrigger>
                <TabsTrigger value="upsell" className="data-[state=active]:bg-purple-500/20">
                  <Gift className="h-4 w-4 mr-1" />
                  Upsell
                </TabsTrigger>
                <TabsTrigger value="marketing" className="data-[state=active]:bg-pink-500/20">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Marketing
                </TabsTrigger>
              </TabsList>

              {highPrioritySuggestions > 0 && (
                <Button 
                  onClick={handleApplyAll}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Aplicar Todas ({highPrioritySuggestions})
                </Button>
              )}
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {filteredSuggestions.map((suggestion) => {
                  const config = typeConfig[suggestion.type];
                  const priority = priorityConfig[suggestion.priority];
                  const Icon = config.icon;

                  return (
                    <Card 
                      key={suggestion.id} 
                      className={`relative overflow-hidden transition-all hover:border-violet-500/30 ${
                        suggestion.applied ? 'opacity-60 bg-emerald-500/5 border-emerald-500/20' : 'bg-card/50'
                      }`}
                    >
                      {suggestion.applied && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-emerald-500/20 text-emerald-400">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Aplicado
                          </Badge>
                        </div>
                      )}
                      
                      <CardContent className="p-5">
                        <div className="flex gap-4">
                          {/* Icon */}
                          <div className={`p-3 rounded-xl ${config.bg} shrink-0`}>
                            <Icon className={`h-6 w-6 ${config.color}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className={config.bg}>
                                    {config.label}
                                  </Badge>
                                  <Badge className={priority.color}>
                                    {priority.label}
                                  </Badge>
                                  {suggestion.timeframe && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {suggestion.timeframe}
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-semibold text-foreground">{suggestion.title}</h4>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-3">
                              {suggestion.description}
                            </p>

                            {/* Impact and confidence */}
                            <div className="flex items-center gap-6 mb-3">
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-emerald-400" />
                                <span className="text-sm font-medium text-emerald-400">{suggestion.impact}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Confiança:</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={suggestion.confidence} className="w-20 h-2" />
                                  <span className="text-xs font-medium text-foreground">{suggestion.confidence}%</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {suggestion.actions.map((action, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-background/50">
                                  <ChevronRight className="h-3 w-3 mr-1" />
                                  {action}
                                </Badge>
                              ))}
                            </div>

                            {/* Buttons */}
                            {!suggestion.applied && (
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm"
                                  onClick={() => handleApplySuggestion(suggestion.id)}
                                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                                >
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Aplicar Sugestão
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleDismissSuggestion(suggestion.id)}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <ThumbsDown className="h-3 w-3 mr-1" />
                                  Descartar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <ArrowRight className="h-3 w-3 mr-1" />
                                  Ver Detalhes
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {filteredSuggestions.length === 0 && (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-full bg-violet-500/10 w-fit mx-auto mb-4">
                      <Lightbulb className="h-8 w-8 text-violet-400" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Nenhuma sugestão nesta categoria</h3>
                    <p className="text-sm text-muted-foreground">
                      A IA continuará analisando seus dados e notificará quando encontrar oportunidades.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Tabs>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-amber-400" />
              <span>Sugestões baseadas em análise de 30 dias de dados</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              <Button 
                variant="outline"
                className="border-violet-500/30 hover:bg-violet-500/10"
              >
                <Bell className="h-4 w-4 mr-2" />
                Configurar Alertas
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}