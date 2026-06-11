import { useState } from "react";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AIChatModal } from "./AIChatModal";

interface Insight {
  id: string;
  type: "opportunity" | "alert" | "tip";
  title: string;
  description: string;
  action?: string;
}

const insights: Insight[] = [
  {
    id: "1",
    type: "opportunity",
    title: "Aumente o RevPAR em 12%",
    description: "Baseado na demanda histórica, sugerimos aumentar as tarifas em 15% para o próximo final de semana.",
    action: "Aplicar sugestão",
  },
  {
    id: "2",
    type: "alert",
    title: "3 quartos sem reserva há 5 dias",
    description: "Os quartos 102, 204 e 311 estão disponíveis. Considere promoções direcionadas.",
    action: "Criar promoção",
  },
  {
    id: "3",
    type: "tip",
    title: "Otimize o check-in digital",
    description: "68% dos hóspedes preferem check-in online. Ative lembretes automáticos 24h antes.",
    action: "Configurar",
  },
];

const typeConfig = {
  opportunity: {
    icon: TrendingUp,
    iconColor: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/20",
  },
  alert: {
    icon: AlertTriangle,
    iconColor: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
  },
  tip: {
    icon: Lightbulb,
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
};

export function AIInsights() {
  const [showChatModal, setShowChatModal] = useState(false);

  return (
    <>
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="p-3 sm:p-6 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-transparent">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-primary flex items-center justify-center animate-pulse-slow">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-semibold text-foreground">Insights IA</h3>
            <p className="text-[10px] sm:text-sm text-muted-foreground">Recomendações inteligentes em tempo real</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {insights.map((insight) => {
          const config = typeConfig[insight.type];
          const Icon = config.icon;
          
          return (
            <div
              key={insight.id}
              className={cn(
                "p-2.5 sm:p-4 hover:bg-muted/30 transition-colors group",
                config.bgColor.replace("/10", "/5")
              )}
            >
              <div className="flex items-start gap-2 sm:gap-4">
                <div className={cn("p-1.5 sm:p-2 rounded-lg shrink-0", config.bgColor)}>
                  <Icon className={cn("w-3 h-3 sm:w-4 sm:h-4", config.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-xs sm:text-sm mb-0.5 sm:mb-1">{insight.title}</h4>
                  <p className="text-[10px] sm:text-sm text-muted-foreground line-clamp-2">{insight.description}</p>
                  {insight.action && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 sm:mt-2 -ml-2 text-primary hover:text-primary h-6 sm:h-8 text-[10px] sm:text-sm"
                    >
                      {insight.action}
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5 sm:ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-2.5 sm:p-4 bg-muted/30 border-t border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-[10px] sm:text-sm text-muted-foreground">
            Pergunte à IA: "Como foi meu faturamento hoje?"
          </span>
          <Button variant="outline" size="sm" className="gap-1 sm:gap-2 h-7 sm:h-8 text-[10px] sm:text-sm w-full sm:w-auto" onClick={() => setShowChatModal(true)}>
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Abrir Chat
          </Button>
        </div>
      </div>
    </div>

    <AIChatModal open={showChatModal} onOpenChange={setShowChatModal} />
    </>
  );
}
