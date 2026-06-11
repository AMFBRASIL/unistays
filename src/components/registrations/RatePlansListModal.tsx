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
  Tag,
  Percent,
  Calendar,
  Star,
  Building2,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  BedDouble,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RatePlanModal } from "@/components/registrations/RatePlanModal";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface RatePlansListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Plano tarifário retornado pela API */
interface ApiRatePlan {
  id: number;
  uuid?: string;
  propertyId: number;
  name: string;
  code: string;
  description?: string | null;
  type: string;
  status: string;
  currency?: string;
  baseRate?: number;
  discountPercentage?: number | null;
  minStay?: number | null;
  maxStay?: number | null;
  validFrom?: string | null;
  validTo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  rack: { label: "Padrão", icon: Tag, color: "text-blue-600", bgColor: "from-blue-500 to-blue-600" },
  standard: { label: "Padrão", icon: Tag, color: "text-blue-600", bgColor: "from-blue-500 to-blue-600" },
  promotional: { label: "Promocional", icon: Percent, color: "text-rose-600", bgColor: "from-rose-500 to-rose-600" },
  corporate: { label: "Corporativo", icon: Building2, color: "text-violet-600", bgColor: "from-violet-500 to-violet-600" },
  package: { label: "Pacote", icon: Star, color: "text-emerald-600", bgColor: "from-emerald-500 to-emerald-600" },
  long_stay: { label: "Long Stay", icon: Clock, color: "text-amber-600", bgColor: "from-amber-500 to-amber-600" },
  group: { label: "Grupo", icon: Tag, color: "text-cyan-600", bgColor: "from-cyan-500 to-cyan-600" },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Ativo", color: "bg-emerald-500", icon: CheckCircle },
  inactive: { label: "Inativo", color: "bg-gray-500", icon: XCircle },
};

export function RatePlansListModal({ open, onOpenChange }: RatePlansListModalProps) {
  const [plans, setPlans] = useState<ApiRatePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newPlanModalOpen, setNewPlanModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<ApiRatePlan | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    const type = filterType === "all" ? undefined : filterType;
    const status = filterStatus === "all" ? undefined : filterStatus;
    const res = await api.getRatePlans(undefined, undefined, type, status);
    setLoading(false);
    if (res.success && res.data?.ratePlans) {
      setPlans((res.data.ratePlans as ApiRatePlan[]) || []);
    } else {
      setPlans([]);
    }
  }, [filterType, filterStatus]);

  useEffect(() => {
    if (open) fetchPlans();
  }, [open, fetchPlans]);

  const handleModalClose = (isOpen: boolean) => {
    if (!isOpen) setPlanToEdit(null);
    setNewPlanModalOpen(isOpen);
  };

  const handleSuccess = () => {
    fetchPlans();
  };

  const handleEdit = (plan: ApiRatePlan) => {
    setPlanToEdit(plan);
    setNewPlanModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId == null) return;
    setDeleting(true);
    const res = await api.deleteRatePlan(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (res.success) {
      toast.success("Plano tarifário excluído.");
      fetchPlans();
    } else {
      toast.error((res.error as { message?: string })?.message ?? "Erro ao excluir.");
    }
  };

  const filteredPlans = plans.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.code || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
    );
  });

  const stats = {
    total: plans.length,
    active: plans.filter((p) => p.status === "active").length,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getTypeInfo = (type: string) => {
    return typeConfig[type] || typeConfig.rack;
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
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                  <Tag className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">Planos Tarifários</DialogTitle>
                  <p className="text-muted-foreground mt-1">Gerencie tarifas e políticas de preço</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setPlanToEdit(null);
                  setNewPlanModalOpen(true);
                }}
                className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Plano
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
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>
            <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5">
              <p className="text-xl font-bold text-blue-600">—</p>
              <p className="text-xs text-muted-foreground">Reservas</p>
            </div>
            <div className="p-3 rounded-xl border border-pink-500/30 bg-pink-500/5">
              <p className="text-xl font-bold text-pink-600">—</p>
              <p className="text-xs text-muted-foreground">Receita Total</p>
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
                <SelectItem value="all">Todos Tipos</SelectItem>
                <SelectItem value="rack">Padrão</SelectItem>
                <SelectItem value="promotional">Promocional</SelectItem>
                <SelectItem value="corporate">Corporativo</SelectItem>
                <SelectItem value="package">Pacote</SelectItem>
                <SelectItem value="long_stay">Long Stay</SelectItem>
                <SelectItem value="group">Grupo</SelectItem>
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

          <div className="flex-1 min-h-0 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Carregando...</span>
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Tag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-foreground">Nenhum plano encontrado</h3>
                <p className="text-muted-foreground mt-1">Tente ajustar os filtros ou cadastre um novo plano</p>
                <Button onClick={() => setNewPlanModalOpen(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Plano
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 pr-4">
                  {filteredPlans.map((plan) => {
                    const typeInfo = getTypeInfo(plan.type);
                    const statusInfo = statusConfig[plan.status] || statusConfig.inactive;
                    const TypeIcon = typeInfo.icon;

                    return (
                      <div
                        key={plan.id}
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
                          <div className="absolute bottom-2 left-2 right-12">
                            <h3 className="font-bold text-white text-lg truncate drop-shadow-lg">{plan.name}</h3>
                            <p className="text-white/80 text-sm font-mono">{plan.code || "—"}</p>
                          </div>
                          <div className="absolute bottom-2 right-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(plan)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(plan.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">{plan.description || "—"}</p>
                          <div className="flex items-center gap-3">
                            {plan.discountPercentage != null && plan.discountPercentage !== 0 && (
                              <Badge variant={plan.discountPercentage > 0 ? "default" : "destructive"} className="text-xs">
                                {plan.discountPercentage > 0 ? `-${plan.discountPercentage}%` : `+${Math.abs(plan.discountPercentage)}%`}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {plan.minStay ?? 1}-{plan.maxStay ?? "∞"} noites
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {formatDate(plan.validFrom)} - {formatDate(plan.validTo)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                            <span>Reservas: —</span>
                            <span>Receita: —</span>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(plan)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(plan.id)}
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

      <RatePlanModal
        open={newPlanModalOpen}
        onOpenChange={handleModalClose}
        modeWhenOpen={planToEdit ? "edit" : "create"}
        initialData={planToEdit ?? undefined}
        onSuccess={handleSuccess}
      />

      <AlertDialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir plano tarifário?</AlertDialogTitle>
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
