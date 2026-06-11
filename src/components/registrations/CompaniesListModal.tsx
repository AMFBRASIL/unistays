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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Search,
  Plus,
  MapPin,
  Phone,
  Mail,
  Plane,
  Briefcase,
  Globe,
  Hotel,
  Percent,
  FileText,
  TrendingUp,
  Users,
  HandshakeIcon,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { CompanyModal, type ApiCompany } from "./CompanyModal";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface CompaniesListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const companyTypes = [
  { id: "agency", icon: Plane, label: "Agência de Viagens", color: "bg-blue-500" },
  { id: "corporate", icon: Briefcase, label: "Corporativo", color: "bg-violet-500" },
  { id: "operator", icon: Globe, label: "Operadora", color: "bg-emerald-500" },
  { id: "ota", icon: Hotel, label: "OTA", color: "bg-amber-500" },
];

export function CompaniesListModal({ open, onOpenChange }: CompaniesListModalProps) {
  const [companies, setCompanies] = useState<ApiCompany[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newCompanyModalOpen, setNewCompanyModalOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<ApiCompany | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    const res = await api.getCompanies(
      searchTerm.trim() || undefined,
      typeFilter !== "all" ? typeFilter : undefined,
      statusFilter !== "all" ? statusFilter : undefined
    );
    setLoading(false);
    if (res.success && res.data?.companies) {
      setCompanies(res.data.companies as ApiCompany[]);
    } else {
      setCompanies([]);
    }
  }, [searchTerm, typeFilter, statusFilter]);

  useEffect(() => {
    if (open) {
      fetchCompanies();
    }
  }, [open, fetchCompanies]);

  const handleCompanyModalClose = (isOpen: boolean) => {
    if (!isOpen) setCompanyToEdit(null);
    setNewCompanyModalOpen(isOpen);
  };

  const handleSuccess = () => {
    fetchCompanies();
  };

  const handleEdit = (company: ApiCompany) => {
    setCompanyToEdit(company);
    setNewCompanyModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId == null) return;
    setDeleting(true);
    const res = await api.deleteCompany(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (res.success) {
      toast.success("Empresa excluída.");
      fetchCompanies();
    } else {
      toast.error(res.error?.message ?? "Erro ao excluir empresa.");
    }
  };

  const stats = {
    total: companies.length,
    active: companies.filter((c) => c.status === "active").length,
  };

  const getTypeInfo = (typeId: string) => {
    return companyTypes.find((t) => t.id === typeId) || companyTypes[0];
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30">
                  <Building2 className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">
                    Gestão de Empresas
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Agências, corporativos, operadoras e OTAs
                  </p>
                </div>
              </div>
              <Button
                onClick={() => { setCompanyToEdit(null); setNewCompanyModalOpen(true); }}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Empresa
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 min-h-0 flex flex-col gap-4 pt-4 overflow-hidden">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0">
              <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-violet-600" />
                  <span className="text-xs text-muted-foreground">Total</span>
                </div>
                <p className="text-2xl font-bold text-violet-700 dark:text-violet-300 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-muted-foreground">Ativas</span>
                </div>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                  {stats.active}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-muted-foreground">Filtros</span>
                </div>
                <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mt-1">
                  {typeFilter !== "all" || statusFilter !== "all" ? "Ativos" : "Todos"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  <span className="text-xs text-muted-foreground">Busca</span>
                </div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300 mt-1 truncate">
                  {searchTerm ? `"${searchTerm}"` : "—"}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  {companyTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="inactive">Inativas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Companies Grid */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-light">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Carregando empresas...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                  {companies.map((company) => {
                    const typeInfo = getTypeInfo(company.type);
                    const TypeIcon = typeInfo.icon;
                    const cityState = [company.city, company.state].filter(Boolean).join(", ") || "—";

                    return (
                      <div
                        key={company.id}
                        className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300"
                      >
                        {/* Header (placeholder sem imagem da API) */}
                        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
                          <Building2 className="h-14 w-14 text-white/40" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          {/* Type Badge */}
                          <div className="absolute top-3 left-3">
                            <Badge className={`${typeInfo.color} text-white border-0`}>
                              <TypeIcon className="h-3 w-3 mr-1" />
                              {typeInfo.label}
                            </Badge>
                          </div>
                          {/* Status Badge */}
                          <div className="absolute top-3 right-3">
                            <Badge
                              variant={company.status === "active" ? "default" : "secondary"}
                              className={
                                company.status === "active"
                                  ? "bg-emerald-500 hover:bg-emerald-600"
                                  : "bg-gray-500"
                              }
                            >
                              {company.status === "active" ? "Ativa" : "Inativa"}
                            </Badge>
                          </div>
                          {/* Company Name */}
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="font-bold text-white text-lg truncate">
                              {company.tradeName || company.name}
                            </h3>
                            <p className="text-white/80 text-xs truncate">
                              {company.name}
                            </p>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{cityState}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{company.email || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{company.phone || "—"}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-violet-600">
                                <Percent className="h-3 w-3" />
                                <span className="text-sm font-bold">
                                  {company.commissionPercentage ?? "—"}%
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">Comissão</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-muted-foreground">
                                {company.cnpj ? "CNPJ cadastrado" : "—"}
                              </p>
                              <p className="text-xs text-muted-foreground">Documento</p>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleEdit(company)}
                            >
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleDeleteClick(company.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading && companies.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-foreground">Nenhuma empresa encontrada</h3>
                  <p className="text-muted-foreground mt-1">
                    {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                      ? "Ajuste os filtros ou cadastre uma nova empresa"
                      : "Cadastre a primeira empresa"}
                  </p>
                  <Button
                    onClick={() => { setCompanyToEdit(null); setNewCompanyModalOpen(true); }}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Empresa
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CompanyModal
        open={newCompanyModalOpen}
        onOpenChange={handleCompanyModalClose}
        initialMode={companyToEdit ? "edit" : "create"}
        companyToEdit={companyToEdit ?? undefined}
        onSuccess={handleSuccess}
      />

      <AlertDialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A empresa será removida do cadastro.
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
