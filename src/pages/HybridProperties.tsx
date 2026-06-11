import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import PropertyModal from "@/components/properties/PropertyModal";
import CleaningServiceModal from "@/components/properties/CleaningServiceModal";
import OwnerFinancialReportModal from "@/components/properties/OwnerFinancialReportModal";
import {
  Search,
  Plus,
  Building2,
  Hotel,
  Home,
  Building,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Settings,
  TrendingUp,
  FileText,
  Brush,
  CalendarDays,
  CalendarRange,
  User,
  Percent,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Star,
  Coffee,
  Wifi,
  Car,
  Dumbbell,
  Waves,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Loader2,
  Trash2,
  Umbrella,
  Backpack,
} from "lucide-react";

type PropertyType = "hotel" | "apart-hotel" | "loft" | "temporada" | "hostel" | "resort";
type StayType = "daily" | "weekly" | "monthly" | "long-stay";

interface Property {
  id: string;
  name: string;
  type: PropertyType;
  address: string;
  units: number;
  occupancy: number;
  owner?: {
    id?: number;
    name: string;
    email: string;
    phone: string;
    commission: number;
  };
  rates: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  amenities: string[];
  services: {
    cleaning: "per-stay" | "weekly" | "biweekly" | "monthly";
    coworking: boolean;
    rooftop: boolean;
  };
  status: "active" | "maintenance" | "inactive";
  checkInTime?: string;
  checkOutTime?: string;
  images?: string[];
  description?: string;
  zipCode?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  addressNumber?: string;
  email?: string;
  phone?: string;
  website?: string;
  settings?: {
    taxRate?: number;
    serviceFee?: number;
    [key: string]: any;
  };
}

interface Contract {
  id: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  type: StayType;
  startDate: string;
  endDate: string;
  value: number;
  status: "active" | "pending" | "expired";
}

const mockProperties: Property[] = [
  {
    id: "1",
    name: "Hotel Beira Mar",
    type: "hotel",
    address: "Av. Atlântica, 1500 - Copacabana, RJ",
    units: 120,
    occupancy: 78,
    rates: { daily: 350, weekly: 2100, monthly: 7500 },
    amenities: ["wifi", "pool", "gym", "parking", "restaurant"],
    services: { cleaning: "per-stay", coworking: false, rooftop: true },
    status: "active",
  },
  {
    id: "2",
    name: "Apart Hotel Executive",
    type: "apart-hotel",
    address: "Rua Augusta, 2000 - Jardins, SP",
    units: 45,
    occupancy: 85,
    owner: {
      name: "Carlos Silva",
      email: "carlos@email.com",
      phone: "(11) 99999-1111",
      commission: 30,
    },
    rates: { daily: 280, weekly: 1680, monthly: 5500 },
    amenities: ["wifi", "gym", "parking", "kitchenette"],
    services: { cleaning: "weekly", coworking: true, rooftop: false },
    status: "active",
  },
  {
    id: "3",
    name: "Loft Design District",
    type: "loft",
    address: "Rua Oscar Freire, 800 - Pinheiros, SP",
    units: 20,
    occupancy: 90,
    owner: {
      name: "Marina Costa",
      email: "marina@email.com",
      phone: "(11) 99999-2222",
      commission: 25,
    },
    rates: { daily: 450, weekly: 2700, monthly: 9000 },
    amenities: ["wifi", "gym", "rooftop", "concierge"],
    services: { cleaning: "biweekly", coworking: true, rooftop: true },
    status: "active",
  },
  {
    id: "4",
    name: "Casa de Temporada Praia",
    type: "temporada",
    address: "Rua das Dunas, 50 - Florianópolis, SC",
    units: 8,
    occupancy: 62,
    owner: {
      name: "Roberto Mendes",
      email: "roberto@email.com",
      phone: "(48) 99999-3333",
      commission: 20,
    },
    rates: { daily: 550, weekly: 3300, monthly: 11000 },
    amenities: ["wifi", "pool", "bbq", "beach-access"],
    services: { cleaning: "per-stay", coworking: false, rooftop: false },
    status: "active",
  },
];

const mockContracts: Contract[] = [
  {
    id: "c1",
    propertyId: "2",
    propertyName: "Apart Hotel Executive",
    guestName: "João Pereira",
    type: "monthly",
    startDate: "2024-01-15",
    endDate: "2024-07-15",
    value: 33000,
    status: "active",
  },
  {
    id: "c2",
    propertyId: "3",
    propertyName: "Loft Design District",
    guestName: "Ana Beatriz",
    type: "weekly",
    startDate: "2024-03-01",
    endDate: "2024-03-08",
    value: 2700,
    status: "active",
  },
  {
    id: "c3",
    propertyId: "2",
    propertyName: "Apart Hotel Executive",
    guestName: "Pedro Santos",
    type: "long-stay",
    startDate: "2024-02-01",
    endDate: "2025-02-01",
    value: 66000,
    status: "active",
  },
];

const propertyTypeConfig: Record<
  PropertyType,
  { label: string; icon: React.ComponentType<any>; color: string; bgColor: string }
> = {
  hotel: {
    label: "Hotel",
    icon: Hotel,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  "apart-hotel": {
    label: "Apart-Hotel",
    icon: Building2,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
  },
  loft: {
    label: "Loft",
    icon: Home,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
  },
  temporada: {
    label: "Temporada",
    icon: Building,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
  },
  hostel: {
    label: "Hostel",
    icon: Backpack,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
  },
  resort: {
    label: "Resort",
    icon: Umbrella,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
  },
};

const stayTypeConfig: Record<
  StayType,
  { label: string; icon: React.ComponentType<any>; color: string }
> = {
  daily: { label: "Diária", icon: Calendar, color: "text-blue-400" },
  weekly: { label: "Semanal", icon: CalendarDays, color: "text-purple-400" },
  monthly: { label: "Mensal", icon: CalendarRange, color: "text-amber-400" },
  "long-stay": { label: "Long Stay", icon: Clock, color: "text-emerald-400" },
};

const amenityIcons: Record<string, React.ComponentType<any>> = {
  wifi: Wifi,
  pool: Waves,
  gym: Dumbbell,
  parking: Car,
  restaurant: Coffee,
  rooftop: Building,
  kitchenette: Coffee,
  concierge: User,
  bbq: Coffee,
  "beach-access": Waves,
};

// Mapear propriedade do backend para o formato da interface
const mapPropertyFromBackend = (property: any): Property => {
  // Extrair tarifas dos settings ou usar valores padrão
  const rates = property.settings?.rates || {};

  return {
    id: String(property.id),
    name: property.name,
    type: property.type as PropertyType,
    address: property.address || `${property.city || ''}, ${property.state || ''}`.trim() || 'Endereço não informado',
    units: property.unitsCount || 0,
    occupancy: 0, // Será calculado quando tivermos dados de reservas
    owner: property.owner ? {
      id: property.owner.id,
      name: property.owner.name,
      email: property.owner.email,
      phone: property.owner.phone || '',
      commission: property.commissionRate || 0,
    } : undefined,
    rates: {
      daily: rates.daily || 0,
      weekly: rates.weekly || 0,
      monthly: rates.monthly || 0,
    },
    amenities: property.settings?.amenities || [],
    services: {
      cleaning: property.cleaningSchedule || 'per-stay',
      coworking: property.services?.coworking || false,
      rooftop: property.services?.rooftop || false,
    },
    status: property.status as "active" | "maintenance" | "inactive",
    checkInTime: property.settings?.checkInTime,
    checkOutTime: property.settings?.checkOutTime,
    images: property.images || [],
    description: property.settings?.description || "",
    zipCode: property.zipCode || property.zip_code || "",
    neighborhood: property.neighborhood || "",
    city: property.city || "",
    state: property.state || "",
    addressNumber: property.addressNumber || property.address_number || "",
    email: property.email || "",
    phone: property.phone || "",
    website: property.website || "",
    settings: {
      ...property.settings,
      taxRate: property.settings?.taxRate,
      serviceFee: property.settings?.serviceFee,
    }
  };
};

export default function HybridProperties() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("properties");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isNewPropertyModalOpen, setIsNewPropertyModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isCleaningModalOpen, setIsCleaningModalOpen] = useState(false);
  const [isFinancialReportModalOpen, setIsFinancialReportModalOpen] = useState(false);
  const [isEditPropertyModalOpen, setIsEditPropertyModalOpen] = useState(false);
  const [selectedCleaningProperty, setSelectedCleaningProperty] = useState<Property | null>(null);
  const [selectedOwnerProperty, setSelectedOwnerProperty] = useState<Property | null>(null);
  const queryClient = useQueryClient();

  // Buscar propriedades do backend
  const { data: propertiesData, isLoading, error, refetch } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await api.getProperties();
      if (response.success && response.data) {
        return response.data.properties.map(mapPropertyFromBackend);
      }
      throw new Error(response.error?.message || 'Erro ao carregar propriedades');
    },
  });

  const properties = propertiesData || [];
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || property.type === selectedType;
    return matchesSearch && matchesType;
  });

  const stats = {
    totalUnits: properties.reduce((sum, p) => sum + p.units, 0),
    avgOccupancy: properties.length > 0
      ? properties.reduce((sum, p) => sum + p.occupancy, 0) / properties.length
      : 0,
    activeContracts: mockContracts.filter((c) => c.status === "active").length,
    monthlyRevenue: mockContracts
      .filter((c) => c.status === "active")
      .reduce((sum, c) => sum + c.value / 6, 0),
  };

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setIsPropertyModalOpen(true);
  };

  // Mutation para deletar propriedade
  const deletePropertyMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.deleteProperty(id);
      if (!response.success) {
        throw new Error(response.error?.message || 'Erro ao deletar propriedade');
      }
    },
    onSuccess: () => {
      toast.success('Propriedade deletada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao deletar propriedade');
    },
  });

  const handleDeleteProperty = (propertyId: string) => {
    if (confirm('Tem certeza que deseja deletar esta propriedade?')) {
      deletePropertyMutation.mutate(Number(propertyId));
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <p className="text-destructive">Erro ao carregar propriedades</p>
          <Button onClick={() => refetch()}>Tentar novamente</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Gestão Híbrida
            </h1>
            <p className="text-muted-foreground mt-1">
              Hotel • Apart-Hotel • Lofts • Temporada
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsContractModalOpen(true)}
              className="border-border/50 hover:bg-accent"
            >
              <FileText className="h-4 w-4 mr-2" />
              Novo Contrato
            </Button>
            <Button
              onClick={() => setIsNewPropertyModalOpen(true)}
              className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Propriedade
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Unidades</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.totalUnits}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ocupação Média</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {stats.avgOccupancy.toFixed(0)}%
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contratos Ativos</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {stats.activeContracts}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Mensal</p>
                  <p className="text-2xl font-bold text-amber-400">
                    R$ {(stats.monthlyRevenue / 1000).toFixed(1)}k
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar propriedades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/50 border-border/50"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("all")}
            >
              Todos
            </Button>
            {Object.entries(propertyTypeConfig).map(([type, config]) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
                className={selectedType !== type ? "border-border/50" : ""}
              >
                <config.icon className="h-4 w-4 mr-1" />
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card/50 border border-border/50">
            <TabsTrigger value="properties">
              <Building2 className="h-4 w-4 mr-2" />
              Propriedades
            </TabsTrigger>
            <TabsTrigger value="contracts">
              <FileText className="h-4 w-4 mr-2" />
              Contratos
            </TabsTrigger>
            <TabsTrigger value="owners">
              <Users className="h-4 w-4 mr-2" />
              Proprietários
            </TabsTrigger>
            <TabsTrigger value="services">
              <Brush className="h-4 w-4 mr-2" />
              Serviços
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="mt-6">
            {filteredProperties.length === 0 ? (
              <Card className="bg-card/50 border-border/50">
                <CardContent className="py-12 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma propriedade encontrada</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProperties.map((property) => {
                  const typeConfig = propertyTypeConfig[property.type] || propertyTypeConfig.hotel;
                  const TypeIcon = typeConfig.icon;

                  return (
                    <Card
                      key={property.id}
                      className="bg-card/50 border-border/50 hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => handlePropertyClick(property)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-12 w-12 rounded-xl ${typeConfig.bgColor} flex items-center justify-center`}
                            >
                              <TypeIcon className={`h-6 w-6 ${typeConfig.color}`} />
                            </div>
                            <div>
                              <h4 className="font-semibold">{property.name}</h4>
                              <Badge className={`${typeConfig.bgColor} ${typeConfig.color}`}>
                                {typeConfig.label}
                              </Badge>
                            </div>
                          </div>
                          <Badge
                            variant={property.status === "active" ? "default" : "secondary"}
                            className={
                              property.status === "active"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : ""
                            }
                          >
                            {property.status === "active" ? "Ativo" : "Manutenção"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                          <MapPin className="h-4 w-4" />
                          {property.address}
                        </div>

                        {/* Rates */}
                        {(property.rates?.daily > 0 || property.rates?.weekly > 0 || property.rates?.monthly > 0) && (
                          <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-muted/30 rounded-lg">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Diária</p>
                              <p className="font-semibold text-blue-400">
                                {property.rates?.daily > 0 ? `R$ ${property.rates?.daily}` : '-'}
                              </p>
                            </div>
                            <div className="text-center border-x border-border/50">
                              <p className="text-xs text-muted-foreground">Semana</p>
                              <p className="font-semibold text-purple-400">
                                {property.rates?.weekly > 0 ? `R$ ${property.rates?.weekly}` : '-'}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Mês</p>
                              <p className="font-semibold text-amber-400">
                                {property.rates?.monthly > 0 ? `R$ ${(property.rates?.monthly / 1000).toFixed(1)}k` : '-'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Amenities */}
                        {property.amenities && property.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {property.amenities.slice(0, 4).map((amenity: string) => {
                              const AmenityIcon = amenityIcons[amenity] || Coffee;
                              return (
                                <Badge
                                  key={amenity}
                                  variant="outline"
                                  className="text-xs gap-1"
                                >
                                  <AmenityIcon className="h-3 w-3" />
                                  {amenity}
                                </Badge>
                              );
                            })}
                            {property.amenities.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{property.amenities.length - 4}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Footer Stats */}
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-lg font-bold">{property.units}</p>
                              <p className="text-xs text-muted-foreground">Unidades</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-emerald-400">
                                {property.occupancy > 0 ? `${property.occupancy}%` : 'N/A'}
                              </p>
                              <p className="text-xs text-muted-foreground">Ocupação</p>
                            </div>
                          </div>
                          {property.owner && (
                            <Badge variant="outline" className="gap-1">
                              <User className="h-3 w-3" />
                              {property.owner.commission}%
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4 pt-4 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedCleaningProperty(property);
                              setIsCleaningModalOpen(true);
                            }}
                          >
                            <Brush className="h-4 w-4 mr-1" />
                            Limpeza
                          </Button>
                          {property.owner && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setSelectedOwnerProperty(property);
                                setIsFinancialReportModalOpen(true);
                              }}
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Financeiro
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteProperty(property.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="contracts" className="mt-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Contratos de Long Stay</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockContracts.map((contract) => {
                    const stayConfig = stayTypeConfig[contract.type];
                    const StayIcon = stayConfig.icon;

                    return (
                      <div
                        key={contract.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`h-10 w-10 rounded-lg bg-${stayConfig.color.split("-")[1]}-500/20 flex items-center justify-center`}
                          >
                            <StayIcon className={`h-5 w-5 ${stayConfig.color}`} />
                          </div>
                          <div>
                            <p className="font-semibold">{contract.guestName}</p>
                            <p className="text-sm text-muted-foreground">
                              {contract.propertyName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <Badge className={`${stayConfig.color}`}>
                            {stayConfig.label}
                          </Badge>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Período</p>
                            <p className="text-sm">
                              {new Date(contract.startDate).toLocaleDateString("pt-BR")} -{" "}
                              {new Date(contract.endDate).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Valor</p>
                            <p className="font-bold text-emerald-400">
                              R$ {contract.value.toLocaleString("pt-BR")}
                            </p>
                          </div>
                          <Badge
                            className={
                              contract.status === "active"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-amber-500/20 text-amber-400"
                            }
                          >
                            {contract.status === "active" ? "Ativo" : "Pendente"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="owners" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties
                .filter((p) => p.owner)
                .map((property) => (
                  <Card key={property.id} className="bg-card/50 border-border/50">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                          <User className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{property.owner?.name}</h4>
                          <p className="text-sm text-muted-foreground">Proprietário</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {property.owner?.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {property.owner?.phone}
                        </div>
                      </div>

                      <div className="p-3 bg-muted/30 rounded-lg mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Propriedade</span>
                          <span className="font-medium">{property.name}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-muted-foreground">Comissão</span>
                          <Badge className="bg-emerald-500/20 text-emerald-400">
                            {property.owner?.commission}%
                          </Badge>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setSelectedOwnerProperty(property);
                          setIsFinancialReportModalOpen(true);
                        }}
                      >
                        Ver Relatório Financeiro
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brush className="h-5 w-5 text-primary" />
                    Configuração de Limpeza
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockProperties.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{property.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {propertyTypeConfig[property.type].label}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge
                            className={
                              property.services.cleaning === "per-stay"
                                ? "bg-blue-500/20 text-blue-400"
                                : property.services.cleaning === "weekly"
                                  ? "bg-purple-500/20 text-purple-400"
                                  : "bg-amber-500/20 text-amber-400"
                            }
                          >
                            {property.services.cleaning === "per-stay"
                              ? "Por Estadia"
                              : property.services.cleaning === "weekly"
                                ? "Semanal"
                                : property.services.cleaning === "biweekly"
                                  ? "Quinzenal"
                                  : "Mensal"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCleaningProperty(property);
                              setIsCleaningModalOpen(true);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Serviços Adicionais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockProperties.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{property.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {propertyTypeConfig[property.type].label}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={property.services.coworking ? "default" : "outline"}
                            className={
                              property.services.coworking
                                ? "bg-emerald-500/20 text-emerald-400"
                                : ""
                            }
                          >
                            Coworking
                          </Badge>
                          <Badge
                            variant={property.services.rooftop ? "default" : "outline"}
                            className={
                              property.services.rooftop
                                ? "bg-purple-500/20 text-purple-400"
                                : ""
                            }
                          >
                            Rooftop
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Property Detail Modal */}
        <Dialog open={isPropertyModalOpen} onOpenChange={setIsPropertyModalOpen}>
          <DialogContent className="max-w-2xl">
            {selectedProperty && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-14 w-14 rounded-xl ${propertyTypeConfig[selectedProperty.type].bgColor} flex items-center justify-center`}
                    >
                      {(() => {
                        const TypeIcon = propertyTypeConfig[selectedProperty.type].icon;
                        return (
                          <TypeIcon
                            className={`h-7 w-7 ${propertyTypeConfig[selectedProperty.type].color}`}
                          />
                        );
                      })()}
                    </div>
                    <div>
                      <DialogTitle className="text-2xl">
                        {selectedProperty.name}
                      </DialogTitle>
                      <Badge
                        className={`${propertyTypeConfig[selectedProperty.type].bgColor} ${propertyTypeConfig[selectedProperty.type].color}`}
                      >
                        {propertyTypeConfig[selectedProperty.type].label}
                      </Badge>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {selectedProperty.address}
                  </div>

                  {/* Rates */}
                  {(selectedProperty.rates.daily > 0 || selectedProperty.rates.weekly > 0 || selectedProperty.rates.monthly > 0) && (
                    <div>
                      <h4 className="font-semibold mb-3">Tarifas Dinâmicas</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {selectedProperty.rates.daily > 0 && (
                          <Card className="bg-blue-500/10 border-blue-500/20">
                            <CardContent className="p-4 text-center">
                              <Calendar className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                              <p className="text-2xl font-bold text-blue-400">
                                R$ {selectedProperty.rates.daily}
                              </p>
                              <p className="text-xs text-muted-foreground">Por Diária</p>
                            </CardContent>
                          </Card>
                        )}
                        {selectedProperty.rates.weekly > 0 && (
                          <Card className="bg-purple-500/10 border-purple-500/20">
                            <CardContent className="p-4 text-center">
                              <CalendarDays className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                              <p className="text-2xl font-bold text-purple-400">
                                R$ {selectedProperty.rates.weekly}
                              </p>
                              <p className="text-xs text-muted-foreground">Por Semana</p>
                            </CardContent>
                          </Card>
                        )}
                        {selectedProperty.rates.monthly > 0 && (
                          <Card className="bg-amber-500/10 border-amber-500/20">
                            <CardContent className="p-4 text-center">
                              <CalendarRange className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                              <p className="text-2xl font-bold text-amber-400">
                                R$ {(selectedProperty.rates.monthly / 1000).toFixed(1)}k
                              </p>
                              <p className="text-xs text-muted-foreground">Por Mês</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Owner Info */}
                  {selectedProperty.owner && (
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Proprietário
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Nome</p>
                          <p className="font-medium">{selectedProperty.owner.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Comissão</p>
                          <p className="font-medium text-emerald-400">
                            {selectedProperty.owner.commission}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedProperty.owner.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Telefone</p>
                          <p className="font-medium">{selectedProperty.owner.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Services */}
                  <div>
                    <h4 className="font-semibold mb-3">Serviços Configurados</h4>
                    <div className="flex gap-3">
                      <Badge className="bg-blue-500/20 text-blue-400 gap-1">
                        <Brush className="h-3 w-3" />
                        Limpeza{" "}
                        {selectedProperty.services.cleaning === "per-stay"
                          ? "por Estadia"
                          : selectedProperty.services.cleaning}
                      </Badge>
                      {selectedProperty.services.coworking && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 gap-1">
                          <Coffee className="h-3 w-3" />
                          Coworking
                        </Badge>
                      )}
                      {selectedProperty.services.rooftop && (
                        <Badge className="bg-purple-500/20 text-purple-400 gap-1">
                          <Building className="h-3 w-3" />
                          Rooftop
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPropertyModalOpen(false)}>
                    Fechar
                  </Button>
                  <Button onClick={() => {
                    setIsPropertyModalOpen(false);
                    setIsEditPropertyModalOpen(true);
                  }}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Unified Property Modal - New Property */}
        <PropertyModal
          open={isNewPropertyModalOpen}
          onOpenChange={setIsNewPropertyModalOpen}
          property={null}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
          }}
        />

        {/* Cleaning Service Modal */}
        <CleaningServiceModal
          open={isCleaningModalOpen}
          onOpenChange={setIsCleaningModalOpen}
          property={selectedCleaningProperty}
        />

        {/* Owner Financial Report Modal */}
        <OwnerFinancialReportModal
          open={isFinancialReportModalOpen}
          onOpenChange={setIsFinancialReportModalOpen}
          owner={selectedOwnerProperty?.owner || null}
          propertyName={selectedOwnerProperty?.name || ""}
        />

        {/* Unified Property Modal - Edit Property */}
        <PropertyModal
          open={isEditPropertyModalOpen}
          onOpenChange={setIsEditPropertyModalOpen}
          property={selectedProperty}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
          }}
        />

        {/* New Contract Modal */}
        <Dialog open={isContractModalOpen} onOpenChange={setIsContractModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Contrato de Long Stay</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Propriedade</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="">Selecione uma propriedade</option>
                  {mockProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Hóspede</Label>
                <Input placeholder="Nome do hóspede" />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Estadia</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(stayTypeConfig).map(([type, config]) => (
                    <Button key={type} variant="outline" className="justify-start gap-2">
                      <config.icon className={`h-4 w-4 ${config.color}`} />
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Valor Total do Contrato</Label>
                <Input type="number" placeholder="R$ 0,00" />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsContractModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  toast.success("Contrato criado com sucesso!");
                  setIsContractModalOpen(false);
                }}
              >
                Criar Contrato
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
