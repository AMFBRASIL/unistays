import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NewMemberModal } from "@/components/loyalty/NewMemberModal";
import { 
  Crown, 
  Plus, 
  Search, 
  Filter,
  Star,
  Gift,
  Trophy,
  Users,
  TrendingUp,
  Settings,
  Sparkles,
  Medal,
  Award,
  Gem,
  Heart,
  Percent,
  BedDouble,
  Utensils,
  Car,
  Clock,
  ArrowUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LoyaltyTier {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  minPoints: number;
  maxPoints: number | null;
  benefits: string[];
  members: number;
  discount: number;
}

interface LoyaltyMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  tier: string;
  points: number;
  totalStays: number;
  totalSpent: number;
  memberSince: string;
  nextTierProgress: number;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  category: "room" | "dining" | "spa" | "experience" | "upgrade";
  available: boolean;
}

const tiers: LoyaltyTier[] = [
  {
    id: "bronze",
    name: "Bronze",
    icon: Medal,
    color: "from-amber-600 to-orange-700",
    minPoints: 0,
    maxPoints: 999,
    benefits: ["5% desconto em diárias", "Early check-in sujeito a disponibilidade"],
    members: 1250,
    discount: 5
  },
  {
    id: "silver",
    name: "Prata",
    icon: Award,
    color: "from-slate-400 to-slate-500",
    minPoints: 1000,
    maxPoints: 4999,
    benefits: ["10% desconto em diárias", "Early check-in garantido", "Upgrade sujeito a disponibilidade"],
    members: 680,
    discount: 10
  },
  {
    id: "gold",
    name: "Ouro",
    icon: Trophy,
    color: "from-amber-400 to-yellow-500",
    minPoints: 5000,
    maxPoints: 14999,
    benefits: ["15% desconto em diárias", "Early check-in e late check-out", "Upgrade garantido", "Café da manhã incluso"],
    members: 245,
    discount: 15
  },
  {
    id: "platinum",
    name: "Platina",
    icon: Gem,
    color: "from-violet-500 to-purple-600",
    minPoints: 15000,
    maxPoints: null,
    benefits: ["20% desconto em diárias", "Suite upgrade", "Concierge exclusivo", "Experiências VIP", "Acesso ao lounge"],
    members: 52,
    discount: 20
  },
];

const members: LoyaltyMember[] = [
  { id: "1", name: "Carlos Mendes", email: "carlos@email.com", tier: "platinum", points: 18500, totalStays: 45, totalSpent: 125000, memberSince: "2020-03-15", nextTierProgress: 100 },
  { id: "2", name: "Ana Paula Silva", email: "ana@email.com", tier: "gold", points: 12800, totalStays: 28, totalSpent: 78000, memberSince: "2021-06-20", nextTierProgress: 85 },
  { id: "3", name: "Roberto Santos", email: "roberto@email.com", tier: "gold", points: 8900, totalStays: 22, totalSpent: 56000, memberSince: "2021-09-10", nextTierProgress: 59 },
  { id: "4", name: "Marina Costa", email: "marina@email.com", tier: "silver", points: 3200, totalStays: 12, totalSpent: 24000, memberSince: "2022-02-28", nextTierProgress: 64 },
  { id: "5", name: "Pedro Oliveira", email: "pedro@email.com", tier: "bronze", points: 850, totalStays: 5, totalSpent: 8500, memberSince: "2023-08-15", nextTierProgress: 85 },
];

const rewards: Reward[] = [
  { id: "1", name: "Noite Grátis", description: "Uma diária em quarto standard", points: 5000, category: "room", available: true },
  { id: "2", name: "Upgrade de Quarto", description: "Upgrade para categoria superior", points: 2000, category: "upgrade", available: true },
  { id: "3", name: "Jantar para Dois", description: "Jantar completo no restaurante principal", points: 3000, category: "dining", available: true },
  { id: "4", name: "Spa Day", description: "Pacote completo de spa", points: 4000, category: "spa", available: true },
  { id: "5", name: "Transfer Aeroporto", description: "Transfer ida e volta", points: 1500, category: "experience", available: true },
  { id: "6", name: "Late Checkout", description: "Check-out estendido até 16h", points: 500, category: "room", available: true },
];

const categoryConfig = {
  room: { icon: BedDouble, color: "from-blue-500 to-cyan-500" },
  dining: { icon: Utensils, color: "from-orange-500 to-red-500" },
  spa: { icon: Sparkles, color: "from-purple-500 to-pink-500" },
  experience: { icon: Star, color: "from-amber-500 to-yellow-500" },
  upgrade: { icon: ArrowUp, color: "from-emerald-500 to-green-500" },
};

export default function LoyaltyProgram() {
  const [searchQuery, setSearchQuery] = useState("");
  const [memberModalOpen, setMemberModalOpen] = useState(false);

  const totalMembers = tiers.reduce((acc, t) => acc + t.members, 0);
  const totalPoints = members.reduce((acc, m) => acc + m.points, 0);

  const getTierConfig = (tierName: string) => tiers.find(t => t.id === tierName) || tiers[0];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Programa de Fidelidade</h1>
              <p className="text-muted-foreground">Gestão de pontos, níveis e benefícios</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Configurar
            </Button>
            <Button 
              onClick={() => setMemberModalOpen(true)}
              className="gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700"
            >
              <Plus className="w-4 h-4" />
              Adicionar Membro
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Membros</p>
                  <p className="text-2xl font-bold text-amber-500">{totalMembers.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Membros Platina</p>
                  <p className="text-2xl font-bold text-purple-500">{tiers.find(t => t.id === "platinum")?.members}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Gem className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pontos em Circulação</p>
                  <p className="text-2xl font-bold text-emerald-500">{(totalPoints / 1000).toFixed(0)}k</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resgates do Mês</p>
                  <p className="text-2xl font-bold text-blue-500">156</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tiers" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="tiers" className="gap-2">
              <Crown className="w-4 h-4" />
              Níveis
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="w-4 h-4" />
              Membros
            </TabsTrigger>
            <TabsTrigger value="rewards" className="gap-2">
              <Gift className="w-4 h-4" />
              Recompensas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tiers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tiers.map((tier) => (
                <Card key={tier.id} className="overflow-hidden">
                  <div className={cn("h-2 bg-gradient-to-r", tier.color)} />
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", tier.color)}>
                        <tier.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{tier.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {tier.minPoints.toLocaleString()}+ pontos
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Membros</span>
                        <span className="font-semibold">{tier.members.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Desconto</span>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          {tier.discount}%
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase">Benefícios</p>
                      {tier.benefits.slice(0, 3).map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Heart className="w-3 h-3 text-primary" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                      {tier.benefits.length > 3 && (
                        <p className="text-xs text-primary">+{tier.benefits.length - 3} mais benefícios</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar membros..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="divide-y divide-border">
                    {members.map((member) => {
                      const tierConfig = getTierConfig(member.tier);
                      return (
                        <div key={member.id} className="p-4 hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className={cn("bg-gradient-to-br text-white", tierConfig.color)}>
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{member.name}</h4>
                                <Badge variant="outline" className={cn("gap-1", tierConfig.color.replace('from-', 'text-').split(' ')[0])}>
                                  <tierConfig.icon className="w-3 h-3" />
                                  {tierConfig.name}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xl font-bold text-primary">{member.points.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">pontos</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xl font-bold">{member.totalStays}</p>
                              <p className="text-xs text-muted-foreground">estadias</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xl font-bold text-emerald-500">R$ {(member.totalSpent / 1000).toFixed(0)}k</p>
                              <p className="text-xs text-muted-foreground">total gasto</p>
                            </div>
                            <Button variant="outline" size="sm">Ver Perfil</Button>
                          </div>
                          {member.nextTierProgress < 100 && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <div className="flex items-center justify-between mb-1 text-sm">
                                <span className="text-muted-foreground">Progresso para próximo nível</span>
                                <span className="font-medium">{member.nextTierProgress}%</span>
                              </div>
                              <Progress value={member.nextTierProgress} className="h-1.5" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => {
                const config = categoryConfig[reward.category];
                return (
                  <Card key={reward.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", config.color)}>
                          <config.icon className="w-6 h-6 text-white" />
                        </div>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                          <Star className="w-3 h-3 mr-1" />
                          {reward.points.toLocaleString()} pts
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{reward.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                      <Button variant="outline" className="w-full">Configurar</Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <NewMemberModal open={memberModalOpen} onOpenChange={setMemberModalOpen} />
      </div>
    </DashboardLayout>
  );
}
