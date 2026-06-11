import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Package,
  Plus,
  X,
  Hotel,
  Building,
  TreePine,
  Home,
  Search,
  Check,
  ChevronRight,
  AlertTriangle,
  Boxes,
  CheckCircle,
  ShoppingBag,
  Warehouse,
  Settings2,
  FileText,
  Copy,
  Printer,
  QrCode,
  DollarSign,
  TrendingUp,
  Bell,
  RotateCcw,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface AddStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  property: {
    id: string;
    name: string;
    type: "hotel" | "apart-hotel" | "loft" | "temporada";
  } | null;
}

type PropertyType = "hotel" | "apart-hotel" | "loft" | "temporada";

const propertyTypeConfig: Record<PropertyType, { label: string; icon: typeof Hotel; color: string; gradient: string }> = {
  hotel: { label: "Hotel", icon: Hotel, color: "text-blue-500", gradient: "from-blue-500 to-cyan-500" },
  "apart-hotel": { label: "Apart-Hotel", icon: Building, color: "text-purple-500", gradient: "from-purple-500 to-pink-500" },
  loft: { label: "Loft", icon: Home, color: "text-amber-500", gradient: "from-amber-500 to-orange-500" },
  temporada: { label: "Temporada", icon: TreePine, color: "text-emerald-500", gradient: "from-emerald-500 to-green-500" }
};

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  unitCost: number;
  defaultMin: number;
  defaultMax: number;
}

interface StorageLocationOption {
  id: string;
  name: string;
  code?: string;
}

interface ExistingInventoryItemRef {
  productId: number;
  location?: string | null;
}

interface SelectedProduct {
  productId: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  locationId: string;
  autoReorder: boolean;
  alertEnabled: boolean;
}

const steps = [
  { id: 1, title: "Produtos", description: "Selecionar itens", icon: ShoppingBag },
  { id: 2, title: "Quantidades", description: "Definir estoques", icon: Boxes },
  { id: 3, title: "Localização", description: "Onde armazenar", icon: Warehouse },
  { id: 4, title: "Configurações", description: "Alertas e automação", icon: Settings2 },
  { id: 5, title: "Confirmação", description: "Revisar e salvar", icon: FileText },
];

export function AddStockModal({ open, onOpenChange, property, onSuccess }: AddStockModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [globalLocation, setGlobalLocation] = useState("");
  const [globalAutoReorder, setGlobalAutoReorder] = useState(true);
  const [globalAlerts, setGlobalAlerts] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [storageLocations, setStorageLocations] = useState<StorageLocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingInventoryByProductId, setExistingInventoryByProductId] = useState<Record<number, string>>({});

  const fetchData = useCallback(async () => {
    if (!property) return;
    setLoading(true);
    try {
      const [productsRes, locationsRes, itemsRes] = await Promise.all([
        api.getProducts(),
        api.getStorageLocations({ propertyId: Number(property.id) }).catch(() => ({ success: true, data: [] })),
        api.getInventoryItems({ propertyId: Number(property.id) }).catch(() => ({ success: true, data: { items: [] } })),
      ]);
      const productsList = (productsRes?.data as { products?: unknown[] })?.products ?? productsRes?.data ?? [];
      const rawProducts = Array.isArray(productsList) ? productsList : [];
      setProducts(
        rawProducts.map((p: { id: number; name?: string; code?: string; category?: string | null; unit?: { abbreviation?: string }; costPrice?: number | null; salePrice?: number | null; minStock?: number }) => ({
          id: String(p.id),
          name: p.name ?? "",
          sku: p.code ?? "",
          category: p.category ?? "",
          unit: p.unit?.abbreviation ?? "un",
          unitCost: Number(p.costPrice ?? p.salePrice ?? 0),
          defaultMin: Number(p.minStock ?? 0),
          defaultMax: 200,
        }))
      );
      const locData = locationsRes?.data;
      const locList = Array.isArray(locData) ? locData : (locData as { locations?: unknown[] })?.locations ?? [];
      const apiLocations = (locList as { id: number; name?: string; code?: string }[]).map((l) => ({
          id: String(l.id),
          name: l.name ?? "",
          code: l.code,
        }));

      const itemsList = ((itemsRes?.data as { items?: unknown[] })?.items ?? []) as ExistingInventoryItemRef[];
      const inferredLocationNames = Array.from(
        new Set(
          itemsList
            .map((it) => (it.location ? String(it.location).trim() : ""))
            .filter(Boolean)
        )
      );
      const inferredLocations: StorageLocationOption[] = inferredLocationNames.map((name) => ({
        id: `legacy:${name.toLowerCase()}`,
        name,
        code: "LEGADO",
      }));

      const mergedLocations = [...apiLocations];
      for (const loc of inferredLocations) {
        const exists = mergedLocations.some((x) => x.name.trim().toLowerCase() === loc.name.trim().toLowerCase());
        if (!exists) mergedLocations.push(loc);
      }
      setStorageLocations(mergedLocations);

      const existingMap: Record<number, string> = {};
      for (const item of itemsList) {
        const productId = Number(item.productId);
        const locName = item.location ? String(item.location).trim() : "";
        if (productId && locName) {
          const matched = mergedLocations.find((l) => l.name.trim().toLowerCase() === locName.toLowerCase());
          if (matched) existingMap[productId] = matched.id;
        }
      }
      setExistingInventoryByProductId(existingMap);
    } catch {
      toast.error("Erro ao carregar produtos ou locais.");
      setProducts([]);
      setStorageLocations([]);
      setExistingInventoryByProductId({});
    } finally {
      setLoading(false);
    }
  }, [property]);

  useEffect(() => {
    if (open && property) fetchData();
  }, [open, property, fetchData]);

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleProduct = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const initializeProducts = () => {
    const newSelectedProducts = selectedProductIds.map(id => {
      const product = products.find(p => p.id === id)!;
      const existing = selectedProducts.find(sp => sp.productId === id);
      return existing || {
        productId: id,
        quantity: 0,
        minStock: product.defaultMin,
        maxStock: product.defaultMax,
        locationId: existingInventoryByProductId[Number(id)] ?? globalLocation,
        autoReorder: globalAutoReorder,
        alertEnabled: globalAlerts
      };
    });
    setSelectedProducts(newSelectedProducts);
  };

  const updateProductConfig = (productId: string, field: keyof SelectedProduct, value: number | string | boolean) => {
    setSelectedProducts(prev => 
      prev.map(sp => 
        sp.productId === productId 
          ? { ...sp, [field]: value }
          : sp
      )
    );
  };

  const applyGlobalLocation = () => {
    setSelectedProducts(prev => prev.map(sp => ({ ...sp, locationId: globalLocation })));
  };

  const applyGlobalSettings = () => {
    setSelectedProducts(prev => prev.map(sp => ({ 
      ...sp, 
      autoReorder: globalAutoReorder,
      alertEnabled: globalAlerts
    })));
  };

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedProductIds.length > 0;
      case 2: return selectedProducts.every(sp => sp.quantity >= 0);
      case 3: return selectedProducts.every(sp => sp.locationId !== "");
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      initializeProducts();
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!property) return;
    const propertyId = Number(property.id);
    setSubmitting(true);
    try {
      const itemsRes = await api.getInventoryItems({ propertyId });
      const existingItems = (itemsRes?.data as { items?: { id: string; productId?: number }[] })?.items ?? [];
      let created = 0;
      let movements = 0;
      for (const sp of selectedProducts) {
        const productIdNum = Number(sp.productId);
        const existing = existingItems.find((i: { productId?: number }) => i.productId === productIdNum);
        if (existing) {
          if (sp.quantity > 0) {
            const res = await api.createInventoryMovement({
              itemId: Number(existing.id),
              type: "in",
              quantity: sp.quantity,
              reason: "Adicionar estoque",
            });
            if (res.success) movements++;
          }
        } else {
          const locName = storageLocations.find(l => l.id === sp.locationId)?.name ?? (sp.locationId || null);
          const res = await api.createInventoryItem({
            productId: productIdNum,
            propertyId,
            currentStock: sp.quantity,
            minStock: sp.minStock,
            maxStock: sp.maxStock || null,
            location: locName ?? undefined,
          });
          if (res.success) created++;
        }
      }
      onSuccess?.();
      setShowSuccess(true);
      toast.success(`${created} item(ns) criado(s), ${movements} movimentação(ões) registrada(s).`);
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setCurrentStep(1);
      setShowSuccess(false);
      setSearchQuery("");
      setSelectedProductIds([]);
      setSelectedProducts([]);
      setCategoryFilter("all");
      setGlobalLocation("");
      setGlobalAutoReorder(true);
      setGlobalAlerts(true);
    }, 300);
  };

  const getProductById = (id: string) => products.find(p => p.id === id);
  const getLocationById = (id: string) => storageLocations.find(l => l.id === id);

  const totalValue = selectedProducts.reduce((acc, sp) => {
    const product = getProductById(sp.productId);
    return acc + (product?.unitCost || 0) * sp.quantity;
  }, 0);

  const totalItems = selectedProducts.reduce((acc, sp) => acc + sp.quantity, 0);

  const generatedProtocol = `STK-${new Date().toISOString().slice(0,10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  if (!property) return null;

  const config = propertyTypeConfig[property.type];
  const PropertyIcon = config.icon;

  // Success Screen
  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
          <div className="p-8 text-center space-y-6">
            <div className={cn(
              "mx-auto w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg",
              config.gradient
            )}>
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-foreground">Estoque Adicionado!</h2>
              <p className="text-muted-foreground mt-2">
                {selectedProducts.length} produto(s) adicionados ao estoque de {property.name}
              </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 inline-flex items-center gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Protocolo</p>
                <p className="text-xl font-mono font-bold text-primary">{generatedProtocol}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                navigator.clipboard.writeText(generatedProtocol);
                toast.success("Protocolo copiado!");
              }}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border bg-card text-center">
                <Boxes className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{selectedProducts.length}</p>
                <p className="text-xs text-muted-foreground">Produtos</p>
              </div>
              <div className="p-4 rounded-xl border bg-card text-center">
                <Package className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                <p className="text-2xl font-bold">{totalItems}</p>
                <p className="text-xs text-muted-foreground">Unidades</p>
              </div>
              <div className="p-4 rounded-xl border bg-card text-center">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                <p className="text-2xl font-bold">R$ {totalValue.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Valor Total</p>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <Button variant="outline" size="lg" className="gap-2">
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <QrCode className="h-4 w-4" />
                Etiquetas
              </Button>
              <Button 
                size="lg" 
                onClick={handleClose}
                className={cn("gap-2 bg-gradient-to-r", config.gradient)}
              >
                <CheckCircle className="h-4 w-4" />
                Concluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <div className="flex h-[85vh]">
          {/* Sidebar */}
          <div className={cn(
            "w-72 bg-gradient-to-b p-6 flex flex-col text-white shrink-0",
            config.gradient.replace("from-", "from-").replace("to-", "via-") + " to-slate-800"
          )}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Plus className="h-7 w-7" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Adicionar Estoque</h2>
                <p className="text-white/70 text-sm">{property.name}</p>
              </div>
            </div>

            {/* Property Badge */}
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm mb-6">
              <div className="flex items-center gap-3">
                <PropertyIcon className="h-5 w-5" />
                <div>
                  <p className="text-xs text-white/70">Propriedade</p>
                  <p className="font-semibold text-sm">{property.name}</p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-white/70 mb-2">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Steps */}
            <nav className="flex-1 space-y-2">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => step.id <= currentStep && setCurrentStep(step.id)}
                    disabled={step.id > currentStep}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                      isActive && "bg-white/20 backdrop-blur-sm",
                      isCompleted && "opacity-90",
                      !isActive && !isCompleted && "opacity-50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      isActive && "bg-white text-slate-700",
                      isCompleted && "bg-emerald-400 text-white",
                      !isActive && !isCompleted && "bg-white/20"
                    )}>
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-xs text-white/70">{step.description}</p>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Selection Summary */}
            {selectedProductIds.length > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <p className="text-xs text-white/70 mb-1">Selecionados</p>
                <p className="font-bold text-2xl">{selectedProductIds.length}</p>
                <p className="text-sm text-white/70">produtos</p>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="px-6 py-4 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{steps[currentStep - 1].title}</h3>
                  <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
                </div>
                <Badge variant="outline" className="text-sm">
                  Etapa {currentStep} de {steps.length}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 p-6">
              {/* Step 1: Select Products */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar produto por nome ou SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11"
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[180px] h-11">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas Categorias</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedProductIds.length > 0 && (
                    <div className={cn(
                      "p-4 rounded-xl border-2 bg-gradient-to-r",
                      `${config.gradient}/10 border-primary/30`
                    )}>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <p className="font-medium">
                          {selectedProductIds.length} produto(s) selecionado(s)
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedProductIds([])}
                          className="ml-auto text-muted-foreground"
                        >
                          Limpar
                        </Button>
                      </div>
                    </div>
                  )}

                  {loading ? (
                    <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Carregando produtos...
                    </div>
                  ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredProducts.map((product) => {
                      const isSelected = selectedProductIds.includes(product.id);
                      
                      return (
                        <button
                          key={product.id}
                          onClick={() => toggleProduct(product.id)}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all text-left",
                            isSelected 
                              ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20" 
                              : "border-border hover:border-primary/50 hover:bg-accent/30"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-0.5 transition-colors shrink-0",
                              isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                            )}>
                              {isSelected && <Check className="h-4 w-4 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{product.name}</h4>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <Badge variant="outline" className="text-xs font-mono">
                                  {product.sku}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {product.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">
                                R$ {product.unitCost.toFixed(2)} / {product.unit}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  )}
                  {!loading && filteredProducts.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">Nenhum produto encontrado</p>
                      <p className="text-sm">Cadastre produtos em Cadastros → Produtos</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Configure Quantities */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50 border">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Defina a quantidade inicial e os níveis de estoque para cada produto.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedProducts.map((sp) => {
                      const product = getProductById(sp.productId);
                      if (!product) return null;

                      const hasWarning = sp.quantity > 0 && sp.quantity < sp.minStock;
                      const itemTotal = product.unitCost * sp.quantity;
                      
                      return (
                        <div 
                          key={sp.productId}
                          className={cn(
                            "p-5 rounded-xl border-2 transition-colors",
                            hasWarning && "border-amber-500/50 bg-amber-500/5"
                          )}
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className={cn(
                              "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                              config.gradient
                            )}>
                              <Package className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{product.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {product.sku} • R$ {product.unitCost.toFixed(2)}/{product.unit}
                              </p>
                            </div>
                            {hasWarning && (
                              <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Abaixo do mínimo
                              </Badge>
                            )}
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Subtotal</p>
                              <p className="font-bold text-primary">R$ {itemTotal.toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Quantidade Inicial *</Label>
                              <Input
                                type="number"
                                min={0}
                                value={sp.quantity}
                                onChange={(e) => updateProductConfig(sp.productId, "quantity", parseInt(e.target.value) || 0)}
                                className="text-center font-semibold h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Estoque Mínimo</Label>
                              <Input
                                type="number"
                                min={0}
                                value={sp.minStock}
                                onChange={(e) => updateProductConfig(sp.productId, "minStock", parseInt(e.target.value) || 0)}
                                className="text-center h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Estoque Máximo</Label>
                              <Input
                                type="number"
                                min={0}
                                value={sp.maxStock}
                                onChange={(e) => updateProductConfig(sp.productId, "maxStock", parseInt(e.target.value) || 0)}
                                className="text-center h-11"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Storage Location */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Global Location */}
                  <div className="p-5 rounded-xl border-2 border-dashed bg-muted/30">
                    <div className="flex items-center gap-3 mb-4">
                      <Warehouse className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base font-semibold">Aplicar Local para Todos</Label>
                      <p className="text-sm text-muted-foreground">Define o mesmo local para todos os produtos (inclui locais legados já usados no estoque)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select value={globalLocation} onValueChange={setGlobalLocation}>
                        <SelectTrigger className="flex-1 h-11">
                          <SelectValue placeholder="Selecione um local..." />
                        </SelectTrigger>
                        <SelectContent>
                          {storageLocations.map(loc => (
                            <SelectItem key={loc.id} value={loc.id}>
                              <div className="flex items-center gap-2">
                                <span>{loc.name}</span>
                                {loc.code ? <Badge variant="outline" className="text-xs">{loc.code}</Badge> : null}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={applyGlobalLocation} disabled={!globalLocation} className="shrink-0">
                        Aplicar a Todos
                      </Button>
                    </div>
                  </div>

                  {/* Individual Locations */}
                  <div className="space-y-3">
                    {storageLocations.length === 0 && (
                      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-sm text-amber-700 dark:text-amber-300">
                        Nenhum local encontrado. Cadastre locais em Cadastros &gt; Locais de Estoque.
                      </div>
                    )}
                    {selectedProducts.map((sp) => {
                      const product = getProductById(sp.productId);
                      const location = getLocationById(sp.locationId);
                      if (!product) return null;
                      
                      return (
                        <div 
                          key={sp.productId}
                          className={cn(
                            "p-4 rounded-xl border transition-colors",
                            sp.locationId ? "border-emerald-500/30 bg-emerald-500/5" : "border-border"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
                              config.gradient
                            )}>
                              <Package className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{product.name}</h4>
                              <p className="text-sm text-muted-foreground">{sp.quantity} {product.unit}</p>
                            </div>
                            <Select 
                              value={sp.locationId} 
                              onValueChange={(v) => updateProductConfig(sp.productId, "locationId", v)}
                            >
                              <SelectTrigger className="w-[220px]">
                                <SelectValue placeholder="Selecione o local" />
                              </SelectTrigger>
                              <SelectContent>
                                {storageLocations.map(loc => (
                                  <SelectItem key={loc.id} value={loc.id}>
                                    {loc.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {sp.locationId && <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Settings */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Global Settings */}
                  <div className="p-5 rounded-xl border bg-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Settings2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <Label className="text-base font-semibold">Configurações Globais</Label>
                        <p className="text-sm text-muted-foreground">Aplicar a todos os produtos</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Bell className="h-5 w-5 text-amber-500" />
                          <div>
                            <p className="font-medium">Alertas de Estoque Baixo</p>
                            <p className="text-sm text-muted-foreground">Notificar ao atingir estoque mínimo</p>
                          </div>
                        </div>
                        <Switch
                          checked={globalAlerts}
                          onCheckedChange={setGlobalAlerts}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <RotateCcw className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">Reposição Automática</p>
                            <p className="text-sm text-muted-foreground">Gerar pedido ao atingir ponto de reposição</p>
                          </div>
                        </div>
                        <Switch
                          checked={globalAutoReorder}
                          onCheckedChange={setGlobalAutoReorder}
                        />
                      </div>

                      <Button onClick={applyGlobalSettings} variant="outline" className="w-full">
                        Aplicar Configurações a Todos
                      </Button>
                    </div>
                  </div>

                  {/* Per-product Settings */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Configurações por Produto</Label>
                    {selectedProducts.map((sp) => {
                      const product = getProductById(sp.productId);
                      if (!product) return null;
                      
                      return (
                        <div key={sp.productId} className="p-4 rounded-xl border bg-card">
                          <div className="flex items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{product.name}</h4>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2">
                                <Bell className="h-4 w-4 text-muted-foreground" />
                                <Switch
                                  checked={sp.alertEnabled}
                                  onCheckedChange={(v) => updateProductConfig(sp.productId, "alertEnabled", v)}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                                <Switch
                                  checked={sp.autoReorder}
                                  onCheckedChange={(v) => updateProductConfig(sp.productId, "autoReorder", v)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 5: Confirmation */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  {/* Property Summary */}
                  <div className={cn(
                    "p-5 rounded-2xl border-2 bg-gradient-to-r",
                    `${config.gradient}/10`
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                        config.gradient
                      )}>
                        <PropertyIcon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Propriedade</p>
                        <h3 className="text-xl font-bold">{property.name}</h3>
                        <Badge variant="outline" className={cn("mt-1", config.color)}>
                          {config.label}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Valor Total</p>
                        <p className="text-2xl font-bold text-primary">
                          R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Products Summary */}
                  <div className="p-5 rounded-xl border bg-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Boxes className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">Resumo dos Produtos</h3>
                      <Badge variant="outline" className="ml-auto">
                        {selectedProducts.length} itens
                      </Badge>
                    </div>

                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                      {selectedProducts.map((sp) => {
                        const product = getProductById(sp.productId);
                        const location = getLocationById(sp.locationId);
                        if (!product) return null;
                        const itemTotal = product.unitCost * sp.quantity;
                        
                        return (
                          <div 
                            key={sp.productId}
                            className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
                              config.gradient
                            )}>
                              <Package className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{product.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {product.sku} • {location?.name || "Sem local"}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                {sp.alertEnabled && <Bell className="h-4 w-4 text-amber-500" />}
                                {sp.autoReorder && <RotateCcw className="h-4 w-4 text-blue-500" />}
                              </div>
                              <div className="text-right">
                                <p className="font-bold">{sp.quantity} {product.unit}</p>
                                <p className="text-xs text-muted-foreground">
                                  R$ {itemTotal.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border bg-blue-500/5 border-blue-500/20 text-center">
                      <Boxes className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{selectedProducts.length}</p>
                      <p className="text-xs text-muted-foreground">Produtos</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-emerald-500/5 border-emerald-500/20 text-center">
                      <Package className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                      <p className="text-2xl font-bold">{totalItems}</p>
                      <p className="text-xs text-muted-foreground">Unidades Totais</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-amber-500/5 border-amber-500/20 text-center">
                      <Warehouse className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                      <p className="text-2xl font-bold">
                        {new Set(selectedProducts.map(sp => sp.locationId)).size}
                      </p>
                      <p className="text-xs text-muted-foreground">Locais</p>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="flex items-center justify-between gap-4 p-6 border-t bg-muted/30">
              <Button 
                variant="outline" 
                onClick={currentStep === 1 ? handleClose : () => setCurrentStep(prev => prev - 1)} 
                size="lg"
              >
                {currentStep === 1 ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </>
                ) : (
                  "Voltar"
                )}
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={!canProceed() || submitting}
                size="lg"
                className={cn("min-w-[160px] bg-gradient-to-r", config.gradient)}
              >
                {currentStep === steps.length ? (
                  submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar
                  </>
                  )
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
