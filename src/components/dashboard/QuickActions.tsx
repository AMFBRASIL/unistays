import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  UserPlus, 
  CalendarPlus, 
  CreditCard, 
  MessageSquare, 
  FileText, 
  Settings2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CheckInModal } from "./CheckInModal";
import { PaymentModal } from "./PaymentModal";
import { MessageModal } from "./MessageModal";
import { ReportModal } from "./ReportModal";
import { NewReservationModal } from "@/components/reservations/NewReservationModal";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  action: string;
}

const actions: QuickAction[] = [
  { id: "1", label: "Check-in", icon: UserPlus, color: "text-success", action: "checkin" },
  { id: "2", label: "Nova Reserva", icon: CalendarPlus, color: "text-primary", action: "reservation" },
  { id: "3", label: "Pagamento", icon: CreditCard, color: "text-accent", action: "payment" },
  { id: "4", label: "Mensagem", icon: MessageSquare, color: "text-warning", action: "message" },
  { id: "5", label: "Relatório", icon: FileText, color: "text-muted-foreground", action: "report" },
  { id: "6", label: "Ajustes", icon: Settings2, color: "text-muted-foreground", action: "settings" },
];

export function QuickActions() {
  const navigate = useNavigate();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const handleAction = (action: string) => {
    switch (action) {
      case "checkin":
        setCheckInOpen(true);
        break;
      case "reservation":
        setReservationOpen(true);
        break;
      case "payment":
        setPaymentOpen(true);
        break;
      case "message":
        setMessageOpen(true);
        break;
      case "report":
        setReportOpen(true);
        break;
      case "settings":
        navigate("/settings");
        break;
    }
  };

  return (
    <>
      <div className="rounded-xl bg-card border border-border p-3 sm:p-6">
        <h3 className="text-sm sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.action)}
              className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/50 hover:bg-secondary transition-all duration-200 hover:scale-105 group"
            >
              <div className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors",
                "bg-background group-hover:bg-primary/10"
              )}>
                <action.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", action.color, "group-hover:text-primary transition-colors")} />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <CheckInModal open={checkInOpen} onOpenChange={setCheckInOpen} />
      <NewReservationModal open={reservationOpen} onOpenChange={setReservationOpen} />
      <PaymentModal open={paymentOpen} onOpenChange={setPaymentOpen} />
      <MessageModal open={messageOpen} onOpenChange={setMessageOpen} />
      <ReportModal open={reportOpen} onOpenChange={setReportOpen} />
    </>
  );
}
