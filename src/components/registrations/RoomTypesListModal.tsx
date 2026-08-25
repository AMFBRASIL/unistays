import { useState, useEffect } from "react";
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
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ListFilter, LayoutGrid } from "lucide-react";
import {
  BedDouble,
  Users,
  Maximize,
  Wifi,
  Tv,
  AirVent,
  Coffee,
  Bath,
  Car,
  UtensilsCrossed,
  Dumbbell,
  Waves,
  Mountain,
  Plus,
  Search,
  Edit,
  Trash2,
  Hotel,
  Building,
  Home,
  Palmtree,
  DollarSign,
  UserCheck,
  Eye,
  MoreVertical,
  Copy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoomTypeModal } from "./RoomTypeModal";
import { RoomsByTypeModal } from "./RoomsByTypeModal";

interface RoomTypesListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  tv: Tv,
  ac: AirVent,
  coffee: Coffee,
  bath: Bath,
  parking: Car,
  breakfast: UtensilsCrossed,
  gym: Dumbbell,
  pool: Waves,
  view: Mountain,
};

const propertyTypeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  hotel: { icon: Hotel, label: "Hotel", color: "from-blue-500 to-blue-600" },
  apart: { icon: Building, label: "Apart-Hotel", color: "from-violet-500 to-violet-600" },
  "apart-hotel": { icon: Building, label: "Apart-Hotel", color: "from-violet-500 to-violet-600" },
  loft: { icon: Home, label: "Loft", color: "from-emerald-500 to-emerald-600" },
  temporada: { icon: Palmtree, label: "Temporada", color: "from-amber-500 to-amber-600" },
  hostel: { icon: Building, label: "Hostel", color: "from-slate-500 to-slate-600" },
  resort: { icon: Palmtree, label: "Resort", color: "from-cyan-500 to-cyan-600" },
};

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400";

export interface RoomTypeDisplay {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  propertyId?: number | null;
  propertyName?: string | null;
  propertyType: string;
  pricingModel: string;
  maxGuests: number;
  maxAdults?: number;
  maxChildren?: number;
  size: number;
  basePrice: number;
  amenities: string[];
  isActive: boolean;
  roomCount: number;
  image: string;
}

function mapApiRoomTypeToDisplay(rt: Record<string, unknown>): RoomTypeDisplay {
  const amenities = (rt.amenities as Array<{ icon?: string; code?: string }>) ?? [];
  const amenityCodes = amenities.map((a) => (a?.icon || a?.code || "") as string).filter(Boolean);
  const images = (rt.images as string[] | null) ?? null;
  return {
    id: Number(rt.id),
    name: String(rt.name ?? ""),
    code: String(rt.code ?? ""),
    description: rt.description != null ? String(rt.description) : null,
    propertyId: rt.propertyId != null ? Number(rt.propertyId) : null,
    propertyName: rt.propertyName != null ? String(rt.propertyName) : null,
    propertyType: String(rt.propertyType ?? "hotel"),
    pricingModel: String(rt.pricingStyle ?? "per_unit"),
    maxGuests: Number(rt.maxGuests ?? 2),
    maxAdults: Number(rt.maxAdults ?? 2),
    maxChildren: Number(rt.maxChildren ?? 0),
    size: Number(rt.sizeM2 ?? 0),
    basePrice: Number(rt.basePrice ?? 0),
    amenities: amenityCodes,
    isActive: (rt.status ?? "active") === "active",
    roomCount: 0,
    image: Array.isArray(images) && images[0] ? images[0] : PLACEHOLDER_IMAGE,
  };
}

export function RoomTypesListModal({ open, onOpenChange }: RoomTypesListModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);
  const [newRoomTypeModalOpen, setNewRoomTypeModalOpen] = useState(false);
  const [editingRoomTypeId, setEditingRoomTypeId] = useState<number | null>(null);
  const [roomsByTypeModalOpen, setRoomsByTypeModalOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomTypeDisplay | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomTypeDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRoomTypes = async () => {
    try {
      setIsLoading(true);
      const res = await api.getRoomTypes();
      if (res.success && res.data?.roomTypes) {
        const list = Array.isArray(res.data.roomTypes) ? res.data.roomTypes : [];
        setRoomTypes(list.map((rt: Record<string, unknown>) => mapApiRoomTypeToDisplay(rt)));
      } else {
        setRoomTypes([]);
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar tipos de quarto");
      setRoomTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadRoomTypes();
  }, [open]);

  const handleViewRooms = (roomType: RoomTypeDisplay) => {
    setSelectedRoomType(roomType);
    setRoomsByTypeModalOpen(true);
  };

  const handleEditRoomType = (roomType: RoomTypeDisplay) => {
    setEditingRoomTypeId(roomType.id);
    setNewRoomTypeModalOpen(true);
  };

  const handleOpenNewRoomType = () => {
    setEditingRoomTypeId(null);
    setNewRoomTypeModalOpen(true);
  };

  const filteredRoomTypes = roomTypes.filter((type) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      type.name.toLowerCase().includes(q) ||
      type.code.toLowerCase().includes(q) ||
      (type.description ?? "").toLowerCase().includes(q) ||
      (type.propertyName ?? "").toLowerCase().includes(q);
    const matchesPropertyType = !selectedPropertyType || type.propertyType === selectedPropertyType;
    return matchesSearch && matchesPropertyType;
  });

  const stats = {
    total: roomTypes.length,
    active: roomTypes.filter((t) => t.isActive).length,
    totalRooms: roomTypes.reduce((sum, t) => sum + t.roomCount, 0),
  };
  const hasFilters = !!searchQuery.trim() || selectedPropertyType !== null;
  const progressValue = (() => {
    let score = 34; // overview pronto
    if (hasFilters) score += 33;
    if (filteredRoomTypes.length > 0) score += 33;
    return Math.min(score, 100);
  })();
  const steps = [
    { key: "overview", title: "Visão Geral", subtitle: "KPIs e contexto", done: true, icon: BedDouble },
    { key: "filters", title: "Filtros Inteligentes", subtitle: "Busca e segmentação", done: hasFilters, icon: ListFilter },
    { key: "catalog", title: "Catálogo", subtitle: "Tipos encontrados", done: filteredRoomTypes.length > 0, icon: LayoutGrid },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl h-[90vh] overflow-hidden bg-background border-border p-0">
          <div className="h-full grid md:grid-cols-[300px_1fr]">
            <aside className="hidden md:flex flex-col border-r border-border/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
              <div className="relative p-5 border-b border-white/10">
                <div
                  className="absolute inset-0 opacity-25 bg-cover bg-center"
                  style={{ backgroundImage: `url(${PLACEHOLDER_IMAGE})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/70 to-slate-950/80" />
                <div className="relative">
                  <p className="text-xs uppercase tracking-wider text-cyan-200/90">Room Types Experience</p>
                  <h3 className="mt-1 text-lg font-semibold">Fluxo inteligente</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Navegação em etapas com progresso e contexto visual.
                  </p>
                </div>
              </div>

              <div className="p-5 border-b border-white/10">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                  <span>Progresso do fluxo</span>
                  <span>{progressValue}%</span>
                </div>
                <Progress
                  value={progressValue}
                  className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-cyan-400 [&>div]:to-blue-500"
                />
              </div>

              <div className="p-4 space-y-2">
                {steps.map((step, index) => (
                  <div
                    key={step.key}
                    className={`rounded-xl border px-3 py-3 transition-colors ${
                      step.done
                        ? "border-cyan-400/30 bg-cyan-500/10"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          step.done ? "bg-cyan-400/20 text-cyan-300" : "bg-white/10 text-slate-300"
                        }`}
                      >
                        {step.done ? <CheckCircle2 className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">{`${index + 1}. ${step.title}`}</p>
                        <p className="text-xs text-slate-300 truncate">{step.subtitle}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <div className="flex flex-col min-w-0">
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                      <BedDouble className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <DialogTitle className="text-2xl font-bold text-foreground">
                        Tipos de Quarto
                      </DialogTitle>
                      <p className="text-muted-foreground mt-1">
                        Gerencie as categorias de acomodação do seu estabelecimento
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleOpenNewRoomType}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Tipo de Quarto
                  </Button>
                </div>
                <div className="md:hidden pt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Progresso do fluxo</span>
                    <span>{progressValue}%</span>
                  </div>
                  <Progress value={progressValue} className="h-2" />
                </div>
              </DialogHeader>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 pb-4 flex-shrink-0">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <BedDouble className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                      <p className="text-sm text-muted-foreground">Tipos Cadastrados</p>
                    </div>
                  </div>
                </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-green-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Eye className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                    <p className="text-sm text-muted-foreground">Tipos Ativos</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-violet-500/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <Hotel className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalRooms}</p>
                    <p className="text-sm text-muted-foreground">Quartos Totais</p>
                  </div>
                </div>
              </div>
            </div>

              {/* Filters */}
              <div className="flex items-center gap-4 px-6 pb-4 flex-shrink-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, código ou descrição..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background border-border"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedPropertyType === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPropertyType(null)}
                    className={selectedPropertyType === null ? "bg-primary" : ""}
                  >
                    Todos
                  </Button>
                  {Object.entries(propertyTypeConfig).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={selectedPropertyType === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPropertyType(key)}
                      className={selectedPropertyType === key ? "bg-primary" : ""}
                    >
                      <config.icon className="h-4 w-4 mr-1" />
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Room Types Grid */}
              <div className="flex-1 min-h-0 overflow-hidden px-6 pb-6">
                <ScrollArea className="h-full">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
                      <p className="text-muted-foreground">Carregando tipos de quarto...</p>
                    </div>
                  ) : (
                  <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 pr-4">
                  {filteredRoomTypes.map((roomType) => {
                    const propConfig = propertyTypeConfig[roomType.propertyType];
                    const PropIcon = propConfig?.icon || Hotel;

                    return (
                      <div
                        key={roomType.id}
                        className={`group rounded-xl border overflow-hidden transition-all hover:shadow-lg ${
                          roomType.isActive 
                            ? "border-border bg-card" 
                            : "border-border/50 bg-muted/30 opacity-75"
                        }`}
                      >
                        {/* Image */}
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={roomType.image}
                            alt={roomType.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          {/* Top badges */}
                          <div className="absolute top-3 left-3 flex gap-2">
                            <Badge className={`bg-gradient-to-r ${propConfig?.color || "from-gray-500 to-gray-600"} text-white border-0`}>
                              <PropIcon className="h-3 w-3 mr-1" />
                              {propConfig?.label}
                            </Badge>
                            {roomType.pricingModel === "per_person" ? (
                              <Badge className="bg-blue-500/90 text-white border-0">
                                <UserCheck className="h-3 w-3 mr-1" />
                                Por Pessoa
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-500/90 text-white border-0">
                                <DollarSign className="h-3 w-3 mr-1" />
                                Por Unidade
                              </Badge>
                            )}
                          </div>

                          {/* Status badge */}
                          <div className="absolute top-3 right-3">
                            <Badge className={roomType.isActive ? "bg-emerald-500 text-white border-0" : "bg-gray-500 text-white border-0"}>
                              {roomType.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>

                          {/* Bottom info */}
                          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end gap-2">
                            <div className="min-w-0">
                              <p className="text-white font-bold text-lg leading-tight">{roomType.name}</p>
                              <p className="text-white/70 text-sm">Código: {roomType.code}</p>
                              <p className="text-white/90 text-xs mt-1 flex items-center gap-1 truncate">
                                <Building className="h-3 w-3 shrink-0 opacity-90" />
                                <span className="truncate">
                                  {roomType.propertyName || (roomType.propertyId ? `Propriedade #${roomType.propertyId}` : "Propriedade não informada")}
                                </span>
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-white/70 text-xs">A partir de</p>
                              <p className="text-white font-bold text-xl">
                                {roomType.basePrice > 0 ? `R$ ${roomType.basePrice.toLocaleString("pt-BR")}` : "—"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {roomType.description}
                          </p>

                          {/* Details */}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>Até {roomType.maxGuests}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Maximize className="h-4 w-4" />
                              <span>{roomType.size > 0 ? `${roomType.size}m²` : "—"}</span>
                            </div>
                            {roomType.roomCount > 0 && (
                              <div className="flex items-center gap-1">
                                <BedDouble className="h-4 w-4" />
                                <span>{roomType.roomCount} quartos</span>
                              </div>
                            )}
                          </div>

                          {/* Amenities */}
                          <div className="flex flex-wrap gap-1">
                            {(roomType.amenities || []).slice(0, 5).map((amenity) => {
                              const AmenityIcon = amenityIcons[amenity];
                              return AmenityIcon ? (
                                <div
                                  key={amenity}
                                  className="p-1.5 rounded-lg bg-muted"
                                  title={amenity}
                                >
                                  <AmenityIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                              ) : null;
                            })}
                            {(roomType.amenities?.length ?? 0) > 5 && (
                              <div className="p-1.5 rounded-lg bg-muted text-xs text-muted-foreground">
                                +{(roomType.amenities?.length ?? 0) - 5}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditRoomType(roomType)}>
                                <Edit className="h-3.5 w-3.5 mr-1" />
                                Editar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewRooms(roomType)}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                Ver Quartos
                              </Button>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredRoomTypes.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BedDouble className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium text-foreground">Nenhum tipo encontrado</h3>
                    <p className="text-muted-foreground mt-1">
                      {roomTypes.length === 0
                        ? "Cadastre o primeiro tipo de quarto"
                        : "Tente ajustar os filtros ou cadastre um novo tipo de quarto"}
                    </p>
                    <Button 
                      onClick={handleOpenNewRoomType}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Tipo de Quarto
                    </Button>
                  </div>
                )}
                  </>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New / Edit Room Type Modal */}
      <RoomTypeModal 
        open={newRoomTypeModalOpen}
        editId={editingRoomTypeId}
        onOpenChange={(isOpen) => {
          setNewRoomTypeModalOpen(isOpen);
          if (!isOpen) {
            setEditingRoomTypeId(null);
            loadRoomTypes();
          }
        }} 
      />

      {/* Rooms by Type Modal */}
      <RoomsByTypeModal 
        open={roomsByTypeModalOpen} 
        onOpenChange={setRoomsByTypeModalOpen}
        roomType={selectedRoomType}
      />
    </>
  );
}