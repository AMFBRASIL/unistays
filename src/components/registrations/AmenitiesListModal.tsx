import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  ArrowLeft,
  Wifi,
  Tv,
  AirVent,
  Bath,
  Coffee,
  Dumbbell,
  UtensilsCrossed,
  Wine,
  Waves,
  Sparkles,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  BedDouble,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AmenitiesListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  technology: { label: "Tecnologia", icon: Wifi, color: "text-blue-600", bgColor: "from-blue-500 to-cyan-600" },
  comfort: { label: "Conforto", icon: AirVent, color: "text-sky-600", bgColor: "from-sky-500 to-blue-600" },
  bathroom: { label: "Banheiro", icon: Bath, color: "text-teal-600", bgColor: "from-teal-500 to-emerald-600" },
  leisure: { label: "Lazer", icon: Waves, color: "text-violet-600", bgColor: "from-violet-500 to-purple-600" },
  food: { label: "Alimentação", icon: Coffee, color: "text-amber-600", bgColor: "from-amber-500 to-orange-600" },
  fitness: { label: "Fitness", icon: Dumbbell, color: "text-rose-600", bgColor: "from-rose-500 to-pink-600" },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Ativo", color: "bg-emerald-500", icon: CheckCircle },
  inactive: { label: "Inativo", color: "bg-gray-500", icon: XCircle },
};

const mockAmenities = [
  {
    id: "1",
    name: "Wi-Fi de Alta Velocidade",
    category: "technology",
    description: "Internet fibra 500Mbps em todo o quarto",
    icon: "Wifi",
    roomTypes: ["Standard", "Luxo", "Suite", "Master"],
    status: "active",
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400",
  },
  {
    id: "2",
    name: "Smart TV 55\"",
    category: "technology",
    description: "TV LED com Netflix, Prime Video e Chromecast",
    icon: "Tv",
    roomTypes: ["Luxo", "Suite", "Master"],
    status: "active",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400",
  },
  {
    id: "3",
    name: "Ar Condicionado Split",
    category: "comfort",
    description: "Climatização individual com controle remoto",
    icon: "AirVent",
    roomTypes: ["Standard", "Luxo", "Suite", "Master"],
    status: "active",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400",
  },
  {
    id: "4",
    name: "Banheira de Hidromassagem",
    category: "bathroom",
    description: "Banheira com jatos de hidromassagem",
    icon: "Bath",
    roomTypes: ["Suite", "Master"],
    status: "active",
    image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400",
  },
  {
    id: "5",
    name: "Máquina de Café Nespresso",
    category: "food",
    description: "Cafeteira com seleção de cápsulas",
    icon: "Coffee",
    roomTypes: ["Luxo", "Suite", "Master"],
    status: "active",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
  },
  {
    id: "6",
    name: "Acesso à Academia",
    category: "fitness",
    description: "Equipamentos modernos 24h",
    icon: "Dumbbell",
    roomTypes: ["Standard", "Luxo", "Suite", "Master"],
    status: "active",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400",
  },
  {
    id: "7",
    name: "Frigobar Abastecido",
    category: "food",
    description: "Bebidas e snacks inclusos",
    icon: "Wine",
    roomTypes: ["Suite", "Master"],
    status: "active",
    image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400",
  },
  {
    id: "8",
    name: "Acesso à Piscina",
    category: "leisure",
    description: "Piscina aquecida e área de lazer",
    icon: "Waves",
    roomTypes: ["Standard", "Luxo", "Suite", "Master"],
    status: "active",
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400",
  },
];

export function AmenitiesListModal({ open, onOpenChange }: AmenitiesListModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newAmenityModalOpen, setNewAmenityModalOpen] = useState(false);

  const filteredAmenities = mockAmenities.filter((amenity) => {
    const matchesSearch = amenity.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || amenity.category === filterCategory;
    const matchesStatus = filterStatus === "all" || amenity.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: mockAmenities.length,
    active: mockAmenities.filter(a => a.status === "active").length,
    categories: Object.keys(categoryConfig).length,
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col overflow-hidden bg-background border-border">
          <DialogHeader className="pb-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-10 w-10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                  <Wifi className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    Amenidades
                  </DialogTitle>
                  <p className="text-muted-foreground mt-1">
                    Gerencie comodidades dos quartos
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setNewAmenityModalOpen(true)}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Amenidade
              </Button>
            </div>
          </DialogHeader>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 py-4 flex-shrink-0">
            <div className="p-3 rounded-xl border border-border bg-card">
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Ativas</p>
            </div>
            <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5">
              <p className="text-xl font-bold text-blue-600">{stats.categories}</p>
              <p className="text-xs text-muted-foreground">Categorias</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 pb-4 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar amenidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="inactive">Inativas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amenities Grid */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 pr-4">
                {filteredAmenities.map((amenity) => {
                  const categoryInfo = categoryConfig[amenity.category];
                  const statusInfo = statusConfig[amenity.status];
                  const CategoryIcon = categoryInfo?.icon || Sparkles;

                  return (
                    <div
                      key={amenity.id}
                      className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
                    >
                      {/* Image Header */}
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={amenity.image}
                          alt={amenity.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          <Badge className={`${statusInfo?.color} text-white border-0`}>
                            {statusInfo?.label}
                          </Badge>
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-2 left-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryInfo?.bgColor} shadow-lg`}>
                            <CategoryIcon className="h-4 w-4 text-white" />
                          </div>
                        </div>

                        {/* Amenity Name */}
                        <div className="absolute bottom-2 left-2 right-12">
                          <h3 className="font-bold text-white text-lg truncate drop-shadow-lg">
                            {amenity.name}
                          </h3>
                        </div>

                        {/* Menu */}
                        <div className="absolute bottom-2 right-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {amenity.description}
                        </p>

                        {/* Category */}
                        <Badge variant="outline" className="text-xs">
                          {categoryInfo?.label}
                        </Badge>

                        {/* Room Types */}
                        <div className="pt-2 border-t border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Disponível em:</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {amenity.roomTypes.map((type, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredAmenities.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Wifi className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-foreground">Nenhuma amenidade encontrada</h3>
                  <p className="text-muted-foreground mt-1">
                    Tente ajustar os filtros ou cadastre uma nova amenidade
                  </p>
                  <Button 
                    onClick={() => setNewAmenityModalOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Amenidade
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* TODO: Create AmenityModal component */}
      <Dialog open={newAmenityModalOpen} onOpenChange={setNewAmenityModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Amenidade</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Modal de cadastro de amenidade em desenvolvimento.</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
