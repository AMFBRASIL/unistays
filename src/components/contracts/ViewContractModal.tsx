import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase,
  Building2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileText,
  Percent,
  BedDouble,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  TrendingUp,
  BarChart3,
  Edit,
  Printer,
  Download,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Contract {
  id: string;
  company: string;
  logo?: string;
  cnpj: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  discount: number;
  validFrom: string;
  validTo: string;
  status: "active" | "expiring" | "expired" | "pending";
  roomNightsUsed: number;
  roomNightsLimit: number;
  totalRevenue: number;
  lastBooking: string;
}

interface ViewContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
  onEdit?: () => void;
}

const statusConfig = {
  active: { label: "Ativo", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2, gradient: "from-emerald-500 to-green-500" },
  expiring: { label: "Expirando", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: AlertCircle, gradient: "from-amber-500 to-orange-500" },
  expired: { label: "Expirado", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: AlertCircle, gradient: "from-red-500 to-pink-500" },
  pending: { label: "Pendente", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Clock, gradient: "from-blue-500 to-indigo-500" },
};

export function ViewContractModal({ open, onOpenChange, contract, onEdit }: ViewContractModalProps) {
  if (!contract) return null;

  const status = statusConfig[contract.status];
  const StatusIcon = status.icon;
  const usagePercent = (contract.roomNightsUsed / contract.roomNightsLimit) * 100;
  const daysRemaining = Math.ceil((new Date(contract.validTo).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className={cn(
          "p-6 pb-4 bg-gradient-to-r text-white relative overflow-hidden flex-shrink-0",
          status.gradient
        )}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 border-4 border-white rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 border-4 border-white rounded-full" />
            <Briefcase className="absolute top-6 right-20 w-8 h-8" />
            <Building2 className="absolute bottom-6 right-12 w-6 h-6" />
            <FileText className="absolute top-12 right-8 w-5 h-5" />
          </div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                {contract.company.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  {contract.company}
                </DialogTitle>
                <p className="text-white/80 mt-1">{contract.cnpj}</p>
                <Badge className={cn("mt-2 bg-white/20 border-white/30 text-white")}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="gap-1 bg-white/20 hover:bg-white/30 text-white border-0">
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
              <Button size="sm" variant="secondary" className="gap-1 bg-white/20 hover:bg-white/30 text-white border-0">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 overflow-y-auto" style={{ maxHeight: "calc(90vh - 240px)" }}>
          <div className="p-6 pb-10 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Percent className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-500">{contract.discount}%</p>
                    <p className="text-xs text-muted-foreground">Desconto</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-500">R$ {(contract.totalRevenue / 1000).toFixed(0)}k</p>
                    <p className="text-xs text-muted-foreground">Receita Total</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <BedDouble className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-500">{contract.roomNightsUsed}</p>
                    <p className="text-xs text-muted-foreground">Room Nights</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-500">{daysRemaining > 0 ? daysRemaining : 0}</p>
                    <p className="text-xs text-muted-foreground">Dias Restantes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Progress */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-slate-500/5 to-slate-500/10 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Utilização do Contrato</h3>
                </div>
                <span className="text-sm text-muted-foreground">
                  {contract.roomNightsUsed} de {contract.roomNightsLimit} room nights
                </span>
              </div>
              <Progress 
                value={usagePercent} 
                className={cn(
                  "h-3",
                  usagePercent > 90 && "[&>div]:bg-red-500",
                  usagePercent > 75 && usagePercent <= 90 && "[&>div]:bg-amber-500"
                )}
              />
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-muted-foreground">Utilizado: {usagePercent.toFixed(1)}%</span>
                <span className="text-muted-foreground">Disponível: {contract.roomNightsLimit - contract.roomNightsUsed} noites</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-blue-700 dark:text-blue-400">Contato</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Responsável</p>
                      <p className="font-medium">{contract.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{contract.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Telefone</p>
                      <p className="font-medium">{contract.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Endereço</p>
                      <p className="font-medium">{contract.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contract Details */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-purple-700 dark:text-purple-400">Detalhes do Contrato</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Vigência</p>
                      <p className="font-medium">
                        {new Date(contract.validFrom).toLocaleDateString('pt-BR')} até {new Date(contract.validTo).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <Percent className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Desconto Negociado</p>
                      <p className="font-medium">{contract.discount}% sobre tarifa balcão</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <BedDouble className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Limite Room Nights</p>
                      <p className="font-medium">{contract.roomNightsLimit} noites/ano</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <History className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Última Reserva</p>
                      <p className="font-medium">{contract.lastBooking !== "-" ? new Date(contract.lastBooking).toLocaleDateString('pt-BR') : "Nenhuma"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">Resumo Financeiro</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-background/50">
                  <p className="text-2xl font-bold text-emerald-500">R$ {(contract.totalRevenue / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-muted-foreground mt-1">Receita Gerada</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-background/50">
                  <p className="text-2xl font-bold text-blue-500">R$ {((contract.totalRevenue / contract.roomNightsUsed) || 0).toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Ticket Médio/Noite</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-background/50">
                  <p className="text-2xl font-bold text-purple-500">{contract.roomNightsUsed}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total de Reservas</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30 flex justify-between items-center flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button 
            onClick={() => {
              onOpenChange(false);
              onEdit?.();
            }}
            className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            <Edit className="w-4 h-4" />
            Editar Contrato
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
