import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Users,
  Plus,
  Search,
  Edit,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Crown,
  MoreVertical,
  Trash2,
  MessageSquare,
  Calendar,
  Building2,
  Award,
  Eye,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewGuestModal } from "@/components/guests/NewGuestModal";
import type { Guest as GuestModalType } from "@/components/guests/NewGuestModal";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface GuestsListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Guest as returned by API (getGuests / getById) */
interface ApiGuest {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  tier: string;
  tags: string[] | null;
  totalStays: number;
  memberSince: string | null;
  avatar: string | null;
  type?: "physical" | "legal";
  companyName?: string | null;
  documentNumber?: string | null;
  emergencyContactRelation?: string | null;
  [key: string]: unknown;
}

/** Maps API guest to the Guest type expected by NewGuestModal */
function apiGuestToModalGuest(g: ApiGuest): GuestModalType {
  const name = g.type === "legal" && g.companyName
    ? g.companyName
    : [g.firstName, g.lastName].filter(Boolean).join(" ").trim() || "—";
  return {
    id: g.id,
    uuid: (g as { uuid?: string }).uuid ?? "",
    name,
    email: g.email ?? "",
    phone: g.phone ?? "",
    document: g.documentNumber ?? "",
    city: g.city ?? "",
    state: g.state ?? "",
    totalStays: g.totalStays ?? 0,
    totalSpent: (g as { totalSpent?: number }).totalSpent ?? 0,
    lastStay: g.memberSince ?? "",
    tier: (g.tier as GuestModalType["tier"]) || "bronze",
    tags: g.tags ?? [],
    preferences: ((g as { preferences?: string[] }).preferences) ?? [],
    avatar: g.avatar ?? undefined,
    emergencyRelation: g.emergencyContactRelation ?? undefined,
    ...(g as Record<string, unknown>),
  } as GuestModalType;
}

const tierConfig: Record<string, { label: string; color: string; icon: string }> = {
  bronze: { label: "Bronze", color: "bg-amber-600", icon: "🥉" },
  silver: { label: "Prata", color: "bg-slate-400", icon: "🥈" },
  gold: { label: "Ouro", color: "bg-yellow-500", icon: "🥇" },
  platinum: { label: "Platina", color: "bg-purple-500", icon: "💎" },
};

const tagConfig: Record<string, { label: string; color: string }> = {
  vip: { label: "VIP", color: "bg-purple-500" },
  corporativo: { label: "Corporativo", color: "bg-blue-500" },
  frequente: { label: "Frequente", color: "bg-green-500" },
  familia: { label: "Família", color: "bg-orange-500" },
};

export function GuestsListModal({ open, onOpenChange }: GuestsListModalProps) {
  const [apiGuests, setApiGuests] = useState<ApiGuest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [newGuestModalOpen, setNewGuestModalOpen] = useState(false);
  const [guestToEdit, setGuestToEdit] = useState<GuestModalType | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    const res = await api.getGuests(
      searchQuery.trim() || undefined,
      selectedTier ?? undefined
    );
    setLoading(false);
    if (res.success && res.data?.guests) {
      setApiGuests(res.data.guests as ApiGuest[]);
    } else {
      setApiGuests([]);
    }
  }, [searchQuery, selectedTier]);

  useEffect(() => {
    if (open) {
      fetchGuests();
    }
  }, [open, fetchGuests]);

  const handleNewGuestClose = (isOpen: boolean) => {
    if (!isOpen) {
      setGuestToEdit(null);
    }
    setNewGuestModalOpen(isOpen);
  };

  const handleSuccess = () => {
    fetchGuests();
  };

  const handleEdit = (g: ApiGuest) => {
    setGuestToEdit(apiGuestToModalGuest(g));
    setNewGuestModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId == null) return;
    setDeleting(true);
    const res = await api.deleteGuest(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (res.success) {
      toast.success("Hóspede excluído.");
      fetchGuests();
    } else {
      toast.error(res.error?.message ?? "Erro ao excluir hóspede.");
    }
  };

  const displayGuests = apiGuests.map((g) => {
    const name = g.type === "legal" && g.companyName
      ? g.companyName
      : [g.firstName, g.lastName].filter(Boolean).join(" ").trim() || "—";
    const city = [g.city, g.state].filter(Boolean).join(", ") || "—";
    return {
      id: g.id,
      name,
      email: g.email ?? "—",
      phone: g.phone ?? "—",
      city,
      tier: g.tier,
      tags: g.tags ?? [],
      totalStays: g.totalStays ?? 0,
      lastStay: g.memberSince,
      image: g.avatar,
      isCompany: g.type === "legal",
      _raw: g,
    };
  });

  const stats = {
    total: apiGuests.length,
    vip: apiGuests.filter((g) => (g.tags ?? []).includes("vip")).length,
    corporativo: apiGuests.filter((g) => (g.tags ?? []).includes("corporativo")).length,
    platinum: apiGuests.filter((g) => g.tier === "platinum").length,
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
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    Hóspedes Cadastrados
                  </DialogTitle>
                  <p className="text-muted-foreground mt-1">
                    Gerencie o cadastro de hóspedes e clientes
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => { setGuestToEdit(null); setNewGuestModalOpen(true); }}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Hóspede
              </Button>
            </div>
          </DialogHeader>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-3 py-4 flex-shrink-0">
            <button
              onClick={() => setSelectedTier(null)}
              className={`p-3 rounded-xl border transition-all ${
                selectedTier === null 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              }`}
            >
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </button>
            <button
              onClick={() => setSelectedTier("platinum")}
              className={`p-3 rounded-xl border transition-all ${
                selectedTier === "platinum" 
                  ? "border-purple-500 bg-purple-500/10" 
                  : "border-border hover:border-purple-500/50"
              }`}
            >
              <p className="text-xl font-bold text-purple-600">{stats.platinum}</p>
              <p className="text-xs text-muted-foreground">Platina 💎</p>
            </button>
            <button
              className="p-3 rounded-xl border border-border"
            >
              <p className="text-xl font-bold text-amber-600">{stats.vip}</p>
              <p className="text-xs text-muted-foreground">VIPs</p>
            </button>
            <button
              className="p-3 rounded-xl border border-border"
            >
              <p className="text-xl font-bold text-blue-600">{stats.corporativo}</p>
              <p className="text-xs text-muted-foreground">Corporativos</p>
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4 pb-4 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, e-mail ou cidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
          </div>

          {/* Guests Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-light">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Carregando hóspedes...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 pr-2">
                {displayGuests.map((guest) => {
                  const tier = tierConfig[guest.tier] ?? tierConfig.bronze;

                  return (
                    <div
                      key={guest.id}
                      className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
                    >
                      {/* Header with image */}
                      <div className="p-4 flex items-start gap-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {guest.image ? (
                            <img
                              src={guest.image}
                              alt={guest.name}
                              className="w-14 h-14 rounded-xl object-cover border-2 border-border"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center border-2 border-border">
                              {guest.isCompany ? (
                                <Building2 className="h-6 w-6 text-white" />
                              ) : (
                                <User className="h-6 w-6 text-white" />
                              )}
                            </div>
                          )}
                          {/* Tier Badge */}
                          <div className="absolute -bottom-1 -right-1 text-sm">
                            {tier.icon}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground truncate">
                              {guest.name}
                            </h3>
                            {guest.tags.includes("vip") && (
                              <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {guest.email}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Badge className={`${tier.color} text-white border-0 text-xs px-1.5 py-0`}>
                              {tier.label}
                            </Badge>
                            {guest.tags.slice(0, 2).map((tag) => {
                              const tagInfo = tagConfig[tag];
                              return tagInfo ? (
                                <Badge 
                                  key={tag} 
                                  variant="outline" 
                                  className="text-xs px-1.5 py-0"
                                >
                                  {tagInfo.label}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>

                        {/* Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(guest._raw)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Enviar Mensagem
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteClick(guest.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Details */}
                      <div className="px-4 pb-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{guest.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{guest.city}</span>
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="flex items-center gap-1 text-sm">
                            <Award className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="font-medium text-foreground">{guest.totalStays}</span>
                            <span className="text-muted-foreground">estadias</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {guest.lastStay
                                ? `Membro desde ${new Date(guest.lastStay).toLocaleDateString("pt-BR")}`
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && displayGuests.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-foreground">Nenhum hóspede encontrado</h3>
                <p className="text-muted-foreground mt-1">
                  {searchQuery || selectedTier
                    ? "Tente ajustar os filtros ou cadastre um novo hóspede"
                    : "Cadastre o primeiro hóspede"}
                </p>
                <Button 
                  onClick={() => { setGuestToEdit(null); setNewGuestModalOpen(true); }}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Hóspede
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* New Guest Modal (create or edit) */}
      <NewGuestModal 
        open={newGuestModalOpen} 
        onOpenChange={handleNewGuestClose} 
        onSuccess={handleSuccess}
        guestToEdit={guestToEdit ?? undefined}
      />

      {/* Delete confirmation */}
      <AlertDialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir hóspede?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O hóspede será removido do cadastro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}