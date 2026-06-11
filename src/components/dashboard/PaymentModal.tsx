import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Search,
  Wallet,
  Banknote,
  QrCode,
  Receipt,
  CheckCircle2,
  User,
  BedDouble,
  Calendar,
  ChevronRight,
  DollarSign,
  Building2,
  Smartphone,
  Clock,
  AlertCircle,
  Copy,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 1 | 2 | 3;
type PaymentMethod = "credit" | "debit" | "pix" | "cash" | "transfer";

const pendingPayments = [
  {
    id: "PAY001",
    guest: "Carlos Mendes",
    room: "Suite Master 501",
    type: "Hospedagem",
    amount: 2250,
    dueDate: "2024-12-17",
  },
  {
    id: "PAY002",
    guest: "Ana Paula Silva",
    room: "Quarto Luxo 305",
    type: "Consumo - Frigobar",
    amount: 185,
    dueDate: "2024-12-17",
  },
  {
    id: "PAY003",
    guest: "Roberto Almeida",
    room: "Apartamento 202",
    type: "Hospedagem",
    amount: 3200,
    dueDate: "2024-12-18",
  },
  {
    id: "PAY004",
    guest: "Maria Santos",
    room: "Quarto Standard 102",
    type: "Room Service",
    amount: 120,
    dueDate: "2024-12-17",
  },
];

const paymentMethods = [
  { id: "credit", label: "Cartão Crédito", icon: CreditCard, color: "from-blue-500 to-indigo-500" },
  { id: "debit", label: "Cartão Débito", icon: CreditCard, color: "from-emerald-500 to-teal-500" },
  { id: "pix", label: "PIX", icon: QrCode, color: "from-cyan-500 to-blue-500" },
  { id: "cash", label: "Dinheiro", icon: Banknote, color: "from-green-500 to-emerald-500" },
  { id: "transfer", label: "Transferência", icon: Building2, color: "from-purple-500 to-pink-500" },
];

export function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<typeof pendingPayments[0] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [observations, setObservations] = useState("");

  const filteredPayments = pendingPayments.filter(
    (p) =>
      p.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPending = pendingPayments.reduce((acc, p) => acc + p.amount, 0);

  const handleNext = () => {
    if (step < 3) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleComplete = () => {
    onOpenChange(false);
    resetModal();
  };

  const resetModal = () => {
    setStep(1);
    setSelectedPayment(null);
    setSearchTerm("");
    setPaymentMethod("credit");
    setPaymentAmount("");
    setObservations("");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetModal();
    }}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-0 flex-shrink-0">
          <div className="relative bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 p-6 rounded-t-lg overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">Central de Pagamentos</DialogTitle>
                <DialogDescription className="text-white/80 mt-1">Registre pagamentos de forma rápida e segura</DialogDescription>
              </div>
            </div>
            {/* Stats */}
            <div className="flex items-center gap-4 mt-4">
              <div className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                <p className="text-xs text-white/70">Pendentes Hoje</p>
                <p className="text-lg font-bold text-white">{pendingPayments.length}</p>
              </div>
              <div className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                <p className="text-xs text-white/70">Total Pendente</p>
                <p className="text-lg font-bold text-white">R$ {totalPending.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-6 pb-24">
            {/* Step 1: Select Payment */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                    <Receipt className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Selecionar Cobrança</h3>
                  <p className="text-muted-foreground">Escolha a cobrança que deseja registrar o pagamento</p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por hóspede, código ou quarto..."
                    className="pl-10 h-12"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Cobranças Pendentes ({filteredPayments.length})</h4>
                  {filteredPayments.map((payment) => (
                    <div
                      key={payment.id}
                      onClick={() => {
                        setSelectedPayment(payment);
                        setPaymentAmount(payment.amount.toString());
                      }}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all",
                        selectedPayment?.id === payment.id
                          ? "border-purple-500 bg-purple-500/5"
                          : "border-border hover:border-purple-500/50"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                            <DollarSign className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{payment.guest}</h4>
                              <Badge variant="outline">{payment.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{payment.room}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Vence: {payment.dueDate}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">#{payment.id}</p>
                          <p className="text-xl font-bold text-purple-600">
                            R$ {payment.amount.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && selectedPayment && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-violet-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Forma de Pagamento</h3>
                  <p className="text-muted-foreground">Selecione como o pagamento será realizado</p>
                </div>

                {/* Selected Payment Summary */}
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-semibold">{selectedPayment.guest}</p>
                        <p className="text-sm text-muted-foreground">{selectedPayment.type}</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold">R$ {selectedPayment.amount.toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all text-center",
                        paymentMethod === method.id
                          ? "border-purple-500 bg-purple-500/5"
                          : "border-border hover:border-purple-500/50"
                      )}
                    >
                      <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br mx-auto mb-2 flex items-center justify-center", method.color)}>
                        <method.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm font-medium">{method.label}</p>
                    </div>
                  ))}
                </div>

                {/* PIX QR Code */}
                {paymentMethod === "pix" && (
                  <div className="p-6 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-center">
                    <div className="bg-white p-4 rounded-xl mx-auto mb-4 inline-block border">
                      <QRCodeSVG 
                        value={`00020126580014BR.GOV.BCB.PIX0136${crypto.randomUUID()}5204000053039865802BR5925UNI STAYS HOTELARIA LTDA6009SAO PAULO62070503***6304`}
                        size={160}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <p className="font-semibold mb-2">QR Code PIX</p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg max-w-[200px] truncate">
                        00020126580014br.gov.bcb.pix...
                      </code>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText("00020126580014BR.GOV.BCB.PIX0136abc123");
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Amount Input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Valor do Pagamento</Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">R$</span>
                      <Input
                        type="text"
                        className="pl-10 h-12 text-lg font-bold"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Observações</Label>
                    <Textarea
                      placeholder="Observações do pagamento..."
                      className="mt-2 resize-none"
                      rows={2}
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && selectedPayment && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-600">Pagamento Registrado!</h3>
                  <p className="text-muted-foreground">Comprovante gerado com sucesso</p>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20">
                  <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground">Protocolo</p>
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-2xl font-mono font-bold">PAG-20241217-{Math.random().toString(36).substring(2, 6).toUpperCase()}</p>
                      <Button variant="ghost" size="icon">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-white dark:bg-slate-900 text-center">
                      <User className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                      <p className="text-xs text-muted-foreground">Hóspede</p>
                      <p className="font-semibold truncate">{selectedPayment.guest}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white dark:bg-slate-900 text-center">
                      <BedDouble className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                      <p className="text-xs text-muted-foreground">Quarto</p>
                      <p className="font-semibold truncate">{selectedPayment.room}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white dark:bg-slate-900 text-center">
                      <CreditCard className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-xs text-muted-foreground">Forma</p>
                      <p className="font-semibold">{paymentMethods.find(m => m.id === paymentMethod)?.label}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white dark:bg-slate-900 text-center">
                      <DollarSign className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                      <p className="text-xs text-muted-foreground">Valor</p>
                      <p className="font-bold text-emerald-600">R$ {parseFloat(paymentAmount || "0").toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Baixar Comprovante
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Smartphone className="w-4 h-4" />
                    Enviar por WhatsApp
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between flex-shrink-0 bg-background">
          <Button
            variant="outline"
            onClick={step === 1 ? () => onOpenChange(false) : handleBack}
          >
            {step === 1 ? "Cancelar" : "Voltar"}
          </Button>
          <div className="flex items-center gap-2">
            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={step === 1 && !selectedPayment}
                className="gap-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600"
              >
                {step === 2 ? "Confirmar Pagamento" : "Continuar"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                <CheckCircle2 className="w-4 h-4" />
                Finalizar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
