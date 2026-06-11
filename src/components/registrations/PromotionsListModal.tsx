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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Plus,
  Search,
  ArrowLeft,
  Percent,
  Tag,
  Zap,
  Clock,
  Gift,
  TrendingUp,
  Copy,
  Check,
  Calendar,
  Users,
  Edit,
  Trash2,
  MoreVertical,
  BadgePercent,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PromotionModal } from "@/components/registrations/PromotionModal";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface PromotionsListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Promoção retornada pela API */
interface ApiPromotion {
  id: number;
  uuid?: string;
  propertyId: number;
  code: string;
  name: string;
  description?: string | null;
  type: string;
  discountValue?: number | null;
  discountPercentage?: number | null;
  minStay?: number | null;
  maxStay?: number | null;
  validFrom?: string | null;
  validTo?: string | null;
  usageLimit?: number | null;
  usageCount?: number;
  status: string;
  promoCode?: string | null;
  requireCoupon?: boolean;
}

/** Mapeia tipo do banco (percentage, fixed_amount, package) para chave de exibição */
const dbTypeToDisplayKey: Record<string, string> = {
  percentage: "discount",
  fixed_amount: "fixed",
  package: "gift",
  free_night: "gift",
  discount: "discount",
  fixed: "fixed",
  flash: "flash",
  earlybird: "earlybird",
  lastminute: "lastminute",
  gift: "gift",
};

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  discount: { label: "Desconto %", icon: Percent, color: "text-pink-600", bgColor: "from-pink-500 to-pink-600" },
  fixed: { label: "Valor Fixo", icon: Tag, color: "text-violet-600", bgColor: "from-violet-500 to-violet-600" },
  flash: { label: "Flash Sale", icon: Zap, color: "text-amber-600", bgColor: "from-amber-500 to-amber-600" },
  earlybird: { label: "Early Bird", icon: Clock, color: "text-cyan-600", bgColor: "from-cyan-500 to-cyan-600" },
  lastminute: { label: "Last Minute", icon: TrendingUp, color: "text-red-600", bgColor: "from-red-500 to-red-600" },
  gift: { label: "Brinde", icon: Gift, color: "text-emerald-600", bgColor: "from-emerald-500 to-emerald-600" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Ativa", color: "bg-emerald-500" },
  inactive: { label: "Inativa", color: "bg-gray-500" },
  scheduled: { label: "Agendada", color: "bg-blue-500" },
  expired: { label: "Expirada", color: "bg-gray-500" },
  exhausted: { label: "Esgotada", color: "bg-amber-500" },
  paused: { label: "Pausada", color: "bg-amber-500" },
};

export function PromotionsListModal({ open, onOpenChange }: PromotionsListModalProps) {
  const [promotions, setPromotions] = useState<ApiPromotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newPromotionModalOpen, setNewPromotionModalOpen] = useState(false);
  const [promotionToEdit, setPromotionToEdit] = useState<ApiPromotion | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const modalTypeToApiType: Record<string, string> = {
    discount: "percentage",
    fixed: "fixed_amount",
    flash: "percentage",
    earlybird: "percentage",
    lastminute: "percentage",
    gift: "package",
  };

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    const typeParam = filterType === "all" ? undefined : (modalTypeToApiType[filterType] ?? filterType);
    const status = filterStatus === "all" ? undefined : filterStatus;
    const res = await api.getPromotions(undefined, undefined, typeParam, status);
    setLoading(false);
    if (res.success && res.data?.promotions) {
      setPromotions((res.data.promotions as ApiPromotion[]) || []);
    } else {
      setPromotions([]);
    }
  }, [filterType, filterStatus]);

  useEffect(() => {
    if (open) fetchPromotions();
  }, [open, fetchPromotions]);

  const handleModalClose = (isOpen: boolean) => {
    if (!isOpen) setPromotionToEdit(null);
    setNewPromotionModalOpen(isOpen);
  };

  const handleSuccess = () => {
    fetchPromotions();
  };

  const handleEdit = (promo: ApiPromotion) => {
    setPromotionToEdit(promo);
    setNewPromotionModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId == null) return;
    setDeleting(true);
    const res = await api.deletePromotion(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (res.success) {
      toast.success("Promoção excluída.");
      fetchPromotions();
    } else {
      toast.error((res.error as { message?: string })?.message ?? "Erro ao excluir.");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Código copiado!", { description: `O código ${code} foi copiado para a área de transferência.` });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredPromotions = promotions.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.code || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q) ||
      (p.promoCode || "").toLowerCase().includes(q)
    );
  });

  const stats = {
    total: promotions.length,
    active: promotions.filter((p) => p.status === "active").length,
    scheduled: promotions.filter((p) => p.status === "scheduled" || p.status === "active").length,
    totalUsed: promotions.reduce((acc, p) => acc + (p.usageCount ?? 0), 0),
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getTypeInfo = (apiType: string) => {
    const key = dbTypeToDisplayKey[apiType] || "discount";
    return typeConfig[key] || typeConfig.discount;
  };

  const getDiscountDisplay = (promo: ApiPromotion) => {
    if (promo.type === "fixed_amount" && promo.discountValue != null) {
      return `R$ ${promo.discountValue}`;
    }
    if (promo.type === "package" || promo.type === "free_night") return "🎁";
    const pct = promo.discountPercentage ?? promo.discountValue;
    return pct != null ? `${pct}%` : "—";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col overflow-hidden bg-background border-border">
          <DialogHeader className="pb-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-10 w-10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                  <BadgePercent className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">Promoções</DialogTitle>
                  <p className="text-muted-foreground mt-1">Gerencie cupons e ofertas especiais</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setPromotionToEdit(null);
                  setNewPromotionModalOpen(true);
                }}
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Promoção
              </Button>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4 flex-shrink-0">
            <div className="p-3 rounded-xl border border-border bg-card">
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Ativas</p>
            </div>
            <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5">
              <p className="text-xl font-bold text-blue-600">{stats.scheduled}</p>
              <p className="text-xs text-muted-foreground">Agendadas</p>
            </div>
            <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/5">
              <p className="text-xl font-bold text-purple-600">{stats.totalUsed}</p>
              <p className="text-xs text-muted-foreground">Usos Totais</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pb-4 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou código..."
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
                <SelectItem value="all">Todos os Tipos</SelectItem>
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
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="inactive">Inativas</SelectItem>
                <SelectItem value="scheduled">Agendadas</SelectItem>
                <SelectItem value="expired">Expiradas</SelectItem>
                <SelectItem value="exhausted">Esgotadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Carregando...</span>
              </div>
            ) : filteredPromotions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-foreground">Nenhuma promoção encontrada</h3>
                <p className="text-muted-foreground mt-1">Tente ajustar os filtros ou crie uma nova promoção</p>
                <Button onClick={() => setNewPromotionModalOpen(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Promoção
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 pr-4">
                  {filteredPromotions.map((promo) => {
                    const typeInfo = getTypeInfo(promo.type);
                    const statusInfo = statusConfig[promo.status] || statusConfig.inactive;
                    const TypeIcon = typeInfo.icon;

                    return (
                      <div
                        key={promo.id}
                        className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
                      >
                        <div className={`relative h-32 overflow-hidden bg-gradient-to-br ${typeInfo.bgColor}`}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <TypeIcon className="h-16 w-16 text-white/30" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          <div className="absolute top-2 right-2">
                            <Badge className={`${statusInfo.color} text-white border-0`}>{statusInfo.label}</Badge>
                          </div>
                          <div className="absolute top-2 left-2">
                            <div className="p-2 rounded-lg bg-white/20 shadow-lg">
                              <TypeIcon className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5">
                              <span className="text-xl font-bold text-foreground">
                                {getDiscountDisplay(promo)}
                              </span>
                              {promo.type !== "package" && promo.type !== "free_night" && (
                                <span className="text-xs text-muted-foreground ml-1">OFF</span>
                              )}
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(promo)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(promo.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="font-semibold text-foreground truncate">{promo.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{promo.description || "—"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border-2 border-dashed border-border">
                              <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <code className="font-mono font-bold text-foreground tracking-wider flex-1 truncate">
                                {promo.code || "—"}
                              </code>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleCopyCode(promo.code)}
                              className={`h-10 w-10 shrink-0 ${copiedCode === promo.code ? "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600" : ""}`}
                            >
                              {copiedCode === promo.code ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {formatDate(promo.validFrom)} - {formatDate(promo.validTo)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-medium text-foreground">{promo.usageCount ?? 0}</span>
                              {promo.usageLimit != null && (
                                <span className="text-muted-foreground">/ {promo.usageLimit}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(promo)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(promo.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PromotionModal
        open={newPromotionModalOpen}
        onOpenChange={handleModalClose}
        initialMode={promotionToEdit ? "edit" : "create"}
        initialData={promotionToEdit ?? undefined}
        onSuccess={handleSuccess}
      />

      <AlertDialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir promoção?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
