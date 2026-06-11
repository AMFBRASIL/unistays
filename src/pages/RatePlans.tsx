import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tags, 
  Plus, 
  Search, 
  Filter,
  Percent,
  Calendar,
  Clock,
  Gift,
  Star,
  TrendingUp,
  Edit,
  Trash2,
  Copy,
  MoreVertical,
  Package,
  Utensils,
  Car,
  Sparkles,
  Heart,
  PartyPopper,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NewRatePlanModal } from "@/components/rateplans/NewRatePlanModal";

interface RatePlan {
  id: string;
  name: string;
  description: string;
  type: "package" | "promotion" | "corporate" | "seasonal";
  discount: number;
  validFrom: string;
  validTo: string;
  minNights: number;
  maxNights?: number;
  inclusions: string[];
  roomTypes: string[];
  active: boolean;
  bookings: number;
  revenue: number;
}

const ratePlans: RatePlan[] = [
  {
    id: "1",
    name: "Pacote Romântico",
    description: "Experiência especial para casais com jantar e spa",
    type: "package",
    discount: 15,
    validFrom: "2024-01-01",
    validTo: "2024-12-31",
    minNights: 2,
    inclusions: ["Café da manhã", "Jantar romântico", "Spa para casal", "Decoração especial"],
    roomTypes: ["Suite Master", "Suite Presidencial"],
    active: true,
    bookings: 45,
    revenue: 89500
  },
  {
    id: "2",
    name: "Early Bird - Verão",
    description: "Reserve com antecedência e economize",
    type: "promotion",
    discount: 20,
    validFrom: "2024-12-01",
    validTo: "2025-02-28",
    minNights: 3,
    inclusions: ["Café da manhã", "Late checkout"],
    roomTypes: ["Standard", "Superior", "Luxo"],
    active: true,
    bookings: 128,
    revenue: 245000
  },
  {
    id: "3",
    name: "Corporativo Premium",
    description: "Tarifas especiais para empresas conveniadas",
    type: "corporate",
    discount: 25,
    validFrom: "2024-01-01",
    validTo: "2024-12-31",
    minNights: 1,
    inclusions: ["Café da manhã", "Wi-Fi premium", "Estacionamento"],
    roomTypes: ["Standard", "Superior", "Executivo"],
    active: true,
    bookings: 320,
    revenue: 456000
  },
  {
    id: "4",
    name: "Réveillon 2025",
    description: "Pacote especial de fim de ano com festa",
    type: "seasonal",
    discount: 0,
    validFrom: "2024-12-29",
    validTo: "2025-01-02",
    minNights: 4,
    maxNights: 5,
    inclusions: ["Pensão completa", "Festa de Réveillon", "Open bar", "Shows ao vivo"],
    roomTypes: ["Suite Master", "Suite Presidencial", "Luxo"],
    active: true,
    bookings: 35,
    revenue: 175000
  },
  {
    id: "5",
    name: "Família Feliz",
    description: "Pacote especial para famílias com crianças",
    type: "package",
    discount: 10,
    validFrom: "2024-01-01",
    validTo: "2024-12-31",
    minNights: 2,
    inclusions: ["Café da manhã", "Kids club", "Passeios infantis"],
    roomTypes: ["Familiar", "Suite Familiar"],
    active: false,
    bookings: 89,
    revenue: 134000
  },
];

const typeConfig = {
  package: { icon: Gift, color: "from-purple-500 to-pink-500", label: "Pacote" },
  promotion: { icon: Percent, color: "from-emerald-500 to-green-500", label: "Promoção" },
  corporate: { icon: Briefcase, color: "from-blue-500 to-cyan-500", label: "Corporativo" },
  seasonal: { icon: Calendar, color: "from-amber-500 to-orange-500", label: "Temporada" },
};

const inclusionIcons: Record<string, React.ElementType> = {
  "Café da manhã": Utensils,
  "Jantar romântico": Heart,
  "Spa para casal": Sparkles,
  "Decoração especial": Heart,
  "Late checkout": Clock,
  "Wi-Fi premium": Star,
  "Estacionamento": Car,
  "Pensão completa": Utensils,
  "Festa de Réveillon": PartyPopper,
  "Open bar": Star,
  "Shows ao vivo": Star,
  "Kids club": Star,
  "Passeios infantis": Star,
};

export default function RatePlans() {
  const [searchQuery, setSearchQuery] = useState("");
  const [plans, setPlans] = useState(ratePlans);
  const [newPlanModalOpen, setNewPlanModalOpen] = useState(false);

  const activePlans = plans.filter(p => p.active).length;
  const totalRevenue = plans.reduce((acc, p) => acc + p.revenue, 0);
  const totalBookings = plans.reduce((acc, p) => acc + p.bookings, 0);

  const togglePlanStatus = (id: string) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Tags className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Planos de Tarifas</h1>
              <p className="text-muted-foreground">Pacotes promocionais e planos de tarifas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtrar
            </Button>
            <Button 
              className="gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              onClick={() => setNewPlanModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Novo Plano
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Planos Ativos</p>
                  <p className="text-2xl font-bold text-purple-500">{activePlans}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Tags className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Gerada</p>
                  <p className="text-2xl font-bold text-emerald-500">R$ {(totalRevenue / 1000).toFixed(0)}k</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reservas</p>
                  <p className="text-2xl font-bold text-blue-500">{totalBookings}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ticket Médio</p>
                  <p className="text-2xl font-bold text-amber-500">R$ {(totalRevenue / totalBookings).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar planos de tarifas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {plans.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((plan) => {
            const config = typeConfig[plan.type];
            return (
              <Card key={plan.id} className={cn("transition-all", !plan.active && "opacity-60")}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", config.color)}>
                        <config.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        <Badge variant="outline" className="mt-1">{config.label}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={plan.active} onCheckedChange={() => togglePlanStatus(plan.id)} />
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {plan.discount > 0 && (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        <Percent className="w-3 h-3 mr-1" />
                        {plan.discount}% desconto
                      </Badge>
                    )}
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      Mín. {plan.minNights} noites
                    </Badge>
                    <Badge variant="outline">
                      <Calendar className="w-3 h-3 mr-1" />
                      Até {new Date(plan.validTo).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Inclui:</p>
                    <div className="flex flex-wrap gap-2">
                      {plan.inclusions.map((inclusion, idx) => {
                        const Icon = inclusionIcons[inclusion] || Package;
                        return (
                          <Badge key={idx} variant="secondary" className="gap-1">
                            <Icon className="w-3 h-3" />
                            {inclusion}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-2 rounded-lg bg-card border border-border">
                      <p className="text-2xl font-bold text-primary">{plan.bookings}</p>
                      <p className="text-xs text-muted-foreground">Reservas</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-card border border-border">
                      <p className="text-2xl font-bold text-emerald-500">R$ {(plan.revenue / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-muted-foreground">Receita</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 text-red-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <NewRatePlanModal open={newPlanModalOpen} onOpenChange={setNewPlanModalOpen} />
    </DashboardLayout>
  );
}
