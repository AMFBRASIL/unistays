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
  Package,
  Sparkles,
  Wine,
  Shirt,
  Car,
  Gift,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExtraModal } from "./ExtrasModal";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface ExtrasListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Extra retornado pela API (tabela extras) */
interface ApiExtra {
  id: number;
  uuid?: string;
  propertyId: number;
  code: string;
  name: string;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  pricingType: string;
  price?: number | null;
  percentage?: number | null;
  isTaxable?: boolean;
  requiresConfirmation?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  status: string;
}

/** Categorias da tabela extras: amenities, services, experiences, transport */
const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  experiences: { label: "Experiência", icon: Sparkles, color: "text-violet-600", bgColor: "from-violet-500 to-purple-600" },
  amenities: { label: "Amenidade", icon: Gift, color: "text-pink-600", bgColor: "from-pink-500 to-rose-600" },
  services: { label: "Serviço", icon: Shirt, color: "text-blue-600", bgColor: "from-blue-500 to-cyan-600" },
  transport: { label: "Transporte", icon: Car, color: "text-emerald-600", bgColor: "from-emerald-500 to-teal-600" },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Ativo", color: "bg-emerald-500", icon: CheckCircle },
  inactive: { label: "Inativo", color: "bg-gray-500", icon: XCircle },
};

export function ExtrasListModal({ open, onOpenChange }: ExtrasListModalProps) {
  const [extras, setExtras] = useState<ApiExtra[]>([]);
  const [properties, setProperties] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProperty, setFilterProperty] = useState("all");
  const [newExtraModalOpen, setNewExtraModalOpen] = useState(false);
  const [editingExtra, setEditingExtra] = useState<ApiExtra | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchExtras = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const propertyIdParam = filterProperty === "all" ? undefined : parseInt(filterProperty, 10);
      const categoryParam = filterCategory === "all" ? undefined : filterCategory;
      const statusParam = filterStatus === "all" ? undefined : filterStatus;
      const res = await api.getExtras(searchQuery || undefined, propertyIdParam, categoryParam, statusParam);
      const data = res.data as { extras?: ApiExtra[] };
      const list = Array.isArray(data?.extras) ? data.extras : [];
      setExtras(list);
    } catch (e) {
      toast.error("Erro ao carregar extras.");
      setExtras([]);
    } finally {
      setLoading(false);
    }
  }, [open, searchQuery, filterCategory, filterStatus, filterProperty]);

  useEffect(() => {
    fetchExtras();
  }, [fetchExtras]);

  useEffect(() => {
    if (!open) return;
    api.getProperties().then((res) => {
      const data = res.data as { properties?: { id: number; name: string }[] };
      setProperties(Array.isArray(data?.properties) ? data.properties : []);
    }).catch(() => setProperties([]));
  }, [open]);

  const filteredExtras = extras.filter((extra) => {
    const matchesSearch =
      !searchQuery ||
      extra.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (extra.code && extra.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (extra.description && extra.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const stats = {
    total: extras.length,
    active: extras.filter((e) => e.status === "active").length,
  };

  const handleEdit = (extra: ApiExtra) => {
    setEditingExtra(extra);
    setNewExtraModalOpen(true);
  };

  const handleDeleteConfirm = async (id: number) => {
    try {
      await api.deleteExtra(id);
      toast.success("Extra excluído.");
      setDeleteId(null);
      fetchExtras();
    } catch (e) {
      toast.error("Erro ao excluir extra.");
    }
  };

  const handleExtraModalSuccess = () => {
    setEditingExtra(null);
    fetchExtras();
  };

  const propertyMap = Object.fromEntries(properties.map((p) => [String(p.id), p.name]));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
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
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <Package className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    Extras e Serviços
                  </DialogTitle>
                  <p className="text-muted-foreground mt-1">
                    Gerencie serviços adicionais disponíveis
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setNewExtraModalOpen(true)}
                className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Extra
              </Button>
            </div>
          </DialogHeader>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 flex-shrink-0">
            <div className="p-3 rounded-xl border border-border bg-card">
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>
            <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5">
              <p className="text-xl font-bold text-blue-600">{filteredExtras.length}</p>
              <p className="text-xs text-muted-foreground">Exibidos</p>
            </div>
            <div className="p-3 rounded-xl border border-violet-500/30 bg-violet-500/5">
              <p className="text-xl font-bold text-violet-600">{new Set(extras.map((e) => e.category)).size}</p>
              <p className="text-xs text-muted-foreground">Categorias</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 pb-4 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar extra ou serviço..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
            <Select value={filterProperty} onValueChange={setFilterProperty}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Propriedade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Propriedades</SelectItem>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {Object.entries(categoryConfig).map(([key, config]) => (
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
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Extras Grid */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Carregando extras...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 pr-4">
                  {filteredExtras.map((extra) => {
                    const categoryInfo = categoryConfig[extra.category];
                    const statusInfo = statusConfig[extra.status];
                    const propertyName = propertyMap[String(extra.propertyId)];
                    const CategoryIcon = categoryInfo?.icon || Package;
                    const priceDisplay = extra.pricingType === "percentage" && extra.percentage != null
                      ? `${extra.percentage}%`
                      : formatCurrency(extra.price ?? 0);

                    return (
                      <div
                        key={extra.id}
                        className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
                      >
                        {/* Header com gradiente por categoria */}
                        <div className={`relative h-32 overflow-hidden bg-gradient-to-br ${categoryInfo?.bgColor ?? "from-muted to-muted"}`}>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          <div className="absolute top-2 right-2">
                            <Badge className={`${statusInfo?.color} text-white border-0`}>
                              {statusInfo?.label}
                            </Badge>
                          </div>
                          <div className="absolute top-2 left-2">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryInfo?.bgColor ?? "bg-muted"} shadow-lg`}>
                              <CategoryIcon className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 left-2 right-12">
                            <h3 className="font-bold text-white text-lg truncate drop-shadow-lg">
                              {extra.name}
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
                                <DropdownMenuItem onClick={() => handleEdit(extra)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(extra.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          {propertyName && (
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground truncate">{propertyName}</span>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {extra.description || "—"}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xl font-bold text-foreground">{priceDisplay}</p>
                            <Badge variant="outline" className="text-xs">
                              {categoryInfo?.label}
                            </Badge>
                          </div>
                          {extra.code && (
                            <p className="text-xs text-muted-foreground">Código: {extra.code}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading && filteredExtras.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-foreground">Nenhum extra encontrado</h3>
                  <p className="text-muted-foreground mt-1">
                    Tente ajustar os filtros ou cadastre um novo extra
                  </p>
                  <Button onClick={() => setNewExtraModalOpen(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Extra
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <ExtraModal
        open={newExtraModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setEditingExtra(null);
          setNewExtraModalOpen(isOpen);
        }}
        initialData={editingExtra ?? undefined}
        onSuccess={handleExtraModalSuccess}
      />

      <AlertDialog open={deleteId != null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir extra?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O extra/serviço será excluído.
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