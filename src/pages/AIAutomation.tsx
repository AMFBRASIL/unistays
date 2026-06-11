import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Sparkles,
  Brain,
  TrendingUp,
  MessageSquare,
  Zap,
  Target,
  BarChart3,
  Clock,
  CheckCircle2,
  ArrowRight,
  Bot,
  Lightbulb,
  DollarSign,
  Users,
  Play,
} from "lucide-react";
import GuestChatbotModal from "@/components/ai/GuestChatbotModal";
import DemandForecastModal from "@/components/ai/DemandForecastModal";
import SentimentAnalysisModal from "@/components/ai/SentimentAnalysisModal";
import AISuggestionsModal from "@/components/ai/AISuggestionsModal";

interface AIFeature {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  status: "active" | "beta" | "coming";
  enabled: boolean;
  stats?: string;
  modalType?: "chatbot" | "demand" | "sentiment";
}

const aiFeatures: AIFeature[] = [
  {
    id: "dynamic-pricing",
    icon: DollarSign,
    title: "Precificação Dinâmica",
    description: "IA ajusta preços automaticamente baseado em demanda, eventos e concorrência",
    status: "active",
    enabled: true,
    stats: "+15% receita",
  },
  {
    id: "demand-forecast",
    icon: TrendingUp,
    title: "Previsão de Demanda",
    description: "Previsão de ocupação para os próximos 90 dias com 95% de precisão",
    status: "active",
    enabled: true,
    stats: "95% precisão",
    modalType: "demand",
  },
  {
    id: "chatbot",
    icon: MessageSquare,
    title: "Chatbot Inteligente",
    description: "Atendimento 24/7 para dúvidas e reservas via WhatsApp e website",
    status: "active",
    enabled: false,
    stats: "500+ msgs/dia",
    modalType: "chatbot",
  },
  {
    id: "review-response",
    icon: Bot,
    title: "Análise de Sentimento",
    description: "Processar reviews e identificar problemas recorrentes automaticamente",
    status: "beta",
    enabled: false,
    modalType: "sentiment",
  },
  {
    id: "revenue-optimization",
    icon: Target,
    title: "Otimização de Receita",
    description: "Sugestões inteligentes para maximizar RevPAR e ADR",
    status: "active",
    enabled: true,
    stats: "+22% RevPAR",
  },
  {
    id: "guest-insights",
    icon: Users,
    title: "Insights de Hóspedes",
    description: "Análise comportamental e preferências para personalização",
    status: "beta",
    enabled: false,
  },
];

const automations = [
  { title: "Confirmação de reserva", executions: 234, status: "active" },
  { title: "Lembrete de check-in", executions: 156, status: "active" },
  { title: "Pesquisa pós-estadia", executions: 89, status: "active" },
  { title: "Cobrança pendente", executions: 45, status: "paused" },
  { title: "Aniversário do hóspede", executions: 12, status: "active" },
];

const statusBadge = {
  active: { label: "Ativo", color: "bg-emerald-500/10 text-emerald-400" },
  beta: { label: "Beta", color: "bg-violet-500/10 text-violet-400" },
  coming: { label: "Em breve", color: "bg-slate-500/10 text-slate-400" },
};

export default function AIAutomation() {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [demandOpen, setDemandOpen] = useState(false);
  const [sentimentOpen, setSentimentOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const handleFeatureClick = (modalType?: string) => {
    if (modalType === "chatbot") setChatbotOpen(true);
    if (modalType === "demand") setDemandOpen(true);
    if (modalType === "sentiment") setSentimentOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-violet-400" />
              IA & Automação
            </h1>
            <p className="text-muted-foreground mt-1">
              Recursos inteligentes para otimizar suas operações
            </p>
          </div>
          <Button 
            onClick={() => setSuggestionsOpen(true)}
            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Ver Sugestões IA
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/20">
                  <Brain className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">6</p>
                  <p className="text-xs text-muted-foreground">Recursos IA</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Zap className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">536</p>
                  <p className="text-xs text-muted-foreground">Automações/mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">48h</p>
                  <p className="text-xs text-muted-foreground">Tempo Economizado</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">+18%</p>
                  <p className="text-xs text-muted-foreground">Aumento Receita</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Features */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recursos de IA</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {aiFeatures.map((feature) => {
              const badge = statusBadge[feature.status];
              return (
                <Card key={feature.id} className="bg-card/50 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                        <feature.icon className="h-6 w-6 text-violet-400" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={badge.color}>{badge.label}</Badge>
                        <Switch checked={feature.enabled} />
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                    <div className="flex items-center justify-between">
                      {feature.stats && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">{feature.stats}</span>
                        </div>
                      )}
                      {feature.modalType && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleFeatureClick(feature.modalType)}
                          className="ml-auto"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Testar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Automations */}
        <Card className="bg-card/50 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              Automações Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {automations.map((auto, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${auto.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="font-medium text-foreground">{auto.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{auto.executions} execuções</span>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Modals */}
      <GuestChatbotModal open={chatbotOpen} onOpenChange={setChatbotOpen} />
      <DemandForecastModal open={demandOpen} onOpenChange={setDemandOpen} />
      <SentimentAnalysisModal open={sentimentOpen} onOpenChange={setSentimentOpen} />
      <AISuggestionsModal open={suggestionsOpen} onOpenChange={setSuggestionsOpen} />
    </DashboardLayout>
  );
}
