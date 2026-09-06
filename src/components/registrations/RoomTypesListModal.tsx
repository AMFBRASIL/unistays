import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";
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
  Loader2,
  X,
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

/** Chave canônica → UI (evita Apart-Hotel duplicado) */
const propertyTypeConfig: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; label: string; color: string }
> = {
  hotel: { icon: Hotel, label: "Hotel", color: "from-blue-500 to-blue-600" },
  "apart-hotel": { icon: Building, label: "Apart-Hotel", color: "from-violet-500 to-violet-600" },
  loft: { icon: Home, label: "Loft", color: "from-emerald-500 to-emerald-600" },
  temporada: { icon: Palmtree, label: "Temporada", color: "from-amber-500 to-amber-600" },
  hostel: { icon: Building, label: "Hostel", color: "from-slate-500 to-slate-600" },
  resort: { icon: Palmtree, label: "Resort", color: "from-cyan-500 to-cyan-600" },
};

function normalizePropertyType(raw: string): string {
  const t = (raw || "hotel").toLowerCase().trim();
  if (t === "apart" || t === "apart_hotel" || t === "aparthotel") return "apart-hotel";
  return propertyTypeConfig[t] ? t : "hotel";
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400";

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
  const amenityCodes = amenities
    .map((a) => (a?.icon || a?.code || "") as string)
    .filter(Boolean);
  const images = (rt.images as string[] | null) ?? null;
  return {
    id: Number(rt.id),
    name: String(rt.name ?? ""),
    code: String(rt.code ?? ""),
    description: rt.description != null ? String(rt.description) : null,
    propertyId: rt.propertyId != null ? Number(rt.propertyId) : null,
    propertyName: rt.propertyName != null ? String(rt.propertyName) : null,
    propertyType: normalizePropertyType(String(rt.propertyType ?? "hotel")),
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
    if (open) {
      setSearchQuery("");
      setSelectedPropertyType(null);
      void loadRoomTypes();
    }
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

  const filteredRoomTypes = useMemo(
    () =>
      roomTypes.filter((type) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          type.name.toLowerCase().includes(q) ||
          type.code.toLowerCase().includes(q) ||
          (type.description ?? "").toLowerCase().includes(q) ||
          (type.propertyName ?? "").toLowerCase().includes(q);
        const matchesPropertyType =
          !selectedPropertyType || type.propertyType === selectedPropertyType;
        return matchesSearch && matchesPropertyType;
      }),
    [roomTypes, searchQuery, selectedPropertyType],
  );

  const stats = useMemo(
    () => ({
      total: roomTypes.length,
      active: roomTypes.filter((t) => t.isActive).length,
      byType: Object.keys(propertyTypeConfig).reduce(
        (acc, key) => {
          acc[key] = roomTypes.filter((t) => t.propertyType === key).length;
          return acc;
        },
        {} as Record<string, number>,
      ),
    }),
    [roomTypes],
  );

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedPropertyType(null);
  };

  const hasFilters = !!searchQuery.trim() || selectedPropertyType !== null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col sm:rounded-xl">
          {/* Header fixo */}
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0 space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 shrink-0">
                  <BedDouble className="h-6 w-6 text-blue-600" />
                </div>
                <div className="min-w-0 text-left">
                  <DialogTitle className="text-xl font-semibold text-foreground">
                    Tipos de Quarto
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Categorias de acomodação · {stats.total} cadastrado
                    {stats.total !== 1 ? "s" : ""}
                    {stats.active !== stats.total ? ` · ${stats.active} ativo${stats.active !== 1 ? "s" : ""}` : ""}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleOpenNewRoomType}
                className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo tipo
              </Button>
            </div>
          </DialogHeader>

          {/* KPIs + busca/filtros (fixos) */}
          <div className="shrink-0 border-b border-border bg-muted/20">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-5 pt-4">
              <div className="rounded-lg border border-border bg-background px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-semibold tabular-nums">{stats.total}</p>
              </div>
              <div className="rounded-lg border border-border bg-background px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Ativos</p>
                <p className="text-xl font-semibold tabular-nums text-emerald-600">{stats.active}</p>
              </div>
              <div className="rounded-lg border border-border bg-background px-3 py-2.5 col-span-2 sm:col-span-1">
                <p className="text-xs text-muted-foreground">Exibindo agora</p>
                <p className="text-xl font-semibold tabular-nums">{filteredRoomTypes.length}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 px-5 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, código, propriedade…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>

              <div className="flex items-center gap-2 min-w-0">
                <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1 min-w-0 scrollbar-thin">
                  <Button
                    variant={selectedPropertyType === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPropertyType(null)}
                    className="shrink-0 h-8"
                  >
                    Todos
                    <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                      {stats.total}
                    </Badge>
                  </Button>
                  {Object.entries(propertyTypeConfig).map(([key, config]) => {
                    const count = stats.byType[key] || 0;
                    if (count === 0 && selectedPropertyType !== key) return null;
                    return (
                      <Button
                        key={key}
                        variant={selectedPropertyType === key ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          setSelectedPropertyType((prev) => (prev === key ? null : key))
                        }
                        className="shrink-0 h-8"
                      >
                        <config.icon className="h-3.5 w-3.5 mr-1" />
                        {config.label}
                        <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                          {count}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
                {hasFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="shrink-0 h-8 text-muted-foreground"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Catálogo com scroll */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-9 w-9 animate-spin text-blue-500 mb-3" />
                <p className="text-sm text-muted-foreground">Carregando tipos de quarto…</p>
              </div>
            ) : filteredRoomTypes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BedDouble className="h-14 w-14 text-muted-foreground/30 mb-3" />
                <h3 className="text-base font-medium">Nenhum tipo encontrado</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  {roomTypes.length === 0
                    ? "Cadastre o primeiro tipo de quarto para começar."
                    : "Ajuste a busca ou os filtros, ou cadastre um novo tipo."}
                </p>
                <div className="flex gap-2 mt-4">
                  {hasFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Limpar filtros
                    </Button>
                  )}
                  <Button onClick={handleOpenNewRoomType}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo tipo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-2">
                {filteredRoomTypes.map((roomType) => {
                  const propConfig = propertyTypeConfig[roomType.propertyType];
                  const PropIcon = propConfig?.icon || Hotel;

                  return (
                    <div
                      key={roomType.id}
                      className={`group rounded-xl border overflow-hidden bg-card transition-shadow hover:shadow-md ${
                        roomType.isActive ? "border-border" : "border-border/50 opacity-80"
                      }`}
                    >
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={roomType.image}
                          alt={roomType.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[75%]">
                          <Badge
                            className={`bg-gradient-to-r ${propConfig?.color || "from-gray-500 to-gray-600"} text-white border-0 text-[10px]`}
                          >
                            <PropIcon className="h-3 w-3 mr-0.5" />
                            {propConfig?.label}
                          </Badge>
                          {roomType.pricingModel === "per_person" ? (
                            <Badge className="bg-blue-500/90 text-white border-0 text-[10px]">
                              <UserCheck className="h-3 w-3 mr-0.5" />
                              Por pessoa
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/90 text-white border-0 text-[10px]">
                              <DollarSign className="h-3 w-3 mr-0.5" />
                              Por unidade
                            </Badge>
                          )}
                        </div>

                        <div className="absolute top-2 right-2">
                          <Badge
                            className={
                              roomType.isActive
                                ? "bg-emerald-500 text-white border-0 text-[10px]"
                                : "bg-gray-500 text-white border-0 text-[10px]"
                            }
                          >
                            {roomType.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>

                        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end gap-2">
                          <div className="min-w-0">
                            <p className="text-white font-semibold text-base leading-tight truncate">
                              {roomType.name}
                            </p>
                            <p className="text-white/75 text-xs truncate">
                              {roomType.code}
                              {roomType.propertyName ? ` · ${roomType.propertyName}` : ""}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-white font-semibold text-sm">
                              {roomType.basePrice > 0
                                ? `R$ ${roomType.basePrice.toLocaleString("pt-BR")}`
                                : "—"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 space-y-2.5">
                        {roomType.description ? (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {roomType.description}
                          </p>
                        ) : null}

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            Até {roomType.maxGuests}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Maximize className="h-3.5 w-3.5" />
                            {roomType.size > 0 ? `${roomType.size} m²` : "—"}
                          </span>
                        </div>

                        {(roomType.amenities?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {(roomType.amenities || []).slice(0, 5).map((amenity) => {
                              const AmenityIcon = amenityIcons[amenity];
                              return AmenityIcon ? (
                                <div
                                  key={amenity}
                                  className="p-1 rounded-md bg-muted"
                                  title={amenity}
                                >
                                  <AmenityIcon className="h-3 w-3 text-muted-foreground" />
                                </div>
                              ) : null;
                            })}
                            {(roomType.amenities?.length ?? 0) > 5 && (
                              <div className="px-1.5 py-1 rounded-md bg-muted text-[10px] text-muted-foreground">
                                +{(roomType.amenities?.length ?? 0) - 5}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                          <div className="flex gap-1.5 min-w-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={() => handleEditRoomType(roomType)}
                            >
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={() => handleViewRooms(roomType)}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              Quartos
                            </Button>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
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
            )}
          </div>
        </DialogContent>
      </Dialog>

      <RoomTypeModal
        open={newRoomTypeModalOpen}
        editId={editingRoomTypeId}
        onOpenChange={(isOpen) => {
          setNewRoomTypeModalOpen(isOpen);
          if (!isOpen) {
            setEditingRoomTypeId(null);
            void loadRoomTypes();
          }
        }}
      />

      <RoomsByTypeModal
        open={roomsByTypeModalOpen}
        onOpenChange={setRoomsByTypeModalOpen}
        roomType={selectedRoomType}
      />
    </>
  );
}
