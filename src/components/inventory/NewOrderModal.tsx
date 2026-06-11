import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Package,
  Check,
  Copy,
  Building2,
  Home,
  Warehouse,
  Palmtree,
  Search,
  Plus,
  Minus,
  Trash2,
  Truck,
  Calendar,
  FileText,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  ClipboardList,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Star,
  Clock,
  CreditCard,
  Banknote,
  Receipt,
  Send,
  Printer,
  Download,
  Share2,
  Bell,
  Zap,
  TrendingUp,
  Boxes,
  PackageCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { SupplierModal } from "@/components/registrations/SupplierModal";

interface NewOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ApiProperty {
  id: number;
  name: string;
  type?: string;
  address?: string | null;
  addressNumber?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}

interface ApiSupplierCategory {
  id: number;
  code: string;
  name: string;
  icon?: string | null;
  colorFrom?: string | null;
  colorTo?: string | null;
}

interface ApiSupplier {
  id: number;
  name: string;
  category?: ApiSupplierCategory | { name: string } | null;
  email?: string | null;
  phone?: string | null;
  deliveryDays?: number | null;
  minOrderValue?: number | null;
  paymentTerms?: number | string | null;
}

interface ApiSupplierProductLink {
  productId: number;
}

function supplierCategoryName(cat: ApiSupplier["category"]): string {
  if (cat == null) return "";
  return typeof cat === "object" && cat !== null && "name" in cat ? (cat as { name: string }).name : "";
}

interface ApiInventoryItem {
  id: string;
  propertyId: number;
  productId?: number | null;
  name: string;
  category?: string | null;
  sku?: string | null;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock?: number | null;
  unitCost?: number | null;
}

interface ApiPaymentMethod {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  maxInstallments?: number | null;
}

function getPaymentMethodIcon(code: string | undefined | null) {
  if (!code) return CreditCard;
  const c = String(code).toLowerCase();
  if (c.includes("pix")) return Zap;
  if (c.includes("credit") || c.includes("cartao") || c.includes("cartão")) return CreditCard;
  if (c.includes("boleto") || c.includes("bank") || c.includes("transfer")) return Receipt;
  if (c.includes("cash") || c.includes("dinheiro")) return Banknote;
  return CreditCard;
}

function propertyTypeIcon(type: string | undefined) {
  const t = (type ?? "").toLowerCase();
  if (t.includes("apart") || t.includes("apartment")) return Home;
  if (t.includes("loft")) return Warehouse;
  if (t.includes("temporada") || t.includes("seasonal")) return Palmtree;
  return Building2;
}

function propertyTypeColor(type: string | undefined): string {
  const t = (type ?? "").toLowerCase();
  if (t.includes("apart")) return "from-purple-500 to-violet-600";
  if (t.includes("loft")) return "from-amber-500 to-orange-600";
  if (t.includes("temporada")) return "from-emerald-500 to-teal-600";
  return "from-blue-500 to-indigo-600";
}

const steps = [
  { id: 1, name: "Fornecedor", icon: Truck, description: "Selecione o fornecedor" },
  { id: 2, name: "Itens", icon: Package, description: "Adicione os produtos" },
  { id: 3, name: "Entrega", icon: MapPin, description: "Local e data" },
  { id: 4, name: "Pagamento", icon: CreditCard, description: "Forma de pagamento" },
  { id: 5, name: "Revisão", icon: ClipboardList, description: "Confirme o pedido" },
];

interface OrderItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export function NewOrderModal({ open, onOpenChange, onSuccess }: NewOrderModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdProtocol, setCreatedProtocol] = useState<string>("");
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([]);
  const [inventoryItems, setInventoryItems] = useState<ApiInventoryItem[]>([]);
  const [paymentMethodsFromApi, setPaymentMethodsFromApi] = useState<ApiPaymentMethod[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingInventoryItems, setLoadingInventoryItems] = useState(false);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentInstallments, setPaymentInstallments] = useState("1");
  const [urgentOrder, setUrgentOrder] = useState(false);
  const [requestQuote, setRequestQuote] = useState(false);
  const [notes, setNotes] = useState("");
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [supplierLinkedProductIds, setSupplierLinkedProductIds] = useState<Set<string>>(new Set());
  const [loadingSupplierProducts, setLoadingSupplierProducts] = useState(false);

  const protocolNumber = createdProtocol || `PED-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const fetchProperties = useCallback(async () => {
    if (!open) return;
    setLoadingProperties(true);
    try {
      const res = await api.getProperties();
      const list = (res?.data as { properties?: ApiProperty[] })?.properties ?? [];
      setProperties(Array.isArray(list) ? list : []);
    } finally {
      setLoadingProperties(false);
    }
  }, [open]);

  const fetchSuppliers = useCallback(async () => {
    if (!open || !selectedProperty) {
      setSuppliers([]);
      return;
    }
    setLoadingSuppliers(true);
    try {
      const res = await api.getSuppliers(undefined, undefined, "active", Number(selectedProperty));
      const list = (res?.data as { suppliers?: ApiSupplier[] })?.suppliers ?? [];
      setSuppliers(Array.isArray(list) ? list : []);
    } finally {
      setLoadingSuppliers(false);
    }
  }, [open, selectedProperty]);

  const fetchInventoryItems = useCallback(async () => {
    if (!open || !selectedProperty) return;
    setLoadingInventoryItems(true);
    try {
      const res = await api.getInventoryItems({ propertyId: Number(selectedProperty) });
      const list = (res?.data as { items?: ApiInventoryItem[] })?.items ?? [];
      setInventoryItems(Array.isArray(list) ? list : []);
    } finally {
      setLoadingInventoryItems(false);
    }
  }, [open, selectedProperty]);

  const fetchPaymentMethods = useCallback(async () => {
    if (!open) return;
    setLoadingPaymentMethods(true);
    try {
      const res = await api.getPaymentMethods(true);
      const list = (res?.data as { paymentMethods?: ApiPaymentMethod[] })?.paymentMethods ?? [];
      setPaymentMethodsFromApi(Array.isArray(list) ? list : []);
    } finally {
      setLoadingPaymentMethods(false);
    }
  }, [open]);

  useEffect(() => { void fetchProperties(); }, [fetchProperties]);
  useEffect(() => { void fetchSuppliers(); }, [fetchSuppliers]);
  useEffect(() => {
    setSelectedSupplier("");
  }, [selectedProperty]);
  useEffect(() => { void fetchInventoryItems(); }, [fetchInventoryItems]);
  useEffect(() => { void fetchPaymentMethods(); }, [fetchPaymentMethods]);

  useEffect(() => {
    if (currentStep === 3 && selectedProperty && !deliveryAddress) {
      setDeliveryAddress(selectedProperty);
    }
  }, [currentStep, selectedProperty, deliveryAddress]);

  useEffect(() => {
    const loadSupplierProducts = async () => {
      if (!open || !selectedSupplier || !selectedProperty) {
        setSupplierLinkedProductIds(new Set());
        return;
      }
      setLoadingSupplierProducts(true);
      try {
        const res = await api.getSupplierProducts(Number(selectedSupplier), Number(selectedProperty));
        const list = (res?.data as { products?: ApiSupplierProductLink[] })?.products ?? [];
        const ids = new Set((Array.isArray(list) ? list : []).map((p) => String(p.productId)));
        setSupplierLinkedProductIds(ids);
      } catch {
        setSupplierLinkedProductIds(new Set());
      } finally {
        setLoadingSupplierProducts(false);
      }
    };
    void loadSupplierProducts();
  }, [open, selectedSupplier, selectedProperty]);

  const categories = [...new Set(inventoryItems.map(i => i.category).filter(Boolean))] as string[];

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sku ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const idForOrder = item.productId != null ? String(item.productId) : item.id;
    const matchesSupplierHistory =
      !selectedSupplier ||
      supplierLinkedProductIds.size === 0 ||
      supplierLinkedProductIds.has(idForOrder);
    return matchesSearch && matchesCategory && matchesSupplierHistory;
  });

  const selectedSupplierData = suppliers.find(s => String(s.id) === selectedSupplier);
  const deliveryPropertyId = deliveryAddress || selectedProperty;
  const selectedAddressData = deliveryPropertyId ? properties.find(p => String(p.id) === deliveryPropertyId) : null;
  const deliveryAddressDisplay = selectedAddressData
    ? [selectedAddressData.address, selectedAddressData.neighborhood, selectedAddressData.city && selectedAddressData.state ? `${selectedAddressData.city} - ${selectedAddressData.state}` : selectedAddressData.city].filter(Boolean).join(", ")
    : "";

  const addItemToOrder = (itemId: string) => {
    const item = inventoryItems.find(i => i.id === itemId || String(i.productId ?? "") === itemId);
    if (!item) return;
    const idForOrder = item.productId != null ? String(item.productId) : item.id;
    const existing = orderItems.find(oi => oi.itemId === idForOrder);
    if (existing) {
      setOrderItems(prev => prev.map(oi =>
        oi.itemId === idForOrder ? { ...oi, quantity: oi.quantity + 1 } : oi
      ));
    } else {
      setOrderItems(prev => [...prev, {
        itemId: idForOrder,
        quantity: 1,
        unitPrice: item.unitCost ?? 0,
        discount: 0
      }]);
    }
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems(prev => prev.filter(oi => oi.itemId !== itemId));
    } else {
      setOrderItems(prev => prev.map(oi =>
        oi.itemId === itemId ? { ...oi, quantity } : oi
      ));
    }
  };

  const updateItemPrice = (itemId: string, price: number) => {
    setOrderItems(prev => prev.map(oi =>
      oi.itemId === itemId ? { ...oi, unitPrice: price } : oi
    ));
  };

  const updateItemDiscount = (itemId: string, discount: number) => {
    setOrderItems(prev => prev.map(oi =>
      oi.itemId === itemId ? { ...oi, discount: Math.min(100, Math.max(0, discount)) } : oi
    ));
  };

  const removeItemFromOrder = (itemId: string) => {
    setOrderItems(prev => prev.filter(oi => oi.itemId !== itemId));
  };

  const toggleItemExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getOrderItemData = (itemId: string) =>
    inventoryItems.find(i => i.id === itemId || String(i.productId ?? "") === itemId);

  const getItemSubtotal = (item: OrderItem) => {
    const discountMultiplier = 1 - (item.discount / 100);
    return item.quantity * item.unitPrice * discountMultiplier;
  };

  const subtotal = orderItems.reduce((acc, oi) => acc + getItemSubtotal(oi), 0);
  const totalDiscount = orderItems.reduce((acc, oi) => {
    return acc + (oi.quantity * oi.unitPrice * (oi.discount / 100));
  }, 0);
  const totalItems = orderItems.reduce((acc, oi) => acc + oi.quantity, 0);
  const totalValue = subtotal;

  const lowStockItems = inventoryItems.filter(i => i.minStock > 0 && i.currentStock < i.minStock);
  const criticalItems = inventoryItems.filter(i => i.minStock > 0 && i.currentStock < i.minStock * 0.5);

  const progress = (currentStep / steps.length) * 100;

  const canProceed = () => {
    if (currentStep === 1) return !!selectedProperty && !!selectedSupplier;
    if (currentStep === 2) return orderItems.length > 0;
    if (currentStep === 3) return !!deliveryDate && (!!deliveryAddress || !!selectedProperty);
    if (currentStep === 4) return !!paymentMethod;
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      void handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProperty || orderItems.length === 0) {
      toast.error("Selecione a propriedade e adicione itens ao pedido.");
      return;
    }
    setSubmitting(true);
    try {
      const orderDate = new Date().toISOString().slice(0, 10);
      const selectedPayMethod = paymentMethodsFromApi.find(m => String(m.id) === paymentMethod);
      const maxInst = selectedPayMethod?.maxInstallments ?? 1;
      const installments = Math.min(Math.max(1, Number(paymentInstallments) || 1), maxInst);
      const res = await api.createPurchaseOrder({
        propertyId: Number(selectedProperty),
        supplierId: selectedSupplier ? Number(selectedSupplier) : null,
        orderDate,
        expectedDeliveryDate: deliveryDate || null,
        deliveryAddress: deliveryAddressDisplay || (selectedAddressData ? selectedAddressData.name : null) || null,
        deliveryNotes: deliveryNotes || null,
        paymentMethodId: paymentMethod ? Number(paymentMethod) : null,
        paymentInstallments: installments,
        notes: notes || null,
        items: orderItems.map(oi => ({
          inventoryItemId: Number(oi.itemId),
          quantity: oi.quantity,
          unitPrice: oi.unitPrice,
          discountPercent: oi.discount,
        })),
      });
      if (!res.success) {
        toast.error((res as { error?: { message?: string } }).error?.message ?? "Erro ao criar pedido.");
        return;
      }
      const data = res.data as { orderNumber?: string; protocol?: string } | undefined;
      setCreatedProtocol(data?.orderNumber ?? data?.protocol ?? protocolNumber);
      onSuccess?.();
      setIsSuccess(true);
      toast.success("Pedido de compra criado com sucesso!", {
        description: `Protocolo: ${data?.orderNumber ?? data?.protocol ?? protocolNumber}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setIsSuccess(false);
    setCreatedProtocol("");
    setSelectedProperty("");
    setSelectedSupplier("");
    setSearchQuery("");
    setCategoryFilter("all");
    setOrderItems([]);
    setDeliveryDate("");
    setDeliveryAddress("");
    setDeliveryNotes("");
    setPaymentMethod("");
    setPaymentInstallments("1");
    setUrgentOrder(false);
    setRequestQuote(false);
    setNotes("");
    setSendEmailNotification(true);
    setExpandedItems([]);
    onOpenChange(false);
  };

  const handleCopyProtocol = () => {
    navigator.clipboard.writeText(protocolNumber);
    toast.success("Protocolo copiado!");
  };

  const addAllLowStockItems = () => {
    const toAdd: OrderItem[] = [];
    lowStockItems.forEach(item => {
      if (item.productId == null) return;
      const maxS = item.maxStock ?? item.minStock;
      const needed = Math.max(1, maxS - item.currentStock);
      const idForOrder = String(item.productId);
      const existing = orderItems.find(oi => oi.itemId === idForOrder);
      if (!existing) {
        toAdd.push({
          itemId: idForOrder,
          quantity: needed,
          unitPrice: item.unitCost ?? 0,
          discount: 0
        });
      }
    });
    if (toAdd.length > 0) {
      setOrderItems(prev => [...prev, ...toAdd]);
      toast.success(`${toAdd.length} itens adicionados ao pedido`);
    } else {
      toast.info("Nenhum item novo para adicionar.");
    }
  };

  // Render Success State
  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 mb-6 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">Pedido Criado com Sucesso!</h2>
            <p className="text-muted-foreground mb-6">Seu pedido foi registrado e será enviado ao fornecedor</p>

            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-8">
              <span className="text-sm text-muted-foreground">Protocolo:</span>
              <span className="font-mono font-bold text-lg">{protocolNumber}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyProtocol}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="border-2">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-2">
                    <Boxes className="w-5 h-5 text-violet-600" />
                  </div>
                  <p className="text-2xl font-bold">{totalItems}</p>
                  <p className="text-xs text-muted-foreground">Itens</p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold">R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-lg font-bold">{selectedSupplierData?.name}</p>
                  <p className="text-xs text-muted-foreground">Fornecedor</p>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                PDF
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Send className="w-4 h-4" />
                Enviar
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                Compartilhar
              </Button>
            </div>

            <Separator className="my-6" />

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
              <Button 
                onClick={() => {
                  setIsSuccess(false);
                  setCurrentStep(1);
                  setOrderItems([]);
                  setSelectedSupplier("");
                  setSelectedProperty("");
                }}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Pedido
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
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 gap-0 overflow-hidden">
        <div className="flex h-full max-h-[95vh]">
          {/* Left Sidebar - Wizard Steps */}
          <div className="w-72 flex-shrink-0 bg-gradient-to-b from-violet-600 via-violet-500 to-purple-600 p-6 text-white hidden lg:flex flex-col relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <ShoppingCart className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Novo Pedido</h2>
                  <p className="text-sm opacity-80">Compra centralizada</p>
                </div>
              </div>

              {/* Steps Navigation */}
              <div className="space-y-2">
                {steps.map((step) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => {
                        if (isCompleted || currentStep === step.id) {
                          setCurrentStep(step.id);
                        }
                      }}
                      disabled={!isCompleted && currentStep !== step.id}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                        isActive && "bg-white/25 backdrop-blur-sm shadow-lg",
                        isCompleted && "bg-white/10 opacity-90 cursor-pointer hover:bg-white/15",
                        !isActive && !isCompleted && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        isActive && "bg-white text-violet-600",
                        isCompleted && "bg-white/30",
                        !isActive && !isCompleted && "bg-white/10"
                      )}>
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs opacity-70">Etapa {step.id}</p>
                        <p className="font-medium text-sm truncate">{step.name}</p>
                      </div>
                      {isActive && (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Progress */}
              <div className="mt-8 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progresso</span>
                  <span className="font-bold">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Order Preview */}
              {orderItems.length > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Boxes className="w-4 h-4" />
                    <span className="font-medium text-sm">Resumo do Pedido</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="opacity-80">Itens:</span>
                      <span className="font-bold">{totalItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">Total:</span>
                      <span className="font-bold">R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-emerald-300">
                        <span className="opacity-80">Desconto:</span>
                        <span className="font-bold">-R$ {totalDiscount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="mt-6 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium text-sm">Dica</span>
                </div>
                <p className="text-xs opacity-80">
                  {currentStep === 1 && "Selecione as propriedades e o fornecedor para continuar."}
                  {currentStep === 2 && "Adicione os produtos ao pedido. Use os filtros para encontrar itens."}
                  {currentStep === 3 && "Defina a data e o local de entrega do pedido."}
                  {currentStep === 4 && "Escolha a forma de pagamento preferida."}
                  {currentStep === 5 && "Revise todas as informações antes de confirmar."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile Header */}
            <DialogHeader className="p-6 pb-0 lg:hidden">
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <ShoppingCart className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <span className="block">Novo Pedido de Compra</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Etapa {currentStep} de {steps.length}: {steps[currentStep - 1].name}
                  </span>
                </div>
              </DialogTitle>
            </DialogHeader>

            {/* Mobile Progress */}
            <div className="px-6 py-3 lg:hidden">
              <div className="flex gap-1">
                {steps.map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      "flex-1 h-1.5 rounded-full transition-all",
                      s.id <= currentStep ? "bg-violet-500" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 px-6">
              <div className="py-6 space-y-6">
                {/* Step 1: Supplier Selection */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    {/* Property Selection */}
                    <div>
                      <Label className="text-base font-semibold mb-4 block">Propriedades Destinatárias</Label>
                      {loadingProperties ? (
                        <div className="flex items-center gap-2 text-muted-foreground py-4">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Carregando propriedades...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          {properties.map((prop) => {
                            const Icon = propertyTypeIcon(prop.type);
                            const isSelected = selectedProperty === String(prop.id);
                            return (
                              <button
                                key={prop.id}
                                type="button"
                                onClick={() => setSelectedProperty(String(prop.id))}
                                className={cn(
                                  "p-4 rounded-xl border-2 transition-all text-left",
                                  isSelected
                                    ? "border-violet-500 bg-violet-500/5 shadow-lg"
                                    : "border-border hover:border-violet-500/50"
                                )}
                              >
                                <div className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center mb-2 bg-gradient-to-br",
                                  propertyTypeColor(prop.type)
                                )}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                <p className="font-semibold text-sm">{prop.name}</p>
                                <p className="text-xs text-muted-foreground">{prop.type ?? "Propriedade"}</p>
                                {isSelected && (
                                  <div className="mt-2">
                                    <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20">
                                      <Check className="w-3 h-3 mr-1" />
                                      Selecionado
                                    </Badge>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {!loadingProperties && properties.length === 0 && (
                        <p className="text-sm text-muted-foreground mt-2">Nenhuma propriedade cadastrada.</p>
                      )}
                    </div>

                    <Separator />

                    {/* Supplier Selection */}
                    <div>
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <Label className="text-base font-semibold">Selecione o Fornecedor</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-violet-500/30 text-violet-700 hover:bg-violet-500/10"
                          onClick={() => setSupplierModalOpen(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Novo Fornecedor
                        </Button>
                      </div>
                      {loadingSuppliers ? (
                        <div className="flex items-center gap-2 text-muted-foreground py-4">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Carregando fornecedores...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {suppliers.map((supplier) => {
                            const isSelected = selectedSupplier === String(supplier.id);
                            return (
                              <button
                                key={supplier.id}
                                type="button"
                                onClick={() => setSelectedSupplier(String(supplier.id))}
                                className={cn(
                                  "p-4 rounded-xl border-2 transition-all text-left",
                                  isSelected
                                    ? "border-violet-500 bg-violet-500/5 shadow-lg"
                                    : "border-border hover:border-violet-500/50"
                                )}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "w-12 h-12 rounded-xl flex items-center justify-center",
                                      isSelected ? "bg-violet-500 text-white" : "bg-secondary"
                                    )}>
                                      <Truck className="w-6 h-6" />
                                    </div>
                                    <div>
                                      <p className="font-semibold">{supplier.name}</p>
                                      <Badge variant="secondary" className="text-xs">{supplierCategoryName(supplier.category)}</Badge>
                                    </div>
                                  </div>
                                  {supplier.deliveryDays != null && (
                                    <div className="flex items-center gap-1 text-amber-500">
                                      <Clock className="w-4 h-4" />
                                      <span className="text-sm font-medium">{supplier.deliveryDays} dias</span>
                                    </div>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                  {supplier.deliveryDays != null && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{supplier.deliveryDays} dias entrega</span>
                                    </div>
                                  )}
                                  {supplier.minOrderValue != null && (
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3" />
                                      <span>Min: R$ {Number(supplier.minOrderValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                  )}
                                  {supplier.email && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      <span className="truncate">{supplier.email}</span>
                                    </div>
                                  )}
                                  {supplier.paymentTerms != null && (
                                    <div className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      <span>{typeof supplier.paymentTerms === "number" ? `${supplier.paymentTerms} dias` : String(supplier.paymentTerms)}</span>
                                    </div>
                                  )}
                                </div>
                                {isSelected && (
                                  <div className="mt-3 pt-3 border-t border-border">
                                    <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20">
                                      <Check className="w-3 h-3 mr-1" />
                                      Fornecedor Selecionado
                                    </Badge>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {!loadingSuppliers && suppliers.length === 0 && (
                        <div className="mt-2 rounded-xl border border-dashed p-4">
                          <p className="text-sm text-muted-foreground mb-3">Nenhum fornecedor cadastrado.</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSupplierModalOpen(true)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Cadastrar primeiro fornecedor
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Items Selection */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    {!selectedProperty ? (
                      <Card className="border-amber-500/30 bg-amber-500/5">
                        <CardContent className="p-6 text-center">
                          <AlertTriangle className="w-12 h-12 mx-auto text-amber-600 mb-3" />
                          <p className="font-medium text-amber-800 dark:text-amber-200">Selecione a propriedade na Etapa 1</p>
                          <p className="text-sm text-muted-foreground mt-1">O estoque é exibido por propriedade. Volte e escolha a propriedade destinatária do pedido.</p>
                        </CardContent>
                      </Card>
                    ) : (
                    <>
                    {selectedSupplier && (
                      <Card className="border-blue-500/30 bg-blue-500/5">
                        <CardContent className="p-4">
                          {loadingSupplierProducts ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Carregando histórico de produtos do fornecedor...</span>
                            </div>
                          ) : supplierLinkedProductIds.size > 0 ? (
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              Exibindo produtos já vinculados ao fornecedor selecionado ({supplierLinkedProductIds.size} produtos).
                            </p>
                          ) : (
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              Este fornecedor ainda não tem produtos vinculados. Ao salvar este pedido, os produtos serão vinculados automaticamente.
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Low Stock Alert - sempre visível na etapa 2 */}
                    <Card className="border-amber-500/30 bg-amber-500/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                              <AlertTriangle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-amber-700">{lowStockItems.length} itens abaixo do estoque mínimo</p>
                              <p className="text-sm text-amber-600">{criticalItems.length} em estado crítico</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-amber-500/30 text-amber-700 hover:bg-amber-500/10"
                            onClick={addAllLowStockItems}
                            disabled={lowStockItems.length === 0}
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Adicionar Todos
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar produtos..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full sm:w-48">
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

                    {/* Items Grid */}
                    {loadingInventoryItems ? (
                      <div className="flex items-center gap-2 text-muted-foreground py-8">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Carregando estoque da propriedade...</span>
                      </div>
                    ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {filteredItems.map((item) => {
                        const idForOrder = item.productId != null ? String(item.productId) : item.id;
                        const orderItem = orderItems.find(oi => oi.itemId === idForOrder);
                        const isLowStock = item.minStock > 0 && item.currentStock < item.minStock;
                        const isCritical = item.minStock > 0 && item.currentStock < item.minStock * 0.5;
                        const unitPrice = item.unitCost ?? 0;
                        const canAdd = item.productId != null;
                        return (
                          <Card key={item.id} className={cn(
                            "border-2 transition-all",
                            orderItem && "border-violet-500 bg-violet-500/5"
                          )}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                    orderItem ? "bg-violet-500 text-white" : "bg-secondary"
                                  )}>
                                    <Package className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.sku ?? item.id}</p>
                                  </div>
                                </div>
                                {item.category && (
                                  <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-sm mb-3">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <span className="text-muted-foreground">Estoque: </span>
                                    <span className={cn(
                                      "font-medium",
                                      isCritical && "text-red-600",
                                      isLowStock && !isCritical && "text-amber-600"
                                    )}>
                                      {item.currentStock}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Mín: </span>
                                    <span>{item.minStock}</span>
                                  </div>
                                </div>
                                <div className="font-semibold text-violet-600">
                                  R$ {unitPrice.toFixed(2)}
                                </div>
                              </div>

                              {isLowStock && (
                                <Badge className={cn(
                                  "mb-3",
                                  isCritical ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                )}>
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  {isCritical ? "Estoque Crítico" : "Estoque Baixo"}
                                </Badge>
                              )}

                              {orderItem ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateItemQuantity(idForOrder, orderItem.quantity - 1)}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <Input
                                    type="number"
                                    value={orderItem.quantity}
                                    onChange={(e) => updateItemQuantity(idForOrder, parseInt(e.target.value) || 0)}
                                    className="w-20 text-center h-8"
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateItemQuantity(idForOrder, orderItem.quantity + 1)}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                    onClick={() => removeItemFromOrder(idForOrder)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => addItemToOrder(item.id)}
                                  disabled={!canAdd}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Adicionar
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    )}
                    {!loadingInventoryItems && filteredItems.length === 0 && selectedProperty && (
                      <p className="text-sm text-muted-foreground py-4">Nenhum item de estoque nesta propriedade.</p>
                    )}
                    </>
                    )}
                  </div>
                )}

                {/* Step 3: Delivery */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-semibold mb-4 block">Data de Entrega</Label>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <Input
                          type="date"
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          className="max-w-xs"
                        />
                        {urgentOrder && (
                          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                            <Zap className="w-3 h-3 mr-1" />
                            Urgente
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">Pedido Urgente</p>
                          <p className="text-sm text-muted-foreground">Prioridade na entrega</p>
                        </div>
                      </div>
                      <Switch checked={urgentOrder} onCheckedChange={setUrgentOrder} />
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-base font-semibold mb-4 block">Local de Entrega</Label>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        {properties.map((prop) => {
                          const isSelected = deliveryAddress === String(prop.id) || (selectedProperty === String(prop.id) && !deliveryAddress);
                          const addrLine = [prop.address, prop.neighborhood].filter(Boolean).join(prop.address && prop.neighborhood ? " - " : "");
                          const cityLine = prop.city && prop.state ? `${prop.city} - ${prop.state}` : (prop.city ?? prop.state ?? "");
                          return (
                            <button
                              key={prop.id}
                              type="button"
                              onClick={() => setDeliveryAddress(String(prop.id))}
                              className={cn(
                                "p-4 rounded-xl border-2 transition-all text-left",
                                isSelected
                                  ? "border-violet-500 bg-violet-500/5 shadow-lg"
                                  : "border-border hover:border-violet-500/50"
                              )}
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                                isSelected ? "bg-violet-500 text-white" : "bg-secondary"
                              )}>
                                <MapPin className="w-5 h-5" />
                              </div>
                              <p className="font-semibold">{prop.name}</p>
                              {addrLine && <p className="text-sm text-muted-foreground">{addrLine}</p>}
                              {cityLine && <p className="text-xs text-muted-foreground">{cityLine}</p>}
                              {isSelected && (
                                <Badge className="mt-2 bg-violet-500/10 text-violet-600 border-violet-500/20">
                                  <Check className="w-3 h-3 mr-1" />
                                  Selecionado
                                </Badge>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {properties.length === 0 && (
                        <p className="text-sm text-muted-foreground mt-2">Nenhuma propriedade para entrega.</p>
                      )}
                    </div>

                    <div>
                      <Label className="font-medium mb-2 block">Observações de Entrega</Label>
                      <Textarea
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="Instruções especiais para o entregador..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Payment */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-semibold mb-4 block">Forma de Pagamento</Label>
                      {loadingPaymentMethods ? (
                        <div className="flex items-center gap-2 text-muted-foreground py-4">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Carregando formas de pagamento...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {paymentMethodsFromApi.map((method) => {
                            const Icon = getPaymentMethodIcon(method.code);
                            const isSelected = paymentMethod === String(method.id);
                            return (
                              <button
                                key={method.id}
                                type="button"
                                onClick={() => setPaymentMethod(String(method.id))}
                                className={cn(
                                  "p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4",
                                  isSelected
                                    ? "border-violet-500 bg-violet-500/5 shadow-lg"
                                    : "border-border hover:border-violet-500/50"
                                )}
                              >
                                <div className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center",
                                  isSelected ? "bg-violet-500 text-white" : "bg-secondary"
                                )}>
                                  <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold">{method.name}</p>
                                  <p className="text-sm text-muted-foreground">{method.description ?? ""}</p>
                                </div>
                                {isSelected && (
                                  <Check className="w-5 h-5 text-violet-500" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {!loadingPaymentMethods && paymentMethodsFromApi.length === 0 && (
                        <p className="text-sm text-muted-foreground mt-2">Nenhuma forma de pagamento cadastrada.</p>
                      )}
                    </div>

                    {paymentMethod && (() => {
                      const selected = paymentMethodsFromApi.find(m => String(m.id) === paymentMethod);
                      const maxInst = selected?.maxInstallments ?? 1;
                      const opts = Array.from({ length: Math.max(1, maxInst) }, (_, i) => i + 1);
                      return opts.length > 1 ? (
                        <div>
                          <Label className="font-medium mb-2 block">Parcelamento</Label>
                          <Select value={paymentInstallments} onValueChange={setPaymentInstallments}>
                            <SelectTrigger className="max-w-xs">
                              <SelectValue placeholder="Parcelas" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">À vista</SelectItem>
                              {opts.filter(n => n > 1).map(n => (
                                <SelectItem key={n} value={String(n)}>{n}x {n <= 3 ? "sem juros" : "parcelado"}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : null;
                    })()}

                    <Separator />

                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Solicitar Cotação</p>
                          <p className="text-sm text-muted-foreground">Aguardar aprovação antes do pedido</p>
                        </div>
                      </div>
                      <Switch checked={requestQuote} onCheckedChange={setRequestQuote} />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Bell className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium">Notificar Fornecedor</p>
                          <p className="text-sm text-muted-foreground">Enviar e-mail com o pedido</p>
                        </div>
                      </div>
                      <Switch checked={sendEmailNotification} onCheckedChange={setSendEmailNotification} />
                    </div>

                    <div>
                      <Label className="font-medium mb-2 block">Observações Internas</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Notas internas sobre o pedido..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* Step 5: Review */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    {/* Supplier Card */}
                    <Card className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                            <Truck className="w-6 h-6 text-violet-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{selectedSupplierData?.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="secondary">{supplierCategoryName(selectedSupplierData?.category)}</Badge>
                              {selectedSupplierData?.paymentTerms != null && (
                                <span>{typeof selectedSupplierData.paymentTerms === "number" ? `${selectedSupplierData.paymentTerms} dias` : String(selectedSupplierData.paymentTerms)}</span>
                              )}
                            </div>
                          </div>
                          {selectedSupplierData?.deliveryDays != null && (
                            <div className="flex items-center gap-1 text-amber-500">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">{selectedSupplierData.deliveryDays} dias</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Order Items */}
                    <div>
                      <Label className="text-base font-semibold mb-4 block">
                        Itens do Pedido ({totalItems})
                      </Label>
                      <div className="space-y-2">
                        {orderItems.map((oi) => {
                          const item = getOrderItemData(oi.itemId);
                          if (!item) return null;
                          return (
                            <div key={oi.itemId} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                  <Package className="w-5 h-5 text-violet-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.sku ?? item.id}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {oi.quantity}x R$ {oi.unitPrice.toFixed(2)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  = R$ {getItemSubtotal(oi).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <Card className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold">Entrega</p>
                            <p className="text-sm text-muted-foreground">{selectedAddressData?.name ?? (deliveryAddressDisplay || "-")}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Data: </span>
                            <span className="font-medium">{deliveryDate ? new Date(deliveryDate).toLocaleDateString("pt-BR") : "-"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Urgente: </span>
                            <span className="font-medium">{urgentOrder ? "Sim" : "Não"}</span>
                          </div>
                        </div>
                        {deliveryNotes && (
                          <div className="mt-3 p-2 rounded-lg bg-secondary/50 text-sm">
                            {deliveryNotes}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Payment Info */}
                    <Card className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">Pagamento</p>
                            <p className="text-sm text-muted-foreground">
                              {paymentMethodsFromApi.find(m => String(m.id) === paymentMethod)?.name ?? paymentMethod}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          {requestQuote && (
                            <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                              Aguardando Cotação
                            </Badge>
                          )}
                          {sendEmailNotification && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                              <Bell className="w-3 h-3 mr-1" />
                              Notificar Fornecedor
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Total Summary */}
                    <Card className="border-2 border-violet-500/30 bg-violet-500/5">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal ({totalItems} itens)</span>
                            <span>R$ {(subtotal + totalDiscount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          </div>
                          {totalDiscount > 0 && (
                            <div className="flex justify-between text-sm text-emerald-600">
                              <span>Descontos</span>
                              <span>-R$ {totalDiscount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-violet-600">R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-6 pt-0">
              <Separator className="mb-4" />
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={currentStep === 1 ? handleClose : handlePrevious}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {currentStep === 1 ? "Cancelar" : "Voltar"}
                </Button>
                
                <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Etapa {currentStep} de {steps.length}</span>
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || submitting}
                  className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                >
                  {currentStep === steps.length ? (
                    submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <PackageCheck className="w-4 h-4" />
                        {requestQuote ? "Solicitar Cotação" : "Confirmar Pedido"}
                      </>
                    )
                  ) : (
                    <>
                      Continuar
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <SupplierModal
      open={supplierModalOpen}
      onOpenChange={setSupplierModalOpen}
      onSuccess={() => {
        void fetchSuppliers();
        toast.success("Fornecedor adicionado. Selecione-o para continuar.");
      }}
    />
    </>
  );
}
