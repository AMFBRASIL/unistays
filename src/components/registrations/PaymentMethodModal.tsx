import { useState, useEffect } from "react";
import type { FC } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  Banknote,
  QrCode,
  Landmark,
  Receipt,
  Wallet,
  Check,
  Sparkles,
  Percent,
  Clock,
  Calendar,
  Settings2,
  Loader2,
  CheckCircle2,
  ListFilter,
  LayoutGrid,
} from "lucide-react";

// ... inside render ...

import { api } from "@/lib/api";
import { toast } from "sonner";

// ... existing imports

/** Mapeia tipo do backend (credit, debit, transfer) para id do modal (credit_card, debit_card, bank_transfer) */
function backendTypeToModal(backendType: string): string {
  const map: Record<string, string> = {
    credit: "credit_card",
    debit: "debit_card",
    transfer: "bank_transfer",
  };
  return map[backendType] ?? backendType;
}

/** Mapeia id do modal para tipo do backend */
function modalTypeToBackend(modalType: string): string {
  const map: Record<string, string> = {
    credit_card: "credit",
    debit_card: "debit",
    bank_transfer: "transfer",
  };
  return map[modalType] ?? modalType;
}

interface PaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSuccess?: () => void;
}

const paymentTypes = [
  { id: "credit_card", icon: CreditCard, label: "Cartão de Crédito", color: "from-blue-500 to-blue-600" },
  { id: "debit_card", icon: CreditCard, label: "Cartão de Débito", color: "from-emerald-500 to-emerald-600" },
  { id: "pix", icon: QrCode, label: "PIX", color: "from-cyan-500 to-cyan-600" },
  { id: "cash", icon: Banknote, label: "Dinheiro", color: "from-green-500 to-green-600" },
  { id: "bank_transfer", icon: Landmark, label: "Transferência", color: "from-violet-500 to-violet-600" },
  { id: "check", icon: Receipt, label: "Cheque", color: "from-indigo-500 to-indigo-600" },
  { id: "invoice", icon: Receipt, label: "Faturado", color: "from-amber-500 to-amber-600" },
  { id: "voucher", icon: Wallet, label: "Voucher", color: "from-pink-500 to-pink-600" },
];
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400";

export function PaymentMethodModal({ open, onOpenChange, initialData, onSuccess }: PaymentMethodModalProps): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: initialData ? backendTypeToModal(initialData.type) : "",
    name: initialData?.name || "",
    code: initialData?.code || "",
    description: initialData?.description || "",
    fee: initialData?.fee?.toString() || "",
    feeType: initialData?.feeType || "percent",
    installments: initialData?.maxInstallments?.toString() || "1",
    daysToReceive: initialData?.daysToReceive?.toString() || "1",
    minValue: initialData?.minValue?.toString() || "",
    maxValue: initialData?.maxValue?.toString() || "",
    requiresAuthorization: !!initialData?.requiresAuthorization,
    generateReceipt: initialData?.generateReceipt !== false,
    isActive: initialData?.isActive !== false,
    details: initialData?.details || {} as any,
  });

  const isEdit = !!initialData?.id;
  const hasIdentity = !!formData.type && !!formData.name.trim();
  const hasRules = !!formData.fee || !!formData.installments || !!formData.daysToReceive;
  const hasSettings = formData.isActive || formData.generateReceipt || formData.requiresAuthorization;
  const progressValue = hasIdentity ? (hasRules ? (hasSettings ? 100 : 66) : 33) : 15;
  const steps = [
    { key: "identity", title: "Identidade", subtitle: "Tipo e dados básicos", done: hasIdentity, icon: CreditCard },
    { key: "rules", title: "Regras", subtitle: "Taxas e condições", done: hasRules, icon: ListFilter },
    { key: "publish", title: "Publicação", subtitle: "Configurações finais", done: hasSettings, icon: LayoutGrid },
  ];

  // Sync state when initialData changes while open (though key prop handles most cases)
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          type: backendTypeToModal(initialData.type) || "",
          name: initialData.name || "",
          code: initialData.code || "",
          description: initialData.description || "",
          fee: initialData.fee?.toString() || "0",
          feeType: initialData.feeType || "percent",
          installments: initialData.maxInstallments?.toString() || "1",
          daysToReceive: (initialData.daysToReceive ?? 1).toString(),
          minValue: initialData.minValue?.toString() || "",
          maxValue: initialData.maxValue?.toString() || "",
          requiresAuthorization: !!initialData.requiresAuthorization,
          generateReceipt: initialData.generateReceipt !== false,
          isActive: initialData.isActive !== false,
          details: initialData.details || {},
        });
      } else {
        setFormData({
          type: "",
          name: "",
          code: "",
          description: "",
          fee: "",
          feeType: "percent",
          installments: "1",
          daysToReceive: "1",
          minValue: "",
          maxValue: "",
          requiresAuthorization: false,
          generateReceipt: true,
          isActive: true,
          details: {},
        });
      }
    }
  }, [open, initialData]);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setFormData({
        type: "",
        name: "",
        code: "",
        description: "",
        fee: "",
        feeType: "percent",
        installments: "1",
        daysToReceive: "1",
        minValue: "",
        maxValue: "",
        requiresAuthorization: false,
        generateReceipt: true,
        isActive: true,
        details: {},
      });
    }, 300);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) {
      toast.error("Por favor, preencha os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        type: modalTypeToBackend(formData.type),
        fee: parseFloat(formData.fee) || 0,
        maxInstallments: parseInt(formData.installments) || 1,
        daysToReceive: parseInt(formData.daysToReceive) || 0,
        minValue: formData.minValue ? parseFloat(formData.minValue) : null,
        maxValue: formData.maxValue ? parseFloat(formData.maxValue) : null,
      };

      const response = isEdit
        ? await api.updatePaymentMethod(initialData.id, payload)
        : await api.createPaymentMethod(payload);

      if (response.success) {
        toast.success(isEdit ? "Forma de Pagamento Atualizada" : "Forma de Pagamento Criada", {
          description: `${formData.name} foi ${isEdit ? 'atualizada' : 'cadastrada'} com sucesso!`,
        });
        onSuccess?.();
        handleClose();
      } else {
        toast.error(isEdit ? "Erro ao atualizar" : "Erro ao criar", {
          description: response.error?.message
        });
      }
    } catch (error) {
      toast.error("Erro ao processar solicitação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 gap-0 overflow-hidden">
        <div className="h-full min-h-0 grid md:grid-cols-[300px_1fr]">
          <aside className="hidden md:flex flex-col border-r border-border/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
            <div className="relative p-5 border-b border-white/10">
              <div className="absolute inset-0 opacity-25 bg-cover bg-center" style={{ backgroundImage: `url(${PLACEHOLDER_IMAGE})` }} />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/70 to-slate-950/80" />
              <div className="relative">
                <p className="text-xs uppercase tracking-wider text-amber-200/90">Payments Wizard</p>
                <h3 className="mt-1 text-lg font-semibold">Fluxo robusto</h3>
                <p className="text-xs text-slate-300 mt-1">Criação inteligente de forma de pagamento.</p>
              </div>
            </div>
            <div className="p-5 border-b border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                <span>Progresso do fluxo</span>
                <span>{progressValue}%</span>
              </div>
              <Progress value={progressValue} className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-orange-500" />
            </div>
            <div className="p-4 space-y-2">
              {steps.map((s, i) => (
                <div key={s.key} className={`rounded-xl border px-3 py-3 ${s.done ? "border-amber-400/30 bg-amber-500/10" : "border-white/10 bg-white/5"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.done ? "bg-amber-400/20 text-amber-300" : "bg-white/10 text-slate-300"}`}>
                      {s.done ? <CheckCircle2 className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{`${i + 1}. ${s.title}`}</p>
                      <p className="text-xs text-slate-300">{s.subtitle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
          <div className="min-h-0 flex flex-col">
        {/* Header */}
        <div className="relative px-6 py-5 border-b bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-amber-500">
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
            </svg>
          </div>

          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            <CreditCard className="h-24 w-24 text-amber-500" />
          </div>

          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-amber-500 to-orange-500">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {isEdit ? "Editar Forma de Pagamento" : "Nova Forma de Pagamento"}
                </DialogTitle>
                <p className="text-sm font-normal text-amber-600">
                  {isEdit ? `Editando configurações de ${initialData.name}` : "Configure um novo método de pagamento"}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 min-h-0 h-full">
          <div className="p-6 space-y-6">
            {/* Payment Type Selection */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Wallet className="h-5 w-5 text-amber-400" />
                Tipo de Pagamento
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {paymentTypes.map((t) => {
                  const isSelected = formData.type?.toLowerCase() === t.id.toLowerCase();
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, type: t.id, name: t.label }));
                      }}
                      className={`p-4 rounded-xl border-2 transition-all relative ${isSelected
                        ? "border-amber-500 bg-amber-500/10 shadow-sm"
                        : "border-border hover:border-amber-300 bg-card"
                        }`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${t.color} flex items-center justify-center mx-auto mb-3`}>
                        <t.icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="font-medium text-foreground text-center text-sm">{t.label}</p>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-amber-500 rounded-full p-0.5">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Forma de Pagamento</Label>
                <Input
                  id="name"
                  placeholder="Ex: Cartão Visa"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  placeholder="Ex: CC-VISA"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  className="bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Observações sobre esta forma de pagamento..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-background min-h-[80px]"
              />
            </div>

            {/* Type Specific Details */}
            {formData.type === "pix" && (
              <div className="p-5 rounded-2xl border bg-cyan-500/5 border-cyan-500/20 space-y-4">
                <Label className="text-lg font-semibold text-cyan-700 flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Detalhes do PIX
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Chave</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={formData.details.pixKeyType || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, details: { ...prev.details, pixKeyType: e.target.value } }))}
                    >
                      <option value="">Selecione...</option>
                      <option value="cpf_cnpj">CPF/CNPJ</option>
                      <option value="email">E-mail</option>
                      <option value="phone">Telefone</option>
                      <option value="random">Chave Aleatória</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Chave PIX</Label>
                    <Input
                      placeholder="Sua chave aqui"
                      value={formData.details.pixKey || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, details: { ...prev.details, pixKey: e.target.value } }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.type === "bank_transfer" && (
              <div className="p-5 rounded-2xl border bg-violet-500/5 border-violet-500/20 space-y-4">
                <Label className="text-lg font-semibold text-violet-700 flex items-center gap-2">
                  <Landmark className="h-5 w-5" />
                  Dados Bancários para Transferência
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Banco</Label>
                    <Input
                      placeholder="Nome do Banco"
                      value={formData.details.bankName || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, details: { ...prev.details, bankName: e.target.value } }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Agência</Label>
                    <Input
                      placeholder="0001"
                      value={formData.details.bankAgency || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, details: { ...prev.details, bankAgency: e.target.value } }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Conta</Label>
                    <Input
                      placeholder="12345-6"
                      value={formData.details.bankAccount || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, details: { ...prev.details, bankAccount: e.target.value } }))}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Titular da Conta</Label>
                    <Input
                      placeholder="Nome completo ou Razão Social"
                      value={formData.details.bankHolder || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, details: { ...prev.details, bankHolder: e.target.value } }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF/CNPJ do Titular</Label>
                    <Input
                      placeholder="000.000.000-00"
                      value={formData.details.bankDoc || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, details: { ...prev.details, bankDoc: e.target.value } }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {(formData.type === "credit_card" || formData.type === "debit_card") && (
              <div className="p-5 rounded-2xl border bg-blue-500/5 border-blue-500/20 space-y-4">
                <Label className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Configuração de Maquineta/Gateway
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome da Maquininha/Gateway</Label>
                    <Input
                      placeholder="Ex: Stone, PagSeguro, Cielo..."
                      value={formData.details.providerName || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, details: { ...prev.details, providerName: e.target.value } }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ID do Terminal (Opcional)</Label>
                    <Input
                      placeholder="Identificador da máquina"
                      value={formData.details.terminalId || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, details: { ...prev.details, terminalId: e.target.value } }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {!["pix", "bank_transfer", "credit_card", "debit_card"].includes(formData.type) && formData.type && (
              <div className="p-5 rounded-2xl border bg-slate-500/5 border-slate-500/20 space-y-4">
                <Label className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Informações Adicionais
                </Label>
                <div className="space-y-2">
                  <Label>Instruções/Detalhes Internos</Label>
                  <Textarea
                    placeholder="Informações específicas para este método..."
                    value={formData.details.additionalInfo || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, details: { ...prev.details, additionalInfo: e.target.value } }))}
                  />
                </div>
              </div>
            )}

            {/* Fees and Terms */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
              <Label className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Percent className="h-5 w-5 text-blue-400" />
                Taxas e Condições
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fee">Taxa (%)</Label>
                  <Input
                    id="fee"
                    placeholder="Ex: 2.5"
                    value={formData.fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, fee: e.target.value }))}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="installments" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    Máx. Parcelas
                  </Label>
                  <Input
                    id="installments"
                    type="number"
                    min="1"
                    max="24"
                    value={formData.installments}
                    onChange={(e) => setFormData(prev => ({ ...prev, installments: e.target.value }))}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daysToReceive" className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    Dias p/ Receber
                  </Label>
                  <Input
                    id="daysToReceive"
                    type="number"
                    min="0"
                    value={formData.daysToReceive}
                    onChange={(e) => setFormData(prev => ({ ...prev, daysToReceive: e.target.value }))}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minValue">Valor Mínimo (R$)</Label>
                  <Input
                    id="minValue"
                    placeholder="0,00"
                    value={formData.minValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, minValue: e.target.value }))}
                    className="bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-violet-400" />
                Configurações
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border bg-gradient-to-r from-violet-500/5 to-purple-500/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Requer Autorização</p>
                      <p className="text-xs text-muted-foreground">Necessita aprovação do gerente</p>
                    </div>
                    <Switch
                      checked={formData.requiresAuthorization}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresAuthorization: checked }))}
                    />
                  </div>
                </div>
                <div className="p-5 rounded-2xl border bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Gerar Recibo</p>
                      <p className="text-xs text-muted-foreground">Emitir comprovante</p>
                    </div>
                    <Switch
                      checked={formData.generateReceipt}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, generateReceipt: checked }))}
                    />
                  </div>
                </div>
                <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Ativo</p>
                      <p className="text-xs text-muted-foreground">Disponível para uso</p>
                    </div>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-amber-500/5 to-orange-500/5">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                Resumo
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-card border">
                  <p className="text-lg font-bold text-foreground truncate">{formData.name || "-"}</p>
                  <p className="text-xs text-muted-foreground">Nome</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-card border">
                  <p className="text-lg font-bold text-foreground">{formData.fee || "0"}%</p>
                  <p className="text-xs text-muted-foreground">Taxa</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-card border">
                  <p className="text-lg font-bold text-foreground">{formData.installments}x</p>
                  <p className="text-xs text-muted-foreground">Parcelas</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-card border">
                  <Badge className={formData.isActive ? "bg-emerald-500" : "bg-red-500"}>
                    {formData.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Status</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/30">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
            {loading ? (isEdit ? "Salvando..." : "Criando...") : (isEdit ? "Salvar Alterações" : "Criar Forma de Pagamento")}
          </Button>
        </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
