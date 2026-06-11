import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowRightLeft,
  ArrowRight,
  Package,
  Check,
  CheckCircle2,
  Copy,
  Building,
  Hotel,
  Home,
  TreePine,
  Search,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  AlertTriangle,
  Truck
} from "lucide-react";

interface TransferStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type PropertyType = "hotel" | "apart-hotel" | "loft" | "temporada";

interface Property {
  id: string;
  name: string;
  type: PropertyType;
}

interface StockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  availableStock: number;
  unit: string;
}

const propertyTypeConfig: Record<PropertyType, { label: string; icon: typeof Hotel; gradient: string }> = {
  hotel: { label: "Hotel", icon: Hotel, gradient: "from-blue-500 to-cyan-500" },
  "apart-hotel": { label: "Apart-Hotel", icon: Building, gradient: "from-purple-500 to-pink-500" },
  loft: { label: "Loft", icon: Home, gradient: "from-amber-500 to-orange-500" },
  temporada: { label: "Temporada", icon: TreePine, gradient: "from-emerald-500 to-green-500" }
};

const mockProperties: Property[] = [
  { id: "hotel-central", name: "Hotel Central", type: "hotel" },
  { id: "hotel-praia", name: "Hotel Praia Resort", type: "hotel" },
  { id: "apart-business", name: "Apart Business Center", type: "apart-hotel" },
  { id: "loft-urban", name: "Loft Urban Studio", type: "loft" },
  { id: "casa-temporada", name: "Casa da Praia", type: "temporada" },
];

const mockStockItems: Record<string, StockItem[]> = {
  "hotel-central": [
    { id: "1", name: "Toalha de Banho", sku: "TOW-001", category: "Enxoval", availableStock: 450, unit: "un" },
    { id: "2", name: "Sabonete Líquido", sku: "AME-001", category: "Amenities", availableStock: 85, unit: "un" },
    { id: "3", name: "Lençol Casal", sku: "ENX-001", category: "Enxoval", availableStock: 45, unit: "un" },
    { id: "4", name: "Travesseiro", sku: "ENX-002", category: "Enxoval", availableStock: 25, unit: "un" },
    { id: "5", name: "Shampoo 30ml", sku: "AME-002", category: "Amenities", availableStock: 320, unit: "un" },
  ],
  "hotel-praia": [
    { id: "1", name: "Toalha de Banho", sku: "TOW-001", category: "Enxoval", availableStock: 320, unit: "un" },
    { id: "6", name: "Água Mineral 500ml", sku: "FRI-001", category: "Frigobar", availableStock: 580, unit: "un" },
    { id: "7", name: "Refrigerante Lata", sku: "FRI-002", category: "Frigobar", availableStock: 290, unit: "un" },
  ],
  "apart-business": [
    { id: "7", name: "Refrigerante Lata", sku: "FRI-002", category: "Frigobar", availableStock: 120, unit: "un" },
    { id: "8", name: "Papel Higiênico", sku: "LIM-001", category: "Limpeza", availableStock: 80, unit: "rolo" },
  ],
  "loft-urban": [
    { id: "5", name: "Shampoo 30ml", sku: "AME-002", category: "Amenities", availableStock: 45, unit: "un" },
  ],
  "casa-temporada": [
    { id: "8", name: "Papel Higiênico", sku: "LIM-001", category: "Limpeza", availableStock: 80, unit: "rolo" },
  ],
};

interface TransferItem {
  itemId: string;
  quantity: number;
}

const steps = [
  { id: 1, name: "Origem", icon: Building },
  { id: 2, name: "Itens", icon: Package },
  { id: 3, name: "Destino", icon: Truck },
  { id: 4, name: "Confirmação", icon: CheckCircle2 },
];

export function TransferStockModal({ open, onOpenChange }: TransferStockModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [originProperty, setOriginProperty] = useState<string>("");
  const [destinationProperty, setDestinationProperty] = useState<string>("");
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState("");
  const [responsibleUser, setResponsibleUser] = useState("");

  const protocolNumber = `TRF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const originPropertyData = mockProperties.find(p => p.id === originProperty);
  const destinationPropertyData = mockProperties.find(p => p.id === destinationProperty);
  const availableItems = originProperty ? mockStockItems[originProperty] || [] : [];

  const filteredItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addItemToTransfer = (itemId: string) => {
    const existing = transferItems.find(ti => ti.itemId === itemId);
    if (existing) {
      updateItemQuantity(itemId, existing.quantity + 1);
    } else {
      setTransferItems(prev => [...prev, { itemId, quantity: 1 }]);
    }
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    const item = availableItems.find(i => i.id === itemId);
    if (!item) return;

    if (quantity <= 0) {
      setTransferItems(prev => prev.filter(ti => ti.itemId !== itemId));
    } else {
      const maxQuantity = item.availableStock;
      setTransferItems(prev => prev.map(ti =>
        ti.itemId === itemId ? { ...ti, quantity: Math.min(quantity, maxQuantity) } : ti
      ));
    }
  };

  const removeItem = (itemId: string) => {
    setTransferItems(prev => prev.filter(ti => ti.itemId !== itemId));
  };

  const getItemData = (itemId: string) => availableItems.find(i => i.id === itemId);

  const totalItems = transferItems.reduce((acc, ti) => acc + ti.quantity, 0);

  const progress = (currentStep / steps.length) * 100;

  const canProceed = () => {
    if (currentStep === 1) return originProperty !== "";
    if (currentStep === 2) return transferItems.length > 0;
    if (currentStep === 3) return destinationProperty !== "" && destinationProperty !== originProperty;
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    setIsSuccess(true);
    toast.success("Transferência realizada com sucesso!", {
      description: `Protocolo: ${protocolNumber}`,
    });
  };

  const handleClose = () => {
    setCurrentStep(1);
    setIsSuccess(false);
    setOriginProperty("");
    setDestinationProperty("");
    setTransferItems([]);
    setSearchQuery("");
    setNotes("");
    setResponsibleUser("");
    onOpenChange(false);
  };

  const handleCopyProtocol = () => {
    navigator.clipboard.writeText(protocolNumber);
    toast.success("Protocolo copiado!");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <DialogHeader className="relative">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ArrowRightLeft className="w-7 h-7" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  {isSuccess ? "Transferência Concluída!" : "Transferência entre Propriedades"}
                </DialogTitle>
                <p className="text-white/80 mt-1">
                  {isSuccess
                    ? "Os itens foram transferidos com sucesso"
                    : steps[currentStep - 1]?.name
                  }
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Steps indicator */}
          {!isSuccess && (
            <div className="relative mt-6">
              <div className="flex items-center justify-between mb-3">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <div key={step.id} className="flex items-center">
                      <button
                        onClick={() => {
                          if (isCompleted) setCurrentStep(step.id);
                        }}
                        className={cn(
                          "flex flex-col items-center gap-1 transition-all",
                          isActive && "scale-110",
                          !isActive && !isCompleted && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={!isCompleted && currentStep !== step.id}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                            isCompleted && "bg-white text-blue-600",
                            isActive && "bg-white/30 ring-2 ring-white",
                            !isActive && !isCompleted && "bg-white/10"
                          )}
                        >
                          {isCompleted ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <StepIcon className="w-5 h-5" />
                          )}
                        </div>
                        <span className="text-xs font-medium hidden lg:block">
                          {step.name}
                        </span>
                      </button>
                      {index < steps.length - 1 && (
                        <div
                          className={cn(
                            "w-12 lg:w-20 h-0.5 mx-2",
                            currentStep > step.id ? "bg-white" : "bg-white/20"
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <Progress value={progress} className="h-1.5 bg-white/20 [&>div]:bg-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          <div className="p-6 pb-10">
            {/* Success State */}
            {isSuccess ? (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 mb-6 shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>

                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <span className="text-sm text-muted-foreground">Protocolo:</span>
                    <span className="font-mono font-bold text-lg">{protocolNumber}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyProtocol}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Transfer Summary */}
                <div className="flex items-center justify-center gap-4">
                  {originPropertyData && (
                    <Card className="p-4 text-center">
                      <div className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br mx-auto mb-2 flex items-center justify-center",
                        propertyTypeConfig[originPropertyData.type].gradient
                      )}>
                        {(() => {
                          const Icon = propertyTypeConfig[originPropertyData.type].icon;
                          return <Icon className="w-6 h-6 text-white" />;
                        })()}
                      </div>
                      <p className="font-medium">{originPropertyData.name}</p>
                      <p className="text-xs text-muted-foreground">Origem</p>
                    </Card>
                  )}

                  <div className="flex flex-col items-center gap-1">
                    <ArrowRight className="w-8 h-8 text-blue-500" />
                    <Badge className="bg-blue-500">{totalItems} itens</Badge>
                  </div>

                  {destinationPropertyData && (
                    <Card className="p-4 text-center">
                      <div className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br mx-auto mb-2 flex items-center justify-center",
                        propertyTypeConfig[destinationPropertyData.type].gradient
                      )}>
                        {(() => {
                          const Icon = propertyTypeConfig[destinationPropertyData.type].icon;
                          return <Icon className="w-6 h-6 text-white" />;
                        })()}
                      </div>
                      <p className="font-medium">{destinationPropertyData.name}</p>
                      <p className="text-xs text-muted-foreground">Destino</p>
                    </Card>
                  )}
                </div>

                {/* Items Transferred */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-500" />
                      Itens Transferidos
                    </h4>
                    <div className="space-y-2">
                      {transferItems.map((ti) => {
                        const item = getItemData(ti.itemId);
                        if (!item) return null;
                        return (
                          <div key={ti.itemId} className="flex items-center justify-between py-2 border-b border-dashed last:border-0">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              <span>{item.name}</span>
                              <span className="text-xs text-muted-foreground">({item.sku})</span>
                            </div>
                            <Badge variant="outline">{ti.quantity} {item.unit}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <>
                {/* Step 1: Origin Property */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Building className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Propriedade de Origem</h3>
                        <p className="text-sm text-muted-foreground">Selecione de onde sairão os itens</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {mockProperties.map((property) => {
                        const config = propertyTypeConfig[property.type];
                        const Icon = config.icon;
                        const isSelected = originProperty === property.id;
                        const stockCount = mockStockItems[property.id]?.length || 0;

                        return (
                          <div
                            key={property.id}
                            onClick={() => setOriginProperty(property.id)}
                            className={cn(
                              "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50 hover:bg-accent/50"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                                config.gradient
                              )}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{property.name}</h4>
                                <p className="text-xs text-muted-foreground">{config.label} • {stockCount} itens</p>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-4 h-4 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 2: Select Items */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Selecionar Itens</h3>
                        <p className="text-sm text-muted-foreground">Escolha os itens para transferir de {originPropertyData?.name}</p>
                      </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome ou SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {filteredItems.map((item) => {
                        const transferItem = transferItems.find(ti => ti.itemId === item.id);
                        const quantity = transferItem?.quantity || 0;

                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "p-4 rounded-xl border-2 transition-all",
                              quantity > 0 ? "border-primary bg-primary/5" : "border-border"
                            )}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                                <Package className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{item.name}</h4>
                                <p className="text-xs text-muted-foreground">{item.sku} • {item.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">Disponível: {item.availableStock} {item.unit}</Badge>
                              {quantity > 0 ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateItemQuantity(item.id, quantity - 1)}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <Input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                                    className="w-16 h-8 text-center"
                                    min={0}
                                    max={item.availableStock}
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateItemQuantity(item.id, quantity + 1)}
                                    disabled={quantity >= item.availableStock}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addItemToTransfer(item.id)}
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Adicionar
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Selected Items Summary */}
                    {transferItems.length > 0 && (
                      <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-primary" />
                              <span className="font-medium">{transferItems.length} itens selecionados</span>
                            </div>
                            <Badge>{totalItems} unidades no total</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Step 3: Destination Property */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Propriedade de Destino</h3>
                        <p className="text-sm text-muted-foreground">Selecione para onde irão os itens</p>
                      </div>
                    </div>

                    {/* Origin Summary */}
                    {originPropertyData && (
                      <Card className="bg-blue-500/10 border-blue-500/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center",
                              propertyTypeConfig[originPropertyData.type].gradient
                            )}>
                              {(() => {
                                const Icon = propertyTypeConfig[originPropertyData.type].icon;
                                return <Icon className="w-5 h-5 text-white" />;
                              })()}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{originPropertyData.name}</p>
                              <p className="text-xs text-muted-foreground">Origem • {totalItems} itens selecionados</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {mockProperties.filter(p => p.id !== originProperty).map((property) => {
                        const config = propertyTypeConfig[property.type];
                        const Icon = config.icon;
                        const isSelected = destinationProperty === property.id;

                        return (
                          <div
                            key={property.id}
                            onClick={() => setDestinationProperty(property.id)}
                            className={cn(
                              "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50 hover:bg-accent/50"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                                config.gradient
                              )}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{property.name}</h4>
                                <p className="text-xs text-muted-foreground">{config.label}</p>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-4 h-4 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label>Observações (opcional)</Label>
                      <Textarea
                        placeholder="Motivo da transferência, instruções especiais..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Responsável</Label>
                      <Input
                        placeholder="Nome do responsável pela transferência"
                        value={responsibleUser}
                        onChange={(e) => setResponsibleUser(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Confirmation */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Confirmar Transferência</h3>
                        <p className="text-sm text-muted-foreground">Revise os dados antes de confirmar</p>
                      </div>
                    </div>

                    {/* Transfer Visual */}
                    <div className="flex items-center justify-center gap-4 py-4">
                      {originPropertyData && (
                        <Card className="p-4 text-center">
                          <div className={cn(
                            "w-14 h-14 rounded-xl bg-gradient-to-br mx-auto mb-2 flex items-center justify-center",
                            propertyTypeConfig[originPropertyData.type].gradient
                          )}>
                            {(() => {
                              const Icon = propertyTypeConfig[originPropertyData.type].icon;
                              return <Icon className="w-7 h-7 text-white" />;
                            })()}
                          </div>
                          <p className="font-semibold">{originPropertyData.name}</p>
                          <p className="text-xs text-muted-foreground">Origem</p>
                        </Card>
                      )}

                      <div className="flex flex-col items-center gap-2">
                        <ArrowRight className="w-10 h-10 text-primary" />
                        <Badge className="bg-primary text-primary-foreground text-lg px-4 py-1">
                          {totalItems} itens
                        </Badge>
                      </div>

                      {destinationPropertyData && (
                        <Card className="p-4 text-center">
                          <div className={cn(
                            "w-14 h-14 rounded-xl bg-gradient-to-br mx-auto mb-2 flex items-center justify-center",
                            propertyTypeConfig[destinationPropertyData.type].gradient
                          )}>
                            {(() => {
                              const Icon = propertyTypeConfig[destinationPropertyData.type].icon;
                              return <Icon className="w-7 h-7 text-white" />;
                            })()}
                          </div>
                          <p className="font-semibold">{destinationPropertyData.name}</p>
                          <p className="text-xs text-muted-foreground">Destino</p>
                        </Card>
                      )}
                    </div>

                    {/* Items List */}
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4 text-primary" />
                          Itens da Transferência
                        </h4>
                        <div className="divide-y">
                          {transferItems.map((ti) => {
                            const item = getItemData(ti.itemId);
                            if (!item) return null;
                            return (
                              <div key={ti.itemId} className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                    <Package className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.sku} • {item.category}</p>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="text-base">
                                  {ti.quantity} {item.unit}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {notes && (
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">Observações:</p>
                          <p className="mt-1">{notes}</p>
                        </CardContent>
                      </Card>
                    )}

                    {responsibleUser && (
                      <p className="text-sm text-muted-foreground text-center">
                        Responsável: <span className="font-medium text-foreground">{responsibleUser}</span>
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {!isSuccess && (
          <div className="flex items-center justify-between p-6 border-t bg-muted/30 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {currentStep === steps.length ? "Confirmar Transferência" : "Continuar"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {isSuccess && (
          <div className="flex items-center justify-center p-6 border-t bg-muted/30 flex-shrink-0">
            <Button onClick={handleClose} className="gap-2">
              <Check className="w-4 h-4" />
              Concluir
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
