import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  Tags,
  Plus,
  Search,
  Percent,
  Calendar,
  Clock,
  Gift,
  Star,
  TrendingUp,
  Edit,
  Trash2,
  Package,
  Briefcase,
  Loader2,
  Building2,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RatePlanModal } from "@/components/registrations/RatePlanModal";
import { api } from "@/lib/api";
import { toast } from "sonner";

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
  inclusions?: string[] | null;
  propertyTypes?: string[] | null;
  stayTypes?: string[] | null;
}

const typeConfig: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  rack: { icon: Tag, color: "from-blue-500 to-cyan-500", label: "Padrão" },
  package: { icon: Gift, color: "from-purple-500 to-pink-500", label: "Pacote" },
  promotional: { icon: Percent, color: "from-emerald-500 to-green-500", label: "Promoção" },
  corporate: { icon: Briefcase, color: "from-blue-500 to-cyan-500", label: "Corporativo" },
  group: { icon: Building2, color: "from-cyan-500 to-teal-500", label: "Grupo" },
  long_stay: { icon: Calendar, color: "from-amber-500 to-orange-500", label: "Long Stay" },
};

const inclusionLabels: Record<string, string> = {
  breakfast: "Café da manhã",
  parking: "Estacionamento",
  pool: "Piscina",
  gym: "Academia",
  meals: "Refeições",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

export default function RatePlans() {
  const [plans, setPlans] = useState<ApiRatePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<ApiRatePlan | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const type = filterType === "all" ? undefined : filterType;
      const status = filterStatus === "all" ? undefined : filterStatus;
      const res = await api.getRatePlans(
        searchQuery.trim() || undefined,
        undefined,
        type,
        status,
      );
      if (res.success && res.data?.ratePlans) {
        setPlans((res.data.ratePlans as ApiRatePlan[]) || []);
      } else {
        setPlans([]);
        if (!res.success) {
          toast.error(res.error?.message || "Falha ao carregar planos tarifários");
        }
      }
    } catch {
      setPlans([]);
      toast.error("Falha ao carregar planos tarifários");
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, searchQuery]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void fetchPlans();
    }, searchQuery ? 300 : 0);
    return () => window.clearTimeout(t);
  }, [fetchPlans, searchQuery]);

  const stats = useMemo(() => {
    const active = plans.filter((p) => p.status === "active").length;
    const totalBase = plans.reduce((acc, p) => acc + (Number(p.baseRate) || 0), 0);
    return {
      total: plans.length,
      active,
      avgBase: plans.length ? totalBase / plans.length : 0,
      withDiscount: plans.filter((p) => Number(p.discountPercentage) > 0).length,
    };
  }, [plans]);

  const openCreate = () => {
    setPlanToEdit(null);
    setModalOpen(true);
  };

  const openEdit = (plan: ApiRatePlan) => {
    setPlanToEdit(plan);
    setModalOpen(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) setPlanToEdit(null);
  };

  const togglePlanStatus = async (plan: ApiRatePlan) => {
    const next = plan.status === "active" ? "inactive" : "active";
    setTogglingId(plan.id);
    // optimistic
    setPlans((prev) =>
      prev.map((p) => (p.id === plan.id ? { ...p, status: next } : p)),
    );
    try {
      const res = await api.updateRatePlan(plan.id, { status: next });
      if (!res.success) {
        setPlans((prev) =>
          prev.map((p) => (p.id === plan.id ? { ...p, status: plan.status } : p)),
        );
        toast.error(res.error?.message || "Falha ao atualizar status");
        return;
      }
      toast.success(next === "active" ? "Plano ativado" : "Plano desativado");
    } catch {
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, status: plan.status } : p)),
      );
      toast.error("Falha ao atualizar status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteId == null) return;
    setDeleting(true);
    try {
      const res = await api.deleteRatePlan(deleteId);
      if (res.success) {
        toast.success("Plano tarifário excluído");
        setDeleteId(null);
        await fetchPlans();
      } else {
        toast.error(res.error?.message || "Erro ao excluir");
      }
    } catch {
      toast.error("Erro ao excluir");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Tags className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Planos de Tarifas</h1>
              <p className="text-muted-foreground">
                Tarifas cadastradas no banco (rate_plans)
              </p>
            </div>
          </div>
          <Button
            className="gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            onClick={openCreate}
          >
            <Plus className="w-4 h-4" />
            Novo Plano
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Planos ativos</p>
                  <p className="text-2xl font-bold text-purple-500">{stats.active}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Tags className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total cadastrados</p>
                  <p className="text-2xl font-bold text-emerald-500">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Com desconto</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.withDiscount}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Percent className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tarifa base média</p>
                  <p className="text-2xl font-bold text-amber-500">
                    {stats.avgBase > 0 ? formatMoney(stats.avgBase) : "—"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, código ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
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
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center gap-2 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
            Carregando planos...
          </div>
        ) : plans.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center space-y-3">
              <Tags className="w-12 h-12 mx-auto text-muted-foreground/40" />
              <h3 className="text-lg font-medium">Nenhum plano tarifário</h3>
              <p className="text-sm text-muted-foreground">
                Cadastre o primeiro plano para usá-lo em reservas e canais.
              </p>
              <Button onClick={openCreate} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Plano
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {plans.map((plan) => {
              const config = typeConfig[plan.type] || typeConfig.rack;
              const Icon = config.icon;
              const active = plan.status === "active";
              const inclusions = (plan.inclusions || []).map(
                (id) => inclusionLabels[id] || id,
              );

              return (
                <Card
                  key={plan.id}
                  className={cn("transition-all", !active && "opacity-60")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
                            config.color,
                          )}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-lg truncate">{plan.name}</h3>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <Badge variant="outline">{config.label}</Badge>
                            <Badge variant="secondary" className="font-mono text-xs">
                              {plan.code}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={active}
                        disabled={togglingId === plan.id}
                        onCheckedChange={() => void togglePlanStatus(plan)}
                      />
                    </div>

                    {plan.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {plan.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {Number(plan.discountPercentage) > 0 && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          <Percent className="w-3 h-3 mr-1" />
                          {Number(plan.discountPercentage)}% desconto
                        </Badge>
                      )}
                      {plan.minStay != null && (
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          Mín. {plan.minStay} noite{plan.minStay > 1 ? "s" : ""}
                        </Badge>
                      )}
                      {plan.validTo && (
                        <Badge variant="outline">
                          <Calendar className="w-3 h-3 mr-1" />
                          Até {formatDate(plan.validTo)}
                        </Badge>
                      )}
                      {Number(plan.baseRate) > 0 && (
                        <Badge variant="outline">{formatMoney(Number(plan.baseRate))}</Badge>
                      )}
                    </div>

                    {inclusions.length > 0 && (
                      <div className="bg-muted/50 rounded-lg p-3 mb-4">
                        <p className="text-xs text-muted-foreground mb-2">Inclui:</p>
                        <div className="flex flex-wrap gap-2">
                          {inclusions.map((label) => (
                            <Badge key={label} variant="secondary" className="gap-1">
                              <Package className="w-3 h-3" />
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => openEdit(plan)}
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-red-500 hover:text-red-600"
                        onClick={() => setDeleteId(plan.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <RatePlanModal
        open={modalOpen}
        onOpenChange={handleModalOpenChange}
        modeWhenOpen={planToEdit ? "edit" : "create"}
        initialData={planToEdit || undefined}
        onSuccess={() => {
          void fetchPlans();
        }}
      />

      <AlertDialog
        open={deleteId != null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir plano tarifário?</AlertDialogTitle>
            <AlertDialogDescription>
              O plano será removido (soft delete). Esta ação pode ser revertida no banco se
              necessário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700"
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteConfirm();
              }}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
