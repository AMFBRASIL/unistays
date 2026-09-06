import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { resolveUnitOperationalStatus } from "@/lib/unitOperationalStatus";
import { UnitModal } from "@/components/rooms/UnitModal";
import {
  BedDouble,
  User,
  Wrench,
  Sparkles,
  Grid3X3,
  List,
  Calendar,
  Search,
  Plus,
  Clock,
  MoreVertical,
  Hotel,
  Building2,
  Home,
  Building,
  CalendarDays,
  CalendarRange,
  Brush,
  Coffee,
  FileText,
  Users,
  UserCheck,
  Loader2,
  Pencil,
  Mountain,
  TreeDeciduous,
  Waves,
  Moon,
  PlusCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { NewTaskModal } from "@/components/governanca/NewTaskModal";
import { NewReservationModal } from "@/components/reservations/NewReservationModal";

type PropertyType = "hotel" | "apart-hotel" | "loft" | "temporada";
type StayType = "daily" | "weekly" | "monthly" | "long-stay";
type CleaningType = "per-stay" | "weekly" | "biweekly" | "monthly";

// Interfaces aligned with API
interface Property {
  id: number;
  name: string;
  type: string;
  owner?: {
    name: string;
    commission: number;
  };
  cleaningSchedule: string;
  services: {
    coworking: boolean;
    rooftop: boolean;
  };
}

interface Room {
  id: number;
  number: string;
  type: string;
  floor: number;
  capacity: number;
  beds: string;
  amenities: string[];
  status: string;
  propertyId: number;
  guest?: {
    name: string;
    phone: string;
    checkIn: string;
    checkOut: string;
    stayType: string;
    contractValue?: number;
  };
  rates: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  images?: string[];
  view?: string;
  name?: string;
  sizeM2?: number;
  roomTypeId?: number;
  activeTask?: any;
}

const propertyTypeConfig: Record<string, { label: string; icon: React.ComponentType<any>; color: string; bgColor: string }> = {
  hotel: { label: "Hotel", icon: Hotel, color: "text-blue-400", bgColor: "bg-blue-500/20" },
  "apart-hotel": { label: "Apart-Hotel", icon: Building2, color: "text-purple-400", bgColor: "bg-purple-500/20" },
  loft: { label: "Loft", icon: Home, color: "text-amber-400", bgColor: "bg-amber-500/20" },
  temporada: { label: "Temporada", icon: Building, color: "text-emerald-400", bgColor: "bg-emerald-500/20" },
};

const stayTypeConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  daily: { label: "Diária", color: "text-blue-400", bgColor: "bg-blue-500/20" },
  weekly: { label: "Semanal", color: "text-purple-400", bgColor: "bg-purple-500/20" },
  monthly: { label: "Mensal", color: "text-amber-400", bgColor: "bg-amber-500/20" },
  "long-stay": { label: "Long Stay", color: "text-emerald-400", bgColor: "bg-emerald-500/20" },
};

const cleaningConfig: Record<string, { label: string; color: string }> = {
  "per-stay": { label: "Por Estadia", color: "text-blue-400" },
  weekly: { label: "Semanal", color: "text-purple-400" },
  biweekly: { label: "Quinzenal", color: "text-amber-400" },
  monthly: { label: "Mensal", color: "text-emerald-400" },
};

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string; border: string; hoverBorder: string }> = {
  available: { label: "Disponível", icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30", hoverBorder: "hover:border-emerald-500" },
  occupied: { label: "Ocupado", icon: User, color: "text-blue-500", bg: "bg-blue-500/10 shadow-[inner_0_0_12px_rgba(59,130,246,0.1)]", border: "border-blue-500/40", hoverBorder: "hover:border-blue-500" },
  checkout: { label: "Check-out", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", hoverBorder: "hover:border-amber-500" },
  cleaning: { label: "Limpeza", icon: Sparkles, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30", hoverBorder: "hover:border-orange-500" },
  arrangement: { label: "Arrumação", icon: Brush, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/30", hoverBorder: "hover:border-purple-500" },
  maintenance: { label: "Manutenção", icon: Wrench, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", hoverBorder: "hover:border-red-500" },
  blocked: { label: "Bloqueado", icon: BedDouble, color: "text-muted-foreground", bg: "bg-muted", border: "border-muted", hoverBorder: "" },
};

export default function RoomMap() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | "all">("all");
  const [selectedProperty, setSelectedProperty] = useState<number | "all">("all");
  const [selectedFloor, setSelectedFloor] = useState<number | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rateView, setRateView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedPropertyForUnit, setSelectedPropertyForUnit] = useState<number | undefined>(undefined);
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  const [reservationInitialData, setReservationInitialData] = useState<any>(undefined);


  // Queries
  const { data: propertiesData, isLoading: isLoadingProperties } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const res = await api.getProperties();
      if (res.success && res.data) {
        return res.data.properties.map((p: any) => ({
          id: p.id,
          name: p.name,
          type: p.type || 'hotel',
          cleaningSchedule: 'per-stay', // Default if missing
          services: { coworking: false, rooftop: false }, // Default if missing
          owner: p.ownerName ? { name: p.ownerName, commission: 20 } : undefined
        })) as Property[];
      }
      return [];
    }
  });

  const { data: mapData, isLoading: isLoadingRooms, refetch: refetchRoomMap } = useQuery({
    queryKey: ["room-map-data"],
    queryFn: async () => {
      const [unitsRes, tasksRes, resRes, propsRes] = await Promise.all([
        api.getUnits(),
        api.getHousekeepingTasks({ status: 'pending,in_progress' }),
        api.getReservations({
          status: 'pending,confirmed,checked_in',
          isActiveNow: 'true'
        }),
        api.getProperties()
      ]);

      const units = unitsRes.success ? unitsRes.data?.units || [] : [];
      const activeTasks = tasksRes.success ? tasksRes.data?.tasks || [] : [];
      const activeReservations = resRes.success ? resRes.data?.reservations || [] : [];

      const rawProperties = propsRes.success ? propsRes.data?.properties || [] : [];

      const now = new Date();

      return (units || []).map((u: any) => {
        const currentUnitId = u.id?.toString();

        const task = currentUnitId ? (activeTasks || []).find((t: any) => {
          const tUnitId = (t.unitId ?? t.unit_id ?? t.unit_id_col)?.toString();
          return tUnitId === currentUnitId;
        }) : null;

        const guestRes = currentUnitId ? (activeReservations || []).find((r: any) => {
          const rUnitId = (r.unitId ?? r.unit_id ?? r.unit_id_col ?? r.unit?.id)?.toString();
          return rUnitId === currentUnitId;
        }) : null;

        const property = rawProperties.find((p: any) => p.id === u.propertyId);

        let isCheckoutPassed = false;
        if (guestRes && property) {
          const settings = typeof property.settings === 'string' ? JSON.parse(property.settings) : property.settings;
          const checkoutTimeStr = settings?.checkOutTime || "11:00";
          const [hours, minutes] = (checkoutTimeStr || "11:00").split(':').map(Number);
          const checkOutDateParts = guestRes.checkOut.toString().split('T')[0].split('-').map(Number);
          const checkoutDateTime = new Date(checkOutDateParts[0], checkOutDateParts[1] - 1, checkOutDateParts[2], hours, minutes, 0, 0);
          if (now > checkoutDateTime) {
            isCheckoutPassed = true;
          }
        }

        let displayedStatus = resolveUnitOperationalStatus({
          unitStatus: u.status,
          activeTask: task,
          isOccupiedByReservation: !!guestRes && !isCheckoutPassed,
          isCheckoutPassed,
        });

        if (!statusConfig[displayedStatus]) {
          displayedStatus = 'available';
        }

        return {
          id: u.id,
          number: u.number,
          type: u.type || u.roomType?.name || "Standard",
          floor: u.floor || 0,
          capacity: u.capacity || 2,
          beds: u.beds || "1 Cama",
          amenities: u.amenities || [],
          status: displayedStatus,
          originalStatus: u.status,
          propertyId: u.propertyId,
          guest: guestRes ? {
            name: (() => {
              const g = guestRes.guest;
              if (g?.firstName != null || g?.lastName != null) return [g?.firstName, g?.lastName].filter(Boolean).join(" ").trim() || "Hóspede";
              return g?.name || guestRes.guestName || "Hóspede";
            })(),
            phone: guestRes.guest?.phone || guestRes.guestPhone || "",
            checkIn: guestRes.checkIn,
            checkOut: guestRes.checkOut,
            stayType: guestRes.stayType || 'daily',
            contractValue: guestRes.totalAmount || guestRes.total_amount
          } : null,
          rates: u.rates || { daily: u.basePrice || 0, weekly: (u.basePrice || 0) * 7, monthly: (u.basePrice || 0) * 30 },
          images: u.images || [],
          view: u.view || u.settings?.view || u.viewType || "",
          name: u.name,
          sizeM2: u.sizeM2 || u.size || 0,
          roomTypeId: u.roomTypeId || u.room_type_id ? Number(u.roomTypeId || u.room_type_id) : undefined,
          activeTask: task
        };
      }) as Room[];
    }
  });

  const { data: selectedUnitDetails, isLoading: isLoadingUnitDetails, refetch: refetchUnitDetails } = useQuery({
    queryKey: ["unit-details", selectedRoom?.id],
    queryFn: async () => {
      if (!selectedRoom?.id) return null;
      return api.getUnitById(selectedRoom.id);
    },
    enabled: !!selectedRoom?.id,
  });

  const { data: upcomingReservations, isLoading: isLoadingUpcoming, refetch: refetchUpcoming } = useQuery({
    queryKey: ["unit-upcoming-reservations", selectedRoom?.id],
    queryFn: async () => {
      if (!selectedRoom?.id) return [];
      const res = await api.getReservations({ unitId: selectedRoom.id, status: "confirmed,pending" });
      const list = res.success ? (res.data?.reservations || []) : [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return list
        .filter((r: any) => {
          const checkIn = r.checkIn ? new Date(r.checkIn) : null;
          if (!checkIn) return false;
          const d = new Date(checkIn);
          d.setHours(0, 0, 0, 0);
          return d >= today;
        })
        .sort((a: any, b: any) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());
    },
    enabled: !!selectedRoom?.id,
  });

  const refreshData = () => {
    refetchRoomMap();
    if (selectedRoom) {
      refetchUnitDetails();
      refetchUpcoming();
    }
  };

  const properties = Array.isArray(propertiesData) ? propertiesData : [];
  const rooms = Array.isArray(mapData) ? mapData : [];

  const handleNewUnit = (propertyId?: number) => {
    setEditingRoom(null);
    setSelectedPropertyForUnit(propertyId);
    setUnitModalOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setSelectedPropertyForUnit(room.propertyId);
    setUnitModalOpen(true);
  };

  const filteredProperties = (properties || []).filter(
    (p) => selectedPropertyType === "all" || p.type === selectedPropertyType
  );

  const filteredRooms = rooms.filter((room) => {
    const property = Array.isArray(properties) ? properties.find((p) => p.id === room.propertyId) : null;
    if (!property) return false;

    const matchesPropertyType = selectedPropertyType === "all" || property.type === selectedPropertyType;
    const matchesProperty = selectedProperty === "all" || room.propertyId === selectedProperty;
    const matchesFloor = selectedFloor === "all" || room.floor === selectedFloor;
    const matchesStatus = selectedStatus === "all" || room.status === selectedStatus;
    const matchesSearch =
      room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPropertyType && matchesProperty && matchesFloor && matchesStatus && matchesSearch;
  });

  const floors = [...new Set(filteredRooms.map((r) => r.floor))].sort((a, b) => b - a);

  const stats = {
    total: filteredRooms.length,
    available: filteredRooms.filter((r) => r.status === "available").length,
    occupied: filteredRooms.filter((r) => r.status === "occupied").length,
    cleaning: filteredRooms.filter((r) => r.status === "cleaning").length,
    arrangement: filteredRooms.filter((r) => r.status === "arrangement").length,
    maintenance: filteredRooms.filter((r) => r.status === "maintenance").length,
    longStay: filteredRooms.filter((r) => r.guest?.stayType === "long-stay" || r.guest?.stayType === "monthly").length,
  };

  const occupiedCount = filteredRooms.filter((r) => r.guest !== null).length;
  const occupancyRate = stats.total > 0 ? Math.round((occupiedCount / stats.total) * 100) : 0;

  const getProperty = (propertyId: number) => properties.find((p) => p.id === propertyId);

  const getRateByView = (room: Room) => {
    switch (rateView) {
      case "weekly": return room.rates.weekly;
      case "monthly": return room.rates.monthly;
      default: return room.rates.daily;
    }
  };

  const getRateLabel = () => {
    switch (rateView) {
      case "weekly": return "por semana";
      case "monthly": return "por mês";
      default: return "por noite";
    }
  };

  if (isLoadingProperties || isLoadingRooms) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground">Carregando mapa de unidades...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mapa de Unidades</h1>
            <p className="text-muted-foreground">Visualize e gerencie todas as unidades do portfólio híbrido</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => handleNewUnit()} className="gap-2 bg-primary"> <Plus className="w-4 h-4" /> Nova Unidade </Button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border">
              <span className="text-2xl font-bold text-primary">{occupancyRate}%</span>
              <span className="text-sm text-muted-foreground">Ocupação</span>
            </div>
          </div>
        </div>

        {/* Property Type Selector */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant={selectedPropertyType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedPropertyType("all");
              setSelectedProperty("all");
            }}
            className={selectedPropertyType !== "all" ? "border-border/50" : ""}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Todos os Tipos
          </Button>
          {Object.entries(propertyTypeConfig).map(([type, config]) => {
            const TypeIcon = config.icon;
            const count = rooms.filter((r) => {
              const prop = getProperty(r.propertyId);
              return prop && prop.type === type;
            }).length;

            return (
              <Button
                key={type}
                variant={selectedPropertyType === type ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedPropertyType(type);
                  setSelectedProperty("all");
                }}
                className={cn(
                  selectedPropertyType !== type ? "border-border/50" : "",
                  selectedPropertyType === type && config.bgColor
                )}
              >
                <TypeIcon className={cn("w-4 h-4 mr-2", selectedPropertyType === type ? "" : config.color)} />
                {config.label}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Property Selector (when type is selected) */}
        {selectedPropertyType !== "all" && (
          <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-muted/30 border border-border/50">
            <span className="text-sm text-muted-foreground mr-2 flex items-center">Propriedade:</span>
            <Button
              variant={selectedProperty === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedProperty("all")}
            >
              Todas
            </Button>
            {filteredProperties.map((property) => (
              <Button
                key={property.id}
                variant={selectedProperty === property.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedProperty(property.id)}
              >
                {property.name}
                {property.owner && (
                  <Badge variant="outline" className="ml-2 text-xs gap-1">
                    <User className="w-3 h-3" />
                    {property.owner.commission}%
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        )}

        {/* Stats & Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(statusConfig).slice(0, 6).map(([key, config]) => {
            const count = filteredRooms.filter((r) => r.status === key).length;
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedStatus(selectedStatus === key ? "all" : key)}
                className={cn(
                  "p-4 rounded-xl border transition-all flex items-center gap-3",
                  selectedStatus === key
                    ? `${config.bg} ${config.border.replace("/30", "")}`
                    : "bg-card border-border hover:border-primary/50"
                )}
              >
                <div className={cn("p-2 rounded-lg", config.bg)}>
                  <Icon className={cn("w-5 h-5", config.color)} />
                </div>
                <div className="text-left">
                  <p className={cn("text-xl font-bold", config.color)}>{count}</p>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar unidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-10 pr-4 w-48 rounded-lg bg-secondary/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            {floors.length > 1 && (
              <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary">
                <Button
                  variant={selectedFloor === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedFloor("all")}
                >
                  Todos
                </Button>
                {floors.map((floor) => (
                  <Button
                    key={floor}
                    variant={selectedFloor === floor ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedFloor(floor)}
                  >
                    {floor}º
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Rate View Toggle */}
            <div className="flex items-center p-1 rounded-lg bg-secondary">
              <Button
                variant={rateView === "daily" ? "default" : "ghost"}
                size="sm"
                onClick={() => setRateView("daily")}
              >
                <Calendar className="w-4 h-4 mr-1" />
                Diária
              </Button>
              <Button
                variant={rateView === "weekly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setRateView("weekly")}
              >
                <CalendarDays className="w-4 h-4 mr-1" />
                Semana
              </Button>
              <Button
                variant={rateView === "monthly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setRateView("monthly")}
              >
                <CalendarRange className="w-4 h-4 mr-1" />
                Mês
              </Button>
            </div>
            <div className="flex items-center p-1 rounded-lg bg-secondary">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Room Grid */}
        {viewMode === "grid" ? (
          <div className="space-y-6">
            {(selectedProperty !== "all"
              ? filteredProperties.filter(p => p.id === selectedProperty)
              : filteredProperties
            ).map((property) => {
              const propertyId = property.id;
              if (!property) return null;
              const propertyRooms = filteredRooms.filter((r) => r.propertyId === propertyId);
              const typeConfig = propertyTypeConfig[property.type] || propertyTypeConfig.hotel; // Default fallback
              const TypeIcon = typeConfig.icon;

              return (
                <div key={propertyId} className="space-y-4">
                  {/* Property Header */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                    <div className={cn("p-2 rounded-lg", typeConfig.bgColor)}>
                      <TypeIcon className={cn("w-5 h-5", typeConfig.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{property.name}</h3>
                        <Badge className={cn(typeConfig.bgColor, typeConfig.color)}>
                          {typeConfig.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Brush className="w-3 h-3" />
                          Limpeza: {cleaningConfig[property.cleaningSchedule]?.label || property.cleaningSchedule}
                        </span>
                        {property.services.coworking && (
                          <span className="flex items-center gap-1">
                            <Coffee className="w-3 h-3" />
                            Coworking
                          </span>
                        )}
                        {property.services.rooftop && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            Rooftop
                          </span>
                        )}
                        {property.owner && (
                          <span className="flex items-center gap-1 text-amber-400">
                            <User className="w-3 h-3" />
                            {property.owner.name} ({property.owner.commission}%)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">{propertyRooms.length}</p>
                        <p className="text-xs text-muted-foreground">unidades</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-primary/30 hover:bg-primary/10"
                        onClick={() => handleNewUnit(propertyId)}
                      >
                        <Plus className="w-4 h-4" />
                        Nova Unidade
                      </Button>
                    </div>
                  </div>

                  {/* Rooms Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {propertyRooms.map((room) => {
                      const config = statusConfig[room.status] || statusConfig.available;
                      const Icon = config.icon;

                      const stayLabel = room.guest?.stayType ? stayTypeConfig[room.guest.stayType] : null;

                      return (
                        <div
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          className={cn(
                            "relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group",
                            config.bg,
                            config.border,
                            config.hoverBorder,
                            room.status === 'occupied' && "shadow-[inset_0_0_20px_rgba(59,130,246,0.1)] bg-blue-500/5"
                          )}
                        >
                          {room.status === 'occupied' && (
                            <div className="absolute -top-[1.5px] -right-[1.5px] w-3 h-3 bg-blue-500 rounded-full border-2 border-background z-10" />
                          )}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <span className="text-2xl font-bold text-foreground">{room.number}</span>
                              <p className="text-xs text-muted-foreground">{room.type}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Icon className={cn("w-5 h-5", config.color)} />
                              {room.status === 'available' && (
                                <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[9px] bg-emerald-500 text-white border-none shadow-sm">
                                  DISPONÍVEL
                                </Badge>
                              )}
                              {room.status === 'occupied' && (
                                <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[9px] bg-blue-500 text-white border-none shadow-sm animate-pulse">
                                  OCUPADO
                                </Badge>
                              )}
                              {room.status === 'cleaning' && (
                                <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[9px] bg-orange-500 text-white border-none shadow-sm">
                                  LIMPEZA
                                </Badge>
                              )}
                              {room.status === 'maintenance' && (
                                <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[9px] bg-red-500 text-white border-none shadow-sm">
                                  MANUTENÇÃO
                                </Badge>
                              )}
                              {room.status === 'arrangement' && (
                                <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[9px] bg-purple-500 text-white border-none shadow-sm">
                                  ARRUMAÇÃO
                                </Badge>
                              )}
                              {room.status === 'checkout' && (
                                <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[9px] bg-amber-500 text-white border-none shadow-sm">
                                  CHECK-OUT
                                </Badge>
                              )}
                              {room.status === 'blocked' && (
                                <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[9px] bg-muted text-muted-foreground border-none shadow-sm">
                                  BLOQUEADO
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="w-3.5 h-3.5" />
                            <span>{room.capacity}</span>
                            <span>•</span>
                            <span>{room.beds}</span>
                          </div>

                          {room.activeTask && (
                            <div className={cn(
                              "mt-2 px-2 py-1.5 rounded-lg bg-white/20 text-[10px] font-medium flex flex-col gap-1 shadow-sm",
                              config.color
                            )}>
                              <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" />
                                <span className="font-bold truncate">{room.activeTask.type || room.activeTask.category}</span>
                              </div>
                              {room.activeTask.assigneeName && (
                                <div className="flex items-center gap-1.5 opacity-90 border-t border-current/10 pt-1">
                                  <UserCheck className="w-3 h-3" />
                                  <span className="truncate">{room.activeTask.assigneeName}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {room.status === 'occupied' && room.guest ? (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-foreground truncate flex-1">{room.guest.name}</p>
                                {stayLabel && (
                                  <Badge className={cn("text-[10px] ml-1", stayLabel.bgColor, stayLabel.color)}>
                                    {stayLabel.label}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>
                                  Saída:{" "}
                                  {new Date(room.guest.checkOut).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "short",
                                  })}
                                </span>
                              </div>
                              {room.guest.contractValue && (
                                <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
                                  <FileText className="w-3 h-3" />
                                  <span>R$ {room.guest.contractValue.toLocaleString("pt-BR")}</span>
                                </div>
                              )}
                            </div>
                          ) : !['cleaning', 'maintenance', 'arrangement'].includes(room.status) ? (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <p className="text-lg font-bold text-foreground">
                                R$ {getRateByView(room).toLocaleString("pt-BR")}
                              </p>
                              <p className="text-xs text-muted-foreground">{getRateLabel()}</p>
                            </div>
                          ) : null}

                          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-br from-transparent via-transparent to-current/5" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Unidade</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Propriedade</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Hóspede</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estadia</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    {rateView === "daily" ? "Diária" : rateView === "weekly" ? "Semana" : "Mês"}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRooms.map((room) => {
                  const config = statusConfig[room.status] || statusConfig.available;
                  const Icon = config.icon;
                  const property = getProperty(room.propertyId);
                  const typeConfig = property ? (propertyTypeConfig[property.type] || propertyTypeConfig.hotel) : null;
                  const stayLabel = room.guest?.stayType ? stayTypeConfig[room.guest.stayType] : null;

                  return (
                    <tr
                      key={room.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedRoom(room)}
                    >
                      <td className="p-4">
                        <span className="text-lg font-bold text-foreground">{room.number}</span>
                      </td>
                      <td className="p-4">
                        {property && typeConfig && (
                          <div className="flex items-center gap-2">
                            <Badge className={cn(typeConfig.bgColor, typeConfig.color, "text-xs")}>
                              {typeConfig.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{property.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-foreground">{room.type}</p>
                        <p className="text-xs text-muted-foreground">{room.floor}º Andar</p>
                      </td>
                      <td className="p-4">
                        {room.guest ? (
                          <div>
                            <p className="font-medium text-foreground">{room.guest.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Até {new Date(room.guest.checkOut).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {stayLabel ? (
                          <Badge className={cn(stayLabel.bgColor, stayLabel.color)}>
                            {stayLabel.label}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium", config.bg)}>
                          <Icon className={cn("w-4 h-4", config.color)} />
                          <span className={config.color}>{config.label}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-foreground">
                          R$ {getRateByView(room).toLocaleString("pt-BR")}
                        </p>
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Room Detail Modal - Modern with Illustrations */}
        {selectedRoom && (
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedRoom(null)}
          >
            <div
              className="bg-card border border-border rounded-3xl shadow-2xl max-w-4xl w-full h-[90vh] max-h-[90vh] flex flex-col overflow-hidden animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const property = getProperty(selectedRoom.propertyId);
                const typeConfig = property ? (propertyTypeConfig[property.type] || propertyTypeConfig.hotel) : null;
                const stayLabel = selectedRoom.guest?.stayType ? stayTypeConfig[selectedRoom.guest.stayType] : null;
                const StatusIcon = (statusConfig[selectedRoom.status] || statusConfig.available).icon;
                const statusConf = statusConfig[selectedRoom.status] || statusConfig.available;

                return (
                  <>
                    {/* Header with Gradient Background */}
                    <div className={cn(
                      "relative p-6 overflow-hidden flex-shrink-0",
                      typeConfig ? `bg-gradient-to-br ${typeConfig.bgColor}` : "bg-gradient-to-br from-primary/20 to-purple-500/20"
                    )}>
                      {/* Decorative Elements */}
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                      <div className="relative flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          {/* Large Unit Icon */}
                          <div className={cn(
                            "w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg",
                            "bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/20"
                          )}>
                            {typeConfig ? (
                              <typeConfig.icon className={cn("w-10 h-10", typeConfig.color)} />
                            ) : (
                              <BedDouble className="w-10 h-10 text-primary" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {typeConfig && (
                                <Badge className={cn("text-xs", typeConfig.bgColor, typeConfig.color)}>
                                  {typeConfig.label}
                                </Badge>
                              )}
                              <Badge className={cn(statusConf.bg, statusConf.color)}>
                                {statusConf.label}
                              </Badge>
                            </div>
                            <h2 className="text-3xl font-bold text-foreground">
                              Unidade {selectedRoom.number}
                            </h2>
                            <p className="text-muted-foreground flex items-center gap-2 mt-1">
                              {property?.name} • {selectedRoom.type} • {selectedRoom.floor}º Andar
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedRoom(null)}
                          className="rounded-full bg-white/10 hover:bg-white/20"
                        >
                          <span className="text-xl">×</span>
                        </Button>
                      </div>
                    </div>

                    <ScrollArea className="flex-1 min-h-0">
                      <div className="p-6 pb-24 space-y-6">

                        {/* Quick Stats Row */}
                        <div className="grid grid-cols-4 gap-3">
                          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                            <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                            <p className="text-xl font-bold text-foreground">{selectedRoom.capacity}</p>
                            <p className="text-xs text-muted-foreground">Hóspedes</p>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                            <BedDouble className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                            <p className="text-sm font-bold text-foreground">{selectedRoom.beds}</p>
                            <p className="text-xs text-muted-foreground">Camas</p>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                            <Building className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                            <p className="text-xl font-bold text-foreground">{selectedRoom.floor}º</p>
                            <p className="text-xs text-muted-foreground">Andar</p>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                            <StatusIcon className={cn("w-5 h-5 mx-auto mb-1", statusConf.color)} />
                            <p className="text-sm font-bold text-foreground">{statusConf.label}</p>
                            <p className="text-xs text-muted-foreground">Status</p>
                          </div>
                        </div>

                        {/* Guest Card (if occupied) */}
                        {selectedRoom.guest && (
                          <div className="relative p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5 border border-primary/20 overflow-hidden">
                            {/* Decorative */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />

                            <div className="relative">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-primary" />
                                  <span className="text-sm font-semibold text-foreground">Hóspede Atual</span>
                                </div>
                                {stayLabel && (
                                  <Badge className={cn("gap-1", stayLabel.bgColor, stayLabel.color)}>
                                    {stayLabel.label}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-xl font-bold text-foreground">{selectedRoom.guest.name}</h3>
                                  <p className="text-muted-foreground text-sm">{selectedRoom.guest.phone}</p>
                                </div>
                                {selectedRoom.guest.contractValue && (
                                  <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Valor do Contrato</p>
                                    <p className="text-xl font-bold text-primary">
                                      R$ {selectedRoom.guest.contractValue.toLocaleString("pt-BR")}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-primary/10">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Check-in</p>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="font-medium">
                                      {new Date(selectedRoom.guest.checkIn).toLocaleDateString("pt-BR")}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Check-out</p>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="font-medium">
                                      {new Date(selectedRoom.guest.checkOut).toLocaleDateString("pt-BR")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Próximas reservas confirmadas */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-primary" />
                            Próximas reservas confirmadas
                          </h4>
                          {isLoadingUpcoming ? (
                            <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span className="text-sm">Carregando reservas...</span>
                            </div>
                          ) : !upcomingReservations?.length ? (
                            <p className="text-sm text-muted-foreground py-4 px-4 rounded-xl bg-muted/30 border border-border/50">
                              Nenhuma reserva confirmada para as próximas datas nesta unidade.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {(upcomingReservations || []).map((res: any) => {
                                const guestName = res.guest?.firstName != null || res.guest?.lastName != null
                                  ? [res.guest?.firstName, res.guest?.lastName].filter(Boolean).join(" ").trim()
                                  : res.guest?.name || res.guestName || "Hóspede";
                                const firstName = (guestName || "Hóspede").split(" ")[0] || "Hóspede";
                                const adults = Number(res.adults ?? res.adults_count ?? 0) || 1;
                                const children = Number(res.children ?? res.children_count ?? 0) || 0;
                                const totalGuests = adults + children;
                                const totalAmount = res.totalAmount ?? res.total_amount ?? 0;
                                const paidAmount = res.paidAmount ?? res.paid_amount ?? 0;
                                const protocol = res.reservationNumber ?? res.reservation_number ?? res.id;
                                const checkIn = res.checkIn ? new Date(res.checkIn) : null;
                                const checkOut = res.checkOut ? new Date(res.checkOut) : null;
                                return (
                                  <div
                                    key={res.id}
                                    className="p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                          <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                            {protocol}
                                          </span>
                                          <Badge variant="secondary" className="text-[10px]">
                                            {res.status === "confirmed" ? "Confirmada" : res.status === "pending" ? "Pendente" : res.status}
                                          </Badge>
                                        </div>
                                        <p className="font-semibold text-foreground truncate">{firstName}</p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                                          {checkIn && checkOut && (
                                            <span className="flex items-center gap-1">
                                              <Calendar className="w-3.5 h-3.5" />
                                              {checkIn.toLocaleDateString("pt-BR")} – {checkOut.toLocaleDateString("pt-BR")}
                                            </span>
                                          )}
                                          <span className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5" />
                                            {totalGuests} {totalGuests === 1 ? "pessoa" : "pessoas"}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <p className="text-xs text-muted-foreground">Total</p>
                                        <p className="font-bold text-foreground">
                                          R$ {Number(totalAmount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </p>
                                        {paidAmount > 0 && (
                                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                                            Pago: R$ {Number(paidAmount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Amenities */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Comodidades
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {(selectedUnitDetails?.data?.unit?.amenities || selectedRoom.amenities || []).map((amenity: string, index: number) => (
                              <Badge key={index} variant="secondary" className="px-3 py-1">
                                {amenity}
                              </Badge>
                            ))}
                            {(selectedUnitDetails?.data?.unit?.amenities || selectedRoom.amenities || []).length === 0 && (
                              <p className="text-muted-foreground text-sm">
                                {isLoadingUnitDetails ? "Carregando comodidades..." : "Nenhuma comodidade registrada."}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-border bg-background/95 backdrop-blur flex flex-col sm:flex-row justify-between gap-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          handleEditRoom(selectedRoom);
                          setSelectedRoom(null); // Close detail modal to open edit modal
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar Unidade
                      </Button>
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => setNewTaskModalOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Tarefa
                      </Button>
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => {
                          const prop = getProperty(selectedRoom.propertyId);
                          setReservationInitialData({
                            roomId: selectedRoom.id.toString(),
                            category: selectedRoom.roomTypeId?.toString() || selectedRoom.type,
                            propertyType: prop?.type
                          });
                          setShowNewReservationModal(true);
                          setSelectedRoom(null); // Fecha o detalhe para abrir a reserva
                        }}
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Nova Reserva
                      </Button>
                    </div>

                  </>
                );
              })()}
            </div>
          </div>
        )}

        <UnitModal
          open={unitModalOpen}
          onOpenChange={setUnitModalOpen}
          editRoom={editingRoom}
          selectedPropertyId={selectedPropertyForUnit}
          properties={properties}
          onSaved={refreshData}
        />

        <NewTaskModal
          open={newTaskModalOpen}
          onOpenChange={setNewTaskModalOpen}
          onSave={refreshData}
          initialPropertyId={selectedRoom?.propertyId?.toString()}
          initialUnitId={selectedRoom?.id?.toString()}
        />

        <NewReservationModal
          open={showNewReservationModal}
          onOpenChange={setShowNewReservationModal}
          initialData={reservationInitialData}
          onSave={refreshData}
        />
      </div>
    </DashboardLayout>
  );
}
