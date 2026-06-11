import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Search,
  Plus,
  ShoppingCart,
  Shirt,
  Car,
  ShoppingBag,
  Compass,
  Shield,
  Coffee,
  Utensils,
  Sparkles,
  Star,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  ArrowRight,
  Settings,
  Percent,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle2,
  Clock,
  Zap,
  CreditCard,
  Gift,
} from "lucide-react";
import UpsellModal from "@/components/monetization/UpsellModal";
import SplitPaymentModal from "@/components/monetization/SplitPaymentModal";
import PartnerMarketplaceModal from "@/components/monetization/PartnerMarketplaceModal";

interface Partner {
  id: string;
  name: string;
  category: string;
  description: string;
  logo: string;
  rating: number;
  reviews: number;
  commission: number;
  status: "active" | "pending" | "inactive";
  services: string[];
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  revenue: number;
  bookings: number;
}

interface Service {
  id: string;
  partnerId: string;
  partnerName: string;
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  image: string;
  available: boolean;
  popular: boolean;
}

const mockPartners: Partner[] = [
  {
    id: "1",
    name: "Selfmart",
    category: "Mini-Market",
    description: "Mini-mercado automatizado com auto-checkout 24h",
    logo: "🛒",
    rating: 4.8,
    reviews: 324,
    commission: 15,
    status: "active",
    services: ["Snacks", "Bebidas", "Higiene", "Conveniência"],
    contact: {
      phone: "(11) 99999-0001",
      email: "contato@selfmart.com.br",
      address: "Integrado ao Hotel",
    },
    revenue: 45680,
    bookings: 1250,
  },
  {
    id: "2",
    name: "LavaRápido Express",
    category: "Lavanderia",
    description: "Serviço de lavanderia e passadoria premium",
    logo: "👔",
    rating: 4.6,
    reviews: 189,
    commission: 20,
    status: "active",
    services: ["Lavagem", "Passadoria", "Lavagem a Seco", "Express 2h"],
    contact: {
      phone: "(11) 99999-0002",
      email: "contato@lavarapido.com.br",
      address: "Rua das Flores, 123",
    },
    revenue: 23450,
    bookings: 456,
  },
  {
    id: "3",
    name: "CityTransfer",
    category: "Transfer",
    description: "Transfers executivos e passeios turísticos",
    logo: "🚗",
    rating: 4.9,
    reviews: 567,
    commission: 12,
    status: "active",
    services: ["Aeroporto", "Executivo", "City Tour", "Viagens"],
    contact: {
      phone: "(11) 99999-0003",
      email: "reservas@citytransfer.com.br",
      address: "Av. Paulista, 1000",
    },
    revenue: 67890,
    bookings: 890,
  },
  {
    id: "4",
    name: "Aventura Tours",
    category: "Experiências",
    description: "Experiências locais e passeios exclusivos",
    logo: "🎯",
    rating: 4.7,
    reviews: 234,
    commission: 18,
    status: "active",
    services: ["Tours", "Aventura", "Gastronômico", "Cultural"],
    contact: {
      phone: "(11) 99999-0004",
      email: "info@aventuratours.com.br",
      address: "Centro Histórico",
    },
    revenue: 34560,
    bookings: 345,
  },
  {
    id: "5",
    name: "SeguroViagem Pro",
    category: "Seguros",
    description: "Seguros viagem e assistência 24h",
    logo: "🛡️",
    rating: 4.5,
    reviews: 156,
    commission: 25,
    status: "active",
    services: ["Viagem Nacional", "Internacional", "Bagagem", "Médico"],
    contact: {
      phone: "(11) 99999-0005",
      email: "vendas@seguroviagempro.com.br",
      address: "Online",
    },
    revenue: 12340,
    bookings: 234,
  },
  {
    id: "6",
    name: "Gourmet Delivery",
    category: "Alimentação",
    description: "Delivery de restaurantes parceiros",
    logo: "🍽️",
    rating: 4.4,
    reviews: 445,
    commission: 15,
    status: "pending",
    services: ["Almoço", "Jantar", "Lanches", "Café da Manhã"],
    contact: {
      phone: "(11) 99999-0006",
      email: "parceiros@gourmetdelivery.com.br",
      address: "Diversos",
    },
    revenue: 0,
    bookings: 0,
  },
];

const mockServices: Service[] = [
  {
    id: "s1",
    partnerId: "1",
    partnerName: "Selfmart",
    name: "Kit Café da Manhã",
    category: "Mini-Market",
    description: "Kit completo com pão, frios, suco e café",
    price: 35.9,
    unit: "kit",
    image: "☕",
    available: true,
    popular: true,
  },
  {
    id: "s2",
    partnerId: "1",
    partnerName: "Selfmart",
    name: "Pack Bebidas Geladas",
    category: "Mini-Market",
    description: "6 unidades de água, refrigerante ou cerveja",
    price: 28.9,
    unit: "pack",
    image: "🍺",
    available: true,
    popular: true,
  },
  {
    id: "s3",
    partnerId: "2",
    partnerName: "LavaRápido Express",
    name: "Lavagem Express 2h",
    category: "Lavanderia",
    description: "Lavagem e secagem em até 2 horas",
    price: 45.0,
    unit: "kg",
    image: "⚡",
    available: true,
    popular: true,
  },
  {
    id: "s4",
    partnerId: "2",
    partnerName: "LavaRápido Express",
    name: "Passadoria Completa",
    category: "Lavanderia",
    description: "Passadoria profissional de roupas",
    price: 12.0,
    unit: "peça",
    image: "👕",
    available: true,
    popular: false,
  },
  {
    id: "s5",
    partnerId: "3",
    partnerName: "CityTransfer",
    name: "Transfer Aeroporto",
    category: "Transfer",
    description: "Ida ou volta do aeroporto com motorista",
    price: 120.0,
    unit: "trecho",
    image: "✈️",
    available: true,
    popular: true,
  },
  {
    id: "s6",
    partnerId: "3",
    partnerName: "CityTransfer",
    name: "City Tour 4h",
    category: "Transfer",
    description: "Passeio guiado pelos principais pontos turísticos",
    price: 250.0,
    unit: "pessoa",
    image: "🏛️",
    available: true,
    popular: false,
  },
  {
    id: "s7",
    partnerId: "4",
    partnerName: "Aventura Tours",
    name: "Trilha Ecológica",
    category: "Experiências",
    description: "Trilha guiada com café da manhã incluso",
    price: 180.0,
    unit: "pessoa",
    image: "🌿",
    available: true,
    popular: true,
  },
  {
    id: "s8",
    partnerId: "5",
    partnerName: "SeguroViagem Pro",
    name: "Seguro Nacional 7 dias",
    category: "Seguros",
    description: "Cobertura completa para viagens nacionais",
    price: 89.0,
    unit: "apólice",
    image: "📋",
    available: true,
    popular: false,
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  "Mini-Market": <ShoppingBag className="h-5 w-5" />,
  Lavanderia: <Shirt className="h-5 w-5" />,
  Transfer: <Car className="h-5 w-5" />,
  Experiências: <Compass className="h-5 w-5" />,
  Seguros: <Shield className="h-5 w-5" />,
  Alimentação: <Utensils className="h-5 w-5" />,
};

const categoryColors: Record<string, string> = {
  "Mini-Market": "bg-emerald-500/20 text-emerald-400",
  Lavanderia: "bg-blue-500/20 text-blue-400",
  Transfer: "bg-purple-500/20 text-purple-400",
  Experiências: "bg-orange-500/20 text-orange-400",
  Seguros: "bg-red-500/20 text-red-400",
  Alimentação: "bg-amber-500/20 text-amber-400",
};

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("services");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isNewPartnerModalOpen, setIsNewPartnerModalOpen] = useState(false);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [splitPaymentOpen, setSplitPaymentOpen] = useState(false);
  const [partnerMarketplaceOpen, setPartnerMarketplaceOpen] = useState(false);

  const categories = ["all", ...new Set(mockPartners.map((p) => p.category))];

  const filteredPartners = mockPartners.filter((partner) => {
    const matchesSearch =
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || partner.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredServices = mockServices.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    totalPartners: mockPartners.filter((p) => p.status === "active").length,
    totalRevenue: mockPartners.reduce((sum, p) => sum + p.revenue, 0),
    totalBookings: mockPartners.reduce((sum, p) => sum + p.bookings, 0),
    avgCommission:
      mockPartners.reduce((sum, p) => sum + p.commission, 0) /
      mockPartners.length,
  };

  const handleBookService = (service: Service) => {
    toast.success(`Serviço "${service.name}" adicionado ao carrinho!`, {
      description: `Parceiro: ${service.partnerName} - R$ ${service.price.toFixed(2)}`,
    });
  };

  const handlePartnerClick = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsPartnerModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Marketplace
            </h1>
            <p className="text-muted-foreground mt-1">
              Serviços integrados e parceiros para seus hóspedes
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              className="border-border/50 hover:bg-accent"
              onClick={() => setUpsellOpen(true)}
            >
              <Gift className="h-4 w-4 mr-2" />
              Upsell
            </Button>
            <Button
              variant="outline"
              className="border-border/50 hover:bg-accent"
              onClick={() => setSplitPaymentOpen(true)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Split Payment
            </Button>
            <Button
              variant="outline"
              className="border-border/50 hover:bg-accent"
              onClick={() => setPartnerMarketplaceOpen(true)}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Parceiros
            </Button>
            <Button
              onClick={() => setIsNewPartnerModalOpen(true)}
              className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Parceiro
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Parceiros Ativos
                  </p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {stats.totalPartners}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-blue-400">
                    R$ {(stats.totalRevenue / 1000).toFixed(1)}k
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Reservas/Vendas
                  </p>
                  <p className="text-2xl font-bold text-purple-400">
                    {stats.totalBookings}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Package className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Comissão Média
                  </p>
                  <p className="text-2xl font-bold text-amber-400">
                    {stats.avgCommission.toFixed(0)}%
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Percent className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar serviços ou parceiros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/50 border-border/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-primary"
                    : "border-border/50"
                }
              >
                {category === "all" ? "Todos" : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card/50 border border-border/50">
            <TabsTrigger value="services">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Serviços
            </TabsTrigger>
            <TabsTrigger value="partners">
              <Users className="h-4 w-4 mr-2" />
              Parceiros
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-6">
            {/* Popular Services */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                Mais Populares
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredServices
                  .filter((s) => s.popular)
                  .map((service) => (
                    <Card
                      key={service.id}
                      className="bg-card/50 border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-3xl">{service.image}</div>
                          <Badge
                            className={categoryColors[service.category]}
                            variant="secondary"
                          >
                            {service.category}
                          </Badge>
                        </div>
                        <h4 className="font-semibold mb-1">{service.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-primary">
                              R$ {service.price.toFixed(2)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              /{service.unit}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleBookService(service)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            {/* All Services */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Todos os Serviços</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map((service) => (
                  <Card
                    key={service.id}
                    className="bg-card/50 border-border/50 hover:border-primary/50 transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{service.image}</div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{service.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {service.partnerName}
                              </p>
                            </div>
                            <Badge
                              className={categoryColors[service.category]}
                              variant="secondary"
                            >
                              {categoryIcons[service.category]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 mb-3">
                            {service.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                              R$ {service.price.toFixed(2)}
                              <span className="text-xs text-muted-foreground font-normal">
                                /{service.unit}
                              </span>
                            </span>
                            <Button
                              size="sm"
                              onClick={() => handleBookService(service)}
                            >
                              Reservar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="partners" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPartners.map((partner) => (
                <Card
                  key={partner.id}
                  className="bg-card/50 border-border/50 hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => handlePartnerClick(partner)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{partner.logo}</div>
                        <div>
                          <h4 className="font-semibold">{partner.name}</h4>
                          <Badge
                            className={categoryColors[partner.category]}
                            variant="secondary"
                          >
                            {partner.category}
                          </Badge>
                        </div>
                      </div>
                      <Badge
                        variant={
                          partner.status === "active"
                            ? "default"
                            : partner.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          partner.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : ""
                        }
                      >
                        {partner.status === "active"
                          ? "Ativo"
                          : partner.status === "pending"
                            ? "Pendente"
                            : "Inativo"}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      {partner.description}
                    </p>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{partner.rating}</span>
                        <span className="text-xs text-muted-foreground">
                          ({partner.reviews})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Percent className="h-4 w-4" />
                        {partner.commission}% comissão
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {partner.services.slice(0, 3).map((service) => (
                        <Badge
                          key={service}
                          variant="outline"
                          className="text-xs"
                        >
                          {service}
                        </Badge>
                      ))}
                      {partner.services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{partner.services.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="text-center">
                        <p className="text-lg font-bold text-emerald-400">
                          R$ {(partner.revenue / 1000).toFixed(1)}k
                        </p>
                        <p className="text-xs text-muted-foreground">Receita</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-400">
                          {partner.bookings}
                        </p>
                        <p className="text-xs text-muted-foreground">Vendas</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Ver Detalhes
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Receita por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(
                      mockPartners.reduce(
                        (acc, p) => {
                          acc[p.category] = (acc[p.category] || 0) + p.revenue;
                          return acc;
                        },
                        {} as Record<string, number>
                      )
                    )
                      .sort((a, b) => b[1] - a[1])
                      .map(([category, revenue]) => (
                        <div key={category}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {categoryIcons[category]}
                              <span className="text-sm font-medium">
                                {category}
                              </span>
                            </div>
                            <span className="text-sm font-bold">
                              R$ {(revenue / 1000).toFixed(1)}k
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                              style={{
                                width: `${(revenue / stats.totalRevenue) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-400" />
                    Top Parceiros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPartners
                      .sort((a, b) => b.revenue - a.revenue)
                      .slice(0, 5)
                      .map((partner, index) => (
                        <div
                          key={partner.id}
                          className="flex items-center gap-4"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="text-2xl">{partner.logo}</div>
                          <div className="flex-1">
                            <p className="font-medium">{partner.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {partner.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-400">
                              R$ {(partner.revenue / 1000).toFixed(1)}k
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {partner.bookings} vendas
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Partner Detail Modal */}
        <Dialog open={isPartnerModalOpen} onOpenChange={setIsPartnerModalOpen}>
          <DialogContent className="max-w-2xl">
            {selectedPartner && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{selectedPartner.logo}</div>
                    <div>
                      <DialogTitle className="text-2xl">
                        {selectedPartner.name}
                      </DialogTitle>
                      <Badge
                        className={categoryColors[selectedPartner.category]}
                      >
                        {selectedPartner.category}
                      </Badge>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  <p className="text-muted-foreground">
                    {selectedPartner.description}
                  </p>

                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-400">
                          R$ {(selectedPartner.revenue / 1000).toFixed(1)}k
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Receita Total
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-blue-400">
                          {selectedPartner.bookings}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total de Vendas
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-amber-400">
                          {selectedPartner.commission}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Comissão
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Serviços Oferecidos</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPartner.services.map((service) => (
                        <Badge key={service} variant="outline">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Contato</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {selectedPartner.contact.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {selectedPartner.contact.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {selectedPartner.contact.address}
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsPartnerModalOpen(false)}
                  >
                    Fechar
                  </Button>
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar Parceiro
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* New Partner Modal */}
        <Dialog
          open={isNewPartnerModalOpen}
          onOpenChange={setIsNewPartnerModalOpen}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Parceiro</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Parceiro</Label>
                <Input placeholder="Ex: Lavanderia Express" />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="">Selecione uma categoria</option>
                  <option value="Mini-Market">Mini-Market</option>
                  <option value="Lavanderia">Lavanderia</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Experiências">Experiências</option>
                  <option value="Seguros">Seguros</option>
                  <option value="Alimentação">Alimentação</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea placeholder="Descreva os serviços oferecidos..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Comissão (%)</Label>
                  <Input type="number" placeholder="15" />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input placeholder="(11) 99999-0000" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="contato@parceiro.com.br" />
              </div>

              <div className="flex items-center justify-between">
                <Label>Ativar Parceiro</Label>
                <Switch />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsNewPartnerModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  toast.success("Parceiro adicionado com sucesso!");
                  setIsNewPartnerModalOpen(false);
                }}
              >
                Adicionar Parceiro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Monetization Modals */}
        <UpsellModal open={upsellOpen} onOpenChange={setUpsellOpen} />
        <SplitPaymentModal open={splitPaymentOpen} onOpenChange={setSplitPaymentOpen} />
        <PartnerMarketplaceModal open={partnerMarketplaceOpen} onOpenChange={setPartnerMarketplaceOpen} />
      </div>
    </DashboardLayout>
  );
}
