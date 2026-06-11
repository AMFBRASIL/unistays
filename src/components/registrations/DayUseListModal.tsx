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
  CalendarCheck,
  Clock,
  Users,
  Waves,
  Dumbbell,
  Utensils,
  Sparkles,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Timer,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DayUseListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  pool: { label: "Piscina", icon: Waves, color: "text-cyan-600", bgColor: "from-cyan-500 to-blue-600" },
  spa: { label: "Spa", icon: Sparkles, color: "text-violet-600", bgColor: "from-violet-500 to-purple-600" },
  gym: { label: "Academia", icon: Dumbbell, color: "text-rose-600", bgColor: "from-rose-500 to-pink-600" },
  restaurant: { label: "Restaurante", icon: Utensils, color: "text-amber-600", bgColor: "from-amber-500 to-orange-600" },
  full: { label: "Completo", icon: CalendarCheck, color: "text-emerald-600", bgColor: "from-emerald-500 to-teal-600" },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Ativo", color: "bg-emerald-500", icon: CheckCircle },
  inactive: { label: "Inativo", color: "bg-gray-500", icon: XCircle },
};

const mockDayUsePackages = [
  {
    id: "1",
    name: "Day Use Piscina",
    type: "pool",
    description: "Acesso à piscina, espreguiçadeiras e bar da piscina",
    price: 120,
    duration: "10:00 - 18:00",
    maxGuests: 50,
    currentBookings: 23,
    inclusions: ["Piscina", "Toalha", "Espreguiçadeira", "Bebida de boas-vindas"],
    status: "active",
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400",
  },
  {
    id: "2",
    name: "Day Spa Premium",
    type: "spa",
    description: "Experiência completa de spa com massagem e tratamentos",
    price: 350,
    duration: "09:00 - 17:00",
    maxGuests: 20,
    currentBookings: 8,
    inclusions: ["Massagem 60min", "Sauna", "Piscina Térmica", "Almoço Light"],
    status: "active",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400",
  },
  {
    id: "3",
    name: "Fitness Day",
    type: "gym",
    description: "Acesso à academia e aulas em grupo",
    price: 80,
    duration: "06:00 - 22:00",
    maxGuests: 30,
    currentBookings: 12,
    inclusions: ["Academia", "Aulas", "Vestiário", "Toalha"],
    status: "active",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400",
  },
  {
    id: "4",
    name: "Almoço Executivo",
    type: "restaurant",
    description: "Almoço buffet no restaurante principal",
    price: 95,
    duration: "12:00 - 15:00",
    maxGuests: 80,
    currentBookings: 45,
    inclusions: ["Buffet Completo", "Sobremesa", "Bebida", "Café"],
    status: "active",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
  },
  {
    id: "5",
    name: "Day Use Completo",
    type: "full",
    description: "Acesso total a todas as instalações do hotel",
    price: 280,
    duration: "08:00 - 20:00",
    maxGuests: 40,
    currentBookings: 15,
    inclusions: ["Piscina", "Academia", "Spa", "Almoço", "Lanche"],
    status: "active",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
  },
  {
    id: "6",
    name: "Sunset Pool Party",
    type: "pool",
    description: "Evento especial na piscina ao pôr do sol",
    price: 180,
    duration: "16:00 - 22:00",
    maxGuests: 60,
    currentBookings: 0,
    inclusions: ["Piscina", "DJ", "Open Bar", "Finger Foods"],
    status: "inactive",
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400",
  },
];

export function DayUseListModal({ open, onOpenChange }: DayUseListModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newDayUseModalOpen, setNewDayUseModalOpen] = useState(false);

  const filteredPackages = mockDayUsePackages.filter((pkg) => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || pkg.type === filterType;
    const matchesStatus = filterStatus === "all" || pkg.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: mockDayUsePackages.length,
    active: mockDayUsePackages.filter(p => p.status === "active").length,
    totalBookings: mockDayUsePackages.reduce((acc, p) => acc + p.currentBookings, 0),
    totalCapacity: mockDayUsePackages.reduce((acc, p) => acc + p.maxGuests, 0),
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
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
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center">
                  <CalendarCheck className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    Parametrização DayUse
                  </DialogTitle>
                  <p className="text-muted-foreground mt-1">
                    Configure pacotes de uso diário
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setNewDayUseModalOpen(true)}
                className="bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Pacote
              </Button>
            </div>
          </DialogHeader>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-3 py-4 flex-shrink-0">
            <div className="p-3 rounded-xl border border-border bg-card">
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Pacotes</p>
            </div>
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>
            <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5">
              <p className="text-xl font-bold text-blue-600">{stats.totalBookings}</p>
              <p className="text-xs text-muted-foreground">Reservas Hoje</p>
            </div>
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-amber-600" />
                <p className="text-xl font-bold text-amber-600">{stats.totalCapacity}</p>
              </div>
              <p className="text-xs text-muted-foreground">Capacidade</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 pb-4 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pacote..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Tipos</SelectItem>
                {Object.entries(typeConfig).map(([key, config]) => (
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
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Packages Grid */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 pr-4">
                {filteredPackages.map((pkg) => {
                  const typeInfo = typeConfig[pkg.type];
                  const statusInfo = statusConfig[pkg.status];
                  const TypeIcon = typeInfo?.icon || CalendarCheck;
                  const occupancyPercent = Math.round((pkg.currentBookings / pkg.maxGuests) * 100);

                  return (
                    <div
                      key={pkg.id}
                      className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
                    >
                      {/* Image Header */}
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          <Badge className={`${statusInfo?.color} text-white border-0`}>
                            {statusInfo?.label}
                          </Badge>
                        </div>

                        {/* Type Badge */}
                        <div className="absolute top-2 left-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${typeInfo?.bgColor} shadow-lg`}>
                            <TypeIcon className="h-4 w-4 text-white" />
                          </div>
                        </div>

                        {/* Package Name */}
                        <div className="absolute bottom-2 left-2 right-12">
                          <h3 className="font-bold text-white text-lg truncate drop-shadow-lg">
                            {pkg.name}
                          </h3>
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <Timer className="h-3.5 w-3.5" />
                            <span>{pkg.duration}</span>
                          </div>
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
                          {pkg.description}
                        </p>

                        {/* Occupancy Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Ocupação Hoje</span>
                            <span className="font-medium">{pkg.currentBookings}/{pkg.maxGuests}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                occupancyPercent > 80 ? 'bg-red-500' : 
                                occupancyPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${occupancyPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Inclusions */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {pkg.inclusions.slice(0, 3).map((item, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                          {pkg.inclusions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{pkg.inclusions.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="text-sm text-muted-foreground">Por pessoa</span>
                          <p className="text-2xl font-bold text-foreground">
                            {formatCurrency(pkg.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredPackages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarCheck className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-foreground">Nenhum pacote encontrado</h3>
                  <p className="text-muted-foreground mt-1">
                    Tente ajustar os filtros ou cadastre um novo pacote
                  </p>
                  <Button 
                    onClick={() => setNewDayUseModalOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Pacote
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* TODO: Create DayUseModal component */}
      <Dialog open={newDayUseModalOpen} onOpenChange={setNewDayUseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Pacote DayUse</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Modal de cadastro de pacote DayUse em desenvolvimento.</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
