import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
    Building2,
    Hotel,
    Home,
    Building,
    MapPin,
    DollarSign,
    User,
    Percent,
    Phone,
    Mail,
    CheckCircle2,
    Wifi,
    Car,
    Waves,
    Dumbbell,
    Coffee,
    Utensils,
    Tv,
    AirVent,
    Refrigerator,
    WashingMachine,
    Brush,
    Calendar,
    Settings,
    Save,
    Star,
    Sparkles,
    Clock,
    Image as ImageIcon,
    Plus,
    Trash2,
    Backpack,
    Umbrella,
    ArrowRight,
    ArrowLeft,
    UploadCloud,
    Loader2,
    X,
    Check,
    LayoutDashboard,
    Search,
    Globe,
    Coins
} from "lucide-react";


// Explicitly define Property interface if not exported or to match form needs
interface PropertyData {
    id?: string;
    name: string;
    type: string;
    address: string;
    addressNumber?: string;
    units: number;
    occupancy?: number;
    owner?: {
        id?: number;
        name: string;
        email: string;
        phone: string;
        commission: number;
    };
    rates: {
        daily: number;
        weekly: number;
        monthly: number;
    };
    amenities: string[];
    services: {
        cleaning: string;
        coworking: boolean;
        rooftop: boolean;
    };
    checkInTime?: string;
    checkOutTime?: string;
    images?: string[];
    description?: string;
    zipCode?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    email?: string;
    phone?: string;
    website?: string;
    settings?: {
        taxRate?: number;
        serviceFee?: number;
    };
    status: "active" | "maintenance" | "inactive";
}

interface PropertyModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    property?: PropertyData | null;
    onSuccess?: () => void;
}

const propertyTypes = [
    {
        id: "hotel",
        name: "Hotel",
        description: "Hospedagem tradicional",
        icon: Hotel,
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        illustration: "🏨",
        gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
        id: "apart-hotel",
        name: "Apart-Hotel",
        description: "Serviços de hotel em aptos",
        icon: Building2,
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
        illustration: "🏢",
        gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
        id: "loft",
        name: "Loft",
        description: "Espaços modernos",
        icon: Home,
        color: "text-amber-400",
        bgColor: "bg-amber-500/20",
        illustration: "🏠",
        gradient: "from-amber-500/20 to-orange-500/20"
    },
    {
        id: "temporada",
        name: "Temporada",
        description: "Aluguel de temporada",
        icon: Building,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/20",
        illustration: "🏖️",
        gradient: "from-emerald-500/20 to-green-500/20"
    },
    {
        id: "hostel",
        name: "Hostel",
        description: "Hospedagem compartilhada",
        icon: Backpack,
        color: "text-orange-400",
        bgColor: "bg-orange-500/20",
        illustration: "🎒",
        gradient: "from-orange-500/20 to-red-500/20"
    },
    {
        id: "resort",
        name: "Resort",
        description: "Complexo de lazer",
        icon: Umbrella,
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/20",
        illustration: "🌴",
        gradient: "from-cyan-500/20 to-blue-500/20"
    },
];

const amenitiesList = [
    { id: "wifi", name: "Wi-Fi", icon: Wifi },
    { id: "parking", name: "Estacionamento", icon: Car },
    { id: "pool", name: "Piscina", icon: Waves },
    { id: "gym", name: "Academia", icon: Dumbbell },
    { id: "restaurant", name: "Restaurante", icon: Utensils },
    { id: "coffee", name: "Café", icon: Coffee },
    { id: "tv", name: "Smart TV", icon: Tv },
    { id: "ac", name: "Ar Condicionado", icon: AirVent },
    { id: "kitchen", name: "Cozinha", icon: Refrigerator },
    { id: "laundry", name: "Lavanderia", icon: WashingMachine },
];

const cleaningOptions = [
    { id: "per-stay", name: "Por Estadia" },
    { id: "weekly", name: "Semanal" },
    { id: "biweekly", name: "Quinzenal" },
    { id: "monthly", name: "Mensal" },
];

// Steps configuration
const steps = [
    { id: 1, title: "Tipo", icon: LayoutDashboard, description: "Categoria do imóvel" },
    { id: 2, title: "Básico", icon: Building, description: "Localização e descrição" },
    { id: 3, title: "Contato", icon: Phone, description: "Canais e visibilidade" },
    { id: 4, title: "Fotos", icon: ImageIcon, description: "Galeria de imagens" },
    { id: 5, title: "Serviços", icon: Sparkles, description: "Amenidades e limpeza" },
    { id: 6, title: "Tarifas", icon: DollarSign, description: "Preços e regras" },
];

export default function PropertyModal({ open, onOpenChange, property, onSuccess }: PropertyModalProps) {
    const isEditMode = !!property;
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = useState(1);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<PropertyData>({
        name: "",
        type: "",
        address: "",
        addressNumber: "",
        units: 0,
        description: "",
        rates: { daily: 0, weekly: 0, monthly: 0 },
        amenities: [],
        services: { cleaning: "per-stay", coworking: false, rooftop: false },
        status: "active",
        checkInTime: "14:00",
        checkOutTime: "11:00",
        images: [],
        owner: undefined,
        zipCode: "",
        neighborhood: "",
        city: "",
        state: "",
        email: "",
        phone: "",
        website: "",
        settings: { taxRate: 5, serviceFee: 0 }
    });

    const [hasOwner, setHasOwner] = useState(false);

    // Initialize form when property changes
    useEffect(() => {
        if (open) {
            if (property) {
                const rates = (property as any).rates || { daily: 0, weekly: 0, monthly: 0 };
                const services = (property as any).services || { cleaning: "per-stay", coworking: false, rooftop: false };

                setFormData({
                    id: String(property.id),
                    name: property.name || "",
                    type: property.type || "",
                    address: property.address || "",
                    addressNumber: (property as any).addressNumber || "",
                    neighborhood: (property as any).neighborhood || "",
                    city: (property as any).city || "",
                    state: (property as any).state || "",
                    zipCode: (property as any).zipCode || "",
                    email: (property as any).email || "",
                    phone: (property as any).phone || "",
                    website: (property as any).website || "",
                    units: (property as any).units || 0,
                    description: property.description || "",
                    status: property.status || "active",
                    checkInTime: property.checkInTime || "14:00",
                    checkOutTime: property.checkOutTime || "11:00",
                    images: property.images || [],
                    owner: property.owner || undefined,
                    rates: {
                        daily: rates.daily || 0,
                        weekly: rates.weekly || 0,
                        monthly: rates.monthly || 0,
                    },
                    amenities: property.amenities || [],
                    services: {
                        cleaning: services.cleaning || "per-stay",
                        coworking: !!services.coworking,
                        rooftop: !!services.rooftop,
                    },
                    settings: {
                        taxRate: (property as any).settings?.taxRate || 5,
                        serviceFee: (property as any).settings?.serviceFee || 0
                    }
                });
                setHasOwner(!!property.owner);
                setCurrentStep(2);
            } else {
                // Reset for new property
                setFormData({
                    name: "",
                    type: "",
                    address: "",
                    units: 0,
                    description: "",
                    rates: { daily: 0, weekly: 0, monthly: 0 },
                    amenities: [],
                    services: { cleaning: "per-stay", coworking: false, rooftop: false },
                    status: "active",
                    checkInTime: "14:00",
                    checkOutTime: "11:00",
                    images: [],
                    addressNumber: "",
                    zipCode: "",
                    neighborhood: "",
                    city: "",
                    state: "",
                    email: "",
                    phone: "",
                    website: "",
                    settings: { taxRate: 5, serviceFee: 0 }
                });
                setHasOwner(false);
                setCurrentStep(1);
            }
        }
    }, [property, open]);

    const handleTypeSelect = (typeId: string) => {
        setFormData({ ...formData, type: typeId });
        setCurrentStep(2);
    };

    const toggleAmenity = (id: string) => {
        setFormData((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(id)
                ? prev.amenities.filter((a) => a !== id)
                : [...prev.amenities, id],
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            // Convert FileList to Array
            const fileArray = Array.from(files);

            // Use existing API to upload
            const response = await api.uploadMultipleImages(fileArray, 'properties');

            if (response.success && response.data?.files) {
                const newUrls = response.data.files.map(f => f.fullUrl);
                setFormData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), ...newUrls]
                }));
                toast.success(`${newUrls.length} foto(s) enviada(s) com sucesso`);
            } else {
                if (!response.success) toast.error("Erro ao enviar imagens");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Erro ao fazer upload das imagens");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index),
        }));
    };

    const handleCEPLookup = async (cep: string) => {
        const cleanCEP = cep.replace(/\D/g, "");
        if (cleanCEP.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
            const data = await response.json();

            if (!data.erro) {
                const fullAddress = [data.logradouro, data.bairro, data.localidade, data.uf]
                    .filter((v) => typeof v === "string" && v.trim().length > 0)
                    .join(", ");
                setFormData(prev => ({
                    ...prev,
                    address: fullAddress || prev.address,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    state: data.uf,
                    zipCode: cep
                }));
                toast.success("Endereço encontrado!");
            } else {
                toast.error("CEP não encontrado. Preencha o campo Endereço Completo usando a busca.");
            }
        } catch (error) {
            console.error("CEP error:", error);
            toast.error("Erro ao buscar CEP. Preencha o Endereço Completo manualmente.");
        }
    };

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const payload = {
                name: data.name,
                type: data.type,
                status: data.status,
                address: data.address,
                addressNumber: data.addressNumber,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                unitsCount: Number(data.units),
                cleaningSchedule: data.services.cleaning,
                settings: {
                    description: data.description,
                    rates: data.rates,
                    amenities: data.amenities,
                    checkInTime: data.checkInTime,
                    checkOutTime: data.checkOutTime,
                    taxRate: data.settings?.taxRate,
                    serviceFee: data.settings?.serviceFee
                },
                services: {
                    coworking: data.services.coworking,
                    rooftop: data.services.rooftop
                },
                commissionRate: data.owner ? Number(data.owner.commission) : 0,
                ownerId: data.owner?.id,
                images: data.images,
                email: data.email,
                phone: data.phone,
                website: data.website,
            };

            return api.createProperty(payload);
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success("Propriedade criada com sucesso!");
                queryClient.invalidateQueries({ queryKey: ["properties"] });
                onSuccess?.();
                onOpenChange(false);
            } else {
                toast.error(response.error?.message || "Erro ao criar");
            }
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            const payload = {
                name: data.name,
                type: data.type,
                status: data.status,
                address: data.address,
                addressNumber: data.addressNumber,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                unitsCount: Number(data.units),
                cleaningSchedule: data.services.cleaning,
                settings: {
                    description: data.description,
                    rates: data.rates,
                    amenities: data.amenities,
                    checkInTime: data.checkInTime,
                    checkOutTime: data.checkOutTime,
                    taxRate: data.settings?.taxRate,
                    serviceFee: data.settings?.serviceFee
                },
                services: {
                    coworking: data.services.coworking,
                    rooftop: data.services.rooftop
                },
                commissionRate: data.owner ? Number(data.owner.commission) : 0,
                ownerId: data.owner?.id,
                images: data.images,
                email: data.email,
                phone: data.phone,
                website: data.website,
            };
            return api.updateProperty(Number(property?.id), payload);
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success("Propriedade atualizada com sucesso!");
                queryClient.invalidateQueries({ queryKey: ["properties"] });
                onSuccess?.();
                onOpenChange(false);
            } else {
                toast.error(response.error?.message || "Erro ao atualizar");
            }
        },
    });

    const handleSubmit = () => {
        if (!formData.name) return toast.error("Nome é obrigatório");
        if (!formData.address?.trim()) {
            return toast.error("Endereço Completo é obrigatório");
        }
        if (isEditMode) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    const nextStep = () => {
        if (currentStep === 1 && !formData.type) {
            return toast.error("Selecione um tipo de propriedade");
        }
        if (currentStep === 2 && !formData.name) {
            return toast.error("Nome da propriedade é obrigatório");
        }
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const typeConfig = propertyTypes.find((t) => t.id === formData.type) || propertyTypes[0];
    const TypeIcon = typeConfig.icon;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-6xl h-[90vh] p-0 gap-0 bg-background overflow-hidden flex flex-col shadow-2xl">
                <div className="flex h-full">
                    {/* Sidebar / Stepper */}
                    <div className="hidden md:flex flex-col w-64 bg-muted/30 border-r border-border p-6 flex-shrink-0">
                        <DialogTitle className="text-xl font-bold mb-8 flex items-center gap-2 text-primary">
                            {isEditMode ? <Settings className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                            {isEditMode ? "Editar Imóvel" : "Nova Propriedade"}
                        </DialogTitle>

                        <div className="space-y-6 relative">
                            {/* Progressive Line */}
                            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border -z-10" />

                            {steps.map((step) => {
                                const StepIcon = step.icon;
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;
                                const isClickable = isEditMode || isCompleted;

                                return (
                                    <div
                                        key={step.id}
                                        className={cn(
                                            "flex items-start gap-4 p-2 rounded-lg transition-all",
                                            isActive ? "bg-primary/10" : "",
                                            isClickable ? "cursor-pointer hover:bg-muted/80" : "opacity-70 cursor-not-allowed"
                                        )}
                                        onClick={() => isClickable && setCurrentStep(step.id)}
                                    >
                                        <div className={cn(
                                            "w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 z-10 transition-colors",
                                            isActive
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : isCompleted
                                                    ? "border-primary/50 bg-primary/20 text-primary"
                                                    : "border-muted-foreground/30 bg-background text-muted-foreground"
                                        )}>
                                            {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{step.id}</span>}
                                        </div>
                                        <div>
                                            <p className={cn("text-sm font-semibold leading-none", isActive ? "text-primary" : "text-foreground")}>
                                                {step.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary Box */}
                        <div className="mt-auto p-4 rounded-xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/10">
                            <h4 className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">Resumo Atual</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tipo:</span>
                                    <span className="font-medium">{typeConfig.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Unidades:</span>
                                    <span className="font-medium">{formData.units}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className={cn(
                                        "font-medium capitalize",
                                        formData.status === "active" ? "text-emerald-500" : "text-amber-500"
                                    )}>{formData.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-background via-background to-secondary/20">
                        {/* Mobile Header */}
                        <div className="md:hidden p-4 border-b flex items-center justify-between bg-muted/30">
                            <span className="font-semibold">{steps[currentStep - 1].title}</span>
                            <Badge variant="outline">{currentStep} de {steps.length}</Badge>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-6 md:p-10 max-w-5xl mx-auto min-h-full">

                                {/* Header of Content */}
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                                        {steps[currentStep - 1].title}
                                    </h2>
                                    <p className="text-muted-foreground text-lg">
                                        {steps[currentStep - 1].description}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {/* STEP 1: TYPE */}
                                    {currentStep === 1 && (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {propertyTypes.map((type) => {
                                                    const Icon = type.icon;
                                                    const isSelected = formData.type === type.id;
                                                    return (
                                                        <Card
                                                            key={type.id}
                                                            className={cn(
                                                                "cursor-pointer transition-all hover:scale-[1.02] border-2",
                                                                isSelected
                                                                    ? "border-primary ring-2 ring-primary/20 shadow-xl"
                                                                    : "border-border/50 hover:border-primary/50 hover:bg-muted/50"
                                                            )}
                                                            onClick={() => setFormData({ ...formData, type: type.id })}
                                                        >
                                                            <div className={cn("h-32 bg-gradient-to-br flex items-center justify-center text-6xl shadow-inner", type.gradient)}>
                                                                {type.illustration}
                                                            </div>
                                                            <CardContent className="p-6">
                                                                <h4 className="font-bold text-xl mb-2 flex items-center gap-2">
                                                                    <div className={cn("p-1.5 rounded-md", type.bgColor)}>
                                                                        <Icon className={cn("w-5 h-5", type.color)} />
                                                                    </div>
                                                                    {type.name}
                                                                </h4>
                                                                <p className="text-muted-foreground">{type.description}</p>
                                                                {isSelected && (
                                                                    <div className="mt-4 flex items-center gap-2 text-primary font-medium text-sm">
                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                        Selecionado
                                                                    </div>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 2: BASIC INFO (Address & Description) */}
                                    {currentStep === 2 && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                            <Card className="border-primary/10 shadow-lg">
                                                <CardContent className="p-8 space-y-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <Label className="text-base">Nome da Propriedade</Label>
                                                            <Input
                                                                value={formData.name}
                                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                                placeholder="Ex: Hotel Estrela do Mar"
                                                                className="h-12 text-lg"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-base">CEP</Label>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    value={formData.zipCode}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        setFormData({ ...formData, zipCode: val });
                                                                        if (val.replace(/\D/g, "").length === 8) {
                                                                            handleCEPLookup(val);
                                                                        }
                                                                    }}
                                                                    placeholder="00000-000"
                                                                    className="h-12 text-lg"
                                                                />
                                                                <Button
                                                                    variant="outline"
                                                                    className="h-12 px-4"
                                                                    onClick={() => formData.zipCode && handleCEPLookup(formData.zipCode)}
                                                                >
                                                                    <Search className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-base">Quantidade de Unidades</Label>
                                                            <Input
                                                                type="number"
                                                                value={formData.units}
                                                                onChange={(e) => setFormData({ ...formData, units: Number(e.target.value) })}
                                                                className="h-12 text-lg"
                                                            />
                                                        </div>
                                                    </div>


                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <Label className="text-base">Bairro</Label>
                                                            <Input
                                                                value={formData.neighborhood}
                                                                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                                                placeholder="Bairro"
                                                                className="h-12 text-lg"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-base">Cidade</Label>
                                                            <Input
                                                                value={formData.city}
                                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                                placeholder="Cidade"
                                                                className="h-12 text-lg"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-base">Estado</Label>
                                                        <Input
                                                            value={formData.state}
                                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                            placeholder="Estado"
                                                            className="h-12 text-lg"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                        <div className="md:col-span-3 space-y-2">
                                                            <Label className="text-base">Endereço Completo</Label>
                                                            <AddressAutocomplete
                                                                value={formData.address}
                                                                onChange={(val) => setFormData({ ...formData, address: val })}
                                                                className="h-12 text-lg"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-base">Número</Label>
                                                            <Input
                                                                value={formData.addressNumber}
                                                                onChange={(e) => setFormData({ ...formData, addressNumber: e.target.value })}
                                                                placeholder="Nº"
                                                                className="h-12 text-lg"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-base">Descrição Resumida</Label>
                                                        <Textarea
                                                            value={formData.description}
                                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                            className="min-h-[120px] resize-none text-base"
                                                            placeholder="Descreva os pontos fortes da propriedade..."
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}

                                    {/* STEP 3: CONTACT & STATUS */}
                                    {currentStep === 3 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                            <Card className="border-primary/10 shadow-lg h-full">
                                                <CardContent className="p-8 space-y-6">
                                                    <h3 className="text-xl font-bold flex items-center gap-3 text-primary mb-2">
                                                        <div className="p-2 bg-primary/10 rounded-lg">
                                                            <Phone className="w-6 h-6" />
                                                        </div>
                                                        Canais de Contato
                                                    </h3>
                                                    <p className="text-muted-foreground mb-6">Informações públicas para que os hóspedes encontrem sua propriedade.</p>

                                                    <div className="space-y-5">
                                                        <div className="space-y-2">
                                                            <Label className="text-base font-semibold">Email de Reservas</Label>
                                                            <div className="relative">
                                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                                <Input
                                                                    value={formData.email}
                                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                                    placeholder="contato@exemplo.com"
                                                                    className="h-14 pl-12 text-lg bg-muted/20 border-border/50 focus:border-primary"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-base font-semibold">Telefone / WhatsApp</Label>
                                                            <div className="relative">
                                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                                <Input
                                                                    value={formData.phone}
                                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                                    placeholder="(00) 00000-0000"
                                                                    className="h-14 pl-12 text-lg bg-muted/20 border-border/50 focus:border-primary"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-base font-semibold">Website da Propriedade</Label>
                                                            <div className="relative">
                                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                                <Input
                                                                    value={formData.website}
                                                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                                    placeholder="www.exemplo.com.br"
                                                                    className="h-14 pl-12 text-lg bg-muted/20 border-border/50 focus:border-primary"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <div className="space-y-8">
                                                <Card className="border-primary/10 shadow-lg">
                                                    <CardContent className="p-8 space-y-6">
                                                        <h3 className="text-xl font-bold flex items-center gap-3 text-primary mb-2">
                                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                                <Settings className="w-6 h-6" />
                                                            </div>
                                                            Status e Visibilidade
                                                        </h3>
                                                        <p className="text-muted-foreground mb-6">Controle a disponibilidade da propriedade no sistema.</p>

                                                        <div className="flex flex-col gap-4">
                                                            {["active", "maintenance", "inactive"].map((s) => (
                                                                <div
                                                                    key={s}
                                                                    onClick={() => setFormData({ ...formData, status: s as any })}
                                                                    className={cn(
                                                                        "p-5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group",
                                                                        formData.status === s
                                                                            ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                                                                            : "border-border/50 bg-background hover:bg-muted/50 hover:border-primary/30"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={cn("w-3 h-3 rounded-full ring-4 ring-offset-0",
                                                                            s === 'active' ? "bg-emerald-500 ring-emerald-500/20" : s === 'maintenance' ? "bg-amber-500 ring-amber-500/20" : "bg-red-500 ring-red-500/20"
                                                                        )} />
                                                                        <div className="flex flex-col">
                                                                            <span className="capitalize font-bold text-lg">
                                                                                {s === 'active' ? 'Ativo' : s === 'maintenance' ? 'Manutenção' : 'Inativo'}
                                                                            </span>
                                                                            <span className="text-xs text-muted-foreground">
                                                                                {s === 'active' ? 'Disponível para reservas' : s === 'maintenance' ? 'Em reparos temporários' : 'Oculto para novas reservas'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {formData.status === s && (
                                                                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                                                                            <Check className="w-4 h-4" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 rounded-2xl border border-primary/10 flex items-start gap-4 shadow-inner">
                                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-primary">
                                                        <Sparkles className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-primary mb-1 text-lg">Dica Estratégica</h4>
                                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                                            Mantenha suas informações de contato sempre atualizadas para facilitar a comunicação direta com os clientes.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 4: PHOTOS (UPLOAD) */}
                                    {currentStep === 4 && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                            <div className="bg-muted/30 border-2 border-dashed border-muted-foreground/20 rounded-2xl p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/5 group">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    className="hidden"
                                                    ref={fileInputRef}
                                                    onChange={handleFileUpload}
                                                    disabled={isUploading}
                                                />
                                                <div className="w-20 h-20 bg-background rounded-full shadow-sm mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                    {isUploading ? (
                                                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                                    ) : (
                                                        <UploadCloud className="w-10 h-10 text-primary" />
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-bold mb-2">
                                                    {isUploading ? "Enviando imagens..." : "Arraste fotos ou clique aqui"}
                                                </h3>
                                                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                                    Utilize imagens de alta qualidade (JPG, PNG, WebP).
                                                    O upload será salvo automaticamente no armazenamento do sistema.
                                                </p>
                                                <Button
                                                    size="lg"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={isUploading}
                                                    className="bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-semibold px-8"
                                                >
                                                    {isUploading ? "Enviando..." : "Selecionar Fotos"}
                                                </Button>
                                            </div>

                                            {formData.images && formData.images.length > 0 && (
                                                <div className="space-y-3">
                                                    <h3 className="font-semibold flex items-center gap-2">
                                                        <ImageIcon className="w-4 h-4" /> Galeria ({formData.images.length})
                                                    </h3>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {formData.images.map((url, idx) => (
                                                            <div key={idx} className="group relative aspect-video rounded-xl overflow-hidden bg-muted border shadow-sm">
                                                                <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={() => removeImage(idx)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* STEP 5: AMENITIES */}
                                    {currentStep === 5 && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                            <div className="space-y-4">
                                                <Label className="text-xl font-semibold">Amenidades Disponíveis</Label>
                                                <p className="text-muted-foreground">Selecione o que a propriedade oferece para atrair mais hóspedes.</p>
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                                    {amenitiesList.map((item) => {
                                                        const Icon = item.icon;
                                                        const isSelected = formData.amenities.includes(item.id);
                                                        return (
                                                            <div
                                                                key={item.id}
                                                                onClick={() => toggleAmenity(item.id)}
                                                                className={cn(
                                                                    "cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all hover:scale-105 duration-200",
                                                                    isSelected
                                                                        ? "bg-primary/10 border-primary text-primary shadow-md"
                                                                        : "bg-background hover:bg-muted/50 border-border"
                                                                )}
                                                            >
                                                                <Icon className="w-8 h-8" />
                                                                <span className="font-semibold text-sm">{item.name}</span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                                                <Card>
                                                    <CardContent className="p-6">
                                                        <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                                                            <Brush className="w-5 h-5 text-blue-500" /> Limpeza
                                                        </h4>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {cleaningOptions.map(opt => (
                                                                <div
                                                                    key={opt.id}
                                                                    onClick={() => setFormData({ ...formData, services: { ...formData.services, cleaning: opt.id } })}
                                                                    className={cn(
                                                                        "cursor-pointer p-3 rounded-lg text-center text-sm border-2 transition-all font-medium",
                                                                        formData.services.cleaning === opt.id
                                                                            ? "bg-blue-500/10 border-blue-500 text-blue-600"
                                                                            : "hover:bg-muted border-transparent bg-muted/50"
                                                                    )}
                                                                >
                                                                    {opt.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardContent className="p-6 space-y-6">
                                                        <h4 className="font-semibold text-lg flex items-center gap-2">
                                                            <Star className="w-5 h-5 text-amber-500" /> Serviços Premium
                                                        </h4>
                                                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                                            <div className="space-y-0.5">
                                                                <Label className="text-base">Coworking Space</Label>
                                                                <p className="text-xs text-muted-foreground">Área de trabalho dedicada</p>
                                                            </div>
                                                            <Switch
                                                                checked={formData.services.coworking}
                                                                onCheckedChange={(c) => setFormData({ ...formData, services: { ...formData.services, coworking: c } })}
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                                            <div className="space-y-0.5">
                                                                <Label className="text-base">Rooftop / Lazer</Label>
                                                                <p className="text-xs text-muted-foreground">Acesso ao terraço</p>
                                                            </div>
                                                            <Switch
                                                                checked={formData.services.rooftop}
                                                                onCheckedChange={(c) => setFormData({ ...formData, services: { ...formData.services, rooftop: c } })}
                                                            />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 6: RATES & RULES */}
                                    {currentStep === 6 && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                            <Card className="border-emerald-500/20 shadow-lg bg-gradient-to-br from-emerald-500/5 to-transparent">
                                                <CardContent className="p-8">
                                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                                        <DollarSign className="w-6 h-6" /> Precificação
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                        <div className="relative group">
                                                            <Label className="text-emerald-600 font-semibold mb-2 block uppercase text-xs tracking-wider">Diária</Label>
                                                            <div className="relative">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">R$</span>
                                                                <Input
                                                                    type="number"
                                                                    value={formData.rates.daily}
                                                                    onChange={(e) => setFormData({ ...formData, rates: { ...formData.rates, daily: Number(e.target.value) } })}
                                                                    className="pl-10 h-14 text-2xl font-bold bg-background/80 shadow-sm border-emerald-200 focus:border-emerald-500 transition-all"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-2">Valor base por noite</p>
                                                        </div>
                                                        <div className="relative group">
                                                            <Label className="text-purple-600 font-semibold mb-2 block uppercase text-xs tracking-wider">Semanal</Label>
                                                            <div className="relative">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">R$</span>
                                                                <Input
                                                                    type="number"
                                                                    value={formData.rates.weekly}
                                                                    onChange={(e) => setFormData({ ...formData, rates: { ...formData.rates, weekly: Number(e.target.value) } })}
                                                                    className="pl-10 h-14 text-2xl font-bold bg-background/80 shadow-sm border-purple-200 focus:border-purple-500 transition-all"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-2">Pacote para 7 dias</p>
                                                        </div>
                                                        <div className="relative group">
                                                            <Label className="text-amber-600 font-semibold mb-2 block uppercase text-xs tracking-wider">Mensal</Label>
                                                            <div className="relative">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">R$</span>
                                                                <Input
                                                                    type="number"
                                                                    value={formData.rates.monthly}
                                                                    onChange={(e) => setFormData({ ...formData, rates: { ...formData.rates, monthly: Number(e.target.value) } })}
                                                                    className="pl-10 h-14 text-2xl font-bold bg-background/80 shadow-sm border-amber-200 focus:border-amber-500 transition-all"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-2">Valor mensal (30 dias)</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="border-amber-500/20 shadow-lg bg-gradient-to-br from-amber-500/5 to-transparent animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                                                <CardContent className="p-8">
                                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                                        <Coins className="w-6 h-6" /> Taxas e Encargos
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="relative group">
                                                            <Label className="text-amber-600 font-semibold mb-2 block uppercase text-xs tracking-wider">Impostos (Tax Rate)</Label>
                                                            <div className="relative">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">%</span>
                                                                <Input
                                                                    type="number"
                                                                    value={formData.settings?.taxRate ?? 5}
                                                                    onChange={(e) => setFormData({
                                                                        ...formData,
                                                                        settings: { ...formData.settings, taxRate: Number(e.target.value) }
                                                                    })}
                                                                    className="pl-10 h-14 text-2xl font-bold bg-background/80 shadow-sm border-amber-200 focus:border-amber-500 transition-all"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-2">Percentual de impostos sobre a diária</p>
                                                        </div>
                                                        <div className="relative group">
                                                            <Label className="text-amber-600 font-semibold mb-2 block uppercase text-xs tracking-wider">Taxa de Serviço</Label>
                                                            <div className="relative">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">%</span>
                                                                <Input
                                                                    type="number"
                                                                    value={formData.settings?.serviceFee ?? 0}
                                                                    onChange={(e) => setFormData({
                                                                        ...formData,
                                                                        settings: { ...formData.settings, serviceFee: Number(e.target.value) }
                                                                    })}
                                                                    className="pl-10 h-14 text-2xl font-bold bg-background/80 shadow-sm border-amber-200 focus:border-amber-500 transition-all"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-2">Cobrança adicional de serviço</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Card>
                                                    <CardContent className="p-6">
                                                        <h4 className="font-semibold mb-6 flex items-center gap-2">
                                                            <Clock className="w-5 h-5 text-primary" /> Horários
                                                        </h4>
                                                        <div className="space-y-4">
                                                            <div className="space-y-2">
                                                                <Label>Check-in</Label>
                                                                <Input
                                                                    type="time"
                                                                    value={formData.checkInTime}
                                                                    onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                                                                    className="h-12 bg-muted/30"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Check-out</Label>
                                                                <Input
                                                                    type="time"
                                                                    value={formData.checkOutTime}
                                                                    onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                                                                    className="h-12 bg-muted/30"
                                                                />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
                                                    <CardContent className="p-6">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <h4 className="font-semibold flex items-center gap-2">
                                                                <User className="w-5 h-5 text-purple-600" /> Gestão de Proprietário
                                                            </h4>
                                                            <Switch checked={hasOwner} onCheckedChange={setHasOwner} />
                                                        </div>

                                                        {hasOwner ? (
                                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                                                <div className="space-y-2">
                                                                    <Label>Nome do Proprietário</Label>
                                                                    <Input
                                                                        placeholder="Nome completo"
                                                                        value={formData.owner?.name || ""}
                                                                        onChange={(e) => setFormData({
                                                                            ...formData,
                                                                            owner: { ...(formData.owner || { email: '', phone: '', commission: 0 }), name: e.target.value }
                                                                        })}
                                                                    />
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label>Email</Label>
                                                                        <Input
                                                                            placeholder="contato@email.com"
                                                                            value={formData.owner?.email || ""}
                                                                            onChange={(e) => setFormData({
                                                                                ...formData,
                                                                                owner: { ...(formData.owner || { name: '', phone: '', commission: 0 }), email: e.target.value }
                                                                            })}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>Comissão (%)</Label>
                                                                        <Input
                                                                            type="number"
                                                                            placeholder="10%"
                                                                            value={formData.owner?.commission || 0}
                                                                            onChange={(e) => setFormData({
                                                                                ...formData,
                                                                                owner: { ...(formData.owner || { name: '', email: '', phone: '' }), commission: Number(e.target.value) }
                                                                            })}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="py-8 text-center text-muted-foreground text-sm">
                                                                Ative esta opção se o imóvel for gerenciado para terceiros.
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ScrollArea>

                        {/* Pagination Footer */}
                        <div className="p-6 border-t bg-background/80 backdrop-blur-md flex items-center justify-between z-10 w-full mt-auto">
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Anterior
                            </Button>

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancelar
                                </Button>
                                {currentStep < steps.length ? (
                                    <Button onClick={nextStep} className="gap-2 px-8 bg-primary">
                                        Próximo <ArrowRight className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                        className="gap-2 px-8 bg-gradient-to-r from-primary to-purple-600 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105"
                                    >
                                        {createMutation.isPending || updateMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" /> Finalizar & Salvar
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
