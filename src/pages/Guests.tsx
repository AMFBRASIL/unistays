import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api, type GuestLoyaltyHistoryItem } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  MessageSquare,
  User,
  CreditCard,
  Clock,
  ChevronRight,
  ChevronLeft,
  Heart,
  Award,
  TrendingUp,
  Coins,
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
  X,
  SortAsc,
} from "lucide-react";
import { toast } from "sonner";
import { NewGuestModal } from "@/components/guests/NewGuestModal";
import { NewReservationModal } from "@/components/reservations/NewReservationModal";
import { SendMessageModal } from "@/components/guests/SendMessageModal";

interface Guest {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  nationality: string;
  city: string;
  totalStays: number;
  totalSpent: number;
  lastStay: string;
  nextStay?: string;
  rating: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  tags: string[];
  preferences: string[];
  avatar?: string;
  createdAt: string;
  // Extended fields
  address?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  type?: "physical" | "legal";
  whatsapp?: string;
  companyName?: string;
  tradeName?: string;
  stateRegistration?: string;
  cnpj?: string;
  contactName?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  memberSince?: string;
  marketingEmail?: boolean;
  marketingSms?: boolean;
  marketingWhatsapp?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyRelation?: string;
  birthDate?: string;
  gender?: string;
  occupation?: string;
  notes?: string;
  loyaltyPoints?: number;
}



const tierConfig = {
  bronze: { label: "Bronze", color: "text-amber-700", bg: "bg-amber-100", icon: "🥉" },
  silver: { label: "Prata", color: "text-slate-500", bg: "bg-slate-100", icon: "🥈" },
  gold: { label: "Ouro", color: "text-yellow-600", bg: "bg-yellow-100", icon: "🥇" },
  platinum: { label: "Platina", color: "text-purple-600", bg: "bg-purple-100", icon: "💎" },
};

export default function Guests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("recent");
  const [filterCity, setFilterCity] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isNewGuestModalOpen, setIsNewGuestModalOpen] = useState(false);
  const [isNewReservationModalOpen, setIsNewReservationModalOpen] = useState(false);
  const [isSendMessageModalOpen, setIsSendMessageModalOpen] = useState(false);
  const [guestToEdit, setGuestToEdit] = useState<Guest | null>(null);
  const [loyaltyHistoryOpen, setLoyaltyHistoryOpen] = useState(false);
  const [addRemovePointsOpen, setAddRemovePointsOpen] = useState(false);
  const [addRemoveOperation, setAddRemoveOperation] = useState<"credit" | "debit">("credit");
  const [addRemovePoints, setAddRemovePoints] = useState("");
  const [addRemoveDescription, setAddRemoveDescription] = useState("");
  const [addRemoveSubmitting, setAddRemoveSubmitting] = useState(false);
  const [removeGuestDialogOpen, setRemoveGuestDialogOpen] = useState(false);
  const [removeGuestDeleting, setRemoveGuestDeleting] = useState(false);
  const queryClient = useQueryClient();
  const ITEMS_PER_PAGE = 6;

  const sortMap: Record<string, string | undefined> = {
    recent: undefined,
    oldest: "oldest",
    name_asc: "name_asc",
    name_desc: "name_desc",
    stays_desc: "stays_desc",
    spent_desc: "spent_desc",
  };

  const { data: guestsData, refetch, isFetching } = useQuery({
    queryKey: ["guests", searchQuery, selectedTier, currentPage, sortBy, filterCity],
    queryFn: async () => {
      const response = await api.getGuests({
        search: searchQuery || undefined,
        tier: selectedTier !== "all" ? selectedTier : undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        city: filterCity || undefined,
        sort: sortMap[sortBy],
      });
      if (response.success && response.data) {
        const guests = response.data.guests.map((g: any) => ({
          id: g.id,
          uuid: g.uuid,
          name: `${g.firstName} ${g.lastName}`,
          email: g.email || "",
          phone: g.phone || "",
          document: g.documentNumber || "",
          nationality: g.nationality || "",
          city: g.city || "",
          totalStays: g.totalStays || 0,
          totalSpent: parseFloat(g.totalSpent || "0"),
          lastStay: g.createdAt,
          rating: 5,
          tier: g.tier,
          tags: g.tags || [],
          preferences: g.preferences || [],
          createdAt: g.createdAt,
          nextStay: undefined,
          address: g.address,
          state: g.state,
          zipCode: g.zipCode,
          country: g.country,
          type: g.type,
          whatsapp: g.whatsapp,
          companyName: g.companyName,
          tradeName: g.tradeName,
          stateRegistration: g.stateRegistration,
          cnpj: g.cnpj,
          contactName: g.contactName,
          addressNumber: g.addressNumber,
          addressComplement: g.addressComplement,
          addressNeighborhood: g.addressNeighborhood,
          memberSince: g.memberSince,
          marketingEmail: g.marketingEmail,
          marketingSms: g.marketingSms,
          marketingWhatsapp: g.marketingWhatsapp,
          emergencyContactName: g.emergencyContactName,
          emergencyContactPhone: g.emergencyContactPhone,
          emergencyRelation: g.emergencyContactRelation,
          birthDate: g.birthDate,
          gender: g.gender,
          occupation: g.occupation,
          avatar: g.avatar,
          notes: g.notes,
          loyaltyPoints: g.loyaltyPoints ?? 0,
        }));
        return { guests, pagination: response.data.pagination };
      }
      return { guests: [], pagination: { page: 1, perPage: ITEMS_PER_PAGE, totalItems: 0, totalPages: 0 } };
    },
  });

  const guests = guestsData?.guests || [];
  const pagination = guestsData?.pagination || { page: 1, perPage: ITEMS_PER_PAGE, totalItems: 0, totalPages: 0 };

  // Reset page on filter change
  const handleSearchChange = useCallback((val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  }, []);
  const handleTierChange = useCallback((val: string) => {
    setSelectedTier(val);
    setCurrentPage(1);
  }, []);
  const handleSortChange = useCallback((val: string) => {
    setSortBy(val);
    setCurrentPage(1);
  }, []);
  const handleCityChange = useCallback((val: string) => {
    setFilterCity(val);
    setCurrentPage(1);
  }, []);
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedTier("all");
    setSortBy("recent");
    setFilterCity("");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = searchQuery || selectedTier !== "all" || filterCity || sortBy !== "recent";

  const { data: loyaltyHistoryData } = useQuery({
    queryKey: ["guest-loyalty-history", selectedGuest?.id],
    queryFn: async () => {
      if (!selectedGuest?.id) return { history: [] };
      const res = await api.getGuestLoyaltyHistory(selectedGuest.id);
      if (res.success && res.data) return res.data;
      return { history: [] };
    },
    enabled: !!selectedGuest?.id && loyaltyHistoryOpen,
  });
  const loyaltyHistory = loyaltyHistoryData?.history ?? [];

  const stats = {
    total: pagination.totalItems,
    platinum: guests.filter((g) => g.tier === "platinum").length,
    gold: guests.filter((g) => g.tier === "gold").length,
    totalRevenue: guests.reduce((acc, g) => acc + g.totalSpent, 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hóspedes</h1>
            <p className="text-muted-foreground">Gerencie o relacionamento com seus hóspedes</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button variant="gradient" className="gap-2" onClick={() => setIsNewGuestModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Novo Hóspede
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total de Hóspedes</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Award className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.platinum}</p>
                <p className="text-sm text-muted-foreground">VIPs Platina</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.gold}</p>
                <p className="text-sm text-muted-foreground">Membros Ouro</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  R$ {(stats.totalRevenue / 1000).toFixed(0)}k
                </p>
                <p className="text-sm text-muted-foreground">Receita Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nome, email, telefone ou documento..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="flex items-center gap-2 p-1 rounded-lg bg-secondary">
              <Button
                variant={selectedTier === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTierChange("all")}
              >
                Todos
              </Button>
              {Object.entries(tierConfig).map(([key, config]) => (
                <Button
                  key={key}
                  variant={selectedTier === key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleTierChange(key)}
                  className="gap-1"
                >
                  <span>{config.icon}</span>
                  <span className="hidden sm:inline">{config.label}</span>
                </Button>
              ))}
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              className="gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </Button>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="p-4 rounded-xl bg-card border border-border space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <SortAsc className="w-4 h-4 text-primary" />
                  Filtros e Ordenação
                </h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3" />
                    Limpar filtros
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Cidade</Label>
                  <Input
                    placeholder="Filtrar por cidade..."
                    value={filterCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="h-9 bg-background/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Ordenar por</Label>
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="h-9 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Mais recentes</SelectItem>
                      <SelectItem value="oldest">Mais antigos</SelectItem>
                      <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
                      <SelectItem value="name_desc">Nome (Z-A)</SelectItem>
                      <SelectItem value="stays_desc">Mais estadias</SelectItem>
                      <SelectItem value="spent_desc">Maior gasto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Resultados</Label>
                  <div className="h-9 flex items-center px-3 rounded-md bg-background/50 border border-input text-sm text-muted-foreground">
                    {pagination.totalItems} hóspede{pagination.totalItems !== 1 ? "s" : ""} encontrado{pagination.totalItems !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Guests Grid */}
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity", isFetching && "opacity-60")}>
          {guests.length === 0 && !isFetching ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Nenhum hóspede encontrado</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {hasActiveFilters
                  ? "Tente ajustar os filtros de busca para encontrar o hóspede desejado."
                  : "Cadastre seu primeiro hóspede clicando no botão acima."}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={clearFilters}>
                  <X className="w-4 h-4" />
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : guests.map((guest) => (
            <div
              key={guest.id}
              onClick={() => setSelectedGuest(guest)}
              className="p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  {guest.avatar ? (
                    <img
                      src={guest.avatar}
                      alt={guest.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center text-lg font-semibold text-primary-foreground">
                      {guest.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 text-lg">{tierConfig[guest.tier].icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground truncate">{guest.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {guest.id}</p>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3.5 h-3.5",
                            i < guest.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{guest.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{guest.city}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Estadias</p>
                    <p className="text-lg font-bold text-foreground">{guest.totalStays}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total Gasto</p>
                    <p className="text-lg font-bold text-success">
                      R$ {guest.totalSpent.toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {guest.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {guest.nextStay && (
                <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2 text-success">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Próxima reserva: {new Date(guest.nextStay).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Mostrando {((pagination.page - 1) * pagination.perPage) + 1}–{Math.min(pagination.page * pagination.perPage, pagination.totalItems)} de {pagination.totalItems} hóspedes
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(1)}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
                <ChevronLeft className="w-4 h-4 -ml-2.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => {
                  if (pagination.totalPages <= 7) return true;
                  if (p === 1 || p === pagination.totalPages) return true;
                  if (Math.abs(p - currentPage) <= 1) return true;
                  return false;
                })
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                    acc.push('...');
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  typeof p === 'string' ? (
                    <span key={`dots-${idx}`} className="px-1 text-muted-foreground text-sm">...</span>
                  ) : (
                    <Button
                      key={p}
                      variant={currentPage === p ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(p)}
                      className={cn("h-9 w-9 p-0", currentPage === p && "pointer-events-none")}
                    >
                      {p}
                    </Button>
                  )
                )}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= pagination.totalPages}
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= pagination.totalPages}
                onClick={() => setCurrentPage(pagination.totalPages)}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="w-4 h-4" />
                <ChevronRight className="w-4 h-4 -ml-2.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Guest Detail Modal */}
        {selectedGuest && (
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedGuest(null)}
          >
            <div
              className="bg-card border border-border rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-full max-h-[90vh]">
                {/* Left Sidebar - Profile */}
                <div className="w-80 flex-shrink-0 bg-gradient-to-b from-primary via-primary/90 to-primary/70 p-6 flex flex-col text-white relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

                  <div className="relative flex-1 flex flex-col">
                    {/* Close Button */}
                    <button
                      onClick={() => setSelectedGuest(null)}
                      className="absolute top-0 right-0 p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Avatar & Name */}
                    <div className="text-center mt-8">
                      <div className="relative inline-block">
                        {selectedGuest.avatar ? (
                          <img
                            src={selectedGuest.avatar}
                            alt={selectedGuest.name}
                            className="w-28 h-28 rounded-full object-cover mx-auto ring-4 ring-white/30"
                          />
                        ) : (
                          <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold mx-auto ring-4 ring-white/30">
                            {selectedGuest.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                        )}
                        <span className="absolute -bottom-2 -right-2 text-4xl">{tierConfig[selectedGuest.tier].icon}</span>
                      </div>
                      <h2 className="text-2xl font-bold mt-4">{selectedGuest.name}</h2>
                      <p className="text-white/70 text-sm">ID: {selectedGuest.id}</p>
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mt-3">
                        {tierConfig[selectedGuest.tier].icon} {tierConfig[selectedGuest.tier].label}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-center gap-1 mt-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-5 h-5",
                              i < selectedGuest.rating ? "text-yellow-300 fill-yellow-300" : "text-white/30"
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-8 grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-center">
                        <p className="text-3xl font-bold">{selectedGuest.totalStays}</p>
                        <p className="text-xs text-white/70 mt-1">Estadias</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-center">
                        <p className="text-3xl font-bold">R$ {(selectedGuest.totalSpent / 1000).toFixed(0)}k</p>
                        <p className="text-xs text-white/70 mt-1">Total Gasto</p>
                      </div>
                    </div>

                    {/* Ticket Médio */}
                    <div className="mt-3 p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-center">
                      <p className="text-2xl font-bold">
                        {selectedGuest.totalStays > 0
                          ? `R$ ${Math.round(selectedGuest.totalSpent / selectedGuest.totalStays).toLocaleString("pt-BR")}`
                          : "—"}
                      </p>
                      <p className="text-xs text-white/70 mt-1">Ticket Médio por Estadia</p>
                    </div>

                    {/* Tags */}
                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                      {selectedGuest.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Cliente desde */}
                    <div className="mt-auto pt-6 text-center text-sm text-white/60">
                      <Calendar className="w-4 h-4 inline-block mr-2" />
                      Cliente desde {new Date(selectedGuest.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>

                {/* Right Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Content Header */}
                  <div className="p-6 border-b border-border bg-gradient-to-r from-muted/30 to-transparent">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Informações do Hóspede
                    </h3>
                    <p className="text-sm text-muted-foreground">Detalhes completos do perfil</p>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Contact Info */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-500/10">
                          <Phone className="w-4 h-4 text-blue-500" />
                        </div>
                        Contato
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                              <Mail className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">E-mail</p>
                              <p className="text-sm font-medium text-foreground">{selectedGuest.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                              <Phone className="w-4 h-4 text-green-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Telefone</p>
                              <p className="text-sm font-medium text-foreground">{selectedGuest.phone}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-violet-500/10">
                              <MapPin className="w-4 h-4 text-violet-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Cidade</p>
                              <p className="text-sm font-medium text-foreground">{selectedGuest.city}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/10">
                              <CreditCard className="w-4 h-4 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Documento</p>
                              <p className="text-sm font-medium text-foreground">{selectedGuest.document}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pontos de fidelidade */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-violet-500/10">
                          <Coins className="w-4 h-4 text-violet-500" />
                        </div>
                        Pontos de fidelidade
                      </h4>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/5 to-violet-600/10 border border-violet-500/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-violet-600">{(selectedGuest.loyaltyPoints ?? 0).toLocaleString()} pts</span>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => {
                                setAddRemoveOperation("credit");
                                setAddRemovePoints("");
                                setAddRemoveDescription("");
                                setAddRemovePointsOpen(true);
                              }}
                            >
                              <ArrowUpCircle className="w-4 h-4 text-green-500" />
                              Adicionar
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => {
                                setAddRemoveOperation("debit");
                                setAddRemovePoints("");
                                setAddRemoveDescription("");
                                setAddRemovePointsOpen(true);
                              }}
                            >
                              <ArrowDownCircle className="w-4 h-4 text-amber-500" />
                              Remover
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => setLoyaltyHistoryOpen(true)}
                            >
                              <History className="w-4 h-4" />
                              Ver histórico
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preferences */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-pink-500/10">
                          <Heart className="w-4 h-4 text-pink-500" />
                        </div>
                        Preferências
                      </h4>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/5 to-pink-600/10 border border-pink-500/20">
                        <div className="flex flex-wrap gap-2">
                          {selectedGuest.preferences.map((pref) => (
                            <span
                              key={pref}
                              className="px-4 py-2 rounded-xl bg-card border border-border text-sm font-medium text-foreground hover:border-pink-500/50 transition-colors"
                            >
                              {pref}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10">
                          <Clock className="w-4 h-4 text-emerald-500" />
                        </div>
                        Histórico de Estadias
                      </h4>
                      <div className="space-y-3">
                        {selectedGuest.nextStay && (
                          <div className="p-4 rounded-xl bg-gradient-to-r from-success/10 to-success/5 border border-success/20 flex items-center gap-4">
                            <div className="p-3 rounded-full bg-success/20">
                              <Calendar className="w-5 h-5 text-success" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">Próxima Reserva</p>
                              <p className="text-sm text-success">{new Date(selectedGuest.nextStay).toLocaleDateString("pt-BR", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div className="p-2 rounded-full bg-success/20">
                              <ChevronRight className="w-5 h-5 text-success" />
                            </div>
                          </div>
                        )}
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-center gap-4">
                          <div className="p-3 rounded-full bg-blue-500/10">
                            <Calendar className="w-5 h-5 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">Última Estadia</p>
                            <p className="text-sm text-muted-foreground">{new Date(selectedGuest.lastStay).toLocaleDateString("pt-BR", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 border-t border-border bg-muted/20 flex flex-wrap gap-3 justify-between">
                    <Button
                      variant="destructive"
                      className="gap-2"
                      onClick={() => setRemoveGuestDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Remover hóspede
                    </Button>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" onClick={() => setSelectedGuest(null)} className="gap-2">
                        Fechar
                      </Button>
                      <Button variant="outline" className="gap-2" onClick={() => setIsSendMessageModalOpen(true)}>
                        <MessageSquare className="w-4 h-4" />
                        Enviar Mensagem
                      </Button>
                      <Button variant="default" className="gap-2" onClick={() => {
                        setGuestToEdit(selectedGuest);
                        setIsNewGuestModalOpen(true);
                      }}>
                        <User className="w-4 h-4" />
                        Editar Perfil
                      </Button>
                      <Button variant="gradient" className="gap-2" onClick={() => setIsNewReservationModalOpen(true)}>
                        <Plus className="w-4 h-4" />
                        Nova Reserva
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmação para remover hóspede */}
        <AlertDialog open={removeGuestDialogOpen} onOpenChange={setRemoveGuestDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover hóspede?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O hóspede <strong>{selectedGuest?.name}</strong> será removido permanentemente do sistema.
                Use apenas se o cadastro tiver sido feito por engano.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={removeGuestDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={removeGuestDeleting}
                onClick={async (e) => {
                  e.preventDefault();
                  if (!selectedGuest) return;
                  setRemoveGuestDeleting(true);
                  try {
                    const res = await api.deleteGuest(selectedGuest.id);
                    if (res.success !== false) {
                      setSelectedGuest(null);
                      setRemoveGuestDialogOpen(false);
                      queryClient.invalidateQueries({ queryKey: ["guests"] });
                      toast.success("Hóspede removido com sucesso.");
                    } else {
                      toast.error(res.error?.message || "Erro ao remover hóspede.");
                    }
                  } catch (err) {
                    console.error("Erro ao remover hóspede:", err);
                    toast.error("Erro ao remover hóspede. Tente novamente.");
                  } finally {
                    setRemoveGuestDeleting(false);
                  }
                }}
              >
                {removeGuestDeleting ? "Removendo..." : "Remover"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <NewGuestModal
          open={isNewGuestModalOpen}
          onOpenChange={(open) => {
            setIsNewGuestModalOpen(open);
            if (!open) setGuestToEdit(null);
          }}
          onSuccess={() => refetch()}
          guestToEdit={guestToEdit}
        />

        <NewReservationModal
          open={isNewReservationModalOpen}
          onOpenChange={setIsNewReservationModalOpen}
          initialData={selectedGuest ? {
            guestName: selectedGuest.name,
            guestEmail: selectedGuest.email,
            guestPhone: selectedGuest.phone,
            guestCPF: selectedGuest.document,
            guestCity: selectedGuest.city,
            // Map simple fields
          } : undefined}
        />

        <SendMessageModal
          open={isSendMessageModalOpen}
          onOpenChange={setIsSendMessageModalOpen}
          guest={selectedGuest ? {
            id: selectedGuest.id.toString(),
            name: selectedGuest.name,
            email: selectedGuest.email,
            phone: selectedGuest.phone,
            tier: selectedGuest.tier
          } : null}
        />

        {/* Modal Histórico de pontos */}
        <Dialog open={loyaltyHistoryOpen} onOpenChange={setLoyaltyHistoryOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-violet-500" />
                Histórico de pontos de fidelidade
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-2 py-2">
              {loyaltyHistory.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhuma movimentação registrada.</p>
              )}
              {loyaltyHistory.map((item: GuestLoyaltyHistoryItem) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    item.operation === "credit"
                      ? "bg-green-500/5 border-green-500/20"
                      : "bg-amber-500/5 border-amber-500/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.operation === "credit" ? (
                      <ArrowUpCircle className="w-5 h-5 text-green-500 shrink-0" />
                    ) : (
                      <ArrowDownCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {item.operation === "credit" ? "+" : "-"}{item.points} pts
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.description || (item.operation === "credit" ? "Crédito" : "Débito")} · {item.source}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString("pt-BR")} · Saldo após: {item.balanceAfter} pts
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Adicionar/Remover pontos */}
        <Dialog open={addRemovePointsOpen} onOpenChange={(open) => { setAddRemovePointsOpen(open); if (!open) { setAddRemovePoints(""); setAddRemoveDescription(""); } }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {addRemoveOperation === "credit" ? "Adicionar pontos" : "Remover pontos"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="points">Quantidade de pontos</Label>
                <Input
                  id="points"
                  type="number"
                  min={1}
                  value={addRemovePoints}
                  onChange={(e) => setAddRemovePoints(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="Ex: 100"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Motivo (opcional)</Label>
                <Input
                  id="description"
                  value={addRemoveDescription}
                  onChange={(e) => setAddRemoveDescription(e.target.value.slice(0, 500))}
                  placeholder="Ex: Bônus promoção, Resgate, Ajuste"
                  className="mt-1"
                />
              </div>
              {addRemoveOperation === "debit" && selectedGuest && (
                <p className="text-xs text-muted-foreground">
                  Saldo atual: {(selectedGuest.loyaltyPoints ?? 0).toLocaleString()} pts
                </p>
              )}
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setAddRemovePointsOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  disabled={addRemoveSubmitting || !addRemovePoints || parseInt(addRemovePoints, 10) < 1}
                  onClick={async () => {
                    if (!selectedGuest) return;
                    const points = parseInt(addRemovePoints, 10);
                    if (points < 1) return;
                    if (addRemoveOperation === "debit" && points > (selectedGuest.loyaltyPoints ?? 0)) {
                      toast.error("Saldo insuficiente.");
                      return;
                    }
                    setAddRemoveSubmitting(true);
                    try {
                      const res = await api.addGuestLoyaltyPoints(selectedGuest.id, {
                        operation: addRemoveOperation,
                        points,
                        source: "manual",
                        description: addRemoveDescription.trim() || undefined,
                      });
                      if (res.success && res.data) {
                        setSelectedGuest((prev) => prev ? { ...prev, loyaltyPoints: res.data!.newBalance } : null);
                        queryClient.invalidateQueries({ queryKey: ["guests"] });
                        queryClient.invalidateQueries({ queryKey: ["guest-loyalty-history", selectedGuest.id] });
                        setAddRemovePointsOpen(false);
                        setAddRemovePoints("");
                        setAddRemoveDescription("");
                        toast.success(res.message || (addRemoveOperation === "credit" ? "Pontos adicionados." : "Pontos removidos."));
                      } else {
                        toast.error(res.error?.message || "Erro ao atualizar pontos.");
                      }
                    } finally {
                      setAddRemoveSubmitting(false);
                    }
                  }}
                >
                  {addRemoveSubmitting ? "Salvando..." : addRemoveOperation === "credit" ? "Adicionar" : "Remover"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
