import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Sun,
  Snowflake,
  Leaf,
  Flower2,
  PartyPopper,
  Check,
  ArrowRight,
  ArrowLeft,
  Percent,
  Moon,
  Settings,
  Image,
  Sparkles,
  TrendingUp,
  TrendingDown,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";

/** Tipo da API (backend usa medium, UI usa regular) */
const apiTypeToForm = (t: string) => (t === "medium" ? "regular" : t);
const formTypeToApi = (t: string) => (t === "regular" ? "medium" : t);

/** Normaliza data da API (ISO string ou Date) para YYYY-MM-DD para input type="date" */
function toDateInputValue(value: string | Date | null | undefined): string {
  if (value == null || value === "") return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Dados de temporada para edição (lista ou getById) */
export interface SeasonFormData {
  id: number;
  propertyId: number;
  code: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  priceMultiplier: number;
  description?: string | null;
  status: string;
}

interface SeasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dados para edição; se não informado, modo criação */
  initialData?: SeasonFormData | null;
  /** Chamado após criar/atualizar com sucesso */
  onSuccess?: () => void;
  /** Compatibilidade: objeto season antigo (id string etc.) */
  season?: {
    id: string;
    name: string;
    type: string;
    startDate: string;
    endDate: string;
    priceAdjustment: number;
    minNights: number;
    status: string;
    description: string;
    image: string;
  } | null;
}

const steps = [
  { id: 1, title: "Tipo", description: "Categoria da temporada", icon: Sun },
  { id: 2, title: "Período", description: "Datas e duração", icon: Calendar },
  { id: 3, title: "Preços", description: "Ajustes tarifários", icon: Percent },
  { id: 4, title: "Detalhes", description: "Informações adicionais", icon: Settings },
];

const seasonTypes = [
  {
    id: "high",
    name: "Alta Temporada",
    description: "Períodos de alta demanda como férias e verão",
    icon: Sun,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
  },
  {
    id: "low",
    name: "Baixa Temporada",
    description: "Períodos de menor demanda com preços reduzidos",
    icon: Snowflake,
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    image: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=400",
  },
  {
    id: "holiday",
    name: "Feriado",
    description: "Datas comemorativas e feriados nacionais",
    icon: PartyPopper,
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-300",
    image: "https://images.unsplash.com/photo-1518310952931-b1de897abd40?w=400",
  },
  {
    id: "regular",
    name: "Regular",
    description: "Período padrão sem ajustes especiais",
    icon: Leaf,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
  },
  {
    id: "special",
    name: "Especial",
    description: "Eventos especiais como Dia dos Namorados",
    icon: Flower2,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-300",
    image: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=400",
  },
];

const defaultFormState = {
  name: "",
  code: "",
  type: "",
  startDate: "",
  endDate: "",
  priceAdjustment: 0,
  minNights: 1,
  maxNights: 30,
  description: "",
  image: "",
  status: true,
  applyToAllRooms: true,
  excludePromotions: false,
  stackWithRatePlans: true,
};

export function SeasonModal({ open, onOpenChange, initialData, onSuccess, season: legacySeason }: SeasonModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(defaultFormState);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [properties, setProperties] = useState<{ id: number; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const editingSeason = initialData ?? null;
  const isEditing = !!editingSeason;

  useEffect(() => {
    if (!open) return;
    api.getProperties().then((res) => {
      const data = res.data as { properties?: { id: number; name: string }[] };
      const list = Array.isArray(data?.properties) ? data.properties : [];
      setProperties(list);
      if (list.length > 0 && selectedPropertyId == null && !editingSeason) {
        setSelectedPropertyId(list[0].id);
      }
    }).catch(() => setProperties([]));
  }, [open, editingSeason, selectedPropertyId]);

  useEffect(() => {
    if (!open) return;
    if (editingSeason) {
      const mult = editingSeason.priceMultiplier ?? 1;
      const adjustment = Math.round((mult - 1) * 100);
      setFormData({
        name: editingSeason.name ?? "",
        code: editingSeason.code ?? "",
        type: apiTypeToForm(editingSeason.type ?? ""),
        startDate: toDateInputValue((editingSeason as { startDate?: string | Date }).startDate),
        endDate: toDateInputValue((editingSeason as { endDate?: string | Date }).endDate),
        priceAdjustment: adjustment,
        minNights: 1,
        maxNights: 30,
        description: editingSeason.description ?? "",
        image: "",
        status: (editingSeason.status ?? "active") === "active",
        applyToAllRooms: true,
        excludePromotions: false,
        stackWithRatePlans: true,
      });
      setSelectedPropertyId(editingSeason.propertyId ?? null);
    } else if (legacySeason) {
      setFormData({
        name: legacySeason.name ?? "",
        code: "",
        type: apiTypeToForm(legacySeason.type ?? ""),
        startDate: toDateInputValue(legacySeason.startDate),
        endDate: toDateInputValue(legacySeason.endDate),
        priceAdjustment: legacySeason.priceAdjustment ?? 0,
        minNights: legacySeason.minNights ?? 1,
        maxNights: 30,
        description: legacySeason.description ?? "",
        image: legacySeason.image ?? "",
        status: (legacySeason.status ?? "active") === "active",
        applyToAllRooms: true,
        excludePromotions: false,
        stackWithRatePlans: true,
      });
    } else {
      setFormData(defaultFormState);
    }
    setCurrentStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync when open or which season we edit
  }, [open, editingSeason?.id, legacySeason?.id]);

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSave = async () => {
    const propertyId = editingSeason ? editingSeason.propertyId : selectedPropertyId;
    if (propertyId == null) {
      toast.error("Selecione uma propriedade.");
      return;
    }
    if (!formData.code?.trim()) {
      toast.error("Informe o código da temporada.");
      return;
    }
    if (!formData.name?.trim()) {
      toast.error("Informe o nome da temporada.");
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error("Informe o período da temporada.");
      return;
    }
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) {
      toast.error("Data de término deve ser maior ou igual à data de início.");
      return;
    }
    const priceMultiplier = 1 + formData.priceAdjustment / 100;
    const payload = {
      propertyId,
      code: formData.code.trim(),
      name: formData.name.trim(),
      type: formTypeToApi(formData.type || "medium") as "high" | "medium" | "low" | "special" | "holiday",
      startDate: formData.startDate,
      endDate: formData.endDate,
      priceMultiplier,
      description: formData.description?.trim() || null,
      status: formData.status ? "active" as const : "inactive" as const,
    };
    setSaving(true);
    try {
      if (editingSeason) {
        await api.updateSeason(editingSeason.id, payload);
        toast.success("Temporada atualizada.");
      } else {
        await api.createSeason(payload);
        toast.success("Temporada criada.");
      }
      onSuccess?.();
      onOpenChange(false);
      setCurrentStep(1);
    } catch (e) {
      toast.error(editingSeason ? "Erro ao atualizar temporada." : "Erro ao criar temporada.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep(1);
  };

  const selectedType = seasonTypes.find((t) => t.id === formData.type);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.type;
      case 2:
        return !!formData.startDate && !!formData.endDate;
      case 3:
        return formData.minNights >= 1;
      case 4:
        return !!formData.name?.trim() && !!formData.code?.trim() && (isEditing || selectedPropertyId != null);
      default:
        return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0 overflow-hidden bg-background border-border">
        {/* Progress Bar */}
        <div className="h-1 bg-muted">
          <Progress value={progress} className="h-1 rounded-none" />
        </div>

        <div className="flex h-[calc(85vh-4px)]">
          {/* Left Sidebar - Steps */}
          <div className="w-72 bg-gradient-to-b from-teal-50 to-emerald-50 border-r border-border flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {isEditing ? "Editar" : "Nova"} Temporada
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Etapa {currentStep} de {steps.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Steps Navigation */}
            <div className="flex-1 p-4 space-y-2">
              {steps.map((step) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <button
                    key={step.id}
                    onClick={() => isCompleted && setCurrentStep(step.id)}
                    disabled={!isCompleted && !isActive}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                      isActive && "bg-white shadow-md border border-teal-200",
                      isCompleted && "bg-white/50 hover:bg-white/80 cursor-pointer",
                      !isActive && !isCompleted && "opacity-50"
                    )}
                  >
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center transition-all",
                        isActive && "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md",
                        isCompleted && "bg-emerald-500 text-white",
                        !isActive && !isCompleted && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "font-medium text-sm truncate",
                          isActive && "text-teal-700",
                          isCompleted && "text-emerald-700",
                          !isActive && !isCompleted && "text-muted-foreground"
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {step.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Preview Card */}
            {selectedType && (
              <div className="p-4 border-t border-border/50">
                <div className="rounded-xl overflow-hidden border border-border bg-white shadow-sm">
                  <div className="relative h-24">
                    <img
                      src={selectedType.image}
                      alt={selectedType.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className={`absolute top-2 left-2 p-1.5 rounded-lg bg-gradient-to-r ${selectedType.color}`}>
                      <selectedType.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {formData.name || "Nome da temporada"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedType.name}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Content Header */}
            <div className="px-8 py-6 border-b border-border flex-shrink-0">
              <h3 className="text-xl font-bold text-foreground">
                {steps[currentStep - 1].title}
              </h3>
              <p className="text-muted-foreground mt-1">
                {steps[currentStep - 1].description}
              </p>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
              <div className="p-8 space-y-6 pb-10">
                {/* Step 1: Type Selection */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {seasonTypes.map((type) => {
                        const TypeIcon = type.icon;
                        const isSelected = formData.type === type.id;

                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, type: type.id })}
                            className={cn(
                              "relative rounded-xl border-2 overflow-hidden transition-all text-left group",
                              isSelected
                                ? `${type.borderColor} ${type.bgColor} shadow-lg`
                                : "border-border hover:border-muted-foreground/30 bg-card hover:shadow-md"
                            )}
                          >
                            {/* Image */}
                            <div className="relative h-28 overflow-hidden">
                              <img
                                src={type.image}
                                alt={type.name}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                              
                              {/* Icon Badge */}
                              <div className={`absolute top-3 left-3 p-2 rounded-lg bg-gradient-to-r ${type.color} shadow-lg`}>
                                <TypeIcon className="h-5 w-5 text-white" />
                              </div>

                              {/* Selected Check */}
                              {isSelected && (
                                <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-white flex items-center justify-center shadow-lg">
                                  <Check className="h-4 w-4 text-emerald-600" />
                                </div>
                              )}

                              {/* Name on Image */}
                              <div className="absolute bottom-3 left-3 right-3">
                                <h4 className="font-bold text-white text-lg drop-shadow-lg">
                                  {type.name}
                                </h4>
                              </div>
                            </div>

                            {/* Description */}
                            <div className="p-4">
                              <p className="text-sm text-muted-foreground">
                                {type.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 2: Period */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    {/* Date Range */}
                    <div className="p-6 rounded-xl bg-teal-50/50 border border-teal-200">
                      <Label className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Calendar className="h-5 w-5 text-teal-600" />
                        Período da Temporada
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Data de Início</Label>
                          <Input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="bg-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Data de Término</Label>
                          <Input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="bg-background border-border"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Nights */}
                    <div className="p-6 rounded-xl bg-blue-50/50 border border-blue-200">
                      <Label className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Moon className="h-5 w-5 text-blue-600" />
                        Restrições de Estadia
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Mínimo de Noites</Label>
                          <Input
                            type="number"
                            min="1"
                            value={formData.minNights}
                            onChange={(e) => setFormData({ ...formData, minNights: parseInt(e.target.value) || 1 })}
                            className="bg-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Máximo de Noites</Label>
                          <Input
                            type="number"
                            min="1"
                            value={formData.maxNights}
                            onChange={(e) => setFormData({ ...formData, maxNights: parseInt(e.target.value) || 30 })}
                            className="bg-background border-border"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preview Image */}
                    {selectedType && (
                      <div className="relative h-48 rounded-xl overflow-hidden">
                        <img
                          src={selectedType.image}
                          alt={selectedType.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
                        <div className="absolute inset-0 p-6 flex flex-col justify-end">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${selectedType.color} w-fit mb-2`}>
                            <selectedType.icon className="h-4 w-4 text-white" />
                            <span className="text-white text-sm font-medium">{selectedType.name}</span>
                          </div>
                          <p className="text-white/80 text-sm">
                            {formData.startDate && formData.endDate
                              ? `${new Date(formData.startDate).toLocaleDateString('pt-BR')} até ${new Date(formData.endDate).toLocaleDateString('pt-BR')}`
                              : "Selecione as datas do período"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Pricing */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {/* Price Adjustment */}
                    <div className="p-6 rounded-xl bg-amber-50/50 border border-amber-200">
                      <Label className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Percent className="h-5 w-5 text-amber-600" />
                        Ajuste de Preço
                      </Label>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Input
                              type="number"
                              value={formData.priceAdjustment}
                              onChange={(e) => setFormData({ ...formData, priceAdjustment: parseInt(e.target.value) || 0 })}
                              className="bg-background border-border text-2xl font-bold h-14 text-center"
                            />
                          </div>
                          <span className="text-2xl font-bold text-muted-foreground">%</span>
                        </div>
                        <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-background border border-border">
                          {formData.priceAdjustment > 0 ? (
                            <>
                              <TrendingUp className="h-6 w-6 text-rose-600" />
                              <span className="text-lg font-semibold text-rose-600">
                                Aumento de {formData.priceAdjustment}%
                              </span>
                            </>
                          ) : formData.priceAdjustment < 0 ? (
                            <>
                              <TrendingDown className="h-6 w-6 text-emerald-600" />
                              <span className="text-lg font-semibold text-emerald-600">
                                Desconto de {Math.abs(formData.priceAdjustment)}%
                              </span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-6 w-6 text-muted-foreground" />
                              <span className="text-lg font-semibold text-muted-foreground">
                                Sem ajuste de preço
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pricing Rules */}
                    <div className="p-6 rounded-xl bg-violet-50/50 border border-violet-200">
                      <Label className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Settings className="h-5 w-5 text-violet-600" />
                        Regras de Aplicação
                      </Label>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                          <div>
                            <p className="font-medium text-foreground">Aplicar a todos os quartos</p>
                            <p className="text-sm text-muted-foreground">O ajuste será aplicado em todas as categorias</p>
                          </div>
                          <Switch
                            checked={formData.applyToAllRooms}
                            onCheckedChange={(checked) => setFormData({ ...formData, applyToAllRooms: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                          <div>
                            <p className="font-medium text-foreground">Excluir promoções ativas</p>
                            <p className="text-sm text-muted-foreground">Não acumular com outras promoções</p>
                          </div>
                          <Switch
                            checked={formData.excludePromotions}
                            onCheckedChange={(checked) => setFormData({ ...formData, excludePromotions: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                          <div>
                            <p className="font-medium text-foreground">Combinar com planos tarifários</p>
                            <p className="text-sm text-muted-foreground">Aplicar sobre tarifas de planos</p>
                          </div>
                          <Switch
                            checked={formData.stackWithRatePlans}
                            onCheckedChange={(checked) => setFormData({ ...formData, stackWithRatePlans: checked })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Details */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    {/* Property (create only) */}
                    {!isEditing && properties.length > 0 && (
                      <div className="p-6 rounded-xl bg-slate-50/50 border border-slate-200">
                        <Label className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                          Propriedade
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {properties.map((prop) => (
                            <button
                              key={prop.id}
                              type="button"
                              onClick={() => setSelectedPropertyId(prop.id)}
                              className={cn(
                                "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                                selectedPropertyId === prop.id
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background border-border hover:border-primary/50"
                              )}
                            >
                              {prop.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Name, Code and Description */}
                    <div className="p-6 rounded-xl bg-emerald-50/50 border border-emerald-200">
                      <Label className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-emerald-600" />
                        Identificação
                      </Label>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Código *</Label>
                            <Input
                              value={formData.code}
                              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                              placeholder="Ex: VERAO24, CARNAVAL"
                              className="bg-background border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Nome da Temporada *</Label>
                            <Input
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Ex: Verão 2024, Carnaval..."
                              className="bg-background border-border"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Descrição</Label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Descreva as características desta temporada..."
                            className="bg-background border-border min-h-[100px]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image URL */}
                    <div className="p-6 rounded-xl bg-cyan-50/50 border border-cyan-200">
                      <Label className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Image className="h-5 w-5 text-cyan-600" />
                        Imagem de Capa
                      </Label>
                      <div className="space-y-4">
                        <Input
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          placeholder="URL da imagem (opcional)"
                          className="bg-background border-border"
                        />
                        {(formData.image || selectedType?.image) && (
                          <div className="relative h-40 rounded-lg overflow-hidden">
                            <img
                              src={formData.image || selectedType?.image}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="p-6 rounded-xl bg-rose-50/50 border border-rose-200">
                      <Label className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                        <CheckCircle className="h-5 w-5 text-rose-600" />
                        Status
                      </Label>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                        <div>
                          <p className="font-medium text-foreground">Temporada Ativa</p>
                          <p className="text-sm text-muted-foreground">Ativar esta temporada imediatamente</p>
                        </div>
                        <Switch
                          checked={formData.status}
                          onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-border flex-shrink-0 bg-muted/30 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={currentStep === 1 ? handleClose : handleBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {currentStep === 1 ? "Cancelar" : "Voltar"}
              </Button>

              {currentStep < steps.length ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                >
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={!canProceed() || saving}
                  className="gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                >
                  {saving ? (
                    <>Salvando...</>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      {isEditing ? "Salvar Alterações" : "Criar Temporada"}
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
