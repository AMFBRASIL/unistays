import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Store, 
  DollarSign, 
  Star,
  MapPin,
  Utensils,
  Car,
  Ticket,
  Compass,
  Sparkles,
  Plus,
  Search,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  Percent,
  Waves
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PartnerMarketplaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const partners = [
  {
    id: 1,
    name: "City Tour São Paulo",
    category: "passeios",
    description: "Tour guiado pelos principais pontos turísticos da cidade",
    price: 180,
    commission: 15,
    rating: 4.8,
    reviews: 234,
    bookings: 45,
    revenue: 1215,
    active: true
  },
  {
    id: 2,
    name: "Restaurante Fasano",
    category: "restaurantes",
    description: "Alta gastronomia italiana com vista para a cidade",
    price: 350,
    commission: 10,
    rating: 4.9,
    reviews: 567,
    bookings: 28,
    revenue: 980,
    active: true
  },
  {
    id: 3,
    name: "Transfer Premium",
    category: "transfers",
    description: "Transporte executivo aeroporto-hotel-aeroporto",
    price: 220,
    commission: 12,
    rating: 4.7,
    reviews: 189,
    bookings: 62,
    revenue: 1636,
    active: true
  },
  {
    id: 4,
    name: "Spa Urbano",
    category: "experiencias",
    description: "Day spa com massagens e tratamentos relaxantes",
    price: 280,
    commission: 18,
    rating: 4.9,
    reviews: 145,
    bookings: 35,
    revenue: 1764,
    active: true
  },
  {
    id: 5,
    name: "Helitour",
    category: "passeios",
    description: "Voo panorâmico de helicóptero sobre a cidade",
    price: 890,
    commission: 20,
    rating: 5.0,
    reviews: 89,
    bookings: 12,
    revenue: 2136,
    active: true
  },
  {
    id: 6,
    name: "Acqua Park",
    category: "experiencias",
    description: "Parque aquático com atrações para toda família",
    price: 150,
    commission: 15,
    rating: 4.6,
    reviews: 312,
    bookings: 22,
    revenue: 495,
    active: false
  }
];

const recentBookings = [
  { guest: "Maria Silva", partner: "City Tour São Paulo", value: 360, commission: 54, date: "10/03" },
  { guest: "João Santos", partner: "Transfer Premium", value: 220, commission: 26.4, date: "10/03" },
  { guest: "Ana Costa", partner: "Spa Urbano", value: 560, commission: 100.8, date: "09/03" },
  { guest: "Carlos Oliveira", partner: "Helitour", value: 1780, commission: 356, date: "08/03" }
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "passeios": return Compass;
    case "restaurantes": return Utensils;
    case "transfers": return Car;
    case "experiencias": return Sparkles;
    default: return Ticket;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "passeios": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "restaurantes": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "transfers": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "experiencias": return "bg-pink-500/20 text-pink-400 border-pink-500/30";
    default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
};

export default function PartnerMarketplaceModal({ open, onOpenChange }: PartnerMarketplaceModalProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");

  const filteredPartners = partners.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "todos" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalRevenue = partners.reduce((acc, p) => acc + p.revenue, 0);
  const totalBookings = partners.reduce((acc, p) => acc + p.bookings, 0);
  const avgCommission = Math.round(partners.reduce((acc, p) => acc + p.commission, 0) / partners.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 bg-slate-900 border-white/10">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl text-white">Marketplace de Parceiros</DialogTitle>
              <p className="text-sm text-slate-400">Passeios, restaurantes e transfers com comissão</p>
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
                    Comissões Mês
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">R$ {totalRevenue.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Ticket className="h-4 w-4" />
                    Reservas
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{totalBookings}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Percent className="h-4 w-4" />
                    Comissão Média
                  </div>
                  <p className="text-2xl font-bold text-amber-400">{avgCommission}%</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Store className="h-4 w-4" />
                    Parceiros Ativos
                  </div>
                  <p className="text-2xl font-bold text-purple-400">{partners.filter(p => p.active).length}</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="partners" className="space-y-4">
              <TabsList className="bg-slate-800/50 border border-white/10">
                <TabsTrigger value="partners" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
                  <Store className="h-4 w-4 mr-2" />
                  Parceiros
                </TabsTrigger>
                <TabsTrigger value="bookings" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
                  <Ticket className="h-4 w-4 mr-2" />
                  Reservas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="partners" className="space-y-4">
                {/* Search and Filter */}
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar parceiros..."
                      className="pl-10 bg-slate-800/50 border-white/10 text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    {["todos", "passeios", "restaurantes", "transfers", "experiencias"].map((cat) => (
                      <Button
                        key={cat}
                        size="sm"
                        variant={selectedCategory === cat ? "default" : "outline"}
                        onClick={() => setSelectedCategory(cat)}
                        className={selectedCategory === cat 
                          ? "bg-teal-600 hover:bg-teal-700" 
                          : "border-white/10 text-slate-300 hover:bg-slate-700"
                        }
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Button>
                    ))}
                  </div>
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Parceiro
                  </Button>
                </div>

                {/* Partners Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPartners.map((partner) => {
                    const Icon = getCategoryIcon(partner.category);
                    return (
                      <Card key={partner.id} className={`bg-slate-800/30 border-white/5 ${!partner.active && 'opacity-50'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                                <Icon className="h-6 w-6 text-teal-400" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{partner.name}</p>
                                <Badge className={getCategoryColor(partner.category)}>
                                  {partner.category}
                                </Badge>
                              </div>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <p className="text-sm text-slate-400 mb-4">{partner.description}</p>
                          
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                              <span className="text-white font-medium">{partner.rating}</span>
                              <span className="text-slate-400 text-sm">({partner.reviews})</span>
                            </div>
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                              {partner.commission}% comissão
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
                            <div>
                              <p className="text-xs text-slate-400">Preço</p>
                              <p className="text-sm font-medium text-white">R$ {partner.price}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Reservas</p>
                              <p className="text-sm font-medium text-blue-400">{partner.bookings}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Receita</p>
                              <p className="text-sm font-medium text-emerald-400">R$ {partner.revenue}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="bookings" className="space-y-4">
                <Card className="bg-slate-800/50 border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <Ticket className="h-5 w-5 text-teal-400" />
                      Reservas Recentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Hóspede</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Parceiro</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Valor</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Comissão</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentBookings.map((booking, idx) => (
                            <tr key={idx} className="border-b border-white/5 hover:bg-slate-700/20">
                              <td className="py-3 px-4 text-white">{booking.guest}</td>
                              <td className="py-3 px-4 text-slate-300">{booking.partner}</td>
                              <td className="py-3 px-4 text-right text-white">R$ {booking.value}</td>
                              <td className="py-3 px-4 text-right text-emerald-400">R$ {booking.commission}</td>
                              <td className="py-3 px-4 text-right text-slate-400">{booking.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
