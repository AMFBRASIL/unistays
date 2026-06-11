import { useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, Download, X } from "lucide-react";

interface ReservationSummaryData {
    protocolNumber?: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    guestCPF: string;
    guestAddress?: string;
    guestCity?: string;
    guestState?: string;
    guestZipCode?: string;
    guestCountry?: string;
    checkIn: string;
    checkOut: string;
    checkInTime?: string;
    checkOutTime?: string;
    adults: string;
    children: string;
    infants?: string;
    propertyName?: string;
    roomId: string;
    selectedRooms?: string[];
    category: string;
    ratePlan?: string;
    breakfast?: boolean;
    parking?: boolean;
    airportTransfer?: boolean;
    latecheckout?: boolean;
    earlyCheckin?: boolean;
    spa?: boolean;
    laundry?: boolean;
    petFriendly?: boolean;
    specialRequests?: string;
    paymentMethod: string;
    paymentStatus: string;
    totalAmount: number;
    paidAmount?: number;
    depositAmount?: number;
    discount?: number;
    discountType?: string;
    taxAmount?: number;
    isAgency?: boolean;
    agencyName?: string;
    channel?: string;
    createdAt?: string;
}

interface ReservationSummaryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservation: ReservationSummaryData | null;
    hotelInfo?: {
        name: string;
        address: string;
        phone: string;
        email: string;
        cnpj: string;
    };
}

const defaultHotelInfo = {
    name: "Grand Hotel Resort & Spa",
    address: "Av. Beira Mar, 1500 - Centro, Florianópolis - SC, 88000-000",
    phone: "(48) 3333-4444",
    email: "reservas@grandhotel.com.br",
    cnpj: "12.345.678/0001-90",
};

export function ReservationSummaryModal({
    open,
    onOpenChange,
    reservation,
    hotelInfo = defaultHotelInfo,
}: ReservationSummaryModalProps) {
    const printRef = useRef<HTMLDivElement>(null);

    if (!reservation) return null;

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Confirmação de Reserva - ${reservation.protocolNumber || "N/A"}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 12px;
              line-height: 1.5;
              color: #000;
              background: #fff;
              padding: 20px;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .hotel-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .hotel-info {
              font-size: 11px;
              color: #333;
            }
            .document-title {
              font-size: 18px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
              padding: 10px;
              background: #f5f5f5;
              border: 1px solid #000;
            }
            .protocol {
              text-align: center;
              font-size: 14px;
              margin-bottom: 20px;
            }
            .protocol strong {
              font-size: 16px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 14px;
              font-weight: bold;
              border-bottom: 1px solid #000;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            .info-item {
              display: flex;
              flex-direction: column;
            }
            .info-label {
              font-size: 10px;
              color: #666;
              text-transform: uppercase;
            }
            .info-value {
              font-size: 12px;
              font-weight: 500;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            .table th, .table td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            .table th {
              background: #f5f5f5;
              font-weight: bold;
            }
            .table .text-right {
              text-align: right;
            }
            .totals {
              margin-top: 20px;
              border-top: 2px solid #000;
              padding-top: 10px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
            }
            .total-row.grand-total {
              font-size: 16px;
              font-weight: bold;
              border-top: 1px solid #000;
              margin-top: 10px;
              padding-top: 10px;
            }
            .services-list {
              list-style: none;
              padding: 0;
            }
            .services-list li {
              padding: 3px 0;
              border-bottom: 1px dotted #ccc;
            }
            .services-list li:before {
              content: "✓ ";
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #000;
              padding-top: 20px;
            }
            .signature-area {
              margin-top: 40px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
            }
            .signature-line {
              border-top: 1px solid #000;
              padding-top: 5px;
              text-align: center;
              font-size: 10px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border: 1px solid #000;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 10px;
            }
            .notes {
              background: #f9f9f9;
              border: 1px solid #ccc;
              padding: 10px;
              margin-top: 10px;
              font-style: italic;
            }
            .finance-box {
              border: 2px solid #000;
              border-radius: 8px;
              background: #f5f5f5;
              padding: 16px;
              margin: 12px 0;
            }
            .finance-box .row { display: flex; justify-content: space-between; padding: 6px 0; }
            .finance-box .total-row { font-weight: bold; font-size: 16px; padding-top: 10px; border-top: 1px solid #333; margin-top: 8px; }
            .finance-box .restante { border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; font-weight: bold; }
            .finance-box .quitado { color: #166534; border-top-color: #166534; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("pt-BR");
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const calculateNights = () => {
        if (!reservation.checkIn || !reservation.checkOut) return 0;
        const checkIn = new Date(reservation.checkIn);
        const checkOut = new Date(reservation.checkOut);
        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getPaymentStatusLabel = (status: string) => {
        const statusMap: Record<string, string> = {
            pending: "PENDENTE",
            partial: "PARCIAL",
            paid: "PAGO",
            refunded: "REEMBOLSADO",
        };
        return statusMap[status] || status.toUpperCase();
    };

    const getPaymentMethodLabel = (method: string) => {
        const methodMap: Record<string, string> = {
            credit: "Cartão de Crédito",
            debit: "Cartão de Débito",
            pix: "PIX",
            cash: "Dinheiro",
            transfer: "Transferência Bancária",
            invoice: "Faturado",
        };
        return methodMap[method] || method;
    };

    const contractedServices = [
        reservation.breakfast && "Café da Manhã",
        reservation.parking && "Estacionamento",
        reservation.airportTransfer && "Transfer Aeroporto",
        reservation.latecheckout && "Late Check-out",
        reservation.earlyCheckin && "Early Check-in",
        reservation.spa && "Acesso ao Spa",
        reservation.laundry && "Lavanderia",
        reservation.petFriendly && "Pet Friendly",
    ].filter(Boolean);

    const rooms = reservation.selectedRooms?.length
        ? reservation.selectedRooms
        : reservation.roomId
            ? [reservation.roomId]
            : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-gray-300 print:max-w-none print:max-h-none print:overflow-visible">
                <DialogHeader className="flex flex-row items-center justify-between print:hidden">
                    <DialogTitle className="text-xl font-bold text-black">
                        Resumo da Reserva
                    </DialogTitle>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            className="gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            Imprimir
                        </Button>
                    </div>
                </DialogHeader>

                <div ref={printRef} className="invoice-container">
                    {/* Header */}
                    <div className="text-center border-b-2 border-black pb-6 mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-black mb-2 tracking-tight">
                            {hotelInfo.name}
                        </h1>
                        <p className="text-xs text-gray-600">{hotelInfo.address}</p>
                        <p className="text-xs text-gray-600">
                            Tel: {hotelInfo.phone} &nbsp;|&nbsp; E-mail: {hotelInfo.email}
                        </p>
                        <p className="text-xs text-gray-600">CNPJ: {hotelInfo.cnpj}</p>
                    </div>

                    {/* Document Title */}
                    <div className="text-center my-6 py-4 bg-slate-100 border-2 border-black rounded-sm">
                        <h2 className="text-lg md:text-xl font-bold text-black uppercase tracking-wide">
                            Confirmação de Reserva
                        </h2>
                    </div>

                    {/* Protocol */}
                    <div className="text-center mb-6 p-3 bg-slate-50 border border-slate-300 rounded-sm">
                        <p className="text-[10px] uppercase text-gray-500 tracking-wider mb-1">Protocolo</p>
                        <p className="text-lg font-bold text-black">
                            {reservation.protocolNumber || "N/A"}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                            Emitido em {new Date().toLocaleDateString("pt-BR")} às{" "}
                            {new Date().toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                    </div>

                    {/* Guest Information */}
                    <div className="mb-5">
                        <h3 className="text-sm font-bold border-b border-black pb-1 mb-3 text-black">
                            DADOS DO HÓSPEDE
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <span className="text-[10px] text-gray-500 uppercase block">
                                    Nome Completo
                                </span>
                                <span className="text-sm font-medium text-black">
                                    {reservation.guestName}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 uppercase block">
                                    CPF/Documento
                                </span>
                                <span className="text-sm font-medium text-black">
                                    {reservation.guestCPF || "-"}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 uppercase block">
                                    E-mail
                                </span>
                                <span className="text-sm font-medium text-black">
                                    {reservation.guestEmail}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 uppercase block">
                                    Telefone
                                </span>
                                <span className="text-sm font-medium text-black">
                                    {reservation.guestPhone}
                                </span>
                            </div>
                            {reservation.guestAddress && (
                                <div className="col-span-2">
                                    <span className="text-[10px] text-gray-500 uppercase block">
                                        Endereço
                                    </span>
                                    <span className="text-sm font-medium text-black">
                                        {reservation.guestAddress}
                                        {reservation.guestCity && `, ${reservation.guestCity}`}
                                        {reservation.guestState && ` - ${reservation.guestState}`}
                                        {reservation.guestZipCode &&
                                            `, ${reservation.guestZipCode}`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator className="bg-black my-4" />

                    {/* Stay Information */}
                    <div className="mb-5">
                        <h3 className="text-sm font-bold border-b border-black pb-1 mb-3 text-black">
                            DADOS DA HOSPEDAGEM
                        </h3>
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-black p-2 text-left text-black">
                                        Check-in
                                    </th>
                                    <th className="border border-black p-2 text-left text-black">
                                        Check-out
                                    </th>
                                    <th className="border border-black p-2 text-left text-black">
                                        Diárias
                                    </th>
                                    <th className="border border-black p-2 text-left text-black">
                                        Hóspedes
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-black p-2 text-black">
                                        {formatDate(reservation.checkIn)}
                                        {reservation.checkInTime && ` às ${reservation.checkInTime}`}
                                    </td>
                                    <td className="border border-black p-2 text-black">
                                        {formatDate(reservation.checkOut)}
                                        {reservation.checkOutTime &&
                                            ` às ${reservation.checkOutTime}`}
                                    </td>
                                    <td className="border border-black p-2 text-black">
                                        {calculateNights()}
                                    </td>
                                    <td className="border border-black p-2 text-black">
                                        {reservation.adults} adulto(s)
                                        {parseInt(reservation.children) > 0 &&
                                            `, ${reservation.children} criança(s)`}
                                        {reservation.infants &&
                                            parseInt(reservation.infants) > 0 &&
                                            `, ${reservation.infants} bebê(s)`}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Room Information */}
                    <div className="mb-5">
                        <h3 className="text-sm font-bold border-b border-black pb-1 mb-3 text-black">
                            ACOMODAÇÃO
                        </h3>
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-black p-2 text-left text-black">
                                        Unidade(s)
                                    </th>
                                    <th className="border border-black p-2 text-left text-black">
                                        Categoria
                                    </th>
                                    <th className="border border-black p-2 text-left text-black">
                                        Plano Tarifário
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-black p-2 text-black">
                                        {rooms.length > 0 ? rooms.join(", ") : "-"}
                                        {rooms.length > 1 && (
                                            <span className="ml-2 text-xs text-gray-600">
                                                (Pacote Família)
                                            </span>
                                        )}
                                    </td>
                                    <td className="border border-black p-2 text-black">
                                        {reservation.category || "-"}
                                    </td>
                                    <td className="border border-black p-2 text-black">
                                        {reservation.ratePlan || "Tarifa Padrão"}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Contracted Services */}
                    {contractedServices.length > 0 && (
                        <div className="mb-5">
                            <h3 className="text-sm font-bold border-b border-black pb-1 mb-3 text-black">
                                SERVIÇOS CONTRATADOS
                            </h3>
                            <ul className="list-none p-0 grid grid-cols-2 gap-1">
                                {contractedServices.map((service, idx) => (
                                    <li
                                        key={idx}
                                        className="text-sm text-black py-1 border-b border-dotted border-gray-300"
                                    >
                                        ✓ {service}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Special Requests */}
                    {reservation.specialRequests && (
                        <div className="mb-5">
                            <h3 className="text-sm font-bold border-b border-black pb-1 mb-3 text-black">
                                OBSERVAÇÕES / PEDIDOS ESPECIAIS
                            </h3>
                            <div className="bg-gray-50 border border-gray-300 p-3 text-sm italic text-black">
                                {reservation.specialRequests}
                            </div>
                        </div>
                    )}

                    <Separator className="bg-black my-4" />

                    {/* Resumo financeiro (apenas o que o cliente precisa ver) */}
                    <div className="mb-5">
                        <h3 className="text-sm font-bold border-b-2 border-black pb-2 mb-4 text-black">
                            RESUMO FINANCEIRO
                        </h3>

                        <div className="finance-box rounded-lg border-2 border-black bg-gray-50 p-4 space-y-3">
                            {reservation.discount !== undefined && reservation.discount > 0 && (
                                <>
                                    <div className="flex justify-between text-sm text-black">
                                        <span>Subtotal (antes do desconto):</span>
                                        <span>
                                            {formatCurrency(
                                                reservation.discountType === "percent"
                                                    ? reservation.totalAmount / (1 - reservation.discount / 100)
                                                    : reservation.totalAmount + reservation.discount
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-black">
                                        <span>
                                            Desconto aplicado (
                                            {reservation.discountType === "percent"
                                                ? `${reservation.discount}%`
                                                : formatCurrency(reservation.discount)}
                                            ):
                                        </span>
                                        <span className="font-medium">
                                            -
                                            {formatCurrency(
                                                reservation.discountType === "percent"
                                                    ? (reservation.totalAmount / (1 - reservation.discount / 100)) * (reservation.discount / 100)
                                                    : reservation.discount
                                            )}
                                        </span>
                                    </div>
                                </>
                            )}

                            <div className="flex justify-between items-center py-2 border-t border-gray-400 text-base font-bold text-black">
                                <span>Valor total:</span>
                                <span className="text-lg">{formatCurrency(reservation.totalAmount)}</span>
                            </div>

                            {(reservation.paidAmount !== undefined && reservation.paidAmount > 0) && (
                                <div className="flex justify-between text-sm text-black pt-1">
                                    <span>Valor pago:</span>
                                    <span className="font-semibold text-green-800">
                                        {formatCurrency(reservation.paidAmount)}
                                    </span>
                                </div>
                            )}

                            {(reservation.depositAmount !== undefined && reservation.depositAmount > 0) && (
                                <div className="flex justify-between text-sm text-black">
                                    <span>Sinal/entrada:</span>
                                    <span>{formatCurrency(reservation.depositAmount)}</span>
                                </div>
                            )}

                            {(() => {
                                const paid = Number(reservation.paidAmount) || 0;
                                const restante = Math.max(0, reservation.totalAmount - paid);
                                if (restante > 0) {
                                    return (
                                        <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-black text-sm font-bold text-black">
                                            <span>Restante a pagar:</span>
                                            <span>{formatCurrency(restante)}</span>
                                        </div>
                                    );
                                }
                                return (
                                    <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-green-600 text-sm font-bold text-green-800">
                                        <span>Pagamento quitado</span>
                                        <span>✓</span>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-300">
                            <div>
                                <span className="text-[10px] text-gray-500 uppercase block mb-1">
                                    Forma de pagamento
                                </span>
                                <span className="text-sm font-medium text-black">
                                    {getPaymentMethodLabel(reservation.paymentMethod)}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 uppercase block mb-1">
                                    Status
                                </span>
                                <span className="inline-block px-3 py-1 border border-black font-bold uppercase text-[10px] text-black">
                                    {getPaymentStatusLabel(reservation.paymentStatus)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Signature Area */}
                    <div className="mt-10 grid grid-cols-2 gap-10">
                        <div className="text-center">
                            <div className="border-t border-black pt-2 text-[10px] text-gray-600">
                                Assinatura do Hóspede
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t border-black pt-2 text-[10px] text-gray-600">
                                Assinatura do Responsável
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-10 text-center text-[10px] text-gray-500 border-t border-black pt-5">
                        <p>
                            Este documento é uma confirmação de reserva e não substitui a nota
                            fiscal.
                        </p>
                        <p>
                            Política de cancelamento: Consulte nossos termos e condições em
                            nosso website.
                        </p>
                        <p className="mt-2">
                            {hotelInfo.name} - Todos os direitos reservados ©{" "}
                            {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}