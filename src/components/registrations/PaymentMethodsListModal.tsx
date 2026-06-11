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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CreditCard,
  Banknote,
  QrCode,
  Landmark,
  Receipt,
  Wallet,
  Search,
  Plus,
  Percent,
  Clock,
  Calendar,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { PaymentMethodModal } from "./PaymentMethodModal";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface PaymentMethodsListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Forma de pagamento retornada pela API */
interface ApiPaymentMethod {
  id: number;
  uuid?: string;
  name: string;
  code?: string | null;
  type: string;
  fee?: number;
  feeType?: string;
  maxInstallments?: number;
  daysToReceive?: number;
  minValue?: number | null;
  maxValue?: number | null;
  isActive?: boolean;
  [key: string]: unknown;
}

const typeConfig: Record<string, { icon: typeof CreditCard; label: string; color: string }> = {
  credit: { icon: CreditCard, label: "Cartão de Crédito", color: "from-blue-500 to-blue-600" },
  credit_card: { icon: CreditCard, label: "Cartão de Crédito", color: "from-blue-500 to-blue-600" },
  debit: { icon: CreditCard, label: "Cartão de Débito", color: "from-emerald-500 to-emerald-600" },
  debit_card: { icon: CreditCard, label: "Cartão de Débito", color: "from-emerald-500 to-emerald-600" },
  pix: { icon: QrCode, label: "PIX", color: "from-cyan-500 to-cyan-600" },
  cash: { icon: Banknote, label: "Dinheiro", color: "from-green-500 to-green-600" },
  transfer: { icon: Landmark, label: "Transferência", color: "from-violet-500 to-violet-600" },
  bank_transfer: { icon: Landmark, label: "Transferência", color: "from-violet-500 to-violet-600" },
  invoice: { icon: Receipt, label: "Faturado", color: "from-amber-500 to-amber-600" },
  voucher: { icon: Wallet, label: "Voucher", color: "from-pink-500 to-pink-600" },
  check: { icon: Receipt, label: "Cheque", color: "from-indigo-500 to-indigo-600" },
};

export function PaymentMethodsListModal({ open, onOpenChange }: PaymentMethodsListModalProps) {
  const [methods, setMethods] = useState<ApiPaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newPaymentMethodModalOpen, setNewPaymentMethodModalOpen] = useState(false);
  const [methodToEdit, setMethodToEdit] = useState<ApiPaymentMethod | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    const res = await api.getPaymentMethods(true);
    setLoading(false);
    if (res.success && res.data?.paymentMethods) {
      setMethods(res.data.paymentMethods as ApiPaymentMethod[]);
    } else {
      setMethods([]);
    }
  }, []);

  useEffect(() => {
    if (open) fetchMethods();
  }, [open, fetchMethods]);

  const handleModalClose = (isOpen: boolean) => {
    if (!isOpen) setMethodToEdit(null);
    setNewPaymentMethodModalOpen(isOpen);
  };

  const handleSuccess = () => {
    fetchMethods();
  };

  const handleEdit = (method: ApiPaymentMethod) => {
    setMethodToEdit(method);
    setNewPaymentMethodModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId == null) return;
    setDeleting(true);
    const res = await api.deletePaymentMethod(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (res.success) {
      toast.success("Forma de pagamento excluída.");
      fetchMethods();
    } else {
      toast.error(res.error?.message ?? "Erro ao excluir.");
    }
  };

  const filteredMethods = methods.filter((method) => {
    const matchesSearch = !searchTerm.trim() ||
      (method.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (method.code || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || method.type === typeFilter;
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && method.isActive) ||
      (statusFilter === "inactive" && !method.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: methods.length,
    active: methods.filter((m) => m.isActive).length,
    totalUsage: 0,
    totalVolume: 0,
  };

  const getTypeInfo = (typeKey: string) => {
    return typeConfig[typeKey] ?? typeConfig.credit;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col bg-background border-border">
          <DialogHeader className="pb-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                  <CreditCard className="h-8 w-8 text-amber-500" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    Formas de Pagamento
                  </DialogTitle>
                  <p className="text-muted-foreground mt-1">
                    Gerencie os métodos de pagamento aceitos
                  </p>
                </div>
              </div>
              <Button
                onClick={() => { setMethodToEdit(null); setNewPaymentMethodModalOpen(true); }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Forma
              </Button>
            </div>
          </DialogHeader>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 flex-shrink-0">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Formas</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Ativas</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/20">
                  <TrendingUp className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">—</p>
                  <p className="text-xs text-muted-foreground">Transações</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Wallet className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">—</p>
                  <p className="text-xs text-muted-foreground">Volume Total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 py-4 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-background border-border">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="credit">Cartão de Crédito</SelectItem>
                <SelectItem value="debit">Cartão de Débito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="transfer">Transferência</SelectItem>
                <SelectItem value="invoice">Faturado</SelectItem>
                <SelectItem value="voucher">Voucher</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-background border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cards Grid */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Carregando...</span>
              </div>
            ) : filteredMethods.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <CreditCard className="h-12 w-12 mb-2 opacity-50" />
                <p>Nenhuma forma de pagamento encontrada.</p>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4 pb-4">
                  {filteredMethods.map((method) => {
                    const config = getTypeInfo(method.type);
                    const TypeIcon = config.icon;
                    return (
                      <div
                        key={method.id}
                        className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-amber-500/30"
                      >
                        {/* Header com gradiente (sem imagem do banco) */}
                        <div className={`relative h-32 overflow-hidden bg-gradient-to-br ${config.color}`}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <TypeIcon className="h-16 w-16 text-white/30" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute top-3 right-3">
                            <Badge className={method.isActive
                              ? "bg-emerald-500/90 text-white border-0"
                              : "bg-red-500/90 text-white border-0"
                            }>
                              {method.isActive ? (
                                <><CheckCircle2 className="h-3 w-3 mr-1" /> Ativo</>
                              ) : (
                                <><XCircle className="h-3 w-3 mr-1" /> Inativo</>
                              )}
                            </Badge>
                          </div>
                          <div className="absolute bottom-3 left-3 flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-white/20">
                              <TypeIcon className="h-4 w-4 text-white" />
                            </div>
                            <Badge variant="secondary" className="bg-black/40 text-white border-0">
                              {config.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="p-4 space-y-4">
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">{method.name}</h3>
                            <p className="text-sm text-muted-foreground font-mono">{method.code ?? "—"}</p>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 rounded-lg bg-muted/50">
                              <div className="flex items-center justify-center gap-1 text-amber-500">
                                <Percent className="h-3 w-3" />
                                <span className="font-bold text-sm">{method.fee ?? 0}%</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Taxa</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-muted/50">
                              <div className="flex items-center justify-center gap-1 text-blue-500">
                                <Calendar className="h-3 w-3" />
                                <span className="font-bold text-sm">{method.maxInstallments ?? 1}x</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Parcelas</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-muted/50">
                              <div className="flex items-center justify-center gap-1 text-violet-500">
                                <Clock className="h-3 w-3" />
                                <span className="font-bold text-sm">{method.daysToReceive ?? 0}d</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Receber</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border text-sm text-muted-foreground">
                            <span>Transações: —</span>
                            <span>Volume: —</span>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(method)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(method.id)}
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

      <PaymentMethodModal
        open={newPaymentMethodModalOpen}
        onOpenChange={handleModalClose}
        initialData={methodToEdit ?? undefined}
        onSuccess={handleSuccess}
      />

      <AlertDialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir forma de pagamento?</AlertDialogTitle>
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
