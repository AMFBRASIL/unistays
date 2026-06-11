import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Sparkles,
  Wine,
  Shirt,
  Car,
  Gift,
  Tag,
  DollarSign,
  Settings,
  Image,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  Star,
  Clock,
  Users,
  Zap,
  Percent,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

/** Dados de extra da API (tabela extras) */
export interface ExtraFormData {
  id: number;
  propertyId: number;
  code: string;
  name: string;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  pricingType: string;
  price?: number | null;
  percentage?: number | null;
  isTaxable?: boolean;
  requiresConfirmation?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  status: string;
}

interface ExtraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dados para edição; se não informado, modo criação */
  initialData?: ExtraFormData | null;
  /** Chamado após criar/atualizar com sucesso */
  onSuccess?: () => void;
  /** Compatibilidade: objeto extra antigo */
  extra?: {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    status: string;
    propertyId?: string;
  };
}

const steps = [
  { id: 1, title: "Propriedade", icon: Tag },
  { id: 2, title: "Categoria", icon: Sparkles },
  { id: 3, title: "Informações", icon: Package },
  { id: 4, title: "Preço", icon: DollarSign },
  { id: 5, title: "Configurações", icon: Settings },
];

/** Categorias da tabela extras (amenities, services, experiences, transport) */
const categoryOptions = [
  { value: "experiences", label: "Experiência", icon: Sparkles, color: "from-violet-500 to-purple-600", bgColor: "bg-violet-50", borderColor: "border-violet-300", description: "Momentos especiais e experiências únicas", image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400" },
  { value: "amenities", label: "Amenidade", icon: Gift, color: "from-pink-500 to-rose-600", bgColor: "bg-pink-50", borderColor: "border-pink-300", description: "Itens de conforto e bem-estar", image: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400" },
  { value: "services", label: "Serviço", icon: Shirt, color: "from-blue-500 to-cyan-600", bgColor: "bg-blue-50", borderColor: "border-blue-300", description: "Serviços adicionais sob demanda", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400" },
  { value: "transport", label: "Transporte", icon: Car, color: "from-emerald-500 to-teal-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-300", description: "Transfers e mobilidade", image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400" },
];

type PricingTypeValue = "fixed" | "per_day" | "per_person" | "percentage";
/** API usa fixed, per_day, per_person, percentage */
const pricingTypes: { value: PricingTypeValue; label: string; description: string; icon: React.ElementType }[] = [
  { value: "fixed", label: "Preço Fixo", description: "Valor único por solicitação", icon: DollarSign },
  { value: "per_day", label: "Por Noite", description: "Cobrado por noite de estadia", icon: Clock },
  { value: "per_person", label: "Por Pessoa", description: "Cobrado por hóspede", icon: Users },
  { value: "percentage", label: "Percentual", description: "Percentual sobre tarifa", icon: Percent },
];

const defaultFormState = {
  propertyId: "" as string,
  code: "",
  name: "",
  category: "",
  description: "",
  price: 0,
  percentage: 0,
  pricingType: "fixed" as PricingTypeValue,
  status: true,
  isTaxable: true,
  requiresConfirmation: false,
  popular: false,
  featured: false,
  availableBookingEngine: true,
  availablePOS: true,
  availableReception: true,
  minAdvanceHours: 0,
  maxQuantity: 10,
  image: "",
};

export function ExtraModal({ open, onOpenChange, initialData, onSuccess, extra: legacyExtra }: ExtraModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(defaultFormState);
  const [properties, setProperties] = useState<{ id: number; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editingExtra = initialData ?? null;
  const isEditing = !!editingExtra;

  useEffect(() => {
    if (!open) return;
    api.getProperties().then((res) => {
      const data = res.data as { properties?: { id: number; name: string }[] };
      setProperties(Array.isArray(data?.properties) ? data.properties : []);
    }).catch(() => setProperties([]));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (editingExtra) {
      setFormData({
        propertyId: String(editingExtra.propertyId),
        code: editingExtra.code ?? "",
        name: editingExtra.name ?? "",
        category: editingExtra.category ?? "",
        description: editingExtra.description ?? "",
        price: editingExtra.price ?? 0,
        percentage: editingExtra.percentage ?? 0,
        pricingType: (editingExtra.pricingType ?? "fixed") as "fixed" | "per_day" | "per_person" | "percentage",
        status: (editingExtra.status ?? "active") === "active",
        isTaxable: editingExtra.isTaxable !== false,
        requiresConfirmation: editingExtra.requiresConfirmation === true,
        popular: editingExtra.isPopular ?? false,
        featured: editingExtra.isFeatured ?? false,
        availableBookingEngine: true,
        availablePOS: true,
        availableReception: true,
        minAdvanceHours: 0,
        maxQuantity: 10,
        image: editingExtra.imageUrl ?? "",
      });
    } else if (legacyExtra) {
      setFormData({
        ...defaultFormState,
        propertyId: legacyExtra.propertyId ?? "",
        name: legacyExtra.name ?? "",
        category: legacyExtra.category ?? "",
        description: legacyExtra.description ?? "",
        price: legacyExtra.price ?? 0,
        status: legacyExtra.status === "active",
      });
    } else {
      setFormData(defaultFormState);
    }
    setCurrentStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync when open or which extra we edit
  }, [open, editingExtra?.id, legacyExtra?.id]);

  const progress = (currentStep / steps.length) * 100;
  const selectedProperty = properties.find((p) => String(p.id) === formData.propertyId);

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    const propertyId = parseInt(formData.propertyId, 10);
    if (!formData.propertyId || isNaN(propertyId)) {
      toast.error("Selecione uma propriedade.");
      return;
    }
    if (!formData.code?.trim()) {
      toast.error("Informe o código do extra.");
      return;
    }
    if (!formData.name?.trim()) {
      toast.error("Informe o nome do extra.");
      return;
    }
    if (!formData.category) {
      toast.error("Selecione a categoria.");
      return;
    }
    if (formData.pricingType === "percentage") {
      if (formData.percentage == null || formData.percentage <= 0) {
        toast.error("Informe o percentual.");
        return;
      }
    } else if (!formData.price || formData.price <= 0) {
      toast.error("Informe o preço.");
      return;
    }
    const payload = {
      propertyId,
      code: formData.code.trim(),
      name: formData.name.trim(),
      category: formData.category as "amenities" | "services" | "experiences" | "transport",
      description: formData.description?.trim() || null,
      imageUrl: formData.image?.trim() || null,
      pricingType: formData.pricingType as "fixed" | "per_day" | "per_person" | "percentage",
      price: formData.pricingType === "percentage" ? null : formData.price,
      percentage: formData.pricingType === "percentage" ? formData.percentage : null,
      isTaxable: formData.isTaxable,
      requiresConfirmation: formData.requiresConfirmation,
      isPopular: formData.popular,
      isFeatured: formData.featured,
      status: formData.status ? ("active" as const) : ("inactive" as const),
    };
    setSaving(true);
    try {
      if (editingExtra) {
        await api.updateExtra(editingExtra.id, payload);
        toast.success("Extra atualizado.");
      } else {
        await api.createExtra(payload);
        toast.success("Extra criado.");
      }
      onSuccess?.();
      onOpenChange(false);
      setCurrentStep(1);
    } catch (e) {
      toast.error(editingExtra ? "Erro ao atualizar extra." : "Erro ao criar extra.");
    } finally {
      setSaving(false);
    }
  };

  const selectedCategory = categoryOptions.find((c) => c.value === formData.category);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  /** Máscara R$: apenas dígitos → valor em centavos → formata pt-BR (ex: 123456 → "1.234,56") */
  const formatCurrencyBRL = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    const cents = parseInt(numbers, 10);
    return (cents / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  /** Converte string formatada pt-BR (ex: "1.234,56") em número */
  const parseCurrencyToNumber = (value: string): number => {
    if (!value) return 0;
    const normalized = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  };
  /** Valor numérico para exibição no input (R$ 0,00) */
  const formatPriceDisplay = (n: number): string =>
    (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 5MB");
      return;
    }
    try {
      setUploadingImage(true);
      const res = await api.uploadImage(file, "extras");
      if (res.success && res.data?.fullUrl) {
        setFormData((prev) => ({ ...prev, image: (res.data as { fullUrl: string }).fullUrl }));
        toast.success("Imagem enviada");
      } else {
        toast.error("Falha ao enviar imagem");
      }
    } catch {
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Selecione a Propriedade</h2>
              <p className="text-muted-foreground mt-1">
                Escolha a propriedade onde este extra estará disponível
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {properties.map((property) => {
                const isSelected = formData.propertyId === String(property.id);
                const colors = ["from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-violet-500 to-purple-600", "from-amber-500 to-orange-600"];
                const color = colors[properties.indexOf(property) % colors.length];
                return (
                  <button
                    key={property.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, propertyId: String(property.id) })}
                    className={`relative overflow-hidden rounded-xl border-2 transition-all text-left group ${
                      isSelected ? "border-primary ring-2 ring-offset-2 ring-primary/50" : "border-border hover:border-primary/50 hover:shadow-md"
                    }`}
                  >
                    <div className={`h-28 relative overflow-hidden bg-gradient-to-br ${color}`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white flex items-center justify-center shadow-lg">
                          <Check className="h-4 w-4 text-emerald-600" />
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 right-2">
                        <h4 className="font-bold text-white text-lg drop-shadow-lg">{property.name}</h4>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Categoria do Extra</h2>
              <p className="text-muted-foreground mt-1">
                Selecione a categoria que melhor representa este serviço
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {categoryOptions.map((category) => {
                const CategoryIcon = category.icon;
                const isSelected = formData.category === category.value;

                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: category.value })}
                    className={`relative overflow-hidden rounded-xl border-2 transition-all text-left group ${
                      isSelected ? `${category.borderColor} ${category.bgColor} ring-2 ring-offset-2 ring-primary/50` : "border-border hover:border-primary/50 hover:shadow-md"
                    }`}
                  >
                    {/* Image Background */}
                    <div className="h-24 relative overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.label}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Category Icon Badge */}
                      <div className={`absolute top-2 left-2 p-2 rounded-lg bg-gradient-to-r ${category.color} shadow-lg`}>
                        <CategoryIcon className="h-4 w-4 text-white" />
                      </div>

                      {/* Selected Check */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white flex items-center justify-center shadow-lg">
                          <Check className="h-4 w-4 text-emerald-600" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <h4 className="font-semibold text-foreground">{category.label}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {category.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Informações do Extra</h2>
              <p className="text-muted-foreground mt-1">
                Preencha os dados básicos do serviço adicional
              </p>
            </div>

            <div className="space-y-4">
              {/* Image Upload (StorageService via api.uploadImage) */}
              <div>
                <Label className="text-sm font-medium">Imagem do Extra</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                  className="mt-2 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {formData.image ? (
                    <div className="relative inline-block">
                      <img
                        src={formData.image}
                        alt="Preview do extra"
                        className="max-h-40 w-auto rounded-lg object-cover mx-auto border border-border"
                      />
                      <p className="text-xs text-muted-foreground mt-2">Clique para trocar a imagem</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 right-1 h-8 w-8 p-0 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData((prev) => ({ ...prev, image: "" }));
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ) : uploadingImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center animate-pulse">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Enviando...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Clique para enviar ou arraste a imagem
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, WEBP até 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Code */}
              <div>
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ex: ROMANT, TRANSF"
                  className="mt-1.5 bg-background border-border"
                />
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name">Nome do Extra *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Decoração Romântica"
                  className="mt-1.5 bg-background border-border"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o que está incluso neste extra..."
                  className="mt-1.5 bg-background border-border min-h-[100px]"
                />
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.popular
                    ? "border-amber-400 bg-amber-50"
                    : "border-border hover:border-amber-300"
                }`}
                  onClick={() => setFormData({ ...formData, popular: !formData.popular })}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      formData.popular ? "bg-amber-500" : "bg-muted"
                    }`}>
                      <Star className={`h-5 w-5 ${formData.popular ? "text-white" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Popular</p>
                      <p className="text-xs text-muted-foreground">Destaque no motor</p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.featured
                    ? "border-violet-400 bg-violet-50"
                    : "border-border hover:border-violet-300"
                }`}
                  onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      formData.featured ? "bg-violet-500" : "bg-muted"
                    }`}>
                      <Sparkles className={`h-5 w-5 ${formData.featured ? "text-white" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Destaque</p>
                      <p className="text-xs text-muted-foreground">Exibir em primeiro</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Preço e Cobrança</h2>
              <p className="text-muted-foreground mt-1">
                Defina o valor e a forma de cobrança do extra
              </p>
            </div>

            <div className="space-y-5">
              {/* Pricing Type */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Tipo de Cobrança</Label>
                <div className="grid grid-cols-2 gap-3">
                  {pricingTypes.map((type) => {
                    const TypeIcon = type.icon;
                    const isSelected = formData.pricingType === type.value;

                    return (
                      <button
                        key={type.value}
                        onClick={() => setFormData({ ...formData, pricingType: type.value })}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}>
                            <TypeIcon className={`h-5 w-5 ${!isSelected && "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{type.label}</p>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price / Percentage Input */}
              {formData.pricingType === "percentage" ? (
                <div className="p-5 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200">
                  <Label htmlFor="percentage" className="text-sm font-medium flex items-center gap-2">
                    <Percent className="h-4 w-4 text-violet-600" />
                    Percentual (%)
                  </Label>
                  <div className="mt-2 relative">
                    <Input
                      id="percentage"
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={formData.percentage || ""}
                      onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                      className="pl-10 bg-background border-violet-200 text-lg font-bold"
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Percentual sobre a tarifa base</p>
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                  <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    Valor (R$)
                  </Label>
                  <div className="mt-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
                    <Input
                      id="price"
                      type="text"
                      inputMode="decimal"
                      value={formatPriceDisplay(formData.price ?? 0)}
                      onChange={(e) => {
                        const masked = formatCurrencyBRL(e.target.value);
                        setFormData({ ...formData, price: parseCurrencyToNumber(masked) });
                      }}
                      className="pl-10 bg-background border-emerald-200 text-lg font-bold"
                      placeholder="0,00"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formData.pricingType === "fixed" && "Valor único cobrado por solicitação"}
                    {formData.pricingType === "per_day" && "Valor cobrado por cada noite de estadia"}
                    {formData.pricingType === "per_person" && "Valor cobrado por cada hóspede"}
                  </p>
                </div>
              )}

              {/* Quantity Limit */}
              <div>
                <Label htmlFor="maxQuantity">Quantidade Máxima por Reserva</Label>
                <Select
                  value={formData.maxQuantity.toString()}
                  onValueChange={(value) => setFormData({ ...formData, maxQuantity: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 5, 10, 20, 50, 100].map((qty) => (
                      <SelectItem key={qty} value={qty.toString()}>
                        {qty} {qty === 1 ? "unidade" : "unidades"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Configurações</h2>
              <p className="text-muted-foreground mt-1">
                Defina onde e como o extra estará disponível
              </p>
            </div>

            <div className="space-y-4">
              {/* Status */}
              <div className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${formData.status ? "bg-emerald-500" : "bg-muted"}`}>
                      <Package className={`h-5 w-5 ${formData.status ? "text-white" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Status do Extra</p>
                      <p className="text-sm text-muted-foreground">
                        {formData.status ? "Disponível para venda" : "Indisponível para venda"}
                      </p>
                    </div>
                  </div>
                  <Switch checked={formData.status} onCheckedChange={(checked) => setFormData({ ...formData, status: checked })} />
                </div>
              </div>

              {/* Tributável */}
              <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Tributável</p>
                  <p className="text-sm text-muted-foreground">Incluir impostos sobre o valor</p>
                </div>
                <Switch checked={formData.isTaxable} onCheckedChange={(checked) => setFormData({ ...formData, isTaxable: checked })} />
              </div>

              {/* Requer confirmação */}
              <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Requer confirmação</p>
                  <p className="text-sm text-muted-foreground">Serviço precisa de confirmação antes de cobrar</p>
                </div>
                <Switch checked={formData.requiresConfirmation} onCheckedChange={(checked) => setFormData({ ...formData, requiresConfirmation: checked })} />
              </div>

              {/* Availability Channels */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Canais de Disponibilidade</Label>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Image className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Motor de Reservas</p>
                        <p className="text-xs text-muted-foreground">Website e booking online</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.availableBookingEngine}
                      onCheckedChange={(checked) => setFormData({ ...formData, availableBookingEngine: checked })}
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-violet-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">PDV / Ponto de Venda</p>
                        <p className="text-xs text-muted-foreground">Vendas diretas no balcão</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.availablePOS}
                      onCheckedChange={(checked) => setFormData({ ...formData, availablePOS: checked })}
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Recepção</p>
                        <p className="text-xs text-muted-foreground">Venda durante check-in/out</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.availableReception}
                      onCheckedChange={(checked) => setFormData({ ...formData, availableReception: checked })}
                    />
                  </div>
                </div>
              </div>

              {/* Advance Time */}
              <div>
                <Label htmlFor="minAdvanceHours">Antecedência Mínima para Solicitar</Label>
                <Select
                  value={formData.minAdvanceHours.toString()}
                  onValueChange={(value) => setFormData({ ...formData, minAdvanceHours: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sem antecedência</SelectItem>
                    <SelectItem value="1">1 hora</SelectItem>
                    <SelectItem value="2">2 horas</SelectItem>
                    <SelectItem value="4">4 horas</SelectItem>
                    <SelectItem value="12">12 horas</SelectItem>
                    <SelectItem value="24">24 horas</SelectItem>
                    <SelectItem value="48">48 horas</SelectItem>
                    <SelectItem value="72">72 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 overflow-hidden bg-background border-border">
        <div className="flex h-full">
          {/* Left Sidebar */}
          <div className="w-72 bg-gradient-to-b from-indigo-50 to-violet-50 border-r border-border flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">
                    {isEditing || legacyExtra ? "Editar Extra" : "Novo Extra"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Serviço adicional
                  </p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium text-indigo-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-indigo-100" />
            </div>

            {/* Steps */}
            <div className="flex-1 px-4 py-2">
              <nav className="space-y-1">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(step.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                        isActive
                          ? "bg-white shadow-md border border-indigo-200"
                          : isCompleted
                          ? "bg-indigo-100/50 hover:bg-indigo-100"
                          : "hover:bg-white/50"
                      }`}
                    >
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center transition-all ${
                          isActive
                            ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg"
                            : isCompleted
                            ? "bg-emerald-500 text-white"
                            : "bg-white border border-border text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium truncate ${
                            isActive
                              ? "text-foreground"
                              : isCompleted
                              ? "text-emerald-700"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Etapa {step.id} de {steps.length}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Preview Card */}
            {(selectedProperty || selectedCategory) && (
              <div className="p-4 mx-4 mb-4 rounded-xl bg-white border border-indigo-200 shadow-sm">
                {selectedProperty && (
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 flex items-center justify-center">
                      <Package className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{selectedProperty.name}</p>
                    </div>
                  </div>
                )}
                {selectedCategory && (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`h-10 w-10 rounded-lg bg-gradient-to-r ${selectedCategory.color} flex items-center justify-center`}>
                        <selectedCategory.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{formData.name || "Nome do Extra"}</p>
                        <Badge variant="secondary" className="text-xs">{selectedCategory.label}</Badge>
                      </div>
                    </div>
                    {(formData.price > 0 || (formData.pricingType === "percentage" && (formData.percentage ?? 0) > 0)) && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-lg font-bold text-foreground">
                          {formData.pricingType === "percentage" ? `${formData.percentage}%` : formatCurrency(formData.price)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formData.pricingType === "fixed" && "Preço fixo"}
                          {formData.pricingType === "per_day" && "Por noite"}
                          {formData.pricingType === "per_person" && "Por pessoa"}
                          {formData.pricingType === "percentage" && "Percentual"}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Step Indicator */}
            <div className="px-8 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                  Etapa {currentStep} de {steps.length}
                </Badge>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{steps[currentStep - 1].title}</span>
              </div>
            </div>

            {/* Content Area */}
            <ScrollArea className="flex-1">
              <div className="p-8">
                {renderStepContent()}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>

              {currentStep < steps.length ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !formData.propertyId) ||
                    (currentStep === 2 && !formData.category) ||
                    (currentStep === 3 && (!formData.name?.trim() || !formData.code?.trim()))
                  }
                  className="gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
                >
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  {saving ? "Salvando..." : (
                    <>
                      <Check className="h-4 w-4" />
                      Salvar Extra
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}