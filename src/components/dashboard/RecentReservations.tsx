import { cn } from "@/lib/utils";
import { CalendarCheck, MoreHorizontal, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export interface DashboardReservation {
  id: number;
  code: string;
  guestName: string;
  unitNumber: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalAmount: string | number;
  channelName: string;
}

interface RecentReservationsProps {
  data?: DashboardReservation[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Confirmada", className: "bg-blue-500/10 text-blue-600" },
  checked_in: { label: "Check-in", className: "bg-emerald-500/10 text-emerald-600" },
  checked_out: { label: "Check-out", className: "bg-amber-500/10 text-amber-600" },
  pending: { label: "Pendente", className: "bg-secondary text-secondary-foreground" },
  cancelled: { label: "Cancelada", className: "bg-red-500/10 text-red-600" },
};

export function RecentReservations({ data = [] }: RecentReservationsProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const formatCurrency = (val: string | number) => {
    const num = Number(val);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(isNaN(num) ? 0 : num);
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <div className="rounded-xl bg-card border border-border flex flex-col h-full">
      <div className="flex items-center justify-between p-3 sm:p-6 border-b border-border">
        <div>
          <h3 className="text-sm sm:text-lg font-semibold text-foreground">Reservas Recentes</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Últimas atualizações</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs sm:text-sm h-7 sm:h-8"
          onClick={() => navigate('/reservations')}
        >
          Ver todas
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      <div className="divide-y divide-border flex-1 overflow-auto">
        {data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Nenhuma reserva recente encontrada.
          </div>
        ) : (
          data.map((reservation) => {
            const status = statusConfig[reservation.status] || statusConfig.pending;

            return (
              <div
                key={reservation.id}
                className="p-2.5 sm:p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-2 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-[10px] sm:text-xs font-bold text-primary shrink-0">
                    {getInitials(reservation.guestName)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                      <span className="font-medium text-foreground truncate text-xs sm:text-sm" title={reservation.guestName}>
                        {reservation.guestName || 'Hóspede sem nome'}
                      </span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">#{reservation.code || reservation.id}</span>
                    </div>
                    <p className="text-[10px] sm:text-sm text-muted-foreground truncate" title={`${reservation.propertyName} - ${reservation.unitNumber}`}>
                      {reservation.unitNumber} • {reservation.propertyName}
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5 sm:gap-1">
                        <CalendarCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        {formatDate(reservation.checkIn)} → {formatDate(reservation.checkOut)}
                      </span>
                      <span className="px-1 sm:px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground text-[10px] sm:text-xs">
                        {reservation.channelName || 'Direto'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-semibold text-foreground text-xs sm:text-sm">{formatCurrency(reservation.totalAmount)}</p>
                    <span
                      className={cn(
                        "inline-block mt-0.5 sm:mt-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium",
                        status.className
                      )}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}
