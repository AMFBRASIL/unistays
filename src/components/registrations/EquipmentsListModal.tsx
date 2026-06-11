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
  Wrench,
  Plus,
  Search,
  Edit,
  ArrowLeft,
  MoreVertical,
  Trash2,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Thermometer,
  Tv,
  AirVent,
  WashingMachine,
  Refrigerator,
  Flame,
  Wifi,
  Lock,
  Lightbulb,
  Calendar,
  MapPin,
  Tag,
  Activity,
  Package,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EquipmentModal } from "./EquipmentModal";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface EquipmentsListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Equipment as returned by API */
interface ApiEquipment {
  id: number;
  code?: string | null;
  name: string;
  description?: string | null;
  categoryId?: number | null;
  category?: { id: number; name: string; icon?: string; color?: string } | null;
  propertyId?: number | null;
  location?: string | null;
  serialNumber?: string | null;
  model?: string | null;
  manufacturer?: string | null;
  purchaseDate?: string | null;
  warrantyExpiry?: string | null;
  status?: string;
  active?: boolean;
  imageUrl?: string | null;
  [key: string]: unknown;
}

/** Category as returned by API */
interface ApiCategory {
  id: number;
  name: string;
  icon?: string | null;
  color?: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  active: { label: "Ativo", color: "bg-emerald-500", icon: CheckCircle2 },
  maintenance: { label: "Em Manutenção", color: "bg-amber-500", icon: Settings },
  inactive: { label: "Inativo", color: "bg-slate-500", icon: Clock },
  broken: { label: "Defeituoso", color: "bg-red-500", icon: AlertTriangle },
  disposed: { label: "Baixado", color: "bg-slate-600", icon: AlertTriangle },
  reserved: { label: "Reservado", color: "bg-blue-500", icon: Clock },
  retired: { label: "Baixado", color: "bg-slate-600", icon: AlertTriangle },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  AirVent, WashingMachine, Flame, Refrigerator, Tv, Lock, Lightbulb, Wifi, Zap, Thermometer, Package,
};

export function EquipmentsListModal({ open, onOpenChange }: EquipmentsListModalProps) {
  const [equipments, setEquipments] = useState<ApiEquipment[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [newEquipmentModalOpen, setNewEquipmentModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEquipments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getEquipments();
      const raw = res as { success?: boolean; data?: { equipments?: ApiEquipment[] } | ApiEquipment[] };
      if (raw.success === false) {
        toast({
          title: "Erro ao carregar equipamentos",
          description: (res as { error?: { message?: string } }).error?.message ?? "Tente novamente.",
          variant: "destructive",
        });
        setEquipments([]);
        return;
      }
      const data = raw.data;
      let list: ApiEquipment[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && typeof data === "object" && Array.isArray((data as { equipments?: ApiEquipment[] }).equipments)) {
        list = (data as { equipments: ApiEquipment[] }).equipments;
      } else if (data && typeof data === "object" && (data as { equipments?: unknown }).equipments) {
        list = ((data as { equipments: unknown }).equipments as ApiEquipment[]) ?? [];
      }
      // Normalize snake_case from backend if present
      setEquipments(
        list.map((e: Record<string, unknown>) => ({
          ...e,
          id: e.id ?? (e as { Id?: number }).Id,
          code: e.code ?? (e as { CODE?: string }).CODE,
          name: e.name ?? (e as { Name?: string }).Name,
          categoryId: e.categoryId ?? (e as { category_id?: number }).category_id,
          category: e.category ?? (e as { Category?: ApiEquipment["category"] }).Category,
          propertyId: e.propertyId ?? (e as { property_id?: number }).property_id,
          location: e.location ?? (e as { Location?: string }).Location,
          serialNumber: e.serialNumber ?? (e as { serial_number?: string }).serial_number,
          model: e.model ?? (e as { Model?: string }).Model,
          manufacturer: e.manufacturer ?? (e as { Manufacturer?: string }).Manufacturer,
          status: e.status ?? (e as { Status?: string }).Status,
          imageUrl: e.imageUrl ?? (e as { image_url?: string }).image_url,
          warrantyExpiry: e.warrantyExpiry ?? (e as { warranty_expiry?: string }).warranty_expiry,
        })) as ApiEquipment[]
      );
    } catch (e) {
      console.error("EquipmentsListModal fetchEquipments:", e);
      toast({
        title: "Erro ao carregar equipamentos",
        description: (e as Error)?.message ?? "Verifique a conexão e tente novamente.",
        variant: "destructive",
      });
      setEquipments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.getEquipmentCategories();
      const data = (res as { data?: { equipmentCategories?: ApiCategory[] } })?.data;
      setCategories(data?.equipmentCategories ?? []);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    fetchEquipments();
    fetchCategories();
  }, [open, fetchEquipments, fetchCategories]);

  const handleNewEquipmentClose = (isOpen: boolean) => {
    setNewEquipmentModalOpen(isOpen);
    if (!isOpen) fetchEquipments();
  };

  const handleDeleteConfirm = async () => {
    if (deleteId == null) return;
    setDeleting(true);
    try {
      const res = await api.deleteEquipment(deleteId);
      setDeleteId(null);
      if ((res as { success?: boolean }).success !== false) {
        toast({ title: "Equipamento excluído", description: "O equipamento foi removido com sucesso." });
        fetchEquipments();
      } else {
        toast({ title: "Erro ao excluir", description: (res as { error?: { message?: string } }).error?.message ?? "Tente novamente.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Erro ao excluir", description: (e as Error)?.message ?? "Tente novamente.", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const filteredEquipments = equipments.filter((equipment) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      equipment.name?.toLowerCase().includes(q) ||
      equipment.serialNumber?.toLowerCase().includes(q) ||
      equipment.manufacturer?.toLowerCase().includes(q) ||
      equipment.location?.toLowerCase().includes(q) ||
      equipment.model?.toLowerCase().includes(q);
    const matchesStatus =
      !selectedStatus ||
      equipment.status === selectedStatus ||
      (selectedStatus === "inactive" && (equipment.status === "inactive" || equipment.status === "retired" || equipment.status === "disposed"));
    const matchesCategory = !selectedCategoryId || equipment.categoryId === selectedCategoryId;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: equipments.length,
    active: equipments.filter((e) => e.status === "active").length,
    maintenance: equipments.filter((e) => e.status === "maintenance").length,
    inactive: equipments.filter((e) => e.status === "inactive" || e.status === "retired").length,
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col overflow-hidden bg-background border-border">
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
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                  <Wrench className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    Gerenciar Equipamentos
                  </DialogTitle>
                  <p className="text-muted-foreground mt-1">
                    Cadastro e controle de equipamentos e ativos
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setNewEquipmentModalOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Equipamento
              </Button>
            </div>
          </DialogHeader>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-3 py-4 flex-shrink-0">
            <button
              onClick={() => setSelectedStatus(null)}
              className={`p-3 rounded-xl border transition-all ${
                selectedStatus === null 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              }`}
            >
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </button>
            <button
              onClick={() => setSelectedStatus(selectedStatus === "active" ? null : "active")}
              className={`p-3 rounded-xl border transition-all ${
                selectedStatus === "active" 
                  ? "border-emerald-500 bg-emerald-500/10" 
                  : "border-border hover:border-emerald-500/50"
              }`}
            >
              <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Ativos
              </p>
            </button>
            <button
              onClick={() => setSelectedStatus(selectedStatus === "maintenance" ? null : "maintenance")}
              className={`p-3 rounded-xl border transition-all ${
                selectedStatus === "maintenance" 
                  ? "border-amber-500 bg-amber-500/10" 
                  : "border-border hover:border-amber-500/50"
              }`}
            >
              <p className="text-xl font-bold text-amber-600">{stats.maintenance}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Settings className="h-3 w-3" /> Manutenção
              </p>
            </button>
            <button
              onClick={() => setSelectedStatus(selectedStatus === "inactive" ? null : "inactive")}
              className={`p-3 rounded-xl border transition-all ${
                selectedStatus === "inactive" 
                  ? "border-slate-500 bg-slate-500/10" 
                  : "border-border hover:border-slate-500/50"
              }`}
            >
              <p className="text-xl font-bold text-slate-600">{stats.inactive}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Inativos
              </p>
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 pb-4 flex-shrink-0 overflow-x-auto">
            <Button
              variant={selectedCategoryId === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategoryId(null)}
              className="flex-shrink-0"
            >
              Todos
            </Button>
            {categories.map((cat) => {
              const IconComponent = iconMap[cat.icon ?? ""] ?? Package;
              return (
                <Button
                  key={cat.id}
                  variant={selectedCategoryId === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)}
                  className="flex-shrink-0"
                >
                  <IconComponent className="h-3.5 w-3.5 mr-1.5" />
                  {cat.name}
                </Button>
              );
            })}
          </div>

          {/* Search */}
          <div className="flex items-center gap-4 pb-4 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, código, marca ou local..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
          </div>

          {/* Equipments Grid */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                Carregando equipamentos...
              </div>
            ) : (
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 pr-4">
                {filteredEquipments.map((equipment) => {
                  const status = statusConfig[equipment.status ?? "active"] ?? statusConfig.active;
                  const StatusIcon = status.icon;
                  const CategoryIcon = iconMap[equipment.category?.icon ?? ""] ?? Package;
                  const categoryName = equipment.category?.name ?? "—";
                  const code = equipment.code ?? equipment.serialNumber ?? `EQP-${equipment.id}`;
                  const warrantyExpiry = equipment.warrantyExpiry ? new Date(equipment.warrantyExpiry) : null;
                  const isWarrantyExpired = warrantyExpiry ? warrantyExpiry < new Date() : false;

                  return (
                    <div
                      key={equipment.id}
                      className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
                    >
                      {/* Image Header */}
                      <div className="relative h-32 overflow-hidden bg-muted">
                        {equipment.imageUrl ? (
                          <img
                            src={equipment.imageUrl}
                            alt={equipment.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                            <CategoryIcon className="h-12 w-12 text-orange-500/50" />
                          </div>
                        )}
                        {/* Status Badge */}
                        <Badge className={`absolute top-2 right-2 ${status.color} text-white border-0`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                        {/* Category Badge */}
                        <Badge variant="secondary" className="absolute top-2 left-2">
                          <CategoryIcon className="h-3 w-3 mr-1" />
                          {categoryName}
                        </Badge>
                        {isWarrantyExpired && (
                          <div className="absolute bottom-2 left-2">
                            <Badge variant="destructive" className="text-xs">
                              Garantia expirada
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs font-mono">
                                {code}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-foreground mt-1 truncate">
                              {equipment.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {(equipment.manufacturer || equipment.model)
                                ? `${equipment.manufacturer ?? ""}${equipment.manufacturer && equipment.model ? " • " : ""}${equipment.model ?? ""}`
                                : "—"}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Registrar Manutenção
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Activity className="h-4 w-4 mr-2" />
                                Histórico
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteId(equipment.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Details */}
                        <div className="mt-3 space-y-2">
                          {equipment.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{equipment.location}</span>
                            </div>
                          )}
                          {(equipment.serialNumber || equipment.code || code !== `EQP-${equipment.id}`) && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Tag className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="font-mono text-xs truncate">{equipment.serialNumber ?? code}</span>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                          <span className="text-xs text-muted-foreground">Sem manutenção agendada</span>
                          {warrantyExpiry ? (
                            isWarrantyExpired ? (
                              <Badge variant="outline" className="text-xs text-red-500 border-red-500/50">
                                Garantia expirada
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/50">
                                Em garantia até {warrantyExpiry.toLocaleDateString("pt-BR")}
                              </Badge>
                            )
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              Sem garantia
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredEquipments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Wrench className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-foreground">Nenhum equipamento encontrado</h3>
                  <p className="text-muted-foreground mt-1">
                    Tente ajustar os filtros ou cadastre um novo equipamento
                  </p>
                  <Button 
                    onClick={() => setNewEquipmentModalOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Equipamento
                  </Button>
                </div>
              )}
            </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* New Equipment Modal */}
      <EquipmentModal 
        open={newEquipmentModalOpen} 
        onOpenChange={handleNewEquipmentClose}
        initialView="new"
      />

      {/* Delete confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir equipamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O equipamento será removido permanentemente.
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
