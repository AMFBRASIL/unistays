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
import { Switch } from "@/components/ui/switch";
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
    Building2,
    MapPin,
    Phone,
    Mail,
    Globe,
    User,
    BedDouble,
    DollarSign,
    Camera,
    Upload,
    Check,
    ChevronRight,
    ChevronLeft,
    Star,
    Wifi,
    Car,
    Coffee,
    Waves,
    Dumbbell,
    UtensilsCrossed,
    Sparkles,
    Shield,
    Clock,
    Settings,
    FileText,
    CreditCard,
    Building,
    Home,
    Hotel,
    Tent,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NewPropertyModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const propertyTypes = [
    { id: "hotel", name: "Hotel", icon: Hotel, description: "Hotel tradicional com serviços completos" },
    { id: "resort", name: "Resort", icon: Waves, description: "Resort com lazer e entretenimento" },
    { id: "pousada", name: "Pousada", icon: Home, description: "Pousada aconchegante e intimista" },
    { id: "hostel", name: "Hostel", icon: Building, description: "Hostel para viajantes" },
    { id: "apart", name: "Apart-Hotel", icon: Building2, description: "Apartamentos com serviços de hotel" },
    { id: "glamping", name: "Glamping", icon: Tent, description: "Experiência de camping luxuoso" },
];

const amenities = [
    { id: "wifi", name: "Wi-Fi", icon: Wifi },
    { id: "parking", name: "Estacionamento", icon: Car },
    { id: "breakfast", name: "Café da Manhã", icon: Coffee },
    { id: "pool", name: "Piscina", icon: Waves },
    { id: "gym", name: "Academia", icon: Dumbbell },
    { id: "restaurant", name: "Restaurante", icon: UtensilsCrossed },
    { id: "spa", name: "Spa", icon: Sparkles },
    { id: "security", name: "Segurança 24h", icon: Shield },
    { id: "concierge", name: "Concierge", icon: User },
    { id: "roomservice", name: "Room Service", icon: Clock },
];

const brazilianStates = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
    "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const steps = [
    { id: 1, title: "Tipo", icon: Building2 },
    { id: 2, title: "Informações", icon: FileText },
    { id: 3, title: "Localização", icon: MapPin },
    { id: 4, title: "Estrutura", icon: BedDouble },
    { id: 5, title: "Amenidades", icon: Star },
    { id: 6, title: "Financeiro", icon: CreditCard },
    { id: 7, title: "Configurações", icon: Settings },
    { id: 8, title: "Revisão", icon: Check },
];

export function NewPropertyModal({ open, onOpenChange }: NewPropertyModalProps) {
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState("");
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        tradeName: "",
        cnpj: "",
        stateRegistration: "",
        email: "",
        phone: "",
        website: "",
        description: "",
        cep: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        country: "Brasil",
        latitude: "",
        longitude: "",
        totalRooms: "",
        floors: "",
        checkInTime: "14:00",
        checkOutTime: "12:00",
        starRating: "4",
        bankName: "",
        bankAgency: "",
        bankAccount: "",
        bankAccountType: "corrente",
        pixKey: "",
        commissionRate: "10",
        paymentTerms: "30",
        managerName: "",
        managerEmail: "",
        managerPhone: "",
        autoConfirmation: true,
        overbookingAllowed: false,
        overbookingLimit: "5",
        minStay: "1",
        maxStay: "30",
        cancellationPolicy: "flexible",
        childPolicy: "allowed",
    });

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleAmenity = (id: string) => {
        setSelectedAmenities((prev) =>
            prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
        );
    };

    const fetchCEP = async (cep: string) => {
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormData((prev) => ({
                        ...prev,
                        street: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf,
                    }));
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            }
        }
    };

    const handleSubmit = () => {
        toast.success("Propriedade cadastrada com sucesso!", {
            description: `${formData.name} foi adicionada à rede.`,
        });
        resetForm();
        onOpenChange(false);
    };

    const resetForm = () => {
        setStep(1);
        setSelectedType("");
        setSelectedAmenities([]);
        setPhotoPreview(null);
        setFormData({
            name: "",
            tradeName: "",
            cnpj: "",
            stateRegistration: "",
            email: "",
            phone: "",
            website: "",
            description: "",
            cep: "",
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
            country: "Brasil",
            latitude: "",
            longitude: "",
            totalRooms: "",
            floors: "",
            checkInTime: "14:00",
            checkOutTime: "12:00",
            starRating: "4",
            bankName: "",
            bankAgency: "",
            bankAccount: "",
            bankAccountType: "corrente",
            pixKey: "",
            commissionRate: "10",
            paymentTerms: "30",
            managerName: "",
            managerEmail: "",
            managerPhone: "",
            autoConfirmation: true,
            overbookingAllowed: false,
            overbookingLimit: "5",
            minStay: "1",
            maxStay: "30",
            cancellationPolicy: "flexible",
            childPolicy: "allowed",
        });
    };

    const progress = (step / steps.length) * 100;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
                <div className="flex h-[85vh]">
                    {/* Sidebar */}
                    <div className="w-72 bg-muted/30 border-r p-6 hidden lg:flex flex-col">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="flex items-center gap-3 text-xl">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                                    <Building2 className="w-6 h-6 text-primary" />
                                </div>
                                Nova Propriedade
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-1 flex-1">
                            {steps.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setStep(s.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                        step === s.id
                                            ? "bg-primary text-primary-foreground"
                                            : step > s.id
                                                ? "text-muted-foreground hover:bg-muted"
                                                : "text-muted-foreground/50"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs",
                                            step === s.id
                                                ? "bg-primary-foreground/20"
                                                : step > s.id
                                                    ? "bg-primary/20 text-primary"
                                                    : "bg-muted"
                                        )}
                                    >
                                        {step > s.id ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                                    </div>
                                    {s.title}
                                </button>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 border-t">
                            <div className="text-sm text-muted-foreground mb-2">
                                Progresso: {Math.round(progress)}%
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                        {/* Mobile Header */}
                        <div className="lg:hidden p-4 border-b">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                                    <Building2 className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-semibold">Nova Propriedade</h2>
                                    <p className="text-xs text-muted-foreground">
                                        Etapa {step} de {steps.length}: {steps[step - 1].title}
                                    </p>
                                </div>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            {/* Step 1: Property Type */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Tipo de Propriedade</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Selecione o tipo que melhor descreve sua propriedade
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {propertyTypes.map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => setSelectedType(type.id)}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50",
                                                    selectedType === type.id
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border"
                                                )}
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div
                                                        className={cn(
                                                            "p-2 rounded-lg",
                                                            selectedType === type.id
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-muted"
                                                        )}
                                                    >
                                                        <type.icon className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-medium">{type.name}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{type.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Basic Information */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Informações Básicas</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Dados gerais da propriedade
                                        </p>
                                    </div>

                                    {/* Photo Upload */}
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <div className="w-32 h-32 rounded-xl bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
                                                {photoPreview ? (
                                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Camera className="w-8 h-8 text-muted-foreground" />
                                                )}
                                            </div>
                                            <label className="absolute -bottom-2 -right-2 p-2 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors">
                                                <Upload className="w-4 h-4" />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handlePhotoUpload}
                                                />
                                            </label>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium mb-1">Foto Principal</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Adicione uma foto de destaque da propriedade. Formatos aceitos: JPG, PNG
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nome da Propriedade *</Label>
                                            <Input
                                                placeholder="Ex: Grand Hotel São Paulo"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nome Fantasia</Label>
                                            <Input
                                                placeholder="Ex: Grand Hotel SP"
                                                value={formData.tradeName}
                                                onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>CNPJ *</Label>
                                            <Input
                                                placeholder="00.000.000/0000-00"
                                                value={formData.cnpj}
                                                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Inscrição Estadual</Label>
                                            <Input
                                                placeholder="000.000.000.000"
                                                value={formData.stateRegistration}
                                                onChange={(e) => setFormData({ ...formData, stateRegistration: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email *</Label>
                                            <Input
                                                type="email"
                                                placeholder="contato@hotel.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Telefone *</Label>
                                            <Input
                                                placeholder="(11) 99999-9999"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Website</Label>
                                            <Input
                                                placeholder="https://www.hotel.com"
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Descrição</Label>
                                            <Textarea
                                                placeholder="Descreva sua propriedade..."
                                                rows={4}
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Location */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Localização</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Endereço completo da propriedade
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>CEP *</Label>
                                            <Input
                                                placeholder="00000-000"
                                                value={formData.cep}
                                                onChange={(e) => {
                                                    const cep = e.target.value.replace(/\D/g, "");
                                                    setFormData({ ...formData, cep });
                                                    fetchCEP(cep);
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Logradouro *</Label>
                                            <Input
                                                placeholder="Rua, Avenida, etc."
                                                value={formData.street}
                                                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Número *</Label>
                                            <Input
                                                placeholder="000"
                                                value={formData.number}
                                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Complemento</Label>
                                            <Input
                                                placeholder="Apto, Bloco, etc."
                                                value={formData.complement}
                                                onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Bairro *</Label>
                                            <Input
                                                placeholder="Bairro"
                                                value={formData.neighborhood}
                                                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Cidade *</Label>
                                            <Input
                                                placeholder="Cidade"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Estado *</Label>
                                            <Select
                                                value={formData.state}
                                                onValueChange={(value) => setFormData({ ...formData, state: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {brazilianStates.map((state) => (
                                                        <SelectItem key={state} value={state}>
                                                            {state}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>País</Label>
                                            <Input value={formData.country} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Latitude</Label>
                                            <Input
                                                placeholder="-23.550520"
                                                value={formData.latitude}
                                                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Longitude</Label>
                                            <Input
                                                placeholder="-46.633308"
                                                value={formData.longitude}
                                                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Structure */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Estrutura</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Informações sobre a estrutura física
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Total de UHs (Quartos) *</Label>
                                            <Input
                                                type="number"
                                                placeholder="100"
                                                value={formData.totalRooms}
                                                onChange={(e) => setFormData({ ...formData, totalRooms: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Número de Andares</Label>
                                            <Input
                                                type="number"
                                                placeholder="10"
                                                value={formData.floors}
                                                onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Horário de Check-in</Label>
                                            <Input
                                                type="time"
                                                value={formData.checkInTime}
                                                onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Horário de Check-out</Label>
                                            <Input
                                                type="time"
                                                value={formData.checkOutTime}
                                                onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Classificação (Estrelas)</Label>
                                            <Select
                                                value={formData.starRating}
                                                onValueChange={(value) => setFormData({ ...formData, starRating: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">1 Estrela</SelectItem>
                                                    <SelectItem value="2">2 Estrelas</SelectItem>
                                                    <SelectItem value="3">3 Estrelas</SelectItem>
                                                    <SelectItem value="4">4 Estrelas</SelectItem>
                                                    <SelectItem value="5">5 Estrelas</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Amenities */}
                            {step === 5 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Amenidades</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Selecione os serviços e comodidades disponíveis
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {amenities.map((amenity) => (
                                            <button
                                                key={amenity.id}
                                                onClick={() => toggleAmenity(amenity.id)}
                                                className={cn(
                                                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                                                    selectedAmenities.includes(amenity.id)
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border hover:border-primary/50"
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "p-2 rounded-lg",
                                                        selectedAmenities.includes(amenity.id)
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-muted"
                                                    )}
                                                >
                                                    <amenity.icon className="w-5 h-5" />
                                                </div>
                                                <span className="font-medium">{amenity.name}</span>
                                                {selectedAmenities.includes(amenity.id) && (
                                                    <Check className="w-4 h-4 text-primary ml-auto" />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="p-4 rounded-xl bg-muted/50 border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                                {selectedAmenities.length} selecionadas
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Amenidades são exibidas no motor de reservas e ajudam os hóspedes na decisão.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 6: Financial */}
                            {step === 6 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Dados Financeiros</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Informações bancárias e condições comerciais
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Banco</Label>
                                            <Input
                                                placeholder="Nome do banco"
                                                value={formData.bankName}
                                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Agência</Label>
                                            <Input
                                                placeholder="0000"
                                                value={formData.bankAgency}
                                                onChange={(e) => setFormData({ ...formData, bankAgency: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Conta</Label>
                                            <Input
                                                placeholder="00000-0"
                                                value={formData.bankAccount}
                                                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tipo de Conta</Label>
                                            <Select
                                                value={formData.bankAccountType}
                                                onValueChange={(value) => setFormData({ ...formData, bankAccountType: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="corrente">Conta Corrente</SelectItem>
                                                    <SelectItem value="poupanca">Conta Poupança</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Chave PIX</Label>
                                            <Input
                                                placeholder="CPF, CNPJ, Email, Telefone ou Chave Aleatória"
                                                value={formData.pixKey}
                                                onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Taxa de Comissão (%)</Label>
                                            <Input
                                                type="number"
                                                placeholder="10"
                                                value={formData.commissionRate}
                                                onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Prazo de Pagamento (dias)</Label>
                                            <Input
                                                type="number"
                                                placeholder="30"
                                                value={formData.paymentTerms}
                                                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-muted/50 border">
                                        <h4 className="font-medium mb-3">Gestor Responsável</h4>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nome</Label>
                                                <Input
                                                    placeholder="Nome do gestor"
                                                    value={formData.managerName}
                                                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Email</Label>
                                                <Input
                                                    type="email"
                                                    placeholder="gestor@hotel.com"
                                                    value={formData.managerEmail}
                                                    onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Telefone</Label>
                                                <Input
                                                    placeholder="(11) 99999-9999"
                                                    value={formData.managerPhone}
                                                    onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 7: Settings */}
                            {step === 7 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Configurações</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Políticas e regras operacionais
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-xl border">
                                            <div>
                                                <h4 className="font-medium">Confirmação Automática</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Confirmar reservas automaticamente após pagamento
                                                </p>
                                            </div>
                                            <Switch
                                                checked={formData.autoConfirmation}
                                                onCheckedChange={(checked) =>
                                                    setFormData({ ...formData, autoConfirmation: checked })
                                                }
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 rounded-xl border">
                                            <div>
                                                <h4 className="font-medium">Permitir Overbooking</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Aceitar reservas além da capacidade máxima
                                                </p>
                                            </div>
                                            <Switch
                                                checked={formData.overbookingAllowed}
                                                onCheckedChange={(checked) =>
                                                    setFormData({ ...formData, overbookingAllowed: checked })
                                                }
                                            />
                                        </div>

                                        {formData.overbookingAllowed && (
                                            <div className="pl-4 border-l-2 border-primary">
                                                <div className="space-y-2">
                                                    <Label>Limite de Overbooking (%)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="5"
                                                        value={formData.overbookingLimit}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, overbookingLimit: e.target.value })
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Estadia Mínima (noites)</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="1"
                                                    value={formData.minStay}
                                                    onChange={(e) => setFormData({ ...formData, minStay: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Estadia Máxima (noites)</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="30"
                                                    value={formData.maxStay}
                                                    onChange={(e) => setFormData({ ...formData, maxStay: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Política de Cancelamento</Label>
                                                <Select
                                                    value={formData.cancellationPolicy}
                                                    onValueChange={(value) =>
                                                        setFormData({ ...formData, cancellationPolicy: value })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="flexible">Flexível (24h antes)</SelectItem>
                                                        <SelectItem value="moderate">Moderada (5 dias antes)</SelectItem>
                                                        <SelectItem value="strict">Rígida (7 dias antes)</SelectItem>
                                                        <SelectItem value="nonrefundable">Não Reembolsável</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Política de Crianças</Label>
                                                <Select
                                                    value={formData.childPolicy}
                                                    onValueChange={(value) => setFormData({ ...formData, childPolicy: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="allowed">Permitido</SelectItem>
                                                        <SelectItem value="notallowed">Não Permitido</SelectItem>
                                                        <SelectItem value="extra">Com Taxa Extra</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 8: Review */}
                            {step === 8 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Revisão Final</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Confira todas as informações antes de cadastrar
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Basic Info */}
                                        <div className="p-4 rounded-xl border space-y-3">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-primary" />
                                                Informações Básicas
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Nome:</span>
                                                    <span className="font-medium">{formData.name || "—"}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Tipo:</span>
                                                    <span className="font-medium">
                                                        {propertyTypes.find((t) => t.id === selectedType)?.name || "—"}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">CNPJ:</span>
                                                    <span className="font-medium">{formData.cnpj || "—"}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Email:</span>
                                                    <span className="font-medium">{formData.email || "—"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="p-4 rounded-xl border space-y-3">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                Localização
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Endereço:</span>
                                                    <span className="font-medium">
                                                        {formData.street ? `${formData.street}, ${formData.number}` : "—"}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Cidade:</span>
                                                    <span className="font-medium">
                                                        {formData.city ? `${formData.city} - ${formData.state}` : "—"}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">CEP:</span>
                                                    <span className="font-medium">{formData.cep || "—"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Structure */}
                                        <div className="p-4 rounded-xl border space-y-3">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <BedDouble className="w-4 h-4 text-primary" />
                                                Estrutura
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Total de UHs:</span>
                                                    <span className="font-medium">{formData.totalRooms || "—"}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Andares:</span>
                                                    <span className="font-medium">{formData.floors || "—"}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Check-in/out:</span>
                                                    <span className="font-medium">
                                                        {formData.checkInTime} / {formData.checkOutTime}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Classificação:</span>
                                                    <span className="font-medium flex items-center gap-1">
                                                        {formData.starRating}
                                                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Amenities */}
                                        <div className="p-4 rounded-xl border space-y-3">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-primary" />
                                                Amenidades
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedAmenities.length > 0 ? (
                                                    selectedAmenities.map((id) => {
                                                        const amenity = amenities.find((a) => a.id === id);
                                                        return (
                                                            <Badge key={id} variant="secondary">
                                                                {amenity?.name}
                                                            </Badge>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">Nenhuma selecionada</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                                        <div className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-primary mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-primary">Pronto para cadastrar!</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Revise as informações acima. Após o cadastro, a propriedade será integrada ao sistema central.
                                                </p>
                                            </div>
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
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                {step > 1 ? "Voltar" : "Cancelar"}
                            </Button>

                            <div className="flex items-center gap-2">
                                {step < steps.length ? (
                                    <Button onClick={() => setStep(step + 1)}>
                                        Continuar
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
                                        <Check className="w-4 h-4 mr-2" />
                                        Cadastrar Propriedade
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
