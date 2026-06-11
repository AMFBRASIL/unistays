import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wrench,
  Building2,
  Info,
  Calendar,
  FileText,
  Check,
  ChevronRight,
  Upload,
  X,
  Tv,
  AirVent,
  WashingMachine,
  Refrigerator,
  Flame,
  Wifi,
  Lock,
  Lightbulb,
  Zap,
  Thermometer,
  MapPin,
  Tag,
  Hash,
  Package,
  ShieldCheck,
  AlertCircle,
  Camera,
  Sparkles,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { EquipmentCategoryModal } from "./EquipmentCategoryModal";

interface EquipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When "new", opens directly in the new-equipment wizard (e.g. when opened from EquipmentsListModal). */
  initialView?: "list" | "new";
}

const steps = [
  { id: 1, title: "Propriedade", icon: Building2 },
  { id: 2, title: "Categoria", icon: Package },
  { id: 3, title: "Informações", icon: Info },
  { id: 4, title: "Localização", icon: MapPin },
  { id: 5, title: "Manutenção", icon: Calendar },
];

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300";

const locationTypeLabels: Record<string, string> = {
  room: "Quarto",
  common_area: "Área Comum",
  operational: "Operacional",
  leisure: "Lazer",
  technical: "Técnico",
  external: "Externo",
};

// Icon mapping for categories (API returns icon name as string)
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  AirVent, WashingMachine, Flame, Refrigerator, Tv, Lock, Lightbulb, Wifi, Zap, Thermometer, Package,
};

type PropertyItem = { id: string; name: string; address?: string; image?: string };
type CategoryItem = { id: string; label: string; description?: string; icon: React.ComponentType<{ className?: string }>; color: string };
type LocationItem = { id: string; name: string; type: string };

/** Equipment as returned by API (getEquipments) */
interface ApiEquipment {
  id: number;
  name: string;
  description?: string | null;
  categoryId?: number | null;
  category?: { id: number; name: string; icon?: string; color?: string } | null;
  propertyId?: number | null;
  location?: string | null;
  serialNumber?: string | null;
  model?: string | null;
  manufacturer?: string | null;
  status?: string;
  active?: boolean;
  imageUrl?: string | null;
  [key: string]: unknown;
}

export function EquipmentModal({ open, onOpenChange, initialView = "list" }: EquipmentModalProps) {
  const [viewMode, setViewMode] = useState<"list" | "new">(initialView);
  const [equipments, setEquipments] = useState<ApiEquipment[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [formData, setFormData] = useState({
    propertyId: "",
    category: "",
    name: "",
    code: "",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    warrantyUntil: "",
    purchaseValue: "",
    supplier: "",
    invoiceNumber: "",
    locationId: "",
    locationDetail: "",
    maintenanceFrequency: "",
    lastMaintenance: "",
    nextMaintenance: "",
    responsibleTeam: "",
    notes: "",
    status: "active",
    imageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  useEffect(() => {
    if (open) setViewMode(initialView);
  }, [open, initialView]);

  const fetchEquipments = async () => {
    setLoadingList(true);
    try {
      const res = await api.getEquipments();
      const data = (res as { data?: { equipments?: ApiEquipment[] } })?.data;
      setEquipments(data?.equipments ?? []);
    } catch {
      setEquipments([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    if (viewMode === "list") fetchEquipments();
  }, [open, viewMode]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const [propRes, catRes] = await Promise.all([
          api.getProperties(),
          api.getEquipmentCategories(),
        ]);
        if (cancelled) return;
        const propData = (propRes as { data?: { properties?: { id: number; name?: string; address?: string }[] } }).data;
        const catData = (catRes as { data?: { equipmentCategories?: { id: number; name: string; description?: string; icon?: string; color?: string }[] } }).data;
        if (propData?.properties) {
          setProperties(propData.properties.map((p: { id: number; name?: string; address?: string }) => ({
            id: String(p.id),
            name: p.name ?? "",
            address: p.address ?? "",
            image: PLACEHOLDER_IMAGE,
          })));
        }
        if (catData?.equipmentCategories) {
          setCategories(catData.equipmentCategories.map((c: { id: number; name: string; description?: string; icon?: string; color?: string }) => ({
            id: String(c.id),
            label: c.name,
            description: c.description ?? "",
            icon: iconMap[c.icon ?? "Package"] ?? Package,
            color: c.color ?? "from-gray-500 to-slate-500",
          })));
        }
      } catch (e) {
        if (!cancelled) toast({ title: "Erro ao carregar dados", description: (e as Error)?.message, variant: "destructive" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (!open || !formData.propertyId) {
      setLocations([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.getEquipmentLocations(Number(formData.propertyId));
        if (cancelled) return;
        const data = (res as { data?: { equipmentLocations?: { id: number; name: string; locationType?: string }[] } }).data;
        if (data?.equipmentLocations) {
          setLocations(data.equipmentLocations.map((l: { id: number; name: string; locationType?: string }) => ({
            id: String(l.id),
            name: l.name,
            type: locationTypeLabels[l.locationType ?? "room"] ?? l.locationType ?? "Quarto",
          })));
        } else {
          setLocations([]);
        }
      } catch {
        setLocations([]);
      }
    })();
    return () => { cancelled = true; };
  }, [open, formData.propertyId]);

  const allCategories = categories;
  const selectedProperty = properties.find(p => p.id === formData.propertyId);
  const selectedCategory = allCategories.find(c => c.id === formData.category);

  const handleCategoryCreated = (newCategory: { id: string; label: string; icon: string; color: string }) => {
    setCategories(prev => [...prev, {
      id: newCategory.id,
      label: newCategory.label,
      description: "Categoria personalizada",
      icon: iconMap[newCategory.icon] ?? Package,
      color: newCategory.color,
    }]);
    setFormData(prev => ({ ...prev, category: newCategory.id }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const res = await api.uploadImage(file, "equipments");
      const data = (res as { data?: { fullUrl?: string; url?: string } })?.data;
      const url = data?.fullUrl ?? data?.url;
      if (url) {
        setFormData((prev) => ({ ...prev, imageUrl: url }));
        setImagePreview(url);
      } else {
        toast({ title: "Upload falhou", description: "Resposta sem URL.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Erro no upload", description: (err as Error)?.message ?? "Tente novamente.", variant: "destructive" });
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      propertyId: "",
      category: "",
      name: "",
      code: "",
      brand: "",
      model: "",
      serialNumber: "",
      purchaseDate: "",
      warrantyUntil: "",
      purchaseValue: "",
      supplier: "",
      invoiceNumber: "",
    locationId: "",
    locationDetail: "",
    maintenanceFrequency: "",
    lastMaintenance: "",
    nextMaintenance: "",
    responsibleTeam: "",
    notes: "",
    status: "active",
    imageUrl: "",
    });
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    const propertyId = formData.propertyId ? Number(formData.propertyId) : null;
    const categoryId = formData.category ? Number(formData.category) : null;
    if (!propertyId || !categoryId) {
      toast({ title: "Dados obrigatórios", description: "Selecione propriedade e categoria.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await api.createEquipment({
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.notes?.trim() || undefined,
        categoryId,
        propertyId,
        locationId: formData.locationId ? Number(formData.locationId) : undefined,
        locationDetail: formData.locationDetail?.trim() || undefined,
        serialNumber: formData.serialNumber?.trim() || undefined,
        model: formData.model?.trim() || undefined,
        manufacturer: formData.brand?.trim() || undefined,
        purchaseDate: formData.purchaseDate || undefined,
        warrantyExpiry: formData.warrantyUntil || undefined,
        status: formData.status as "active" | "inactive" | "maintenance" | "broken" | "disposed" | "reserved",
        imageUrl: formData.imageUrl?.trim() || undefined,
      });
      toast({
        title: "Equipamento cadastrado",
        description: `${formData.name} foi cadastrado com sucesso.`,
      });
      resetForm();
      if (initialView === "new") {
        onOpenChange(false);
      } else {
        setViewMode("list");
        fetchEquipments();
      }
    } catch (e) {
      toast({
        title: "Erro ao cadastrar",
        description: (e as Error)?.message ?? "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.propertyId !== "";
      case 2:
        return formData.category !== "";
      case 3:
        return formData.name !== "" && formData.code !== "";
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const statusLabels: Record<string, string> = {
    active: "Ativo",
    inactive: "Inativo",
    maintenance: "Manutenção",
    retired: "Baixado",
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col overflow-hidden bg-background border-border p-0 z-[100]">
        {viewMode === "list" ? (
          <>
            <DialogHeader className="p-6 pb-4 border-b border-border flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-foreground">Equipamentos</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">Lista de equipamentos cadastrados</p>
                  </div>
                </div>
                <Button onClick={() => setViewMode("new")} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Equipamento
                </Button>
              </div>
            </DialogHeader>
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6">
                {loadingList ? (
                  <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Carregando equipamentos...
                  </div>
                ) : equipments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Wrench className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">Nenhum equipamento cadastrado</p>
                    <p className="text-sm text-muted-foreground mt-1 mb-6">Cadastre o primeiro equipamento para começar</p>
                    <Button onClick={() => setViewMode("new")} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Novo Equipamento
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {equipments.map((eq) => (
                      <div
                        key={eq.id}
                        className="rounded-xl border border-border bg-card overflow-hidden hover:border-orange-500/50 transition-colors"
                      >
                        <div className="h-32 bg-muted relative">
                          {eq.imageUrl ? (
                            <img src={eq.imageUrl} alt={eq.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                          )}
                          <Badge
                            variant={eq.status === "active" ? "default" : "secondary"}
                            className="absolute top-2 right-2 text-xs"
                          >
                            {statusLabels[eq.status ?? "active"] ?? eq.status}
                          </Badge>
                        </div>
                        <div className="p-3">
                          <p className="font-semibold text-foreground truncate">{eq.name}</p>
                          {eq.category?.name && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{eq.category.name}</p>
                          )}
                          {eq.location && (
                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              {eq.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <>
        {/* Progress Bar */}
        <div className="h-1.5 bg-muted w-full flex-shrink-0">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-64 bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-background border-r border-border flex-shrink-0 flex flex-col">
            <div className="p-6 border-b border-border">
              <Button
                variant="ghost"
                size="sm"
                className="mb-3 -ml-2 gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => setViewMode("list")}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar à lista
              </Button>
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-4">
                <Wrench className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Novo Equipamento</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Cadastre um novo ativo
              </p>
            </div>

            {/* Steps */}
            <nav className="flex-1 p-4">
              <ul className="space-y-1">
                {steps.map((s) => {
                  const Icon = s.icon;
                  const isActive = step === s.id;
                  const isCompleted = step > s.id;

                  return (
                    <li key={s.id}>
                      <button
                        onClick={() => isCompleted && setStep(s.id)}
                        disabled={!isCompleted && !isActive}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                          isActive
                            ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-foreground"
                            : isCompleted
                            ? "text-foreground hover:bg-muted/50 cursor-pointer"
                            : "text-muted-foreground cursor-not-allowed"
                        }`}
                      >
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                            : isCompleted
                            ? "bg-emerald-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${isActive ? "text-foreground" : ""}`}>
                            {s.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Etapa {s.id} de {steps.length}
                          </p>
                        </div>
                        {isActive && <ChevronRight className="h-4 w-4 text-orange-500" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Preview Card */}
            {(formData.name || imagePreview) && (
              <div className="p-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Preview</p>
                <div className="rounded-lg border border-border overflow-hidden bg-card">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-24 object-cover" />
                  ) : selectedCategory && (
                    <div className={`w-full h-24 bg-gradient-to-br ${selectedCategory.color} opacity-20 flex items-center justify-center`}>
                      <selectedCategory.icon className="h-10 w-10 text-foreground/50" />
                    </div>
                  )}
                  <div className="p-3">
                    <Badge variant="outline" className="text-xs mb-1">{formData.code || "EQP-000"}</Badge>
                    <p className="text-sm font-medium text-foreground truncate">
                      {formData.name || "Nome do Equipamento"}
                    </p>
                    {formData.brand && (
                      <p className="text-xs text-muted-foreground">{formData.brand}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0">
            <DialogHeader className="p-6 pb-4 border-b border-border flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold text-foreground">
                    {steps[step - 1].title}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {step === 1 && "Selecione a propriedade do equipamento"}
                    {step === 2 && "Escolha a categoria do equipamento"}
                    {step === 3 && "Preencha as informações do equipamento"}
                    {step === 4 && "Defina a localização do equipamento"}
                    {step === 5 && "Configure a manutenção preventiva"}
                  </p>
                </div>
                <Badge variant="secondary" className="text-sm">
                  Etapa {step} de {steps.length}
                </Badge>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {/* Step 1: Property Selection */}
                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading && (
                      <div className="col-span-full flex items-center justify-center py-12 text-muted-foreground">
                        Carregando propriedades...
                      </div>
                    )}
                    {!loading && properties.map((property) => (
                      <button
                        key={property.id}
                        onClick={() => setFormData(prev => ({ ...prev, propertyId: property.id }))}
                        className={`rounded-xl border-2 overflow-hidden transition-all text-left ${
                          formData.propertyId === property.id
                            ? "border-orange-500 ring-2 ring-orange-500/20"
                            : "border-border hover:border-orange-500/50"
                        }`}
                      >
                        <div className="h-32 overflow-hidden">
                          <img 
                            src={property.image} 
                            alt={property.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2">
                            <Building2 className={`h-4 w-4 ${formData.propertyId === property.id ? "text-orange-500" : "text-muted-foreground"}`} />
                            <p className="font-semibold text-foreground">{property.name}</p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{property.address}</p>
                        </div>
                      </button>
                    ))}
                    {!loading && properties.length === 0 && (
                      <div className="col-span-full py-8 text-center text-muted-foreground text-sm">
                        Nenhuma propriedade encontrada.
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Category Selection */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {allCategories.map((category) => {
                        const Icon = category.icon;
                        const isSelected = formData.category === category.id;
                        const handleDeleteCategory = async (e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (!window.confirm(`Remover a categoria "${category.label}"? Equipamentos que a usam podem ficar sem categoria.`)) return;
                          try {
                            const res = await api.deleteEquipmentCategory(Number(category.id));
                            if ((res as { success?: boolean }).success !== false) {
                              setCategories(prev => prev.filter(c => c.id !== category.id));
                              if (isSelected) setFormData(prev => ({ ...prev, category: "" }));
                              toast({ title: "Categoria removida", description: `"${category.label}" foi removida.` });
                            } else {
                              toast({ title: "Erro ao remover", description: (res as { error?: { message?: string } }).error?.message ?? "Tente novamente.", variant: "destructive" });
                            }
                          } catch (e) {
                            toast({ title: "Erro ao remover categoria", description: (e as Error)?.message ?? "Tente novamente.", variant: "destructive" });
                          }
                        };
                        return (
                          <div
                            key={category.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                            onKeyDown={(e) => e.key === "Enter" && setFormData(prev => ({ ...prev, category: category.id }))}
                            className={`relative p-4 rounded-xl border-2 transition-all text-center cursor-pointer ${
                              isSelected
                                ? "border-orange-500 bg-orange-500/5"
                                : "border-border hover:border-orange-500/50"
                            }`}
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={handleDeleteCategory}
                              title="Remover categoria"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className={`h-12 w-12 mx-auto rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-3`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <p className="font-medium text-foreground text-sm">{category.label}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{category.description}</p>
                          </div>
                        );
                      })}

                      {/* Add New Category Button */}
                      <button
                        onClick={() => setCategoryModalOpen(true)}
                        className="p-4 rounded-xl border-2 border-dashed border-border hover:border-orange-500/50 transition-all text-center group"
                      >
                        <div className="h-12 w-12 mx-auto rounded-xl bg-muted group-hover:bg-orange-500/10 flex items-center justify-center mb-3 transition-colors">
                          <Plus className="h-6 w-6 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                        </div>
                        <p className="font-medium text-muted-foreground group-hover:text-foreground text-sm transition-colors">Nova Categoria</p>
                        <p className="text-xs text-muted-foreground mt-1">Criar personalizada</p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Equipment Info */}
                {step === 3 && (
                  <div className="space-y-6">
                    {/* Image Upload */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-orange-500" />
                        Foto do Equipamento
                      </Label>
                      <div className="flex items-start gap-4">
                        {imagePreview ? (
                          <div className="relative">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="h-32 w-48 object-cover rounded-lg border border-border"
                            />
                            <button
                              type="button"
                              onClick={clearImage}
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="h-32 w-48 rounded-lg border-2 border-dashed border-border hover:border-orange-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors disabled:opacity-50 disabled:pointer-events-none">
                            {imageUploading ? (
                              <span className="text-sm text-muted-foreground">Enviando...</span>
                            ) : (
                              <>
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-sm text-muted-foreground">Upload imagem (Storage)</span>
                              </>
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={imageUploading} />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-500/5 border border-orange-200 dark:border-orange-500/20">
                      <Label className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Info className="h-5 w-5 text-orange-500" />
                        Identificação
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-orange-500" />
                            Nome do Equipamento *
                          </Label>
                          <Input
                            id="name"
                            placeholder="Ex: Ar Condicionado Split 12000 BTU"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="code" className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-orange-500" />
                            Código Interno *
                          </Label>
                          <Input
                            id="code"
                            placeholder="Ex: EQP-001"
                            value={formData.code}
                            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Technical Info */}
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20">
                      <Label className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-blue-500" />
                        Dados Técnicos
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="brand">Marca</Label>
                          <Input
                            id="brand"
                            placeholder="Ex: Samsung"
                            value={formData.brand}
                            onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="model">Modelo</Label>
                          <Input
                            id="model"
                            placeholder="Ex: AR12TSHZ"
                            value={formData.model}
                            onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="serialNumber">Número de Série</Label>
                          <Input
                            id="serialNumber"
                            placeholder="Ex: SAM2024001234"
                            value={formData.serialNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Purchase Info */}
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20">
                      <Label className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                        Aquisição e Garantia
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="purchaseDate">Data da Compra</Label>
                          <Input
                            id="purchaseDate"
                            type="date"
                            value={formData.purchaseDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="warrantyUntil">Garantia até</Label>
                          <Input
                            id="warrantyUntil"
                            type="date"
                            value={formData.warrantyUntil}
                            onChange={(e) => setFormData(prev => ({ ...prev, warrantyUntil: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="purchaseValue">Valor (R$)</Label>
                          <Input
                            id="purchaseValue"
                            placeholder="0,00"
                            value={formData.purchaseValue}
                            onChange={(e) => setFormData(prev => ({ ...prev, purchaseValue: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="invoiceNumber">Nº Nota Fiscal</Label>
                          <Input
                            id="invoiceNumber"
                            placeholder="Ex: 123456"
                            value={formData.invoiceNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="supplier">Fornecedor</Label>
                          <Input
                            id="supplier"
                            placeholder="Nome do fornecedor"
                            value={formData.supplier}
                            onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Location */}
                {step === 4 && (
                  <div className="space-y-6">
                    {selectedProperty && (
                      <div className="p-4 rounded-xl bg-muted/30 border border-border flex items-center gap-4">
                        <img 
                          src={selectedProperty.image} 
                          alt={selectedProperty.name}
                          className="h-16 w-24 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-semibold text-foreground">{selectedProperty.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedProperty.address}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-orange-500" />
                        Selecione o Local
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {locations.map((location) => (
                          <button
                            key={location.id}
                            onClick={() => setFormData(prev => ({ ...prev, locationId: location.id }))}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              formData.locationId === location.id
                                ? "border-orange-500 bg-orange-500/5"
                                : "border-border hover:border-orange-500/50"
                            }`}
                          >
                            <Badge variant="outline" className="mb-2 text-xs">{location.type}</Badge>
                            <p className="font-medium text-foreground">{location.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="locationDetail">Detalhes da Localização (opcional)</Label>
                      <Input
                        id="locationDetail"
                        placeholder="Ex: Ao lado da janela, parte superior do armário"
                        value={formData.locationDetail}
                        onChange={(e) => setFormData(prev => ({ ...prev, locationDetail: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {/* Step 5: Maintenance */}
                {step === 5 && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-500/5 border border-violet-200 dark:border-violet-500/20">
                      <Label className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Calendar className="h-5 w-5 text-violet-500" />
                        Manutenção Preventiva
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="maintenanceFrequency">Frequência</Label>
                          <Select 
                            value={formData.maintenanceFrequency} 
                            onValueChange={(v) => setFormData(prev => ({ ...prev, maintenanceFrequency: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Mensal</SelectItem>
                              <SelectItem value="quarterly">Trimestral</SelectItem>
                              <SelectItem value="semiannual">Semestral</SelectItem>
                              <SelectItem value="annual">Anual</SelectItem>
                              <SelectItem value="none">Não aplicável</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastMaintenance">Última Manutenção</Label>
                          <Input
                            id="lastMaintenance"
                            type="date"
                            value={formData.lastMaintenance}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastMaintenance: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nextMaintenance">Próxima Manutenção</Label>
                          <Input
                            id="nextMaintenance"
                            type="date"
                            value={formData.nextMaintenance}
                            onChange={(e) => setFormData(prev => ({ ...prev, nextMaintenance: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
                      <Label className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        Status e Observações
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="status">Status do Equipamento</Label>
                          <Select 
                            value={formData.status} 
                            onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="maintenance">Em Manutenção</SelectItem>
                              <SelectItem value="inactive">Inativo</SelectItem>
                              <SelectItem value="broken">Defeituoso</SelectItem>
                              <SelectItem value="disposed">Baixado</SelectItem>
                              <SelectItem value="reserved">Reservado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="responsibleTeam">Equipe Responsável</Label>
                          <Select 
                            value={formData.responsibleTeam} 
                            onValueChange={(v) => setFormData(prev => ({ ...prev, responsibleTeam: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="maintenance">Manutenção</SelectItem>
                              <SelectItem value="housekeeping">Governança</SelectItem>
                              <SelectItem value="it">TI</SelectItem>
                              <SelectItem value="external">Terceirizado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                          id="notes"
                          placeholder="Anotações sobre o equipamento, cuidados especiais, etc."
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-orange-500" />
                        Resumo do Cadastro
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Propriedade</p>
                          <p className="font-medium text-foreground">{selectedProperty?.name || "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Categoria</p>
                          <p className="font-medium text-foreground">{selectedCategory?.label || "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Equipamento</p>
                          <p className="font-medium text-foreground">{formData.name || "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Código</p>
                          <p className="font-medium text-foreground font-mono">{formData.code || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-6 border-t border-border flex justify-between flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => step > 1 ? setStep(step - 1) : setViewMode("list")}
              >
                {step === 1 ? "Voltar à lista" : "Voltar"}
              </Button>
              <Button
                onClick={() => step < steps.length ? setStep(step + 1) : handleSubmit()}
                disabled={!canProceed() || saving}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
              >
                {step === steps.length ? (
                  saving ? (
                    "Salvando..."
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Cadastrar Equipamento
                    </>
                  )
                ) : (
                  <>
                    Continuar
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
          </>
        )}
      </DialogContent>
    </Dialog>

    {/* Category Creation Modal */}
    <EquipmentCategoryModal
      open={categoryModalOpen}
      onOpenChange={setCategoryModalOpen}
      onCategoryCreated={handleCategoryCreated}
    />
  </>
  );
}