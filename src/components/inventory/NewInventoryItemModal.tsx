import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { 
  Package,
  CheckCircle,
  ChevronRight,
  X,
  Hotel,
  Building,
  TreePine,
  Home,
  MapPin,
  Layers,
  Settings2,
  Bell,
  FileText,
  Search,
  Warehouse,
  AlertTriangle,
  Thermometer,
  Droplets,
  RotateCcw,
  QrCode,
  Printer,
  ShoppingCart,
  Coffee,
  Bath,
  Shirt,
  Sparkles,
  Box,
  Copy,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface NewInventoryItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type PropertyType = "hotel" | "apart-hotel" | "loft" | "temporada";

const propertyTypeConfig: Record<PropertyType, { label: string; icon: typeof Hotel; color: string }> = {
  hotel: { label: "Hotel", icon: Hotel, color: "text-blue-500" },
  "apart-hotel": { label: "Apart-Hotel", icon: Building, color: "text-purple-500" },
  loft: { label: "Loft", icon: Home, color: "text-amber-500" },
  temporada: { label: "Temporada", icon: TreePine, color: "text-emerald-500" }
};

type ApiProduct = { id: number; name: string; code: string; sku?: string; category?: string | null; categoryId?: number | null; salePrice?: number | null; costPrice?: number | null; unit?: { abbreviation?: string } | null };
type ApiProperty = { id: number; name: string; type?: string };

const steps = [
  { id: 1, title: "Produto", description: "Selecione o produto", icon: Package },
  { id: 2, title: "Propriedade", description: "Local de estoque", icon: MapPin },
  { id: 3, title: "Estoque", description: "Quantidades e níveis", icon: Layers },
  { id: 4, title: "Configurações", description: "Alertas e automação", icon: Settings2 },
];

export function NewInventoryItemModal({ open, onOpenChange, onSuccess }: NewInventoryItemModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    productId: "",
    propertyId: "",
    storageLocationId: "",
    currentStock: "",
    minStock: "",
    maxStock: "",
    reorderPoint: "",
    alertLowStock: true,
    alertExpiry: false,
    autoReorder: false,
    temperatureControl: false,
    humidityControl: false,
  });

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await api.getProducts();
      const list = (res?.data as { products?: unknown[] })?.products ?? res?.data ?? [];
      setProducts(Array.isArray(list) ? (list as ApiProduct[]) : []);
    } catch {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchProperties = useCallback(async () => {
    setLoadingProperties(true);
    try {
      const res = await api.getProperties();
      const list = (res?.data as { properties?: unknown[] })?.properties ?? res?.data ?? [];
      setProperties(Array.isArray(list) ? (list as ApiProperty[]) : []);
    } catch {
      setProperties([]);
    } finally {
      setLoadingProperties(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchProducts();
      fetchProperties();
    }
  }, [open, fetchProducts, fetchProperties]);

  const selectedProduct = products.find(p => String(p.id) === formData.productId);
  const selectedProperty = properties.find(p => String(p.id) === formData.propertyId);

  const filteredProducts = products.filter(p => {
    const name = (p.name ?? "").toLowerCase();
    const code = (p.code ?? "").toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = !search || name.includes(search) || code.includes(search);
    const cat = (p.category ?? "").toLowerCase();
    const matchesCategory = !selectedCategory || cat === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!formData.productId;
      case 2: return !!formData.propertyId;
      case 3: return formData.currentStock !== "" && Number(formData.currentStock) >= 0;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!formData.productId || !formData.propertyId) {
      toast.error("Selecione o produto e a propriedade.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.createInventoryItem({
        productId: Number(formData.productId),
        propertyId: Number(formData.propertyId),
        currentStock: Number(formData.currentStock) || 0,
        minStock: Number(formData.minStock) || 0,
        maxStock: formData.maxStock ? Number(formData.maxStock) : null,
        reorderPoint: formData.reorderPoint ? Number(formData.reorderPoint) : null,
        location: formData.storageLocationId || undefined,
      });
      if (!res.success) {
        toast.error(res.error?.message ?? "Erro ao adicionar item ao estoque.");
        return;
      }
      toast.success("Item adicionado ao estoque.");
      onSuccess?.();
      setShowSuccess(true);
    } catch {
      toast.error("Erro ao adicionar item ao estoque.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setCurrentStep(1);
      setShowSuccess(false);
      setSearchTerm("");
      setSelectedCategory(null);
      setFormData({
        productId: "",
        propertyId: "",
        storageLocationId: "",
        currentStock: "",
        minStock: "",
        maxStock: "",
        reorderPoint: "",
        alertLowStock: true,
        alertExpiry: false,
        autoReorder: false,
        temperatureControl: false,
        humidityControl: false,
      });
    }, 300);
  };

  const generatedProtocol = `STK-${new Date().toISOString().slice(0,10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
          <div className="p-8 text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-foreground">Item Adicionado ao Estoque!</h2>
              <p className="text-muted-foreground mt-2">O produto foi vinculado com sucesso</p>
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

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <Package className="h-5 w-5 text-cyan-500" />
                  </div>
                  <span className="font-semibold">Produto</span>
                </div>
                <p className="text-sm font-medium">{selectedProduct?.name}</p>
                <p className="text-xs text-muted-foreground">SKU: {selectedProduct?.code ?? selectedProduct?.sku}</p>
              </div>
              
              <div className="p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <MapPin className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="font-semibold">Local</span>
                </div>
                <p className="text-sm font-medium">{selectedProperty?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formData.storageLocationId || "—"}
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <Button variant="outline" size="lg" className="gap-2">
                <Printer className="h-4 w-4" />
                Imprimir Etiqueta
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <QrCode className="h-4 w-4" />
                Gerar QR Code
              </Button>
              <Button 
                size="lg" 
                onClick={handleClose}
                className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
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
          <div className="w-72 bg-gradient-to-b from-cyan-600 via-cyan-700 to-blue-800 p-6 flex flex-col text-white shrink-0">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Package className="h-7 w-7" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Novo Item de Estoque</h2>
                <p className="text-cyan-200 text-sm">Vincular produto</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-xs text-cyan-200 mb-2">
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
                      isActive && "bg-white text-cyan-600",
                      isCompleted && "bg-emerald-400 text-white",
                      !isActive && !isCompleted && "bg-white/20"
                    )}>
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-xs text-cyan-200">{step.description}</p>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Selected Product Preview */}
            {selectedProduct && (
              <div className="mt-6 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <p className="text-xs text-cyan-200 mb-2">Produto Selecionado</p>
                <p className="font-semibold text-sm">{selectedProduct.name}</p>
                <p className="text-xs text-cyan-200">SKU: {selectedProduct.code ?? selectedProduct.sku}</p>
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
              {/* Step 1: Select Product */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome ou SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                  </div>

                  {/* Categories Filter (from products) */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={!selectedCategory ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                      className={cn(!selectedCategory && "bg-gradient-to-r from-cyan-500 to-blue-600")}
                    >
                      Todos
                    </Button>
                    {[...new Set(products.map(p => p.category).filter(Boolean))].map(cat => (
                      <Button
                        key={String(cat)}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(cat as string)}
                        className={cn(
                          selectedCategory === cat && "bg-gradient-to-r from-cyan-500 to-blue-600"
                        )}
                      >
                        {String(cat)}
                      </Button>
                    ))}
                  </div>

                  {/* Products List (from catalog products) */}
                  {loadingProducts ? (
                    <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Carregando produtos...
                    </div>
                  ) : (
                  <div className="grid gap-3">
                    {filteredProducts.map(product => {
                      const isSelected = formData.productId === String(product.id);
                      const unitLabel = product.unit?.abbreviation ?? "un";
                      const price = product.salePrice ?? product.costPrice ?? 0;
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, productId: String(product.id) }))}
                          className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                            isSelected 
                              ? "border-cyan-500 bg-cyan-500/5 ring-2 ring-cyan-500/20" 
                              : "hover:border-muted-foreground/30 hover:bg-muted/30"
                          )}
                        >
                          <div className="p-3 rounded-xl bg-muted">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{product.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-muted-foreground">SKU: {product.code}</span>
                              <Badge variant="outline" className="text-xs">{unitLabel}</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-cyan-600">
                              R$ {Number(price).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">venda</p>
                          </div>
                          {isSelected && (
                            <CheckCircle className="h-6 w-6 text-cyan-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  )}

                  {!loadingProducts && filteredProducts.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum produto encontrado</p>
                      <p className="text-sm">Cadastre produtos em Cadastros → Produtos</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Property */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-4 block">Selecione a Propriedade</Label>
                    {loadingProperties ? (
                      <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Carregando propriedades...
                      </div>
                    ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {properties.map(prop => {
                        const propType = (prop.type === "apart-hotel" || prop.type === "loft" || prop.type === "temporada") ? prop.type : "hotel";
                        const config = propertyTypeConfig[propType];
                        const Icon = config.icon;
                        const isSelected = formData.propertyId === String(prop.id);
                        
                        return (
                          <button
                            key={prop.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, propertyId: String(prop.id), storageLocationId: "" }))}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                              isSelected 
                                ? "border-cyan-500 bg-cyan-500/5 ring-2 ring-cyan-500/20" 
                                : "hover:border-muted-foreground/30 hover:bg-muted/30"
                            )}
                          >
                            <div className={cn("p-3 rounded-xl bg-muted", config.color)}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{prop.name}</p>
                              <p className="text-sm text-muted-foreground">{config.label}</p>
                            </div>
                            {isSelected && <CheckCircle className="h-5 w-5 text-cyan-500" />}
                          </button>
                        );
                      })}
                    </div>
                    )}
                  </div>

                  {formData.propertyId && (
                    <div>
                      <Label className="text-base font-semibold mb-4 block">Local de Armazenamento (opcional)</Label>
                      <Input
                        placeholder="Ex: Almoxarifado Central"
                        value={formData.storageLocationId}
                        onChange={(e) => setFormData(prev => ({ ...prev, storageLocationId: e.target.value }))}
                        className="max-w-md"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Stock Levels */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl border bg-cyan-500/5 border-cyan-500/20">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-cyan-600" />
                      <div>
                        <p className="font-semibold">{selectedProduct?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedProperty?.name}{formData.storageLocationId ? ` → ${formData.storageLocationId}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-medium">Quantidade Atual *</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.currentStock}
                        onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                        className="h-12 text-lg font-semibold"
                      />
                      <p className="text-xs text-muted-foreground">Estoque físico disponível</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-medium">Ponto de Reposição</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.reorderPoint}
                        onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
                        className="h-12"
                      />
                      <p className="text-xs text-muted-foreground">Aciona alerta de compra</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-medium">Estoque Mínimo</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.minStock}
                        onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                        className="h-12"
                      />
                      <p className="text-xs text-muted-foreground">Alerta crítico</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-medium">Estoque Máximo</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.maxStock}
                        onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                        className="h-12"
                      />
                      <p className="text-xs text-muted-foreground">Limite de armazenamento</p>
                    </div>
                  </div>

                  {/* Visual indicator */}
                  {formData.currentStock && (
                    <div className="p-4 rounded-xl border bg-muted/30">
                      <Label className="font-medium mb-3 block">Visualização dos Níveis</Label>
                      <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                          style={{ 
                            width: `${Math.min(100, (Number(formData.currentStock) / (Number(formData.maxStock) || 100)) * 100)}%` 
                          }}
                        />
                        {formData.minStock && (
                          <div 
                            className="absolute top-0 h-full w-0.5 bg-red-500"
                            style={{ left: `${(Number(formData.minStock) / (Number(formData.maxStock) || 100)) * 100}%` }}
                          />
                        )}
                        {formData.reorderPoint && (
                          <div 
                            className="absolute top-0 h-full w-0.5 bg-amber-500"
                            style={{ left: `${(Number(formData.reorderPoint) / (Number(formData.maxStock) || 100)) * 100}%` }}
                          />
                        )}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>0</span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-500" /> Mínimo
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500" /> Reposição
                        </span>
                        <span>{formData.maxStock || "Max"}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Settings */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border bg-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <Bell className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <Label className="text-base font-semibold">Alertas</Label>
                        <p className="text-sm text-muted-foreground">Notificações automáticas</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="font-medium">Alerta de Estoque Baixo</p>
                            <p className="text-sm text-muted-foreground">Notificar ao atingir mínimo</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.alertLowStock}
                          onCheckedChange={(v) => setFormData({ ...formData, alertLowStock: v })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <RotateCcw className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">Pedido Automático</p>
                            <p className="text-sm text-muted-foreground">Criar pedido ao atingir reposição</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.autoReorder}
                          onCheckedChange={(v) => setFormData({ ...formData, autoReorder: v })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl border bg-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-teal-500/10">
                        <Thermometer className="h-5 w-5 text-teal-500" />
                      </div>
                      <div>
                        <Label className="text-base font-semibold">Controle Ambiental</Label>
                        <p className="text-sm text-muted-foreground">Monitoramento de condições</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Thermometer className="h-5 w-5 text-red-400" />
                          <span className="font-medium">Temperatura</span>
                        </div>
                        <Switch
                          checked={formData.temperatureControl}
                          onCheckedChange={(v) => setFormData({ ...formData, temperatureControl: v })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Droplets className="h-5 w-5 text-blue-400" />
                          <span className="font-medium">Umidade</span>
                        </div>
                        <Switch
                          checked={formData.humidityControl}
                          onCheckedChange={(v) => setFormData({ ...formData, humidityControl: v })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-5 rounded-xl border-2 border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="h-5 w-5 text-cyan-600" />
                      <Label className="text-base font-semibold">Resumo do Cadastro</Label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Produto</p>
                        <p className="font-medium">{selectedProduct?.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">SKU</p>
                        <p className="font-medium">{selectedProduct?.code ?? selectedProduct?.sku ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Propriedade</p>
                        <p className="font-medium">{selectedProperty?.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Local</p>
                        <p className="font-medium">{formData.storageLocationId || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Estoque Inicial</p>
                        <p className="font-medium">{formData.currentStock} {selectedProduct?.unit?.abbreviation ?? "un"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Níveis</p>
                        <p className="font-medium">
                          Min: {formData.minStock || "-"} | Max: {formData.maxStock || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="flex items-center justify-between gap-4 p-6 border-t bg-muted/30">
              <Button variant="outline" onClick={handleClose} size="lg">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              
              <div className="flex items-center gap-3">
                {currentStep > 1 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(currentStep - 1)}
                    size="lg"
                  >
                    Voltar
                  </Button>
                )}
                <Button 
                  onClick={handleNext}
                  disabled={!canProceed() || submitting}
                  size="lg"
                  className="min-w-[140px] bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
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
                        Finalizar
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
