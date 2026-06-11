
import { useState, useRef } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    QrCode,
    Search,
    Calendar,
    BedDouble,
    Users,
    CreditCard,
    CheckCircle2,
    Clock,
    Fingerprint,
    Camera,
    FileText,
    Key,
    Sparkles,
    ChevronRight,
    ChevronLeft,
    User,
    Mail,
    Phone,
    MapPin,
    AlertCircle,
    Upload,
    X,
    FileImage,
    Smartphone,
    Send,
    MessageSquare,
    Globe,
    Car,
    Baby,
    Dog,
    Utensils,
    Wifi,
    DoorOpen,
    Shield,
    CreditCard as CardIcon,
    Banknote,
    Building2,
    UserPlus,
    ScanLine,
    RefreshCw,
    Copy,
    Download,
    Eye,
    Pencil,
    Plus,
    Settings,
    Star,
    Gift,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NewAutoCheckInModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

// Mock reservations data
const availableReservations = [
    {
        id: "RES-2024-001",
        guestName: "Carlos Eduardo Silva",
        email: "carlos.silva@email.com",
        phone: "+55 11 99999-1234",
        roomNumber: "501",
        roomType: "Suite Master",
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        adults: 2,
        children: 0,
        totalAmount: 4500,
        status: "confirmed",
        source: "Booking.com",
        specialRequests: "Late check-out se possível",
        preCheckin: true,
        vip: true,
    },
    {
        id: "RES-2024-002",
        guestName: "Ana Paula Rodrigues",
        email: "ana.rodrigues@email.com",
        phone: "+55 21 98888-5678",
        roomNumber: "305",
        roomType: "Deluxe Double",
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        adults: 1,
        children: 1,
        totalAmount: 2100,
        status: "confirmed",
        source: "Direto",
        specialRequests: "Berço para bebê",
        preCheckin: false,
        vip: false,
    },
    {
        id: "RES-2024-003",
        guestName: "Roberto Almeida Costa",
        email: "roberto.costa@empresa.com.br",
        phone: "+55 31 97777-9012",
        roomNumber: "402",
        roomType: "Executive Suite",
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        adults: 2,
        children: 2,
        totalAmount: 6300,
        status: "pending_payment",
        source: "Expedia",
        specialRequests: "Quartos conectados",
        preCheckin: true,
        vip: false,
    },
    {
        id: "RES-2024-004",
        guestName: "Mariana Santos Lima",
        email: "mariana.lima@gmail.com",
        phone: "+55 41 96666-3456",
        roomNumber: "203",
        roomType: "Standard",
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        adults: 1,
        children: 0,
        totalAmount: 800,
        status: "confirmed",
        source: "Airbnb",
        specialRequests: "",
        preCheckin: false,
        vip: false,
    },
];

const additionalServices = [
    { id: "breakfast", name: "Café da Manhã", price: 85, icon: Utensils },
    { id: "parking", name: "Estacionamento", price: 50, icon: Car },
    { id: "spa", name: "Acesso ao SPA", price: 150, icon: Sparkles },
    { id: "minibar", name: "Frigobar Premium", price: 120, icon: Gift },
    { id: "late_checkout", name: "Late Check-out", price: 180, icon: Clock },
    { id: "early_checkin", name: "Early Check-in", price: 150, icon: DoorOpen },
];

const stepInfo = [
    { step: 1, title: "Reserva", icon: Search },
    { step: 2, title: "Hóspede", icon: User },
    { step: 3, title: "Documentos", icon: FileText },
    { step: 4, title: "Pagamento", icon: CreditCard },
    { step: 5, title: "Confirmação", icon: CheckCircle2 },
];

export function NewAutoCheckInModal({ open, onOpenChange }: NewAutoCheckInModalProps) {
    const { toast } = useToast();
    const [step, setStep] = useState<Step>(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedReservation, setSelectedReservation] = useState<typeof availableReservations[0] | null>(null);

    // Guest data state
    const [guestData, setGuestData] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        rg: "",
        birthDate: "",
        nationality: "Brasileiro",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        company: "",
        profession: "",
        emergencyContact: "",
        emergencyPhone: "",
    });

    // Document state
    const [documents, setDocuments] = useState({
        idFront: null as File | null,
        idBack: null as File | null,
        selfie: null as File | null,
    });
    const [documentPreviews, setDocumentPreviews] = useState({
        idFront: null as string | null,
        idBack: null as string | null,
        selfie: null as string | null,
    });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [gdprAccepted, setGdprAccepted] = useState(false);

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState("credit_card");
    const [paymentStatus, setPaymentStatus] = useState("pending");
    const [depositAmount, setDepositAmount] = useState("");
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    // Room state
    const [roomReady, setRoomReady] = useState(true);
    const [keyType, setKeyType] = useState("digital");
    const [observations, setObservations] = useState("");

    // Refs
    const fileInputRefs = {
        idFront: useRef<HTMLInputElement>(null),
        idBack: useRef<HTMLInputElement>(null),
        selfie: useRef<HTMLInputElement>(null),
    };

    const filteredReservations = availableReservations.filter(
        (r) =>
            r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.roomNumber.includes(searchTerm)
    );

    const handleFileUpload = (type: keyof typeof documents) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setDocuments((prev) => ({ ...prev, [type]: file }));
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setDocumentPreviews((prev) => ({ ...prev, [type]: reader.result as string }));
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const removeDocument = (type: keyof typeof documents) => {
        setDocuments((prev) => ({ ...prev, [type]: null }));
        setDocumentPreviews((prev) => ({ ...prev, [type]: null }));
        if (fileInputRefs[type].current) {
            fileInputRefs[type].current.value = "";
        }
    };

    const handleSelectReservation = (reservation: typeof availableReservations[0]) => {
        setSelectedReservation(reservation);
        setGuestData({
            ...guestData,
            name: reservation.guestName,
            email: reservation.email,
            phone: reservation.phone,
        });
    };

    const handleNext = () => {
        if (step < 5) setStep((step + 1) as Step);
    };

    const handleBack = () => {
        if (step > 1) setStep((step - 1) as Step);
    };

    const handleComplete = () => {
        toast({
            title: "Check-in Realizado com Sucesso!",
            description: `${selectedReservation?.guestName} - Quarto ${selectedReservation?.roomNumber}`,
        });
        onOpenChange(false);
        resetModal();
    };

    const resetModal = () => {
        setStep(1);
        setSelectedReservation(null);
        setSearchTerm("");
        setGuestData({
            name: "",
            email: "",
            phone: "",
            cpf: "",
            rg: "",
            birthDate: "",
            nationality: "Brasileiro",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            company: "",
            profession: "",
            emergencyContact: "",
            emergencyPhone: "",
        });
        setDocuments({ idFront: null, idBack: null, selfie: null });
        setDocumentPreviews({ idFront: null, idBack: null, selfie: null });
        setTermsAccepted(false);
        setGdprAccepted(false);
        setPaymentMethod("credit_card");
        setPaymentStatus("pending");
        setDepositAmount("");
        setSelectedServices([]);
        setRoomReady(true);
        setKeyType("digital");
        setObservations("");
    };

    const handleSendQRCode = () => {
        toast({
            title: "QR Code Enviado",
            description: `Link de check-in digital enviado para ${selectedReservation?.email}`,
        });
    };

    const calculateTotal = () => {
        const baseTotal = selectedReservation?.totalAmount || 0;
        const servicesTotal = selectedServices.reduce((acc, serviceId) => {
            const service = additionalServices.find((s) => s.id === serviceId);
            return acc + (service?.price || 0);
        }, 0);
        return baseTotal + servicesTotal;
    };

    const canProceed = () => {
        switch (step) {
            case 1:
                return selectedReservation !== null;
            case 2:
                return guestData.name && guestData.cpf;
            case 3:
                return termsAccepted && gdprAccepted;
            case 4:
                return paymentStatus === "confirmed" || paymentStatus === "pending";
            default:
                return true;
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                onOpenChange(isOpen);
                if (!isOpen) resetModal();
            }}
        >
            <DialogContent className="max-w-5xl h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="p-0 flex-shrink-0">
                    <div className="relative bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 p-6 overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjMiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvZz48L3N2Zz4=')] opacity-40"></div>
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                    <QrCode className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-bold text-white">Novo Check-in Digital</DialogTitle>
                                    <DialogDescription className="text-white/80 mt-1">
                                        Realize o check-in completo de forma rápida e inteligente
                                    </DialogDescription>
                                </div>
                            </div>
                            {selectedReservation && (
                                <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                                    <div className="text-right">
                                        <p className="text-white font-medium">{selectedReservation.guestName}</p>
                                        <p className="text-white/70 text-sm">Quarto {selectedReservation.roomNumber}</p>
                                    </div>
                                    {selectedReservation.vip && (
                                        <Badge className="bg-amber-500/20 text-amber-200 border-amber-400/30">
                                            <Star className="w-3 h-3 mr-1 fill-current" />
                                            VIP
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Step Indicator */}
                        <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6">
                            {stepInfo.map((s, index) => (
                                <div key={s.step} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                                step >= s.step
                                                    ? "bg-white text-emerald-600 shadow-lg"
                                                    : "bg-white/20 text-white/60"
                                            )}
                                        >
                                            {step > s.step ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <s.icon className="w-5 h-5" />
                                            )}
                                        </div>
                                        <span
                                            className={cn(
                                                "text-xs mt-1 hidden sm:block",
                                                step >= s.step ? "text-white font-medium" : "text-white/60"
                                            )}
                                        >
                                            {s.title}
                                        </span>
                                    </div>
                                    {index < stepInfo.length - 1 && (
                                        <div
                                            className={cn(
                                                "w-8 sm:w-12 h-1 mx-1 rounded-full transition-all",
                                                step > s.step ? "bg-white" : "bg-white/20"
                                            )}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogHeader>

                {/* Content */}
                <ScrollArea className="flex-1 overflow-auto">
                    <div className="p-6">
                        {/* Step 1: Select Reservation */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold">Selecionar Reserva</h3>
                                    <p className="text-muted-foreground">
                                        Busque pela reserva ou selecione da lista de chegadas de hoje
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por nome, código ou quarto..."
                                            className="pl-10 h-12"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" size="icon" className="h-12 w-12">
                                        <ScanLine className="w-5 h-5" />
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-muted-foreground">
                                            Chegadas de Hoje ({filteredReservations.length})
                                        </h4>
                                        <Button variant="ghost" size="sm">
                                            <RefreshCw className="w-4 h-4 mr-1" />
                                            Atualizar
                                        </Button>
                                    </div>

                                    {filteredReservations.map((reservation) => (
                                        <div
                                            key={reservation.id}
                                            onClick={() => handleSelectReservation(reservation)}
                                            className={cn(
                                                "p-4 rounded-xl border-2 cursor-pointer transition-all",
                                                selectedReservation?.id === reservation.id
                                                    ? "border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10"
                                                    : "border-border hover:border-emerald-500/50 hover:shadow-md"
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                                                            {reservation.guestName
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")
                                                                .slice(0, 2)}
                                                        </div>
                                                        {reservation.vip && (
                                                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                                                                <Star className="w-3 h-3 text-white fill-current" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="font-semibold">{reservation.guestName}</h4>
                                                            {reservation.preCheckin && (
                                                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                                                    <Sparkles className="w-3 h-3 mr-1" />
                                                                    Pré Check-in
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {reservation.roomType} • Quarto {reservation.roomNumber}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {format(reservation.checkIn, "dd/MM")} - {format(reservation.checkOut, "dd/MM")}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-3 h-3" />
                                                                {reservation.adults} adultos
                                                                {reservation.children > 0 && `, ${reservation.children} crianças`}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Globe className="w-3 h-3" />
                                                                {reservation.source}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs text-muted-foreground font-mono">#{reservation.id}</p>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "mt-1",
                                                            reservation.status === "confirmed"
                                                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                        )}
                                                    >
                                                        {reservation.status === "confirmed" ? "Confirmado" : "Pag. Pendente"}
                                                    </Badge>
                                                    <p className="text-lg font-bold mt-2">
                                                        R$ {reservation.totalAmount.toLocaleString("pt-BR")}
                                                    </p>
                                                </div>
                                            </div>
                                            {reservation.specialRequests && (
                                                <div className="mt-3 pt-3 border-t border-dashed">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <MessageSquare className="w-3 h-3" />
                                                        {reservation.specialRequests}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Manual Entry Option */}
                                <div className="text-center pt-4 border-t">
                                    <Button variant="outline" className="gap-2">
                                        <UserPlus className="w-4 h-4" />
                                        Criar Check-in Manual (Walk-in)
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Guest Information */}
                        {step === 2 && selectedReservation && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                                        <User className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold">Dados do Hóspede</h3>
                                    <p className="text-muted-foreground">Confirme e complete as informações do hóspede</p>
                                </div>

                                <Tabs defaultValue="principal" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="principal">Principal</TabsTrigger>
                                        <TabsTrigger value="endereco">Endereço</TabsTrigger>
                                        <TabsTrigger value="adicional">Adicional</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="principal" className="space-y-4 mt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nome Completo *</Label>
                                                <Input
                                                    value={guestData.name}
                                                    onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
                                                    placeholder="Nome completo"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>CPF *</Label>
                                                <Input
                                                    value={guestData.cpf}
                                                    onChange={(e) => setGuestData({ ...guestData, cpf: e.target.value })}
                                                    placeholder="000.000.000-00"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>RG</Label>
                                                <Input
                                                    value={guestData.rg}
                                                    onChange={(e) => setGuestData({ ...guestData, rg: e.target.value })}
                                                    placeholder="00.000.000-0"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Data de Nascimento</Label>
                                                <Input
                                                    type="date"
                                                    value={guestData.birthDate}
                                                    onChange={(e) => setGuestData({ ...guestData, birthDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Email</Label>
                                                <Input
                                                    type="email"
                                                    value={guestData.email}
                                                    onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                                                    placeholder="email@exemplo.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Telefone</Label>
                                                <Input
                                                    value={guestData.phone}
                                                    onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
                                                    placeholder="+55 11 99999-9999"
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Nacionalidade</Label>
                                                <Select
                                                    value={guestData.nationality}
                                                    onValueChange={(value) => setGuestData({ ...guestData, nationality: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Brasileiro">Brasileiro</SelectItem>
                                                        <SelectItem value="Argentino">Argentino</SelectItem>
                                                        <SelectItem value="Americano">Americano</SelectItem>
                                                        <SelectItem value="Português">Português</SelectItem>
                                                        <SelectItem value="Outro">Outro</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="endereco" className="space-y-4 mt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Endereço</Label>
                                                <Input
                                                    value={guestData.address}
                                                    onChange={(e) => setGuestData({ ...guestData, address: e.target.value })}
                                                    placeholder="Rua, número, complemento"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Cidade</Label>
                                                <Input
                                                    value={guestData.city}
                                                    onChange={(e) => setGuestData({ ...guestData, city: e.target.value })}
                                                    placeholder="Cidade"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Estado</Label>
                                                <Input
                                                    value={guestData.state}
                                                    onChange={(e) => setGuestData({ ...guestData, state: e.target.value })}
                                                    placeholder="Estado"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>CEP</Label>
                                                <Input
                                                    value={guestData.zipCode}
                                                    onChange={(e) => setGuestData({ ...guestData, zipCode: e.target.value })}
                                                    placeholder="00000-000"
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="adicional" className="space-y-4 mt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Empresa</Label>
                                                <Input
                                                    value={guestData.company}
                                                    onChange={(e) => setGuestData({ ...guestData, company: e.target.value })}
                                                    placeholder="Nome da empresa"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Profissão</Label>
                                                <Input
                                                    value={guestData.profession}
                                                    onChange={(e) => setGuestData({ ...guestData, profession: e.target.value })}
                                                    placeholder="Profissão"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Contato de Emergência</Label>
                                                <Input
                                                    value={guestData.emergencyContact}
                                                    onChange={(e) => setGuestData({ ...guestData, emergencyContact: e.target.value })}
                                                    placeholder="Nome do contato"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Telefone de Emergência</Label>
                                                <Input
                                                    value={guestData.emergencyPhone}
                                                    onChange={(e) => setGuestData({ ...guestData, emergencyPhone: e.target.value })}
                                                    placeholder="+55 11 99999-9999"
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                {/* Reservation Summary */}
                                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/20">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <BedDouble className="w-4 h-4 text-emerald-500" />
                                        Resumo da Reserva
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Quarto</p>
                                            <p className="font-medium">{selectedReservation.roomNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Tipo</p>
                                            <p className="font-medium">{selectedReservation.roomType}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Período</p>
                                            <p className="font-medium">
                                                {format(selectedReservation.checkIn, "dd/MM")} - {format(selectedReservation.checkOut, "dd/MM")}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Hóspedes</p>
                                            <p className="font-medium">
                                                {selectedReservation.adults + selectedReservation.children} pessoas
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Documents */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-8 h-8 text-purple-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold">Documentação</h3>
                                    <p className="text-muted-foreground">Capture ou faça upload dos documentos do hóspede</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* ID Front */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Documento (Frente)</Label>
                                        <input
                                            type="file"
                                            ref={fileInputRefs.idFront}
                                            onChange={handleFileUpload("idFront")}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        {documentPreviews.idFront ? (
                                            <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-emerald-500">
                                                <img
                                                    src={documentPreviews.idFront}
                                                    alt="ID Front"
                                                    className="w-full h-full object-cover"
                                                />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-8 w-8"
                                                    onClick={() => removeDocument("idFront")}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                                <div className="absolute bottom-2 left-2">
                                                    <Badge className="bg-emerald-500">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        Capturado
                                                    </Badge>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => fileInputRefs.idFront.current?.click()}
                                                className="aspect-video rounded-xl border-2 border-dashed border-purple-500/30 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/60 hover:bg-purple-500/5 transition-all"
                                            >
                                                <Camera className="w-8 h-8 text-purple-400 mb-2" />
                                                <p className="text-sm text-muted-foreground">Clique para capturar</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* ID Back */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Documento (Verso)</Label>
                                        <input
                                            type="file"
                                            ref={fileInputRefs.idBack}
                                            onChange={handleFileUpload("idBack")}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        {documentPreviews.idBack ? (
                                            <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-emerald-500">
                                                <img
                                                    src={documentPreviews.idBack}
                                                    alt="ID Back"
                                                    className="w-full h-full object-cover"
                                                />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-8 w-8"
                                                    onClick={() => removeDocument("idBack")}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                                <div className="absolute bottom-2 left-2">
                                                    <Badge className="bg-emerald-500">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        Capturado
                                                    </Badge>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => fileInputRefs.idBack.current?.click()}
                                                className="aspect-video rounded-xl border-2 border-dashed border-purple-500/30 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/60 hover:bg-purple-500/5 transition-all"
                                            >
                                                <Camera className="w-8 h-8 text-purple-400 mb-2" />
                                                <p className="text-sm text-muted-foreground">Clique para capturar</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Selfie */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Selfie do Hóspede</Label>
                                        <input
                                            type="file"
                                            ref={fileInputRefs.selfie}
                                            onChange={handleFileUpload("selfie")}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        {documentPreviews.selfie ? (
                                            <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-emerald-500">
                                                <img
                                                    src={documentPreviews.selfie}
                                                    alt="Selfie"
                                                    className="w-full h-full object-cover"
                                                />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-8 w-8"
                                                    onClick={() => removeDocument("selfie")}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                                <div className="absolute bottom-2 left-2">
                                                    <Badge className="bg-emerald-500">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        Capturado
                                                    </Badge>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => fileInputRefs.selfie.current?.click()}
                                                className="aspect-video rounded-xl border-2 border-dashed border-purple-500/30 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/60 hover:bg-purple-500/5 transition-all"
                                            >
                                                <User className="w-8 h-8 text-purple-400 mb-2" />
                                                <p className="text-sm text-muted-foreground">Clique para capturar</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Terms and Agreements */}
                                <div className="space-y-4 p-4 rounded-xl bg-muted/50 border">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-blue-500" />
                                        Termos e Consentimentos
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                id="terms"
                                                checked={termsAccepted}
                                                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                                            />
                                            <div>
                                                <Label htmlFor="terms" className="cursor-pointer">
                                                    Aceito os Termos de Hospedagem e Regulamento Interno *
                                                </Label>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Li e concordo com as regras do estabelecimento
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                id="gdpr"
                                                checked={gdprAccepted}
                                                onCheckedChange={(checked) => setGdprAccepted(checked as boolean)}
                                            />
                                            <div>
                                                <Label htmlFor="gdpr" className="cursor-pointer">
                                                    Concordo com a Política de Privacidade (LGPD) *
                                                </Label>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Autorizo o tratamento dos meus dados conforme a legislação
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Send QR Code Option */}
                                <div className="p-4 rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                                <QrCode className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Check-in Digital</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Enviar link para o hóspede completar via smartphone
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" onClick={handleSendQRCode}>
                                            <Send className="w-4 h-4 mr-2" />
                                            Enviar Link
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Payment & Services */}
                        {step === 4 && selectedReservation && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                                        <CreditCard className="w-8 h-8 text-amber-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold">Pagamento e Serviços</h3>
                                    <p className="text-muted-foreground">Confirme o pagamento e adicione serviços extras</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Payment Section */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium flex items-center gap-2">
                                            <CardIcon className="w-4 h-4" />
                                            Forma de Pagamento
                                        </h4>

                                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                                            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                                                <RadioGroupItem value="credit_card" id="credit_card" />
                                                <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer flex-1">
                                                    <CardIcon className="w-4 h-4 text-blue-500" />
                                                    Cartão de Crédito
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                                                <RadioGroupItem value="debit_card" id="debit_card" />
                                                <Label htmlFor="debit_card" className="flex items-center gap-2 cursor-pointer flex-1">
                                                    <CardIcon className="w-4 h-4 text-emerald-500" />
                                                    Cartão de Débito
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                                                <RadioGroupItem value="pix" id="pix" />
                                                <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer flex-1">
                                                    <Zap className="w-4 h-4 text-teal-500" />
                                                    PIX
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                                                <RadioGroupItem value="cash" id="cash" />
                                                <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                                                    <Banknote className="w-4 h-4 text-green-500" />
                                                    Dinheiro
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                                                <RadioGroupItem value="invoice" id="invoice" />
                                                <Label htmlFor="invoice" className="flex items-center gap-2 cursor-pointer flex-1">
                                                    <Building2 className="w-4 h-4 text-purple-500" />
                                                    Faturado
                                                </Label>
                                            </div>
                                        </RadioGroup>

                                        <div className="space-y-2">
                                            <Label>Status do Pagamento</Label>
                                            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pendente</SelectItem>
                                                    <SelectItem value="partial">Parcial</SelectItem>
                                                    <SelectItem value="confirmed">Confirmado</SelectItem>
                                                    <SelectItem value="guaranteed">Garantido (Cartão)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Caução / Depósito</Label>
                                            <Input
                                                type="number"
                                                value={depositAmount}
                                                onChange={(e) => setDepositAmount(e.target.value)}
                                                placeholder="R$ 0,00"
                                            />
                                        </div>
                                    </div>

                                    {/* Additional Services */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" />
                                            Serviços Adicionais
                                        </h4>

                                        <div className="space-y-2">
                                            {additionalServices.map((service) => (
                                                <div
                                                    key={service.id}
                                                    onClick={() => {
                                                        setSelectedServices((prev) =>
                                                            prev.includes(service.id)
                                                                ? prev.filter((id) => id !== service.id)
                                                                : [...prev, service.id]
                                                        );
                                                    }}
                                                    className={cn(
                                                        "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                                                        selectedServices.includes(service.id)
                                                            ? "border-emerald-500 bg-emerald-500/5"
                                                            : "hover:bg-muted/50"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Checkbox checked={selectedServices.includes(service.id)} />
                                                        <service.icon className="w-4 h-4 text-muted-foreground" />
                                                        <span>{service.name}</span>
                                                    </div>
                                                    <span className="font-medium">R$ {service.price}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Total Summary */}
                                        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Hospedagem</span>
                                                    <span>R$ {selectedReservation.totalAmount.toLocaleString("pt-BR")}</span>
                                                </div>
                                                {selectedServices.length > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Serviços Adicionais</span>
                                                        <span>
                                                            R${" "}
                                                            {selectedServices
                                                                .reduce((acc, id) => {
                                                                    const service = additionalServices.find((s) => s.id === id);
                                                                    return acc + (service?.price || 0);
                                                                }, 0)
                                                                .toLocaleString("pt-BR")}
                                                        </span>
                                                    </div>
                                                )}
                                                {depositAmount && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Caução</span>
                                                        <span>R$ {Number(depositAmount).toLocaleString("pt-BR")}</span>
                                                    </div>
                                                )}
                                                <div className="pt-2 border-t flex justify-between font-bold text-lg">
                                                    <span>Total</span>
                                                    <span className="text-emerald-500">R$ {calculateTotal().toLocaleString("pt-BR")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Room Configuration */}
                                <div className="p-4 rounded-xl border space-y-4">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <Key className="w-4 h-4" />
                                        Configuração do Quarto
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                            <div className="flex items-center gap-2">
                                                <DoorOpen className="w-4 h-4 text-muted-foreground" />
                                                <span>Quarto Pronto</span>
                                            </div>
                                            <Switch checked={roomReady} onCheckedChange={setRoomReady} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tipo de Chave</Label>
                                            <Select value={keyType} onValueChange={setKeyType}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="digital">Chave Digital (App)</SelectItem>
                                                    <SelectItem value="card">Cartão Magnético</SelectItem>
                                                    <SelectItem value="physical">Chave Física</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Observações</Label>
                                        <Textarea
                                            value={observations}
                                            onChange={(e) => setObservations(e.target.value)}
                                            placeholder="Observações internas sobre o check-in..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Confirmation */}
                        {step === 5 && selectedReservation && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                                        <CheckCircle2 className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold">Confirmar Check-in</h3>
                                    <p className="text-muted-foreground">Revise todas as informações antes de finalizar</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Guest Summary */}
                                    <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-blue-500/10 space-y-4">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            <User className="w-4 h-4 text-blue-500" />
                                            Hóspede
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl">
                                                    {selectedReservation.guestName
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .slice(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-lg">{guestData.name || selectedReservation.guestName}</p>
                                                    <p className="text-sm text-muted-foreground">{guestData.cpf || "CPF não informado"}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Email</p>
                                                    <p className="font-medium">{guestData.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Telefone</p>
                                                    <p className="font-medium">{guestData.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Room Summary */}
                                    <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10 space-y-4">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            <BedDouble className="w-4 h-4 text-emerald-500" />
                                            Acomodação
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Quarto</span>
                                                <span className="font-bold text-2xl">{selectedReservation.roomNumber}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Tipo</span>
                                                <span className="font-medium">{selectedReservation.roomType}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Período</span>
                                                <span className="font-medium">
                                                    {format(selectedReservation.checkIn, "dd/MM/yyyy")} -{" "}
                                                    {format(selectedReservation.checkOut, "dd/MM/yyyy")}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Chave</span>
                                                <Badge variant="outline">
                                                    {keyType === "digital" ? "Digital" : keyType === "card" ? "Cartão" : "Física"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Summary */}
                                    <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/10 space-y-4">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-amber-500" />
                                            Pagamento
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Forma</span>
                                                <span className="font-medium capitalize">
                                                    {paymentMethod === "credit_card"
                                                        ? "Cartão de Crédito"
                                                        : paymentMethod === "debit_card"
                                                            ? "Cartão de Débito"
                                                            : paymentMethod === "pix"
                                                                ? "PIX"
                                                                : paymentMethod === "cash"
                                                                    ? "Dinheiro"
                                                                    : "Faturado"}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Status</span>
                                                <Badge
                                                    className={cn(
                                                        paymentStatus === "confirmed" || paymentStatus === "guaranteed"
                                                            ? "bg-emerald-500/10 text-emerald-500"
                                                            : "bg-amber-500/10 text-amber-500"
                                                    )}
                                                >
                                                    {paymentStatus === "confirmed"
                                                        ? "Confirmado"
                                                        : paymentStatus === "guaranteed"
                                                            ? "Garantido"
                                                            : paymentStatus === "partial"
                                                                ? "Parcial"
                                                                : "Pendente"}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t">
                                                <span className="font-semibold">Total</span>
                                                <span className="font-bold text-xl text-emerald-500">
                                                    R$ {calculateTotal().toLocaleString("pt-BR")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Services Summary */}
                                    <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/10 space-y-4">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-purple-500" />
                                            Serviços Inclusos
                                        </h4>
                                        {selectedServices.length > 0 ? (
                                            <div className="space-y-2">
                                                {selectedServices.map((serviceId) => {
                                                    const service = additionalServices.find((s) => s.id === serviceId);
                                                    return (
                                                        service && (
                                                            <div key={serviceId} className="flex items-center justify-between text-sm">
                                                                <span className="flex items-center gap-2">
                                                                    <service.icon className="w-4 h-4 text-muted-foreground" />
                                                                    {service.name}
                                                                </span>
                                                                <span className="font-medium">R$ {service.price}</span>
                                                            </div>
                                                        )
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Nenhum serviço adicional selecionado</p>
                                        )}
                                    </div>
                                </div>

                                {/* Observations */}
                                {observations && (
                                    <div className="p-4 rounded-xl border bg-muted/30">
                                        <h4 className="font-medium mb-2 flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" />
                                            Observações
                                        </h4>
                                        <p className="text-sm text-muted-foreground">{observations}</p>
                                    </div>
                                )}

                                {/* Final Action */}
                                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                            <Key className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">Chave Digital Pronta</p>
                                            <p className="text-sm text-muted-foreground">
                                                A chave será liberada automaticamente após a confirmação
                                            </p>
                                        </div>
                                        <Badge className="bg-emerald-500/20 text-emerald-500">
                                            <Wifi className="w-3 h-3 mr-1" />
                                            Bluetooth/NFC
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="flex-shrink-0 border-t bg-background/80 backdrop-blur-sm p-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={step === 1 ? () => onOpenChange(false) : handleBack}
                            className="gap-2"
                        >
                            {step === 1 ? (
                                "Cancelar"
                            ) : (
                                <>
                                    <ChevronLeft className="w-4 h-4" />
                                    Voltar
                                </>
                            )}
                        </Button>

                        <div className="flex items-center gap-2">
                            {step === 5 ? (
                                <Button
                                    onClick={handleComplete}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 gap-2 px-8"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    Confirmar Check-in
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleNext}
                                    disabled={!canProceed()}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 gap-2"
                                >
                                    Continuar
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
