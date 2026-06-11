import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Banknote, Loader2, User, Search, CreditCard, FileText, Wallet, ArrowDownRight, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface ReservationPaymentData {
  id: number;
  reservationNumber?: string;
  totalAmount: number;
  paidAmount: number;
  commissionAmount?: number;
  guestId?: number;
  guestName?: string;
}

interface CompletePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: ReservationPaymentData | null;
  onSuccess?: () => void;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

/** Formata número como máscara Real: "R$ 10.008,11" */
const formatBRLMask = (val: number) =>
  "R$ " + (val ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Extrai valor numérico a partir da string com máscara BRL (R$ 10.008,11 ou dígitos) */
const parseBRLMask = (raw: string): number => {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.length === 0) return 0;
  const value = parseInt(digits, 10) / 100;
  return Math.max(0, value);
};

export function CompletePaymentModal({ open, onOpenChange, reservation, onSuccess }: CompletePaymentModalProps) {
  const [amountToPay, setAmountToPay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payerGuestId, setPayerGuestId] = useState<number | null>(null);
  const [payerName, setPayerName] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [guestSearch, setGuestSearch] = useState("");
  const [guestSearchResults, setGuestSearchResults] = useState<any[]>([]);
  const [isSearchingGuests, setIsSearchingGuests] = useState(false);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [cardComprovante, setCardComprovante] = useState("");
  const [cardBrand, setCardBrand] = useState("");
  const [cardTransactionId, setCardTransactionId] = useState("");
  const [cardAuthCode, setCardAuthCode] = useState("");
  const [cardMachineId, setCardMachineId] = useState("");

  const total = Number(reservation?.totalAmount ?? 0);
  const paid = Number(reservation?.paidAmount ?? 0);
  const commission = Number(reservation?.commissionAmount ?? 0) || 0;
  const remaining = Math.max(0, total - paid - commission);

  const { data: paymentMethodsData } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => api.getPaymentMethods(),
    enabled: open,
  });
  const paymentMethods = (paymentMethodsData?.data as any)?.paymentMethods ?? [];
  const selectedPaymentMethodName = paymentMethodId ? (paymentMethods.find((m: any) => String(m.id) === paymentMethodId)?.name ?? "").toLowerCase() : "";
  const isCreditCard = /cart[aã]o\s*(de\s*)?cr[eé]dito|credito|cr[eé]dito|credit\s*card/i.test(selectedPaymentMethodName);

  useEffect(() => {
    if (open && reservation) {
      setPayerGuestId(reservation.guestId ?? null);
      setPayerName(reservation.guestName ?? "Hóspede da reserva");
      setPaymentNotes("");
    }
  }, [open, reservation?.guestId, reservation?.guestName]);

  useEffect(() => {
    if (open && remaining > 0) {
      setAmountToPay(formatBRLMask(remaining));
    } else if (!open) {
      setAmountToPay("");
      setGuestSearch("");
      setGuestSearchResults([]);
      setShowGuestDropdown(false);
      setCardComprovante("");
      setCardBrand("");
      setCardTransactionId("");
      setCardAuthCode("");
      setCardMachineId("");
    }
  }, [open, remaining]);

  const searchGuests = useCallback(async (term: string) => {
    if (!term || term.length < 2) {
      setGuestSearchResults([]);
      return;
    }
    setIsSearchingGuests(true);
    try {
      const res = await api.getGuests(term);
      const raw = (res.data as any)?.guests ?? (Array.isArray(res.data) ? res.data : []);
      const list = (raw as any[]).map((g: any) => ({
        id: g.id,
        name: (g.name ?? `${g.firstName ?? ""} ${g.lastName ?? ""}`.trim()) || "Sem nome",
        email: g.email ?? "",
        phone: g.phone ?? "",
      }));
      setGuestSearchResults(list);
    } catch {
      setGuestSearchResults([]);
    } finally {
      setIsSearchingGuests(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (guestSearch.trim().length >= 2) {
        searchGuests(guestSearch.trim());
        setShowGuestDropdown(true);
      } else {
        setGuestSearchResults([]);
        if (!guestSearch.trim()) setShowGuestDropdown(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [guestSearch, searchGuests]);

  const selectPayer = (guest: { id: number; name: string }) => {
    setPayerGuestId(guest.id);
    setPayerName(guest.name);
    setGuestSearch(guest.name);
    setShowGuestDropdown(false);
  };

  const clearPayer = () => {
    setPayerGuestId(reservation?.guestId ?? null);
    setPayerName(reservation?.guestName ?? "Hóspede da reserva");
    setGuestSearch("");
    setGuestSearchResults([]);
    setShowGuestDropdown(false);
  };

  const parseAmount = (raw: string): number => parseBRLMask(raw);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
    const value = raw.length === 0 ? 0 : parseInt(raw, 10) / 100;
    setAmountToPay(formatBRLMask(value));
  };

  const handleSubmit = async () => {
    if (!reservation) return;
    const value = parseAmount(amountToPay);
    if (value <= 0) {
      toast.error("Informe o valor a registrar.");
      return;
    }
    const newPaid = Math.min(total, paid + value);
    const paymentMethodName = paymentMethods.find((m: any) => String(m.id) === paymentMethodId)?.name ?? (paymentMethodId ? "" : undefined);
    let notes = paymentNotes.trim()
      ? (payerName && payerName !== (reservation.guestName ?? "Hóspede da reserva")
        ? `Pago por: ${payerName}. ${paymentNotes.trim()}`
        : paymentNotes.trim())
      : (payerName && payerName !== (reservation.guestName ?? "Hóspede da reserva")
        ? `Pago por: ${payerName}`
        : undefined);
    if (isCreditCard && cardComprovante.trim()) {
      notes = notes ? `${notes} Comprovante: ${cardComprovante.trim()}.` : `Comprovante: ${cardComprovante.trim()}.`;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        paidAmount: newPaid,
        paymentStatus: newPaid >= total ? "paid" : "partial",
      };
      if (paymentMethodName) payload.paymentMethod = paymentMethodName;
      if (notes) payload.paymentNotes = notes;
      if (isCreditCard) {
        if (cardBrand.trim()) payload.cardBrand = cardBrand.trim();
        if (cardTransactionId.trim()) payload.cardTransactionId = cardTransactionId.trim();
        if (cardAuthCode.trim()) payload.cardAuthCode = cardAuthCode.trim();
        if (cardMachineId.trim()) payload.cardMachineId = cardMachineId.trim();
      }

      const res = await api.updateReservation(reservation.id, payload);
      if (res.success) {
        toast.success("Pagamento registrado com sucesso.");
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error(res.error?.message ?? "Não foi possível registrar o pagamento.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao registrar pagamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!reservation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-0 shadow-2xl rounded-2xl">
        <DialogTitle className="sr-only">Completar pagamento da reserva</DialogTitle>

        {/* Header ilustrativo */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-slate-900 via-emerald-900/40 to-slate-900 px-8 pt-8 pb-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),transparent)]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative flex items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
                <Wallet className="h-10 w-10 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Completar pagamento</h2>
                <p className="text-slate-300 mt-1 text-sm">
                  Reserva <span className="font-mono font-medium text-emerald-300">{reservation.reservationNumber ?? `#${reservation.id}`}</span>
                </p>
                <p className="text-slate-900 bg-white/95 rounded-lg px-3 py-1.5 text-sm mt-0.5 inline-block">Registre o valor recebido, quem está pagando e a forma de pagamento.</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <ArrowDownRight className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-medium text-slate-200">Pagamento parcial</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-muted/30">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Coluna esquerda: Resumo financeiro (card ilustrativo) */}
            <div className="lg:col-span-1">
              <div className="sticky top-0 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 shadow-xl border border-slate-700/50 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <Banknote className="h-5 w-5 text-emerald-300" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Resumo financeiro</span>
                  </div>
                  <div className="space-y-4 font-mono tabular-nums text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Valor total</span>
                      <span className="font-bold text-lg text-white">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-y border-white/10">
                      <span className="text-slate-400">− Pago</span>
                      <span className="text-emerald-400 font-semibold">{formatCurrency(paid)}</span>
                    </div>
                    {commission > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">− Comissão</span>
                        <span className="text-amber-400 font-medium">{formatCurrency(commission)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t-2 border-emerald-500/30">
                      <span className="text-slate-300 font-medium">Restante a pagar</span>
                      <span className="text-xl font-bold text-emerald-400">{formatCurrency(remaining)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna direita: Formulário */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quem está pagando */}
              <div className="rounded-2xl bg-background border border-border shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-blue-500/10">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Quem está pagando</h3>
                    <p className="text-xs text-muted-foreground">Busque o hóspede ou use o da reserva</p>
                  </div>
                </div>
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Buscar hóspede por nome..."
                        value={guestSearch || payerName}
                        onChange={(e) => setGuestSearch(e.target.value)}
                        onFocus={() => guestSearchResults.length > 0 && setShowGuestDropdown(true)}
                        onBlur={() => setTimeout(() => setShowGuestDropdown(false), 200)}
                        className="pl-9 h-11"
                      />
                      {showGuestDropdown && guestSearchResults.length > 0 && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-2 border rounded-xl bg-popover shadow-xl max-h-52 overflow-auto">
                          {isSearchingGuests && (
                            <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
                            </div>
                          )}
                          {!isSearchingGuests &&
                            guestSearchResults.map((g) => (
                              <button
                                key={g.id}
                                type="button"
                                className={cn(
                                  "w-full px-4 py-3 text-left text-sm hover:bg-accent flex items-center gap-3 transition-colors first:rounded-t-xl last:rounded-b-xl",
                                  payerGuestId === g.id && "bg-accent"
                                )}
                                onClick={() => selectPayer(g)}
                              >
                                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="font-medium block truncate">{g.name}</span>
                                  {g.email && <span className="text-muted-foreground text-xs truncate block">{g.email}</span>}
                                </div>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                    <Button type="button" variant="outline" size="icon" className="h-11 w-11 shrink-0" onClick={clearPayer} title="Usar hóspede da reserva">
                      <User className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Forma de pagamento + Valor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div className="rounded-2xl bg-background border border-border shadow-sm p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-violet-500/10">
                      <CreditCard className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Forma de pagamento</h3>
                      <p className="text-xs text-muted-foreground">Como o cliente está pagando</p>
                    </div>
                  </div>
                  <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                    <SelectTrigger id="payment-method" className="h-11">
                      <SelectValue placeholder="Selecione a forma" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((m: any) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-2xl bg-background border border-border shadow-sm p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10">
                      <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Valor a registrar (R$)</h3>
                      <p className="text-xs text-muted-foreground">Valor que está sendo pago agora</p>
                    </div>
                  </div>
                  <Input
                    id="amount"
                    type="text"
                    inputMode="numeric"
                    placeholder="R$ 0,00"
                    value={amountToPay}
                    onChange={handleAmountChange}
                    className="font-mono tabular-nums text-lg h-11"
                  />
                </div>
              </div>

              {/* Dados do Cartão de Crédito - exibido quando forma de pagamento for cartão de crédito */}
              {isCreditCard && (
                <div className="rounded-2xl bg-background border border-border shadow-sm p-5 sm:p-6 border-violet-200 dark:border-violet-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-violet-500/10">
                      <CreditCard className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Dados do Cartão de Crédito</h3>
                      <p className="text-xs text-muted-foreground">Informações da transação no cartão</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="card-comprovante">Número do comprovante</Label>
                      <Input
                        id="card-comprovante"
                        placeholder="Ex.: 123456789"
                        value={cardComprovante}
                        onChange={(e) => setCardComprovante(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-brand">Bandeira</Label>
                      <Select value={cardBrand} onValueChange={setCardBrand}>
                        <SelectTrigger id="card-brand" className="h-11">
                          <SelectValue placeholder="Selecione a bandeira" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Visa">Visa</SelectItem>
                          <SelectItem value="Mastercard">Mastercard</SelectItem>
                          <SelectItem value="Elo">Elo</SelectItem>
                          <SelectItem value="Amex">Amex</SelectItem>
                          <SelectItem value="Hipercard">Hipercard</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-transaction">ID Transação / NSU</Label>
                      <Input
                        id="card-transaction"
                        placeholder="NSU da transação"
                        value={cardTransactionId}
                        onChange={(e) => setCardTransactionId(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-auth">Cód. Autorização</Label>
                      <Input
                        id="card-auth"
                        placeholder="Código de autorização"
                        value={cardAuthCode}
                        onChange={(e) => setCardAuthCode(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-machine">ID da Máquina / Terminal</Label>
                      <Input
                        id="card-machine"
                        placeholder="ID do terminal"
                        value={cardMachineId}
                        onChange={(e) => setCardMachineId(e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Observações */}
              <div className="rounded-2xl bg-background border border-border shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/10">
                    <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Observações (opcional)</h3>
                    <p className="text-xs text-muted-foreground">Ex.: parcela 2/3, referência PIX</p>
                  </div>
                </div>
                <Textarea
                  id="payment-notes"
                  placeholder="Ex.: parcela 2/3, referência do PIX..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer com CTA */}
        <div className="shrink-0 px-6 sm:px-8 py-4 bg-background border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-b-2xl">
          <p className="text-xs text-muted-foreground sm:max-w-xs">
            Ao registrar o total restante, o status da reserva passará automaticamente para &quot;Pago&quot;.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="min-w-[100px]">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 min-w-[180px] bg-emerald-600 hover:bg-emerald-700">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {isSubmitting ? "Registrando…" : "Registrar pagamento"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
