import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  import { ScrollArea } from "@/components/ui/scroll-area";
  import { Separator } from "@/components/ui/separator";
  import { Card, CardContent } from "@/components/ui/card";
  import {
    ShoppingCart,
    Package,
    Truck,
    Building2,
    User,
    Calendar,
    DollarSign,
    MapPin,
    Phone,
    Mail,
    Copy,
    Printer,
    Download,
    CheckCircle2,
    Clock,
    FileText,
    ArrowRight,
    Box,
    CreditCard,
  } from "lucide-react";
  import { cn } from "@/lib/utils";
  import { toast } from "sonner";
  import { api } from "@/lib/api";
  
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
  
  interface ViewOrderModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: PurchaseOrder | null;
  }

  interface PurchaseOrderDetailItem {
    id: string;
    itemName?: string;
    itemSku?: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    total: number;
  }

  interface PurchaseOrderDetail {
    id: string;
    orderNumber?: string;
    supplierName?: string;
    propertyName?: string;
    status?: string;
    totalAmount?: number;
    expectedDeliveryDate?: string | null;
    deliveryNotes?: string | null;
    paymentMethodName?: string | null;
    paymentInstallments?: number | null;
    createdBy?: string | null;
    createdAt?: string;
    items?: PurchaseOrderDetailItem[];
  }

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
    return map[String(apiStatus || "").toLowerCase()] ?? "rascunho";
  }
  
  const orderStatusConfig: Record<OrderStatus, { label: string; color: string; step: number }> = {
    cotacao: { label: "Cotação", color: "bg-slate-500/10 text-slate-600 border-slate-500/20", step: 1 },
    rascunho: { label: "Rascunho", color: "bg-gray-500/10 text-gray-600 border-gray-500/20", step: 2 },
    aguardando_aprovacao: { label: "Aguardando Aprovação", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", step: 3 },
    aprovado: { label: "Aprovado", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", step: 4 },
    em_transito: { label: "Em Trânsito", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", step: 5 },
    recebido: { label: "Recebido", color: "bg-green-500/10 text-green-600 border-green-500/20", step: 6 },
    devolucao_mercadoria: { label: "Devolver Mercadoria", color: "bg-rose-500/10 text-rose-600 border-rose-500/20", step: 7 },
    cancelado: { label: "Cancelado", color: "bg-red-500/10 text-red-600 border-red-500/20", step: 0 },
  };
  
  const statusFlow: OrderStatus[] = ["cotacao", "rascunho", "aguardando_aprovacao", "aprovado", "em_transito", "recebido", "devolucao_mercadoria"];
  
  export function ViewOrderModal({ open, onOpenChange, order }: ViewOrderModalProps) {
    const [detail, setDetail] = useState<PurchaseOrderDetail | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const load = async () => {
        if (!open || !order?.id) return;
        setLoading(true);
        setDetail(null);
        try {
          const res = await api.getPurchaseOrderById(Number(order.id));
          if (res.success && res.data) {
            setDetail(res.data as PurchaseOrderDetail);
          } else {
            setDetail(null);
          }
        } catch {
          toast.error("Erro ao carregar detalhes do pedido.");
          setDetail(null);
        } finally {
          setLoading(false);
        }
      };
      void load();
    }, [open, order?.id]);

    if (!order) return null;

    const statusKey = mapOrderStatus(detail?.status ?? order.status);
    const statusConf = orderStatusConfig[statusKey] ?? orderStatusConfig.rascunho;
    const currentStep = statusConf.step;

    const items = detail?.items ?? [];
    const totalItems = items.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
    const subtotal = items.reduce((acc, item) => acc + Number(item.total || 0), 0);
  
    const handleCopyProtocol = () => {
      navigator.clipboard.writeText(detail?.orderNumber ?? order.protocol);
      toast.success("Protocolo copiado!");
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
  
            <DialogHeader className="relative">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-bold text-white">
                    Detalhes do Pedido
                  </DialogTitle>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-mono text-lg">{detail?.orderNumber ?? order.protocol}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20" onClick={handleCopyProtocol}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Badge className={cn("ml-2", statusConf.color)}>
                      {statusConf.label}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/20">
                    <Printer className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/20">
                    <Download className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </DialogHeader>
  
            {/* Status Timeline */}
            <div className="mt-6 relative">
              <div className="flex items-center justify-between">
                {statusFlow.map((status, index) => {
                  const conf = orderStatusConfig[status];
                  const isCompleted = currentStep > conf.step;
                  const isCurrent = currentStep === conf.step;
                  
                  return (
                    <div key={status} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                          isCompleted && "bg-white text-violet-600",
                          isCurrent && "bg-white/30 ring-2 ring-white",
                          !isCompleted && !isCurrent && "bg-white/10"
                        )}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                        </div>
                        <span className="text-[10px] text-white/70 mt-1 text-center max-w-[60px] leading-tight">
                          {conf.label}
                        </span>
                      </div>
                      {index < statusFlow.length - 1 && (
                        <div className={cn(
                          "flex-1 h-0.5 mx-1",
                          isCompleted ? "bg-white" : "bg-white/20"
                        )} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
  
          {/* Content */}
          <ScrollArea className="flex-1 max-h-[calc(90vh-280px)]">
            <div className="p-6 space-y-6">
              {loading && (
                <div className="text-sm text-muted-foreground">Carregando detalhes do pedido...</div>
              )}
              {/* Info Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-violet-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Fornecedor</p>
                        <p className="font-semibold">{detail?.supplierName ?? order.supplierName}</p>
                        <p className="text-xs text-muted-foreground">{order.supplierCategory}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
  
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Valor Total</p>
                        <p className="font-semibold text-lg">R$ {(detail?.totalAmount ?? order.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
  
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Previsão de Entrega</p>
                        <p className="font-semibold">
                          {detail?.expectedDeliveryDate
                            ? new Date(detail.expectedDeliveryDate).toLocaleDateString("pt-BR")
                            : (order.expectedDelivery !== "-" ? order.expectedDelivery : "A definir")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
  
              {/* Supplier & Delivery Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      Dados do Fornecedor
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CreditCard className="w-4 h-4" />
                        <span>
                          Pagamento: {detail?.paymentMethodName ?? "—"}
                          {detail?.paymentInstallments ? ` · ${detail.paymentInstallments}x` : ""}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
  
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      Entrega
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">{detail?.propertyName ?? (order.propertyNames.join(", ") || "—")}</p>
                      <Separator />
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Observações: </span>
                        {detail?.deliveryNotes || "Sem observações."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
  
              {/* Properties */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    Propriedades Vinculadas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(detail?.propertyName ? [detail.propertyName] : order.propertyNames).map((name, i) => (
                      <Badge key={i} variant="outline" className="px-3 py-1">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
  
              {/* Order Items */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    Itens do Pedido ({totalItems || order.totalItems} itens)
                  </h3>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 p-3 bg-muted/50 text-xs font-medium text-muted-foreground">
                      <div className="col-span-5">Produto</div>
                      <div className="col-span-2 text-center">Qtd</div>
                      <div className="col-span-2 text-right">Preço Unit.</div>
                      <div className="col-span-1 text-center">Desc.</div>
                      <div className="col-span-2 text-right">Subtotal</div>
                    </div>
                    <div className="divide-y divide-border">
                      {items.map((item) => {
                        return (
                          <div key={item.id} className="grid grid-cols-12 gap-2 p-3 text-sm items-center">
                            <div className="col-span-5">
                              <p className="font-medium">{item.itemName ?? "Item"}</p>
                              <p className="text-xs text-muted-foreground">{item.itemSku ?? "—"}</p>
                            </div>
                            <div className="col-span-2 text-center">{item.quantity}</div>
                            <div className="col-span-2 text-right">R$ {item.unitPrice.toFixed(2)}</div>
                            <div className="col-span-1 text-center">
                              {item.discountPercent > 0 ? (
                                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                  {item.discountPercent}%
                                </Badge>
                              ) : "-"}
                            </div>
                            <div className="col-span-2 text-right font-medium">
                              R$ {Number(item.total ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        );
                      })}
                      {items.length === 0 && (
                        <div className="p-4 text-sm text-muted-foreground">Nenhum item encontrado para este pedido.</div>
                      )}
                    </div>
                    <div className="p-3 bg-muted/30 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold text-primary">
                          R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
  
              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Criado por: {detail?.createdBy ?? order.createdBy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Data: {detail?.createdAt ? new Date(detail.createdAt).toLocaleDateString("pt-BR") : order.createdAt}</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
  
          {/* Footer */}
          <div className="border-t p-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  