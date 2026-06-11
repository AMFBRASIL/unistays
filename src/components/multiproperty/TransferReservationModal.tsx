
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
    ArrowRightLeft,
    Search,
    User,
    Calendar,
    BedDouble,
    MapPin,
    Check,
    ChevronRight,
    ChevronLeft,
    AlertCircle,
    Clock,
    DollarSign,
    Phone,
    Mail,
    Building2,
    Star,
    ArrowRight,
    FileText,
    Send,
    Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Property {
    id: string;
    name: string;
    location: string;
    type: string;
    status: string;
    rooms: number;
    occupancy: number;
    image: string;
}

interface TransferReservationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    properties: Property[];
}

// Mock reservations
const mockReservations = [
    {
        id: "RES-001",
        guest: "Carlos Mendes",
        email: "carlos@email.com",
        phone: "(11) 99999-1111",
        checkIn: "2024-01-20",
        checkOut: "2024-01-25",
        roomType: "Suite Master",
        guests: 2,
        total: 2500,
        status: "confirmed",
        propertyId: "1",
    },
    {
        id: "RES-002",
        guest: "Maria Santos",
        email: "maria@email.com",
        phone: "(21) 99999-2222",
        checkIn: "2024-01-18",
        checkOut: "2024-01-22",
        roomType: "Deluxe",
        guests: 1,
        total: 1800,
        status: "confirmed",
        propertyId: "1",
    },
    {
        id: "RES-003",
        guest: "João Silva",
        email: "joao@email.com",
        phone: "(31) 99999-3333",
        checkIn: "2024-01-22",
        checkOut: "2024-01-28",
        roomType: "Standard",
        guests: 2,
        total: 1200,
        status: "pending",
        propertyId: "2",
    },
];

const transferReasons = [
    { id: "upgrade", label: "Upgrade de Categoria", description: "Melhoria de acomodação" },
    { id: "destination", label: "Mudança de Destino", description: "Hóspede alterou planos" },
    { id: "availability", label: "Indisponibilidade", description: "Sem quartos disponíveis" },
    { id: "maintenance", label: "Manutenção", description: "Quarto em manutenção" },
    { id: "request", label: "Pedido do Hóspede", description: "Solicitação especial" },
    { id: "other", label: "Outro Motivo", description: "Especificar abaixo" },
];

const steps = [
    { id: 1, title: "Reserva", icon: Search },
    { id: 2, title: "Origem", icon: Building2 },
    { id: 3, title: "Destino", icon: MapPin },
    { id: 4, title: "Motivo", icon: FileText },
    { id: 5, title: "Confirmação", icon: Check },
];

export function TransferReservationModal({
    open,
    onOpenChange,
    properties,
}: TransferReservationModalProps) {
    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedReservation, setSelectedReservation] = useState<typeof mockReservations[0] | null>(null);
    const [selectedOrigin, setSelectedOrigin] = useState<string>("");
    const [selectedDestination, setSelectedDestination] = useState<string>("");
    const [selectedReason, setSelectedReason] = useState("");
    const [reasonDetails, setReasonDetails] = useState("");
    const [notifyGuest, setNotifyGuest] = useState(true);
    const [adjustPrice, setAdjustPrice] = useState(false);
    const [priceAdjustment, setPriceAdjustment] = useState("0");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const filteredReservations = mockReservations.filter(
        (res) =>
            res.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
            res.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            res.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeProperties = properties.filter((p) => p.status === "active");
    const originProperty = properties.find((p) => p.id === selectedOrigin);
    const destinationProperty = properties.find((p) => p.id === selectedDestination);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const handleSubmit = async () => {
        setIsProcessing(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsProcessing(false);
        setIsSuccess(true);
        toast.success("Transferência realizada com sucesso!", {
            description: `Reserva ${selectedReservation?.id} transferida para ${destinationProperty?.name}`,
        });
    };

    const resetAndClose = () => {
        setStep(1);
        setSearchQuery("");
        setSelectedReservation(null);
        setSelectedOrigin("");
        setSelectedDestination("");
        setSelectedReason("");
        setReasonDetails("");
        setNotifyGuest(true);
        setAdjustPrice(false);
        setPriceAdjustment("0");
        setIsProcessing(false);
        setIsSuccess(false);
        onOpenChange(false);
    };

    const progress = (step / steps.length) * 100;

    if (isSuccess) {
        return (
            <Dialog open={open} onOpenChange={resetAndClose}>
                <DialogContent className="max-w-lg">
                    <div className="text-center py-8">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Transferência Concluída!</h2>
                        <p className="text-muted-foreground mb-6">
                            A reserva foi transferida com sucesso.
                        </p>

                        <div className="p-4 rounded-xl bg-muted/50 border mb-6 text-left">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">De</p>
                                    <p className="font-medium">{originProperty?.name}</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-primary" />
                                <div className="flex-1 text-right">
                                    <p className="text-sm text-muted-foreground">Para</p>
                                    <p className="font-medium">{destinationProperty?.name}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Reserva:</span>
                                    <span className="font-medium">{selectedReservation?.id}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Hóspede:</span>
                                    <span className="font-medium">{selectedReservation?.guest}</span>
                                </div>
                                {notifyGuest && (
                                    <div className="flex items-center gap-2 text-sm text-emerald-600">
                                        <Mail className="w-4 h-4" />
                                        <span>Notificação enviada ao hóspede</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button onClick={resetAndClose} className="w-full">
                            Fechar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
                <div className="flex h-[80vh]">
                    {/* Sidebar */}
                    <div className="w-64 bg-muted/30 border-r p-6 hidden lg:flex flex-col">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="flex items-center gap-3 text-lg">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                                    <ArrowRightLeft className="w-5 h-5 text-primary" />
                                </div>
                                Transferir Reserva
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-1 flex-1">
                            {steps.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => s.id <= step && setStep(s.id)}
                                    disabled={s.id > step}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                        step === s.id
                                            ? "bg-primary text-primary-foreground"
                                            : step > s.id
                                                ? "text-muted-foreground hover:bg-muted cursor-pointer"
                                                : "text-muted-foreground/50 cursor-not-allowed"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-7 h-7 rounded-full flex items-center justify-center text-xs",
                                            step === s.id
                                                ? "bg-primary-foreground/20"
                                                : step > s.id
                                                    ? "bg-primary/20 text-primary"
                                                    : "bg-muted"
                                        )}
                                    >
                                        {step > s.id ? <Check className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
                                    </div>
                                    {s.title}
                                </button>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 border-t">
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-2">
                                Etapa {step} de {steps.length}
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                        {/* Mobile Header */}
                        <div className="lg:hidden p-4 border-b">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                                    <ArrowRightLeft className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-semibold">Transferir Reserva</h2>
                                    <p className="text-xs text-muted-foreground">
                                        Etapa {step}: {steps[step - 1].title}
                                    </p>
                                </div>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            {/* Step 1: Search Reservation */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Buscar Reserva</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Pesquise pelo código, nome ou email do hóspede
                                        </p>
                                    </div>

                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar reserva..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        {filteredReservations.map((reservation) => (
                                            <button
                                                key={reservation.id}
                                                onClick={() => {
                                                    setSelectedReservation(reservation);
                                                    setSelectedOrigin(reservation.propertyId);
                                                }}
                                                className={cn(
                                                    "w-full p-4 rounded-xl border text-left transition-all hover:border-primary/50",
                                                    selectedReservation?.id === reservation.id
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border"
                                                )}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium">{reservation.guest}</h4>
                                                            <p className="text-sm text-muted-foreground">{reservation.id}</p>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            reservation.status === "confirmed"
                                                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                        }
                                                    >
                                                        {reservation.status === "confirmed" ? "Confirmada" : "Pendente"}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                                        <span>
                                                            {reservation.checkIn} - {reservation.checkOut}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <BedDouble className="w-4 h-4 text-muted-foreground" />
                                                        <span>{reservation.roomType}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                                                        <span>{formatCurrency(reservation.total)}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Origin Property */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Propriedade de Origem</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Confirme a propriedade atual da reserva
                                        </p>
                                    </div>

                                    {selectedReservation && (
                                        <div className="p-4 rounded-xl bg-muted/50 border mb-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{selectedReservation.guest}</h4>
                                                    <p className="text-sm text-muted-foreground">{selectedReservation.id}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-4">
                                        {activeProperties.map((property) => (
                                            <button
                                                key={property.id}
                                                onClick={() => setSelectedOrigin(property.id)}
                                                className={cn(
                                                    "p-4 rounded-xl border text-left transition-all overflow-hidden",
                                                    selectedOrigin === property.id
                                                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                                        : "border-border hover:border-primary/50"
                                                )}
                                            >
                                                <div className="flex gap-4">
                                                    <img
                                                        src={property.image}
                                                        alt={property.name}
                                                        className="w-20 h-20 rounded-lg object-cover"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="font-medium mb-1">{property.name}</h4>
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                                            <MapPin className="w-3 h-3" />
                                                            {property.location}
                                                        </div>
                                                        <Badge variant="secondary">{property.type}</Badge>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Destination Property */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Propriedade de Destino</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Selecione para onde a reserva será transferida
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-4">
                                        <Building2 className="w-5 h-5 text-primary" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Transferindo de</p>
                                            <p className="text-primary font-semibold">{originProperty?.name}</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        {activeProperties
                                            .filter((p) => p.id !== selectedOrigin)
                                            .map((property) => (
                                                <button
                                                    key={property.id}
                                                    onClick={() => setSelectedDestination(property.id)}
                                                    className={cn(
                                                        "p-4 rounded-xl border text-left transition-all overflow-hidden",
                                                        selectedDestination === property.id
                                                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                                            : "border-border hover:border-primary/50"
                                                    )}
                                                >
                                                    <div className="flex gap-4">
                                                        <img
                                                            src={property.image}
                                                            alt={property.name}
                                                            className="w-20 h-20 rounded-lg object-cover"
                                                        />
                                                        <div className="flex-1">
                                                            <h4 className="font-medium mb-1">{property.name}</h4>
                                                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                                                <MapPin className="w-3 h-3" />
                                                                {property.location}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="secondary">{property.type}</Badge>
                                                                <span className="text-sm text-emerald-600">
                                                                    {100 - property.occupancy}% disponível
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Reason */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Motivo da Transferência</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Selecione o motivo e configure as opções
                                        </p>
                                    </div>

                                    <RadioGroup
                                        value={selectedReason}
                                        onValueChange={setSelectedReason}
                                        className="space-y-3"
                                    >
                                        {transferReasons.map((reason) => (
                                            <Label
                                                key={reason.id}
                                                htmlFor={reason.id}
                                                className={cn(
                                                    "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                                                    selectedReason === reason.id
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border hover:border-primary/50"
                                                )}
                                            >
                                                <RadioGroupItem value={reason.id} id={reason.id} />
                                                <div>
                                                    <p className="font-medium">{reason.label}</p>
                                                    <p className="text-sm text-muted-foreground">{reason.description}</p>
                                                </div>
                                            </Label>
                                        ))}
                                    </RadioGroup>

                                    {selectedReason === "other" && (
                                        <div className="space-y-2">
                                            <Label>Detalhes do Motivo</Label>
                                            <Textarea
                                                placeholder="Descreva o motivo da transferência..."
                                                value={reasonDetails}
                                                onChange={(e) => setReasonDetails(e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-4 pt-4 border-t">
                                        <h4 className="font-medium">Opções Adicionais</h4>

                                        <div className="flex items-center justify-between p-4 rounded-xl border">
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-5 h-5 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">Notificar Hóspede</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Enviar email sobre a transferência
                                                    </p>
                                                </div>
                                            </div>
                                            <Checkbox
                                                checked={notifyGuest}
                                                onCheckedChange={(checked) => setNotifyGuest(checked as boolean)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 rounded-xl border">
                                            <div className="flex items-center gap-3">
                                                <DollarSign className="w-5 h-5 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">Ajustar Valor</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Aplicar diferença de tarifa
                                                    </p>
                                                </div>
                                            </div>
                                            <Checkbox
                                                checked={adjustPrice}
                                                onCheckedChange={(checked) => setAdjustPrice(checked as boolean)}
                                            />
                                        </div>

                                        {adjustPrice && (
                                            <div className="pl-4 border-l-2 border-primary space-y-2">
                                                <Label>Valor do Ajuste (R$)</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={priceAdjustment}
                                                    onChange={(e) => setPriceAdjustment(e.target.value)}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Valor positivo = cobrança adicional | Valor negativo = desconto
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Confirmation */}
                            {step === 5 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Confirmar Transferência</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Revise os detalhes antes de confirmar
                                        </p>
                                    </div>

                                    {/* Transfer Summary */}
                                    <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex-1">
                                                <p className="text-sm text-muted-foreground mb-1">Origem</p>
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={originProperty?.image}
                                                        alt={originProperty?.name}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                    <div>
                                                        <p className="font-semibold">{originProperty?.name}</p>
                                                        <p className="text-sm text-muted-foreground">{originProperty?.location}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="px-4">
                                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                                    <ArrowRight className="w-6 h-6 text-primary" />
                                                </div>
                                            </div>
                                            <div className="flex-1 text-right">
                                                <p className="text-sm text-muted-foreground mb-1">Destino</p>
                                                <div className="flex items-center gap-3 justify-end">
                                                    <div>
                                                        <p className="font-semibold">{destinationProperty?.name}</p>
                                                        <p className="text-sm text-muted-foreground">{destinationProperty?.location}</p>
                                                    </div>
                                                    <img
                                                        src={destinationProperty?.image}
                                                        alt={destinationProperty?.name}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reservation Details */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border space-y-3">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <User className="w-4 h-4 text-primary" />
                                                Hóspede
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Nome:</span>
                                                    <span className="font-medium">{selectedReservation?.guest}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Email:</span>
                                                    <span className="font-medium">{selectedReservation?.email}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Telefone:</span>
                                                    <span className="font-medium">{selectedReservation?.phone}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl border space-y-3">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                Reserva
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Código:</span>
                                                    <span className="font-medium">{selectedReservation?.id}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Período:</span>
                                                    <span className="font-medium">
                                                        {selectedReservation?.checkIn} - {selectedReservation?.checkOut}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Valor:</span>
                                                    <span className="font-medium">
                                                        {formatCurrency(selectedReservation?.total || 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transfer Details */}
                                    <div className="p-4 rounded-xl border space-y-3">
                                        <h4 className="font-medium flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-primary" />
                                            Detalhes da Transferência
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Motivo:</span>
                                                <span className="font-medium">
                                                    {transferReasons.find((r) => r.id === selectedReason)?.label}
                                                </span>
                                            </div>
                                            {selectedReason === "other" && reasonDetails && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Detalhes:</span>
                                                    <span className="font-medium">{reasonDetails}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Notificar hóspede:</span>
                                                <span className="font-medium">{notifyGuest ? "Sim" : "Não"}</span>
                                            </div>
                                            {adjustPrice && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Ajuste de valor:</span>
                                                    <span className="font-medium">
                                                        {formatCurrency(parseFloat(priceAdjustment) || 0)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Warning */}
                                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-amber-600">Atenção</p>
                                            <p className="text-sm text-muted-foreground">
                                                Esta ação não pode ser desfeita. A reserva será movida permanentemente para a propriedade de destino.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>

                        {/* Footer */}
                        <div className="p-4 border-t flex items-center justify-between">
                            <Button
                                variant="outline"
                                onClick={() => (step > 1 ? setStep(step - 1) : onOpenChange(false))}
                                disabled={isProcessing}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                {step > 1 ? "Voltar" : "Cancelar"}
                            </Button>

                            <div className="flex items-center gap-2">
                                {step < steps.length ? (
                                    <Button
                                        onClick={() => setStep(step + 1)}
                                        disabled={
                                            (step === 1 && !selectedReservation) ||
                                            (step === 2 && !selectedOrigin) ||
                                            (step === 3 && !selectedDestination) ||
                                            (step === 4 && !selectedReason)
                                        }
                                    >
                                        Continuar
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isProcessing}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                                                Processando...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-2" />
                                                Confirmar Transferência
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
