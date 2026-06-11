import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Receipt,
  Clock,
  ShoppingCart,
  Sparkles,
  Info,
  ArrowRight,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyRow {
  id: number;
  name: string;
  type?: string;
}

interface RecentOrder {
  id: number;
  transactionNumber: string;
  time: string;
  unit: string | null;
  guest: string | null;
  total: number;
  items: number;
  status: "pending" | "completed" | "cancelled";
  propertyType?: string;
}

function mapPosTransactionToRecentOrder(
  t: Record<string, unknown>,
  propertyUnitLabel: string
): RecentOrder {
  const desc = String(t.description ?? "");
  const unitMatch = desc.match(/unidade:\s*([^\-|]+)/i);
  const guestMatch = desc.match(/h[oó]spede:\s*([^\-|]+)/i);
  const itemsChunk = desc.split(" - ")[1] ?? "";
  const itemsCount = itemsChunk
    ? itemsChunk
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean).length
    : 0;

  return {
    id: Number(t.id),
    transactionNumber: String(t.transactionNumber ?? `TRX-${t.id}`),
    time: new Date(String(t.createdAt ?? new Date())).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    unit: unitMatch ? unitMatch[1].trim() : null,
    guest: guestMatch ? guestMatch[1].trim() : null,
    total: Number(t.amount ?? 0),
    items: itemsCount,
    status: (String(t.status ?? "pending") as "pending" | "completed" | "cancelled"),
    propertyType: propertyUnitLabel,
  };
}

export default function DashboardPDV() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [todaySalesCount, setTodaySalesCount] = useState(0);
  const [todaySalesTotal, setTodaySalesTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const currentProperty = useMemo(() => {
    return properties.find((p) => p.id === selectedPropertyId) || null;
  }, [properties, selectedPropertyId]);

  const unitLabel = useMemo(() => "Unidade", []);

  const loadProperties = async () => {
    try {
      const propsRes = await api.getProperties();
      const propsRaw = (propsRes.data as { properties?: unknown[] } | undefined)?.properties ?? [];
      const normalized = (propsRaw as Array<Record<string, unknown>>).map((p) => ({
        id: Number(p.id),
        name: String(p.name ?? `Propriedade ${p.id}`),
        type: String(p.type ?? "hotel"),
      }));
      setProperties(normalized);
      if (normalized.length > 0) setSelectedPropertyId(normalized[0].id);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar propriedades para o PDV.");
    }
  };

  const loadTodaySales = async (propertyId: number) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const now = new Date();
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);

      const startStr = start.toISOString().slice(0, 10);
      const endStr = end.toISOString().slice(0, 10);

      const res = await api.getTransactions({
        propertyId,
        type: "income",
        status: "completed",
        search: "POS Terminal",
        startDate: startStr,
        endDate: endStr,
      });

      const list = ((res.data as { transactions?: unknown[] } | undefined)?.transactions ??
        []) as Array<Record<string, unknown>>;

      const mappedAll = list.map((t) =>
        mapPosTransactionToRecentOrder(t, unitLabel)
      );

      const total = mappedAll.reduce((sum, o) => sum + (o.total || 0), 0);
      setTodaySalesCount(mappedAll.length);
      setTodaySalesTotal(total);

      setRecentOrders(mappedAll.slice(0, 20));
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "Erro ao carregar vendas do PDV.";
      setLoadError(msg);
      toast.error(msg);
      setRecentOrders([]);
      setTodaySalesCount(0);
      setTodaySalesTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProperties();
  }, []);

  useEffect(() => {
    if (!selectedPropertyId) return;
    void loadTodaySales(selectedPropertyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPropertyId]);

  const ticketAvg = todaySalesCount > 0 ? todaySalesTotal / todaySalesCount : 0;

  const statusConfig = {
    pending: { label: "Pendente", cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    completed: { label: "Concluído", cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    cancelled: { label: "Cancelado", cls: "bg-red-500/10 text-red-500 border-red-500/20" },
  } as const;

  const goToPos = () => navigate("/pos-terminal");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-primary" />
              Dashboard PDV
            </h1>
            <p className="text-muted-foreground text-sm">
              Visão rápida das vendas e instruções para atendimento no balcão.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={selectedPropertyId ? String(selectedPropertyId) : ""}
              onValueChange={(v) => setSelectedPropertyId(Number(v))}
              disabled={properties.length === 0}
            >
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Selecione a propriedade" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="gradient" className="gap-2" onClick={goToPos} disabled={!selectedPropertyId}>
              Abrir PDV
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pedidos hoje</span>
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                  {todaySalesCount}
                </Badge>
              </div>
              <div className="text-3xl font-bold text-foreground">{todaySalesCount}</div>
              <p className="text-xs text-muted-foreground">Somente vendas concluídas do PDV</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Receita hoje</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-bold text-foreground">
                R$ {todaySalesTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Baseado nas transações com “POS Terminal”</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ticket médio</span>
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">
                R$ {ticketAvg.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {todaySalesCount > 0 ? "Média das vendas de hoje" : "Sem vendas hoje ainda"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                <p className="font-semibold">Instruções do PDV</p>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>1. Abra o PDV e selecione os produtos.</p>
                <p>2. Ajuste a quantidade no carrinho.</p>
                <p>3. Escolha a forma de pagamento (Conta / Pix / Cartões / Dinheiro).</p>
                <p>4. Confirme na maquininha:</p>
                <div className="ml-4 space-y-1">
                  <p>• Pix: aguarde aprovação na central (Gerencianet/EFI).</p>
                  <p>• Cartão: informe o código da transação e confirme.</p>
                </div>
                <p>5. Ao concluir, o estoque e o financeiro são lançados automaticamente.</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Status do dia</p>
                <Progress value={todaySalesCount > 0 ? 80 : 10} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Propriedade: {currentProperty?.name || "-"}
                </p>
              </div>

              {loadError ? (
                <div className="text-sm text-destructive">
                  {loadError}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary" />
                  <p className="font-semibold">Últimas vendas (PDV)</p>
                </div>
                <Badge variant="outline">{recentOrders.length} exibidos</Badge>
              </div>

              <ScrollArea className="h-[420px] pr-2">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Carregando...
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="p-6 text-sm text-muted-foreground">
                    Nenhuma venda do PDV encontrada para hoje.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => {
                      const sc = statusConfig[order.status];
                      return (
                        <div
                          key={order.id}
                          className={cn(
                            "flex items-start justify-between gap-4 p-3 rounded-xl border",
                            "bg-card/50 border-border/50 hover:bg-card/70 transition-colors"
                          )}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-3">
                              <p className="font-mono text-sm font-medium text-foreground truncate">
                                {order.transactionNumber}
                              </p>
                              <Badge variant="outline" className={sc.cls}>
                                {sc.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{order.time}</span>
                              {order.items > 0 ? <span>• {order.items} itens</span> : null}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                              <span>{order.unit ? `${unitLabel}: ${order.unit}` : "Sem unidade"}</span>
                              <span>{order.guest ? `Hóspede: ${order.guest}` : "Sem hóspede"}</span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-sm text-muted-foreground">Total</div>
                            <div className="font-semibold text-foreground">
                              R$ {order.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

