import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  User,
  Phone,
  Mail,
  CreditCard,
  CalendarCheck,
  CalendarX,
  Clock,
  Download,
  Hotel,
  Building2,
  Home,
  Palmtree,
  Sparkles,
  FileText,
  CalendarDays,
} from "lucide-react";
import { CheckInModal } from "@/components/dashboard/CheckInModal";
import { NewReservationModal } from "@/components/reservations/NewReservationModal";
import { ReservationDetailsModal } from "@/components/reservations/ReservationDetailsModal";

type PropertyType = 'all' | 'hotel' | 'apart-hotel' | 'loft' | 'temporada';
type StayType = 'daily' | 'weekly' | 'monthly' | 'longstay';

interface Reservation {
  id: string;
  guest: string;
  email: string;
  phone: string;
  room: string;
  roomType: string;
  propertyType: PropertyType;
  stayType: StayType;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  status: "confirmed" | "pending" | "checkin" | "checkout" | "cancelled" | "checked_in" | "checked_out";
  amount: number;
  paid: number;
  commissionAmount?: number;
  channel: string;
  createdAt: string;
  contractValue?: number;
  document?: string;
  address?: string;
  rg?: string;
  guestId?: number;
  unitId?: number;
  propertyId?: number;
  dbId?: number;
  adults?: number;
  children?: number;
  propertyName?: string;
  unitNumber?: string;
}

const propertyTypeConfig = {
  hotel: { label: 'Hotel', icon: Hotel, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  'apart-hotel': { label: 'Apart-Hotel', icon: Building2, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  loft: { label: 'Loft', icon: Home, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  temporada: { label: 'Temporada', icon: Palmtree, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
};

const stayTypeConfig = {
  daily: { label: 'Diária', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  weekly: { label: 'Semanal', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  monthly: { label: 'Mensal', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  longstay: { label: 'Long Stay', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Confirmada", className: "bg-primary/10 text-primary" },
  pending: { label: "Pendente", className: "bg-warning/10 text-warning" },
  checked_in: { label: "Check-in", className: "bg-success/10 text-success" },
  checked_out: { label: "Check-out", className: "bg-accent/10 text-accent" },
  cancelled: { label: "Cancelada", className: "bg-destructive/10 text-destructive" },
  // Mapeamento para legacy status se necessário
  checkin: { label: "Check-in", className: "bg-success/10 text-success" },
  checkout: { label: "Check-out", className: "bg-accent/10 text-accent" },
};

const channelColors: Record<string, string> = {
  "Booking.com": "bg-blue-500/10 text-blue-600",
  "Direto": "bg-success/10 text-success",
  "Airbnb": "bg-rose-500/10 text-rose-600",
  "Expedia": "bg-yellow-500/10 text-yellow-600",
};

export default function Reservations() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [editReservationModalOpen, setEditReservationModalOpen] = useState(false);
  const [editingReservationData, setEditingReservationData] = useState<any>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset pagination when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };


  const handleEditReservation = async (idToEdit?: number) => {
    const targetId = idToEdit || selectedReservation?.dbId;
    if (!targetId) return;

    try {
      const response = await api.getReservationById(targetId);
      const fullRes = response.data.reservation;

      const normalizePaymentMethod = (method: string): string => {
        if (!method) return "";
        const lower = method.toLowerCase();
        if (lower.includes("crédito") || lower.includes("credit")) return "credit";
        if (lower.includes("débito") || lower.includes("debit")) return "debit";
        if (lower.includes("dinheiro") || lower.includes("cash") || lower.includes("money") || lower.includes("espécie")) return "cash";
        if (lower.includes("pix")) return "pix";
        if (lower.includes("transfer") || lower.includes("ted") || lower.includes("doc")) return "transfer";
        if (lower.includes("faturado") || lower.includes("invoice") || lower.includes("boleto")) return "invoice";
        return method; // Fallback to original
      };

      const normalizeChannel = (ch: string): string => {
        if (!ch) return "direct";
        const lower = ch.toLowerCase();
        if (lower.includes("booking")) return "booking";
        if (lower.includes("airbnb")) return "airbnb";
        if (lower.includes("expedia")) return "expedia";
        if (lower.includes("decolar")) return "decolar";
        if (lower.includes("cvc")) return "cvc";
        if (lower.includes("site") || lower.includes("website") || lower.includes("direto")) return "direct";
        if (lower.includes("whatsapp")) return "whatsapp";
        if (lower.includes("instagram")) return "instagram";
        return "other"; // Default to 'other' or keep original if you have more IDs
      };

      const mappedData = {
        id: fullRes.id?.toString(),
        guestId: fullRes.guest?.id?.toString(),
        guestName: fullRes.guest?.firstName ? `${fullRes.guest.firstName} ${fullRes.guest.lastName}` : fullRes.guest?.name,
        guestEmail: fullRes.guest?.email,
        guestPhone: fullRes.guest?.phone,
        guestCPF: fullRes.guest?.documentNumber,
        guestAddress: fullRes.guest?.address,
        guestCity: fullRes.guest?.city,
        guestState: fullRes.guest?.state,
        guestZipCode: fullRes.guest?.zipCode,
        guestCountry: fullRes.guest?.country,
        guestEmergencyName: fullRes.guest?.emergencyContactName,
        guestEmergencyPhone: fullRes.guest?.emergencyContactPhone,
        guestBirthdate: fullRes.guest?.birthDate ? new Date(fullRes.guest.birthDate).toISOString().split('T')[0] : '',
        guestOccupation: fullRes.guest?.occupation || fullRes.guest?.profession || '',
        guestCompany: fullRes.guest?.companyName || fullRes.guest?.company || '',
        guestNotes: fullRes.guest?.notes || '',

        checkIn: new Date(fullRes.checkIn).toISOString().split('T')[0],
        checkOut: new Date(fullRes.checkOut).toISOString().split('T')[0],
        checkInTime: fullRes.checkInTime || '14:00',
        checkOutTime: fullRes.checkOutTime || '12:00',

        adults: (fullRes.adults || 1).toString(),
        children: (fullRes.children || 0).toString(),
        infants: (fullRes.infants || 0).toString(),

        purposeOfStay: fullRes.purposeOfStay || '',
        specialOccasion: fullRes.specialOccasion || '',
        bookingSource: fullRes.bookingSource || fullRes.source || 'website',

        unitId: fullRes.unit?.id?.toString(),
        roomId: fullRes.unit?.id?.toString(),
        category: (fullRes.unit?.roomType?.id || fullRes.unit?.roomTypeId)?.toString(),
        propertyId: fullRes.property?.id?.toString(),
        propertyType: fullRes.property?.type,

        // Room Preferences
        floorPreference: fullRes.floorPreference || '',
        viewPreference: fullRes.viewPreference || '',
        smokingPreference: fullRes.smokingPreference || 'non-smoking',
        accessibilityNeeds: fullRes.accessibilityNeeds || false,
        accessibilityNotes: fullRes.accessibilityNotes || '',
        petDetails: fullRes.petDetails || '',

        internalNotes: fullRes.internalNotes,
        specialRequests: fullRes.specialRequests,

        // Services & Extras
        selectedExtras: (fullRes.items || []).map((item: any) => ({
          // We use 'reservationItemId' to track the DB row, but 'id' should conceptually match the Catalog ID for the UI
          // Since we might not have the original Extra ID stored, we rely on Name matching in the modal
          reservationItemId: item.id,
          name: item.name,
          price: item.unitPrice,
          quantity: item.quantity,
          category: item.type,
          pricingType: 'fixed', // Default, logic should handle enrichment
          isExisting: true, // Flag to indicate it came from DB
        })),

        totalAmount: parseFloat(fullRes.totalAmount),
        paidAmount: parseFloat(fullRes.paidAmount),
        balance: parseFloat(fullRes.balance || 0),

        // Financials
        paymentMethod: normalizePaymentMethod(fullRes.paymentMethod),
        paymentId: fullRes.paymentId || fullRes.payment_id || null,
        paymentStatus: fullRes.paymentStatus || 'pending',
        installments: (fullRes.installments || 1).toString(),
        depositAmount: parseFloat(fullRes.depositAmount || 0),
        depositPaid: fullRes.depositPaid || false,
        depositDueDate: fullRes.depositDueDate ? new Date(fullRes.depositDueDate).toISOString().split('T')[0] : '',
        paymentNotes: fullRes.paymentNotes || '',
        discount: parseFloat(fullRes.discount || 0),
        discountType: fullRes.discountType || 'percent',
        discountReason: fullRes.discountReason || '',

        // Agency / OTA
        isAgency: fullRes.isAgency || false,
        agencyName: fullRes.agencyName || '',
        agencyContact: fullRes.agencyContact || '',
        agencyEmail: fullRes.agencyEmail || '',
        agencyCommission: (fullRes.agencyCommission || 0).toString(),
        externalId: fullRes.externalId || '',
        voucherNumber: fullRes.voucherNumber || '',
        agencyNotes: fullRes.agencyNotes || '',

        // Confirmation
        sendEmailConfirmation: fullRes.sendEmailConfirmation || false,
        sendWhatsAppConfirmation: fullRes.sendWhatsAppConfirmation || false,
        sendSMSConfirmation: fullRes.sendSMSConfirmation || false,
        printConfirmation: fullRes.printConfirmation || false,
        agreedToTerms: fullRes.agreedToTerms || false,
        agreedToPrivacy: fullRes.agreedToPrivacy || false,
        marketingOptIn: fullRes.marketingOptIn || false,
        operatorName: fullRes.operatorName || '',
        confirmationNotes: fullRes.confirmationNotes || '',
        reservationStatus: fullRes.status || 'pending', // Important: status mapping

        channelId: fullRes.channelId || fullRes.channel_id || null, // Add mapping
        bookingChannel: normalizeChannel(fullRes.channel || fullRes.bookingSource || 'direct'),
        channel: normalizeChannel(fullRes.channel || fullRes.bookingSource || 'direct'),
      };

      setEditingReservationData(mappedData);
      setEditReservationModalOpen(true);
    } catch (error) {
      console.error("Error fetching reservation details:", error);
    }
  };

  const { data: reservationsData, isLoading, refetch } = useQuery({
    queryKey: ["reservations"],
    queryFn: () => api.getReservations(),
  });

  const reservations = (reservationsData?.data?.reservations || []).map((res: any) => ({
    id: res.reservationNumber || `RES-${res.id}`,
    guest: res.guest?.name || "Hóspede",
    email: res.guest?.email || "",
    phone: res.guest?.phone || "",
    room: res.unit?.name || res.unit?.number || "N/A",
    unitNumber: res.unit?.number || "",
    roomType: res.unit?.roomType?.name || "N/A",
    propertyType: (res.property?.type || "hotel") as PropertyType,
    propertyName: res.property?.name || "Principal",
    stayType: (res.stayType || "daily") as StayType,
    checkIn: res.checkIn,
    checkOut: res.checkOut,
    nights: res.nights || 0,
    guests: (res.adults || 0) + (res.children || 0),
    status: res.status,
    amount: parseFloat(res.totalAmount || 0),
    paid: parseFloat(res.paidAmount || 0),
    commissionAmount: parseFloat(res.commissionAmount ?? res.commission_amount ?? 0) || undefined,
    channel: res.channel || "Direto",
    createdAt: res.createdAt,
    contractValue: res.contractValue ? parseFloat(res.contractValue) : undefined,
    document: res.guest?.documentNumber || "",
    address: [res.guest?.city, res.guest?.state].filter(Boolean).join(" - "),
    guestId: res.guest?.id,
    unitId: res.unit?.id,
    propertyId: res.property?.id,
    dbId: res.id,
    adults: res.adults,
    children: res.children,
  }));

  const filteredReservations = reservations.filter((res: any) => {
    const matchesStatus = selectedStatus === "all" || res.status === selectedStatus ||
      (selectedStatus === 'checkin' && res.status === 'checked_in') ||
      (selectedStatus === 'checkout' && res.status === 'checked_out');
    const matchesPropertyType = selectedPropertyType === "all" || res.propertyType === selectedPropertyType;
    const matchesSearch =
      res.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.room.includes(searchQuery);
    return matchesStatus && matchesSearch && matchesPropertyType;
    return matchesStatus && matchesSearch && matchesPropertyType;
  });

  // Calculate Pagination Slices
  const totalItems = filteredReservations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReservations = filteredReservations.slice(startIndex, endIndex);

  // Effect to reset pagination when filters change
  // Note: We can wrapper set functions or use useEffect. 
  // Using simplified approach: Call handleFilterChange on inputs.
  // Actually, better to use useEffect on search/status/type changes.

  // Handlers for pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


  const stats = {
    total: reservations.length,
    confirmed: reservations.filter((r: Reservation) => r.status === "confirmed").length,
    pending: reservations.filter((r: Reservation) => r.status === "pending").length,
    checkin: reservations.filter((r: Reservation) => r.status === "checkin" || r.status === "checked_in").length,
    checkout: reservations.filter((r: Reservation) => r.status === "checkout" || r.status === "checked_out").length,
    longstay: reservations.filter((r: Reservation) => r.stayType === "longstay").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reservas Híbridas</h1>
            <p className="text-muted-foreground">Gerencie reservas de hotéis, apart-hotéis, lofts e temporada</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>

          </div>
        </div>

        {/* Property Type Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedPropertyType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setSelectedPropertyType('all'); setCurrentPage(1); }}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Todos
            <Badge variant="secondary" className="ml-1">{reservations.length}</Badge>
          </Button>
          {Object.entries(propertyTypeConfig).map(([type, config]) => {
            const Icon = config.icon;
            const count = reservations.filter((r: Reservation) => r.propertyType === type).length;
            return (
              <Button
                key={type}
                variant={selectedPropertyType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setSelectedPropertyType(type as PropertyType); setCurrentPage(1); }}
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
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
          <button
            onClick={() => { setSelectedStatus("all"); setCurrentPage(1); }}
            className={cn(
              "p-4 rounded-xl border transition-all text-left",
              selectedStatus === "all"
                ? "bg-primary/10 border-primary"
                : "bg-card border-border hover:border-primary/50"
            )}
          >
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </button>
          <button
            onClick={() => { setSelectedStatus("confirmed"); setCurrentPage(1); }}
            className={cn(
              "p-4 rounded-xl border transition-all text-left",
              selectedStatus === "confirmed"
                ? "bg-primary/10 border-primary"
                : "bg-card border-border hover:border-primary/50"
            )}
          >
            <p className="text-2xl font-bold text-primary">{stats.confirmed}</p>
            <p className="text-sm text-muted-foreground">Confirmadas</p>
          </button>
          <button
            onClick={() => { setSelectedStatus("pending"); setCurrentPage(1); }}
            className={cn(
              "p-4 rounded-xl border transition-all text-left",
              selectedStatus === "pending"
                ? "bg-warning/10 border-warning"
                : "bg-card border-border hover:border-warning/50"
            )}
          >
            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </button>
          <button
            onClick={() => { setSelectedStatus("checkin"); setCurrentPage(1); }}
            className={cn(
              "p-4 rounded-xl border transition-all text-left",
              selectedStatus === "checkin"
                ? "bg-success/10 border-success"
                : "bg-card border-border hover:border-success/50"
            )}
          >
            <p className="text-2xl font-bold text-success">{stats.checkin}</p>
            <p className="text-sm text-muted-foreground">Check-in</p>
          </button>
          <button
            onClick={() => { setSelectedStatus("checkout"); setCurrentPage(1); }}
            className={cn(
              "p-4 rounded-xl border transition-all text-left",
              selectedStatus === "checkout"
                ? "bg-accent/10 border-accent"
                : "bg-card border-border hover:border-accent/50"
            )}
          >
            <p className="text-2xl font-bold text-accent">{stats.checkout}</p>
            <p className="text-sm text-muted-foreground">Check-out</p>
          </button>
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-left">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              <p className="text-2xl font-bold text-emerald-500">{stats.longstay}</p>
            </div>
            <p className="text-sm text-muted-foreground">Long Stay</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome, código ou unidade..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Dezembro 2024</span>
            </div>
            <Button variant="outline" size="icon">
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Stay Type Legend */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted-foreground font-medium">Tipo de Estadia:</span>
          {Object.entries(stayTypeConfig).map(([type, config]) => (
            <Badge key={type} variant="outline" className={`text-xs ${config.color}`}>
              {config.label}
            </Badge>
          ))}
        </div>

        {/* Reservations Table */}
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reserva</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Criada em</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Hóspede</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Unidade</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Período</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Valor</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Canal</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedReservations.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-muted-foreground">
                      Nenhuma reserva encontrada para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  paginatedReservations.map((reservation: Reservation) => {
                    const propConfig = propertyTypeConfig[reservation.propertyType as keyof typeof propertyTypeConfig];
                    const PropIcon = propConfig?.icon || Hotel;
                    const stayConfig = stayTypeConfig[reservation.stayType];

                    return (
                      <tr
                        key={reservation.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedReservation(reservation)}
                      >
                        <td className="p-4">
                          <p className="font-medium text-foreground">{reservation.id}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarDays className="w-4 h-4" />
                            <span className="text-sm">
                              {new Date(reservation.createdAt).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-semibold text-primary-foreground">
                              {reservation.guest.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{reservation.guest}</p>
                              <p className="text-xs text-muted-foreground">{reservation.guests} hóspede(s)</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 font-medium text-sm">
                              <PropIcon className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>{reservation.propertyName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <Badge variant="secondary" className="px-1.5 py-0.5 h-6">
                                Quarto {reservation.unitNumber || reservation.room}
                              </Badge>
                              <span className="text-muted-foreground truncate max-w-[120px]" title={reservation.roomType}>
                                {reservation.roomType}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={`text-xs ${stayConfig.color}`}>
                            {stayConfig.label}
                          </Badge>
                          {reservation.contractValue && (
                            <p className="text-xs text-emerald-500 mt-1">
                              R$ {reservation.contractValue.toLocaleString("pt-BR")}/mês
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <CalendarCheck className="w-4 h-4 text-success" />
                            <span className="text-sm">
                              {new Date(reservation.checkIn).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <CalendarX className="w-4 h-4 text-destructive" />
                            <span className="text-sm">
                              {new Date(reservation.checkOut).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{reservation.nights} noite(s)</p>
                        </td>
                        <td className="p-4">
                          <div className="space-y-0.5 font-mono tabular-nums">
                            <p className="text-base font-semibold text-foreground">
                              R$ {reservation.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              − Pago: R$ {reservation.paid.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            {(reservation.commissionAmount ?? 0) > 0 && (
                              <p className="text-xs text-amber-600 dark:text-amber-400">
                                − Comissão: R$ {reservation.commissionAmount!.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            )}
                            <p className="text-xs font-medium text-foreground pt-0.5">
                              Restante: R$ {(Math.max(0, reservation.amount - reservation.paid - (reservation.commissionAmount ?? 0))).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={cn("inline-flex px-2 py-1 rounded-lg text-xs font-medium", channelColors[reservation.channel] || "bg-muted text-muted-foreground")}>
                            {reservation.channel}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={cn("inline-flex px-2.5 py-1 rounded-full text-xs font-medium", statusConfig[reservation.status].className)}>
                            {statusConfig[reservation.status].label}
                          </span>
                        </td>
                        <td className="p-4">
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} reservas
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                Anterior
              </Button>

              {/* Dynamic Page Numbers - Simplified: Show Current, maybe Prev/Next if exist */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Logic to center current page or show window
                let pNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pNum = currentPage - 2 + i;
                }
                if (pNum > totalPages) return null; // Prevent overflow

                return (
                  <Button
                    key={pNum}
                    variant={currentPage === pNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pNum)}
                    className={currentPage === pNum ? "bg-primary text-primary-foreground" : ""}
                  >
                    {pNum}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => goToPage(currentPage + 1)}
              >
                Próximo
              </Button>
            </div>
          </div>
        </div>

        {/* Reservation Detail Modal */}
        <ReservationDetailsModal
          open={!!selectedReservation}
          onOpenChange={(open) => !open && setSelectedReservation(null)}
          reservationId={selectedReservation?.dbId}
          onEdit={() => {
            if (selectedReservation?.dbId) {
              handleEditReservation(selectedReservation.dbId);
              setSelectedReservation(null);
            }
          }}
          onCheckIn={() => {
            setCheckInModalOpen(true);
          }}
          onCheckOut={() => {
            console.log("Check-out clicked");
          }}
          onCancel={() => {
            queryClient.invalidateQueries({ queryKey: ["reservations"] });
            refetch();
          }}
        />

        <CheckInModal
          open={checkInModalOpen}
          onOpenChange={setCheckInModalOpen}
          initialReservation={selectedReservation ? {
            id: selectedReservation.dbId, // Use numeric ID instead of reservation number
            guest: selectedReservation.guest,
            room: selectedReservation.room,
            checkIn: new Date(selectedReservation.checkIn).toISOString().split('T')[0],
            checkOut: new Date(selectedReservation.checkOut).toISOString().split('T')[0],
            guests: selectedReservation.guests,
            status: selectedReservation.status,
            preCheckinDone: false,
            total: selectedReservation.amount,
            email: selectedReservation.email,
            phone: selectedReservation.phone,
            document: selectedReservation.document,
            address: selectedReservation.address,
            paid: selectedReservation.paid,
            roomType: selectedReservation.roomType,
            rg: "",
          } : undefined}
        />

        <NewReservationModal
          open={editReservationModalOpen}
          onOpenChange={setEditReservationModalOpen}
          mode={editingReservationData ? "edit" : "create"}
          initialData={editingReservationData}
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ["reservations"] });
            refetch(); // Force refetch immediately
          }}
        />
      </div>
    </DashboardLayout>
  );
}
