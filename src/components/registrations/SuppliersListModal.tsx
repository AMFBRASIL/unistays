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
  Truck,
  Package,
  Utensils,
  Wrench,
  Sparkles,
  Shirt,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  MoreVertical,
  Star,
  Clock,
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
import { SupplierModal } from "@/components/registrations/SupplierModal";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface SuppliersListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Categoria retornada pela API */
interface ApiSupplierCategory {
  id: number;
  code: string;
  name: string;
  icon?: string | null;
  colorFrom?: string | null;
  colorTo?: string | null;
}

/** Fornecedor retornado pela API */
interface ApiSupplier {
  id: number;
  uuid?: string;
  propertyId?: number | null;
  code: string;
  categoryId: number;
  category?: ApiSupplierCategory;
  name: string;
  tradeName?: string | null;
  cnpj?: string | null;
  stateRegistration?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  zipCode?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  paymentTerms?: number | null;
  deliveryDays?: number | null;
  minOrderValue?: number | null;
  notes?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

const categoryIconMap: Record<string, React.ElementType> = {
  food: Utensils,
  beverages: Package,
  cleaning: Sparkles,
  maintenance: Wrench,
  laundry: Shirt,
  equipment: Package,
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Ativo", color: "bg-emerald-500", icon: CheckCircle },
  inactive: { label: "Inativo", color: "bg-gray-500", icon: XCircle },
  pending: { label: "Pendente", color: "bg-amber-500", icon: Clock },
};

export function SuppliersListModal({ open, onOpenChange }: SuppliersListModalProps) {
  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([]);
  const [categories, setCategories] = useState<ApiSupplierCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [newSupplierModalOpen, setNewSupplierModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<ApiSupplier | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const categoryId = filterCategory === "all" ? undefined : parseInt(filterCategory, 10);
      const status = filterStatus === "all" ? undefined : filterStatus;
      const res = await api.getSuppliers(undefined, categoryId, status);
      const list = res?.data && Array.isArray((res.data as { suppliers?: unknown[] }).suppliers)
        ? (res.data as { suppliers: ApiSupplier[] }).suppliers
        : Array.isArray(res?.data)
          ? (res.data as ApiSupplier[])
          : [];
      setSuppliers(list);
    } catch {
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterStatus]);

  const fetchCategories = useCallback(async () => {
    const res = await api.getSupplierCategories();
    if (res.success && res.data?.categories) {
      setCategories((res.data.categories as ApiSupplierCategory[]) || []);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open, fetchCategories]);

  useEffect(() => {
    if (open) fetchSuppliers();
  }, [open, fetchSuppliers]);

  const handleModalClose = (isOpen: boolean) => {
    if (!isOpen) setSupplierToEdit(null);
    setNewSupplierModalOpen(isOpen);
  };

  const handleSuccess = () => {
    fetchSuppliers();
  };

  const handleEdit = (supplier: ApiSupplier) => {
    setSupplierToEdit(supplier);
    setNewSupplierModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId == null) return;
    setDeleting(true);
    const res = await api.deleteSupplier(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (res.success) {
      toast.success("Fornecedor excluído.");
      fetchSuppliers();
    } else {
      toast.error((res.error as { message?: string })?.message ?? "Erro ao excluir.");
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.tradeName || "").toLowerCase().includes(q) ||
      (s.city || "").toLowerCase().includes(q) ||
      (s.code || "").toLowerCase().includes(q)
    );
  });
  const stats = {
    total: suppliers.length,
    active: suppliers.filter((s) => s.status === "active").length,
  };

  const categoryGradientMap: Record<string, string> = {
    food: "from-amber-500/90 to-amber-600/90",
    beverages: "from-cyan-500/90 to-cyan-600/90",
    cleaning: "from-blue-500/90 to-blue-600/90",
    maintenance: "from-gray-500/90 to-gray-600/90",
    laundry: "from-violet-500/90 to-violet-600/90",
    equipment: "from-emerald-500/90 to-emerald-600/90",
  };

  const getCategoryInfo = (supplier: ApiSupplier) => {
    const cat = supplier.category;
    if (!cat) return { label: "—", icon: Package };
    const Icon = categoryIconMap[cat.code] || Package;
    return { label: cat.name, icon: Icon };
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
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                  <Truck className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    Fornecedores
                  </DialogTitle>
                  <p className="text-muted-foreground mt-1">
                    Gerencie fornecedores e prestadores de serviços
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setSupplierToEdit(null);
                  setNewSupplierModalOpen(true);
                }}
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Fornecedor
              </Button>
            </div>
          </DialogHeader>

          {/* Stats Cards */}
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
              <p className="text-xs text-muted-foreground">Pedidos</p>
            </div>
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <p className="text-xl font-bold text-amber-600">—</p>
              </div>
              <p className="text-xs text-muted-foreground">Avaliação Média</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 pb-4 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, fantasia ou cidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
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

          {/* Suppliers Grid */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Carregando...</span>
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Truck className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-foreground">Nenhum fornecedor encontrado</h3>
                <p className="text-muted-foreground mt-1">
                  Tente ajustar os filtros ou cadastre um novo fornecedor
                </p>
                <Button
                  onClick={() => setNewSupplierModalOpen(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Fornecedor
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-full flex-1 min-h-[200px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 pr-4">
                  {filteredSuppliers.map((supplier) => {
                    const categoryInfo = getCategoryInfo(supplier);
                    const statusInfo = statusConfig[supplier.status] || statusConfig.inactive;
                    const CategoryIcon = categoryInfo.icon;
                    const gradientClass = (supplier.category && categoryGradientMap[supplier.category.code]) || "from-orange-500/90 to-amber-600/90";

                    return (
                      <div
                        key={supplier.id}
                        className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
                      >
                        {/* Header com gradiente (sem imagem do banco) */}
                        <div className={`relative h-32 overflow-hidden bg-gradient-to-br ${gradientClass}`}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <CategoryIcon className="h-16 w-16 text-white/20" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                          <div className="absolute top-2 right-2">
                            <Badge className={`${statusInfo?.color} text-white border-0`}>
                              {statusInfo?.label}
                            </Badge>
                          </div>

                          <div className="absolute top-2 left-2">
                            <div className="p-2 rounded-lg bg-white/20 shadow-lg">
                              <CategoryIcon className="h-4 w-4 text-white" />
                            </div>
                          </div>

                          <div className="absolute bottom-2 left-2 right-12">
                            <h3 className="font-bold text-white text-lg truncate drop-shadow-lg">
                              {supplier.tradeName || supplier.name}
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
                                <DropdownMenuItem onClick={() => handleEdit(supplier)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(supplier.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {supplier.name}
                            </p>
                            {supplier.code && (
                              <p className="text-xs text-muted-foreground font-mono mt-0.5">{supplier.code}</p>
                            )}
                          </div>

                          <div className="space-y-2 text-sm">
                            {(supplier.city || supplier.state) && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate">{[supplier.city, supplier.state].filter(Boolean).join(", ")}</span>
                              </div>
                            )}
                            {supplier.phone && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate">{supplier.phone}</span>
                              </div>
                            )}
                            {supplier.email && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate">{supplier.email}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                            <span>Pedidos: —</span>
                            <span>Último: —</span>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(supplier)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(supplier.id)}
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

      <SupplierModal
        open={newSupplierModalOpen}
        onOpenChange={handleModalClose}
        initialData={supplierToEdit ?? undefined}
        onSuccess={handleSuccess}
        categories={categories}
      />

      <AlertDialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir fornecedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
