import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ClipboardCheck,
  Package,
  Search,
  CheckCircle,
  X,
  AlertTriangle,
  Minus,
  Plus,
  Save,
  FileText,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Filter,
  Calculator,
  TrendingUp,
  TrendingDown,
  Equal,
  Printer,
  Download,
  Clock,
  User,
  Building,
  Sparkles,
  Hotel,
  Home,
  TreePine,
  MapPin,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

type PropertyType = "hotel" | "apart-hotel" | "loft" | "temporada";

interface Property {
  id: string;
  name: string;
  type: PropertyType;
}

const propertyTypeConfig: Record<PropertyType, { label: string; icon: typeof Hotel; color: string; gradient: string }> = {
  hotel: { label: "Hotel", icon: Hotel, color: "text-blue-500", gradient: "from-blue-500 to-cyan-500" },
  "apart-hotel": { label: "Apart-Hotel", icon: Building, color: "text-purple-500", gradient: "from-purple-500 to-pink-500" },
  loft: { label: "Loft", icon: Home, color: "text-amber-500", gradient: "from-amber-500 to-orange-500" },
  temporada: { label: "Temporada", icon: TreePine, color: "text-emerald-500", gradient: "from-emerald-500 to-green-500" }
};

function toPropertyType(t?: string): PropertyType {
  if (t === "apart-hotel" || t === "loft" || t === "temporada") return t;
  return "hotel";
}

interface InventoryCountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  systemStock: number;
  countedStock: number | null;
  unit: string;
  location: string;
  status: "pending" | "counted" | "divergent" | "adjusted";
}

const countCategoryOptions = ["Enxoval", "Amenities", "Frigobar", "Limpeza"];
const countLocationOptions = ["Almoxarifado Central", "Depósito A", "Depósito B", "Frigobar"];

const steps = [
  { id: 1, title: "Configuração", icon: ClipboardCheck },
  { id: 2, title: "Contagem", icon: Calculator },
  { id: 3, title: "Divergências", icon: AlertTriangle },
  { id: 4, title: "Finalização", icon: CheckCircle },
];

export function InventoryCountModal({ open, onOpenChange, onSuccess }: InventoryCountModalProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    if (open && user?.name) {
      setCountConfig((prev) => ({ ...prev, responsible: user.name }));
    }
  }, [open, user?.name]);

  const fetchProperties = useCallback(async () => {
    const res = await api.getProperties();
    if (res.success && res.data && Array.isArray((res.data as { properties?: unknown[] }).properties)) {
      const list = (res.data as { properties: { id: number; name: string; type?: string }[] }).properties;
      setProperties(list.map(p => ({ id: String(p.id), name: p.name, type: toPropertyType(p.type) })));
    } else {
      setProperties([]);
    }
  }, []);

  useEffect(() => {
    if (open) fetchProperties();
  }, [open, fetchProperties]);
  
  // Step 1 - Configuration
  const [countConfig, setCountConfig] = useState({
    name: "",
    propertyId: "",
    selectedCategories: [] as string[],
    selectedLocations: [] as string[],
    responsible: "",
    notes: "",
    blindCount: false,
  });
  
  const selectedProperty = properties.find(p => p.id === countConfig.propertyId);
  
  // Step 2 - Counting (items loaded from API when property is selected)
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");

  const fetchInventoryItems = useCallback(async (propertyId: number) => {
    setLoadingItems(true);
    try {
      const res = await api.getInventoryItems({ propertyId });
      const list = (res?.data as { items?: unknown[] })?.items ?? [];
      const raw = Array.isArray(list) ? list : [];
      setItems(
        raw.map((i: { id: string | number; name?: string; sku?: string | null; category?: string | null; currentStock?: number; unit?: string; location?: string | null }) => ({
          id: String(i.id),
          name: i.name ?? "",
          sku: i.sku ?? String(i.id),
          category: i.category ?? "",
          systemStock: Number(i.currentStock ?? 0),
          countedStock: null as number | null,
          unit: i.unit ?? "un",
          location: i.location ?? "",
          status: "pending" as const,
        }))
      );
    } catch {
      setItems([]);
      toast.error("Erro ao carregar itens de estoque.");
    } finally {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    if (open && countConfig.propertyId) {
      fetchInventoryItems(Number(countConfig.propertyId));
    } else if (!countConfig.propertyId) {
      setItems([]);
    }
  }, [open, countConfig.propertyId, fetchInventoryItems]);
  
  // Step 3 - Adjustments
  const [adjustmentNotes, setAdjustmentNotes] = useState<Record<string, string>>({});
  const [selectedForAdjustment, setSelectedForAdjustment] = useState<string[]>([]);

  const updateItemCount = (itemId: string, value: number | null) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newStatus = value === null 
          ? "pending" 
          : value === item.systemStock 
            ? "counted" 
            : "divergent";
        return { ...item, countedStock: value, status: newStatus };
      }
      return item;
    }));
  };

  const incrementCount = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      const currentCount = item.countedStock ?? item.systemStock;
      updateItemCount(itemId, currentCount + 1);
    }
  };

  const decrementCount = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      const currentCount = item.countedStock ?? item.systemStock;
      updateItemCount(itemId, Math.max(0, currentCount - 1));
    }
  };

  const getDivergence = (item: InventoryItem) => {
    if (item.countedStock === null) return 0;
    return item.countedStock - item.systemStock;
  };

  const categoriesForFilter = ["Todos", ...new Set(items.map(i => i.category).filter(Boolean))];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "Todos" || item.category === filterCategory;
    const matchesStatus = filterStatus === "Todos" || 
                         (filterStatus === "Pendentes" && item.status === "pending") ||
                         (filterStatus === "Contados" && (item.status === "counted" || item.status === "divergent")) ||
                         (filterStatus === "Divergentes" && item.status === "divergent");
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const divergentItems = items.filter(item => item.status === "divergent");
  const countedItems = items.filter(item => item.countedStock !== null);
  const progress = (countedItems.length / items.length) * 100;

  const totalDivergencePositive = divergentItems
    .filter(item => getDivergence(item) > 0)
    .reduce((acc, item) => acc + getDivergence(item), 0);
  const totalDivergenceNegative = divergentItems
    .filter(item => getDivergence(item) < 0)
    .reduce((acc, item) => acc + Math.abs(getDivergence(item)), 0);

  const toggleAdjustment = (itemId: string) => {
    setSelectedForAdjustment(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const applyAdjustments = () => {
    setItems(prev => prev.map(item => {
      if (selectedForAdjustment.includes(item.id) && item.countedStock !== null) {
        return { ...item, status: "adjusted" as const };
      }
      return item;
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!countConfig.name) {
        toast.error("Informe o nome da contagem");
        return;
      }
    }
    if (currentStep === 3) {
      applyAdjustments();
    }
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    const propertyId = countConfig.propertyId ? parseInt(countConfig.propertyId, 10) : 0;
    if (!propertyId || !countConfig.name?.trim()) {
      toast.error("Informe o nome e a propriedade da contagem.");
      return;
    }
    const protocol = `INV-${new Date().toISOString().slice(0,10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const totalItems = items.length;
    const countedCount = items.filter((i) => i.countedStock !== null).length;
    const divergentCount = divergentItems.length;
    const adjustedCount = selectedForAdjustment.length;
    const accuracy =
      countedCount > 0
        ? Math.round(((countedCount - divergentCount) / countedCount) * 1000) / 10
        : 0;

    const countItemsPayload = items.map((i) => ({
      itemId: Number(i.id),
      systemQuantity: i.systemStock,
      countedQuantity: i.countedStock ?? null,
      status: i.status,
      notes: adjustmentNotes[i.id] ?? undefined,
    }));

    const res = await api.createInventoryCount({
      propertyId,
      name: countConfig.name.trim(),
      protocol,
      responsible: countConfig.responsible?.trim() || null,
      notes: countConfig.notes?.trim() || null,
      blindCount: countConfig.blindCount,
      totalItems,
      countedItems: countedCount,
      divergentItems: divergentCount,
      adjustedItems: adjustedCount,
      accuracyPercentage: accuracy,
      status: "completed",
      items: countItemsPayload,
    });
    if (!res.success) {
      toast.error((res.error as { message?: string })?.message ?? "Erro ao criar contagem.");
      return;
    }
    const countId = (res.data as { id?: string })?.id ? Number((res.data as { id: string }).id) : null;
    const toAdjust = items.filter(
      (i) => selectedForAdjustment.includes(i.id) && i.status === "divergent" && i.countedStock !== null
    );
    for (const item of toAdjust) {
      const divergence = item.countedStock! - item.systemStock;
      if (divergence === 0) continue;
      const movementRes = await api.createInventoryMovement({
        itemId: Number(item.id),
        type: divergence > 0 ? "in" : "out",
        quantity: Math.abs(divergence),
        reason: `Ajuste por contagem: ${countConfig.name}`,
        inventoryCountId: countId ?? undefined,
      });
      if (!movementRes.success) {
        toast.error(`Erro ao ajustar item ${item.name}.`);
      }
    }
    onSuccess?.();
    setShowSuccess(true);
    toast.success(`Contagem ${protocol} criada com sucesso!`);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setCurrentStep(1);
      setShowSuccess(false);
      setCountConfig({ name: "", propertyId: "", selectedCategories: [], selectedLocations: [], responsible: "", notes: "", blindCount: false });
      setItems([]);
      setSearchQuery("");
      setFilterCategory("Todos");
      setFilterStatus("Todos");
      setAdjustmentNotes({});
      setSelectedForAdjustment([]);
    }, 300);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return countConfig.name.length > 0 && countConfig.propertyId.length > 0;
      case 2: return countedItems.length > 0;
      case 3: return true;
      default: return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative px-6 py-5 border-b bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 flex-shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-indigo-500">
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
            </svg>
          </div>
          
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            <ClipboardCheck className="h-24 w-24 text-indigo-500" />
          </div>

          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                <ClipboardCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="block">Contagem de Inventário</span>
                <span className="text-sm font-normal text-indigo-600">
                  Realize a contagem física e ajustes de estoque
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Progress Bar */}
          {!showSuccess && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  Etapa {currentStep} de {steps.length}
                </span>
                <span className="text-xs font-medium text-indigo-600">
                  {Math.round((currentStep / steps.length) * 100)}% concluído
                </span>
              </div>
              <Progress 
                value={(currentStep / steps.length) * 100} 
                className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-purple-500"
              />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex flex-1 min-h-0">
          {/* Left Sidebar - Steps */}
          {!showSuccess && (
            <div className="w-64 border-r p-4 flex-shrink-0 bg-muted/30">
              <div className="space-y-2">
                {steps.map((step) => {
                  const StepIcon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => isCompleted && setCurrentStep(step.id)}
                      disabled={!isCompleted && !isActive}
                      className={cn(
                        "w-full p-4 rounded-xl text-left transition-all flex items-center gap-3",
                        isActive && "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg",
                        isCompleted && "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 cursor-pointer",
                        !isActive && !isCompleted && "bg-muted text-muted-foreground opacity-50"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isActive && "bg-white/20",
                        isCompleted && "bg-indigo-500/20",
                        !isActive && !isCompleted && "bg-muted-foreground/20"
                      )}>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{step.title}</p>
                        <p className={cn(
                          "text-xs",
                          isActive ? "text-white/70" : "text-muted-foreground"
                        )}>
                          Etapa {step.id}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Counting Progress */}
              {currentStep === 2 && (
                <div className="mt-6 p-4 rounded-xl border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium text-sm">Progresso</span>
                  </div>
                  <Progress value={progress} className="h-2 mb-2 [&>div]:bg-indigo-500" />
                  <p className="text-xs text-muted-foreground">
                    {countedItems.length} de {items.length} itens contados
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Right Content Area */}
          <ScrollArea className="flex-1 min-h-0" style={{ maxHeight: 'calc(90vh - 220px)' }}>
            <div className="p-6 pb-10">
              {/* Success State */}
              {showSuccess ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Inventário Finalizado!</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    A contagem foi concluída e os ajustes foram aplicados ao estoque.
                  </p>
                  
                  {/* Property Info */}
                  {selectedProperty && (
                    <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-muted/50 border">
                      {(() => {
                        const config = propertyTypeConfig[selectedProperty.type];
                        const Icon = config.icon;
                        return (
                          <>
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br", config.gradient)}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">{selectedProperty.name}</p>
                              <p className={cn("text-xs", config.color)}>{config.label}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                  
                  <div className="p-6 rounded-2xl border-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 mb-6 w-full max-w-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-indigo-600">{countedItems.length}</p>
                        <p className="text-xs text-muted-foreground">Itens Contados</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-amber-600">{divergentItems.length}</p>
                        <p className="text-xs text-muted-foreground">Divergências</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-emerald-600">{selectedForAdjustment.length}</p>
                        <p className="text-xs text-muted-foreground">Ajustes</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                      <Printer className="h-4 w-4" />
                      Imprimir
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Exportar PDF
                    </Button>
                    <Button onClick={handleClose} className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500">
                      <CheckCircle className="h-4 w-4" />
                      Concluir
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step 1: Configuration */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      {/* Property Selection */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                            <MapPin className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Propriedade *</Label>
                            <p className="text-xs text-muted-foreground">Selecione a propriedade para contagem</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                          {properties.map((property) => {
                            const config = propertyTypeConfig[property.type];
                            const Icon = config.icon;
                            const isSelected = countConfig.propertyId === property.id;
                            
                            return (
                              <div
                                key={property.id}
                                className={cn(
                                  "p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
                                  isSelected 
                                    ? `bg-gradient-to-br ${config.gradient}/10 border-${property.type === 'hotel' ? 'blue' : property.type === 'apart-hotel' ? 'purple' : property.type === 'loft' ? 'amber' : 'emerald'}-500` 
                                    : "bg-card border-border hover:border-muted-foreground/50"
                                )}
                                onClick={() => setCountConfig({ ...countConfig, propertyId: property.id })}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
                                    config.gradient
                                  )}>
                                    <Icon className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{property.name}</p>
                                    <p className={cn("text-xs", config.color)}>{config.label}</p>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle className={cn("h-5 w-5 flex-shrink-0", config.color)} />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Identification */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Identificação</Label>
                            <p className="text-xs text-muted-foreground">Defina o nome e responsável</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nome da Contagem *</Label>
                            <Input
                              placeholder="Ex: Inventário Mensal Janeiro"
                              value={countConfig.name}
                              onChange={(e) => setCountConfig({ ...countConfig, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Responsável</Label>
                            <Input
                              placeholder="Nome do responsável"
                              value={countConfig.responsible}
                              onChange={(e) => setCountConfig({ ...countConfig, responsible: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
                            <Filter className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Filtros</Label>
                            <p className="text-xs text-muted-foreground">Selecione categorias e localizações</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label>Categorias</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {countCategoryOptions.map((cat) => (
                                <div 
                                  key={cat}
                                  className={cn(
                                    "p-3 rounded-lg border cursor-pointer transition-all",
                                    countConfig.selectedCategories.includes(cat) 
                                      ? "bg-indigo-500/10 border-indigo-500" 
                                      : "hover:bg-muted"
                                  )}
                                  onClick={() => {
                                    setCountConfig(prev => ({
                                      ...prev,
                                      selectedCategories: prev.selectedCategories.includes(cat)
                                        ? prev.selectedCategories.filter(c => c !== cat)
                                        : [...prev.selectedCategories, cat]
                                    }));
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <Checkbox checked={countConfig.selectedCategories.includes(cat)} />
                                    <span className="text-sm">{cat}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {countConfig.selectedCategories.length === 0 && (
                              <p className="text-xs text-muted-foreground">Nenhum filtro = todas as categorias</p>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <Label>Localizações</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {countLocationOptions.map((loc) => (
                                <div 
                                  key={loc}
                                  className={cn(
                                    "p-3 rounded-lg border cursor-pointer transition-all",
                                    countConfig.selectedLocations.includes(loc) 
                                      ? "bg-cyan-500/10 border-cyan-500" 
                                      : "hover:bg-muted"
                                  )}
                                  onClick={() => {
                                    setCountConfig(prev => ({
                                      ...prev,
                                      selectedLocations: prev.selectedLocations.includes(loc)
                                        ? prev.selectedLocations.filter(l => l !== loc)
                                        : [...prev.selectedLocations, loc]
                                    }));
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <Checkbox checked={countConfig.selectedLocations.includes(loc)} />
                                    <span className="text-sm">{loc}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Opções Avançadas</Label>
                            <p className="text-xs text-muted-foreground">Configurações adicionais</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div 
                            className={cn(
                              "p-4 rounded-lg border cursor-pointer transition-all",
                              countConfig.blindCount ? "bg-amber-500/10 border-amber-500" : "hover:bg-muted"
                            )}
                            onClick={() => setCountConfig({ ...countConfig, blindCount: !countConfig.blindCount })}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox checked={countConfig.blindCount} />
                              <div>
                                <p className="font-medium">Contagem Cega</p>
                                <p className="text-xs text-muted-foreground">
                                  Oculta a quantidade do sistema durante a contagem para evitar influência
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Observações</Label>
                            <Textarea
                              placeholder="Adicione observações sobre esta contagem..."
                              value={countConfig.notes}
                              onChange={(e) => setCountConfig({ ...countConfig, notes: e.target.value })}
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Counting */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      {loadingItems ? (
                        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          Carregando itens de estoque...
                        </div>
                      ) : items.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                          <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="font-medium">Nenhum item de estoque nesta propriedade</p>
                          <p className="text-sm">Adicione itens em Adicionar Estoque ou Novo Item de Estoque</p>
                        </div>
                      ) : (
                        <>
                      {/* Filters */}
                      <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar por nome ou SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoriesForFilter.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Todos">Todos</SelectItem>
                            <SelectItem value="Pendentes">Pendentes</SelectItem>
                            <SelectItem value="Contados">Contados</SelectItem>
                            <SelectItem value="Divergentes">Divergentes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2">
                        {filteredItems.map((item) => {
                          const divergence = getDivergence(item);
                          const hasDivergence = item.countedStock !== null && divergence !== 0;
                          
                          return (
                            <div 
                              key={item.id}
                              className={cn(
                                "p-4 rounded-xl border transition-all",
                                item.status === "pending" && "bg-card",
                                item.status === "counted" && "bg-emerald-500/5 border-emerald-500/30",
                                item.status === "divergent" && "bg-amber-500/5 border-amber-500/30"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                  <Package className="h-6 w-6 text-white" />
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold">{item.name}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {item.sku}
                                    </Badge>
                                    {item.status === "counted" && (
                                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        OK
                                      </Badge>
                                    )}
                                    {item.status === "divergent" && (
                                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Divergente
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>{item.category}</span>
                                    <span>•</span>
                                    <span>{item.location}</span>
                                  </div>
                                </div>

                                {/* System Stock */}
                                <div className="text-center px-4 border-r">
                                  <p className="text-xs text-muted-foreground mb-1">Sistema</p>
                                  <p className={cn(
                                    "text-xl font-bold",
                                    countConfig.blindCount && item.countedStock === null ? "blur-sm" : ""
                                  )}>
                                    {countConfig.blindCount && item.countedStock === null ? "???" : item.systemStock}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{item.unit}</p>
                                </div>

                                {/* Counter */}
                                <div className="flex items-center gap-3">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10"
                                    onClick={() => decrementCount(item.id)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <div className="w-20">
                                    <Input
                                      type="number"
                                      value={item.countedStock ?? ""}
                                      onChange={(e) => updateItemCount(item.id, e.target.value ? parseInt(e.target.value) : null)}
                                      placeholder="0"
                                      className="text-center text-lg font-bold h-10"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10"
                                    onClick={() => incrementCount(item.id)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>

                                {/* Divergence */}
                                {item.countedStock !== null && (
                                  <div className={cn(
                                    "w-20 text-center px-3 py-2 rounded-lg",
                                    divergence > 0 && "bg-emerald-500/10",
                                    divergence < 0 && "bg-red-500/10",
                                    divergence === 0 && "bg-muted"
                                  )}>
                                    <p className={cn(
                                      "font-bold",
                                      divergence > 0 && "text-emerald-500",
                                      divergence < 0 && "text-red-500"
                                    )}>
                                      {divergence > 0 ? `+${divergence}` : divergence}
                                    </p>
                                    <p className="text-xs text-muted-foreground">dif.</p>
                                  </div>
                                )}

                                {/* Reset */}
                                {item.countedStock !== null && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => updateItemCount(item.id, null)}
                                    className="text-muted-foreground"
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Step 3: Divergences */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border bg-gradient-to-br from-emerald-500/10 to-green-500/5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                              <TrendingUp className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Sobras</p>
                              <p className="text-2xl font-bold text-emerald-500">+{totalDivergencePositive}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl border bg-gradient-to-br from-red-500/10 to-rose-500/5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                              <TrendingDown className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Faltas</p>
                              <p className="text-2xl font-bold text-red-500">-{totalDivergenceNegative}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl border bg-gradient-to-br from-indigo-500/10 to-purple-500/5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                              <Equal className="h-5 w-5 text-indigo-500" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total Divergências</p>
                              <p className="text-2xl font-bold text-indigo-500">{divergentItems.length}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {divergentItems.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-emerald-500" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Nenhuma Divergência!</h3>
                          <p className="text-muted-foreground">
                            Todos os itens contados estão de acordo com o sistema.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Itens com Divergência</h3>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedForAdjustment(divergentItems.map(i => i.id))}
                            >
                              Selecionar Todos
                            </Button>
                          </div>
                          
                          {divergentItems.map((item) => {
                            const divergence = getDivergence(item);
                            const isSelected = selectedForAdjustment.includes(item.id);
                            
                            return (
                              <div 
                                key={item.id}
                                className={cn(
                                  "p-4 rounded-xl border transition-all cursor-pointer",
                                  isSelected 
                                    ? "bg-indigo-500/10 border-indigo-500" 
                                    : "bg-card hover:bg-muted/50"
                                )}
                                onClick={() => toggleAdjustment(item.id)}
                              >
                                <div className="flex items-center gap-4">
                                  <Checkbox checked={isSelected} />
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                    <Package className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.sku}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Sistema</p>
                                    <p className="font-bold">{item.systemStock}</p>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                  <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Contado</p>
                                    <p className="font-bold">{item.countedStock}</p>
                                  </div>
                                  <div className={cn(
                                    "px-3 py-2 rounded-lg",
                                    divergence > 0 ? "bg-emerald-500/10" : "bg-red-500/10"
                                  )}>
                                    <p className={cn(
                                      "font-bold",
                                      divergence > 0 ? "text-emerald-500" : "text-red-500"
                                    )}>
                                      {divergence > 0 ? `+${divergence}` : divergence}
                                    </p>
                                  </div>
                                </div>
                                
                                {isSelected && (
                                  <div className="mt-4 pt-4 border-t" onClick={(e) => e.stopPropagation()}>
                                    <Label className="text-sm">Justificativa do ajuste</Label>
                                    <Textarea
                                      placeholder="Descreva o motivo da divergência..."
                                      value={adjustmentNotes[item.id] || ""}
                                      onChange={(e) => setAdjustmentNotes({
                                        ...adjustmentNotes,
                                        [item.id]: e.target.value
                                      })}
                                      className="mt-2"
                                      rows={2}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 4: Finalization */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="p-6 rounded-2xl border-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                        <div className="flex items-center gap-4 mb-6">
                          {selectedProperty && (() => {
                            const config = propertyTypeConfig[selectedProperty.type];
                            const Icon = config.icon;
                            return (
                              <div className={cn("p-3 rounded-xl bg-gradient-to-br", config.gradient)}>
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                            );
                          })()}
                          <div>
                            <h3 className="font-semibold text-lg">{countConfig.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {selectedProperty && (
                                <span className="flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  {selectedProperty.name}
                                </span>
                              )}
                              {countConfig.responsible && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {countConfig.responsible}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date().toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4">
                          <div className="text-center p-4 rounded-xl bg-card border">
                            <Package className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold">{items.length}</p>
                            <p className="text-xs text-muted-foreground">Total Itens</p>
                          </div>
                          <div className="text-center p-4 rounded-xl bg-card border">
                            <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold">{countedItems.length}</p>
                            <p className="text-xs text-muted-foreground">Contados</p>
                          </div>
                          <div className="text-center p-4 rounded-xl bg-card border">
                            <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold">{divergentItems.length}</p>
                            <p className="text-xs text-muted-foreground">Divergências</p>
                          </div>
                          <div className="text-center p-4 rounded-xl bg-card border">
                            <RotateCcw className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold">{selectedForAdjustment.length}</p>
                            <p className="text-xs text-muted-foreground">Ajustes</p>
                          </div>
                        </div>
                      </div>

                      {selectedForAdjustment.length > 0 && (
                        <div className="p-5 rounded-2xl border bg-amber-500/5 border-amber-500/20">
                          <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <h4 className="font-semibold">Ajustes a serem aplicados</h4>
                          </div>
                          <div className="space-y-2">
                            {items
                              .filter(i => selectedForAdjustment.includes(i.id))
                              .map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-card border">
                                  <span className="font-medium">{item.name}</span>
                                  <div className="flex items-center gap-4">
                                    <span className="text-muted-foreground">{item.systemStock}</span>
                                    <ArrowRight className="h-4 w-4" />
                                    <span className="font-bold">{item.countedStock}</span>
                                    <Badge className={cn(
                                      getDivergence(item) > 0 
                                        ? "bg-emerald-500/10 text-emerald-500" 
                                        : "bg-red-500/10 text-red-500"
                                    )}>
                                      {getDivergence(item) > 0 ? "+" : ""}{getDivergence(item)}
                                    </Badge>
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      )}

                      {countConfig.notes && (
                        <div className="p-4 rounded-xl border bg-muted/50">
                          <Label className="text-sm text-muted-foreground">Observações</Label>
                          <p className="mt-1">{countConfig.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        {!showSuccess && (
          <div className="flex justify-between gap-3 p-6 border-t bg-muted/30 flex-shrink-0">
            <Button variant="outline" onClick={handleClose} size="lg">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  size="lg"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              )}
              {currentStep < 4 ? (
                <Button 
                  onClick={handleNext}
                  disabled={!canProceed()}
                  size="lg"
                  className="min-w-[180px] bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  size="lg"
                  className="min-w-[180px] bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Finalizar Inventário
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
