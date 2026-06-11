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
  Tag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
  Loader2,
  Hotel,
  Receipt,
  Sparkles,
  Building2,
  Users,
  Home,
  Wallet,
  Percent,
  Palette,
  Type,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Hotel,
  Receipt,
  Sparkles,
  Building2,
  Users,
  DollarSign,
  Home,
  Wallet,
  Percent,
  Tag,
  TrendingUp,
  TrendingDown,
  Palette,
  Type,
};

const ICON_OPTIONS = [
  { value: "Hotel", label: "Hotel" },
  { value: "Receipt", label: "Recibo" },
  { value: "Sparkles", label: "Brindes" },
  { value: "Building2", label: "Prédio" },
  { value: "Users", label: "Usuários" },
  { value: "DollarSign", label: "Dinheiro" },
  { value: "Home", label: "Casa" },
  { value: "Wallet", label: "Carteira" },
  { value: "Percent", label: "Porcentagem" },
  { value: "Tag", label: "Etiqueta" },
  { value: "TrendingUp", label: "Crescimento" },
  { value: "TrendingDown", label: "Queda" },
  { value: "Palette", label: "Paleta" },
  { value: "Type", label: "Texto" },
];

const COLOR_OPTIONS = [
  { value: "emerald-500", label: "Esmeralda", bg: "bg-emerald-500", text: "text-emerald-500" },
  { value: "blue-500", label: "Azul", bg: "bg-blue-500", text: "text-blue-500" },
  { value: "violet-500", label: "Violeta", bg: "bg-violet-500", text: "text-violet-500" },
  { value: "amber-500", label: "Âmbar", bg: "bg-amber-500", text: "text-amber-500" },
  { value: "cyan-500", label: "Ciano", bg: "bg-cyan-500", text: "text-cyan-500" },
  { value: "slate-500", label: "Ardósia", bg: "bg-slate-500", text: "text-slate-500" },
  { value: "orange-500", label: "Laranja", bg: "bg-orange-500", text: "text-orange-500" },
  { value: "yellow-500", label: "Amarelo", bg: "bg-yellow-500", text: "text-yellow-500" },
  { value: "indigo-500", label: "Índigo", bg: "bg-indigo-500", text: "text-indigo-500" },
  { value: "rose-500", label: "Rosa", bg: "bg-rose-500", text: "text-rose-500" },
  { value: "purple-500", label: "Roxo", bg: "bg-purple-500", text: "text-purple-500" },
  { value: "red-500", label: "Vermelho", bg: "bg-red-500", text: "text-red-500" },
];

function getIconComponent(name: string) {
  return ICON_MAP[name] || DollarSign;
}

function getColorClasses(color: string) {
  const opt = COLOR_OPTIONS.find((c) => c.value === color);
  return opt || COLOR_OPTIONS[5];
}

interface FinancialCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FinancialCategoryItem {
  id: number;
  name: string;
  type: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export function FinancialCategoryModal({ open, onOpenChange }: FinancialCategoryModalProps) {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [activeTab, setActiveTab] = useState<"income" | "expense">("income");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: number; name: string } | null>(null);
  const [editingCategory, setEditingCategory] = useState<FinancialCategoryItem | null>(null);
  const [categories, setCategories] = useState<FinancialCategoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "income" as "income" | "expense",
    icon: "DollarSign",
    color: "slate-500",
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      // Carrega todas as categorias (ativas e inativas) para o modal de gestão
      const response = await api.getFinancialCategories();
      const raw = response.data as { categories?: FinancialCategoryItem[] } | undefined;
      const list = Array.isArray(raw?.categories) ? raw.categories : [];
      setCategories(list);
      if (!response.success && response.error) {
        toast.error(response.error.message || "Erro ao carregar categorias financeiras");
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toast.error("Erro ao carregar categorias financeiras");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = useMemo(() => {
    let list = categories.filter((c) => c.type === activeTab);
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      list = list.filter((c) => c.name?.toLowerCase().includes(s));
    }
    return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [categories, activeTab, searchTerm]);

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      type: activeTab,
      icon: "DollarSign",
      color: activeTab === "income" ? "emerald-500" : "red-500",
      sortOrder: categories.filter((c) => c.type === activeTab).length,
      isActive: true,
    });
    setMode("create");
  };

  const handleEdit = (cat: FinancialCategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      type: (cat.type === "income" || cat.type === "expense" ? cat.type : "income") as "income" | "expense",
      icon: cat.icon || "DollarSign",
      color: cat.color || "slate-500",
      sortOrder: cat.sortOrder ?? 0,
      isActive: cat.isActive ?? true,
    });
    setMode("edit");
  };

  const handleBack = () => {
    setMode("list");
    setEditingCategory(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Informe o nome da categoria");
      return;
    }
    try {
      setIsSubmitting(true);
      if (mode === "edit" && editingCategory) {
        const res = await api.updateFinancialCategory(editingCategory.id, formData);
        if (res.success) {
          toast.success("Categoria atualizada com sucesso");
          loadCategories();
          handleBack();
        } else {
          toast.error((res as { message?: string }).message || "Erro ao atualizar");
        }
      } else {
        const res = await api.createFinancialCategory(formData);
        if (res.success) {
          toast.success("Categoria criada com sucesso");
          loadCategories();
          handleBack();
        } else {
          toast.error((res as { message?: string }).message || "Erro ao criar");
        }
      }
    } catch (error) {
      toast.error("Erro ao salvar categoria");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const res = await api.deleteFinancialCategory(categoryToDelete.id);
      if (res.success) {
        toast.success("Categoria excluída");
        loadCategories();
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
      } else {
        toast.error((res as { message?: string }).message || "Erro ao excluir");
      }
    } catch {
      toast.error("Erro ao excluir categoria");
    }
  };

  const handleClose = () => {
    setMode("list");
    setEditingCategory(null);
    setSearchTerm("");
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className={cn(
            "max-w-5xl max-h-[92vh] p-0 gap-0 overflow-hidden flex flex-col",
            mode === "list" ? "sm:max-w-5xl" : "sm:max-w-2xl"
          )}
        >
          {mode === "list" ? (
            <>
              {/* Header ilustrativo */}
              <div className="relative px-8 py-6 border-b bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-amber-500/10 flex-shrink-0 overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-emerald-400/20 blur-3xl" />
                  <div className="absolute top-1/2 -left-24 w-48 h-48 rounded-full bg-amber-400/20 blur-3xl" />
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
                  <Tag className="h-40 w-40 text-emerald-600" strokeWidth={0.5} />
                </div>
                <DialogHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-2xl shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                        <Tag className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <DialogTitle className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                          Categorias Financeiras
                        </DialogTitle>
                        <p className="text-sm font-normal text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                          Gerencie categorias para receitas e despesas na tela Financeiro
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleCreate}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 relative z-10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Categoria
                    </Button>
                  </div>
                </DialogHeader>
              </div>

              <div className="flex-1 min-h-0 flex flex-col">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "income" | "expense")} className="flex-1 flex flex-col min-h-0">
                  <div className="px-6 pt-4 flex-shrink-0">
                    <div className="flex gap-2 mb-4">
                      <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="income" className="gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Receitas
                          <Badge variant="secondary" className="ml-1">
                            {categories.filter((c) => c.type === "income").length}
                          </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="expense" className="gap-2">
                          <TrendingDown className="h-4 w-4" />
                          Despesas
                          <Badge variant="secondary" className="ml-1">
                            {categories.filter((c) => c.type === "expense").length}
                          </Badge>
                        </TabsTrigger>
                      </TabsList>
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar categorias..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <TabsContent value="income" className="flex-1 min-h-0 data-[state=active]:flex data-[state=active]:flex-col mt-0">
                    <ScrollArea className="flex-1 min-h-0 px-6 pb-6">
                      {isLoading ? (
                        <div className="flex justify-center py-16">
                          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                        </div>
                      ) : filteredCategories.length === 0 ? (
                        <Card className="border-dashed">
                          <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="p-4 rounded-full bg-emerald-500/10 mb-4">
                              <TrendingUp className="h-12 w-12 text-emerald-500" />
                            </div>
                            <p className="text-lg font-semibold text-muted-foreground mb-2">
                              {searchTerm ? "Nenhuma categoria encontrada" : "Nenhuma categoria de receita"}
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">
                              {searchTerm ? "Tente outro termo" : "Crie categorias como Hospedagem, Extras, Serviços..."}
                            </p>
                            {!searchTerm && (
                              <Button onClick={handleCreate} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Nova Categoria de Receita
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredCategories.map((cat) => {
                            const Icon = getIconComponent(cat.icon);
                            const colorInfo = getColorClasses(cat.color);
                            return (
                              <Card
                                key={cat.id}
                                className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                                onClick={() => handleEdit(cat)}
                              >
                                <CardContent className="p-5 flex items-center gap-4">
                                  <div className={cn("p-3 rounded-xl", colorInfo.bg, "flex-shrink-0")}>
                                    <Icon className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate">{cat.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {cat.isActive ? "Ativa" : "Inativa"}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCategoryToDelete(cat);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="expense" className="flex-1 min-h-0 data-[state=active]:flex data-[state=active]:flex-col mt-0">
                    <ScrollArea className="flex-1 min-h-0 px-6 pb-6">
                      {isLoading ? (
                        <div className="flex justify-center py-16">
                          <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
                        </div>
                      ) : filteredCategories.length === 0 ? (
                        <Card className="border-dashed">
                          <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="p-4 rounded-full bg-rose-500/10 mb-4">
                              <TrendingDown className="h-12 w-12 text-rose-500" />
                            </div>
                            <p className="text-lg font-semibold text-muted-foreground mb-2">
                              {searchTerm ? "Nenhuma categoria encontrada" : "Nenhuma categoria de despesa"}
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">
                              {searchTerm ? "Tente outro termo" : "Crie categorias como Manutenção, Comissão, Fornecedores..."}
                            </p>
                            {!searchTerm && (
                              <Button onClick={handleCreate} variant="destructive" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Nova Categoria de Despesa
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredCategories.map((cat) => {
                            const Icon = getIconComponent(cat.icon);
                            const colorInfo = getColorClasses(cat.color);
                            return (
                              <Card
                                key={cat.id}
                                className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                                onClick={() => handleEdit(cat)}
                              >
                                <CardContent className="p-5 flex items-center gap-4">
                                  <div className={cn("p-3 rounded-xl", colorInfo.bg, "flex-shrink-0")}>
                                    <Icon className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate">{cat.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {cat.isActive ? "Ativa" : "Inativa"}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCategoryToDelete(cat);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          ) : (
            <>
              <div className="px-6 py-4 border-b flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <DialogTitle>
                    {mode === "edit" ? "Editar Categoria" : "Nova Categoria"}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {formData.type === "income" ? "Receita" : "Despesa"}
                  </p>
                </div>
              </div>

              <ScrollArea className="flex-1 max-h-[60vh]">
                <div className="p-6 space-y-6">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Hospedagem, Manutenção"
                    />
                  </div>

                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) => setFormData({ ...formData, type: v as "income" | "expense" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Palette className="h-4 w-4" />
                      Ícone
                    </Label>
                    <div className="grid grid-cols-7 gap-2">
                      {ICON_OPTIONS.map((opt) => {
                        const Icon = ICON_MAP[opt.value] || DollarSign;
                        const isSelected = formData.icon === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, icon: opt.value })}
                            className={cn(
                              "p-3 rounded-lg border-2 transition-all flex items-center justify-center",
                              isSelected ? "border-emerald-500 bg-emerald-500/10" : "border-border hover:border-emerald-300"
                            )}
                            title={opt.label}
                          >
                            <Icon className="h-5 w-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">Cor</Label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map((opt) => {
                        const isSelected = formData.color === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, color: opt.value })}
                            className={cn(
                              "w-10 h-10 rounded-full border-2 transition-all",
                              opt.bg,
                              isSelected ? "ring-2 ring-offset-2 ring-emerald-500 scale-110" : "hover:scale-105"
                            )}
                            title={opt.label}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="isActive">Categoria ativa</Label>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                    />
                  </div>
                </div>
              </ScrollArea>

              <div className="px-6 py-4 border-t flex justify-end gap-2">
                <Button variant="outline" onClick={handleBack}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === "edit" ? "Salvar" : "Criar"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              A categoria &quot;{categoryToDelete?.name}&quot; será excluída. Transações existentes
              manterão o nome da categoria, mas novas transações não poderão usá-la.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
