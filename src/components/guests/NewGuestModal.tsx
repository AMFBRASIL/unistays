import { useState, useEffect } from "react";
import { api } from "@/lib/api";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    User,
    Mail,
    Phone,
    MapPin,
    FileText,
    Globe,
    Calendar,
    CreditCard,
    Heart,
    Star,
    Building2,
    UserCheck,
    Shield,
    Camera,
    Upload,
    Check,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Gift,
    Clock,
    MessageSquare,
    Award,
    Bed,
    Coffee,
    Wifi,
    Car,
    Utensils,
    Wine,
    Dumbbell,
    Waves,
    Briefcase,
    Users,
    Baby,
    Dog,
    Accessibility,
    Volume2,
    ThermometerSun,
    Moon,
    Sunrise,
    Lock,
    Key,
    Eye,
    EyeOff,
} from "lucide-react";

export interface Guest {
    id: number;
    uuid: string;
    name: string;
    email: string;
    phone: string;
    document: string;
    nationality: string;
    city: string;
    totalStays: number;
    totalSpent: number;
    lastStay: string;
    nextStay?: string;
    rating: number;
    tier: "bronze" | "silver" | "gold" | "platinum";
    tags: string[];
    preferences: string[];
    avatar?: string;
    createdAt: string;
    // Extended fields
    address?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    type?: "physical" | "legal";
    whatsapp?: string;
    companyName?: string;
    tradeName?: string;
    stateRegistration?: string;
    cnpj?: string;
    contactName?: string;
    addressNumber?: string;
    addressComplement?: string;
    addressNeighborhood?: string;
    memberSince?: string;
    marketingEmail?: boolean;
    marketingSms?: boolean;
    marketingWhatsapp?: boolean;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyRelation?: string;
    birthDate?: string;
    gender?: string;
    occupation?: string;
    notes?: string;
}

interface NewGuestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (guest?: any) => void;
    guestToEdit?: Guest | null;
}

const personTypes = [
    { value: "physical", label: "Pessoa Física", icon: User, description: "CPF - Pessoa física" },
    { value: "legal", label: "Pessoa Jurídica", icon: Building2, description: "CNPJ - Empresa" },
];

/** Máscara CPF: 000.000.000-00 */
const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

/** Máscara CNPJ: 00.000.000/0000-00 */
const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
};

/** Máscara telefone: (00) 00000-0000 */
const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers ? `(${numbers}` : "";
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

const loyaltyTiers = [
    { value: "bronze", label: "Bronze", color: "from-amber-600 to-amber-800", icon: "🥉" },
    { value: "silver", label: "Prata", color: "from-slate-400 to-slate-600", icon: "🥈" },
    { value: "gold", label: "Ouro", color: "from-yellow-400 to-yellow-600", icon: "🥇" },
    { value: "platinum", label: "Platina", color: "from-purple-400 to-purple-600", icon: "💎" },
];

const guestTags = [
    { value: "vip", label: "VIP", color: "bg-purple-500" },
    { value: "corporativo", label: "Corporativo", color: "bg-blue-500" },
    { value: "frequente", label: "Frequente", color: "bg-green-500" },
    { value: "familia", label: "Família", color: "bg-orange-500" },
    { value: "lua-de-mel", label: "Lua de Mel", color: "bg-pink-500" },
    { value: "aniversariante", label: "Aniversariante", color: "bg-red-500" },
    { value: "primeira-vez", label: "Primeira Vez", color: "bg-teal-500" },
    { value: "influencer", label: "Influencer", color: "bg-indigo-500" },
];

const preferenceCategories = [
    {
        category: "Quarto",
        icon: Bed,
        preferences: [
            { id: "high-floor", label: "Andar alto", icon: Building2 },
            { id: "low-floor", label: "Andar baixo", icon: Building2 },
            { id: "quiet-room", label: "Quarto silencioso", icon: Volume2 },
            { id: "view", label: "Com vista", icon: Sunrise },
            { id: "connecting", label: "Quartos conectados", icon: Users },
            { id: "accessibility", label: "Acessibilidade", icon: Accessibility },
        ],
    },
    {
        category: "Travesseiros & Cama",
        icon: Moon,
        preferences: [
            { id: "extra-pillows", label: "Travesseiros extras", icon: Moon },
            { id: "firm-mattress", label: "Colchão firme", icon: Bed },
            { id: "soft-mattress", label: "Colchão macio", icon: Bed },
            { id: "hypoallergenic", label: "Hipoalergênico", icon: Shield },
        ],
    },
    {
        category: "Alimentação",
        icon: Utensils,
        preferences: [
            { id: "breakfast-room", label: "Café no quarto", icon: Coffee },
            { id: "vegetarian", label: "Vegetariano", icon: Utensils },
            { id: "vegan", label: "Vegano", icon: Utensils },
            { id: "gluten-free", label: "Sem glúten", icon: Utensils },
            { id: "lactose-free", label: "Sem lactose", icon: Utensils },
        ],
    },
    {
        category: "Serviços",
        icon: Star,
        preferences: [
            { id: "late-checkout", label: "Late check-out", icon: Clock },
            { id: "early-checkin", label: "Early check-in", icon: Sunrise },
            { id: "spa", label: "Spa", icon: Waves },
            { id: "gym", label: "Academia", icon: Dumbbell },
            { id: "parking", label: "Estacionamento", icon: Car },
            { id: "wifi-fast", label: "Wi-Fi rápido", icon: Wifi },
        ],
    },
    {
        category: "Especiais",
        icon: Gift,
        preferences: [
            { id: "champagne", label: "Champagne", icon: Wine },
            { id: "flowers", label: "Flores no quarto", icon: Heart },
            { id: "baby-crib", label: "Berço", icon: Baby },
            { id: "pet-friendly", label: "Pet friendly", icon: Dog },
            { id: "work-desk", label: "Mesa de trabalho", icon: Briefcase },
        ],
    },
];

const countries = [
    "Brasil", "Argentina", "Chile", "Uruguai", "Paraguai", "Colômbia", "Peru",
    "Estados Unidos", "Canadá", "México", "Portugal", "Espanha", "França",
    "Itália", "Alemanha", "Reino Unido", "Japão", "China", "Austrália",
];

const brazilianStates = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
    "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
    "SP", "SE", "TO",
];

// Password generation function
const generatePassword = (): string => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

export function NewGuestModal({ open, onOpenChange, onSuccess, guestToEdit }: NewGuestModalProps) {
    const [step, setStep] = useState(1);
    const [personType, setPersonType] = useState("physical");
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
    const [passwordMode, setPasswordMode] = useState<"manual" | "auto">("manual");
    const [showPassword, setShowPassword] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState("");

    const [formData, setFormData] = useState({
        // Personal Info
        name: "",
        email: "",
        phone: "",
        whatsapp: "",
        document: "",
        birthDate: "",
        gender: "",
        nationality: "Brasil",
        occupation: "",
        password: "",
        // Company Info (for legal person)
        companyName: "",
        tradeName: "",
        cnpj: "",
        stateRegistration: "",
        contactName: "",
        // Address
        cep: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        country: "Brasil",
        // Loyalty
        tier: "bronze",
        memberSince: new Date().toISOString().split("T")[0],
        // Preferences
        specialNotes: "",
        // Communication
        emailMarketing: true,
        smsNotifications: true,
        whatsappNotifications: true,
        // Emergency
        emergencyName: "",
        emergencyPhone: "",
        emergencyRelation: "",
    });

    const steps = [
        { number: 1, title: "Tipo & Identificação", icon: User },
        { number: 2, title: "Contato", icon: Phone },
        { number: 3, title: "Endereço", icon: MapPin },
        { number: 4, title: "Fidelidade", icon: Award },
        { number: 5, title: "Preferências", icon: Heart },
        { number: 6, title: "Confirmação", icon: Check },
    ];

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedPhoto(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setPhotoPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const fetchCEP = async (cep: string) => {
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormData((prev) => ({
                        ...prev,
                        street: data.logradouro || "",
                        neighborhood: data.bairro || "",
                        city: data.localidade || "",
                        state: data.uf || "",
                    }));
                    toast.success("Endereço encontrado!");
                }
            } catch (error) {
                console.error("Error fetching CEP:", error);
            }
        }
    };


    useEffect(() => {
        if (open) {
            if (guestToEdit) {
                setPersonType(guestToEdit.type || "physical");
                setPhotoPreview(guestToEdit.avatar || null);
                setFormData(prev => ({
                    ...prev,
                    name: guestToEdit.name,
                    email: guestToEdit.email,
                    phone: guestToEdit.phone,
                    whatsapp: guestToEdit.whatsapp || "",
                    document: guestToEdit.document,
                    birthDate: guestToEdit.birthDate || "",
                    gender: guestToEdit.gender || "",
                    nationality: guestToEdit.nationality || "Brasil",
                    occupation: guestToEdit.occupation || "",

                    companyName: guestToEdit.companyName || "",
                    tradeName: guestToEdit.tradeName || "",
                    cnpj: guestToEdit.cnpj || "",
                    stateRegistration: guestToEdit.stateRegistration || "",
                    contactName: guestToEdit.contactName || "",

                    cep: guestToEdit.zipCode || "",
                    street: guestToEdit.address || "",
                    number: guestToEdit.addressNumber || "",
                    complement: guestToEdit.addressComplement || "",
                    neighborhood: guestToEdit.addressNeighborhood || "",
                    city: guestToEdit.city,
                    state: guestToEdit.state || "",
                    country: guestToEdit.country || "Brasil",

                    tier: guestToEdit.tier,
                    memberSince: guestToEdit.memberSince || new Date().toISOString().split("T")[0],
                    specialNotes: guestToEdit.notes || "",

                    emailMarketing: guestToEdit.marketingEmail !== undefined ? guestToEdit.marketingEmail : true,
                    smsNotifications: guestToEdit.marketingSms !== undefined ? guestToEdit.marketingSms : true,
                    whatsappNotifications: guestToEdit.marketingWhatsapp !== undefined ? guestToEdit.marketingWhatsapp : true,

                    emergencyName: guestToEdit.emergencyContactName || "",
                    emergencyPhone: guestToEdit.emergencyContactPhone || "",
                    emergencyRelation: guestToEdit.emergencyRelation || "",
                }));
                setSelectedTags(guestToEdit.tags || []);
                setSelectedPreferences(guestToEdit.preferences || []);
            } else {
                resetForm(); // Ensure clean state for new guest
            }
        }
    }, [open, guestToEdit]);

    const toggleTag = (tagValue: string) => {
        setSelectedTags((prev) =>
            prev.includes(tagValue)
                ? prev.filter((t) => t !== tagValue)
                : [...prev, tagValue]
        );
    };

    const togglePreference = (prefId: string) => {
        setSelectedPreferences((prev) =>
            prev.includes(prefId)
                ? prev.filter((p) => p !== prefId)
                : [...prev, prefId]
        );
    };

    const handleSubmit = async () => {
        try {
            let avatarUrl = guestToEdit?.avatar;

            if (selectedPhoto) {
                try {
                    const uploadResponse = await api.uploadImage(selectedPhoto, 'guests');
                    if (uploadResponse.success && uploadResponse.data) {
                        avatarUrl = uploadResponse.data.fullUrl;
                    }
                } catch (error) {
                    console.error("Error uploading image:", error);
                    toast.error("Erro ao fazer upload da imagem.");
                    return;
                }
            }

            const nameParts = formData.name.trim().split(" ");
            const firstName = personType === 'physical' ? nameParts[0] : formData.companyName;
            const lastName = personType === 'physical' ? (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-") : (formData.tradeName || "Empresa");

            const payload = {
                firstName: firstName || "Novo",
                lastName: lastName || "Hóspede",
                email: formData.email,
                phone: formData.phone,
                documentType: personType === 'physical' ? 'cpf' : 'cnpj',
                documentNumber: personType === 'physical' ? formData.document : formData.cnpj,
                nationality: formData.nationality,
                birthDate: formData.birthDate || undefined,
                gender: formData.gender || undefined,
                address: formData.street,
                city: formData.city,
                state: formData.state,
                zipCode: formData.cep,
                country: formData.country,
                tier: formData.tier,
                preferences: selectedPreferences,
                tags: selectedTags,
                notes: formData.specialNotes,
                marketingConsent: formData.emailMarketing,
                avatar: avatarUrl,
                // New fields
                type: personType as 'physical' | 'legal',
                whatsapp: formData.whatsapp,
                companyName: formData.companyName,
                tradeName: formData.tradeName,
                stateRegistration: formData.stateRegistration,
                cnpj: formData.cnpj,
                contactName: formData.contactName,
                addressNumber: formData.number,
                addressComplement: formData.complement,
                addressNeighborhood: formData.neighborhood,
                memberSince: formData.memberSince,
                marketingEmail: formData.emailMarketing,
                marketingSms: formData.smsNotifications,
                marketingWhatsapp: formData.whatsappNotifications,
                emergencyContactName: formData.emergencyName,
                emergencyContactPhone: formData.emergencyPhone,
                emergencyContactRelation: formData.emergencyRelation,
                occupation: formData.occupation,
                password: formData.password || undefined, // Only send if provided
                // 100 pontos iniciais para novo cadastro (não altera em edição)
                ...(guestToEdit ? {} : { loyaltyPoints: 100 }),
            };

            // Debug logging
            console.log('=== GUEST CREATION/UPDATE DEBUG ===');
            console.log('Password mode:', passwordMode);
            console.log('Password value:', formData.password);
            console.log('Password in payload:', payload.password);
            console.log('Full payload:', payload);

            let response;
            if (guestToEdit) {
                response = await api.updateGuest(guestToEdit.id, payload);
            } else {
                response = await api.createGuest(payload);
            }

            if (response.success) {
                toast.success(guestToEdit ? "Hóspede atualizado com sucesso!" : "Hóspede cadastrado com sucesso!", {
                    description: `${formData.name || formData.companyName} foi ${guestToEdit ? "atualizado" : "adicionado"} no sistema.`,
                });

                // Combine payload with ID from response for the callback
                const resultGuest = {
                    ...payload,
                    id: response.data?.id || guestToEdit?.id,
                    // Ensure these are mapped correctly for compatibility
                    name: payload.firstName + " " + payload.lastName,
                    cpf: payload.documentNumber,
                    // Add other fields if necessary for immediate usage
                };

                if (onSuccess) onSuccess(resultGuest);
                onOpenChange(false);
                resetForm();
            } else {
                toast.error("Erro ao salvar hóspede", {
                    description: response.error?.message || "Ocorreu um erro inesperado."
                });
            }
        } catch (error) {
            console.error("Error creating/updating guest:", error);
            toast.error("Erro ao salvar hóspede", {
                description: "Verifique os dados e tente novamente."
            });
        }
    };


    const resetForm = () => {
        setStep(1);
        setPersonType("physical");
        setPhotoPreview(null);
        setSelectedPhoto(null);
        setSelectedTags([]);
        setSelectedPreferences([]);
        setFormData({
            name: "",
            email: "",
            phone: "",
            whatsapp: "",
            document: "",
            birthDate: "",
            gender: "",
            nationality: "Brasil",
            occupation: "",
            password: "",
            companyName: "",
            tradeName: "",
            cnpj: "",
            stateRegistration: "",
            contactName: "",
            cep: "",
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
            country: "Brasil",
            tier: "bronze",
            memberSince: new Date().toISOString().split("T")[0],
            specialNotes: "",
            emailMarketing: true,
            smsNotifications: true,
            whatsappNotifications: true,
            emergencyName: "",
            emergencyPhone: "",
            emergencyRelation: "",
        });
    };

    const handleClose = () => {
        onOpenChange(false);
        resetForm();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-5xl max-h-[95vh] p-0 gap-0 overflow-hidden">
                <div className="flex h-full max-h-[95vh]">
                    {/* Left Sidebar - Steps */}
                    <div className="w-72 flex-shrink-0 bg-gradient-to-b from-primary via-primary/95 to-primary/85 p-6 text-primary-foreground hidden lg:flex flex-col relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                                    <UserCheck className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg">{guestToEdit ? "Editar Hóspede" : "Novo Hóspede"}</h2>
                                    <p className="text-sm opacity-80">{guestToEdit ? "Edite as informações abaixo" : "Cadastro completo"}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {steps.map((s, idx) => {
                                    const Icon = s.icon;
                                    const isActive = step === s.number;
                                    const isCompleted = step > s.number;

                                    return (
                                        <div
                                            key={s.number}
                                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive
                                                ? "bg-white/25 backdrop-blur-sm shadow-lg"
                                                : isCompleted
                                                    ? "bg-white/10 opacity-90"
                                                    : "opacity-50"
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive
                                                ? "bg-white text-primary"
                                                : isCompleted
                                                    ? "bg-white/30"
                                                    : "bg-white/10"
                                                }`}>
                                                {isCompleted ? (
                                                    <Check className="w-5 h-5" />
                                                ) : (
                                                    <Icon className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs opacity-70">Etapa {s.number}</p>
                                                <p className="font-medium text-sm truncate">{s.title}</p>
                                            </div>
                                            {isActive && (
                                                <ChevronRight className="w-5 h-5" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Progress */}
                            <div className="mt-8 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Progresso</span>
                                    <span className="font-bold">{Math.round((step / steps.length) * 100)}%</span>
                                </div>
                                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white rounded-full transition-all duration-500"
                                        style={{ width: `${(step / steps.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="mt-6 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="font-medium text-sm">Dica</span>
                                </div>
                                <p className="text-xs opacity-80">
                                    {step === 1 && "Selecione o tipo de pessoa e preencha os dados de identificação."}
                                    {step === 2 && "Adicione todos os contatos disponíveis para melhor comunicação."}
                                    {step === 3 && "Digite o CEP para preenchimento automático do endereço."}
                                    {step === 4 && "Configure o nível de fidelidade e tags do hóspede."}
                                    {step === 5 && "Personalize a experiência selecionando as preferências."}
                                    {step === 6 && "Revise todas as informações antes de confirmar."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <DialogHeader className="p-6 pb-0 lg:hidden">
                            <DialogTitle className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <UserCheck className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <span className="block">{guestToEdit ? "Editar Hóspede" : "Novo Hóspede"}</span>
                                    <span className="text-sm font-normal text-muted-foreground">
                                        Etapa {step} de {steps.length}: {steps[step - 1].title}
                                    </span>
                                </div>
                            </DialogTitle>
                        </DialogHeader>

                        {/* Mobile Progress */}
                        <div className="px-6 py-3 lg:hidden">
                            <div className="flex gap-1">
                                {steps.map((s) => (
                                    <div
                                        key={s.number}
                                        className={`flex-1 h-1.5 rounded-full transition-all ${s.number <= step ? "bg-primary" : "bg-muted"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <ScrollArea className="flex-1 px-6">
                            <div className="py-6 space-y-6">
                                {/* Step 1: Type & Identification */}
                                {step === 1 && (
                                    <div className="space-y-6">
                                        {/* Person Type Selection */}
                                        <div>
                                            <Label className="text-base font-semibold mb-4 block">Tipo de Pessoa</Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                {personTypes.map((type) => {
                                                    const Icon = type.icon;
                                                    return (
                                                        <button
                                                            key={type.value}
                                                            type="button"
                                                            onClick={() => setPersonType(type.value)}
                                                            className={`p-5 rounded-xl border-2 transition-all text-left ${personType === type.value
                                                                ? "border-primary bg-primary/5 shadow-lg"
                                                                : "border-border hover:border-primary/50"
                                                                }`}
                                                        >
                                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${personType === type.value
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-secondary"
                                                                }`}>
                                                                <Icon className="w-6 h-6" />
                                                            </div>
                                                            <p className="font-semibold text-foreground">{type.label}</p>
                                                            <p className="text-sm text-muted-foreground">{type.description}</p>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Photo Upload */}
                                        <div className="flex items-center gap-6">
                                            <div className="relative">
                                                <div className={`w-28 h-28 rounded-2xl overflow-hidden border-2 border-dashed ${photoPreview ? "border-primary" : "border-border"
                                                    } flex items-center justify-center bg-secondary/50`}>
                                                    {photoPreview ? (
                                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Camera className="w-8 h-8 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <label className="absolute -bottom-2 -right-2 p-2 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                                                    <Upload className="w-4 h-4" />
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handlePhotoUpload}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">Foto do Hóspede</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Opcional - JPG, PNG ou WEBP
                                                </p>
                                            </div>
                                        </div>

                                        {/* Personal/Company Info */}
                                        {personType === "physical" ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2">
                                                    <Label>Nome Completo *</Label>
                                                    <div className="relative mt-1.5">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                                            placeholder="Digite o nome completo"
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label>CPF *</Label>
                                                    <div className="relative mt-1.5">
                                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input
                                                            value={formData.document}
                                                            onChange={(e) => setFormData({ ...formData, document: formatCPF(e.target.value) })}
                                                            placeholder="000.000.000-00"
                                                            maxLength={14}
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label>Data de Nascimento</Label>
                                                    <div className="relative mt-1.5">
                                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input
                                                            type="date"
                                                            value={formData.birthDate}
                                                            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label>Gênero</Label>
                                                    <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                                                        <SelectTrigger className="mt-1.5">
                                                            <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="male">Masculino</SelectItem>
                                                            <SelectItem value="female">Feminino</SelectItem>
                                                            <SelectItem value="other">Outro</SelectItem>
                                                            <SelectItem value="prefer-not">Prefiro não informar</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label>Nacionalidade</Label>
                                                    <Select value={formData.nationality} onValueChange={(v) => setFormData({ ...formData, nationality: v })}>
                                                        <SelectTrigger className="mt-1.5">
                                                            <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {countries.map((c) => (
                                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label>Profissão</Label>
                                                    <div className="relative mt-1.5">
                                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input
                                                            value={formData.occupation}
                                                            onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                                                            placeholder="Ex: Engenheiro"
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label>Empresa</Label>
                                                    <div className="relative mt-1.5">
                                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input
                                                            value={formData.companyName}
                                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                            placeholder="Ex: Google"
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2">
                                                    <Label>Razão Social *</Label>
                                                    <div className="relative mt-1.5">
                                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input
                                                            value={formData.companyName}
                                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                            placeholder="Nome da empresa"
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label>Nome Fantasia</Label>
                                                    <Input
                                                        value={formData.tradeName}
                                                        onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                                                        placeholder="Nome fantasia"
                                                        className="mt-1.5"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>CNPJ *</Label>
                                                    <div className="relative mt-1.5">
                                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input
                                                            value={formData.cnpj}
                                                            onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                                                            placeholder="00.000.000/0000-00"
                                                            maxLength={18}
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label>Inscrição Estadual</Label>
                                                    <Input
                                                        value={formData.stateRegistration}
                                                        onChange={(e) => setFormData({ ...formData, stateRegistration: e.target.value })}
                                                        placeholder="Inscrição estadual"
                                                        className="mt-1.5"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Nome do Contato</Label>
                                                    <div className="relative mt-1.5">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input
                                                            value={formData.contactName}
                                                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                                            placeholder="Pessoa de contato"
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Step 2: Contact */}
                                {step === 2 && (
                                    <div className="space-y-6">
                                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                                            <div className="flex items-center gap-3">
                                                <MessageSquare className="w-5 h-5 text-primary" />
                                                <div>
                                                    <p className="font-medium text-foreground">Informações de Contato</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Preencha os dados para comunicação com o hóspede
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <Label>E-mail Principal *</Label>
                                                <div className="relative mt-1.5">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        placeholder="email@exemplo.com"
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Telefone Principal *</Label>
                                                <div className="relative mt-1.5">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                                                        placeholder="(00) 00000-0000"
                                                        maxLength={15}
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label>WhatsApp</Label>
                                                <div className="relative mt-1.5">
                                                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        value={formData.whatsapp}
                                                        onChange={(e) => setFormData({ ...formData, whatsapp: formatPhone(e.target.value) })}
                                                        placeholder="(00) 00000-0000"
                                                        maxLength={15}
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Password Section */}
                                        <div className="space-y-4">
                                            <Label className="text-base font-semibold">Senha de Acesso ao Portal</Label>
                                            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Configure uma senha para que o hóspede possa acessar o Portal do Hóspede
                                                </p>

                                                {/* Password Mode Selection */}
                                                <div className="grid grid-cols-2 gap-3 mb-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPasswordMode("manual")}
                                                        className={`p-3 rounded-lg border-2 transition-all text-left ${passwordMode === "manual"
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:border-primary/50"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Lock className="w-4 h-4" />
                                                            <span className="font-medium text-sm">Manual</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">Digite uma senha</p>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setPasswordMode("auto");
                                                            const generated = generatePassword();
                                                            setGeneratedPassword(generated);
                                                            setFormData({ ...formData, password: generated });
                                                        }}
                                                        className={`p-3 rounded-lg border-2 transition-all text-left ${passwordMode === "auto"
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:border-primary/50"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Key className="w-4 h-4" />
                                                            <span className="font-medium text-sm">Automática</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">Gerar senha segura</p>
                                                    </button>
                                                </div>

                                                {/* Password Input */}
                                                {passwordMode === "manual" ? (
                                                    <div>
                                                        <Label>Senha</Label>
                                                        <div className="relative mt-1.5">
                                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                            <Input
                                                                type={showPassword ? "text" : "password"}
                                                                value={formData.password}
                                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                                placeholder="Digite uma senha segura"
                                                                className="pl-10 pr-10"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                            >
                                                                {showPassword ? (
                                                                    <EyeOff className="w-4 h-4" />
                                                                ) : (
                                                                    <Eye className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Mínimo 6 caracteres. Deixe em branco se não quiser definir senha agora.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <Label className="text-green-700 dark:text-green-400">Senha Gerada</Label>
                                                            <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800">
                                                                <Shield className="w-3 h-3 mr-1" />
                                                                Segura
                                                            </Badge>
                                                        </div>
                                                        <div className="relative">
                                                            <Input
                                                                type={showPassword ? "text" : "password"}
                                                                value={generatedPassword}
                                                                readOnly
                                                                className="pr-20 font-mono bg-white dark:bg-gray-950"
                                                            />
                                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                >
                                                                    {showPassword ? (
                                                                        <EyeOff className="w-4 h-4" />
                                                                    ) : (
                                                                        <Eye className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(generatedPassword);
                                                                        toast.success("Senha copiada!");
                                                                    }}
                                                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                >
                                                                    <CreditCard className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-green-700 dark:text-green-400 mt-2">
                                                            ⚠️ Anote esta senha! Ela será necessária para o hóspede acessar o portal.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Communication Preferences */}
                                        <div className="space-y-4">
                                            <Label className="text-base font-semibold">Preferências de Comunicação</Label>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                                                    <div className="flex items-center gap-3">
                                                        <Mail className="w-5 h-5 text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium">E-mail Marketing</p>
                                                            <p className="text-sm text-muted-foreground">Receber promoções e novidades</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={formData.emailMarketing}
                                                        onCheckedChange={(c) => setFormData({ ...formData, emailMarketing: c })}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                                                    <div className="flex items-center gap-3">
                                                        <Phone className="w-5 h-5 text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium">Notificações SMS</p>
                                                            <p className="text-sm text-muted-foreground">Atualizações de reserva por SMS</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={formData.smsNotifications}
                                                        onCheckedChange={(c) => setFormData({ ...formData, smsNotifications: c })}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                                                    <div className="flex items-center gap-3">
                                                        <MessageSquare className="w-5 h-5 text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium">WhatsApp</p>
                                                            <p className="text-sm text-muted-foreground">Comunicação via WhatsApp</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={formData.whatsappNotifications}
                                                        onCheckedChange={(c) => setFormData({ ...formData, whatsappNotifications: c })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Emergency Contact */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-5 h-5 text-destructive" />
                                                <Label className="text-base font-semibold">Contato de Emergência</Label>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label>Nome</Label>
                                                    <Input
                                                        value={formData.emergencyName}
                                                        onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                                                        placeholder="Nome do contato"
                                                        className="mt-1.5"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Telefone</Label>
                                                    <Input
                                                        value={formData.emergencyPhone}
                                                        onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                                                        placeholder="(00) 00000-0000"
                                                        className="mt-1.5"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Parentesco</Label>
                                                    <Select
                                                        value={formData.emergencyRelation}
                                                        onValueChange={(v) => setFormData({ ...formData, emergencyRelation: v })}
                                                    >
                                                        <SelectTrigger className="mt-1.5">
                                                            <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="spouse">Cônjuge</SelectItem>
                                                            <SelectItem value="parent">Pai/Mãe</SelectItem>
                                                            <SelectItem value="sibling">Irmão(ã)</SelectItem>
                                                            <SelectItem value="child">Filho(a)</SelectItem>
                                                            <SelectItem value="friend">Amigo(a)</SelectItem>
                                                            <SelectItem value="other">Outro</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Address */}
                                {step === 3 && (
                                    <div className="space-y-6">
                                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                                            <div className="flex items-center gap-3">
                                                <MapPin className="w-5 h-5 text-primary" />
                                                <div>
                                                    <p className="font-medium text-foreground">Endereço Completo</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Digite o CEP para preenchimento automático
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label>CEP *</Label>
                                                <Input
                                                    value={formData.cep}
                                                    onChange={(e) => {
                                                        const cep = e.target.value.replace(/\D/g, "");
                                                        setFormData({ ...formData, cep });
                                                        if (cep.length === 8) fetchCEP(cep);
                                                    }}
                                                    placeholder="00000-000"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label>Logradouro *</Label>
                                                <Input
                                                    value={formData.street}
                                                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                                    placeholder="Rua, Avenida, etc."
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label>Número *</Label>
                                                <Input
                                                    value={formData.number}
                                                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                                    placeholder="Nº"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label>Complemento</Label>
                                                <Input
                                                    value={formData.complement}
                                                    onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                                                    placeholder="Apto, Sala, Bloco..."
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label>Bairro *</Label>
                                                <Input
                                                    value={formData.neighborhood}
                                                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                                    placeholder="Bairro"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label>Cidade *</Label>
                                                <Input
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    placeholder="Cidade"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label>Estado *</Label>
                                                <Select value={formData.state} onValueChange={(v) => setFormData({ ...formData, state: v })}>
                                                    <SelectTrigger className="mt-1.5">
                                                        <SelectValue placeholder="UF" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {brazilianStates.map((s) => (
                                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>País</Label>
                                                <Select value={formData.country} onValueChange={(v) => setFormData({ ...formData, country: v })}>
                                                    <SelectTrigger className="mt-1.5">
                                                        <SelectValue placeholder="Selecione" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {countries.map((c) => (
                                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Loyalty */}
                                {step === 4 && (
                                    <div className="space-y-6">
                                        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                                            <div className="flex items-center gap-3">
                                                <Award className="w-5 h-5 text-purple-500" />
                                                <div>
                                                    <p className="font-medium text-foreground">Programa de Fidelidade</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Configure o nível e tags do hóspede
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tier Selection */}
                                        <div>
                                            <Label className="text-base font-semibold mb-4 block">Nível de Fidelidade</Label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {loyaltyTiers.map((tier) => (
                                                    <button
                                                        key={tier.value}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, tier: tier.value })}
                                                        className={`p-4 rounded-xl border-2 transition-all text-center ${formData.tier === tier.value
                                                            ? "border-primary shadow-lg scale-105"
                                                            : "border-border hover:border-primary/50"
                                                            }`}
                                                    >
                                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-2xl mx-auto mb-2`}>
                                                            {tier.icon}
                                                        </div>
                                                        <p className="font-semibold text-foreground">{tier.label}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Member Since */}
                                        <div className="max-w-xs">
                                            <Label>Membro Desde</Label>
                                            <div className="relative mt-1.5">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    type="date"
                                                    value={formData.memberSince}
                                                    onChange={(e) => setFormData({ ...formData, memberSince: e.target.value })}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div>
                                            <Label className="text-base font-semibold mb-4 block">Tags do Hóspede</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {guestTags.map((tag) => (
                                                    <button
                                                        key={tag.value}
                                                        type="button"
                                                        onClick={() => toggleTag(tag.value)}
                                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTags.includes(tag.value)
                                                            ? `${tag.color} text-white shadow-lg`
                                                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                                            }`}
                                                    >
                                                        {selectedTags.includes(tag.value) && (
                                                            <Check className="w-3.5 h-3.5 inline mr-1.5" />
                                                        )}
                                                        {tag.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 5: Preferences */}
                                {step === 5 && (
                                    <div className="space-y-6">
                                        <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
                                            <div className="flex items-center gap-3">
                                                <Heart className="w-5 h-5 text-pink-500" />
                                                <div>
                                                    <p className="font-medium text-foreground">Preferências do Hóspede</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Personalize a experiência selecionando as preferências
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {preferenceCategories.map((category) => {
                                                const CategoryIcon = category.icon;
                                                return (
                                                    <div key={category.category}>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <CategoryIcon className="w-5 h-5 text-primary" />
                                                            <Label className="text-base font-semibold">{category.category}</Label>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {category.preferences.map((pref) => {
                                                                const PrefIcon = pref.icon;
                                                                const isSelected = selectedPreferences.includes(pref.id);
                                                                return (
                                                                    <button
                                                                        key={pref.id}
                                                                        type="button"
                                                                        onClick={() => togglePreference(pref.id)}
                                                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isSelected
                                                                            ? "bg-primary text-primary-foreground shadow-lg"
                                                                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                                                            }`}
                                                                    >
                                                                        <PrefIcon className="w-4 h-4" />
                                                                        {pref.label}
                                                                        {isSelected && <Check className="w-3.5 h-3.5 ml-1" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Special Notes */}
                                        <div>
                                            <Label className="text-base font-semibold mb-2 block">Observações Especiais</Label>
                                            <Textarea
                                                value={formData.specialNotes}
                                                onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                                                placeholder="Alergias, necessidades especiais, observações importantes..."
                                                rows={4}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 6: Confirmation */}
                                {step === 6 && (
                                    <div className="space-y-6">
                                        <div className="p-6 rounded-2xl bg-gradient-to-br from-success/10 to-primary/10 border border-success/20">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center">
                                                    <Check className="w-8 h-8 text-success" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-foreground">Quase lá!</h3>
                                                    <p className="text-muted-foreground">Revise as informações antes de confirmar</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Personal Info Summary */}
                                            <div className="p-4 rounded-xl border border-border bg-card">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <User className="w-5 h-5 text-primary" />
                                                    <h4 className="font-semibold">Identificação</h4>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Nome:</span>
                                                        <span className="font-medium">{formData.name || formData.companyName || "-"}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Documento:</span>
                                                        <span className="font-medium">{formData.document || formData.cnpj || "-"}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Tipo:</span>
                                                        <span className="font-medium">{personType === "physical" ? "Pessoa Física" : "Pessoa Jurídica"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Summary */}
                                            <div className="p-4 rounded-xl border border-border bg-card">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Phone className="w-5 h-5 text-primary" />
                                                    <h4 className="font-semibold">Contato</h4>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">E-mail:</span>
                                                        <span className="font-medium">{formData.email || "-"}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Telefone:</span>
                                                        <span className="font-medium">{formData.phone || "-"}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">WhatsApp:</span>
                                                        <span className="font-medium">{formData.whatsapp || "-"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Address Summary */}
                                            <div className="p-4 rounded-xl border border-border bg-card">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <MapPin className="w-5 h-5 text-primary" />
                                                    <h4 className="font-semibold">Endereço</h4>
                                                </div>
                                                <div className="text-sm">
                                                    <p className="text-muted-foreground">
                                                        {formData.street ? (
                                                            <>
                                                                {formData.street}, {formData.number}
                                                                {formData.complement && ` - ${formData.complement}`}
                                                                <br />
                                                                {formData.neighborhood} - {formData.city}/{formData.state}
                                                                <br />
                                                                CEP: {formData.cep}
                                                            </>
                                                        ) : (
                                                            "Não informado"
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Loyalty Summary */}
                                            <div className="p-4 rounded-xl border border-border bg-card">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Award className="w-5 h-5 text-primary" />
                                                    <h4 className="font-semibold">Fidelidade</h4>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl">
                                                            {loyaltyTiers.find((t) => t.value === formData.tier)?.icon}
                                                        </span>
                                                        <span className="font-medium">
                                                            {loyaltyTiers.find((t) => t.value === formData.tier)?.label}
                                                        </span>
                                                    </div>
                                                    {selectedTags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {selectedTags.map((tag) => {
                                                                const tagConfig = guestTags.find((t) => t.value === tag);
                                                                return (
                                                                    <Badge
                                                                        key={tag}
                                                                        className={`${tagConfig?.color} text-white text-xs`}
                                                                    >
                                                                        {tagConfig?.label}
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Preferences Summary */}
                                        {selectedPreferences.length > 0 && (
                                            <div className="p-4 rounded-xl border border-border bg-card">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Heart className="w-5 h-5 text-primary" />
                                                    <h4 className="font-semibold">Preferências Selecionadas ({selectedPreferences.length})</h4>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedPreferences.map((prefId) => {
                                                        const pref = preferenceCategories
                                                            .flatMap((c) => c.preferences)
                                                            .find((p) => p.id === prefId);
                                                        if (!pref) return null;
                                                        const PrefIcon = pref.icon;
                                                        return (
                                                            <div
                                                                key={prefId}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm"
                                                            >
                                                                <PrefIcon className="w-3.5 h-3.5" />
                                                                {pref.label}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Footer */}
                        <div className="p-6 border-t border-border flex justify-between items-center bg-background">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    if (step === 1) handleClose();
                                    else setStep(step - 1);
                                }}
                                className="gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                {step === 1 ? "Cancelar" : "Voltar"}
                            </Button>
                            <Button
                                variant="gradient"
                                onClick={() => {
                                    if (step === steps.length) handleSubmit();
                                    else setStep(step + 1);
                                }}
                                className="gap-2"
                            >
                                {step === steps.length ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Cadastrar Hóspede
                                    </>
                                ) : (
                                    <>
                                        Continuar
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent >
        </Dialog >
    );
}
