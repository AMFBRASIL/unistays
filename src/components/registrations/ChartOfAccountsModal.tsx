import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Receipt,
  FolderTree,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Check,
  Info,
  Hash,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

interface ChartOfAccountsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const accountTypes = [
  { id: "asset", label: "Ativo", description: "Recursos e bens", icon: TrendingUp, color: "from-emerald-500 to-green-500", badgeColor: "bg-emerald-500" },
  { id: "liability", label: "Passivo", description: "Obrigações e dívidas", icon: TrendingDown, color: "from-red-500 to-rose-500", badgeColor: "bg-red-500" },
  { id: "equity", label: "Patrimônio", description: "Capital e reservas", icon: DollarSign, color: "from-blue-500 to-cyan-500", badgeColor: "bg-blue-500" },
  { id: "revenue", label: "Receita", description: "Entradas e ganhos", icon: TrendingUp, color: "from-purple-500 to-violet-500", badgeColor: "bg-purple-500" },
  { id: "expense", label: "Despesa", description: "Saídas e custos", icon: TrendingDown, color: "from-amber-500 to-orange-500", badgeColor: "bg-amber-500" },
];

const accountCategories = [
  { id: "current_asset", label: "Ativo Circulante", type: "asset" },
  { id: "fixed_asset", label: "Ativo Fixo", type: "asset" },
  { id: "current_liability", label: "Passivo Circulante", type: "liability" },
  { id: "long_term_liability", label: "Passivo Não Circulante", type: "liability" },
  { id: "capital", label: "Capital Social", type: "equity" },
  { id: "reserves", label: "Reservas", type: "equity" },
  { id: "operating_revenue", label: "Receita Operacional", type: "revenue" },
  { id: "non_operating_revenue", label: "Receita Não Operacional", type: "revenue" },
  { id: "operating_expense", label: "Despesa Operacional", type: "expense" },
  { id: "non_operating_expense", label: "Despesa Não Operacional", type: "expense" },
];

const getAccountTypeInfo = (type: string) => {
  return accountTypes.find(t => t.id === type) || accountTypes[0];
};

export function ChartOfAccountsModal({ open, onOpenChange }: ChartOfAccountsModalProps) {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<any | null>(null);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [parentAccounts, setParentAccounts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    accountType: "" as "asset" | "liability" | "equity" | "revenue" | "expense" | "",
    category: "",
    parentAccountId: null as number | null,
    description: "",
    isActive: true,
    allowSubAccounts: false,
    allowTransactions: true,
  });

  // Load data when modal opens
  useEffect(() => {
    if (open && mode === "list") {
      loadAccounts();
    } else if (open && (mode === "create" || mode === "edit")) {
      loadParentAccounts();
    }
  }, [open, mode]);

  // Filter accounts based on search term
  const filteredAccounts = useMemo(() => {
    if (!searchTerm.trim()) return accounts;
    const search = searchTerm.toLowerCase().trim();
    return accounts.filter((account) => {
      const name = (account.name || "").toLowerCase();
      const code = (account.code || "").toLowerCase();
      const description = (account.description || "").toLowerCase();
      return name.includes(search) || code.includes(search) || description.includes(search);
    });
  }, [accounts, searchTerm]);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await api.getChartOfAccounts(searchTerm || undefined);
      if (response.success && response.data?.accounts) {
        setAccounts(response.data.accounts);
      }
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
      toast.error("Erro ao carregar plano de contas");
    } finally {
      setIsLoading(false);
    }
  };

  const loadParentAccounts = async () => {
    try {
      const response = await api.getChartOfAccounts(undefined, undefined, true);
      if (response.success && response.data?.accounts) {
        // Filtrar apenas contas que permitem subcontas e não é a conta sendo editada
        const filtered = response.data.accounts.filter((acc: any) => 
          acc.allowSubAccounts && acc.id !== editingAccount?.id
        );
        setParentAccounts(filtered);
      }
    } catch (error) {
      console.error("Erro ao carregar contas pai:", error);
    }
  };

  const loadAccountForEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await api.getChartOfAccountById(id);
      if (response.success && response.data) {
        const account = response.data;
        setEditingAccount(account);
        setFormData({
          code: account.code || "",
          name: account.name || "",
          accountType: account.accountType || "",
          category: account.category || "",
          parentAccountId: account.parentAccountId || null,
          description: account.description || "",
          isActive: account.isActive ?? true,
          allowSubAccounts: account.allowSubAccounts ?? false,
          allowTransactions: account.allowTransactions ?? true,
        });
        setActiveTab("general");
        setMode("edit");
      }
    } catch (error) {
      console.error("Erro ao carregar conta:", error);
      toast.error("Erro ao carregar conta contábil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.code.trim()) {
      toast.error("Código da conta é obrigatório");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Nome da conta é obrigatório");
      return;
    }
    if (!formData.accountType) {
      toast.error("Tipo de conta é obrigatório");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        accountType: formData.accountType,
        category: formData.category || null,
        parentAccountId: formData.parentAccountId || null,
        description: formData.description.trim() || null,
        allowSubAccounts: formData.allowSubAccounts,
        allowTransactions: formData.allowTransactions,
        isActive: formData.isActive,
      };

      let response;
      if (editingAccount) {
        response = await api.updateChartOfAccount(editingAccount.id, data);
      } else {
        response = await api.createChartOfAccount(data);
      }

      if (response.success) {
        toast.success(editingAccount ? "Conta atualizada!" : "Conta criada!", {
          description: editingAccount
            ? "A conta contábil foi atualizada com sucesso"
            : "A conta contábil foi criada com sucesso",
        });
        resetForm();
        setMode("list");
        loadAccounts();
      } else {
        toast.error(response.error?.message || "Erro ao salvar conta");
      }
    } catch (error: any) {
      console.error("Erro ao salvar conta:", error);
      toast.error("Erro ao salvar conta contábil");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!accountToDelete) return;

    try {
      setIsDeleting(true);
      const response = await api.deleteChartOfAccount(accountToDelete.id);

      if (response.success) {
        toast.success("Conta excluída!", {
          description: "A conta contábil foi excluída com sucesso",
        });
        setDeleteDialogOpen(false);
        setAccountToDelete(null);
        loadAccounts();
      } else {
        toast.error(response.error?.message || "Erro ao excluir conta");
      }
    } catch (error: any) {
      console.error("Erro ao excluir conta:", error);
      toast.error("Erro ao excluir conta contábil");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      accountType: "",
      category: "",
      parentAccountId: null,
      description: "",
      isActive: true,
      allowSubAccounts: false,
      allowTransactions: true,
    });
    setEditingAccount(null);
    setActiveTab("general");
  };

  const handleCreate = () => {
    resetForm();
    setMode("create");
    loadParentAccounts();
  };

  const handleEdit = async (account: any) => {
    await loadAccountForEdit(account.id);
  };

  const handleBack = () => {
    resetForm();
    setMode("list");
  };

  const handleClose = () => {
    resetForm();
    setMode("list");
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className={`${mode === "list" ? "max-w-7xl" : "max-w-6xl"} max-h-[95vh] p-0 gap-0 overflow-hidden flex flex-col`}>
          {mode === "list" && (
            <>
              <div className="relative px-6 py-5 border-b bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-500/10 flex-shrink-0">
                <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none">
                  <svg viewBox="0 0 200 200" className="w-full h-full text-emerald-500">
                    <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
                  </svg>
                </div>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none z-0">
                  <Receipt className="h-32 w-32 text-emerald-500" />
                </div>
                <DialogHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-2xl shadow-lg bg-gradient-to-br from-emerald-500 to-green-500">
                        <Receipt className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <DialogTitle className="text-2xl font-bold text-emerald-600">
                          Plano de Contas
                        </DialogTitle>
                        <p className="text-sm font-normal text-emerald-500 mt-1">
                          Gerencie a estrutura de contas contábeis
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleCreate}
                      className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white shadow-lg shadow-emerald-500/25 relative z-10 cursor-pointer"
                      type="button"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Plano de Contas
                    </Button>
                  </div>
                </DialogHeader>
              </div>

              <ScrollArea className="h-[calc(95vh-180px)]">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar contas por nome, código ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    </div>
                  ) : filteredAccounts.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-semibold text-muted-foreground mb-2">
                          Nenhuma conta encontrada
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          {searchTerm
                            ? "Tente ajustar sua busca"
                            : "Crie sua primeira conta contábil"}
                        </p>
                        {!searchTerm && (
                          <Button onClick={handleCreate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Plano de Contas
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {filteredAccounts.map((account) => {
                        const typeInfo = getAccountTypeInfo(account.accountType);
                        const Icon = typeInfo.icon;
                        return (
                          <Card key={account.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                  <div className={`p-3 rounded-xl bg-gradient-to-r ${typeInfo.color} flex-shrink-0`}>
                                    <Icon className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h3 className="font-semibold text-lg">{account.name}</h3>
                                      <Badge className={typeInfo.badgeColor}>
                                        {typeInfo.label}
                                      </Badge>
                                      {account.isActive ? (
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                          Ativa
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                          Inativa
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                      <div className="flex items-center gap-1">
                                        <Hash className="h-3 w-3" />
                                        <span className="font-mono">{account.code}</span>
                                      </div>
                                      {account.category && (
                                        <span>{accountCategories.find(c => c.id === account.category)?.label || account.category}</span>
                                      )}
                                      {account.parentAccount && (
                                        <div className="flex items-center gap-1">
                                          <FolderTree className="h-3 w-3" />
                                          <span>Pai: {account.parentAccount.code} - {account.parentAccount.name}</span>
                                        </div>
                                      )}
                                    </div>
                                    {account.description && (
                                      <p className="text-sm text-muted-foreground line-clamp-2">
                                        {account.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(account)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setAccountToDelete(account);
                                      setDeleteDialogOpen(true);
                                    }}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}

          {(mode === "create" || mode === "edit") && (
            <>
              <div className="relative px-6 py-5 border-b bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-500/10 flex-shrink-0">
                <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none">
                  <svg viewBox="0 0 200 200" className="w-full h-full text-emerald-500">
                    <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
                  </svg>
                </div>
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBack}
                      className="rounded-full"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="p-4 rounded-2xl shadow-lg bg-gradient-to-br from-emerald-500 to-green-500">
                      <Receipt className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-bold text-emerald-600">
                        {editingAccount ? "Editar Conta Contábil" : "Nova Conta Contábil"}
                      </DialogTitle>
                      <p className="text-sm font-normal text-emerald-500 mt-1">
                        {editingAccount
                          ? "Atualize as informações da conta"
                          : "Preencha os dados para criar uma nova conta"}
                      </p>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
                      <TabsTrigger value="general">Geral</TabsTrigger>
                      <TabsTrigger value="hierarchy">Hierarquia</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-6">
                      <Card>
                        <CardContent className="p-6 space-y-6">
                          <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                              <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                                {editingAccount ? "Editar Conta Contábil" : "Nova Conta Contábil"}
                              </h4>
                              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                Crie uma nova conta no plano de contas do sistema.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <Label className="text-lg font-semibold flex items-center gap-2">
                              <Receipt className="h-5 w-5 text-emerald-400" />
                              Tipo de Conta <span className="text-destructive">*</span>
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              {accountTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                  <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, accountType: type.id as any }))}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                                      formData.accountType === type.id
                                        ? "border-emerald-500 bg-emerald-500/10"
                                        : "border-border hover:border-emerald-300 bg-card"
                                    }`}
                                  >
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center mb-2`}>
                                      <Icon className="h-5 w-5 text-white" />
                                    </div>
                                    <p className="font-semibold text-foreground text-sm">{type.label}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {formData.accountType && (
                            <div className="space-y-2">
                              <Label htmlFor="category">Categoria</Label>
                              <Select 
                                value={formData.category} 
                                onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                              >
                                <SelectTrigger className="bg-background">
                                  <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                  {accountCategories
                                    .filter(cat => cat.type === formData.accountType)
                                    .map((cat) => (
                                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="code" className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-emerald-400" />
                                Código da Conta <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="code"
                                placeholder="Ex: 1.01.001"
                                value={formData.code}
                                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                                className="bg-background"
                                disabled={!!editingAccount}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="name">
                                Nome da Conta <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="name"
                                placeholder="Ex: Caixa"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                              id="description"
                              placeholder="Descrição detalhada da conta..."
                              value={formData.description}
                              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                              className="bg-background min-h-[100px]"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="hierarchy" className="space-y-6">
                      <Card>
                        <CardContent className="p-6 space-y-6">
                          <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                              <FolderTree className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                Estrutura Hierárquica
                              </h4>
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                Configure a hierarquia e relacionamento da conta.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="parentAccount">Conta Pai</Label>
                            <Select 
                              value={formData.parentAccountId?.toString() || "none"} 
                              onValueChange={(v) => setFormData(prev => ({ ...prev, parentAccountId: v === "none" ? null : parseInt(v, 10) }))}
                            >
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Selecione a conta pai (opcional)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Nenhuma (Conta Raiz)</SelectItem>
                                {parentAccounts.map((parent) => (
                                  <SelectItem key={parent.id} value={parent.id.toString()}>
                                    {parent.code} - {parent.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Deixe em branco para criar uma conta raiz</p>
                          </div>

                          <div className="space-y-4">
                            <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                                    <FolderTree className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <Label className="text-base font-semibold">Permitir Subcontas</Label>
                                    <p className="text-xs text-muted-foreground">Permitir criação de subcontas</p>
                                  </div>
                                </div>
                                <Switch
                                  checked={formData.allowSubAccounts}
                                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowSubAccounts: checked }))}
                                />
                              </div>
                            </div>

                            <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                                    <BookOpen className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <Label className="text-base font-semibold">Permitir Lançamentos</Label>
                                    <p className="text-xs text-muted-foreground">Permitir transações nesta conta</p>
                                  </div>
                                </div>
                                <Switch
                                  checked={formData.allowTransactions}
                                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowTransactions: checked }))}
                                />
                              </div>
                            </div>

                            <div className="p-5 rounded-2xl border bg-gradient-to-r from-purple-500/5 to-violet-500/5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500">
                                    <Check className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <Label className="text-base font-semibold">Conta Ativa</Label>
                                    <p className="text-xs text-muted-foreground">Conta disponível para uso</p>
                                  </div>
                                </div>
                                <Switch
                                  checked={formData.isActive}
                                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>

              <div className="flex items-center justify-between p-6 border-t bg-muted/30 flex-shrink-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>A estrutura do plano de contas segue padrões contábeis brasileiros</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || isLoading}
                    className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white shadow-lg shadow-emerald-500/25"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        {editingAccount ? "Salvar Alterações" : "Criar Conta"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conta contábil{" "}
              <strong>{accountToDelete?.name}</strong> (código: {accountToDelete?.code})?
              Esta ação não pode ser desfeita. Contas com subcontas não podem ser excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
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
