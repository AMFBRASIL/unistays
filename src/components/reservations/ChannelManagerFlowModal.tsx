import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Radio,
  Link2,
  Unlink,
  Wifi,
  WifiOff,
  Shield,
  Calendar,
  Hash,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationId: number | null;
  reservationNumber?: string;
}

type TimelineStatus = "success" | "error" | "skipped" | "pending" | "info";

interface FlowData {
  reservation: {
    id: number;
    reservationNumber: string;
    status: string;
    channel: string | null;
    externalId: string | null;
    unitId: number | null;
    checkIn: string | null;
    checkOut: string | null;
    createdAt: string | null;
    agencyNotes: string | null;
    internalNotes: string | null;
    isFromChannex: boolean;
    overbooking: boolean;
    otaModification: boolean;
  };
  mapping: {
    connected: boolean;
    connectionId: number | null;
    connectionName: string | null;
    roomTypeExternalId: string | null;
    channexPropertyId: string | null;
    mappedUnits: number;
  } | null;
  summary: {
    overall: "ok" | "warning" | "error" | "idle" | "inbound" | "outbound";
    label: string;
    hasErrors: boolean;
    lastSyncAt: string | null;
    eventsCount: number;
  };
  timeline: Array<{
    id: string;
    at: string;
    title: string;
    description: string;
    status: TimelineStatus;
    direction?: "inbound" | "outbound" | "local";
    module?: string;
    action?: string;
    externalRef?: string | null;
    details?: Record<string, unknown> | null;
    errorMessage?: string | null;
  }>;
}

const overallConfig: Record<
  FlowData["summary"]["overall"],
  { label: string; className: string; icon: React.ElementType }
> = {
  ok: {
    label: "Saudável",
    className: "from-emerald-600 to-teal-600",
    icon: CheckCircle2,
  },
  inbound: {
    label: "Inbound OTA",
    className: "from-teal-600 to-cyan-600",
    icon: ArrowDownToLine,
  },
  outbound: {
    label: "Outbound ARI",
    className: "from-violet-600 to-indigo-600",
    icon: ArrowUpFromLine,
  },
  warning: {
    label: "Atenção",
    className: "from-amber-500 to-orange-600",
    icon: AlertTriangle,
  },
  error: {
    label: "Com falhas",
    className: "from-rose-600 to-red-700",
    icon: XCircle,
  },
  idle: {
    label: "Sem integração",
    className: "from-slate-600 to-slate-800",
    icon: Unlink,
  },
};

const statusDot: Record<TimelineStatus, string> = {
  success: "bg-emerald-500 ring-emerald-500/30",
  error: "bg-rose-500 ring-rose-500/30",
  skipped: "bg-slate-400 ring-slate-400/30",
  pending: "bg-amber-500 ring-amber-500/30",
  info: "bg-sky-500 ring-sky-500/30",
};

const statusBadge: Record<TimelineStatus, string> = {
  success: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  error: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  skipped: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  info: "bg-sky-500/10 text-sky-700 border-sky-500/20",
};

function formatWhen(iso: string) {
  try {
    return format(new Date(iso), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
  } catch {
    return iso;
  }
}

export function ChannelManagerFlowModal({
  open,
  onOpenChange,
  reservationId,
  reservationNumber,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FlowData | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!reservationId) return;
    setLoading(true);
    try {
      const res = await api.getReservationChannelFlow(reservationId);
      if (res.success && res.data) {
        setData(res.data as FlowData);
      } else {
        setData(null);
        toast.error(res.error?.message || "Falha ao carregar fluxo Channel Manager");
      }
    } catch {
      setData(null);
      toast.error("Falha ao carregar fluxo Channel Manager");
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    if (open && reservationId) {
      setExpandedId(null);
      void load();
    } else if (!open) {
      setData(null);
    }
  }, [open, reservationId, load]);

  const overall = data?.summary.overall || "idle";
  const OverallIcon = overallConfig[overall].icon;

  const directionHint = useMemo(() => {
    if (!data) return null;
    if (data.reservation.isFromChannex) {
      return "Fluxo principal: OTA → Channex → Unistays (inbound)";
    }
    if (data.mapping?.connected) {
      return "Fluxo principal: Unistays → Channex → OTAs (availability outbound)";
    }
    return "Sem vínculo ativo com Channel Manager";
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] p-0 gap-0 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/30 shrink-0">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-bold text-white">
                  Fluxo Channel Manager
                </DialogTitle>
                <p className="text-sm text-slate-300 mt-0.5 truncate">
                  {reservationNumber || data?.reservation.reservationNumber || "—"} · Channex
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/10"
              disabled={loading}
              onClick={() => void load()}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>

          {data && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                className={cn(
                  "rounded-xl p-3 bg-gradient-to-br text-white shadow-inner",
                  overallConfig[overall].className,
                )}
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80">
                  <OverallIcon className="w-3.5 h-3.5" />
                  Status
                </div>
                <p className="font-semibold mt-1">{overallConfig[overall].label}</p>
                <p className="text-xs opacity-90 mt-0.5 line-clamp-2">{data.summary.label}</p>
              </div>
              <div className="rounded-xl p-3 bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
                  {data.mapping?.connected ? (
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <WifiOff className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  Mapping
                </div>
                <p className="font-semibold mt-1 truncate">
                  {data.mapping
                    ? data.mapping.connectionName || "Channex"
                    : "Não mapeada"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {data.mapping
                    ? `${data.mapping.mappedUnits} unit(s) · RT ${data.mapping.roomTypeExternalId?.slice(0, 8)}…`
                    : "Vincule em Integrações → Channex"}
                </p>
              </div>
              <div className="rounded-xl p-3 bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  Eventos
                </div>
                <p className="font-semibold mt-1">{data.summary.eventsCount}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {data.summary.lastSyncAt
                    ? `Último sync ${formatWhen(data.summary.lastSyncAt)}`
                    : "Sem sync registrado"}
                </p>
              </div>
            </div>
          )}
        </div>

        {loading && !data ? (
          <div className="py-20 flex justify-center items-center gap-2 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
            Montando timelapse…
          </div>
        ) : !data ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            Nenhum dado de fluxo disponível.
          </div>
        ) : (
          <ScrollArea className="max-h-[58vh]">
            <div className="p-6 space-y-6">
              {/* Context strip */}
              <div className="rounded-2xl border bg-card p-4 space-y-3">
                <p className="text-sm text-muted-foreground">{directionHint}</p>
                <div className="flex flex-wrap gap-2">
                  {data.reservation.isFromChannex && (
                    <Badge variant="outline" className="gap-1 border-teal-500/30 text-teal-700">
                      <ArrowDownToLine className="w-3 h-3" />
                      Importada Channex
                    </Badge>
                  )}
                  {!data.reservation.isFromChannex && data.mapping && (
                    <Badge variant="outline" className="gap-1 border-violet-500/30 text-violet-700">
                      <ArrowUpFromLine className="w-3 h-3" />
                      Origem Unistays
                    </Badge>
                  )}
                  {data.reservation.overbooking && (
                    <Badge className="gap-1 bg-rose-600 text-white">
                      <AlertTriangle className="w-3 h-3" />
                      Overbooking
                    </Badge>
                  )}
                  {data.reservation.otaModification && (
                    <Badge className="gap-1 bg-amber-500 text-white">
                      <Shield className="w-3 h-3" />
                      Modificação OTA
                    </Badge>
                  )}
                  {data.reservation.channel && (
                    <Badge variant="secondary" className="gap-1">
                      Canal: {data.reservation.channel}
                    </Badge>
                  )}
                  {data.reservation.externalId && (
                    <Badge variant="outline" className="gap-1 font-mono text-[10px]">
                      <Hash className="w-3 h-3" />
                      {data.reservation.externalId}
                    </Badge>
                  )}
                  {data.reservation.checkIn && data.reservation.checkOut && (
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(data.reservation.checkIn), "dd/MM")} →{" "}
                      {format(new Date(data.reservation.checkOut), "dd/MM")}
                    </Badge>
                  )}
                </div>
                {(data.reservation.agencyNotes || data.reservation.internalNotes) && (
                  <div className="grid gap-2 sm:grid-cols-2 text-xs">
                    {data.reservation.agencyNotes && (
                      <div className="rounded-lg bg-sky-500/5 border border-sky-500/20 p-2 text-sky-900 dark:text-sky-100">
                        <p className="font-medium mb-0.5">Notas de canal</p>
                        <p className="opacity-90 whitespace-pre-wrap">{data.reservation.agencyNotes}</p>
                      </div>
                    )}
                    {data.reservation.internalNotes && (
                      <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-2 text-amber-900 dark:text-amber-100">
                        <p className="font-medium mb-0.5">Notas internas</p>
                        <p className="opacity-90 whitespace-pre-wrap">{data.reservation.internalNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  Timelapse do processo
                </h3>
                <div className="relative pl-2">
                  <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
                  <div className="space-y-0">
                    {data.timeline.map((item, idx) => {
                      const expanded = expandedId === item.id;
                      const DirIcon =
                        item.direction === "inbound"
                          ? ArrowDownToLine
                          : item.direction === "outbound"
                            ? ArrowUpFromLine
                            : item.status === "error"
                              ? XCircle
                              : item.module === "availability" || item.id === "mapping"
                                ? Link2
                                : Info;

                      return (
                        <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
                          <div
                            className={cn(
                              "relative z-10 mt-1.5 w-4 h-4 rounded-full ring-4 shrink-0",
                              statusDot[item.status],
                            )}
                          />
                          <div
                            className={cn(
                              "flex-1 rounded-xl border bg-card p-3 transition-shadow",
                              item.status === "error" && "border-rose-500/30 shadow-sm shadow-rose-500/5",
                              item.status === "success" && "border-emerald-500/20",
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <DirIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <p className="font-medium text-sm">{item.title}</p>
                                  <Badge
                                    variant="outline"
                                    className={cn("text-[10px]", statusBadge[item.status])}
                                  >
                                    {item.status}
                                  </Badge>
                                  {item.direction && item.direction !== "local" && (
                                    <Badge variant="secondary" className="text-[10px]">
                                      {item.direction}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatWhen(item.at)}
                                  {idx === 0 ? " · início" : ""}
                                </p>
                                <p className="text-sm mt-2">{item.description}</p>
                                {item.errorMessage && (
                                  <p className="text-xs text-rose-600 mt-2 flex gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                    {item.errorMessage}
                                  </p>
                                )}
                              </div>
                              {(item.details || item.externalRef) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 shrink-0"
                                  onClick={() =>
                                    setExpandedId(expanded ? null : item.id)
                                  }
                                >
                                  {expanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                            {expanded && (
                              <div className="mt-3 rounded-lg bg-muted/50 p-3 text-xs font-mono overflow-x-auto space-y-1">
                                {item.externalRef && (
                                  <p>
                                    <span className="text-muted-foreground">ref:</span>{" "}
                                    {item.externalRef}
                                  </p>
                                )}
                                {item.module && (
                                  <p>
                                    <span className="text-muted-foreground">module:</span>{" "}
                                    {item.module}/{item.action}
                                  </p>
                                )}
                                {item.details && (
                                  <pre className="whitespace-pre-wrap break-all text-[11px] leading-relaxed">
                                    {JSON.stringify(item.details, null, 2)}
                                  </pre>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-dashed p-4 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground text-sm">Como interpretar</p>
                <p>
                  · <strong>Inbound</strong>: reserva veio da OTA via Channex (feed/webhook + ACK).
                </p>
                <p>
                  · <strong>Outbound</strong>: Unistays empurrou availability/rates para a Channex.
                </p>
                <p>
                  · Eventos com status <strong>error</strong> mostram o ponto exato da falha (mapping,
                  API, overbooking, etc.).
                </p>
              </div>
            </div>
          </ScrollArea>
        )}

        <div className="px-6 py-4 border-t flex justify-end gap-2 bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button
            className="gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
            disabled={loading}
            onClick={() => void load()}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Atualizar fluxo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
