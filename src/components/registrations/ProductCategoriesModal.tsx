import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Utensils,
  Wine,
  Sparkles,
  ShoppingBag,
  Wrench,
  Shirt,
  Pill,
  Gift,
  Coffee,
  Layers,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  Palette,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface ProductCategoriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryIcons = [
  { id: "package", icon: Package, label: "Geral" },
  { id: "utensils", icon: Utensils, label: "Alimentos" },
  { id: "wine", icon: Wine, label: "Bebidas" },
  { id: "sparkles", icon: Sparkles, label: "Limpeza" },
  { id: "shopping", icon: ShoppingBag, label: "Varejo" },
  { id: "wrench", icon: Wrench, label: "Manutenção" },
  { id: "shirt", icon: Shirt, label: "Vestuário" },
  { id: "pill", icon: Pill, label: "Higiene" },
  { id: "gift", icon: Gift, label: "Presentes" },
  { id: "coffee", icon: Coffee, label: "Cafeteria" },
  { id: "layers", icon: Layers, label: "Diversos" },
];

const categoryColors = [
  { id: "blue", color: "bg-blue-500", label: "Azul" },
  { id: "emerald", color: "bg-emerald-500", label: "Verde" },
  { id: "amber", color: "bg-amber-500", label: "Amarelo" },
  { id: "orange", color: "bg-orange-500", label: "Laranja" },
  { id: "red", color: "bg-red-500", label: "Vermelho" },
  { id: "pink", color: "bg-pink-500", label: "Rosa" },
  { id: "purple", color: "bg-purple-500", label: "Roxo" },
  { id: "cyan", color: "bg-cyan-500", label: "Ciano" },
  { id: "slate", color: "bg-slate-500", label: "Cinza" },
];

/** Mapeia cor em hex (API) para id de cor do modal */
const hexToColorId: Record<string, string> = {
  "#3B82F6": "blue",
  "#8B5CF6": "purple",
  "#10B981": "emerald",
  "#F59E0B": "amber",
  "#6366F1": "purple",
  "#EC4899": "pink",
  "#EF4444": "red",
  "#78716C": "slate",
};

/** Mapeia id de cor do modal para hex (API) */
const colorIdToHex: Record<string, string> = {
  blue: "#3B82F6",
  emerald: "#10B981",
  amber: "#F59E0B",
  orange: "#F97316",
  red: "#EF4444",
  pink: "#EC4899",
  purple: "#8B5CF6",
  cyan: "#06B6D4",
  slate: "#64748B",
};

export type ProductCategoryRow = {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  status?: string;
  parentId?: number | null;
};

const configSteps = [
  { id: "info", title: "Informações", description: "Dados básicos da categoria", icon: FolderTree },
  { id: "visual", title: "Visual", description: "Ícone e cor da categoria", icon: Palette },
  { id: "config", title: "Configuração", description: "Opções adicionais", icon: Package },
];

export function ProductCategoriesModal({ open, onOpenChange }: ProductCategoriesModalProps) {
  const [view, setView] = useState<"list" | "create">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [categories, setCategories] = useState<ProductCategoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategoryRow | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    icon: "",
    color: "",
    parentCategory: "",
    isActive: true,
    showInPOS: true,
    showInBooking: false,
    minStock: "",
    maxStock: "",
  });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    api
      .getProductCategories()
      .then((res) => {
        if (cancelled) return;
        const list = (res?.data as { productCategories?: ProductCategoryRow[] })?.productCategories ?? [];
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) {
          setCategories([]);
          toast.error("Erro ao carregar categorias");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const progressPercent = ((currentStep + 1) / configSteps.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === configSteps.length - 1;

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const code = formData.code.trim()
      ? formData.code.toUpperCase().replace(/\s/g, "_")
      : formData.name.slice(0, 3).toUpperCase().replace(/\s/g, "X") || "CAT";
    const status: "active" | "inactive" = formData.isActive ? "active" : "inactive";
    const payload = {
      code,
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      color: formData.color ? (colorIdToHex[formData.color] ?? null) : null,
      icon: formData.icon || null,
      parentId: formData.parentCategory ? Number(formData.parentCategory) : null,
      status,
    };

    if (editingCategory) {
      const res = await api.updateProductCategory(editingCategory.id, payload);
      if (res.success) {
        toast.success("Categoria atualizada com sucesso");
        setView("list");
        resetForm();
        const listRes = await api.getProductCategories();
        const list = (listRes?.data as { productCategories?: ProductCategoryRow[] })?.productCategories ?? [];
        setCategories(Array.isArray(list) ? list : []);
      } else {
        toast.error(res.error?.message || "Erro ao atualizar categoria");
      }
    } else {
      const res = await api.createProductCategory(payload);
      if (res.success) {
        toast.success("Categoria criada com sucesso");
        setView("list");
        resetForm();
        const listRes = await api.getProductCategories();
        const list = (listRes?.data as { productCategories?: ProductCategoryRow[] })?.productCategories ?? [];
        setCategories(Array.isArray(list) ? list : []);
      } else {
        toast.error(res.error?.message || "Erro ao criar categoria");
      }
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      code: "",
      icon: "",
      color: "",
      parentCategory: "",
      isActive: true,
      showInPOS: true,
      showInBooking: false,
      minStock: "",
      maxStock: "",
    });
  };

  const openNewCategory = () => {
    resetForm();
    setView("create");
  };

  const openEditCategory = (category: ProductCategoryRow) => {
    const hex = category.color ?? "";
    const colorId = hex ? (hexToColorId[hex.toUpperCase()] || hexToColorId[hex] || "") : "";
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description ?? "",
      code: category.code,
      icon: (category.icon as string) || "",
      color: colorId,
      parentCategory: category.parentId != null ? String(category.parentId) : "",
      isActive: category.status === "active",
      showInPOS: true,
      showInBooking: false,
      minStock: "",
      maxStock: "",
    });
    setCurrentStep(0);
    setView("create");
  };

  const handleClose = () => {
    onOpenChange(false);
    setView("list");
    resetForm();
  };

  const getIconComponent = (iconId: string) => {
    const iconData = categoryIcons.find((i) => i.id === iconId);
    return iconData?.icon || Package;
  };

  const getColorClass = (colorId: string) => {
    const colorData = categoryColors.find((c) => c.id === colorId);
    return colorData?.color || "bg-slate-500";
  };

  /** Cor da API (hex) para classe Tailwind */
  const getColorClassFromApi = (hex: string | null | undefined) => {
    if (!hex) return "bg-slate-500";
    const id = hexToColorId[hex.toUpperCase()] || hexToColorId[hex];
    return getColorClass(id || "slate");
  };

  const selectedIcon = categoryIcons.find((i) => i.id === formData.icon);
  const selectedColor = categoryColors.find((c) => c.id === formData.color);

  const renderListView = () => (
    <div className="space-y-4">
      {/* Search and Add */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={openNewCategory}
          className="bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-gradient-to-r from-fuchsia-500/10 to-pink-500/10">
          <p className="text-2xl font-bold">{categories.length}</p>
          <p className="text-sm text-muted-foreground">Total Categorias</p>
        </div>
        <div className="p-4 rounded-xl border bg-gradient-to-r from-emerald-500/10 to-green-500/10">
          <p className="text-2xl font-bold">{categories.filter((c) => c.status === "active").length}</p>
          <p className="text-sm text-muted-foreground">Ativas</p>
        </div>
        <div className="p-4 rounded-xl border bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
          <p className="text-2xl font-bold">—</p>
          <p className="text-sm text-muted-foreground">Produtos</p>
        </div>
      </div>

      {/* Categories List - scroll apenas nesta parte (dados do banco) */}
      <ScrollArea className="max-h-[min(50vh,380px)] rounded-lg border [&>div]:!max-h-[min(50vh,380px)]">
        <div className="space-y-2 p-1">
          {loading ? (
            <p className="p-4 text-center text-muted-foreground">Carregando categorias...</p>
          ) : filteredCategories.length === 0 ? (
            <p className="p-4 text-center text-muted-foreground">Nenhuma categoria cadastrada</p>
          ) : filteredCategories.map((category) => {
            const IconComponent = getIconComponent((category.icon as string) || "package");
            const colorClass = getColorClassFromApi(category.color);
            const childrenCount = categories.filter((c) => c.parentId === category.id).length;

            return (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 rounded-xl border bg-background hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl", colorClass)}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.code}
                      {childrenCount > 0 && (
                        <span className="ml-2 text-primary">
                          · {childrenCount} {childrenCount === 1 ? "subcategoria" : "subcategorias"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      category.status === "active"
                        ? "border-emerald-500/50 text-emerald-600 bg-emerald-500/10"
                        : "border-red-500/50 text-red-600 bg-red-500/10"
                    )}
                  >
                    {category.status === "active" ? "Ativa" : "Inativa"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditCategory(category)}
                    title="Editar categoria"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  const renderStepContent = () => {
    switch (configSteps[currentStep].id) {
      case "info":
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-fuchsia-500/5 to-pink-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-500">
                  <FolderTree className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Dados da Categoria</h3>
                  <p className="text-sm text-muted-foreground">Informações básicas</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Categoria *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Bebidas Alcoólicas"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Código</Label>
                    <Input
                      id="code"
                      placeholder="Ex: BEB-ALC"
                      value={formData.code}
                      onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva a categoria..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* Parent Category */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-violet-500/5 to-purple-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Hierarquia</h3>
                  <p className="text-sm text-muted-foreground">Categoria pai (opcional)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setFormData((prev) => ({ ...prev, parentCategory: "" }))}
                  className={cn(
                    "p-3 rounded-xl border-2 text-center transition-all",
                    !formData.parentCategory
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <p className="font-medium text-sm">Nenhuma (Raiz)</p>
                </button>
                {categories
                  .filter((cat) => !editingCategory || cat.id !== editingCategory.id)
                  .map((cat) => {
                    const IconComp = getIconComponent((cat.icon as string) || "package");
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, parentCategory: String(cat.id) }))}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all flex items-center gap-2",
                          formData.parentCategory === String(cat.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <IconComp className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm truncate">{cat.name}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        );

      case "visual":
        return (
          <div className="space-y-6">
            {/* Icon Selection */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Ícone da Categoria</h3>
                  <p className="text-sm text-muted-foreground">Selecione um ícone representativo</p>
                </div>
              </div>

              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {categoryIcons.map((iconData) => {
                  const IconComp = iconData.icon;
                  return (
                    <button
                      key={iconData.id}
                      onClick={() => setFormData((prev) => ({ ...prev, icon: iconData.id }))}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                        formData.icon === iconData.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <IconComp className="h-6 w-6" />
                      <span className="text-xs text-muted-foreground">{iconData.label}</span>
                      {formData.icon === iconData.id && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Selection */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-amber-500/5 to-orange-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Cor da Categoria</h3>
                  <p className="text-sm text-muted-foreground">Escolha uma cor para identificação</p>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {categoryColors.map((colorData) => (
                  <button
                    key={colorData.id}
                    onClick={() => setFormData((prev) => ({ ...prev, color: colorData.id }))}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                      formData.color === colorData.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-full", colorData.color)} />
                    <span className="text-xs text-muted-foreground">{colorData.label}</span>
                    {formData.color === colorData.id && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {formData.icon && formData.color && (
              <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                <h4 className="font-semibold mb-4">Pré-visualização</h4>
                <div className="flex items-center gap-4 p-4 rounded-xl border bg-background">
                  <div className={cn("p-3 rounded-xl", getColorClass(formData.color))}>
                    {selectedIcon && <selectedIcon.icon className="h-6 w-6 text-white" />}
                  </div>
                  <div>
                    <p className="font-semibold">{formData.name || "Nome da Categoria"}</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.description || "Descrição da categoria"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "config":
        return (
          <div className="space-y-6">
            {/* Visibility Settings */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Visibilidade</h3>
                  <p className="text-sm text-muted-foreground">Onde esta categoria aparece</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-background">
                  <div>
                    <p className="font-medium">Categoria Ativa</p>
                    <p className="text-sm text-muted-foreground">Disponível para uso no sistema</p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isActive: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-background">
                  <div>
                    <p className="font-medium">Exibir no PDV</p>
                    <p className="text-sm text-muted-foreground">Mostrar no ponto de venda</p>
                  </div>
                  <Switch
                    checked={formData.showInPOS}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, showInPOS: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-background">
                  <div>
                    <p className="font-medium">Exibir no Motor de Reservas</p>
                    <p className="text-sm text-muted-foreground">Disponível para hóspedes</p>
                  </div>
                  <Switch
                    checked={formData.showInBooking}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, showInBooking: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Stock Settings */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-orange-500/5 to-red-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Configurações de Estoque (Padrão)</h3>
                  <p className="text-sm text-muted-foreground">
                    Valores aplicados aos novos produtos desta categoria
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minStock">Estoque Mínimo Padrão</Label>
                  <Input
                    id="minStock"
                    type="number"
                    placeholder="Ex: 10"
                    value={formData.minStock}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, minStock: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStock">Estoque Máximo Padrão</Label>
                  <Input
                    id="maxStock"
                    type="number"
                    placeholder="Ex: 100"
                    value={formData.maxStock}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, maxStock: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-fuchsia-500/5 to-pink-500/5">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-fuchsia-500" />
                Resumo da Categoria
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-background border">
                  {selectedIcon && selectedColor ? (
                    <div
                      className={cn("w-10 h-10 rounded-xl mx-auto mb-1", getColorClass(formData.color))}
                    >
                      <selectedIcon.icon className="h-5 w-5 text-white m-auto translate-y-2.5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-muted mx-auto mb-1" />
                  )}
                  <p className="text-xs text-muted-foreground">Visual</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background border">
                  <p className="text-lg font-bold truncate">{formData.name || "-"}</p>
                  <p className="text-xs text-muted-foreground">Nome</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background border">
                  <p className="text-lg font-bold">{formData.code || "Auto"}</p>
                  <p className="text-xs text-muted-foreground">Código</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background border">
                  <Badge className={formData.isActive ? "bg-emerald-500" : "bg-red-500"}>
                    {formData.isActive ? "Ativa" : "Inativa"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Status</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative px-6 py-5 border-b bg-gradient-to-r from-fuchsia-500/10 via-pink-500/10 to-rose-500/10 flex-shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-fuchsia-500">
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
            </svg>
          </div>

          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            <FolderTree className="h-24 w-24 text-fuchsia-500" />
          </div>

          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-fuchsia-500 to-pink-500">
                <FolderTree className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="block">Categorias de Produtos</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {view === "list"
                    ? "Gerencie as categorias do catálogo"
                    : editingCategory
                      ? `Editar categoria: ${editingCategory.name}`
                      : `Etapa ${currentStep + 1} de ${configSteps.length} — ${configSteps[currentStep].title}`}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Progress Bar (only in create view) */}
          {view === "create" && (
            <div className="mt-4 space-y-2">
              <Progress value={progressPercent} className="h-2" />
              <div className="flex justify-between">
                {configSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(index)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs font-medium",
                        isCompleted && "text-emerald-600 bg-emerald-500/10",
                        isCurrent && "text-primary bg-primary/10",
                        !isCompleted && !isCurrent && "text-muted-foreground hover:bg-accent/50"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Icon className={cn("h-4 w-4", isCurrent ? "text-fuchsia-500" : "")} />
                      )}
                      <span className="hidden md:inline">{step.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto border-t p-6 pb-10">
          {view === "list" ? renderListView() : renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t bg-muted/30 flex-shrink-0">
          {view === "list" ? (
            <>
              <div className="text-sm text-muted-foreground">
                {categories.length} categorias cadastradas
              </div>
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={isFirstStep ? () => { setView("list"); resetForm(); } : handlePrevious}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                {isFirstStep ? "Voltar" : "Anterior"}
              </Button>

              <div className="flex items-center gap-2">
                {configSteps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === currentStep
                        ? "bg-primary w-6"
                        : index < currentStep
                        ? "bg-emerald-500"
                        : "bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => { setView("list"); resetForm(); }}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>

                {isLastStep ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.name}
                    className="min-w-[180px] bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingCategory ? "Salvar alterações" : "Criar Categoria"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={currentStep === 0 && !formData.name}
                    className="min-w-[140px] bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600"
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}