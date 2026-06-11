import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Gift, 
  Clock, 
  ArrowUp, 
  DollarSign,
  Sparkles,
  CheckCircle2,
  Calendar,
  Coffee,
  Car,
  Wifi,
  Wine,
  Utensils,
  Bed,
  Sun,
  Moon,
  Zap,
  TrendingUp,
  Target,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UpsellModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const upsellOffers = [
  {
    id: 1,
    name: "Upgrade de Quarto",
    description: "Oferecer upgrade para categoria superior",
    icon: ArrowUp,
    trigger: "check-in",
    discount: 30,
    acceptanceRate: 28,
    revenue: 4500,
    active: true
  },
  {
    id: 2,
    name: "Late Checkout",
    description: "Extensão até 14h ou 16h",
    icon: Clock,
    trigger: "véspera check-out",
    discount: 0,
    acceptanceRate: 45,
    revenue: 3200,
    active: true
  },
  {
    id: 3,
    name: "Café da Manhã Premium",
    description: "Upgrade para menu completo",
    icon: Coffee,
    trigger: "reserva confirmada",
    discount: 15,
    acceptanceRate: 35,
    revenue: 2800,
    active: true
  },
  {
    id: 4,
    name: "Early Check-in",
    description: "Entrada antecipada às 10h",
    icon: Sun,
    trigger: "véspera check-in",
    discount: 0,
    acceptanceRate: 22,
    revenue: 1500,
    active: false
  },
  {
    id: 5,
    name: "Jantar Romântico",
    description: "Experiência gastronômica especial",
    icon: Wine,
    trigger: "estadia ≥ 2 noites",
    discount: 20,
    acceptanceRate: 18,
    revenue: 980,
    active: true
  },
  {
    id: 6,
    name: "Transfer Aeroporto",
    description: "Transporte exclusivo ida e volta",
    icon: Car,
    trigger: "reserva confirmada",
    discount: 10,
    acceptanceRate: 32,
    revenue: 2100,
    active: true
  }
];

const recentUpsells = [
  { guest: "Maria Silva", offer: "Late Checkout", value: 120, status: "aceito" },
  { guest: "João Santos", offer: "Upgrade Suite", value: 250, status: "aceito" },
  { guest: "Ana Costa", offer: "Café Premium", value: 45, status: "recusado" },
  { guest: "Carlos Oliveira", offer: "Transfer", value: 180, status: "aceito" },
  { guest: "Lucia Ferreira", offer: "Jantar Romântico", value: 320, status: "pendente" }
];

export default function UpsellModal({ open, onOpenChange }: UpsellModalProps) {
  const { toast } = useToast();
  const [offers, setOffers] = useState(upsellOffers);

  const toggleOffer = (id: number) => {
    setOffers(offers.map(o => 
      o.id === id ? { ...o, active: !o.active } : o
    ));
    toast({
      title: "Oferta Atualizada",
      description: "Status da oferta alterado com sucesso.",
    });
  };

  const totalRevenue = offers.reduce((acc, o) => acc + o.revenue, 0);
  const avgAcceptance = Math.round(offers.reduce((acc, o) => acc + o.acceptanceRate, 0) / offers.length);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aceito": return "bg-emerald-500/20 text-emerald-400";
      case "recusado": return "bg-red-500/20 text-red-400";
      default: return "bg-yellow-500/20 text-yellow-400";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 bg-slate-900 border-white/10">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl text-white">Upsell Automático</DialogTitle>
              <p className="text-sm text-slate-400">Sugira upgrades, late checkout e serviços extras na hora certa</p>
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
                    <DollarSign className="h-4 w-4" />
                    Receita Mês
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">R$ {totalRevenue.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Target className="h-4 w-4" />
                    Taxa Aceitação
                  </div>
                  <p className="text-2xl font-bold text-amber-400">{avgAcceptance}%</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Zap className="h-4 w-4" />
                    Ofertas Ativas
                  </div>
                  <p className="text-2xl font-bold text-purple-400">{offers.filter(o => o.active).length}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <TrendingUp className="h-4 w-4" />
                    Crescimento
                  </div>
                  <p className="text-2xl font-bold text-blue-400">+18%</p>
                </CardContent>
              </Card>
            </div>

            {/* Upsell Offers */}
            <Card className="bg-slate-800/50 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  Ofertas de Upsell
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {offers.map((offer) => (
                  <div key={offer.id} className={`p-4 rounded-lg border ${offer.active ? 'bg-slate-700/30 border-white/5' : 'bg-slate-800/30 border-white/5 opacity-60'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${offer.active ? 'bg-amber-500/20' : 'bg-slate-700/50'}`}>
                          <offer.icon className={`h-6 w-6 ${offer.active ? 'text-amber-400' : 'text-slate-500'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{offer.name}</p>
                          <p className="text-sm text-slate-400">{offer.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {offer.trigger}
                            </Badge>
                            {offer.discount > 0 && (
                              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
                                -{offer.discount}% desconto
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-slate-400">Aceitação</p>
                          <p className="text-lg font-semibold text-amber-400">{offer.acceptanceRate}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-400">Receita</p>
                          <p className="text-lg font-semibold text-emerald-400">R$ {offer.revenue.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={offer.active} onCheckedChange={() => toggleOffer(offer.id)} />
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-slate-800/50 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Hóspede</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Oferta</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Valor</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUpsells.map((upsell, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-slate-700/20">
                          <td className="py-3 px-4 text-white">{upsell.guest}</td>
                          <td className="py-3 px-4 text-slate-300">{upsell.offer}</td>
                          <td className="py-3 px-4 text-right text-emerald-400">R$ {upsell.value}</td>
                          <td className="py-3 px-4 text-right">
                            <Badge className={getStatusColor(upsell.status)}>
                              {upsell.status}
                            </Badge>
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
