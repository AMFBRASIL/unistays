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
  Calendar,
  Sun,
  Snowflake,
  Leaf,
  Flower2,
  PartyPopper,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SeasonModal } from "@/components/registrations/SeasonModal";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface SeasonsListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Temporada retornada pela API */
interface ApiSeason {
  id: number;
  uuid?: string;
  propertyId: number;
  code: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  priceMultiplier: number;
  isRecurring?: boolean;
  recurrencePattern?: Record<string, unknown> | null;
  description?: string | null;
  status: string;
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  high: { label: "Alta", icon: Sun, color: "text-amber-600", bgColor: "from-amber-500 to-orange-600" },
  medium: { label: "Regular", icon: Leaf, color: "text-emerald-600", bgColor: "from-emerald-500 to-teal-600" },
  low: { label: "Baixa", icon: Snowflake, color: "text-blue-600", bgColor: "from-blue-500 to-cyan-600" },
  holiday: { label: "Feriado", icon: PartyPopper, color: "text-rose-600", bgColor: "from-rose-500 to-pink-600" },
  special: { label: "Especial", icon: Flower2, color: "text-violet-600", bgColor: "from-violet-500 to-purple-600" },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Ativa", color: "bg-emerald-500", icon: CheckCircle },
  inactive: { label: "Inativa", color: "bg-gray-500", icon: XCircle },
};

export function SeasonsListModal({ open, onOpenChange }: SeasonsListModalProps) {
  const [seasons, setSeasons] = useState<ApiSeason[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newSeasonModalOpen, setNewSeasonModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<ApiSeason | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchSeasons = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const typeParam = filterType === "all" ? undefined : filterType;
      const statusParam = filterStatus === "all" ? undefined : filterStatus;
      const res = await api.getSeasons(searchQuery || undefined, undefined, typeParam, statusParam);
      const data = res.data as { seasons?: ApiSeason[] };
      const list = Array.isArray(data?.seasons) ? data.seasons : [];
      setSeasons(list);
    } catch (e) {
      toast.error("Erro ao carregar temporadas.");
      setSeasons([]);
    } finally {
      setLoading(false);
    }
  }, [open, searchQuery, filterType, filterStatus]);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  const filteredSeasons = seasons.filter((season) => {
    const matchesSearch =
      !searchQuery ||
      season.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (season.code && season.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (season.description && season.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const stats = {
    total: seasons.length,
    active: seasons.filter((s) => s.status === "active").length,
    highSeasons: seasons.filter((s) => s.type === "high" || s.type === "holiday").length,
    avgAdjustment:
      seasons.length === 0
        ? 0
        : Math.round(
            seasons.reduce((acc, s) => acc + (s.priceMultiplier != null ? (s.priceMultiplier - 1) * 100 : 0), 0) /
              seasons.length
          ),
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  const handleEdit = (season: ApiSeason) => {
    setEditingSeason(season);
    setNewSeasonModalOpen(true);
  };

  const handleDeleteConfirm = async (id: number) => {
    try {
      await api.deleteSeason(id);
      toast.success("Temporada excluída.");
      setDeleteId(null);
      fetchSeasons();
    } catch (e) {
      toast.error("Erro ao excluir temporada.");
    }
  };

  const handleSeasonModalSuccess = () => {
    setEditingSeason(null);
    fetchSeasons();
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
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    Temporadas
                  </DialogTitle>
                  <p className="text-muted-foreground mt-1">
                    Gerencie períodos sazonais e feriados
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setNewSeasonModalOpen(true)}
                className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Temporada
              </Button>
            </div>
          </DialogHeader>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-3 py-4 flex-shrink-0">
            <div className="p-3 rounded-xl border border-border bg-card">
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Ativas</p>
            </div>
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
              <p className="text-xl font-bold text-amber-600">{stats.highSeasons}</p>
              <p className="text-xs text-muted-foreground">Alta/Feriados</p>
            </div>
            <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5">
              <div className="flex items-center gap-1">
                {stats.avgAdjustment >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-blue-600" />
                )}
                <p className="text-xl font-bold text-blue-600">{stats.avgAdjustment}%</p>
              </div>
              <p className="text-xs text-muted-foreground">Ajuste Médio</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 pb-4 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar temporada..."
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
              </SelectContent>
            </Select>
          </div>

          {/* Seasons Grid */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Carregando temporadas...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 pr-4">
                  {filteredSeasons.map((season) => {
                    const typeInfo = typeConfig[season.type];
                    const statusInfo = statusConfig[season.status];
                    const TypeIcon = typeInfo?.icon || Calendar;
                    const adjustment = season.priceMultiplier != null ? Math.round((season.priceMultiplier - 1) * 100) : 0;

                    return (
                      <div
                        key={season.id}
                        className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
                      >
                        {/* Header com gradiente por tipo */}
                        <div className={`relative h-32 overflow-hidden bg-gradient-to-br ${typeInfo?.bgColor ?? "from-muted to-muted"}`}>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          <div className="absolute top-2 right-2">
                            <Badge className={`${statusInfo?.color} text-white border-0`}>
                              {statusInfo?.label}
                            </Badge>
                          </div>
                          <div className="absolute top-2 left-2">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${typeInfo?.bgColor ?? "bg-muted"} shadow-lg`}>
                              <TypeIcon className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 left-2 right-12">
                            <h3 className="font-bold text-white text-lg truncate drop-shadow-lg">
                              {season.name}
                            </h3>
                          </div>
                          <div className="absolute bottom-2 right-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(season)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeleteId(season.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {season.description || "—"}
                          </p>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={adjustment > 0 ? "destructive" : adjustment < 0 ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {adjustment > 0 ? `+${adjustment}%` : `${adjustment}%`}
                            </Badge>
                            {season.code && (
                              <span className="text-xs text-muted-foreground">Código: {season.code}</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(season.startDate)}</span>
                            </div>
                            <span className="text-muted-foreground">→</span>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(season.endDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading && filteredSeasons.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-foreground">Nenhuma temporada encontrada</h3>
                  <p className="text-muted-foreground mt-1">
                    Tente ajustar os filtros ou cadastre uma nova temporada
                  </p>
                  <Button onClick={() => setNewSeasonModalOpen(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Temporada
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <SeasonModal
        open={newSeasonModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setEditingSeason(null);
          setNewSeasonModalOpen(isOpen);
        }}
        initialData={editingSeason ?? undefined}
        onSuccess={handleSeasonModalSuccess}
      />

      <AlertDialog open={deleteId != null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir temporada?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A temporada será excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId != null && handleDeleteConfirm(deleteId)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
