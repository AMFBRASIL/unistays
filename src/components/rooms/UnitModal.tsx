import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
    Layers,
    BedDouble,
    Building2,
    DoorOpen,
    Compass,
    Wifi,
    Tv,
    Coffee,
    Bath as BathIcon,
    Check,
    Sparkles,
    Hotel,
    Building,
    Home,
    Palmtree,
    Sun,
    Moon,
    DollarSign,
    Users,
    Ruler,
    ImageIcon,
    Shield,
    Zap,
    Star,
    Crown,
    Waves,
    Lock,
    Thermometer,
    Volume2,
    Accessibility,
    PawPrint,
    Microwave,
    Shirt,
    Mountain,
    TreeDeciduous,
    Info,
    X,
    CheckCircle2,
    Bed,
    Snowflake,
    Flame,
    Wine,
    ParkingCircle,
    ArrowLeft,
    ArrowRight,
    Loader2,
    UploadCloud,
    Tv2,
    WifiIcon,
    UtensilsCrossed,
    LayoutGrid,
    Plus,
    Trash2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

interface Property {
    id: number;
    name: string;
    type: string;
    // Add other fields if necessary
}

// Reuse existing Room interface but ensuring compatibility
interface Room {
    id: number;
    number: string;
    type: string;
    floor: number;
    capacity: number;
    beds: string;
    amenities: string[];
    images?: string[];
    status: string;
    propertyId: number;
    roomTypeId?: number;
    rates: {
        daily: number;
        weekly: number;
        monthly: number;
    };
    view?: string;
    name?: string;
    sizeM2?: number;
}

interface UnitModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editRoom?: Room | null;
    selectedPropertyId?: number;
    properties?: Property[];
    /** Chamado após criar/atualizar com sucesso (ex.: refetch do mapa em /rooms) */
    onSaved?: () => void;
}

const propertyTypesConfig: Record<string, any> = {
    hotel: { icon: Hotel, label: "Hotel", color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30", textColor: "text-blue-500" },
    "apart-hotel": { icon: Building, label: "Apart-Hotel", color: "from-violet-500 to-purple-500", bgColor: "bg-violet-500/10", borderColor: "border-violet-500/30", textColor: "text-violet-500" },
    loft: { icon: Home, label: "Loft", color: "from-emerald-500 to-teal-500", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/30", textColor: "text-emerald-500" },
    temporada: { icon: Palmtree, label: "Temporada", color: "from-amber-500 to-orange-500", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30", textColor: "text-amber-500" },
};

const steps = [
    { id: 1, title: "Identificação", description: "Dados básicos da unidade", icon: DoorOpen },
    { id: 2, title: "Categoria", description: "Configuração e tipo", icon: BedDouble },
    { id: 3, title: "Amenidades", description: "Recursos disponíveis", icon: Sparkles },
    { id: 4, title: "Fotos", description: "Galeria de imagens", icon: ImageIcon },
    { id: 5, title: "Tarifas", description: "Preços e políticas", icon: DollarSign },
    { id: 6, title: "Revisão", description: "Confirmar dados", icon: CheckCircle2 },
];

const roomCategories = [
    { id: "Standard", label: "Standard", description: "Confortável e funcional", icon: BedDouble, basePrice: 180, color: "from-slate-500 to-slate-600" },
    { id: "Superior", label: "Superior", description: "Mais espaço e conforto", icon: Star, basePrice: 280, color: "from-blue-500 to-blue-600" },
    { id: "Deluxe", label: "Deluxe", description: "Luxo e sofisticação", icon: Crown, basePrice: 380, color: "from-violet-500 to-purple-600" },
    { id: "Suite", label: "Suíte", description: "Quarto + sala separados", icon: Layers, basePrice: 480, color: "from-amber-500 to-orange-600" },
    { id: "Master", label: "Master Suite", description: "O melhor da casa", icon: Zap, basePrice: 680, color: "from-rose-500 to-pink-600" },
    { id: "Penthouse", label: "Penthouse", description: "Cobertura exclusiva", icon: Building2, basePrice: 1200, color: "from-emerald-500 to-teal-600" },
];

const bedConfigs = [
    { id: "1 Solteiro", label: "1 Solteiro", icon: Bed, capacity: 1 },
    { id: "1 Casal", label: "1 Casal", icon: BedDouble, capacity: 2 },
    { id: "2 Solteiros", label: "2 Solteiros", icon: Bed, capacity: 2 },
    { id: "1 Queen", label: "1 Queen", icon: BedDouble, capacity: 2 },
    { id: "1 King", label: "1 King", icon: BedDouble, capacity: 2 },
    { id: "1 Casal + 2 Solteiros", label: "1 Casal + 2 Solteiros", icon: Users, capacity: 4 },
];

// New Bed Types for Custom Composition
const bedTypes = [
    { id: "king", label: "King Size", capacity: 2, icon: Crown },
    { id: "queen", label: "Queen Size", capacity: 2, icon: BedDouble },
    { id: "double", label: "Casal", capacity: 2, icon: BedDouble },
    { id: "single", label: "Solteiro", capacity: 1, icon: Bed },
    { id: "bunk", label: "Beliche", capacity: 2, icon: Layers },
    { id: "sofa", label: "Sofá-cama", capacity: 1, icon: Coffee }, // using Coffee icon for sofa for now or Bed
];

const spaceTypes = [
    { id: "bedroom", label: "Quarto", icon: BedDouble },
    { id: "living", label: "Sala", icon: Tv },
    { id: "area", label: "Área Comum", icon: LayoutGrid },
];

const viewTypes = [
    { id: "mar", icon: Waves, label: "Vista Mar", premium: true },
    { id: "montanha", icon: Mountain, label: "Vista Montanha", premium: true },
    { id: "jardim", icon: TreeDeciduous, label: "Vista Jardim", premium: false },
    { id: "cidade", icon: Building2, label: "Vista Cidade", premium: false },
    { id: "piscina", icon: Waves, label: "Vista Piscina", premium: true },
    { id: "interna", icon: Moon, label: "Vista Interna", premium: false },
];

const amenitiesGroups = [
    {
        title: "Tecnologia",
        icon: Wifi,
        items: [
            { id: "Wi-Fi", icon: WifiIcon, label: "Wi-Fi Alta Velocidade" },
            { id: "Smart TV", icon: Tv2, label: "Smart TV 55\"" },
            { id: "Streaming", icon: Tv, label: "Netflix/Prime" },
            { id: "Bluetooth", icon: Volume2, label: "Caixa Bluetooth" },
        ]
    },
    {
        title: "Conforto",
        icon: Snowflake,
        items: [
            { id: "Ar Cond.", icon: Snowflake, label: "Ar Condicionado" },
            { id: "Aquecimento", icon: Thermometer, label: "Aquecimento" },
            { id: "Cofre", icon: Lock, label: "Cofre Digital" },
            { id: "Blackout", icon: Moon, label: "Cortinas Blackout" },
        ]
    },
    {
        title: "Banheiro",
        icon: BathIcon,
        items: [
            { id: "Banheira", icon: BathIcon, label: "Banheira Hidro" },
            { id: "Chuveiro Teto", icon: Waves, label: "Chuveiro de Teto" },
            { id: "Kit Premium", icon: Sparkles, label: "Kit Premium" },
            { id: "Roupão", icon: Shirt, label: "Roupão e Chinelos" },
        ]
    },
    {
        title: "Cozinha",
        icon: UtensilsCrossed,
        items: [
            { id: "Frigobar", icon: Wine, label: "Frigobar" },
            { id: "Cafeteira", icon: Coffee, label: "Cafeteira Nespresso" },
            { id: "Microondas", icon: Microwave, label: "Microondas" },
            { id: "Cooktop", icon: Flame, label: "Cooktop" },
        ]
    },
    {
        title: "Extras",
        icon: Star,
        items: [
            { id: "Varanda", icon: Sun, label: "Varanda" },
            { id: "Jacuzzi", icon: Waves, label: "Jacuzzi Privativa" },
            { id: "Workspace", icon: Layers, label: "Área de Trabalho" },
            { id: "Vaga", icon: ParkingCircle, label: "Vaga Privativa" },
        ]
    },
];

export function UnitModal({ open, onOpenChange, editRoom, selectedPropertyId, properties: propertiesProp = [], onSaved }: UnitModalProps) {
    const [currentStep, setCurrentStep] = useState(1);

    const { data: fetchedProperties } = useQuery({
        queryKey: ["properties"],
        queryFn: async () => {
            const r = await api.getProperties();
            return (r.data?.properties as Property[]) ?? [];
        },
        enabled: open && (!propertiesProp || propertiesProp.length === 0),
    });
    const properties = (propertiesProp && propertiesProp.length > 0 ? propertiesProp : fetchedProperties) ?? [];
    const [formData, setFormData] = useState({
        propertyId: undefined as number | undefined,
        number: "",
        name: "",
        floor: "terreo",
        position: "frente",
        category: "",
        roomTypeId: undefined as number | undefined,
        bedConfig: "", // will hold summary string e.g., "Quarto 1: 1 Queen..."
        spaces: [] as Array<{ id: string; name: string; type: string; beds: Array<{ type: string; count: number }> }>,
        view: "",
        size: 30,
        maxOccupancy: 2,
        selectedAmenities: [] as string[],
        images: [] as string[],
        dailyRate: 280,
        weeklyRate: 1680,
        monthlyRate: 5600,
        weekendSurcharge: 20,
        dynamicPricing: true,
        petFriendly: false,
        accessible: false,
        smokingAllowed: false,
        notes: "",
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const queryClient = useQueryClient();

    const { data: amenitiesData } = useQuery({
        queryKey: ["amenities"],
        queryFn: () => api.getAmenities(undefined, undefined, "active"),
    });

    const { data: roomTypesData } = useQuery({
        queryKey: ["roomTypes", formData.propertyId],
        queryFn: () => api.getRoomTypes(formData.propertyId),
        enabled: !!formData.propertyId,
    });

    const isEditMode = !!editRoom;
    const selectedProperty = selectedPropertyId ? properties.find(p => p.id === selectedPropertyId) : null;
    const propertyConfig = selectedProperty ? propertyTypesConfig[selectedProperty.type] || propertyTypesConfig.hotel : propertyTypesConfig.hotel;

    useEffect(() => {
        if (editRoom) {
            setFormData(prev => ({
                ...prev,
                propertyId: editRoom.propertyId,
                number: editRoom.number,
                name: editRoom.name || "",
                size: editRoom.sizeM2 || 30,
                category: editRoom.type,
                roomTypeId: editRoom.roomTypeId,
                floor: editRoom.floor.toString(),
                maxOccupancy: editRoom.capacity,
                bedConfig: editRoom.beds,
                selectedAmenities: editRoom.amenities,
                dailyRate: editRoom.rates.daily,
                weeklyRate: editRoom.rates.weekly,
                monthlyRate: editRoom.rates.monthly,
                images: editRoom.images || [],
                view: editRoom.view || "",
                // Try to parse existing bed config back to spaces if possible, or create a default space
                spaces: (() => {
                    // Simple heuristic parser for the format "SpaceName: count Type, count Type | ..."
                    // If simple string, maybe put it all in one default space
                    if (!editRoom.beds) return [];

                    try {
                        const parts = editRoom.beds.split(" | ");
                        return parts.map((part, idx) => {
                            const [name, bedsStr] = part.includes(":") ? part.split(":") : [`Ambiente ${idx + 1}`, part];
                            // spaces often have "Quarto 1", "Sala", etc.
                            // try to detect type from name
                            let type = "bedroom";
                            if (name.toLowerCase().includes("sala")) type = "living";
                            if (name.toLowerCase().includes("área") || name.toLowerCase().includes("comum")) type = "area";

                            const bedsArray = bedsStr.split(",").map(b => {
                                const trimmed = b.trim();
                                const firstSpace = trimmed.indexOf(" ");
                                const count = parseInt(trimmed.substring(0, firstSpace));
                                const label = trimmed.substring(firstSpace + 1);
                                const bedTypeObj = bedTypes.find(bt => bt.label === label || bt.id === label) || bedTypes[2]; // Default to double
                                return { type: bedTypeObj.id, count: isNaN(count) ? 1 : count };
                            });

                            return {
                                id: Math.random().toString(36).substr(2, 9),
                                name: name.trim(),
                                type,
                                beds: bedsArray
                            };
                        });
                    } catch (e) {
                        // Fallback if parsing fails
                        return [{
                            id: Math.random().toString(36).substr(2, 9),
                            name: "Quarto Principal",
                            type: "bedroom",
                            beds: []
                        }];
                    }
                })(),
            }));
        } else {
            resetForm();
            if (selectedPropertyId) {
                setFormData(prev => ({ ...prev, propertyId: selectedPropertyId }));
            }
        }
    }, [editRoom, open, selectedPropertyId]); // Reset when opening new

    // Auto-match category ID from name if ID is missing (handling legacy data)
    useEffect(() => {
        if (roomTypesData?.data?.roomTypes && formData.category && !formData.roomTypeId) {
            const match = roomTypesData.data.roomTypes.find((rt: any) => rt.name === formData.category);
            if (match) {
                setFormData(prev => ({ ...prev, roomTypeId: match.id }));
            }
        }
    }, [roomTypesData, formData.category, formData.roomTypeId]);

    // Sync Room Type amenities when Room Type ID changes
    useEffect(() => {
        if (roomTypesData?.data?.roomTypes && formData.roomTypeId) {
            const currentRT = roomTypesData.data.roomTypes.find((rt: any) => rt.id === formData.roomTypeId);
            if (currentRT) {
                const amenityNames = currentRT.amenities ? currentRT.amenities.map((a: any) => a.name) : [];
                setFormData(prev => {
                    const isSame = prev.selectedAmenities.length === amenityNames.length &&
                        prev.selectedAmenities.every(n => amenityNames.includes(n));
                    if (isSame) return prev;
                    return { ...prev, selectedAmenities: amenityNames };
                });
            }
        }
    }, [roomTypesData, formData.roomTypeId]);

    const toggleAmenity = (id: string) => {
        setFormData(prev => ({
            ...prev,
            selectedAmenities: prev.selectedAmenities.includes(id)
                ? prev.selectedAmenities.filter(a => a !== id)
                : [...prev.selectedAmenities, id]
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const fileArray = Array.from(files);
            const response = await api.uploadMultipleImages(fileArray, 'units');

            if (response.success && response.data?.files) {
                const newUrls = response.data.files.map(f => f.fullUrl);
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, ...newUrls]
                }));
                toast({ title: "Sucesso", description: `${newUrls.length} fotos enviadas com sucesso` });
            } else {
                if (!response.success) toast({ variant: "destructive", title: "Erro", description: "Erro ao enviar imagens" });
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast({ variant: "destructive", title: "Erro", description: "Erro ao fazer upload das imagens" });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    // Space & Bed Management
    const addSpace = (type: string) => {
        const typeLabel = spaceTypes.find(s => s.id === type)?.label || "Espaço";
        const count = formData.spaces.filter(s => s.type === type).length + 1;
        const newSpace = {
            id: Math.random().toString(36).substr(2, 9),
            name: `${typeLabel} ${count}`,
            type,
            beds: []
        };
        updateSpaces([...formData.spaces, newSpace]);
    };

    const removeSpace = (spaceId: string) => {
        updateSpaces(formData.spaces.filter(s => s.id !== spaceId));
    };

    const addBedToSpace = (spaceId: string, bedType: string) => {
        const space = formData.spaces.find(s => s.id === spaceId);
        if (!space) return;

        const existingBed = space.beds.find(b => b.type === bedType);
        let newBeds;

        if (existingBed) {
            newBeds = space.beds.map(b => b.type === bedType ? { ...b, count: b.count + 1 } : b);
        } else {
            newBeds = [...space.beds, { type: bedType, count: 1 }];
        }

        const newSpaces = formData.spaces.map(s => s.id === spaceId ? { ...s, beds: newBeds } : s);
        updateSpaces(newSpaces);
    };

    const removeBedFromSpace = (spaceId: string, bedType: string) => {
        const space = formData.spaces.find(s => s.id === spaceId);
        if (!space) return;

        const existingBed = space.beds.find(b => b.type === bedType);
        if (!existingBed) return;

        let newBeds;
        if (existingBed.count > 1) {
            newBeds = space.beds.map(b => b.type === bedType ? { ...b, count: b.count - 1 } : b);
        } else {
            newBeds = space.beds.filter(b => b.type !== bedType);
        }

        const newSpaces = formData.spaces.map(s => s.id === spaceId ? { ...s, beds: newBeds } : s);
        updateSpaces(newSpaces);
    };

    const updateSpaces = (newSpaces: typeof formData.spaces) => {
        // Calculate new capacity and summary
        let capacity = 0;
        let summaryParts: string[] = [];

        newSpaces.forEach(space => {
            const spaceBeds = space.beds.map(b => {
                const bType = bedTypes.find(bt => bt.id === b.type);
                if (bType) capacity += bType.capacity * b.count;
                return `${b.count} ${bType?.label || b.type}`;
            }).join(", ");

            if (spaceBeds) {
                summaryParts.push(`${space.name}: ${spaceBeds}`);
            }
        });

        setFormData(prev => ({
            ...prev,
            spaces: newSpaces,
            maxOccupancy: capacity > 0 ? capacity : 2, // Default or calculated
            bedConfig: summaryParts.join(" | ") || "Sem camas definidas"
        }));
    };

    const handleNext = () => {
        if (currentStep < 6) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const invalidateUnitQueries = () => {
        // /rooms usa room-map-data; outras telas podem usar units
        void queryClient.invalidateQueries({ queryKey: ["room-map-data"] });
        void queryClient.invalidateQueries({ queryKey: ["units"] });
        if (editRoom?.id) {
            void queryClient.invalidateQueries({ queryKey: ["unit-details", editRoom.id] });
            void queryClient.invalidateQueries({ queryKey: ["unit-upcoming-reservations", editRoom.id] });
        }
    };

    const createMutation = useMutation({
        mutationFn: (data: any) => api.createUnit(data),
        onSuccess: () => {
            toast({ title: "✅ Unidade Criada", description: `A unidade ${formData.number} foi cadastrada com sucesso!` });
            invalidateUnitQueries();
            onSaved?.();
            onOpenChange(false);
            resetForm();
        },
        onError: (error) => {
            toast({ variant: "destructive", title: "Erro", description: "Falha ao criar unidade." });
            console.error(error);
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => api.updateUnit(editRoom!.id, data),
        onSuccess: () => {
            toast({ title: "✅ Unidade Atualizada", description: `A unidade ${formData.number} foi atualizada com sucesso!` });
            invalidateUnitQueries();
            onSaved?.();
            onOpenChange(false);
            resetForm();
        },
        onError: (error) => {
            toast({ variant: "destructive", title: "Erro", description: "Falha ao atualizar unidade." });
            console.error(error);
        }
    });

    const handleSubmit = () => {
        if (!formData.propertyId) {
            toast({ variant: "destructive", title: "Erro", description: "Selecione uma propriedade." });
            return;
        }

        const payload = {
            propertyId: formData.propertyId,
            number: formData.number,
            name: formData.name,
            type: formData.category || "Standard",
            roomTypeId: formData.roomTypeId,
            floor: parseInt(formData.floor) || 0,
            capacity: formData.maxOccupancy,
            maxCapacity: formData.maxOccupancy, // assuming same for now
            beds: formData.bedConfig,
            sizeM2: formData.size,
            amenities: formData.selectedAmenities,
            images: formData.images,
            status: "available", // default status
            rates: {
                daily: formData.dailyRate,
                weekly: formData.weeklyRate,
                monthly: formData.monthlyRate
            },
            notes: formData.notes,
            view: formData.view, // sending view to backend. User must ensure backend accepts it.
            settings: {
                view: formData.view
            }
        };

        if (isEditMode) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const resetForm = () => {
        setCurrentStep(1);
        setFormData({
            propertyId: selectedPropertyId,
            number: "",
            name: "",
            floor: "terreo",
            position: "frente",
            category: "",
            roomTypeId: undefined,
            bedConfig: "",
            spaces: [],
            view: "",
            size: 30,
            maxOccupancy: 2,
            selectedAmenities: [],
            images: [],
            dailyRate: 280,
            weeklyRate: 1680,
            monthlyRate: 5600,
            weekendSurcharge: 20,
            dynamicPricing: true,
            petFriendly: false,
            accessible: false,
            smokingAllowed: false,
            notes: "",
        });
    };

    const handleClose = () => {
        onOpenChange(false);
        resetForm();
    };

    const selectedCategory = roomCategories.find(c => c.id === formData.category);

    const canProceed = () => {
        switch (currentStep) {
            case 1: return !!(formData.number && formData.propertyId);
            case 2: return !!(formData.category && formData.bedConfig);
            case 3: return true;
            case 4: return true; // Photos optional
            case 5: return formData.dailyRate > 0;
            default: return true;
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] md:max-w-6xl h-[90vh] flex flex-col md:flex-row p-0 gap-0 border-border/50 overflow-hidden text-foreground">
                <DialogTitle className="sr-only">Nova Unidade</DialogTitle>

                {/* Left Sidebar - Navigation & Info (Hidden on mobile) */}
                <div className="hidden md:flex w-[320px] bg-muted/20 border-r border-border/50 flex-col h-full bg-gradient-to-b from-muted/30 to-background/50 backdrop-blur-sm">
                    {/* Header Info */}
                    <div className="p-6 border-b border-border/50 bg-background/50">
                        {selectedProperty && (
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
                                    propertyConfig.color
                                )}>
                                    <propertyConfig.icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold leading-tight">{selectedProperty.name}</h3>
                                    <Badge variant="secondary" className={cn("mt-1.5 text-[10px] h-5", propertyConfig.bgColor, propertyConfig.textColor)}>
                                        {propertyConfig.label}
                                    </Badge>
                                </div>
                            </div>
                        )}
                        {!selectedProperty && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="font-semibold">Nova Unidade</h3>
                            </div>
                        )}
                        {/* Capacity Summary */}
                        <div className="mt-4 p-3 rounded-lg bg-card/50 border border-border/50">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Capacidade Total</span>
                                <span className="font-bold text-foreground flex items-center gap-1">
                                    <Users className="w-3 h-3" /> {formData.maxOccupancy}
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 truncate">
                                {formData.bedConfig || "Configure as camas no passo 2"}
                            </div>
                        </div>
                    </div>

                    {/* Stepper Navigation */}
                    <div className="flex-1 py-8 px-6 space-y-2 overflow-y-auto">
                        {steps.map((step, index) => {
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;
                            const StepIcon = step.icon;

                            return (
                                <div key={step.id} className="relative group">
                                    {/* Vertical Line */}
                                    {index < steps.length - 1 && (
                                        <div className={cn(
                                            "absolute left-[19px] top-[40px] w-[2px] h-[calc(100%+8px)] transition-colors",
                                            isCompleted ? "bg-primary" : "bg-border/50"
                                        )} />
                                    )}

                                    <button
                                        onClick={() => isCompleted && setCurrentStep(step.id)}
                                        disabled={!isCompleted && !isActive}
                                        className={cn(
                                            "w-full flex items-start gap-4 p-3 rounded-xl transition-all text-left",
                                            isActive ? "bg-background shadow-md border border-border/50" : "hover:bg-background/50",
                                            !isCompleted && !isActive && "opacity-60"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all z-10",
                                            isActive ? "border-primary bg-primary text-primary-foreground scale-110" :
                                                isCompleted ? "border-primary bg-primary text-primary-foreground" :
                                                    "border-border bg-background text-muted-foreground"
                                        )}>
                                            {isCompleted ? <Check className="w-5 h-5" /> : <span className="font-bold text-sm">{step.id}</span>}
                                        </div>
                                        <div className="pt-1">
                                            <p className={cn(
                                                "font-semibold text-sm",
                                                isActive ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {step.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                                        </div>
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Left Footer Info */}
                    <div className="p-6 border-t border-border/50 bg-background/30 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4" />
                            <span>Dica</span>
                        </div>
                        <p>Preencha todas as etapas para liberar o botão de finalizar.</p>
                    </div>
                </div>

                {/* Right Content */}
                <div className="flex-1 flex flex-col h-full bg-background relative">
                    {/* Top Header */}
                    <div className="h-16 border-b border-border/50 flex items-center justify-between px-8 bg-background/50 backdrop-blur-sm sticky top-0 z-20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                {(() => {
                                    const CurrentIcon = steps[currentStep - 1].icon;
                                    return <CurrentIcon className="w-5 h-5" />;
                                })()}
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-lg font-bold">{steps[currentStep - 1].title}</h2>
                                <p className="text-xs text-muted-foreground md:hidden">
                                    Passo {currentStep} de 6
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Scrollable Content */}
                    <ScrollArea className="flex-1 w-full p-0">
                        <div className="p-8 max-w-4xl mx-auto pb-32">
                            {/* Step 1: Identificação */}
                            {currentStep === 1 && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="max-w-2xl mx-auto space-y-6">

                                        {/* Property Selector if needed */}
                                        {/* Property Selector - Visual Grid */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-base font-semibold flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-primary" />
                                                    Propriedade *
                                                </Label>
                                                {(!!editRoom || !!selectedPropertyId) && (
                                                    <Badge variant="secondary" className="text-xs">Fixado</Badge>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {properties.map((p) => {
                                                    const isLocked = !!editRoom || !!selectedPropertyId;
                                                    const isSelected = formData.propertyId === p.id;
                                                    const config = propertyTypesConfig[p.type] || propertyTypesConfig.hotel;

                                                    return (
                                                        <button
                                                            key={p.id}
                                                            type="button"
                                                            onClick={() => !isLocked && setFormData(prev => ({ ...prev, propertyId: p.id }))}
                                                            disabled={isLocked && !isSelected}
                                                            className={cn(
                                                                "relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-200 text-left outline-none group",
                                                                isSelected
                                                                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary/20"
                                                                    : isLocked
                                                                        ? "border-dashed border-border/50 opacity-40 cursor-not-allowed bg-muted/20"
                                                                        : "border-border/50 bg-card hover:border-primary/50 hover:shadow-md cursor-pointer hover:bg-muted/10"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
                                                                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                                            )}>
                                                                <config.icon className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className={cn("font-bold text-base leading-tight", isSelected ? "text-foreground" : "text-muted-foreground")}>
                                                                    {p.name}
                                                                </span>
                                                                <span className="text-[10px] items-center gap-1 text-muted-foreground uppercase font-semibold mt-1 flex">
                                                                    {config.label}
                                                                </span>
                                                            </div>

                                                            {isSelected && (
                                                                <div className="absolute top-4 right-4 animate-in fade-in zoom-in">
                                                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-base font-semibold flex items-center gap-2">
                                                    <DoorOpen className="h-4 w-4 text-primary" />
                                                    Número/Código *
                                                </Label>
                                                <Input
                                                    placeholder="Ex: 101, A01, Suite 5"
                                                    value={formData.number}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                                                    className="h-14 text-lg bg-card border-border/50"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-base font-semibold flex items-center gap-2">
                                                    <Star className="h-4 w-4 text-primary" />
                                                    Nome/Apelido
                                                </Label>
                                                <Input
                                                    placeholder="Ex: Suíte Presidencial"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                    className="h-14 text-lg bg-card border-border/50"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-base font-semibold flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-primary" />
                                                    Andar *
                                                </Label>
                                                <Select value={formData.floor} onValueChange={(v) => setFormData(prev => ({ ...prev, floor: v }))}>
                                                    <SelectTrigger className="h-14 text-lg bg-card border-border/50">
                                                        <SelectValue placeholder="Selecione o andar" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="terreo">Térreo</SelectItem>
                                                        <SelectItem value="mezanino">Mezanino</SelectItem>
                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20].map((f) => (
                                                            <SelectItem key={f} value={f.toString()}>{f}º Andar</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-base font-semibold flex items-center gap-2">
                                                    <Compass className="h-4 w-4 text-primary" />
                                                    Posição
                                                </Label>
                                                <Select value={formData.position} onValueChange={(v) => setFormData(prev => ({ ...prev, position: v }))}>
                                                    <SelectTrigger className="h-14 text-lg bg-card border-border/50">
                                                        <SelectValue placeholder="Localização no andar" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="frente">Frente</SelectItem>
                                                        <SelectItem value="fundos">Fundos</SelectItem>
                                                        <SelectItem value="lateral-esq">Lateral Esquerda</SelectItem>
                                                        <SelectItem value="lateral-dir">Lateral Direita</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Size Slider */}
                                        <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-base font-semibold flex items-center gap-2">
                                                    <Ruler className="h-4 w-4 text-primary" />
                                                    Área da Unidade
                                                </Label>
                                                <span className="text-2xl font-bold text-primary">{formData.size} m²</span>
                                            </div>
                                            <Slider
                                                value={[formData.size]}
                                                onValueChange={([value]) => setFormData(prev => ({ ...prev, size: value }))}
                                                min={15}
                                                max={200}
                                                step={5}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>15m² (Compacto)</span>
                                                <span>200m² (Penthouse)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Categoria */}
                            {currentStep === 2 && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="space-y-4">
                                        <Label className="text-base font-semibold">Categoria do Quarto *</Label>
                                        {!formData.propertyId ? (
                                            <div className="text-center p-8 border border-dashed rounded-xl border-border/50 bg-muted/20">
                                                <Building2 className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                                <p className="text-muted-foreground">Selecione uma propriedade no Passo 1 para ver as categorias disponíveis.</p>
                                                <Button variant="link" onClick={() => setCurrentStep(1)}>Voltar para Passo 1</Button>
                                            </div>
                                        ) : !roomTypesData?.data?.roomTypes?.length ? (
                                            <div className="text-center p-8 border border-dashed rounded-xl border-border/50 bg-muted/20">
                                                <BedDouble className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                                <p className="text-muted-foreground">Nenhuma categoria cadastrada para esta propriedade.</p>
                                                <p className="text-xs text-muted-foreground mt-2">Cadastre em Registros {'>'} Tipos de Quarto.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                                {roomTypesData.data.roomTypes.map((cat: any, index: number) => {
                                                    const colors = [
                                                        "from-slate-500 to-slate-600",
                                                        "from-blue-500 to-blue-600",
                                                        "from-violet-500 to-purple-600",
                                                        "from-amber-500 to-orange-600",
                                                        "from-rose-500 to-pink-600",
                                                        "from-emerald-500 to-teal-600"
                                                    ];
                                                    const colorClass = colors[index % colors.length];

                                                    return (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => setFormData(prev => ({
                                                                ...prev,
                                                                category: cat.name,
                                                                roomTypeId: cat.id,
                                                                dailyRate: cat.basePrice || prev.dailyRate,
                                                                weeklyRate: cat.basePrice ? cat.basePrice * 6 : prev.weeklyRate,
                                                                monthlyRate: cat.basePrice ? cat.basePrice * 20 : prev.monthlyRate,
                                                                maxOccupancy: cat.maxGuests || prev.maxOccupancy
                                                            }))}
                                                            className={cn(
                                                                "relative p-5 rounded-2xl border-2 transition-all duration-300 text-left group overflow-hidden h-full flex flex-col",
                                                                formData.roomTypeId === cat.id
                                                                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                                                                    : "border-border/50 bg-card hover:border-primary/30 hover:shadow-md"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all bg-gradient-to-br shrink-0",
                                                                colorClass
                                                            )}>
                                                                <BedDouble className="h-6 w-6 text-white" />
                                                            </div>
                                                            <div className="flex flex-col justify-between flex-1 w-full gap-2">
                                                                <div>
                                                                    <p className="font-bold text-foreground text-lg leading-tight">{cat.name}</p>
                                                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{cat.description}</p>
                                                                </div>
                                                                {cat.basePrice && (
                                                                    <div className="mt-auto pt-2">
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            R$ {cat.basePrice}
                                                                        </Badge>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {formData.roomTypeId === cat.id && (
                                                                <div className="absolute top-3 right-3">
                                                                    <CheckCircle2 className="h-6 w-6 text-primary" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Bed Configuration - Flexible Spaces */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-base font-semibold">Configuração de Camas *</Label>
                                            <div className="flex gap-2">
                                                {spaceTypes.map(st => (
                                                    <Button key={st.id} size="sm" variant="outline" onClick={() => addSpace(st.id)} className="gap-1 text-xs">
                                                        <Plus className="w-3 h-3" />
                                                        {st.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Spaces List */}
                                        <div className="space-y-3">
                                            {formData.spaces.length === 0 && (
                                                <div className="text-center p-6 border-2 border-dashed border-border/50 rounded-xl text-muted-foreground text-sm">
                                                    Nenhum espaço configurado. Adicione quartos, salas ou áreas comuns.
                                                </div>
                                            )}
                                            {formData.spaces.map(space => (
                                                <div key={space.id} className="p-4 rounded-xl border border-border/50 bg-card/50 space-y-3 animate-fade-in relative group">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {(() => {
                                                                const sType = spaceTypes.find(st => st.id === space.type);
                                                                const Icon = sType?.icon || Building2;
                                                                return <Icon className="w-4 h-4 text-primary" />;
                                                            })()}
                                                            <Input
                                                                value={space.name}
                                                                onChange={(e) => {
                                                                    const newSpaces = formData.spaces.map(s => s.id === space.id ? { ...s, name: e.target.value } : s);
                                                                    updateSpaces(newSpaces);
                                                                }}
                                                                className="h-8 w-40 text-sm font-semibold border-none bg-transparent focus:bg-background/50 p-0"
                                                            />
                                                        </div>
                                                        <Button variant="ghost" size="icon-sm" onClick={() => removeSpace(space.id)} className="text-muted-foreground hover:text-destructive">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>

                                                    {/* Beds in Space */}
                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                                        {bedTypes.map(bed => {
                                                            const count = space.beds.find(b => b.type === bed.id)?.count || 0;
                                                            return (
                                                                <div key={bed.id} className={cn(
                                                                    "flex items-center justify-between p-2 rounded-lg border text-xs",
                                                                    count > 0 ? "border-primary/50 bg-primary/5" : "border-border/30 opacity-70 hover:opacity-100"
                                                                )}>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <bed.icon className="w-3 h-3" />
                                                                        <span>{bed.label}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        {count > 0 && (
                                                                            <button onClick={() => removeBedFromSpace(space.id, bed.id)} className="p-0.5 hover:text-destructive"><span className="text-lg leading-none">-</span></button>
                                                                        )}
                                                                        <span className={cn("font-bold min-w-[12px] text-center", count > 0 ? "text-primary" : "text-muted-foreground")}>{count}</span>
                                                                        <button onClick={() => addBedToSpace(space.id, bed.id)} className="p-0.5 hover:text-primary"><span className="text-lg leading-none">+</span></button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* View Type */}
                                    <div className="space-y-4">
                                        <Label className="text-base font-semibold">Vista do Quarto</Label>
                                        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                                            {viewTypes.map((view) => (
                                                <button
                                                    key={view.id}
                                                    onClick={() => setFormData(prev => ({ ...prev, view: view.id }))}
                                                    className={cn(
                                                        "relative p-4 rounded-xl border-2 transition-all text-center",
                                                        formData.view === view.id
                                                            ? "border-amber-500 bg-amber-500/10"
                                                            : "border-border/50 bg-card hover:border-amber-500/30"
                                                    )}
                                                >
                                                    {view.premium && (
                                                        <Crown className="absolute top-2 right-2 h-4 w-4 text-amber-500" />
                                                    )}
                                                    <view.icon className={cn(
                                                        "h-8 w-8 mx-auto mb-2",
                                                        formData.view === view.id ? "text-amber-500" : "text-muted-foreground"
                                                    )} />
                                                    <p className="text-xs font-medium">{view.label}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Amenidades */}
                            {currentStep === 3 && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="space-y-6">
                                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                                            <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold text-blue-500">Amenidades da Categoria</h4>
                                                <p className="text-sm text-blue-500/80">
                                                    As amenidades são herdadas automaticamente da Categoria selecionada ({formData.category}).
                                                    Elas não podem ser alteradas individualmente por unidade.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="h-5 w-5 text-primary" />
                                                <Label className="text-base font-semibold">Recursos Disponíveis</Label>
                                            </div>

                                            {(() => {
                                                const amenitiesList = amenitiesData?.data?.amenities || [];

                                                // Find the amenities associated with the currently selected Room Type
                                                const selectedRT = roomTypesData?.data?.roomTypes?.find((rt: any) => rt.id === formData.roomTypeId);
                                                const includedNames = selectedRT?.amenities?.map((a: any) => a.name) || [];

                                                if (amenitiesList.length === 0) {
                                                    return <div className="text-center text-muted-foreground p-4">Nenhuma amenidade cadastrada no sistema.</div>;
                                                }

                                                return (
                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                                        {amenitiesList.map((item: any) => {
                                                            const isIncluded = includedNames.includes(item.name);
                                                            return (
                                                                <div
                                                                    key={item.id}
                                                                    className={cn(
                                                                        "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                                                        isIncluded
                                                                            ? "border-primary bg-primary/10"
                                                                            : "border-border/50 bg-card opacity-50 grayscale"
                                                                    )}
                                                                >
                                                                    <div className={cn(
                                                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                                                        isIncluded
                                                                            ? "bg-primary text-primary-foreground"
                                                                            : "bg-muted text-muted-foreground"
                                                                    )}>
                                                                        <Sparkles className="w-4 h-4" />
                                                                    </div>
                                                                    <span className={cn(
                                                                        "text-sm font-medium",
                                                                        isIncluded
                                                                            ? "text-primary"
                                                                            : "text-muted-foreground"
                                                                    )}>
                                                                        {item.name}
                                                                    </span>
                                                                    {isIncluded && (
                                                                        <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                                                                    )}
                                                                    {!isIncluded && (
                                                                        <span className="text-[10px] text-muted-foreground ml-auto">Não incluso</span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Fotos (Upload) */}
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

                            {/* Step 5: Tarifas */}
                            {currentStep === 5 && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Pricing */}
                                        <div className="space-y-6">
                                            <h4 className="font-semibold text-lg flex items-center gap-2">
                                                <DollarSign className="h-5 w-5 text-primary" />
                                                Tarifas Base
                                            </h4>

                                            <div className="space-y-4">
                                                <div className="p-4 rounded-xl bg-card border border-border/50 space-y-2">
                                                    <Label className="text-sm text-muted-foreground">Diária</Label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground">R$</span>
                                                        <Input
                                                            type="number"
                                                            value={formData.dailyRate}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, dailyRate: parseFloat(e.target.value) || 0 }))}
                                                            className="text-2xl font-bold h-14 border-0 bg-transparent p-0"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="p-4 rounded-xl bg-card border border-border/50 space-y-2">
                                                    <Label className="text-sm text-muted-foreground">Semanal</Label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground">R$</span>
                                                        <Input
                                                            type="number"
                                                            value={formData.weeklyRate}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, weeklyRate: parseFloat(e.target.value) || 0 }))}
                                                            className="text-xl font-bold h-12 border-0 bg-transparent p-0"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-emerald-500">
                                                        {Math.round((1 - formData.weeklyRate / (formData.dailyRate * 7)) * 100)}% desconto
                                                    </p>
                                                </div>

                                                <div className="p-4 rounded-xl bg-card border border-border/50 space-y-2">
                                                    <Label className="text-sm text-muted-foreground">Mensal</Label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground">R$</span>
                                                        <Input
                                                            type="number"
                                                            value={formData.monthlyRate}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, monthlyRate: parseFloat(e.target.value) || 0 }))}
                                                            className="text-xl font-bold h-12 border-0 bg-transparent p-0"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-emerald-500">
                                                        {Math.round((1 - formData.monthlyRate / (formData.dailyRate * 30)) * 100)}% desconto
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Policies */}
                                        <div className="space-y-6">
                                            <h4 className="font-semibold text-lg flex items-center gap-2">
                                                <Shield className="h-5 w-5 text-primary" />
                                                Políticas & Configurações
                                            </h4>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50">
                                                    <div className="flex items-center gap-3">
                                                        <PawPrint className="h-5 w-5 text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium">Pet Friendly</p>
                                                            <p className="text-xs text-muted-foreground">Aceita animais</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={formData.petFriendly}
                                                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, petFriendly: checked }))}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50">
                                                    <div className="flex items-center gap-3">
                                                        <Accessibility className="h-5 w-5 text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium">Acessível</p>
                                                            <p className="text-xs text-muted-foreground">Cadeirantes</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={formData.accessible}
                                                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, accessible: checked }))}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50">
                                                    <div className="flex items-center gap-3">
                                                        <Zap className="h-5 w-5 text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium">Precificação Dinâmica</p>
                                                            <p className="text-xs text-muted-foreground">Ajuste automático</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={formData.dynamicPricing}
                                                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, dynamicPricing: checked }))}
                                                    />
                                                </div>
                                            </div>

                                            {/* Weekend Surcharge */}
                                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Label className="font-medium">Acréscimo Fim de Semana</Label>
                                                    <span className="text-lg font-bold text-amber-500">+{formData.weekendSurcharge}%</span>
                                                </div>
                                                <Slider
                                                    value={[formData.weekendSurcharge]}
                                                    onValueChange={([value]) => setFormData(prev => ({ ...prev, weekendSurcharge: value }))}
                                                    min={0}
                                                    max={50}
                                                    step={5}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 6: Finalização */}
                            {currentStep === 6 && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="text-center max-w-lg mx-auto">
                                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30">
                                            <CheckCircle2 className="h-12 w-12 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-foreground mb-2">Tudo Pronto!</h3>
                                        <p className="text-muted-foreground">
                                            Revise as informações e confirme a criação da unidade
                                        </p>
                                    </div>

                                    {/* Summary Card */}
                                    <div className="max-w-3xl mx-auto">
                                        <div className="p-6 rounded-2xl bg-gradient-to-br from-card via-card to-muted/30 border border-border/50 space-y-6">
                                            {/* Unit Header */}
                                            <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                                                <div className={cn(
                                                    "w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br",
                                                    selectedCategory?.color || "from-primary to-accent"
                                                )}>
                                                    {selectedCategory?.icon ? (
                                                        <selectedCategory.icon className="h-8 w-8 text-white" />
                                                    ) : (
                                                        <BedDouble className="h-8 w-8 text-white" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-2xl font-bold">Unidade {formData.number}</h4>
                                                    <p className="text-muted-foreground">
                                                        {selectedCategory?.label || "Standard"} • {formData.floor ? `${formData.floor}º Andar` : ""} • {formData.size}m²
                                                    </p>
                                                </div>
                                                <div className="ml-auto text-right">
                                                    <p className="text-sm text-muted-foreground">A partir de</p>
                                                    <p className="text-3xl font-bold text-primary">R$ {formData.dailyRate}</p>
                                                    <p className="text-xs text-muted-foreground">por noite</p>
                                                </div>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div className="p-4 rounded-xl bg-muted/50 text-center">
                                                    <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                                                    <p className="text-2xl font-bold">{formData.maxOccupancy}</p>
                                                    <p className="text-xs text-muted-foreground">Hóspedes</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-muted/50 text-center">
                                                    <BedDouble className="h-6 w-6 mx-auto mb-2 text-violet-500" />
                                                    <p className="text-lg font-bold">{bedConfigs.find(b => b.id === formData.bedConfig)?.label || "-"}</p>
                                                    <p className="text-xs text-muted-foreground">Camas</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-muted/50 text-center">
                                                    <ImageIcon className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                                                    <p className="text-lg font-bold">{formData.images.length}</p>
                                                    <p className="text-xs text-muted-foreground">Fotos</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-muted/50 text-center">
                                                    <Sparkles className="h-6 w-6 mx-auto mb-2 text-pink-500" />
                                                    <p className="text-2xl font-bold">{formData.selectedAmenities.length}</p>
                                                    <p className="text-xs text-muted-foreground">Amenidades</p>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2">
                                                {formData.petFriendly && (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <PawPrint className="h-3 w-3" /> Pet Friendly
                                                    </Badge>
                                                )}
                                                {formData.accessible && (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <Accessibility className="h-3 w-3" /> Acessível
                                                    </Badge>
                                                )}
                                                {formData.dynamicPricing && (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <Zap className="h-3 w-3" /> Precificação Dinâmica
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </ScrollArea>

                    {/* Fixed Bottom Footer */}
                    <div className="p-6 border-t border-border/50 bg-background/95 backdrop-blur absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={currentStep === 1 ? handleClose : handleBack}
                            className="gap-2"
                        >
                            {currentStep === 1 ? (
                                <>
                                    <X className="h-4 w-4" />
                                    Cancelar
                                </>
                            ) : (
                                <>
                                    <ArrowLeft className="h-4 w-4" />
                                    Voltar
                                </>
                            )}
                        </Button>

                        {currentStep < 6 ? (
                            <Button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 pl-8 pr-8"
                            >
                                Próximo
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white pl-8 pr-8"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Check className="h-4 w-4" />}
                                {isEditMode ? "Salvar Alterações" : "Criar Unidade"}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
