import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSearch,
  ClipboardCheck,
  Truck,
  PackageCheck,
  XCircle,
  MessageSquare,
  Calendar,
  Copy,
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

interface EditOrderStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PurchaseOrder | null;
  onSuccess?: () => void;
}

const statusFlow: { status: OrderStatus; label: string; icon: typeof FileSearch; color: string; description: string }[] = [
  { status: "cotacao", label: "Cotação", icon: FileSearch, color: "from-slate-500 to-gray-600", description: "Solicitação de cotação enviada ao fornecedor" },
  { status: "rascunho", label: "Rascunho", icon: FileText, color: "from-gray-500 to-slate-600", description: "Pedido em elaboração, ainda não enviado" },
  { status: "aguardando_aprovacao", label: "Aguardando Aprovação", icon: Clock, color: "from-amber-500 to-orange-600", description: "Pedido aguardando aprovação do gestor" },
  { status: "aprovado", label: "Aprovado", icon: ClipboardCheck, color: "from-emerald-500 to-green-600", description: "Pedido aprovado e enviado ao fornecedor" },
  { status: "em_transito", label: "Em Trânsito", icon: Truck, color: "from-blue-500 to-indigo-600", description: "Mercadoria em transporte" },
  { status: "recebido", label: "Recebido", icon: PackageCheck, color: "from-green-500 to-emerald-600", description: "Mercadoria recebida e conferida" },
  { status: "devolucao_mercadoria", label: "Devolver Mercadoria", icon: ArrowRight, color: "from-rose-500 to-red-600", description: "Mercadoria devolvida ao fornecedor após recebimento" },
];

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

export function EditOrderStatusModal({ open, onOpenChange, order, onSuccess }: EditOrderStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [notes, setNotes] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [returnReasonModalOpen, setReturnReasonModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedStatus(null);
      setNotes("");
      setReturnReason("");
      setReturnReasonModalOpen(false);
      setIsSuccess(false);
      setSaving(false);
    }
  }, [open, order?.id]);

  if (!order) return null;

  const currentStatusConfig = orderStatusConfig[order.status];
  const currentStep = currentStatusConfig.step;

  const persistStatusChange = async () => {
    if (!selectedStatus) return;

    setSaving(true);
    try {
      const finalNotes = selectedStatus === "devolucao_mercadoria"
        ? [
            returnReason.trim() ? `Motivo da devolução: ${returnReason.trim()}` : null,
            notes.trim() || null,
          ]
            .filter(Boolean)
            .join("\n")
        : (notes.trim() || "");

      const response = await api.updatePurchaseOrderStatus(Number(order.id), {
        status: selectedStatus,
        notes: finalNotes || null,
      });

      if (!response.success) {
        toast.error(response.error?.message || "Erro ao atualizar status.");
        return;
      }

      setIsSuccess(true);
      setReturnReasonModalOpen(false);
      toast.success("Status atualizado com sucesso!", {
        description: `Pedido ${order.protocol} alterado para "${orderStatusConfig[selectedStatus].label}"`,
      });
      onSuccess?.();
    } catch {
      toast.error("Erro ao atualizar status do pedido.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedStatus) return;
    if (selectedStatus === "devolucao_mercadoria" && !returnReason.trim()) {
      setReturnReasonModalOpen(true);
      return;
    }
    await persistStatusChange();
  };

  const handleClose = () => {
    setSelectedStatus(null);
    setNotes("");
    setReturnReason("");
    setReturnReasonModalOpen(false);
    setIsSuccess(false);
    setSaving(false);
    onOpenChange(false);
  };

  const handleCopyProtocol = () => {
    navigator.clipboard.writeText(order.protocol);
    toast.success("Protocolo copiado!");
  };

  const canAdvanceTo = (targetStep: number) => {
    // Pode avançar para o próximo passo ou voltar para qualquer passo anterior
    return targetStep <= currentStep + 1;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <DialogHeader className="relative">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-white">
                  {isSuccess ? "Status Atualizado!" : "Alterar Status do Pedido"}
                </DialogTitle>
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-mono text-lg">{order.protocol}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20" onClick={handleCopyProtocol}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {isSuccess ? (
              /* Success State */
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 mb-6 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Status Alterado com Sucesso</h3>
                <p className="text-muted-foreground mb-4">
                  O pedido foi atualizado para: <strong>{selectedStatus && orderStatusConfig[selectedStatus].label}</strong>
                </p>
                {notes && (
                  <Card className="mt-4 text-left">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Observação registrada:</p>
                          <p className="text-sm text-muted-foreground">{notes}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              /* Status Selection */
              <div className="space-y-6">
                {/* Current Status */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border">
                  <div className="text-sm text-muted-foreground">Status Atual:</div>
                  <Badge className={cn("text-sm px-3 py-1", currentStatusConfig.color)}>
                    {currentStatusConfig.label}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  {selectedStatus ? (
                    <Badge className={cn("text-sm px-3 py-1", orderStatusConfig[selectedStatus].color)}>
                      {orderStatusConfig[selectedStatus].label}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Selecione o novo status</span>
                  )}
                </div>

                {/* Status Options */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Selecione o novo status:</Label>
                  <div className="grid gap-3">
                    {statusFlow.map((item, index) => {
                      const Icon = item.icon;
                      const isCurrentStatus = order.status === item.status;
                      const isReturn = item.status === "devolucao_mercadoria";
                      const canSelect = !isCurrentStatus && (
                        isReturn
                          ? currentStep >= 6 // só depois de recebido
                          : canAdvanceTo(index + 1)
                      );
                      const isSelected = selectedStatus === item.status;
                      const isPast = (index + 1) < currentStep;
                      
                      return (
                        <button
                          key={item.status}
                          type="button"
                          disabled={!canSelect}
                          onClick={() => setSelectedStatus(item.status)}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                            isSelected && "border-primary bg-primary/5 ring-2 ring-primary/20",
                            isCurrentStatus && "border-primary/50 bg-primary/10 opacity-70",
                            !canSelect && !isCurrentStatus && "opacity-40 cursor-not-allowed",
                            canSelect && !isSelected && "border-border hover:border-primary/50 hover:bg-accent/50 cursor-pointer"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white flex-shrink-0",
                            item.color,
                            (!canSelect && !isCurrentStatus) && "opacity-50"
                          )}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{item.label}</span>
                              {isCurrentStatus && (
                                <Badge variant="outline" className="text-xs">Atual</Badge>
                              )}
                              {isPast && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}

                    {/* Cancel Option */}
                    <button
                      type="button"
                      disabled={currentStep > 4}
                      onClick={() => setSelectedStatus("cancelado")}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                        selectedStatus === "cancelado" && "border-red-500 bg-red-500/5 ring-2 ring-red-500/20",
                        selectedStatus !== "cancelado" && "border-border hover:border-red-500/50 hover:bg-red-500/5",
                        currentStep <= 4 ? "cursor-pointer" : "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white flex-shrink-0">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-red-600">Cancelar Pedido</span>
                        <p className="text-sm text-muted-foreground">
                          {currentStep <= 4
                            ? "Permitido até a etapa Aprovado"
                            : "Não permitido após a etapa Aprovado"}
                        </p>
                      </div>
                      {selectedStatus === "cancelado" && (
                        <CheckCircle2 className="w-6 h-6 text-red-500 flex-shrink-0" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Notes */}
                {selectedStatus && (
                  <div className="space-y-2">
                    <Label>Observações (opcional)</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Adicione uma observação sobre esta alteração de status..."
                      className="min-h-[80px]"
                    />
                  </div>
                )}

                {/* Warning for cancel */}
                {selectedStatus === "cancelado" && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-600">Atenção</p>
                      <p className="text-sm text-muted-foreground">
                        O cancelamento do pedido é uma ação irreversível. O fornecedor será notificado automaticamente.
                      </p>
                    </div>
                  </div>
                )}

                {/* Warning for return reason */}
                {selectedStatus === "devolucao_mercadoria" && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-rose-600">Motivo obrigatório</p>
                      <p className="text-sm text-muted-foreground">
                        Ao salvar, será aberto um modal para informar o motivo da devolução.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            {isSuccess ? "Fechar" : "Cancelar"}
          </Button>
          {!isSuccess && (
            <Button
              onClick={handleStatusChange}
              disabled={!selectedStatus || saving}
              className={cn(
                selectedStatus === "cancelado" 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              )}
            >
              {saving
                ? "Salvando..."
                : selectedStatus === "cancelado"
                  ? "Confirmar Cancelamento"
                  : "Salvar Alteração"}
            </Button>
          )}
        </div>
      </DialogContent>
      </Dialog>

      <Dialog open={returnReasonModalOpen} onOpenChange={setReturnReasonModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Motivo da devolução</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Informe o motivo (obrigatório)</Label>
            <Textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Ex.: produto avariado, quantidade divergente, item incorreto..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Esse motivo será registrado no histórico do pedido.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setReturnReasonModalOpen(false)}
              disabled={saving}
            >
              Voltar
            </Button>
            <Button
              onClick={persistStatusChange}
              disabled={!returnReason.trim() || saving}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {saving ? "Salvando..." : "Confirmar Devolução"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
