import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    CalendarDays,
    User,
    FileText,
    CheckCircle2,
    Clock,
    Building2,
    Globe,
    Briefcase,
    Home,
    AlertCircle,
    Banknote,
    CalendarCheck,
    CalendarX,
    History,
    Sparkles,
    Accessibility,
    Dog,
    Cigarette,
    Eye,
    ArrowUpFromLine,
    Printer,
    Percent,
    Ban,
    Send,
    Radio,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ReservationSummaryModal } from "./ReservationSummaryModal";
import { SendReservationChannelsModal } from "./SendReservationChannelsModal";
import { CompletePaymentModal } from "./CompletePaymentModal";
import { ChannelManagerFlowModal } from "./ChannelManagerFlowModal";
import { printHtmlDocument } from "@/lib/printHtml";
import { toast } from "sonner";

interface ReservationDetailsModalProps {
    reservationId: string | number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: () => void;
    onCheckIn?: () => void;
    onCheckOut?: () => void;
    onCancel?: () => void;
}

export function ReservationDetailsModal({ reservationId, open, onOpenChange, onEdit, onCheckIn, onCheckOut, onCancel }: ReservationDetailsModalProps) {
    const [reservation, setReservation] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [voucherModalOpen, setVoucherModalOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [sendChannelsModalOpen, setSendChannelsModalOpen] = useState(false);
    const [completePaymentModalOpen, setCompletePaymentModalOpen] = useState(false);
    const [isPrintingContract, setIsPrintingContract] = useState(false);
    const [channelFlowOpen, setChannelFlowOpen] = useState(false);

    useEffect(() => {
        if (open && reservationId) {
            loadReservation();
        }
    }, [open, reservationId]);

    const loadReservation = async () => {
        setIsLoading(true);
        try {
            const res = await api.getReservationById(Number(reservationId));
            if (res.success && res.data?.reservation) {
                setReservation(res.data.reservation);
            }
        } catch (error) {
            console.error("Error loading reservation details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!reservation && !isLoading) return null;

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        return format(new Date(dateStr), "dd 'de' MMMM 'of' yyyy", { locale: ptBR });
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
    };

    const handlePrintContract = async () => {
        if (!reservation?.id) return;
        try {
            setIsPrintingContract(true);
            const response = await api.getReservationContractHtml(Number(reservation.id));
            if (!response.success || !response.data?.html) {
                toast.error(response.error?.message || "Não foi possível gerar o contrato.");
                return;
            }

            const printed = printHtmlDocument(response.data.html);
            if (!printed) {
                toast.error("Não foi possível abrir a visualização de impressão.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao imprimir contrato da reserva.");
        } finally {
            setIsPrintingContract(false);
        }
    };

    const getStatusColor = (status: string) => {
        const map: any = {
            confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
            pending: "bg-amber-500/10 text-amber-600 border-amber-200",
            checked_in: "bg-blue-500/10 text-blue-600 border-blue-200",
            checked_out: "bg-slate-500/10 text-slate-600 border-slate-200",
            cancelled: "bg-red-500/10 text-red-600 border-red-200",
        };
        return map[status] || "bg-gray-100 text-gray-600";
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] p-0 gap-0 overflow-hidden bg-zinc-50/50 dark:bg-zinc-950">
                {!reservation ? (
                    <div className="p-8 flex items-center justify-center h-64">
                        <DialogTitle className="sr-only">Carregando detalhes da reserva</DialogTitle>
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <div className="flex flex-col h-[calc(90vh-2rem)] max-h-[calc(90vh-2rem)]">
                        {/* Header - apenas título e status */}
                        <div className="px-6 py-4 border-b bg-background flex-shrink-0">
                            <div className="flex items-center gap-3 mb-1">
                                <DialogTitle className="text-xl font-bold font-mono tracking-tight">{reservation.reservationNumber}</DialogTitle>
                                <Badge variant="outline" className={getStatusColor(reservation.status)}>
                                    {reservation.status === 'confirmed' ? 'Confirmada' :
                                        reservation.status === 'pending' ? 'Pendente' :
                                            reservation.status === 'checked_in' ? 'Check-in Realizado' :
                                                reservation.status === 'checked_out' ? 'Check-out Realizado' :
                                                    reservation.status === 'cancelled' ? 'Cancelada' : reservation.status}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CalendarDays className="w-3.5 h-3.5" />
                                <span>Criada em {formatDate(reservation.createdAt)}</span>
                                <span>•</span>
                                <span>Por {reservation.creator?.name || "Sistema"}</span>
                            </div>
                        </div>

                        <div className="flex flex-1 min-h-0 overflow-hidden">
                            {/* Sidebar Summary - compacto para evitar scroll */}
                            <div className="w-80 border-r border-blue-100 dark:border-blue-900/20 bg-gradient-to-b from-blue-50/80 via-white to-blue-50/30 dark:from-blue-950/20 dark:via-zinc-950 dark:to-blue-950/10 p-4 hidden md:block space-y-3 overflow-y-auto shrink-0">
                                {/* Guest + Período + Financeiro agrupados */}
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-zinc-900/50 border border-blue-100 dark:border-blue-900/30 shadow-sm">
                                    <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md ring-2 ring-white dark:ring-zinc-950">
                                        {reservation.guest?.firstName?.[0]}{reservation.guest?.lastName?.[0]}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 truncate">{reservation.guest?.firstName} {reservation.guest?.lastName}</h3>
                                        <p className="text-xs text-blue-600/80 dark:text-blue-400 truncate">{reservation.guest?.email}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            <Badge className="bg-blue-100 text-blue-700 border-none text-[10px] px-1.5 py-0 h-4">
                                                {reservation.guest?.tier || "Bronze"}
                                            </Badge>
                                            <Badge variant="outline" className="border-blue-200 text-blue-700 text-[10px] px-1.5 py-0 h-4">
                                                {reservation.guest?.totalStays || 0} estadias
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Check-in e Check-out em um único card compacto */}
                                <div className="p-3 bg-white dark:bg-zinc-900/50 border border-blue-100 dark:border-blue-900/30 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Período</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Check-in</p>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{format(new Date(reservation.checkIn), "dd/MM")}</p>
                                            <p className="text-[10px] text-slate-500">{reservation.checkInTime || "14:00"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase">Check-out</p>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{format(new Date(reservation.checkOut), "dd/MM")}</p>
                                            <p className="text-[10px] text-slate-500">{reservation.checkOutTime || "12:00"}</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                        {reservation.nights} noite{reservation.nights !== 1 ? "s" : ""}
                                    </p>
                                </div>

                                {/* Financial Summary - mantido como antes */}
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-10">
                                        <Banknote className="w-16 h-16 text-white" />
                                    </div>
                                    <p className="text-xs text-slate-300 mb-1 uppercase tracking-wider font-semibold">Resumo financeiro</p>
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm items-center">
                                            <span className="text-slate-300">Valor total</span>
                                            <span className="font-bold text-lg">{formatCurrency(reservation.totalAmount)}</span>
                                        </div>
                                        {Number(reservation.discount) > 0 && (
                                            <div className="flex justify-between text-sm items-center bg-white/5 p-2 rounded-lg backdrop-blur-sm">
                                                <span className="text-slate-300 flex items-center gap-1">
                                                    <Percent className="w-3 h-3" /> Desconto aplicado
                                                </span>
                                                <span className="text-emerald-300 font-medium">
                                                    {reservation.discountType === "fixed" || reservation.discountType === "amount"
                                                        ? `- ${formatCurrency(reservation.discount)}`
                                                        : `- ${reservation.discount}%`}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm items-center bg-white/5 p-2 rounded-lg backdrop-blur-sm">
                                            <span className="text-slate-300">Valor pago</span>
                                            <span className="text-emerald-400 font-bold">{formatCurrency(reservation.paidAmount || 0)}</span>
                                        </div>
                                        {(Number(reservation.commissionAmount ?? reservation.commission_amount) > 0) && (
                                            <div className="flex justify-between text-sm items-center bg-white/5 p-2 rounded-lg backdrop-blur-sm">
                                                <span className="text-slate-300">Comissão</span>
                                                <span className="text-amber-300 font-medium">{formatCurrency(Number(reservation.commissionAmount ?? reservation.commission_amount ?? 0))}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm items-center pt-2 border-t border-white/10">
                                            <span className="text-slate-300">Restante</span>
                                            <span className="text-amber-400 font-bold">{formatCurrency(Math.max(0, Number(reservation.totalAmount) - Number(reservation.paidAmount || 0) - Number(reservation.commissionAmount ?? reservation.commission_amount ?? 0)))}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 bg-background">
                                <Tabs defaultValue="details" className="h-full flex flex-col">
                                    <div className="px-6 border-b">
                                        <TabsList className="bg-transparent h-12 gap-6 p-0">
                                            <TabsTrigger value="details" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full">Visão Geral</TabsTrigger>
                                            <TabsTrigger value="unit" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full">Unidade & Preferências</TabsTrigger>
                                            <TabsTrigger value="guest" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full">Hóspede Completo</TabsTrigger>
                                            <TabsTrigger value="financial" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full">Financeiro</TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <ScrollArea className="flex-1">
                                        <div className="p-6">
                                            <TabsContent value="details" className="mt-0 space-y-8">
                                                {/* Main Info Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-3 opacity-10">
                                                            <Building2 className="w-20 h-20 text-white" />
                                                        </div>
                                                        <div className="relative z-10">
                                                            <h3 className="font-semibold flex items-center gap-2 mb-4 text-slate-100">
                                                                <Building2 className="w-4 h-4 text-slate-300" />
                                                                Informações da Reserva
                                                            </h3>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                                                                    <label className="text-xs text-slate-400 block mb-1 uppercase tracking-wider">Unidade</label>
                                                                    <div className="font-bold text-xl">{reservation.unit?.number || "N/A"}</div>
                                                                    <div className="text-xs text-slate-400">{reservation.unit?.roomType?.name}</div>
                                                                </div>
                                                                <div className="p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                                                                    <label className="text-xs text-slate-400 block mb-1 uppercase tracking-wider">Propriedade</label>
                                                                    <div className="font-bold text-xl truncate" title={reservation.property?.name}>{reservation.property?.name || "Principal"}</div>
                                                                    <div className="text-xs text-slate-400 capitalize">{reservation.property?.type}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-3 opacity-10">
                                                            <Globe className="w-20 h-20 text-white" />
                                                        </div>
                                                        <div className="relative z-10">
                                                            <h3 className="font-semibold flex items-center gap-2 mb-4 text-slate-100">
                                                                <Globe className="w-4 h-4 text-slate-300" />
                                                                Origem e Canal
                                                            </h3>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                                                                    <label className="text-xs text-slate-400 block mb-1 uppercase tracking-wider">Canal</label>
                                                                    <div className="font-bold text-xl">{reservation.channel || "Direto"}</div>
                                                                </div>
                                                                <div className="p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                                                                    <label className="text-xs text-slate-400 block mb-1 uppercase tracking-wider">Origem</label>
                                                                    <div className="font-bold text-xl capitalize">{reservation.bookingSource || "-"}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Separator />

                                                {/* Trip Purpose */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div>
                                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                                                            <Briefcase className="w-4 h-4" /> Motivo da Viagem
                                                        </label>
                                                        <p className="font-medium capitalize">{reservation.purposeOfStay === 'leisure' ? 'Lazer' : reservation.purposeOfStay === 'business' ? 'Negócios' : reservation.purposeOfStay || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                                                            <Sparkles className="w-4 h-4" /> Ocasião Especial
                                                        </label>
                                                        <p className="font-medium capitalize">{reservation.specialOccasion === 'none' ? '-' : reservation.specialOccasion || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                                                            <History className="w-4 h-4" /> Estadia
                                                        </label>
                                                        <p className="font-medium">{reservation.nights} noites, {reservation.adults} adultos, {reservation.children} crianças</p>
                                                    </div>
                                                </div>

                                                <Separator />

                                                {/* Notes */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800">
                                                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                                                            <FileText className="w-4 h-4" /> Observações do Hóspede
                                                        </h4>
                                                        <p className="text-sm text-blue-700 dark:text-blue-200">
                                                            {reservation.guest?.notes || reservation.guestNotes || "Nenhuma observação registrada."}
                                                        </p>
                                                    </div>

                                                    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800">
                                                        <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                                                            <AlertCircle className="w-4 h-4" /> Notas Internas
                                                        </h4>
                                                        <p className="text-sm text-amber-700 dark:text-amber-200">
                                                            {reservation.internalNotes || "Nenhuma nota interna."}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Agency Info if applicable */}
                                                {reservation.isAgency && (
                                                    <div className="p-4 rounded-xl border border-purple-200 bg-purple-50 dark:bg-purple-900/10 dark:border-purple-800">
                                                        <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-4 flex items-center gap-2">
                                                            <Building2 className="w-4 h-4" /> Detalhes da Agência / OTA
                                                        </h4>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            <div>
                                                                <label className="text-xs text-purple-600/70">Nome da Agência</label>
                                                                <p className="font-medium text-purple-900 dark:text-purple-100">{reservation.agencyName || "-"}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-purple-600/70">External ID</label>
                                                                <p className="font-medium text-purple-900 dark:text-purple-100 font-mono">{reservation.externalId || "-"}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-purple-600/70">Voucher</label>
                                                                <p className="font-medium text-purple-900 dark:text-purple-100">{reservation.voucherNumber || "-"}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-purple-600/70">Comissão (%)</label>
                                                                <p className="font-medium text-purple-900 dark:text-purple-100">{reservation.agencyCommission}%</p>
                                                            </div>
                                                            {(Number(reservation.commissionAmount ?? reservation.commission_amount) > 0) && (
                                                                <div>
                                                                    <label className="text-xs text-purple-600/70">Valor comissão (R$)</label>
                                                                    <p className="font-medium text-purple-900 dark:text-purple-100">{formatCurrency(Number(reservation.commissionAmount ?? reservation.commission_amount ?? 0))}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </TabsContent>

                                            <TabsContent value="unit" className="mt-0">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {/* Card: Acomodação */}
                                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-200 dark:border-violet-800 shadow-sm">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <div className="p-2.5 rounded-xl bg-violet-500/20">
                                                                <Home className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-lg text-foreground">Acomodação</h3>
                                                                <p className="text-xs text-muted-foreground">Unidade e categoria da reserva</p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="p-3 rounded-xl bg-background/60 border border-violet-200/50 dark:border-violet-800/50">
                                                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Unidade</p>
                                                                <p className="font-bold text-xl text-violet-700 dark:text-violet-300">{reservation.unit?.number || "—"}</p>
                                                            </div>
                                                            <div className="p-3 rounded-xl bg-background/60 border border-violet-200/50 dark:border-violet-800/50">
                                                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Categoria</p>
                                                                <p className="font-semibold text-foreground">{reservation.unit?.roomType?.name || "—"}</p>
                                                            </div>
                                                            <div className="p-3 rounded-xl bg-background/60 border border-violet-200/50 dark:border-violet-800/50 col-span-2">
                                                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Propriedade</p>
                                                                <p className="font-medium text-foreground">{reservation.property?.name || "—"}</p>
                                                            </div>
                                                            <div className="p-3 rounded-lg bg-background/40">
                                                                <p className="text-xs text-muted-foreground mb-0.5">Andar</p>
                                                                <p className="font-medium">{reservation.unit?.floor || "Térreo"}</p>
                                                            </div>
                                                            <div className="p-3 rounded-lg bg-background/40">
                                                                <p className="text-xs text-muted-foreground mb-0.5">Vista</p>
                                                                <p className="font-medium">{reservation.unit?.view || "Padrão"}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Card: Preferências do hóspede */}
                                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200 dark:border-amber-800 shadow-sm">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <div className="p-2.5 rounded-xl bg-amber-500/20">
                                                                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-lg text-foreground">Preferências</h3>
                                                                <p className="text-xs text-muted-foreground">Solicitações da estadia</p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="p-3 rounded-xl bg-background/60 border border-amber-200/50 dark:border-amber-800/50 flex items-center gap-3">
                                                                <ArrowUpFromLine className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                                                                <div className="min-w-0">
                                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Andar preferido</p>
                                                                    <p className="font-medium text-sm truncate capitalize">{reservation.floorPreference === 'none' || !reservation.floorPreference ? 'Sem preferência' : reservation.floorPreference}</p>
                                                                </div>
                                                            </div>
                                                            <div className="p-3 rounded-xl bg-background/60 border border-amber-200/50 dark:border-amber-800/50 flex items-center gap-3">
                                                                <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                                                                <div className="min-w-0">
                                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Vista preferida</p>
                                                                    <p className="font-medium text-sm truncate capitalize">{reservation.viewPreference === 'none' || !reservation.viewPreference ? 'Sem preferência' : reservation.viewPreference}</p>
                                                                </div>
                                                            </div>
                                                            <div className="p-3 rounded-xl bg-background/60 border border-amber-200/50 dark:border-amber-800/50 flex items-center gap-3">
                                                                <Cigarette className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                                                                <div className="min-w-0">
                                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Fumante</p>
                                                                    <p className="font-medium text-sm">{reservation.smokingPreference === 'smoking' ? 'Sim' : 'Não'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="p-3 rounded-xl bg-background/60 border border-amber-200/50 dark:border-amber-800/50 flex items-center gap-3">
                                                                <Accessibility className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                                                                <div className="min-w-0">
                                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Acessibilidade</p>
                                                                    <p className="font-medium text-sm">{reservation.accessibilityNeeds ? 'Sim' : 'Não'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {reservation.accessibilityNeeds && reservation.accessibilityNotes && (
                                                            <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm">
                                                                <p className="text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-wider font-semibold mb-1">Nota de acessibilidade</p>
                                                                <p className="text-foreground">{reservation.accessibilityNotes}</p>
                                                            </div>
                                                        )}
                                                        {reservation.petDetails && (
                                                            <div className="mt-3 p-3 rounded-xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 text-sm flex items-center gap-2">
                                                                <Dog className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] text-pink-700 dark:text-pink-400 uppercase tracking-wider font-semibold mb-0.5">Pet</p>
                                                                    <p className="text-foreground">{reservation.petDetails}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="guest" className="mt-0">
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                    {/* Card: Identificação */}
                                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200 dark:border-blue-800 shadow-sm flex flex-col items-center text-center">
                                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-4">
                                                            {reservation.guest?.firstName?.[0]}{reservation.guest?.lastName?.[0]}
                                                        </div>
                                                        <h3 className="font-bold text-lg text-foreground">{reservation.guest?.firstName} {reservation.guest?.lastName}</h3>
                                                        <p className="text-sm text-muted-foreground mt-1">{reservation.guest?.email || "—"}</p>
                                                        <div className="flex flex-wrap gap-2 justify-center mt-3">
                                                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-0">
                                                                {reservation.guest?.tier || "Bronze"}
                                                            </Badge>
                                                            <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300">
                                                                {reservation.guest?.totalStays || 0} estadias
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {/* Card: Dados pessoais e contato */}
                                                    <div className="lg:col-span-2 space-y-4">
                                                        <div className="p-5 rounded-2xl bg-background border border-border shadow-sm">
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <FileText className="w-4 h-4 text-primary" />
                                                                <h4 className="font-semibold text-foreground">Dados pessoais e contato</h4>
                                                            </div>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                                <div className="p-3 rounded-xl bg-muted/50">
                                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">CPF / Documento</p>
                                                                    <p className="font-medium text-sm">{reservation.guest?.documentNumber || "—"}</p>
                                                                </div>
                                                                <div className="p-3 rounded-xl bg-muted/50">
                                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Telefone</p>
                                                                    <p className="font-medium text-sm">{reservation.guest?.phone || "—"}</p>
                                                                </div>
                                                                <div className="p-3 rounded-xl bg-muted/50 sm:col-span-1 col-span-2">
                                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Profissão</p>
                                                                    <p className="font-medium text-sm">{reservation.guest?.occupation || "—"}</p>
                                                                </div>
                                                                <div className="p-3 rounded-xl bg-muted/50 col-span-2 sm:col-span-3">
                                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Empresa</p>
                                                                    <p className="font-medium text-sm">{reservation.guest?.companyName || "—"}</p>
                                                                </div>
                                                                <div className="p-3 rounded-xl bg-muted/50 col-span-2 sm:col-span-3">
                                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Endereço</p>
                                                                    <p className="font-medium text-sm">
                                                                        {[reservation.guest?.address, reservation.guest?.city, reservation.guest?.state, reservation.guest?.zipCode].filter(Boolean).join(", ") || "—"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-5 rounded-2xl bg-background border border-amber-200 dark:border-amber-800 shadow-sm">
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                                <h4 className="font-semibold text-foreground">Contato de emergência</h4>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20">
                                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Nome</p>
                                                                    <p className="font-medium text-sm">{reservation.guest?.emergencyContactName || "—"}</p>
                                                                </div>
                                                                <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20">
                                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Telefone</p>
                                                                    <p className="font-medium text-sm">{reservation.guest?.emergencyContactPhone || "—"}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="financial" className="mt-0">
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                    {/* Coluna esquerda: Extrato + Observações */}
                                                    <div className="lg:col-span-2 space-y-6">
                                                        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm">
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                                                <h3 className="font-semibold text-lg text-foreground">Extrato da conta</h3>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div className="flex justify-between items-center py-2.5 px-3 rounded-lg bg-background/80 border border-slate-200/60 dark:border-slate-700">
                                                                    <span className="text-sm text-muted-foreground">Diárias ({reservation.nights} noite{reservation.nights !== 1 ? "s" : ""})</span>
                                                                    <span className="font-semibold tabular-nums">{formatCurrency((reservation.baseRate || 0) * (reservation.nights || 0))}</span>
                                                                </div>
                                                                {reservation.items?.filter((i: any) => i.type === 'extra').map((item: any, idx: number) => (
                                                                    <div key={idx} className="flex justify-between items-center py-2 px-3 rounded-lg bg-background/60 text-sm">
                                                                        <span>{item.name} <span className="text-muted-foreground">× {item.quantity}</span></span>
                                                                        <span className="font-medium tabular-nums">{formatCurrency(Number(item.totalPrice))}</span>
                                                                    </div>
                                                                ))}
                                                                {Number(reservation.discount) > 0 && (
                                                                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-medium">
                                                                        <span>Desconto{reservation.discountType === "fixed" || reservation.discountType === "amount" ? "" : ` (${reservation.discount}%)`}</span>
                                                                        <span className="tabular-nums">{reservation.discountType === "fixed" || reservation.discountType === "amount" ? `- ${formatCurrency(reservation.discount)}` : `- ${reservation.discount}%`}</span>
                                                                    </div>
                                                                )}
                                                                {Number(reservation.taxes) > 0 && (
                                                                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-background/60 text-sm">
                                                                        <span className="text-muted-foreground">Taxas e impostos</span>
                                                                        <span className="font-medium tabular-nums">+ {formatCurrency(reservation.taxes)}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-slate-300 dark:border-slate-600 font-bold text-lg">
                                                                    <span>Valor total</span>
                                                                    <span className="tabular-nums text-primary">{formatCurrency(reservation.totalAmount)}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-5 rounded-2xl bg-background border border-border shadow-sm">
                                                            <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                                                                <FileText className="w-4 h-4 text-muted-foreground" /> Observações de pagamento
                                                            </label>
                                                            <div className="p-4 rounded-xl bg-muted/50 border border-border text-sm min-h-[72px]">
                                                                {reservation.paymentNotes || "Nenhuma observação."}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Coluna direita: Pagamentos + Config + Cartão */}
                                                    <div className="space-y-6">
                                                        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-200 dark:border-blue-800 shadow-sm">
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <Banknote className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                                <h4 className="font-semibold text-foreground">Pagamentos</h4>
                                                            </div>
                                                            <div className="space-y-4">
                                                                {(reservation.depositAmount != null && Number(reservation.depositAmount) > 0) && (
                                                                    <div>
                                                                        <div className="flex justify-between text-sm mb-1.5">
                                                                            <span className="text-muted-foreground">Depósito / Sinal</span>
                                                                            <span className="font-semibold tabular-nums">{formatCurrency(reservation.depositAmount)}</span>
                                                                        </div>
                                                                        <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                                                                            <div className="h-full bg-blue-500 transition-all" style={{ width: reservation.depositPaid ? '100%' : '0%' }} />
                                                                        </div>
                                                                        <p className="text-[10px] text-right mt-0.5 text-muted-foreground">{reservation.depositPaid ? "Pago" : "Pendente"}</p>
                                                                    </div>
                                                                )}
                                                                <div className={reservation.depositAmount ? "pt-3 border-t border-blue-200/60 dark:border-blue-700" : ""}>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-muted-foreground">Valor pago</span>
                                                                        <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatCurrency(reservation.paidAmount || 0)}</span>
                                                                    </div>
                                                                </div>
                                                                {(Number(reservation.commissionAmount ?? reservation.commission_amount) > 0) && (
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-muted-foreground">Comissão</span>
                                                                        <span className="font-medium text-amber-600 dark:text-amber-400 tabular-nums">{formatCurrency(Number(reservation.commissionAmount ?? reservation.commission_amount ?? 0))}</span>
                                                                    </div>
                                                                )}
                                                                <div className="pt-3 border-t-2 border-amber-200 dark:border-amber-800">
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="font-semibold text-amber-700 dark:text-amber-400">Restante a pagar</span>
                                                                        <span className="font-bold text-amber-700 dark:text-amber-400 tabular-nums">{formatCurrency(Math.max(0, Number(reservation.totalAmount) - Number(reservation.paidAmount || 0) - Number(reservation.commissionAmount ?? reservation.commission_amount ?? 0)))}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-5 rounded-2xl bg-background border border-border shadow-sm">
                                                            <h4 className="font-semibold text-sm text-foreground mb-3">Configuração</h4>
                                                            <div className="space-y-2.5">
                                                                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-muted/50 text-sm">
                                                                    <span className="text-muted-foreground">Status</span>
                                                                    <span className="font-medium capitalize">{reservation.paymentStatus}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-muted/50 text-sm">
                                                                    <span className="text-muted-foreground">Forma de pagamento</span>
                                                                    <span className="font-medium">{reservation.paymentMethod || "—"}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-muted/50 text-sm">
                                                                    <span className="text-muted-foreground">Parcelas</span>
                                                                    <span className="font-medium">{reservation.installments || 1}x</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {(reservation.cardBrand || reservation.cardTransactionId || reservation.cardAuthCode || reservation.cardMachineId) && (
                                                            <div className="p-5 rounded-2xl bg-background border border-violet-200 dark:border-violet-800 shadow-sm">
                                                                <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                                                                    <Banknote className="w-4 h-4 text-violet-500" /> Dados do cartão
                                                                </h4>
                                                                <div className="space-y-2 text-sm">
                                                                    {reservation.cardBrand && (
                                                                        <div className="flex justify-between"><span className="text-muted-foreground">Bandeira</span><span className="font-medium">{reservation.cardBrand}</span></div>
                                                                    )}
                                                                    {reservation.cardTransactionId && (
                                                                        <div className="flex justify-between"><span className="text-muted-foreground">NSU / Transação</span><span className="font-mono text-xs">{reservation.cardTransactionId}</span></div>
                                                                    )}
                                                                    {reservation.cardAuthCode && (
                                                                        <div className="flex justify-between"><span className="text-muted-foreground">Cód. autorização</span><span className="font-mono text-xs">{reservation.cardAuthCode}</span></div>
                                                                    )}
                                                                    {reservation.cardMachineId && (
                                                                        <div className="flex justify-between"><span className="text-muted-foreground">Terminal</span><span className="font-mono text-xs">{reservation.cardMachineId}</span></div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        </div>
                                    </ScrollArea>
                                </Tabs>
                            </div>
                        </div>

                        {/* Rodapé com ações */}
                        <div className="px-6 py-4 border-t bg-background flex-shrink-0 flex flex-wrap items-center justify-end gap-2">
                            {reservation.status === 'confirmed' && (
                                <Button
                                    variant="default"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                    onClick={() => onCheckIn?.()}
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Realizar Check-in
                                </Button>
                            )}
                            {reservation.status === 'checked_in' && (
                                <Button
                                    variant="default"
                                    className="bg-rose-600 hover:bg-rose-700 text-white gap-2"
                                    onClick={() => onCheckOut?.()}
                                >
                                    <ArrowUpFromLine className="w-4 h-4" />
                                    Realizar Check-out
                                </Button>
                            )}
                            {Number(reservation.paidAmount || 0) < Number(reservation.totalAmount) && (
                                <Button
                                    variant="default"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                    onClick={() => setCompletePaymentModalOpen(true)}
                                >
                                    <Banknote className="w-4 h-4" />
                                    Completar pagamento
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => setVoucherModalOpen(true)} className="gap-2">
                                <Printer className="w-4 h-4" />
                                Imprimir Voucher
                            </Button>
                            <Button variant="outline" onClick={handlePrintContract} className="gap-2" disabled={isPrintingContract}>
                                <FileText className="w-4 h-4" />
                                {isPrintingContract ? "Gerando contrato..." : "Imprimir contrato"}
                            </Button>
                            <Button variant="outline" onClick={() => setSendChannelsModalOpen(true)} className="gap-2">
                                <Send className="w-4 h-4" />
                                Enviar reserva
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setChannelFlowOpen(true)}
                                className="gap-2 border-teal-500/30 text-teal-700 hover:bg-teal-500/10 hover:text-teal-800"
                            >
                                <Radio className="w-4 h-4" />
                                Fluxo Channel Manager
                            </Button>
                            <Button variant="outline" onClick={() => { onOpenChange(false); onEdit(); }}>
                                Editar Reserva
                            </Button>
                            {reservation.status === 'confirmed' && (
                                <Button
                                    variant="outline"
                                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                                    onClick={() => setCancelDialogOpen(true)}
                                >
                                    <Ban className="w-4 h-4" />
                                    Cancelar Reserva
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>

            {/* Confirmação de cancelamento */}
            {reservation && (
                <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Cancelar reserva?</AlertDialogTitle>
                            <AlertDialogDescription>
                                A reserva <strong>{reservation.reservationNumber}</strong> será cancelada. O hóspede poderá ser notificado conforme a política configurada. Esta ação pode ser revertida editando a reserva e alterando o status.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Manter reserva</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={async () => {
                                    setIsCancelling(true);
                                    try {
                                        const res = await api.updateReservation(Number(reservation.id), { status: 'cancelled' });
                                        if (res.success) {
                                            toast.success("Reserva cancelada com sucesso.");
                                            await loadReservation();
                                            onCancel?.();
                                            setCancelDialogOpen(false);
                                        } else {
                                            toast.error(res.error || "Não foi possível cancelar a reserva.");
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        toast.error("Erro ao cancelar a reserva.");
                                    } finally {
                                        setIsCancelling(false);
                                    }
                                }}
                                disabled={isCancelling}
                            >
                                {isCancelling ? "Cancelando…" : "Sim, cancelar reserva"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* Modal Completar pagamento (parcial) */}
            {reservation && (
                <CompletePaymentModal
                    open={completePaymentModalOpen}
                    onOpenChange={setCompletePaymentModalOpen}
                    reservation={{
                        id: reservation.id,
                        reservationNumber: reservation.reservationNumber,
                        totalAmount: Number(reservation.totalAmount) || 0,
                        paidAmount: Number(reservation.paidAmount) || 0,
                        commissionAmount: Number(reservation.commissionAmount ?? reservation.commission_amount ?? 0) || undefined,
                        guestId: reservation.guest?.id,
                        guestName: reservation.guest ? [reservation.guest.firstName, reservation.guest.lastName].filter(Boolean).join(" ").trim() || reservation.guest.name : undefined,
                    }}
                    onSuccess={loadReservation}
                />
            )}

            {/* Modal Enviar reserva por e-mail / WhatsApp - usa Service SMTP configurado */}
            {reservation && (
                <SendReservationChannelsModal
                    open={sendChannelsModalOpen}
                    onOpenChange={setSendChannelsModalOpen}
                    reservationNumber={reservation.reservationNumber}
                    guestEmail={reservation.guest?.email}
                    guestPhone={reservation.guest?.phone}
                    onSend={async (channels) => {
                        await api.sendReservationDetails(Number(reservation.id), channels);
                    }}
                />
            )}

            <ChannelManagerFlowModal
                open={channelFlowOpen}
                onOpenChange={setChannelFlowOpen}
                reservationId={reservation ? Number(reservation.id) : null}
                reservationNumber={reservation?.reservationNumber}
            />

            {/* Modal do Voucher para impressão */}
            {reservation && (
                <ReservationSummaryModal
                    open={voucherModalOpen}
                    onOpenChange={setVoucherModalOpen}
                    reservation={{
                        protocolNumber: reservation.reservationNumber,
                        guestName: [reservation.guest?.firstName, reservation.guest?.lastName].filter(Boolean).join(" ") || "Hóspede",
                        guestEmail: reservation.guest?.email || "",
                        guestPhone: reservation.guest?.phone || "",
                        guestCPF: reservation.guest?.documentNumber || "",
                        guestAddress: reservation.guest?.address,
                        guestCity: reservation.guest?.city,
                        guestState: reservation.guest?.state,
                        guestZipCode: reservation.guest?.zipCode,
                        checkIn: reservation.checkIn,
                        checkOut: reservation.checkOut,
                        checkInTime: reservation.checkInTime,
                        checkOutTime: reservation.checkOutTime,
                        adults: String(reservation.adults ?? 1),
                        children: String(reservation.children ?? 0),
                        infants: reservation.infants != null ? String(reservation.infants) : undefined,
                        propertyName: reservation.property?.name,
                        roomId: reservation.unit?.id ? String(reservation.unit.id) : reservation.unit?.number || "",
                        selectedRooms: reservation.unit?.number ? [reservation.unit.number] : undefined,
                        category: reservation.unit?.roomType?.name || "",
                        ratePlan: reservation.ratePlan,
                        breakfast: reservation.breakfast,
                        parking: reservation.parking,
                        airportTransfer: reservation.airportTransfer,
                        latecheckout: reservation.latecheckout,
                        earlyCheckin: reservation.earlyCheckin,
                        spa: reservation.spa,
                        laundry: reservation.laundry,
                        petFriendly: reservation.petFriendly,
                        specialRequests: reservation.guest?.notes || reservation.guestNotes,
                        paymentMethod: reservation.paymentMethod || "Não informado",
                        paymentStatus: reservation.paymentStatus || "pending",
                        totalAmount: Number(reservation.totalAmount) || 0,
                        paidAmount: Number(reservation.paidAmount) || 0,
                        depositAmount: reservation.depositAmount != null ? Number(reservation.depositAmount) : undefined,
                        discount: reservation.discount != null ? Number(reservation.discount) : undefined,
                        discountType: reservation.discountType,
                    }}
                />
            )}
        </Dialog>
    );
}
