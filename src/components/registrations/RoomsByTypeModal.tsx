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
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  BedDouble,
  Users,
  Maximize,
  Plus,
  Search,
  Edit,
  ArrowLeft,
  DoorOpen,
  Building2,
  Eye,
  Sparkles,
  AlertTriangle,
  Wrench,
  CheckCircle,
  XCircle,
  MoreVertical,
  Trash2,
  Copy,
  MapPin,
  Wifi,
  Tv,
  AirVent,
  Coffee,
  Bath,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UnitModal } from "@/components/rooms/UnitModal";

interface RoomType {
  id: number | string;
  name: string;
  code: string;
  maxGuests: number;
  size?: number;
  basePrice: number;
  image?: string;
}

interface RoomsByTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomType: RoomType | null;
}

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  tv: Tv,
  ac: AirVent,
  coffee: Coffee,
  bath: Bath,
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  available: { label: "Disponível", color: "bg-emerald-500", icon: CheckCircle },
  occupied: { label: "Ocupado", color: "bg-blue-500", icon: Users },
  cleaning: { label: "Limpeza", color: "bg-amber-500", icon: Sparkles },
  maintenance: { label: "Manutenção", color: "bg-red-500", icon: Wrench },
  blocked: { label: "Bloqueado", color: "bg-gray-500", icon: XCircle },
};

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400";

interface UnitDisplay {
  id: number;
  number: string;
  floor: number;
  position: string;
  status: string;
  view: string;
  amenities: string[];
  lastCleaned: string;
  currentGuest?: string;
  checkOut?: string;
  image: string;
  name?: string;
}

function mapApiUnitToDisplay(u: Record<string, unknown>): UnitDisplay {
  const images = (u.images as string[] | null) ?? null;
  const imgUrl = Array.isArray(images) && images[0] ? images[0] : PLACEHOLDER_IMAGE;
  return {
    id: Number(u.id),
    number: String(u.number ?? ""),
    floor: Number(u.floor ?? 0),
    position: String(u.position ?? "—"),
    status: String(u.status ?? "available"),
    view: String(u.view ?? "—"),
    amenities: Array.isArray(u.amenities) ? (u.amenities as string[]) : [],
    lastCleaned: "—",
    image: imgUrl,
    name: u.name != null ? String(u.name) : undefined,
  };
}

export function RoomsByTypeModal({ open, onOpenChange, roomType }: RoomsByTypeModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [newUnitModalOpen, setNewUnitModalOpen] = useState(false);
  const [units, setUnits] = useState<UnitDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && roomType) {
      const roomTypeIdNum = typeof roomType.id === "number" ? roomType.id : parseInt(String(roomType.id), 10);
      if (isNaN(roomTypeIdNum)) {
        setUnits([]);
        return;
      }
      (async () => {
        try {
          setIsLoading(true);
          const res = await api.getUnits(undefined, undefined, roomTypeIdNum);
          if (res.success && res.data?.units) {
            const list = Array.isArray(res.data.units) ? res.data.units : [];
            setUnits(list.map((u: Record<string, unknown>) => mapApiUnitToDisplay(u)));
          } else {
            setUnits([]);
          }
        } catch (e) {
          console.error(e);
          toast.error("Erro ao carregar quartos");
          setUnits([]);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [open, roomType?.id]);

  if (!roomType) return null;

  const filteredRooms = units.filter((room) => {
    const matchesSearch = room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (room.view ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (room.position ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (room.name ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || room.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: units.length,
    available: units.filter(r => r.status === "available").length,
    occupied: units.filter(r => r.status === "occupied").length,
    cleaning: units.filter(r => r.status === "cleaning").length,
    maintenance: units.filter(r => r.status === "maintenance").length,
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] max-h-[90vh] flex flex-col overflow-hidden bg-background border-border">
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
              <div className="h-16 w-16 rounded-xl overflow-hidden border-2 border-primary/20">
                <img 
                  src={roomType.image ?? ""} 
                  alt={roomType.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  Quartos - {roomType.name}
                </DialogTitle>
                <p className="text-muted-foreground mt-1">
                  Código: {roomType.code} • Até {roomType.maxGuests} hóspedes • {roomType.size != null ? `${roomType.size}m²` : ""}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setNewUnitModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Quarto
            </Button>
          </div>
        </DialogHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-3 py-4 flex-shrink-0">
          <button
            onClick={() => setSelectedStatus(null)}
            className={`p-3 rounded-xl border transition-all ${
              selectedStatus === null 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            }`}
          >
            <p className="text-xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </button>
          <button
            onClick={() => setSelectedStatus("available")}
            className={`p-3 rounded-xl border transition-all ${
              selectedStatus === "available" 
                ? "border-emerald-500 bg-emerald-500/10" 
                : "border-border hover:border-emerald-500/50"
            }`}
          >
            <p className="text-xl font-bold text-emerald-600">{stats.available}</p>
            <p className="text-xs text-muted-foreground">Disponíveis</p>
          </button>
          <button
            onClick={() => setSelectedStatus("occupied")}
            className={`p-3 rounded-xl border transition-all ${
              selectedStatus === "occupied" 
                ? "border-blue-500 bg-blue-500/10" 
                : "border-border hover:border-blue-500/50"
            }`}
          >
            <p className="text-xl font-bold text-blue-600">{stats.occupied}</p>
            <p className="text-xs text-muted-foreground">Ocupados</p>
          </button>
          <button
            onClick={() => setSelectedStatus("cleaning")}
            className={`p-3 rounded-xl border transition-all ${
              selectedStatus === "cleaning" 
                ? "border-amber-500 bg-amber-500/10" 
                : "border-border hover:border-amber-500/50"
            }`}
          >
            <p className="text-xl font-bold text-amber-600">{stats.cleaning}</p>
            <p className="text-xs text-muted-foreground">Limpeza</p>
          </button>
          <button
            onClick={() => setSelectedStatus("maintenance")}
            className={`p-3 rounded-xl border transition-all ${
              selectedStatus === "maintenance" 
                ? "border-red-500 bg-red-500/10" 
                : "border-border hover:border-red-500/50"
            }`}
          >
            <p className="text-xl font-bold text-red-600">{stats.maintenance}</p>
            <p className="text-xs text-muted-foreground">Manutenção</p>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 pb-4 flex-shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, vista ou posição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
        </div>

        {/* Rooms Grid - área rolável para ver todos os cards */}
        <div
          className="flex-1 min-h-0 border-t border-border overflow-y-auto overflow-x-hidden scrollbar-light"
          style={{ minHeight: 200 }}
        >
          <div className="pr-3 pb-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
              <p className="text-muted-foreground">Carregando quartos...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DoorOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground">Nenhum quarto encontrado</h3>
              <p className="text-muted-foreground mt-1">
                {units.length === 0
                  ? "Nenhum quarto cadastrado para este tipo. Cadastre o primeiro quarto."
                  : "Tente ajustar os filtros ou cadastre um novo quarto"}
              </p>
              <Button 
                onClick={() => setNewUnitModalOpen(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Quarto
              </Button>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => {
              const status = statusConfig[room.status];
              const StatusIcon = status?.icon || CheckCircle;

              return (
                <div
                  key={room.id}
                  className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={room.image}
                      alt={`Quarto ${room.number}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Room Number */}
                    <div className="absolute top-3 left-3">
                      <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                        <DoorOpen className="h-4 w-4 text-primary" />
                        <span className="font-bold text-foreground text-lg">{room.number}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge className={`${status?.color} text-white border-0`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status?.label}
                      </Badge>
                    </div>

                    {/* Floor & Position */}
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                      <div className="flex items-center gap-2 text-white/90 text-sm">
                        <Building2 className="h-4 w-4" />
                        <span>{room.floor}º Andar</span>
                        <span className="text-white/50">•</span>
                        <span>{room.position}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* View */}
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Vista:</span>
                      <span className="font-medium text-foreground">{room.view}</span>
                    </div>

                    {/* Current Guest (if occupied) */}
                    {room.status === "occupied" && room.currentGuest && (
                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-700">{room.currentGuest}</span>
                        </div>
                        <p className="text-xs text-blue-600/70 mt-1">
                          Check-out: {room.checkOut}
                        </p>
                      </div>
                    )}

                    {/* Last Cleaned */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4" />
                      <span>Última limpeza: {room.lastCleaned}</span>
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.map((amenity) => {
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
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <Button variant="outline" size="sm">
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Editar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <MapPin className="h-4 w-4 mr-2" />
                            Ver no Mapa
                          </DropdownMenuItem>
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
        </div>
      </DialogContent>
    </Dialog>

    {/* New Unit Modal */}
    <UnitModal 
      open={newUnitModalOpen} 
      onOpenChange={setNewUnitModalOpen} 
    />
  </>
  );
}