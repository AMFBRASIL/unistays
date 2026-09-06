import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  BedDouble,
  Calendar,
  CalendarDays,
  DollarSign,
  ExternalLink,
  Loader2,
  TrendingUp,
  User,
  Users,
  Wallet,
  Sparkles,
  Brush,
  Wrench,
  Clock,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Room } from "@/hooks/useRoomMapData";

interface UnitDashboardModalProps {
  room: Room | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showFullMapLink?: boolean;
}

const statusLabels: Record<string, string> = {
  available: "Disponível",
  occupied: "Ocupado",
  checkout: "Check-out",
  cleaning: "Limpeza",
  arrangement: "Arrumação",
  maintenance: "Manutenção",
  blocked: "Bloqueado",
};

const stayTypeLabels: Record<string, string> = {
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
  longstay: "Long Stay",
  long_stay: "Long Stay",
};

const reservationStatusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmada",
  checked_in: "Hospedado",
  checked_out: "Finalizada",
  cancelled: "Cancelada",
  no_show: "No-show",
};

function isFutureReservation(checkIn?: string) {
  if (!checkIn) return false;
  const dateStr = checkIn.toString().includes("T") ? checkIn.toString().split("T")[0] : checkIn.toString();
  const [y, m, d] = dateStr.split("-").map(Number);
  const checkInDate = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return checkInDate > today;
}
const taskCategoryLabels: Record<string, string> = {
  cleaning: "Limpeza",
  limpeza: "Limpeza",
  maintenance: "Manutenção",
  manutencao: "Manutenção",
  arrangement: "Arrumação",
  arrumacao: "Arrumação",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const dateStr = value.toString().includes("T") ? value.toString().split("T")[0] : value.toString();
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR");
}

function formatDateRange(checkIn?: string, checkOut?: string) {
  return `${formatDate(checkIn)} – ${formatDate(checkOut)}`;
}

export function UnitDashboardModal({ room, open, onOpenChange, showFullMapLink = true }: UnitDashboardModalProps) {
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["unit-dashboard-summary", room?.id],
    queryFn: () => api.getUnitSummary(room!.id),
    enabled: open && !!room?.id,
  });

  const summary = response?.success ? response.data : null;
  const unit = summary?.unit;
  const financial = summary?.financial30d;
  const current = summary?.current;
  const scheduled = summary?.scheduled;
  const insights = summary?.insights;

  const displayedStatus = room?.status || unit?.status || "available";
  const dailyRate = unit?.rates?.daily ?? room?.rates.daily ?? 0;

  const TaskIcon =
    insights?.activeTask?.category === "maintenance" || insights?.activeTask?.category === "manutencao"
      ? Wrench
      : insights?.activeTask?.category === "arrangement" || insights?.activeTask?.category === "arrumacao"
        ? Brush
        : Sparkles;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-4 border-b bg-gradient-to-br from-primary/10 via-background to-purple-500/5">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <BedDouble className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  Unidade {room?.number || unit?.number}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {unit?.propertyName || room?.propertyName} • {unit?.type || room?.type}
                  {unit?.floor != null ? ` • ${unit.floor}º andar` : ""}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Badge variant="outline">{statusLabels[displayedStatus] || displayedStatus}</Badge>
                  {dailyRate > 0 && (
                    <Badge variant="secondary">Diária {formatCurrency(dailyRate)}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-88px)]">
          <div className="p-5 space-y-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Carregando detalhes da unidade...
              </div>
            ) : isError || (response && !response.success) ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-muted-foreground">
                Não foi possível carregar os dados da unidade. Tente novamente em instantes.
              </div>
            ) : (
              <>
                {/* Resumo próximos 12 meses */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border bg-blue-500/5 border-blue-500/20 p-3 text-center">
                    <User className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <p className="text-lg font-bold">{current ? current.guests : 0}</p>
                    <p className="text-[11px] text-muted-foreground">Alocados agora</p>
                  </div>
                  <div className="rounded-xl border bg-purple-500/5 border-purple-500/20 p-3 text-center">
                    <CalendarDays className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                    <p className="text-lg font-bold">{scheduled?.count ?? 0}</p>
                    <p className="text-[11px] text-muted-foreground">Reservas (12 meses)</p>
                  </div>
                  <div className="rounded-xl border bg-emerald-500/5 border-emerald-500/20 p-3 text-center">
                    <DollarSign className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                    <p className="text-base sm:text-lg font-bold">{formatCurrency(scheduled?.totalRevenue ?? 0)}</p>
                    <p className="text-[11px] text-muted-foreground">Receita prevista</p>
                  </div>
                  <div className="rounded-xl border bg-amber-500/5 border-amber-500/20 p-3 text-center">
                    <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <p className="text-base sm:text-lg font-bold text-amber-600">
                      {formatCurrency(scheduled?.pendingToReceive ?? 0)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">A receber</p>
                  </div>
                </div>

                {/* Valores a receber por mês */}
                {scheduled?.byMonth?.length ? (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-amber-500" />
                      Valores a receber — próximos 12 meses
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {scheduled.byMonth.map((month) => (
                        <div
                          key={month.month}
                          className="rounded-lg border bg-muted/30 px-3 py-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-muted-foreground">{month.label}</span>
                            <Badge variant="secondary" className="text-[9px] h-4 px-1">
                              {month.count} res.
                            </Badge>
                          </div>
                          <p className="text-sm font-bold text-amber-600 mt-1">
                            {formatCurrency(month.pending)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Total {formatCurrency(month.revenue)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                        Já recebido: {formatCurrency(scheduled.alreadyPaid ?? 0)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                        <Users className="w-3 h-3" />
                        {scheduled.totalGuests ?? 0} hóspedes agendados
                      </span>
                    </div>
                  </div>
                ) : null}

                {/* Próximas reservas — até 12 meses */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    Próximas reservas (até 12 meses)
                  </h4>
                  {!scheduled?.reservations?.length ? (
                    <p className="text-sm text-muted-foreground rounded-xl border border-dashed p-4 text-center">
                      Nenhuma reserva nos próximos 12 meses para esta unidade.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {scheduled.reservations.map((res) => {
                        const isFuture = isFutureReservation(res.checkIn);
                        return (
                          <div
                            key={res.id}
                            className="flex items-center justify-between gap-3 rounded-xl border p-3 hover:bg-muted/30 transition-colors"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                  {res.reservationNumber}
                                </span>
                                <Badge variant="secondary" className="text-[10px]">
                                  {reservationStatusLabels[res.status] || res.status}
                                </Badge>
                                {isFuture && (
                                  <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-600">
                                    Agendada
                                  </Badge>
                                )}
                              </div>
                              <p className="font-medium text-sm truncate mt-1">{res.guestName}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDateRange(res.checkIn, res.checkOut)} • {res.guests}{" "}
                                {res.guests === 1 ? "pessoa" : "pessoas"}
                                {res.channel ? ` • ${res.channel}` : ""}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold">{formatCurrency(res.totalAmount)}</p>
                              {res.pendingAmount > 0 ? (
                                <p className="text-[10px] text-amber-600 font-medium">
                                  A receber {formatCurrency(res.pendingAmount)}
                                </p>
                              ) : (
                                <p className="text-[10px] text-emerald-600">Quitado</p>
                              )}
                              {res.paidAmount > 0 && res.pendingAmount > 0 && (
                                <p className="text-[10px] text-muted-foreground">
                                  Pago {formatCurrency(res.paidAmount)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Hóspede atual */}
                {current && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        Hóspede alocado
                      </h4>
                      {current.stayType && (
                        <Badge variant="outline" className="text-[10px]">
                          {stayTypeLabels[current.stayType] || current.stayType}
                        </Badge>
                      )}
                    </div>
                    <p className="font-semibold text-foreground">{current.guestName}</p>
                    {current.guestPhone && (
                      <p className="text-sm text-muted-foreground">{current.guestPhone}</p>
                    )}
                    <div className="grid sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-primary/10 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Período</p>
                        <p className="font-medium">{formatDateRange(current.checkIn, current.checkOut)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Pessoas</p>
                        <p className="font-medium">{current.guests}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Valor / pago</p>
                        <p className="font-medium">
                          {formatCurrency(current.totalAmount)}
                          {current.paidAmount > 0 && (
                            <span className="text-emerald-600 text-xs ml-1">
                              ({formatCurrency(current.paidAmount)} pago)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Financeiro 30 dias */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Histórico — últimos 30 dias
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border p-3">
                      <p className="text-[11px] text-muted-foreground">Receita</p>
                      <p className="text-base font-bold text-foreground">{formatCurrency(financial?.revenue ?? 0)}</p>
                    </div>
                    <div className="rounded-xl border p-3">
                      <p className="text-[11px] text-muted-foreground">Recebido</p>
                      <p className="text-base font-bold text-emerald-600">{formatCurrency(financial?.collected ?? 0)}</p>
                    </div>
                    <div className="rounded-xl border p-3">
                      <p className="text-[11px] text-muted-foreground">A receber</p>
                      <p className="text-base font-bold text-amber-600">{formatCurrency(financial?.pending ?? 0)}</p>
                    </div>
                    <div className="rounded-xl border p-3">
                      <p className="text-[11px] text-muted-foreground">Diária média</p>
                      <p className="text-base font-bold">{formatCurrency(financial?.avgDailyRate ?? 0)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                      <Wallet className="w-3 h-3" />
                      {financial?.reservationsCount ?? 0} reservas
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                      <Calendar className="w-3 h-3" />
                      {financial?.occupiedNights ?? 0} noites ocupadas
                    </span>
                    {insights?.topChannel && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                        Canal: {insights.topChannel} ({formatCurrency(insights.topChannelRevenue)})
                      </span>
                    )}
                  </div>
                </div>

                {/* Tarefa ativa */}
                {insights?.activeTask && (
                  <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 flex items-center gap-3">
                    <TaskIcon className="w-5 h-5 text-orange-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">
                        {taskCategoryLabels[insights.activeTask.category] || insights.activeTask.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {insights.activeTask.status === "in_progress" ? "Em andamento" : "Pendente"}
                        {insights.activeTask.scheduledDate
                          ? ` • ${formatDate(insights.activeTask.scheduledDate)}`
                          : ""}
                      </p>
                    </div>
                  </div>
                )}

                {/* Histórico recente */}
                {summary?.recentReservations?.length ? (
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Movimentação recente (30 dias)</h4>
                    <div className="space-y-2">
                      {summary.recentReservations.map((res) => (
                        <div
                          key={res.id}
                          className={cn(
                            "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm",
                            "bg-muted/40"
                          )}
                        >
                          <div className="min-w-0">
                            <p className="font-medium truncate">{res.guestName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateRange(res.checkIn, res.checkOut)}
                              {res.channel ? ` • ${res.channel}` : ""}
                            </p>
                          </div>
                          <span className="font-semibold shrink-0">{formatCurrency(res.totalAmount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </ScrollArea>

        {showFullMapLink && (
          <div className="p-4 border-t bg-muted/30 flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <Link to="/rooms" onClick={() => onOpenChange(false)}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir mapa completo
              </Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
