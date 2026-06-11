import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ClipboardCheck, 
  Search, 
  Eye, 
  Calendar, 
  User, 
  Building, 
  Package,
  TrendingUp,
  TrendingDown,
  Equal,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Download,
  Printer,
  Hotel,
  Home,
  TreePine,
  Loader2,
  BarChart2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

type CountStatus = "completed" | "in_progress" | "cancelled";

interface CountHistoryItem {
  id: string;
  protocol: string;
  name: string;
  propertyId: string;
  propertyName: string;
  propertyType: "hotel" | "apart-hotel" | "loft" | "temporada";
  date: string;
  responsible: string;
  status: CountStatus;
  totalItems: number;
  countedItems: number;
  divergences: number;
  adjustments: number;
  accuracy: number;
  notes?: string;
  items: CountItemDetail[];
}

interface CountItemDetail {
  id: string;
  name: string;
  sku: string;
  category: string;
  systemStock: number;
  countedStock: number;
  divergence: number;
  adjusted: boolean;
  adjustmentNote?: string;
}

const propertyTypeConfig = {
  hotel: { label: "Hotel", icon: Hotel, color: "text-blue-500", gradient: "from-blue-500 to-cyan-500" },
  "apart-hotel": { label: "Apart-Hotel", icon: Building, color: "text-purple-500", gradient: "from-purple-500 to-pink-500" },
  loft: { label: "Loft", icon: Home, color: "text-amber-500", gradient: "from-amber-500 to-orange-500" },
  temporada: { label: "Temporada", icon: TreePine, color: "text-emerald-500", gradient: "from-emerald-500 to-green-500" }
};

const statusConfig: Record<CountStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  completed: { label: "Concluído", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle },
  in_progress: { label: "Em Andamento", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
  cancelled: { label: "Cancelado", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: AlertTriangle }
};

type ApiCount = {
  id: string;
  propertyId: number;
  propertyName: string | null;
  propertyType?: string;
  name: string;
  protocol: string;
  responsible: string | null;
  notes: string | null;
  createdAt: string;
  status?: string;
  totalItems?: number;
  countedItems?: number;
  divergentItems?: number;
  adjustedItems?: number;
  accuracyPercentage?: number | null;
};

function toPropertyType(t?: string): "hotel" | "apart-hotel" | "loft" | "temporada" {
  if (t === "apart-hotel" || t === "loft" || t === "temporada") return t;
  return "hotel";
}

function toCountStatus(s?: string): CountStatus {
  if (s === "completed") return "completed";
  if (s === "draft" || s === "in_progress") return "in_progress";
  return "cancelled";
}

function formatCountDate(createdAt: string): string {
  try {
    const d = new Date(createdAt);
    return d.toISOString().slice(0, 16).replace("T", " ");
  } catch {
    return createdAt;
  }
}

function mapApiCountToHistory(c: ApiCount): CountHistoryItem {
  const date = formatCountDate(c.createdAt);
  return {
    id: c.id,
    protocol: c.protocol ?? "",
    name: c.name ?? "",
    propertyId: String(c.propertyId),
    propertyName: c.propertyName ?? "",
    propertyType: toPropertyType(c.propertyType),
    date,
    responsible: c.responsible ?? "",
    status: toCountStatus(c.status),
    totalItems: Number(c.totalItems ?? 0),
    countedItems: Number(c.countedItems ?? 0),
    divergences: Number(c.divergentItems ?? 0),
    adjustments: Number(c.adjustedItems ?? 0),
    accuracy: Number(c.accuracyPercentage ?? 0),
    notes: c.notes ?? undefined,
    items: [],
  };
}

interface InventoryCountHistoryProps {
  onStartNewCount: () => void;
  /** Quando mudar, a lista de contagens é recarregada (ex.: após criar contagem no modal). */
  refreshTrigger?: number;
}

type ApiMovement = {
  id: string;
  itemId: number;
  itemName?: string;
  itemSku?: string;
  itemUnit?: string;
  itemCategory?: string | null;
  type: string;
  quantity: number;
  reason?: string | null;
  /** Estoque do item no sistema (após o ajuste); usado para detalhe de contagem */
  itemCurrentStock?: number | null;
  /** Estoque no sistema no momento da contagem (antes do ajuste) */
  systemStockAtCount?: number | null;
  /** Estoque contado que resultou no ajuste */
  countedStockAtCount?: number | null;
};

export function InventoryCountHistory({ onStartNewCount, refreshTrigger }: InventoryCountHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCount, setSelectedCount] = useState<CountHistoryItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [countHistory, setCountHistory] = useState<CountHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailItems, setDetailItems] = useState<CountItemDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchCounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getInventoryCounts({ limit: 200 });
      const list = (res?.data as { counts?: unknown[] })?.counts ?? [];
      const raw = Array.isArray(list) ? (list as ApiCount[]) : [];
      setCountHistory(raw.map(mapApiCountToHistory));
    } catch {
      setCountHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts, refreshTrigger]);

  const fetchDetailItems = useCallback(async (countId: string) => {
    setLoadingDetails(true);
    try {
      const countItemsRes = await api.getInventoryCountItems(Number(countId));
      const countItemsList = (countItemsRes?.data as { items?: unknown[] })?.items ?? [];
      const countItems = Array.isArray(countItemsList) ? countItemsList : [];
      if (countItems.length > 0) {
        const items: CountItemDetail[] = countItems.map((r: {
          id: string;
          systemQuantity: number;
          countedQuantity: number | null;
          divergence: number;
          status: string;
          notes: string | null;
          itemName: string;
          itemSku: string;
          itemCategory: string;
        }) => ({
          id: r.id,
          name: r.itemName ?? "",
          sku: r.itemSku ?? "",
          category: r.itemCategory ?? "",
          systemStock: r.systemQuantity ?? 0,
          countedStock: r.countedQuantity ?? 0,
          divergence: r.divergence ?? 0,
          adjusted: r.status === "adjusted",
          adjustmentNote: r.notes ?? undefined,
        }));
        setDetailItems(items);
        return;
      }
      const res = await api.getInventoryMovements({ inventoryCountId: Number(countId), limit: 500 });
      const list = (res?.data as { movements?: unknown[] })?.movements ?? [];
      const movements = Array.isArray(list) ? (list as ApiMovement[]) : [];
      const items: CountItemDetail[] = movements.map((m) => ({
        id: m.id,
        name: m.itemName ?? "",
        sku: m.itemSku ?? "",
        category: m.itemCategory ?? m.itemUnit ?? "",
        systemStock: m.systemStockAtCount ?? 0,
        countedStock: m.countedStockAtCount ?? 0,
        divergence: m.quantity,
        adjusted: true,
        adjustmentNote: m.reason ?? undefined,
      }));
      setDetailItems(items);
    } catch {
      setDetailItems([]);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    if (detailsOpen && selectedCount) {
      fetchDetailItems(selectedCount.id);
    } else {
      setDetailItems([]);
    }
  }, [detailsOpen, selectedCount, fetchDetailItems]);

  const filteredHistory = countHistory.filter(count => 
    count.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    count.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    count.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    count.responsible.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (count: CountHistoryItem) => {
    setSelectedCount(count);
    setDetailsOpen(true);
  };

  const displayItems = selectedCount ? detailItems : [];
  const completedCounts = countHistory.filter(c => c.status === "completed");
  const totalDivergences = countHistory.reduce((acc, c) => acc + c.divergences, 0);
  const avgAccuracy = completedCounts.length > 0
    ? completedCounts.reduce((acc, c) => acc + c.accuracy, 0) / completedCounts.length
    : 0;

  return (
    <>
      <div className="space-y-4">
        {/* Header com ações */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por protocolo, nome, propriedade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={onStartNewCount}
            className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          >
            <ClipboardCheck className="w-4 h-4" />
            Nova Contagem
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-indigo-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Contagens</p>
                  <p className="text-2xl font-bold text-indigo-500">{countHistory.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-indigo-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Concluídas</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    {completedCounts.length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Divergências</p>
                  <p className="text-2xl font-bold text-amber-500">
                    {totalDivergences}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Precisão Média</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {avgAccuracy.toFixed(1)}%
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Histórico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Histórico de Contagens
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="divide-y divide-border">
                {loading && countHistory.length === 0 ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-12 h-12 mx-auto text-muted-foreground mb-4 animate-spin" />
                    <p className="text-muted-foreground">Carregando contagens...</p>
                  </div>
                ) : filteredHistory.length === 0 ? (
                  <div className="p-8 text-center">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhuma contagem encontrada</p>
                  </div>
                ) : (
                  filteredHistory.map((count) => {
                    const propConfig = propertyTypeConfig[count.propertyType];
                    const PropIcon = propConfig.icon;
                    const status = statusConfig[count.status];
                    const StatusIcon = status.icon;

                    return (
                      <div 
                        key={count.id} 
                        className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => handleViewDetails(count)}
                      >
                        <div className="flex items-center gap-4">
                          {/* Property Icon */}
                          <div className={cn(
                            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                            propConfig.gradient
                          )}>
                            <PropIcon className="w-6 h-6 text-white" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold truncate">{count.name}</h4>
                              <Badge variant="outline" className={status.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="font-mono">{count.protocol}</span>
                              <span className="flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                {count.propertyName}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {count.responsible}
                              </span>
                            </div>
                          </div>

                          {/* Stats - Itens, Diverg., Precisão (igual à imagem) */}
                          <div className="hidden md:flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-lg font-bold text-foreground">
                                {count.countedItems}/{count.totalItems}
                              </p>
                              <p className="text-xs text-muted-foreground">Itens</p>
                            </div>
                            <div className="text-center">
                              <p className={cn(
                                "text-lg font-bold",
                                count.divergences > 0 ? "text-amber-500" : "text-muted-foreground"
                              )}>
                                {count.divergences}
                              </p>
                              <p className="text-xs text-muted-foreground">Diverg.</p>
                            </div>
                            {count.status === "completed" && (
                              <div className="text-center">
                                <p className={cn(
                                  "text-lg font-bold",
                                  count.accuracy >= 98 ? "text-emerald-500" :
                                  count.accuracy >= 95 ? "text-amber-500" : "text-red-500"
                                )}>
                                  {Number(count.accuracy).toFixed(1)}%
                                </p>
                                <p className="text-xs text-muted-foreground">Precisão</p>
                              </div>
                            )}
                          </div>

                          {/* Date */}
                          <div className="text-right text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {count.date.split(" ")[0]}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {count.date.split(" ")[1]}
                            </div>
                          </div>

                          {/* Action */}
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalhes - layout conforme imagem (Contagem Mensal Dezembro / INV-...) */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] p-0 gap-0 overflow-hidden">
          {selectedCount && (
            <>
              {/* Header: título da contagem + ícone (building/check) + ID (protocolo) */}
              <div className="px-6 py-5 border-b bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <ClipboardCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <span className="block text-xl font-semibold">{selectedCount.name}</span>
                      <span className="text-sm font-mono font-normal text-muted-foreground">
                        {selectedCount.protocol}
                      </span>
                    </div>
                  </DialogTitle>
                </DialogHeader>
              </div>

              <ScrollArea className="flex-1" style={{ maxHeight: 'calc(85vh - 140px)' }}>
                <div className="p-6 space-y-6">
                  {/* Info Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Propriedade</span>
                      </div>
                      <p className="font-semibold">{selectedCount.propertyName}</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Responsável</span>
                      </div>
                      <p className="font-semibold">{selectedCount.responsible}</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Data</span>
                      </div>
                      <p className="font-semibold">{selectedCount.date}</p>
                    </div>
                    <div className={cn(
                      "p-4 rounded-xl border",
                      selectedCount.accuracy >= 98 ? "bg-emerald-500/10 border-emerald-500/20" :
                      selectedCount.accuracy >= 95 ? "bg-amber-100 dark:bg-amber-500/20 border-amber-500/20" :
                      "bg-red-500/10 border-red-500/20"
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Precisão</span>
                      </div>
                      <p className={cn(
                        "font-semibold",
                        selectedCount.accuracy >= 98 ? "text-emerald-500" :
                        selectedCount.accuracy >= 95 ? "text-amber-600 dark:text-amber-500" : "text-red-500"
                      )}>
                        {Number(selectedCount.accuracy).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border bg-indigo-500/10 border-indigo-500/20 text-center">
                      <Package className="w-6 h-6 mx-auto text-indigo-500 mb-2" />
                      <p className="text-2xl font-bold text-indigo-500">{selectedCount.totalItems}</p>
                      <p className="text-xs text-muted-foreground">Total Itens</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-center">
                      <CheckCircle className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
                      <p className="text-2xl font-bold text-emerald-500">{selectedCount.countedItems}</p>
                      <p className="text-xs text-muted-foreground">Contados</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-amber-500/10 border-amber-500/20 text-center">
                      <AlertTriangle className="w-6 h-6 mx-auto text-amber-500 mb-2" />
                      <p className="text-2xl font-bold text-amber-500">{selectedCount.divergences}</p>
                      <p className="text-xs text-muted-foreground">Divergências</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-blue-500/10 border-blue-500/20 text-center">
                      <RotateCcw className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                      <p className="text-2xl font-bold text-blue-500">{selectedCount.adjustments}</p>
                      <p className="text-xs text-muted-foreground">Ajustes</p>
                    </div>
                  </div>

                  {/* Observações - sempre visível */}
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Observações</span>
                    </div>
                    <p className="text-muted-foreground">{selectedCount.notes || "—"}</p>
                  </div>

                  {/* Detalhes dos Itens - sempre visível (tabela conforme imagem) */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Package className="w-4 h-4 text-indigo-500" />
                      Detalhes dos Itens
                    </h4>
                    <div className="rounded-xl border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50 border-b text-left text-muted-foreground font-medium">
                            <th className="p-3 w-[28%]">Item</th>
                            <th className="p-3 text-center w-[12%]">Sistema</th>
                            <th className="p-3 text-center w-[12%]">Contado</th>
                            <th className="p-3 text-center w-[14%]">Diferença</th>
                            <th className="p-3 text-center w-[14%]">Status</th>
                            <th className="p-3 w-[20%]">Observação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {loadingDetails ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center">
                                <Loader2 className="w-8 h-8 mx-auto text-muted-foreground animate-spin mb-2" />
                                <p className="text-sm text-muted-foreground">Carregando detalhes...</p>
                              </td>
                            </tr>
                          ) : displayItems.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                Nenhum item na contagem
                              </td>
                            </tr>
                          ) : (
                            displayItems.map((item) => (
                              <tr key={item.id} className="hover:bg-muted/30">
                                <td className="p-3">
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.sku}{item.category ? ` • ${item.category}` : ""}</p>
                                </td>
                                <td className="p-3 text-center">{item.systemStock > 0 ? item.systemStock : "—"}</td>
                                <td className="p-3 text-center font-medium">{item.countedStock > 0 ? item.countedStock : "—"}</td>
                                <td className="p-3 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    {item.divergence > 0 && <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />}
                                    {item.divergence < 0 && <TrendingDown className="w-4 h-4 text-red-500 shrink-0" />}
                                    {item.divergence === 0 && <Equal className="w-4 h-4 text-muted-foreground shrink-0" />}
                                    <span className={cn(
                                      "font-medium",
                                      item.divergence > 0 && "text-emerald-500",
                                      item.divergence < 0 && "text-red-500"
                                    )}>
                                      {item.divergence > 0 ? `+${item.divergence}` : item.divergence}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3 text-center">
                                  {item.adjusted ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                      Ajustado
                                    </Badge>
                                  ) : item.divergence !== 0 ? (
                                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                      Pendente
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                                      OK
                                    </Badge>
                                  )}
                                </td>
                                <td className="p-3 text-muted-foreground truncate max-w-[180px]" title={item.adjustmentNote || ""}>
                                  {item.adjustmentNote || "—"}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" className="gap-2">
                      <Printer className="w-4 h-4" />
                      Imprimir
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Exportar PDF
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
