import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowDown, 
  ArrowUp, 
  RefreshCw, 
  Package,
  Check,
  Copy,
  Building2,
  Home,
  Warehouse,
  Palmtree,
  Search,
  User,
  FileText,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  ChevronRight,
  X,
  Printer,
  QrCode,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface NewMovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type MovementType = "entrada" | "saida" | "ajuste";

const propertyTypes = [
  { id: "hotel", label: "Hotel", icon: Building2, color: "text-blue-500", gradient: "from-blue-500 to-indigo-600" },
  { id: "apart-hotel", label: "Apart-Hotel", icon: Home, color: "text-purple-500", gradient: "from-purple-500 to-violet-600" },
  { id: "loft", label: "Loft", icon: Warehouse, color: "text-amber-500", gradient: "from-amber-500 to-orange-600" },
  { id: "temporada", label: "Temporada", icon: Palmtree, color: "text-emerald-500", gradient: "from-emerald-500 to-teal-600" },
];

const movementTypes: { id: MovementType; label: string; icon: typeof ArrowDown; color: string; gradient: string; description: string }[] = [
  { id: "entrada", label: "Entrada", icon: ArrowDown, color: "text-emerald-500", gradient: "from-emerald-500 to-green-600", description: "Recebimento de produtos" },
  { id: "saida", label: "Saída", icon: ArrowUp, color: "text-red-500", gradient: "from-red-500 to-rose-600", description: "Baixa de produtos" },
  { id: "ajuste", label: "Ajuste", icon: RefreshCw, color: "text-amber-500", gradient: "from-amber-500 to-orange-600", description: "Correção de inventário" },
];

interface InventoryItemRow {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  currentStock: number;
  unit: string;
}

interface ApiProperty {
  id: number;
  name: string;
  type?: string;
}

interface SelectedProduct {
  itemId: number;
  quantity: number;
}

const steps = [
  { id: 1, title: "Tipo", description: "Tipo de movimentação", icon: RefreshCw },
  { id: 2, title: "Produtos", description: "Selecionar itens", icon: Package },
  { id: 3, title: "Quantidades", description: "Definir valores", icon: TrendingUp },
  { id: 4, title: "Detalhes", description: "Informações adicionais", icon: FileText },
  { id: 5, title: "Confirmação", description: "Revisar e salvar", icon: CheckCircle },
];

const movementTypeToApi = (t: MovementType): 'in' | 'out' | 'adjustment' => {
  if (t === "entrada") return "in";
  if (t === "saida") return "out";
  return "adjustment";
};

export function NewMovementModal({ open, onOpenChange, onSuccess }: NewMovementModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [selectedMovementType, setSelectedMovementType] = useState<MovementType | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItemRow[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [reason, setReason] = useState("");
  const [responsibleUser, setResponsibleUser] = useState("");
  const [notes, setNotes] = useState("");
  const [documentRef, setDocumentRef] = useState("");
  const [notifyTeam, setNotifyTeam] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [visibleItemsCount, setVisibleItemsCount] = useState(120);
  const [errorModal, setErrorModal] = useState<{ open: boolean; title: string; message: string }>({ open: false, title: "", message: "" });
  const [inlineError, setInlineError] = useState<string | null>(null);

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

  const fetchInventoryItems = useCallback(async (propertyId: number) => {
    setLoadingItems(true);
    try {
      const res = await api.getInventoryItems({ propertyId });
      const list = (res?.data as { items?: unknown[] })?.items ?? [];
      const raw = Array.isArray(list) ? list : [];
      setInventoryItems(
        raw.map((i: { id: string | number; name?: string; sku?: string | null; category?: string | null; currentStock?: number; unit?: string }) => ({
          id: String(i.id),
          name: i.name ?? "",
          sku: i.sku ?? null,
          category: i.category ?? null,
          currentStock: Number(i.currentStock ?? 0),
          unit: i.unit ?? "un",
        }))
      );
    } catch {
      setInventoryItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchProperties();
  }, [open, fetchProperties]);

  useEffect(() => {
    if (open && selectedPropertyId) {
      fetchInventoryItems(Number(selectedPropertyId));
      setVisibleItemsCount(120);
    } else {
      setInventoryItems([]);
      setSelectedProducts([]);
    }
  }, [open, selectedPropertyId, fetchInventoryItems]);

  const categories = [...new Set(inventoryItems.map(p => p.category).filter(Boolean))];

  const filteredItems = inventoryItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.sku ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const visibleFilteredItems = filteredItems.slice(0, visibleItemsCount);

  const getItemById = (itemId: number) => inventoryItems.find(p => Number(p.id) === itemId);
  const movementConfig = movementTypes.find(m => m.id === selectedMovementType);
  const selectedProperty = properties.find(p => String(p.id) === selectedPropertyId);
  const propertyConfig = propertyTypes.find(p => p.id === (selectedProperty?.type === "apart-hotel" || selectedProperty?.type === "loft" || selectedProperty?.type === "temporada" ? selectedProperty.type : "hotel"));

  const toggleProduct = (itemId: number) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.itemId === itemId);
      if (exists) {
        return prev.filter(p => p.itemId !== itemId);
      }
      return [...prev, { itemId, quantity: 1 }];
    });
  };

  const selectAllFiltered = () => {
    setSelectedProducts((prev) => {
      const selectedSet = new Set(prev.map((p) => p.itemId));
      const additions = filteredItems
        .map((item) => Number(item.id))
        .filter((id) => !selectedSet.has(id))
        .map((itemId) => ({ itemId, quantity: 1 }));
      return additions.length > 0 ? [...prev, ...additions] : prev;
    });
  };

  const clearFilteredSelection = () => {
    const filteredSet = new Set(filteredItems.map((item) => Number(item.id)));
    setSelectedProducts((prev) => prev.filter((p) => !filteredSet.has(p.itemId)));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    setSelectedProducts(prev => 
      prev.map(p => p.itemId === itemId ? { ...p, quantity: Math.max(1, quantity) } : p)
    );
  };

  const removeProduct = (itemId: number) => {
    setSelectedProducts(prev => prev.filter(p => p.itemId !== itemId));
  };

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!selectedPropertyId && !!selectedMovementType;
      case 2: return selectedProducts.length > 0;
      case 3: return selectedProducts.length > 0 && selectedProducts.every(p => p.quantity > 0);
      case 4: return !!reason && !!responsibleUser;
      case 5: return selectedProducts.length > 0;
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

  const FRIENDLY_STOCK_MSG =
    "O estoque de um ou mais itens está zerado ou é insuficiente. Não é possível prosseguir com a Saída. Faça entradas antes ou verifique os itens selecionados.";

  const handleSubmit = async () => {
    if (!selectedMovementType || selectedProducts.length === 0) {
      setInlineError("Selecione ao menos um item para registrar a movimentação.");
      toast.error("Selecione ao menos um item para registrar a movimentação.");
      return;
    }
    setSubmitting(true);
    setErrorModal((prev) => ({ ...prev, open: false }));
    setInlineError(null);
    try {
      const apiType = movementTypeToApi(selectedMovementType);
      const reasonText = reason || (selectedMovementType === "entrada" ? "Entrada de estoque" : selectedMovementType === "saida" ? "Saída de estoque" : "Ajuste de inventário");
      const movements = selectedProducts.map((sp) => ({
        itemId: sp.itemId,
        type: apiType,
        quantity: sp.quantity,
        reason: reasonText,
      }));
      const res = await api.createInventoryMovementsBulk({ movements });
      if (!res.success) {
        const msg = (res.error as { message?: string })?.message ?? "Erro ao registrar movimentação.";
        const isTechnical = /transaction|not started|queryrunner|rollback/i.test(msg);
        const friendlyMsg = isTechnical || /estoque|insuficiente|zerado/i.test(msg) ? FRIENDLY_STOCK_MSG : msg;
        setInlineError(friendlyMsg);
        if (!isTechnical) setErrorModal({ open: true, title: "Erro na movimentação", message: friendlyMsg });
        else toast.error(friendlyMsg);
        setSubmitting(false);
        return;
      }
      onSuccess?.();
      setShowSuccess(true);
      toast.success("Movimentação(ões) registrada(s) com sucesso.");
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Erro ao registrar movimentação.";
      const isTechnical = /transaction|not started|queryrunner|rollback/i.test(errMsg);
      const friendlyMsg = isTechnical || /estoque|insuficiente|zerado/i.test(errMsg) ? FRIENDLY_STOCK_MSG : errMsg;
      setInlineError(friendlyMsg);
      if (!isTechnical) setErrorModal({ open: true, title: "Erro na movimentação", message: friendlyMsg });
      else toast.error(friendlyMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setErrorModal({ open: false, title: "", message: "" });
    setInlineError(null);
    setTimeout(() => {
      setCurrentStep(1);
      setShowSuccess(false);
      setSelectedPropertyId("");
      setSelectedMovementType(null);
      setInventoryItems([]);
      setSelectedProducts([]);
      setSearchQuery("");
      setReason("");
      setResponsibleUser("");
      setNotes("");
      setDocumentRef("");
      setNotifyTeam(true);
    }, 300);
  };

  const generatedProtocol = `MOV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const totalItems = selectedProducts.reduce((acc, p) => acc + p.quantity, 0);

  const getGradientClass = () => {
    if (selectedMovementType === "entrada") return "from-emerald-600 via-emerald-700 to-teal-800";
    if (selectedMovementType === "saida") return "from-red-600 via-red-700 to-rose-800";
    if (selectedMovementType === "ajuste") return "from-amber-600 via-amber-700 to-orange-800";
    return "from-cyan-600 via-cyan-700 to-blue-800";
  };

  // Success Screen
  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
          <div className="p-8 text-center space-y-6">
            <div className={cn(
              "mx-auto w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg",
              movementConfig?.gradient || "from-cyan-500 to-blue-600"
            )}>
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-foreground">Movimentação Registrada!</h2>
              <p className="text-muted-foreground mt-2">
                {selectedProducts.length} produto(s) {selectedMovementType === "entrada" ? "recebidos" : selectedMovementType === "saida" ? "baixados" : "ajustados"}
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
                <Package className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{selectedProducts.length}</p>
                <p className="text-xs text-muted-foreground">Produtos</p>
              </div>
              <div className="p-4 rounded-xl border bg-card text-center">
                {selectedMovementType === "entrada" ? (
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                ) : selectedMovementType === "saida" ? (
                  <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-500" />
                ) : (
                  <RotateCcw className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                )}
                <p className="text-2xl font-bold">{totalItems}</p>
                <p className="text-xs text-muted-foreground">Unidades</p>
              </div>
              <div className="p-4 rounded-xl border bg-card text-center">
                <User className="h-6 w-6 mx-auto mb-2 text-violet-500" />
                <p className="text-sm font-bold truncate">{responsibleUser}</p>
                <p className="text-xs text-muted-foreground">Responsável</p>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <Button variant="outline" size="lg" className="gap-2">
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <QrCode className="h-4 w-4" />
                Comprovante
              </Button>
              <Button 
                size="lg" 
                onClick={handleClose}
                className={cn("gap-2 bg-gradient-to-r", movementConfig?.gradient || "from-cyan-500 to-blue-600")}
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
    <>
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <div className="flex h-[85vh]">
          {/* Sidebar */}
          <div className={cn(
            "w-72 bg-gradient-to-b p-6 flex flex-col text-white shrink-0",
            getGradientClass()
          )}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                {selectedMovementType === "entrada" ? <ArrowDown className="h-7 w-7" /> :
                 selectedMovementType === "saida" ? <ArrowUp className="h-7 w-7" /> :
                 selectedMovementType === "ajuste" ? <RefreshCw className="h-7 w-7" /> :
                 <Package className="h-7 w-7" />}
              </div>
              <div>
                <h2 className="font-bold text-lg">Nova Movimentação</h2>
                <p className="text-white/70 text-sm">
                  {selectedMovementType ? movementConfig?.label : "Registrar operação"}
                </p>
              </div>
            </div>

            {/* Movement Type Badge */}
            {selectedMovementType && (
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm mb-6">
                <div className="flex items-center gap-3">
                  {movementConfig && <movementConfig.icon className="h-5 w-5" />}
                  <div>
                    <p className="text-xs text-white/70">Tipo</p>
                    <p className="font-semibold text-sm">{movementConfig?.label}</p>
                  </div>
                </div>
              </div>
            )}

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
            {selectedProducts.length > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <p className="text-xs text-white/70 mb-1">Selecionados</p>
                <div className="flex items-baseline gap-2">
                  <p className="font-bold text-2xl">{selectedProducts.length}</p>
                  <p className="text-sm text-white/70">produto(s)</p>
                </div>
                <p className="text-sm text-white/70 mt-1">{totalItems} unidades</p>
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
              {/* Step 1: Movement Type */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Property */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">Propriedade *</Label>
                    {loadingProperties ? (
                      <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Carregando propriedades...
                      </div>
                    ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {properties.map((prop) => {
                        const typeId = (prop.type === "apart-hotel" || prop.type === "loft" || prop.type === "temporada") ? prop.type : "hotel";
                        const type = propertyTypes.find(t => t.id === typeId) ?? propertyTypes[0];
                        const Icon = type.icon;
                        const isSelected = selectedPropertyId === String(prop.id);
                        return (
                          <button
                            key={prop.id}
                            type="button"
                            onClick={() => setSelectedPropertyId(String(prop.id))}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                              isSelected 
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                                : "border-border hover:border-primary/50 hover:bg-accent/30"
                            )}
                          >
                            <div className={cn("p-3 rounded-xl bg-gradient-to-br", type.gradient)}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{prop.name}</p>
                              <p className="text-xs text-muted-foreground">{type.label}</p>
                            </div>
                            {isSelected && <CheckCircle className="h-5 w-5 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                    )}
                  </div>

                  {/* Movement Type */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">Tipo de Movimentação</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {movementTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = selectedMovementType === type.id;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setSelectedMovementType(type.id)}
                            className={cn(
                              "p-5 rounded-xl border-2 transition-all text-center",
                              isSelected 
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                                : "border-border hover:border-primary/50 hover:bg-accent/30"
                            )}
                          >
                            <div className={cn("w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mx-auto mb-3", type.gradient)}>
                              <Icon className="h-7 w-7 text-white" />
                            </div>
                            <h4 className="font-semibold">{type.label}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                            {isSelected && (
                              <div className="mt-3">
                                <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Select Products */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  {!selectedPropertyId ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">Selecione uma propriedade na etapa anterior</p>
                    </div>
                  ) : (
                    <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome ou SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={selectAllFiltered}>
                      Selecionar todos ({filteredItems.length})
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={clearFilteredSelection}>
                      Limpar filtrados
                    </Button>
                    {filteredItems.length > visibleItemsCount && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setVisibleItemsCount((prev) => Math.min(prev + 120, filteredItems.length))}
                      >
                        Mostrar mais ({filteredItems.length - visibleItemsCount} restantes)
                      </Button>
                    )}
                  </div>

                  {selectedProducts.length > 0 && (
                    <div className={cn(
                      "p-4 rounded-xl border-2 bg-gradient-to-r",
                      `${movementConfig?.gradient}/10 border-primary/30`
                    )}>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <p className="font-medium">
                          {selectedProducts.length} item(ns) selecionado(s)
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedProducts([])}
                          className="ml-auto text-muted-foreground"
                        >
                          Limpar
                        </Button>
                      </div>
                    </div>
                  )}

                  {loadingItems ? (
                    <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Carregando itens de estoque...
                    </div>
                  ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {visibleFilteredItems.map((item) => {
                      const itemIdNum = Number(item.id);
                      const isSelected = selectedProducts.some(p => p.itemId === itemIdNum);
                      const hasWarning = selectedMovementType === "saida" && item.currentStock < 10;
                      
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleProduct(itemIdNum)}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all text-left",
                            isSelected 
                              ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20" 
                              : "border-border hover:border-primary/50 hover:bg-accent/30",
                            hasWarning && !isSelected && "border-amber-500/50"
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
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold truncate">{item.name}</h4>
                                {hasWarning && (
                                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <Badge variant="outline" className="text-xs font-mono">
                                  {item.sku ?? item.id}
                                </Badge>
                                {item.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.category}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">
                                Estoque: <span className="font-semibold">{item.currentStock} {item.unit}</span>
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  )}
                  {!loadingItems && filteredItems.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">Nenhum item de estoque nesta propriedade</p>
                      <p className="text-sm">Adicione itens em Adicionar Estoque ou Novo Item de Estoque</p>
                    </div>
                  )}
                  {!loadingItems && filteredItems.length > 0 && filteredItems.length > visibleItemsCount && (
                    <div className="text-center py-2">
                      <p className="text-xs text-muted-foreground">
                        Exibindo {visibleFilteredItems.length} de {filteredItems.length} itens filtrados
                      </p>
                    </div>
                  )}
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Quantities */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50 border">
                    <div className="flex items-center gap-3">
                      {movementConfig && <movementConfig.icon className={cn("h-5 w-5", movementConfig.color)} />}
                      <p className="text-sm text-muted-foreground">
                        Defina a quantidade de cada item para {selectedMovementType === "entrada" ? "entrada" : selectedMovementType === "saida" ? "saída" : "ajuste"}.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedProducts.map((sp) => {
                      const item = getItemById(sp.itemId);
                      if (!item) return null;

                      const hasWarning = selectedMovementType === "saida" && sp.quantity > item.currentStock;
                      const newStock = selectedMovementType === "entrada" 
                        ? item.currentStock + sp.quantity
                        : selectedMovementType === "saida"
                          ? item.currentStock - sp.quantity
                          : sp.quantity;
                      
                      return (
                        <div 
                          key={sp.itemId}
                          className={cn(
                            "p-5 rounded-xl border-2 transition-colors",
                            hasWarning && "border-red-500/50 bg-red-500/5"
                          )}
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className={cn(
                              "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                              movementConfig?.gradient || "from-cyan-500 to-blue-600"
                            )}>
                              <Package className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {item.sku ?? item.id} • Estoque atual: {item.currentStock} {item.unit}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeProduct(sp.itemId)}
                              className="text-muted-foreground hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="flex-1">
                              <Label className="text-sm font-medium mb-2 block">Quantidade</Label>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => updateQuantity(sp.itemId, sp.quantity - 1)}
                                  disabled={sp.quantity <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                  type="number"
                                  min={1}
                                  value={sp.quantity}
                                  onChange={(e) => updateQuantity(sp.itemId, parseInt(e.target.value) || 1)}
                                  className="w-24 text-center font-semibold h-11"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => updateQuantity(sp.itemId, sp.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              {hasWarning && (
                                <p className="text-xs text-red-500 mt-1">
                                  Quantidade maior que o estoque disponível
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-center">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Atual</p>
                                <p className="font-bold text-lg">{item.currentStock}</p>
                              </div>
                              <div className={cn(
                                "text-xl font-bold",
                                selectedMovementType === "entrada" ? "text-emerald-500" : 
                                selectedMovementType === "saida" ? "text-red-500" : "text-amber-500"
                              )}>
                                {selectedMovementType === "entrada" ? "+" : selectedMovementType === "saida" ? "−" : "="}
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Mov.</p>
                                <p className="font-bold text-lg">{sp.quantity}</p>
                              </div>
                              <div className="text-xl font-bold">=</div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Novo</p>
                                <p className={cn(
                                  "font-bold text-lg",
                                  hasWarning ? "text-red-500" : "text-primary"
                                )}>{newStock}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Details */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-medium">Responsável *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Nome do responsável"
                          value={responsibleUser}
                          onChange={(e) => setResponsibleUser(e.target.value)}
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Documento/Referência</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="NF, Pedido, etc."
                          value={documentRef}
                          onChange={(e) => setDocumentRef(e.target.value)}
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-medium">Motivo *</Label>
                    <Input
                      placeholder={
                        selectedMovementType === "entrada" ? "Ex: Compra programada, Reposição de estoque..." :
                        selectedMovementType === "saida" ? "Ex: Reposição de quartos, Consumo de evento..." :
                        "Ex: Correção de inventário, Ajuste por contagem..."
                      }
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-medium">Observações</Label>
                    <Textarea
                      placeholder="Adicione observações adicionais sobre esta movimentação..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="p-4 rounded-xl border bg-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">Notificar Equipe</p>
                          <p className="text-sm text-muted-foreground">Enviar alerta sobre esta movimentação</p>
                        </div>
                      </div>
                      <Switch
                        checked={notifyTeam}
                        onCheckedChange={setNotifyTeam}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Confirmation */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  {/* Movement Type Summary */}
                  <div className={cn(
                    "p-5 rounded-2xl border-2 bg-gradient-to-r",
                    `${movementConfig?.gradient}/10`
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                        movementConfig?.gradient
                      )}>
                        {movementConfig && <movementConfig.icon className="h-8 w-8 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Tipo de Movimentação</p>
                        <h3 className="text-xl font-bold">{movementConfig?.label}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {propertyConfig && <propertyConfig.icon className={cn("h-4 w-4", propertyConfig.color)} />}
                          <span className="text-sm text-muted-foreground">{propertyConfig?.label}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold text-primary">{totalItems} un</p>
                      </div>
                    </div>
                  </div>

                  {/* Products Summary */}
                  <div className="p-5 rounded-xl border bg-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">Produtos</h3>
                      <Badge variant="outline" className="ml-auto">
                        {selectedProducts.length} itens
                      </Badge>
                    </div>

                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                      {selectedProducts.map((sp) => {
                        const item = getItemById(sp.itemId);
                        if (!item) return null;
                        const newStock = selectedMovementType === "entrada" 
                          ? item.currentStock + sp.quantity
                          : selectedMovementType === "saida"
                            ? item.currentStock - sp.quantity
                            : sp.quantity;
                        
                        return (
                          <div 
                            key={sp.itemId}
                            className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
                              movementConfig?.gradient
                            )}>
                              <Package className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{item.name}</h4>
                              <p className="text-xs text-muted-foreground">{item.sku ?? item.id}</p>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-muted-foreground">{item.currentStock}</span>
                              <span className={cn(
                                "font-bold",
                                selectedMovementType === "entrada" ? "text-emerald-500" : 
                                selectedMovementType === "saida" ? "text-red-500" : "text-amber-500"
                              )}>
                                {selectedMovementType === "entrada" ? "+" : selectedMovementType === "saida" ? "−" : "→"}
                                {sp.quantity}
                              </span>
                              <span className="font-bold text-primary">{newStock}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Details Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border bg-card">
                      <p className="text-sm text-muted-foreground mb-1">Responsável</p>
                      <p className="font-semibold">{responsibleUser}</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card">
                      <p className="text-sm text-muted-foreground mb-1">Documento</p>
                      <p className="font-semibold">{documentRef || "-"}</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">Motivo</p>
                      <p className="font-semibold">{reason}</p>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Mensagem de erro amigável na parte de baixo */}
            {inlineError && (
              <div className="mx-6 mb-0 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                <p className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {inlineError}
                </p>
              </div>
            )}

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
                className={cn(
                  "min-w-[160px] bg-gradient-to-r",
                  movementConfig?.gradient || "from-cyan-500 to-blue-600"
                )}
              >
                {currentStep === steps.length ? (
                  submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Registrar
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

    <AlertDialog open={errorModal.open} onOpenChange={(open) => !open && setErrorModal((m) => ({ ...m, open: false }))}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {errorModal.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-wrap pt-2 text-left">
            {errorModal.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setErrorModal((m) => ({ ...m, open: false }))}>
            Entendi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
