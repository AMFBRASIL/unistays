import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Zap, 
  ArrowUp, 
  ArrowDown,
  Sparkles,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Music,
  Plane
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DemandForecastModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const upcomingEvents = [
  {
    id: 1,
    name: "Show Coldplay - Allianz Parque",
    date: "2024-03-15",
    impact: "alto",
    expectedIncrease: 45,
    suggestedPrice: 589,
    currentPrice: 450,
    type: "show"
  },
  {
    id: 2,
    name: "Feriado Páscoa",
    date: "2024-03-29",
    impact: "médio",
    expectedIncrease: 25,
    suggestedPrice: 520,
    currentPrice: 450,
    type: "feriado"
  },
  {
    id: 3,
    name: "Congresso ABRASEL",
    date: "2024-04-05",
    impact: "alto",
    expectedIncrease: 35,
    suggestedPrice: 560,
    currentPrice: 450,
    type: "evento"
  },
  {
    id: 4,
    name: "Final Libertadores",
    date: "2024-04-20",
    impact: "muito alto",
    expectedIncrease: 80,
    suggestedPrice: 750,
    currentPrice: 450,
    type: "esporte"
  }
];

const priceSuggestions = [
  { date: "15/03", day: "Sex", base: 450, suggested: 589, reason: "Show Coldplay" },
  { date: "16/03", day: "Sáb", base: 450, suggested: 520, reason: "Pós-evento" },
  { date: "29/03", day: "Sex", base: 450, suggested: 520, reason: "Véspera Páscoa" },
  { date: "30/03", day: "Sáb", base: 450, suggested: 490, reason: "Sábado de Aleluia" },
  { date: "05/04", day: "Sex", base: 450, suggested: 560, reason: "Congresso ABRASEL" },
  { date: "06/04", day: "Sáb", base: 450, suggested: 540, reason: "Congresso ABRASEL" },
];

export default function DemandForecastModal({ open, onOpenChange }: DemandForecastModalProps) {
  const { toast } = useToast();
  const [autoAdjust, setAutoAdjust] = useState(false);

  const handleApplyAll = () => {
    toast({
      title: "Tarifas Atualizadas",
      description: "Todas as sugestões de preço foram aplicadas.",
    });
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "muito alto": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "alto": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "médio": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "show": return Music;
      case "feriado": return Calendar;
      case "evento": return Target;
      case "esporte": return Zap;
      default: return MapPin;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 bg-slate-900 border-white/10">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl text-white">Previsão de Demanda com IA</DialogTitle>
              <p className="text-sm text-slate-400">Sugestões de preços baseadas em eventos locais e feriados</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Calendar className="h-4 w-4" />
                    Eventos Próximos
                  </div>
                  <p className="text-2xl font-bold text-white">{upcomingEvents.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <DollarSign className="h-4 w-4" />
                    Receita Potencial
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">+32%</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Target className="h-4 w-4" />
                    Precisão IA
                  </div>
                  <p className="text-2xl font-bold text-blue-400">94%</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Sparkles className="h-4 w-4" />
                    Sugestões
                  </div>
                  <p className="text-2xl font-bold text-purple-400">{priceSuggestions.length}</p>
                </CardContent>
              </Card>
            </div>

            {/* Auto-adjust Toggle */}
            <Card className="bg-slate-800/50 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${autoAdjust ? 'bg-purple-500 animate-pulse' : 'bg-slate-500'}`} />
                    <div>
                      <p className="font-medium text-white">Ajuste Automático de Preços</p>
                      <p className="text-sm text-slate-400">IA ajusta tarifas automaticamente baseado em demanda</p>
                    </div>
                  </div>
                  <Switch checked={autoAdjust} onCheckedChange={setAutoAdjust} />
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="bg-slate-800/50 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  Eventos que Impactam a Demanda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map((event) => {
                  const Icon = getEventIcon(event.type);
                  return (
                    <div key={event.id} className="p-4 bg-slate-700/30 rounded-lg border border-white/5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{event.name}</p>
                            <p className="text-sm text-slate-400">{event.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getImpactColor(event.impact)}>
                            Impacto {event.impact}
                          </Badge>
                          <div className="flex items-center gap-1 mt-2 text-emerald-400">
                            <ArrowUp className="h-4 w-4" />
                            <span className="text-sm font-medium">+{event.expectedIncrease}% demanda</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex gap-6">
                          <div>
                            <p className="text-xs text-slate-400">Tarifa Atual</p>
                            <p className="text-lg font-semibold text-slate-300">R$ {event.currentPrice}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Sugestão IA</p>
                            <p className="text-lg font-semibold text-emerald-400">R$ {event.suggestedPrice}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Diferença</p>
                            <p className="text-lg font-semibold text-purple-400">
                              +{Math.round(((event.suggestedPrice - event.currentPrice) / event.currentPrice) * 100)}%
                            </p>
                          </div>
                        </div>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Price Suggestions Table */}
            <Card className="bg-slate-800/50 border-white/10">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                  Sugestões de Tarifa (Próximos 30 dias)
                </CardTitle>
                <Button onClick={handleApplyAll} className="bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Aplicar Todas
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Data</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Dia</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Base</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Sugerido</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Motivo</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {priceSuggestions.map((row, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-slate-700/20">
                          <td className="py-3 px-4 text-white">{row.date}</td>
                          <td className="py-3 px-4 text-slate-400">{row.day}</td>
                          <td className="py-3 px-4 text-right text-slate-300">R$ {row.base}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-emerald-400 font-medium">R$ {row.suggested}</span>
                            <span className="text-xs text-emerald-400/60 ml-1">
                              (+{Math.round(((row.suggested - row.base) / row.base) * 100)}%)
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs">
                              {row.reason}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
                              Aplicar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
