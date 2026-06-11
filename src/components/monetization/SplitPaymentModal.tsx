import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  DollarSign,
  CreditCard,
  Split,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  Mail,
  Phone,
  Percent
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SplitPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount?: number;
  onConfirm?: (payers: Payer[]) => void;
  initialPayers?: Payer[];
  bookingDetails?: {
    unitName: string;
    checkIn: string;
    checkOut: string;
    protocol: string;
    nights: number;
  };
}

interface Payer {
  id: number;
  name: string;
  email: string;
  percentage: number;
  amount: number;
  paid: boolean;
}

export default function SplitPaymentModal({ open, onOpenChange, totalAmount = 0, onConfirm, initialPayers, bookingDetails }: SplitPaymentModalProps) {
  const { toast } = useToast();
  const safeTotal = Number(totalAmount) || 0;
  const [payers, setPayers] = useState<Payer[]>(initialPayers || [
    { id: 1, name: "Principal", email: "", percentage: 100, amount: safeTotal, paid: false },
  ]);

  // Sync payers with initialPayers when modal opens or totalAmount changes (if not edited locally yet)
  useEffect(() => {
    if (open) {
      if (initialPayers && initialPayers.length > 0) {
        setPayers(initialPayers);
      } else {
        setPayers([{ id: 1, name: "Principal", email: "", percentage: 100, amount: safeTotal, paid: false }]);
      }
    }
  }, [open, safeTotal, initialPayers]);

  const addPayer = () => {
    const newId = Math.max(0, ...payers.map(p => p.id)) + 1;
    setPayers([...payers, {
      id: newId,
      name: "",
      email: "",
      percentage: 0,
      amount: 0,
      paid: false
    }]);
  };

  const removePayer = (id: number) => {
    if (payers.length > 1) {
      setPayers(payers.filter(p => p.id !== id));
    }
  };

  const updatePayer = (id: number, field: keyof Payer, value: string | number) => {
    setPayers(payers.map(p => {
      if (p.id === id) {
        const updated = { ...p, [field]: value };
        if (field === 'percentage') {
          updated.amount = (safeTotal * (Number(value) / 100));
        }
        return updated;
      }
      return p;
    }));
  };

  const handleConfirm = () => {
    if (totalPercentage !== 100) {
      toast({
        title: "Erro na Divisão",
        description: "A soma das porcentagens deve ser 100%.",
        variant: "destructive"
      });
      return;
    }
    onConfirm?.(payers);
    onOpenChange(false);
    toast({
      title: "Divisão Confirmada",
      description: "Os detalhes do pagamento foram atualizados.",
    });
  };

  const handleDistributeEqually = () => {
    const equalPercentage = 100 / payers.length;
    const equalAmount = safeTotal / payers.length;
    setPayers(payers.map(p => ({
      ...p,
      percentage: Number(equalPercentage.toFixed(2)),
      amount: equalAmount
    })));
  };

  const totalPercentage = payers.reduce((acc, p) => acc + p.percentage, 0);
  const totalPaid = payers.filter(p => p.paid).reduce((acc, p) => acc + p.amount, 0);
  const pendingAmount = safeTotal - totalPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-background border-border">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Split className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl text-foreground">Split de Pagamento</DialogTitle>
              <p className="text-sm text-muted-foreground">Divida a conta entre hóspedes automaticamente</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-6 space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-muted/50 border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <DollarSign className="h-4 w-4" />
                    Valor Total
                  </div>
                  <p className="text-2xl font-bold text-foreground">R$ {(Number(safeTotal) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50 border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Users className="h-4 w-4" />
                    Participantes
                  </div>
                  <p className="text-2xl font-bold text-primary">{payers.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50 border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Pago
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">R$ {(totalPaid ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50 border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Clock className="h-4 w-4" />
                    Pendente
                  </div>
                  <p className="text-2xl font-bold text-amber-600">R$ {(pendingAmount ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </CardContent>
              </Card>
            </div>

            {/* Booking Info */}
            <Card className="bg-muted/50 border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Reserva</p>
                    <p className="font-medium text-foreground">{bookingDetails?.unitName || "Unidade"} - {bookingDetails?.nights || 1} noites</p>
                    <p className="text-sm text-muted-foreground">Check-in: {bookingDetails?.checkIn || "-"} • Check-out: {bookingDetails?.checkOut || "-"}</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {bookingDetails?.protocol || "NOVO"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Payers List */}
            <Card className="bg-muted/50 border-border">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  Divisão do Pagamento
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleDistributeEqually}>
                    <Percent className="h-4 w-4 mr-2" />
                    Dividir Igual
                  </Button>
                  <Button size="sm" onClick={addPayer}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {payers.map((payer) => (
                  <div key={payer.id} className={`p-4 rounded-lg border ${payer.paid ? 'bg-emerald-50 border-emerald-200' : 'bg-muted/30 border-border'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm">Nome</Label>
                        <Input
                          value={payer.name}
                          onChange={(e) => updatePayer(payer.id, 'name', e.target.value)}
                          placeholder="Nome do pagador"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm">E-mail</Label>
                        <Input
                          value={payer.email}
                          onChange={(e) => updatePayer(payer.id, 'email', e.target.value)}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm">Porcentagem</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            value={payer.percentage}
                            onChange={(e) => updatePayer(payer.id, 'percentage', Number(e.target.value))}
                            className="pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm">Valor</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={`R$ ${payer.amount.toFixed(2)}`}
                            readOnly
                            className="bg-muted/50 text-emerald-600 font-medium"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        {payer.paid ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Pago
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                        {payers.length > 2 && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removePayer(payer.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Percentage Validation */}
                {totalPercentage !== 100 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-sm text-amber-700">
                      Total: {totalPercentage}% - {totalPercentage < 100 ? 'Faltam' : 'Excede'} {Math.abs(100 - totalPercentage)}%
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Enviar por E-mail
              </Button>
              <Button variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Enviar por WhatsApp
              </Button>
              <Button onClick={handleConfirm} disabled={totalPercentage !== 100}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmar Divisão
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}