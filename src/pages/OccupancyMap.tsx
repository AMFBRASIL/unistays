import { useState, useMemo, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { NewReservationModal } from "@/components/reservations/NewReservationModal";
import { toast } from "sonner";
import {
  Calendar,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Users,
  BedDouble,
  Sparkles,
  ArrowDownToLine,
  ArrowUpFromLine,
  Wrench,
  Ban,
  Filter,
  Download,
  GripVertical,
  MousePointer2,
  Hotel,
  Building2,
  Home,
  Palmtree,
  FileText,
  CalendarDays,
  Clock,
  Loader2,
} from "lucide-react";
import { format, addDays, startOfDay, isSameDay, isWithinInterval, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

type PropertyType = 'all' | 'hotel' | 'apart-hotel' | 'loft' | 'temporada';
type StayType = 'daily' | 'weekly' | 'monthly' | 'longstay';

interface Reservation {
  id: string;
  guestId?: number;
  guestName: string;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  status: "confirmed" | "checkin" | "checkout";
  channel: "direct" | "booking" | "airbnb" | "expedia";
  stayType: StayType;
  contractValue?: number;
}

interface Room {
  id: string;
  number: string;
  categoryId: string;
  propertyType: PropertyType;
  status: "available" | "occupied" | "cleaning" | "maintenance" | "blocked";
  hasAC: boolean;
  hasMinibar: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;
  propertyType: PropertyType;
  rooms: Room[];
}

const propertyTypeConfig = {
  hotel: { label: 'Hotel', icon: Hotel, color: 'bg-blue-500', textColor: 'text-blue-500', bgLight: 'bg-blue-500/10' },
  'apart-hotel': { label: 'Apart-Hotel', icon: Building2, color: 'bg-purple-500', textColor: 'text-purple-500', bgLight: 'bg-purple-500/10' },
  loft: { label: 'Loft', icon: Home, color: 'bg-amber-500', textColor: 'text-amber-500', bgLight: 'bg-amber-500/10' },
  temporada: { label: 'Temporada', icon: Palmtree, color: 'bg-emerald-500', textColor: 'text-emerald-500', bgLight: 'bg-emerald-500/10' },
};

const stayTypeConfig = {
  daily: { label: 'Diária', color: 'bg-blue-500/20 text-blue-600 border-blue-500/30' },
  weekly: { label: 'Semanal', color: 'bg-purple-500/20 text-purple-600 border-purple-500/30' },
  monthly: { label: 'Mensal', color: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
  longstay: { label: 'Long Stay', color: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' },
};

const categories: Category[] = [
  {
    id: "hotel-standard",
    name: "Hotel Standard",
    color: "hsl(var(--primary))",
    propertyType: "hotel",
    rooms: [
      { id: "h101", number: "101", categoryId: "hotel-standard", propertyType: "hotel", status: "available", hasAC: true, hasMinibar: false },
      { id: "h102", number: "102", categoryId: "hotel-standard", propertyType: "hotel", status: "available", hasAC: true, hasMinibar: true },
      { id: "h103", number: "103", categoryId: "hotel-standard", propertyType: "hotel", status: "available", hasAC: true, hasMinibar: false },
    ]
  },
  {
    id: "hotel-luxo",
    name: "Hotel Luxo",
    color: "hsl(var(--warning))",
    propertyType: "hotel",
    rooms: [
      { id: "h301", number: "301", categoryId: "hotel-luxo", propertyType: "hotel", status: "available", hasAC: true, hasMinibar: true },
      { id: "h302", number: "302", categoryId: "hotel-luxo", propertyType: "hotel", status: "cleaning", hasAC: true, hasMinibar: true },
    ]
  },
  {
    id: "apart-studio",
    name: "Apart Studio",
    color: "hsl(217 91% 60%)",
    propertyType: "apart-hotel",
    rooms: [
      { id: "a101", number: "A101", categoryId: "apart-studio", propertyType: "apart-hotel", status: "available", hasAC: true, hasMinibar: false },
      { id: "a102", number: "A102", categoryId: "apart-studio", propertyType: "apart-hotel", status: "available", hasAC: true, hasMinibar: true },
      { id: "a103", number: "A103", categoryId: "apart-studio", propertyType: "apart-hotel", status: "maintenance", hasAC: false, hasMinibar: true },
    ]
  },
  {
    id: "apart-suite",
    name: "Apart Suíte",
    color: "hsl(271 91% 65%)",
    propertyType: "apart-hotel",
    rooms: [
      { id: "a201", number: "A201", categoryId: "apart-suite", propertyType: "apart-hotel", status: "available", hasAC: true, hasMinibar: true },
      { id: "a202", number: "A202", categoryId: "apart-suite", propertyType: "apart-hotel", status: "available", hasAC: true, hasMinibar: true },
    ]
  },
  {
    id: "loft-urban",
    name: "Loft Urbano",
    color: "hsl(45 93% 47%)",
    propertyType: "loft",
    rooms: [
      { id: "l01", number: "L01", categoryId: "loft-urban", propertyType: "loft", status: "available", hasAC: true, hasMinibar: true },
      { id: "l02", number: "L02", categoryId: "loft-urban", propertyType: "loft", status: "available", hasAC: true, hasMinibar: true },
    ]
  },
  {
    id: "temporada-casa",
    name: "Casa Temporada",
    color: "hsl(142 71% 45%)",
    propertyType: "temporada",
    rooms: [
      { id: "t01", number: "T01", categoryId: "temporada-casa", propertyType: "temporada", status: "available", hasAC: true, hasMinibar: false },
      { id: "t02", number: "T02", categoryId: "temporada-casa", propertyType: "temporada", status: "available", hasAC: true, hasMinibar: false },
    ]
  }
];

const today = startOfDay(new Date());

// Helper to determine stay type based on duration
const getStayType = (checkIn: Date, checkOut: Date): StayType => {
  const days = differenceInDays(checkOut, checkIn);
  if (days >= 30) return 'longstay'; // or monthly
  if (days >= 7) return 'weekly';
  return 'daily';
};

const normalizeChannel = (channel?: string): "direct" | "booking" | "airbnb" | "expedia" => {
  if (!channel) return "direct";
  const lower = channel.toLowerCase();
  if (lower.includes("booking")) return "booking";
  if (lower.includes("airbnb")) return "airbnb";
  if (lower.includes("expedia")) return "expedia";
  return "direct"; // Default fallback
};

const channelColors: Record<string, string> = {
  direct: "from-primary to-primary/80",
  booking: "from-blue-500 to-blue-600",
  airbnb: "from-rose-500 to-rose-600",
  expedia: "from-amber-500 to-amber-600",
};

const OccupancyMap = () => {
  const [startDate, setStartDate] = useState(format(today, "yyyy-MM-dd"));
  const [interval, setInterval] = useState("30");
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [housekeepingTasks, setHousekeepingTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [modalInitialData, setModalInitialData] = useState<any>(undefined);

  const [selectionStart, setSelectionStart] = useState<{ roomId: string; day: Date; category: string } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ roomId: string; day: Date } | null>(null);
  const [draggingReservation, setDraggingReservation] = useState<Reservation | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ roomId: string; day: Date } | null>(null);

  const parsedStartDate = startOfDay(new Date(startDate));
  const daysCount = parseInt(interval);

  const days = useMemo(() => Array.from({ length: daysCount }, (_, i) => addDays(parsedStartDate, i)), [parsedStartDate, daysCount]);
  const endDate = addDays(parsedStartDate, daysCount - 1);

  const filteredCategories = categories.filter(
    cat => selectedPropertyType === 'all' || cat.propertyType === selectedPropertyType
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  const getReservationForRoomAndDay = (roomId: string, day: Date) => {
    return reservations.find(res =>
      res.roomId === roomId && isWithinInterval(day, { start: res.checkIn, end: addDays(res.checkOut, -1) })
    );
  };

  const isReservationStart = (roomId: string, day: Date) => {
    return reservations.some(res => res.roomId === roomId && isSameDay(res.checkIn, day));
  };

  const getReservationSpan = (reservation: Reservation, currentDay: Date) => {
    if (!isSameDay(reservation.checkIn, currentDay)) return 0;
    const daysUntilEnd = differenceInDays(reservation.checkOut, reservation.checkIn);
    const daysUntilEndOfView = differenceInDays(endDate, currentDay) + 1;
    return Math.min(daysUntilEnd, daysUntilEndOfView);
  };

  const allRooms = filteredCategories.flatMap(c => c.rooms);
  const totalRooms = allRooms.length;

  const stats = useMemo(() => {
    const roomIds = new Set(allRooms.map(r => r.id));
    const filteredReservations = reservations.filter(r => roomIds.has(r.roomId));

    const occupied = new Set(filteredReservations.filter(r =>
      isWithinInterval(today, { start: r.checkIn, end: addDays(r.checkOut, -1) })
    ).map(r => r.roomId)).size;

    const cleaning = allRooms.filter(r => r.status === "cleaning").length;
    const maintenance = allRooms.filter(r => r.status === "maintenance" || r.status === "blocked").length;
    const checkIns = filteredReservations.filter(r => isSameDay(r.checkIn, today)).length;
    const checkOuts = filteredReservations.filter(r => isSameDay(r.checkOut, today)).length;
    const longStay = filteredReservations.filter(r => r.stayType === 'longstay' && isWithinInterval(today, { start: r.checkIn, end: addDays(r.checkOut, -1) })).length;
    const available = totalRooms - occupied - cleaning - maintenance;
    const occupancyRate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

    return { occupied, available, maintenance, cleaning, checkIns, checkOuts, occupancyRate, longStay };
  }, [reservations, allRooms, totalRooms]);

  const getAvailableCount = (categoryId: string, day: Date) => {
    const categoryRooms = filteredCategories.find(c => c.id === categoryId)?.rooms || [];
    let available = 0;
    categoryRooms.forEach(room => {
      if (room.status === "maintenance" || room.status === "blocked") return;
      const hasReservation = reservations.some(res =>
        res.roomId === room.id && isWithinInterval(day, { start: res.checkIn, end: addDays(res.checkOut, -1) })
      );
      if (!hasReservation) available++;
    });
    return available;
  };

  const getOccupancyRate = (day: Date) => {
    let occupied = 0;
    allRooms.forEach(room => {
      if (room.status === "maintenance" || room.status === "blocked") return;
      const hasReservation = reservations.some(res =>
        res.roomId === room.id && isWithinInterval(day, { start: res.checkIn, end: addDays(res.checkOut, -1) })
      );
      if (hasReservation) occupied++;
    });
    return Math.round((occupied / totalRooms) * 100);
  };

  const getDayOfWeek = (date: Date) => format(date, "EEE", { locale: ptBR }).replace(".", "").toUpperCase();
  const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
  const isToday = (date: Date) => isSameDay(date, today);

  const handleDragStart = (e: React.DragEvent, reservation: Reservation) => {
    setDraggingReservation(reservation);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", reservation.id);
  };

  const handleDragEnd = () => {
    setDraggingReservation(null);
    setDragOverCell(null);
  };

  const handleDragOver = (e: React.DragEvent, roomId: string, day: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCell({ roomId, day });
  };

  const handleDragLeave = () => setDragOverCell(null);

  const handleDrop = async (e: React.DragEvent, roomId: string, newCheckIn: Date) => {
    e.preventDefault();
    if (!draggingReservation) return;

    const reservationDuration = differenceInDays(draggingReservation.checkOut, draggingReservation.checkIn);
    const newCheckOut = addDays(newCheckIn, reservationDuration);

    const hasConflict = reservations.some(res => {
      if (res.id === draggingReservation.id) return false;
      if (res.roomId !== roomId) return false;
      return (
        isWithinInterval(newCheckIn, { start: res.checkIn, end: addDays(res.checkOut, -1) }) ||
        isWithinInterval(addDays(newCheckOut, -1), { start: res.checkIn, end: addDays(res.checkOut, -1) }) ||
        isWithinInterval(res.checkIn, { start: newCheckIn, end: addDays(newCheckOut, -1) })
      );
    });

    if (hasConflict) {
      toast.error("Conflito de datas", { description: "Já existe uma reserva neste período." });
      setDraggingReservation(null);
      setDragOverCell(null);
      return;
    }

    const targetRoom = allRooms.find(r => r.id === roomId);
    if (targetRoom?.status === "maintenance") {
      toast.error("Unidade indisponível", { description: "Esta unidade está em manutenção." });
      setDraggingReservation(null);
      setDragOverCell(null);
      return;
    }

    // Optimistic Update
    setReservations(prev => prev.map(res => {
      if (res.id === draggingReservation.id) {
        return { ...res, roomId, checkIn: newCheckIn, checkOut: newCheckOut };
      }
      return res;
    }));

    try {
      const response = await api.updateReservation(Number(draggingReservation.id), {
        unitId: Number(roomId),
        checkIn: format(newCheckIn, 'yyyy-MM-dd'),
        checkOut: format(newCheckOut, 'yyyy-MM-dd')
      });

      if (response.success) {
        const roomNumber = allRooms.find(r => r.id === roomId)?.number;
        toast.success("Reserva movida", {
          description: `${draggingReservation.guestName} → Unid. ${roomNumber} (${format(newCheckIn, "dd/MM")} - ${format(newCheckOut, "dd/MM")})`,
        });
      } else {
        throw new Error(response.error?.message || "Failed to update");
      }
    } catch (err) {
      toast.error("Erro ao atualizar reserva");
      fetchData(); // Rollback
    }

    setDraggingReservation(null);
    setDragOverCell(null);
  };

  const handleCellClick = (roomId: string, day: Date, categoryId: string) => {
    const room = allRooms.find(r => r.id === roomId);
    // Validação de status para o dia atual ou períodos que conflitem com bloqueios
    if (isToday(day)) {
      if (room?.status === "maintenance" || room?.status === "blocked") {
        toast.error("Unidade em MANUTENÇÃO", { description: "Esta unidade está bloqueada para reparos." });
        return;
      }
      if (room?.status === "cleaning") {
        toast.error("Unidade em LIMPEZA", { description: "Aguarde a conclusão da limpeza para realizar reservas." });
        return;
      }
    }

    const existingReservation = getReservationForRoomAndDay(roomId, day);
    if (existingReservation) return;

    if (!selectionStart) {
      setSelectionStart({ roomId, day, category: categoryId });
      toast.info("Selecione a data de check-out");
    } else if (selectionStart.roomId === roomId) {
      let checkIn = selectionStart.day;
      let checkOut = addDays(day, 1);
      if (day < selectionStart.day) {
        checkIn = day;
        checkOut = addDays(selectionStart.day, 1);
      }

      const hasConflict = reservations.some(res => {
        if (res.roomId !== roomId) return false;
        return (
          isWithinInterval(checkIn, { start: res.checkIn, end: addDays(res.checkOut, -1) }) ||
          isWithinInterval(addDays(checkOut, -1), { start: res.checkIn, end: addDays(res.checkOut, -1) }) ||
          isWithinInterval(res.checkIn, { start: checkIn, end: addDays(checkOut, -1) })
        );
      });

      if (hasConflict) {
        toast.error("Período indisponível");
        setSelectionStart(null);
        return;
      }

      setModalInitialData({
        checkIn: format(checkIn, "yyyy-MM-dd"),
        checkOut: format(checkOut, "yyyy-MM-dd"),
        roomId: roomId,
        category: categoryId,
        propertyType: room?.propertyType || 'hotel',
        stayType: 'daily',
      });
      setShowNewReservationModal(true);
      setSelectionStart(null);
    } else {
      setSelectionStart({ roomId, day, category: categoryId });
      toast.info("Selecione a data de check-out");
    }
  };

  const isCellInSelection = (roomId: string, day: Date) => {
    if (!selectionStart || selectionStart.roomId !== roomId) return false;
    if (!hoveredCell || hoveredCell.roomId !== roomId) return isSameDay(day, selectionStart.day);
    const start = selectionStart.day < hoveredCell.day ? selectionStart.day : hoveredCell.day;
    const end = selectionStart.day < hoveredCell.day ? hoveredCell.day : selectionStart.day;
    return isWithinInterval(day, { start, end }) || isSameDay(day, start) || isSameDay(day, end);
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [unitsRes, roomTypesRes, reservationsRes, tasksRes] = await Promise.all([
        api.getUnits(),
        api.getRoomTypes(),
        api.getReservations(),
        api.getHousekeepingTasks({ status: 'pending,in_progress' })
      ]);

      if (unitsRes.success && roomTypesRes.success && reservationsRes.success && tasksRes.success) {
        // Process Categories (based on Room Types)
        const roomTypes = roomTypesRes.data?.roomTypes || [];
        const units = unitsRes.data?.units || [];
        const tasks = tasksRes.data?.tasks || [];
        setHousekeepingTasks(tasks);

        const newCategories: Category[] = roomTypes.map((rt: any) => ({
          id: rt.id.toString(),
          name: rt.name,
          color: rt.color || "hsl(var(--primary))",
          propertyType: (rt.propertyType as PropertyType) || 'hotel',
          rooms: units
            .filter((u: any) => u.roomTypeId === rt.id || u.roomType?.id === rt.id)
            .map((u: any) => {
              const currentUnitId = u.id?.toString();
              const task = tasks.find((t: any) => String(t.unitId || t.unit_id) === currentUnitId);

              let computedStatus = u.status || 'available';
              if (task) {
                if (task.category === 'cleaning') computedStatus = 'cleaning';
                else if (task.category === 'maintenance') computedStatus = 'maintenance';
                else if (task.category === 'arrangement') computedStatus = 'arrangement';
              }

              return {
                id: currentUnitId,
                number: u.number || u.name,
                categoryId: rt.id.toString(),
                propertyType: (rt.propertyType as PropertyType) || 'hotel',
                status: computedStatus,
                hasAC: true,
                hasMinibar: false
              };
            })
        })).filter((cat: Category) => cat.rooms.length > 0);

        setCategories(newCategories);
        setExpandedCategories(prev => prev.length === 0 ? newCategories.map(c => c.id) : prev);

        // Process Reservations
        const rawReservations = reservationsRes.data?.reservations || [];
        const mappedReservations: Reservation[] = rawReservations.map((r: any) => {
          const checkIn = new Date(r.checkIn);
          const checkOut = new Date(r.checkOut);
          return {
            id: r.id.toString(),
            guestId: r.guest?.id,
            guestName: r.guest?.firstName ? `${r.guest.firstName} ${r.guest.lastName || ''}`.trim() : r.guest?.name || 'Hóspede',
            roomId: r.unit?.id?.toString() || r.unitId?.toString(),
            checkIn: checkIn,
            checkOut: checkOut,
            status: (r.status === 'confirmed' || r.status === 'checked_in' || r.status === 'checkin' ? 'confirmed' :
              r.status === 'checkin' ? 'checkin' :
                r.status === 'checked_out' || r.status === 'checkout' ? 'checkout' : 'confirmed') as "confirmed" | "checkin" | "checkout", // map statuses
            channel: normalizeChannel(r.channel),
            stayType: getStayType(checkIn, checkOut),
            contractValue: parseFloat(r.totalAmount || 0)
          };
        }).filter((r: Reservation) => r.roomId); // Only show assigned reservations

        setReservations(mappedReservations);
      }
    } catch (error) {
      console.error("Failed to fetch occupancy data", error);
      toast.error("Erro ao carregar dados do mapa");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectionStart) {
        setSelectionStart(null);
        toast.dismiss();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectionStart]);

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mapa de Ocupação Híbrido</h1>
              <p className="text-muted-foreground mt-1">
                {format(parsedStartDate, "d MMM", { locale: ptBR })} – {format(endDate, "d MMM yyyy", { locale: ptBR })}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-36 border-0 bg-transparent focus-visible:ring-0"
                />
                <Select value={interval} onValueChange={setInterval}>
                  <SelectTrigger className="w-32 border-0 bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="14">14 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" size="icon" className="rounded-xl">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-xl">
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl"
                onClick={fetchData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Property Type Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedPropertyType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPropertyType('all')}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Todos
              <Badge variant="secondary" className="ml-1">{categories.reduce((acc, c) => acc + c.rooms.length, 0)}</Badge>
            </Button>
            {Object.entries(propertyTypeConfig).map(([type, config]) => {
              const Icon = config.icon;
              const count = categories.filter(c => c.propertyType === type).reduce((acc, c) => acc + c.rooms.length, 0);
              return (
                <Button
                  key={type}
                  variant={selectedPropertyType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPropertyType(type as PropertyType)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {config.label}
                  <Badge variant="secondary" className="ml-1">{count}</Badge>
                </Button>
              );
            })}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <Card className="glass p-4 rounded-2xl border-0 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.occupancyRate}%</p>
                  <p className="text-xs text-muted-foreground">Ocupação</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-4 rounded-2xl border-0 bg-gradient-to-br from-success/10 to-success/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-success/20">
                  <BedDouble className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.available}</p>
                  <p className="text-xs text-muted-foreground">Disponíveis</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-4 rounded-2xl border-0 bg-gradient-to-br from-accent/10 to-accent/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent/20">
                  <Users className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.occupied}</p>
                  <p className="text-xs text-muted-foreground">Ocupados</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-4 rounded-2xl border-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20">
                  <ArrowDownToLine className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.checkIns}</p>
                  <p className="text-xs text-muted-foreground">Check-ins</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-4 rounded-2xl border-0 bg-gradient-to-br from-amber-500/10 to-amber-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20">
                  <ArrowUpFromLine className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.checkOuts}</p>
                  <p className="text-xs text-muted-foreground">Check-outs</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-4 rounded-2xl border-0 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20">
                  <FileText className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.longStay}</p>
                  <p className="text-xs text-muted-foreground">Long Stay</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-4 rounded-2xl border-0 bg-gradient-to-br from-destructive/10 to-destructive/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-destructive/20">
                  <Ban className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.maintenance}</p>
                  <p className="text-xs text-muted-foreground">Bloqueados</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Hints & Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MousePointer2 className="h-4 w-4" />
                <span>Clique nas células para criar reserva</span>
              </div>
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4" />
                <span>Arraste para mover reservas</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-muted-foreground font-medium">Tipo de Estadia:</span>
              {Object.entries(stayTypeConfig).map(([type, config]) => (
                <Badge key={type} variant="outline" className={`text-xs ${config.color}`}>
                  {config.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Timeline Grid */}
          <Card className="glass rounded-2xl border-0 overflow-hidden relative">
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">Carregando mapa...</p>
                </div>
              </div>
            )}
            <ScrollArea className="w-full">
              <div className="min-w-max">
                {/* Header */}
                <div className="flex sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border/50">
                  <div className="w-48 min-w-48 p-4 font-semibold text-sm text-foreground border-r border-border/50 flex items-center gap-2">
                    <BedDouble className="h-4 w-4 text-muted-foreground" />
                    Unidades
                  </div>
                  <div className="flex">
                    {days.map((day, i) => {
                      const occupancy = getOccupancyRate(day);
                      return (
                        <div
                          key={i}
                          className={`w-16 min-w-16 text-center border-r border-border/30 transition-colors ${isToday(day) ? "bg-primary/10" : isWeekend(day) ? "bg-muted/30" : "bg-transparent"
                            }`}
                        >
                          <div className={`text-[10px] uppercase tracking-wider py-1.5 ${isToday(day) ? "text-primary font-bold" : "text-muted-foreground"}`}>
                            {getDayOfWeek(day)}
                          </div>
                          <div className={`text-lg font-bold pb-1 ${isToday(day) ? "text-primary" : "text-foreground"}`}>
                            {format(day, "d")}
                          </div>
                          <div className={`text-[10px] pb-2 ${occupancy >= 80 ? "text-destructive font-medium" : occupancy >= 50 ? "text-warning font-medium" : "text-success"}`}>
                            {occupancy}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Categories and Rooms */}
                {filteredCategories.map(category => {
                  const typeConfig = propertyTypeConfig[category.propertyType as keyof typeof propertyTypeConfig];
                  const TypeIcon = typeConfig?.icon || Hotel;

                  return (
                    <div key={category.id}>
                      {/* Category Header */}
                      <div
                        className="flex border-b border-border/30 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-all group"
                        onClick={() => toggleCategory(category.id)}
                      >
                        <div className="w-48 min-w-48 p-3 flex items-center gap-3 font-semibold text-sm border-r border-border/50">
                          <div className="w-1 h-6 rounded-full transition-all group-hover:h-8" style={{ backgroundColor: category.color }} />
                          <div className="flex items-center gap-2 flex-1">
                            {expandedCategories.includes(category.id) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-foreground">{category.name}</span>
                          </div>
                          <Badge variant="outline" className={`text-xs ${typeConfig?.bgLight}`}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {category.rooms.length}
                          </Badge>
                        </div>
                        <div className="flex">
                          {days.map((day, i) => (
                            <div
                              key={i}
                              className={`w-16 min-w-16 flex items-center justify-center text-xs py-3 border-r border-border/30 ${isToday(day) ? "bg-primary/5" : isWeekend(day) ? "bg-muted/20" : ""
                                }`}
                            >
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getAvailableCount(category.id, day) === 0
                                ? "bg-destructive/20 text-destructive"
                                : getAvailableCount(category.id, day) <= 2
                                  ? "bg-warning/20 text-warning"
                                  : "bg-success/20 text-success"
                                }`}>
                                {getAvailableCount(category.id, day)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rooms */}
                      {expandedCategories.includes(category.id) && category.rooms.map(room => (
                        <div key={room.id} className="flex border-b border-border/20 hover:bg-muted/10 transition-colors">
                          <div className="w-48 min-w-48 p-3 flex items-center gap-3 text-sm border-r border-border/50">
                            <div className={`w-2 h-2 rounded-full ${room.status === "available" ? "bg-success" :
                              room.status === "maintenance" ? "bg-destructive animate-pulse" :
                                room.status === "cleaning" ? "bg-warning" : "bg-muted"
                              }`} />
                            <span className="font-semibold text-foreground">{room.number}</span>
                            {room.status === "maintenance" && (
                              <Tooltip>
                                <TooltipTrigger><Wrench className="h-3.5 w-3.5 text-destructive" /></TooltipTrigger>
                                <TooltipContent>Em manutenção</TooltipContent>
                              </Tooltip>
                            )}
                            {room.status === "cleaning" && (
                              <Tooltip>
                                <TooltipTrigger><Sparkles className="h-3.5 w-3.5 text-warning" /></TooltipTrigger>
                                <TooltipContent>Em limpeza</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <div className="flex relative">
                            {days.map((day, i) => {
                              const reservation = getReservationForRoomAndDay(room.id, day);
                              const isStart = reservation && isReservationStart(room.id, day);
                              const span = isStart ? getReservationSpan(reservation, day) : 0;
                              const isDragOver = dragOverCell?.roomId === room.id && isSameDay(dragOverCell.day, day);
                              const isSelected = isCellInSelection(room.id, day);

                              // Validação mais rigorosa: Não permite selecionar se houver reserva
                              // E se for hoje, não permite se estiver em limpeza, manutenção ou bloqueado
                              const isUnavailableToday = isToday(day) && (room.status === "cleaning" || room.status === "maintenance" || room.status === "blocked");
                              const canSelect = !reservation && !isUnavailableToday && room.status !== "maintenance" && room.status !== "blocked";

                              return (
                                <div
                                  key={i}
                                  onClick={() => canSelect && handleCellClick(room.id, day, category.id)}
                                  onMouseEnter={() => selectionStart && setHoveredCell({ roomId: room.id, day })}
                                  onMouseLeave={() => setHoveredCell(null)}
                                  className={`w-16 min-w-16 h-12 border-r border-border/20 relative transition-all ${isToday(day) ? "bg-primary/5" : isWeekend(day) ? "bg-muted/10" : ""
                                    } ${isDragOver && !reservation ? "bg-primary/20 ring-2 ring-primary ring-inset" : ""}
                                  ${isSelected ? "bg-primary/30" : ""}
                                  ${canSelect ? "cursor-pointer hover:bg-primary/10" : ""}`}
                                  onDragOver={(e) => handleDragOver(e, room.id, day)}
                                  onDragLeave={handleDragLeave}
                                  onDrop={(e) => handleDrop(e, room.id, day)}
                                >
                                  {isStart && reservation && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          draggable
                                          onDragStart={(e) => handleDragStart(e, reservation)}
                                          onDragEnd={handleDragEnd}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setModalInitialData({
                                              id: reservation.id,
                                              guestId: reservation.guestId,
                                              guestName: reservation.guestName,
                                              checkIn: format(reservation.checkIn, "yyyy-MM-dd"),
                                              checkOut: format(reservation.checkOut, "yyyy-MM-dd"),
                                              roomId: reservation.roomId,
                                              category: room.categoryId,
                                              channel: reservation.channel,
                                              reservationStatus: reservation.status,
                                            });
                                            setEditingReservation(reservation);
                                            setShowNewReservationModal(true);
                                          }}
                                          className={`absolute top-1.5 left-0.5 h-9 bg-gradient-to-r ${channelColors[reservation.channel]} rounded-lg flex items-center px-2 text-xs text-white font-medium shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all overflow-hidden group/res ${draggingReservation?.id === reservation.id ? "opacity-50 scale-95" : ""
                                            }`}
                                          style={{ width: `calc(${span * 64}px - 4px)`, minWidth: "60px" }}
                                        >
                                          <GripVertical className="h-3 w-3 mr-1 opacity-50 group-hover/res:opacity-100 flex-shrink-0" />
                                          <span className="truncate">{reservation.guestName.split(' ')[0]}</span>
                                          {reservation.stayType !== 'daily' && (
                                            <Badge variant="secondary" className={`ml-1 text-[8px] px-1 py-0 ${stayTypeConfig[reservation.stayType].color}`}>
                                              {stayTypeConfig[reservation.stayType].label}
                                            </Badge>
                                          )}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-xs">
                                        <div className="space-y-1">
                                          <p className="font-semibold">{reservation.guestName}</p>
                                          <p className="text-xs">
                                            {format(reservation.checkIn, "dd/MM")} - {format(reservation.checkOut, "dd/MM")} ({differenceInDays(reservation.checkOut, reservation.checkIn)} noites)
                                          </p>
                                          <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={`text-xs ${stayTypeConfig[reservation.stayType].color}`}>
                                              {stayTypeConfig[reservation.stayType].label}
                                            </Badge>
                                            {reservation.contractValue && (
                                              <span className="text-xs text-success">R$ {reservation.contractValue.toLocaleString()}</span>
                                            )}
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </Card>

          {/* Channel Legend */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-muted-foreground font-medium">Canais:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-primary/80" />
              <span className="text-foreground">Direto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
              <span className="text-foreground">Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-500 to-rose-600" />
              <span className="text-foreground">Airbnb</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600" />
              <span className="text-foreground">Expedia</span>
            </div>
          </div>
        </div>

        <NewReservationModal
          open={showNewReservationModal}
          onOpenChange={(open) => {
            setShowNewReservationModal(open);
            if (!open) {
              setEditingReservation(null);
              setModalInitialData(undefined);
            }
          }}
          initialData={modalInitialData}
          mode={editingReservation ? "edit" : "create"}
          onSave={() => {
            fetchData();
            setShowNewReservationModal(false);
          }}
        />
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default OccupancyMap;
