import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle,
  TrendingDown,
  BarChart3,
  ShoppingCart,
  Truck,
  Edit,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Upload,
  QrCode,
  History,
  ClipboardCheck,
  Building,
  Hotel,
  Home,
  TreePine,
  ArrowRightLeft,
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { NewMovementModal } from "@/components/inventory/NewMovementModal";
import { NewOrderModal } from "@/components/inventory/NewOrderModal";
import { InventoryCountModal } from "@/components/inventory/InventoryCountModal";
import { InventoryCountHistory } from "@/components/inventory/InventoryCountHistory";
import { TransferStockModal } from "@/components/inventory/TransferStockModal";
import { AddStockModal } from "@/components/inventory/AddStockModal";
import { NewInventoryItemModal } from "@/components/inventory/NewInventoryItemModal";
import { ViewOrderModal } from "@/components/inventory/ViewOrderModal";
import { EditOrderStatusModal } from "@/components/inventory/EditOrderStatusModal";

type PropertyType = "hotel" | "apart-hotel" | "loft" | "temporada";

interface Property {
  id: string;
  name: string;
  type: PropertyType;
  totalItems: number;
  totalValue: number;
  criticalItems: number;
  lowItems: number;
}

interface PropertyStock {
  itemId: string;
  itemName: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitCost: number;
  status: "normal" | "low" | "critical" | "overstock";
}

type OrderStatus =
  | "cotacao"
  | "rascunho"
  | "aguardando_aprovacao"
  | "aprovado"
  | "em_transito"
  | "recebido"
  | "devolucao_mercadoria"
  | "cancelado";

interface PurchaseOrder {
  id: string;
  protocol: string;
  supplierName: string;
  supplierCategory: string;
  propertyNames: string[];
  totalItems: number;
  totalValue: number;
  status: OrderStatus;
  createdAt: string;
  expectedDelivery: string;
  createdBy: string;
}

interface Movement {
  id: string;
  propertyName: string;
  item: string;
  type: "entrada" | "saida" | "ajuste" | "transferencia";
  quantity: number;
  date: string;
  user: string;
  reason: string;
}

interface ApiInventoryItem {
  id: string;
  propertyId: number;
  propertyName?: string;
  name: string;
  category?: string | null;
  sku?: string | null;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number | null;
  unitCost: number | null;
  status: "normal" | "low" | "critical" | "overstock";
}

interface ApiMovement {
  id: string;
  itemId: number;
  itemName: string;
  type: string;
  quantity: number;
  reason: string | null;
  createdByName: string | null;
  createdAt: string;
}

interface ApiPurchaseOrder {
  id: string;
  propertyId?: number;
  propertyName?: string | null;
  supplierName?: string | null;
  status: string;
  orderNumber?: string | null;
  orderDate?: string | null;
  expectedDeliveryDate?: string | null;
  totalAmount?: number | null;
  createdBy?: string | null;
  createdAt: string;
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

/** Mapeia status da API para o tipo da UI */
function mapOrderStatus(apiStatus: string | undefined): OrderStatus {
  const map: Record<string, OrderStatus> = {
    draft: "rascunho",
    quotation: "cotacao",
    cotacao: "cotacao",
    rascunho: "rascunho",
    pending_approval: "aguardando_aprovacao",
    aguardando_aprovacao: "aguardando_aprovacao",
    approved: "aprovado",
    aprovado: "aprovado",
    sent_to_supplier: "em_transito",
    in_transit: "em_transito",
    em_transito: "em_transito",
    delivered: "recebido",
    completed: "devolucao_mercadoria",
    received: "recebido",
    recebido: "recebido",
    devolucao_mercadoria: "devolucao_mercadoria",
    cancelled: "cancelado",
    cancelado: "cancelado",
  };
  const mapped = apiStatus ? map[apiStatus] : undefined;
  return mapped ?? "rascunho";
}

const statusConfig = {
  normal: { label: "Normal", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  low: { label: "Baixo", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  critical: { label: "Crítico", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  overstock: { label: "Excesso", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
};

const orderStatusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof ShoppingCart }> = {
  cotacao: { label: "Cotação", color: "bg-slate-500/10 text-slate-600 border-slate-500/20", icon: ShoppingCart },
  rascunho: { label: "Rascunho", color: "bg-gray-500/10 text-gray-600 border-gray-500/20", icon: ShoppingCart },
  aguardando_aprovacao: { label: "Aguardando Aprovação", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: ShoppingCart },
  aprovado: { label: "Aprovado", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: ShoppingCart },
  em_transito: { label: "Em Trânsito", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Truck },
  recebido: { label: "Recebido", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: ShoppingCart },
  devolucao_mercadoria: { label: "Devolver Mercadoria", color: "bg-rose-500/10 text-rose-600 border-rose-500/20", icon: ArrowRightLeft },
  cancelado: { label: "Cancelado", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: ShoppingCart },
};

export default function InventoryManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [countModalOpen, setCountModalOpen] = useState(false);
  const [countListRefreshTrigger, setCountListRefreshTrigger] = useState(0);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [expandedProperties, setExpandedProperties] = useState<string[]>([]);
  const [addStockModalOpen, setAddStockModalOpen] = useState(false);
  const [selectedPropertyForStock, setSelectedPropertyForStock] = useState<Property | null>(null);
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);
  const [viewOrderModalOpen, setViewOrderModalOpen] = useState(false);
  const [editOrderStatusModalOpen, setEditOrderStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  const [items, setItems] = useState<ApiInventoryItem[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [orders, setOrders] = useState<ApiPurchaseOrder[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      const res = await api.getInventoryItems({});
      if (res.success && res.data && Array.isArray((res.data as { items?: unknown[] }).items)) {
        setItems(((res.data as { items: ApiInventoryItem[] }).items) ?? []);
      } else {
        setItems([]);
      }
    } finally {
      setLoadingItems(false);
    }
  }, []);

  const fetchMovements = useCallback(async () => {
    setLoadingMovements(true);
    try {
      const res = await api.getInventoryMovements({ limit: 100 });
      if (res.success && res.data && Array.isArray((res.data as { movements?: unknown[] }).movements)) {
        const list = (res.data as { movements: ApiMovement[] }).movements;
        setMovements(list.map((m) => ({
          id: m.id,
          propertyName: "",
          item: m.itemName ?? "",
          type: (m.type === "in" ? "entrada" : m.type === "out" ? "saida" : m.type === "adjustment" ? "ajuste" : "transferencia") as Movement["type"],
          quantity: m.quantity,
          date: m.createdAt ? new Date(m.createdAt).toLocaleString("pt-BR") : "",
          user: m.createdByName ?? "",
          reason: m.reason ?? "",
        })));
      } else {
        setMovements([]);
      }
    } finally {
      setLoadingMovements(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await api.getPurchaseOrders({ limit: 100 });
      if (res.success && res.data && Array.isArray((res.data as { orders?: unknown[] }).orders)) {
        setOrders((res.data as { orders: ApiPurchaseOrder[] }).orders ?? []);
      } else {
        setOrders([]);
      }
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const togglePropertyExpanded = (propertyId: string) => {
    setExpandedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  /** Deriva status do item a partir de estoque (igual ao backend) para garantir indicadores corretos */
  const getItemStockStatus = (item: ApiInventoryItem): "normal" | "low" | "critical" | "overstock" => {
    const current = item.currentStock;
    const min = item.minStock;
    const max = item.maxStock ?? null;
    if (max != null && current > max) return "overstock";
    if (current <= 0 || (min > 0 && current < min * 0.5)) return "critical";
    if (min > 0 && current < min) return "low";
    return "normal";
  };

  const propertiesFromItems: Property[] = (() => {
    const byProp = new Map<number, { name: string; type?: string; items: ApiInventoryItem[] }>();
    for (const item of items) {
      const pid = item.propertyId;
      if (!byProp.has(pid)) {
        byProp.set(pid, { name: item.propertyName ?? `Propriedade ${pid}`, type: undefined, items: [] });
      }
      byProp.get(pid)!.items.push(item);
    }
    return Array.from(byProp.entries()).map(([id, { name, type, items: propItems }]) => {
      const totalValue = propItems.reduce((s, i) => s + (i.currentStock * (i.unitCost ?? 0)), 0);
      const criticalItems = propItems.filter(i => getItemStockStatus(i) === "critical").length;
      const lowItems = propItems.filter(i => getItemStockStatus(i) === "low").length;
      return {
        id: String(id),
        name,
        type: toPropertyType(type),
        totalItems: propItems.length,
        totalValue: Math.round(totalValue * 100) / 100,
        criticalItems,
        lowItems,
      };
    });
  })();

  const propertyStocksByPropId: Record<string, PropertyStock[]> = (() => {
    const out: Record<string, PropertyStock[]> = {};
    for (const item of items) {
      const pid = String(item.propertyId);
      if (!out[pid]) out[pid] = [];
      out[pid].push({
        itemId: item.id,
        itemName: item.name,
        sku: item.sku ?? "",
        category: item.category ?? "",
        currentStock: item.currentStock,
        minStock: item.minStock,
        maxStock: item.maxStock ?? 0,
        unit: item.unit,
        unitCost: item.unitCost ?? 0,
        status: getItemStockStatus(item),
      });
    }
    return out;
  })();

  const purchaseOrdersForUI: PurchaseOrder[] = orders.map((o) => ({
    id: o.id,
    protocol: o.orderNumber ?? `#${o.id}`,
    supplierName: o.supplierName ?? "—",
    supplierCategory: "—",
    propertyNames: o.propertyName ? [o.propertyName] : [],
    totalItems: 0,
    totalValue: o.totalAmount ?? 0,
    status: mapOrderStatus(o.status),
    createdAt: o.createdAt ? new Date(o.createdAt).toLocaleDateString("pt-BR") : "",
    expectedDelivery: o.expectedDeliveryDate ? new Date(o.expectedDeliveryDate).toLocaleDateString("pt-BR") : "—",
    createdBy: o.createdBy ?? "—",
  }));

  const totalCriticalItems = propertiesFromItems.reduce((acc, p) => acc + p.criticalItems, 0);
  const totalLowItems = propertiesFromItems.reduce((acc, p) => acc + p.lowItems, 0);
  const totalValue = propertiesFromItems.reduce((acc, p) => acc + p.totalValue, 0);
  const totalItemsCount = propertiesFromItems.reduce((acc, p) => acc + p.totalItems, 0);

  const filteredProperties = propertiesFromItems.filter(property => 
    property.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gestão de Estoque</h1>
              <p className="text-muted-foreground">Controle de inventário por propriedade</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" className="gap-2" onClick={() => setTransferModalOpen(true)}>
              <ArrowRightLeft className="w-4 h-4" />
              Transferência
            </Button>
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              Importar
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button 
              className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg"
              onClick={() => setNewItemModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Cadastrar Item
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/5 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Itens Críticos</p>
                  <p className="text-2xl font-bold text-red-500">{loadingItems ? "—" : totalCriticalItems}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                  <p className="text-2xl font-bold text-amber-500">{loadingItems ? "—" : totalLowItems}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold text-emerald-500">
                  {loadingItems ? "—" : totalValue >= 1000 ? `R$ ${(totalValue / 1000).toFixed(1)}k` : `R$ ${totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Propriedades</p>
                  <p className="text-2xl font-bold text-blue-500">{loadingItems ? "—" : propertiesFromItems.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Building className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="properties" className="gap-2">
              <Building className="w-4 h-4" />
              Por Propriedade
            </TabsTrigger>
            <TabsTrigger value="count" className="gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Contagem
            </TabsTrigger>
            <TabsTrigger value="movements" className="gap-2">
              <History className="w-4 h-4" />
              Movimentações
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              Pedidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar propriedade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Property Cards */}
            {loadingItems ? (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Carregando itens...</span>
              </div>
            ) : (
            <div className="space-y-4">
              {filteredProperties.map((property) => {
                const config = propertyTypeConfig[property.type];
                const PropertyIcon = config.icon;
                const isExpanded = expandedProperties.includes(property.id);
                const stocks = propertyStocksByPropId[property.id] || [];

                return (
                  <Card key={property.id} className="overflow-hidden">
                    {/* Property Header */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => togglePropertyExpanded(property.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                          config.gradient
                        )}>
                          <PropertyIcon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{property.name}</h3>
                            <Badge variant="outline" className={cn("text-xs", config.color)}>
                              {config.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{property.totalItems} itens</span>
                            <span>R$ {property.totalValue.toLocaleString('pt-BR')}</span>
                            {property.criticalItems > 0 && (
                              <Badge className="bg-red-500 text-white border-0 hover:bg-red-600 text-xs px-2.5 py-0.5">
                                {property.criticalItems} críticos
                              </Badge>
                            )}
                            {property.lowItems > 0 && (
                              <Badge className="bg-amber-500 text-white border-0 hover:bg-amber-600 text-xs px-2.5 py-0.5">
                                {property.lowItems} baixos
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setSelectedPropertyForStock(property);
                              setAddStockModalOpen(true);
                            }}
                          >
                            <Plus className="w-3 h-3" />
                            Adicionar
                          </Button>
                          <Button variant="ghost" size="icon">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Stock List */}
                    {isExpanded && stocks.length > 0 && (
                      <div className="border-t">
                        <ScrollArea className="max-h-[400px]">
                          <div className="divide-y divide-border">
                            {stocks.map((stock) => {
                              const stockPercent = stock.maxStock > 0 ? (stock.currentStock / stock.maxStock) * 100 : 0;
                              const status = statusConfig[stock.status];
                              
                              return (
                                <div key={stock.itemId} className="p-4 hover:bg-accent/30 transition-colors">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                                      <Package className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium">{stock.itemName}</h4>
                                        <Badge variant="outline" className={status.color}>
                                          {status.label}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span>SKU: {stock.sku}</span>
                                        <span>{stock.category}</span>
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xl font-bold">{stock.currentStock}</p>
                                      <p className="text-xs text-muted-foreground">{stock.unit}</p>
                                    </div>
                                    <div className="w-24">
                                      <div className="flex items-center justify-between text-xs mb-1">
                                        <span>{stock.minStock}</span>
                                        <span>{stock.maxStock}</span>
                                      </div>
                                      <Progress 
                                        value={stockPercent} 
                                        className={cn(
                                          "h-2",
                                          stock.status === "critical" && "[&>div]:bg-red-500",
                                          stock.status === "low" && "[&>div]:bg-amber-500",
                                          stock.status === "overstock" && "[&>div]:bg-blue-500"
                                        )}
                                      />
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium">R$ {stock.unitCost.toFixed(2)}</p>
                                      <p className="text-xs text-muted-foreground">por {stock.unit}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <QrCode className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                    )}

                    {isExpanded && stocks.length === 0 && (
                      <div className="border-t p-8 text-center">
                        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">Nenhum item cadastrado nesta propriedade</p>
                        <Button variant="outline" className="mt-3 gap-2" onClick={() => setNewItemModalOpen(true)}>
                          <Plus className="w-4 h-4" />
                          Adicionar Item
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
            )}
          </TabsContent>

          <TabsContent value="movements" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Histórico de Movimentações</CardTitle>
                <Button className="gap-2" onClick={() => setMovementModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Nova Movimentação
                </Button>
              </CardHeader>
              <CardContent>
                {loadingMovements ? (
                  <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Carregando...</span>
                  </div>
                ) : (
                <ScrollArea className="h-[560px] min-h-[320px]">
                  <div className="space-y-3">
                    {movements.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        Nenhuma movimentação registrada.
                      </div>
                    ) : movements.map((movement) => (
                      <div key={movement.id} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          movement.type === "entrada" && "bg-emerald-500/10",
                          movement.type === "saida" && "bg-red-500/10",
                          movement.type === "ajuste" && "bg-amber-500/10",
                          movement.type === "transferencia" && "bg-blue-500/10"
                        )}>
                          {movement.type === "entrada" && <ArrowDown className="w-5 h-5 text-emerald-500" />}
                          {movement.type === "saida" && <ArrowUp className="w-5 h-5 text-red-500" />}
                          {movement.type === "ajuste" && <RefreshCw className="w-5 h-5 text-amber-500" />}
                          {movement.type === "transferencia" && <ArrowRightLeft className="w-5 h-5 text-blue-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{movement.item}</h4>
                            <Badge variant="outline" className={cn(
                              movement.type === "entrada" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                              movement.type === "saida" && "bg-red-500/10 text-red-500 border-red-500/20",
                              movement.type === "ajuste" && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                              movement.type === "transferencia" && "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            )}>
                              {movement.type === "entrada" ? "Entrada" : 
                               movement.type === "saida" ? "Saída" : 
                               movement.type === "ajuste" ? "Ajuste" : "Transferência"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{movement.propertyName} • {movement.reason}</p>
                        </div>
                        <div className="text-center">
                          <p className={cn(
                            "text-xl font-bold",
                            movement.type === "entrada" && "text-emerald-500",
                            movement.type === "saida" && "text-red-500",
                            movement.type === "ajuste" && "text-amber-500",
                            movement.type === "transferencia" && "text-blue-500"
                          )}>
                            {movement.type === "entrada" ? "+" : movement.type === "saida" ? "-" : ""}{Math.abs(movement.quantity)}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{movement.date}</p>
                          <p>{movement.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {/* Order Status Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {(["cotacao", "rascunho", "aguardando_aprovacao", "aprovado", "em_transito", "recebido"] as OrderStatus[]).map((status) => {
                const config = orderStatusConfig[status];
                const count = purchaseOrdersForUI.filter(o => o.status === status).length;
                return (
                  <Card key={status} className={cn("p-3 border-2 transition-all hover:shadow-md cursor-pointer", config.color)}>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-xs font-medium leading-tight">{config.label}</div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Order Flow Visualization */}
            <Card className="p-4">
              <div className="flex items-center justify-between gap-2 overflow-x-auto">
                {(["cotacao", "rascunho", "aguardando_aprovacao", "aprovado", "em_transito", "recebido"] as OrderStatus[]).map((status, index, arr) => {
                  const config = orderStatusConfig[status];
                  const count = purchaseOrdersForUI.filter(o => o.status === status).length;
                  return (
                    <div key={status} className="flex items-center flex-shrink-0">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                          config.color
                        )}>
                          {count}
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 text-center max-w-[80px]">{config.label}</span>
                      </div>
                      {index < arr.length - 1 && (
                        <div className="w-8 h-0.5 bg-border mx-2 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Header with Actions */}
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar pedido por protocolo, fornecedor..." className="pl-10" />
              </div>
              <Button className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white" onClick={() => setOrderModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Novo Pedido
              </Button>
            </div>

            {/* Orders List */}
            <Card>
              <CardContent className="p-0">
                {loadingOrders ? (
                  <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Carregando...</span>
                  </div>
                ) : purchaseOrdersForUI.length === 0 ? (
                  <div className="p-8 text-center">
                    <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum pedido</h3>
                    <p className="text-muted-foreground mb-4">Crie pedidos de reposição para suas propriedades</p>
                    <Button className="gap-2" onClick={() => setOrderModalOpen(true)}>
                      <Plus className="w-4 h-4" />
                      Novo Pedido
                    </Button>
                  </div>
                ) : (
                <ScrollArea className="h-[400px]">
                  <div className="divide-y divide-border">
                    {purchaseOrdersForUI.map((order) => {
                      const statusConf = orderStatusConfig[order.status];
                      return (
                        <div key={order.id} className="p-4 hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", statusConf.color)}>
                              <statusConf.icon className="w-6 h-6" />
                            </div>
                            
                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-semibold text-sm">{order.protocol}</span>
                                <Badge variant="outline" className={cn("text-xs", statusConf.color)}>
                                  {statusConf.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">{order.supplierName}</span>
                                <span>•</span>
                                <span>{order.supplierCategory}</span>
                                <span>•</span>
                                <span>{order.totalItems} itens</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span>Propriedades: {order.propertyNames.join(", ")}</span>
                              </div>
                            </div>
                            
                            {/* Value */}
                            <div className="text-right">
                              <p className="font-bold text-lg">R$ {order.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                              <p className="text-xs text-muted-foreground">
                                {order.status === "recebido" ? "Recebido" : order.expectedDelivery !== "-" ? `Previsão: ${order.expectedDelivery}` : "Sem data"}
                              </p>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setViewOrderModalOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setEditOrderStatusModalOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="count" className="space-y-4">
            <InventoryCountHistory
              onStartNewCount={() => setCountModalOpen(true)}
              refreshTrigger={countListRefreshTrigger}
            />
          </TabsContent>
        </Tabs>

        <NewMovementModal 
          open={movementModalOpen} 
          onOpenChange={setMovementModalOpen}
          onSuccess={() => { fetchItems(); fetchMovements(); }}
        />
        <NewOrderModal 
          open={orderModalOpen} 
          onOpenChange={setOrderModalOpen}
          onSuccess={() => { fetchOrders(); fetchItems(); }}
        />
        <InventoryCountModal 
          open={countModalOpen} 
          onOpenChange={setCountModalOpen}
          onSuccess={() => {
            fetchItems();
            fetchMovements();
            setCountListRefreshTrigger((t) => t + 1);
          }}
        />
        <TransferStockModal 
          open={transferModalOpen} 
          onOpenChange={setTransferModalOpen}
          onSuccess={() => { fetchItems(); fetchMovements(); }}
        />
        <AddStockModal 
          open={addStockModalOpen} 
          onOpenChange={setAddStockModalOpen}
          property={selectedPropertyForStock}
          onSuccess={() => { fetchItems(); fetchMovements(); }}
        />
        <NewInventoryItemModal 
          open={newItemModalOpen} 
          onOpenChange={setNewItemModalOpen}
          onSuccess={fetchItems}
        />
        <ViewOrderModal
          open={viewOrderModalOpen}
          onOpenChange={setViewOrderModalOpen}
          order={selectedOrder}
        />
        <EditOrderStatusModal
          open={editOrderStatusModalOpen}
          onOpenChange={setEditOrderStatusModalOpen}
          order={selectedOrder}
          onSuccess={() => {
            fetchOrders();
            setSelectedOrder(null);
          }}
        />
      </div>
    </DashboardLayout>
  );
}
