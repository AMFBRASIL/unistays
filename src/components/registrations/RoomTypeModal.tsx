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
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  BedDouble,
  Users,
  Maximize,
  Image as ImageIcon,
  Wifi,
  Tv,
  AirVent,
  Coffee,
  Bath,
  Car,
  UtensilsCrossed,
  Dumbbell,
  Waves,
  Mountain,
  Check,
  Sparkles,
  Hotel,
  Building,
  Home,
  Palmtree,
  DollarSign,
  UserCheck,
  CheckCircle2,
  ListFilter,
  LayoutGrid,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const pricingModels = [
  { 
    id: "per_person", 
    icon: UserCheck, 
    label: "Por Pessoa", 
    description: "Preço calculado por hóspede (adulto/criança)",
    color: "from-blue-500 to-blue-600",
    suitable: ["hotel"]
  },
  { 
    id: "per_unit", 
    icon: DollarSign, 
    label: "Por Unidade", 
    description: "Preço fixo por apartamento (até X pessoas)",
    color: "from-emerald-500 to-emerald-600",
    suitable: ["apart", "loft", "temporada"]
  },
];

interface RoomTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const amenities = [
  { id: "wifi", icon: Wifi, label: "Wi-Fi" },
  { id: "tv", icon: Tv, label: "Smart TV" },
  { id: "ac", icon: AirVent, label: "Ar Condicionado" },
  { id: "coffee", icon: Coffee, label: "Cafeteira" },
  { id: "bath", icon: Bath, label: "Banheira" },
  { id: "parking", icon: Car, label: "Estacionamento" },
  { id: "breakfast", icon: UtensilsCrossed, label: "Café da Manhã" },
  { id: "gym", icon: Dumbbell, label: "Academia" },
  { id: "pool", icon: Waves, label: "Piscina" },
  { id: "view", icon: Mountain, label: "Vista" },
];

const propertyTypes = [
  { id: "hotel", icon: Hotel, label: "Hotel", color: "from-blue-500 to-blue-600", defaultPricing: "per_person" },
  { id: "apart", icon: Building, label: "Apart-Hotel", color: "from-violet-500 to-violet-600", defaultPricing: "per_unit" },
  { id: "loft", icon: Home, label: "Loft", color: "from-emerald-500 to-emerald-600", defaultPricing: "per_unit" },
  { id: "temporada", icon: Palmtree, label: "Temporada", color: "from-amber-500 to-amber-600", defaultPricing: "per_unit" },
];
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400";

export function RoomTypeModal({ open, onOpenChange }: RoomTypeModalProps) {
  const [step, setStep] = useState(1);
  const [properties, setProperties] = useState<{ id: number; name?: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: "" as string,
    name: "",
    code: "",
    description: "",
    propertyType: "",
    pricingModel: "" as "per_person" | "per_unit" | "",
    maxGuests: "2",
    maxAdults: "2",
    maxChildren: "1",
    basePrice: "",
    pricePerAdult: "",
    pricePerChild: "",
    extraPersonFee: "",
    size: "",
    selectedAmenities: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    if (open) {
      api.getProperties().then((res) => {
        if (res.success && res.data?.properties) {
          const list = (res.data.properties as { id: number; name?: string }[]) ?? [];
          setProperties(list);
          if (list.length > 0 && !formData.propertyId) {
            setFormData((prev) => ({ ...prev, propertyId: String(list[0].id) }));
          }
        }
      });
    }
  }, [open]);

  const toggleAmenity = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(id)
        ? prev.selectedAmenities.filter(a => a !== id)
        : [...prev.selectedAmenities, id]
    }));
  };

  const handleSubmit = async () => {
    const propertyId = parseInt(formData.propertyId, 10);
    if (!formData.propertyId || isNaN(propertyId)) {
      toast({ title: "Erro", description: "Selecione uma propriedade.", variant: "destructive" });
      return;
    }
    if (!formData.name?.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" });
      return;
    }
    if (!formData.code?.trim()) {
      toast({ title: "Erro", description: "Código é obrigatório.", variant: "destructive" });
      return;
    }
    const propertyType = formData.propertyType === "apart" ? "apart-hotel" : formData.propertyType;
    if (!propertyType || !["hotel", "apart-hotel", "loft", "temporada", "hostel", "resort"].includes(propertyType)) {
      toast({ title: "Erro", description: "Tipo de propriedade é obrigatório.", variant: "destructive" });
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await api.createRoomType({
        propertyId,
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        propertyType: propertyType as "hotel" | "apart-hotel" | "loft" | "temporada" | "hostel" | "resort",
        maxGuests: parseInt(formData.maxGuests, 10) || 2,
        maxAdults: parseInt(formData.maxAdults, 10) || 2,
        maxChildren: parseInt(formData.maxChildren, 10) || 0,
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : null,
        adultPrice: formData.pricePerAdult ? parseFloat(formData.pricePerAdult) : 0,
        childPrice: formData.pricePerChild ? parseFloat(formData.pricePerChild) : 0,
        infantPrice: 0,
        pricingStyle: (formData.pricingModel || "per_unit") as "per_unit" | "per_person",
        sizeM2: formData.size ? parseFloat(formData.size) : null,
        status: "active",
        amenityIds: [],
      });
      if (res.success) {
        toast({ title: "Tipo de Quarto Criado", description: `${formData.name} foi cadastrado com sucesso!` });
        onOpenChange(false);
        setStep(1);
        setFormData({
          propertyId: properties[0] ? String(properties[0].id) : "",
          name: "",
          code: "",
          description: "",
          propertyType: "",
          pricingModel: "",
          maxGuests: "2",
          maxAdults: "2",
          maxChildren: "1",
          basePrice: "",
          pricePerAdult: "",
          pricePerChild: "",
          extraPersonFee: "",
          size: "",
          selectedAmenities: [],
          isActive: true,
        });
      } else {
        toast({ title: "Erro", description: (res as { error?: { message?: string } }).error?.message ?? "Falha ao criar tipo de quarto.", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Falha ao criar tipo de quarto.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasStep1Data =
    !!formData.propertyType &&
    !!formData.pricingModel &&
    !!formData.name.trim() &&
    !!formData.code.trim();
  const hasStep2Data =
    !!formData.maxGuests.trim() &&
    !!formData.maxAdults.trim() &&
    !!formData.basePrice.trim();
  const hasStep3Data = formData.selectedAmenities.length > 0 || formData.isActive;
  const progressValue = step === 1 ? 33 : step === 2 ? 66 : 100;
  const steps = [
    { key: "overview", title: "Visão Geral", subtitle: "Base da categoria", done: hasStep1Data, icon: BedDouble },
    { key: "filters", title: "Capacidade e Preço", subtitle: "Regras da hospedagem", done: hasStep2Data, icon: ListFilter },
    { key: "catalog", title: "Amenidades e Status", subtitle: "Publicação final", done: hasStep3Data, icon: LayoutGrid },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] overflow-hidden bg-background border-border p-0">
        <div className="h-full min-h-0 grid md:grid-cols-[300px_1fr]">
          <aside className="hidden md:flex flex-col border-r border-border/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
            <div className="relative p-5 border-b border-white/10">
              <div
                className="absolute inset-0 opacity-25 bg-cover bg-center"
                style={{ backgroundImage: `url(${PLACEHOLDER_IMAGE})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/70 to-slate-950/80" />
              <div className="relative">
                <p className="text-xs uppercase tracking-wider text-cyan-200/90">Room Type Wizard</p>
                <h3 className="mt-1 text-lg font-semibold">Criação guiada</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Fluxo robusto com progressão por etapas.
                </p>
              </div>
            </div>

            <div className="p-5 border-b border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                <span>Progresso do fluxo</span>
                <span>{progressValue}%</span>
              </div>
              <Progress
                value={progressValue}
                className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-cyan-400 [&>div]:to-blue-500"
              />
            </div>

            <div className="p-4 space-y-2">
              {steps.map((stepItem, index) => (
                <div
                  key={stepItem.key}
                  className={`rounded-xl border px-3 py-3 transition-colors ${
                    step === index + 1
                      ? "border-cyan-400/40 bg-cyan-500/15"
                      : stepItem.done
                      ? "border-cyan-400/30 bg-cyan-500/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        stepItem.done ? "bg-cyan-400/20 text-cyan-300" : "bg-white/10 text-slate-300"
                      }`}
                    >
                      {stepItem.done ? <CheckCircle2 className="h-4 w-4" /> : <stepItem.icon className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{`${index + 1}. ${stepItem.title}`}</p>
                      <p className="text-xs text-slate-300 truncate">{stepItem.subtitle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div className="flex flex-col min-w-0 min-h-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <BedDouble className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    Novo Tipo de Quarto
                  </DialogTitle>
                  <p className="text-muted-foreground mt-1">
                    Configure uma nova categoria de acomodação
                  </p>
                </div>
              </div>
              <div className="md:hidden pt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Progresso do fluxo</span>
                  <span>{progressValue}%</span>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1 min-h-0 h-full">
              <div className="py-6 px-6 space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                {/* Property Selection */}
                {properties.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-gray-700">Propriedade *</Label>
                    <Select
                      value={formData.propertyId}
                      onValueChange={(v) => setFormData((prev) => ({ ...prev, propertyId: v }))}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecione a propriedade" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.name ?? `Propriedade ${p.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {/* Property Type Selection */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Hotel className="h-5 w-5 text-blue-600" />
                    Tipo de Propriedade
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {propertyTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          propertyType: type.id,
                          pricingModel: type.defaultPricing as "per_person" | "per_unit"
                        }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.propertyType === type.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center mx-auto mb-3`}>
                          <type.icon className="h-6 w-6 text-white" />
                        </div>
                        <p className="font-medium text-gray-800 text-center">{type.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pricing Model Selection */}
                {formData.propertyType && (
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                      Modelo de Precificação
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pricingModels.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => setFormData(prev => ({ ...prev, pricingModel: model.id as "per_person" | "per_unit" }))}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            formData.pricingModel === model.id
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-200 bg-gray-50 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${model.color} flex items-center justify-center flex-shrink-0`}>
                              <model.icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{model.label}</p>
                              <p className="text-sm text-gray-500 mt-1">{model.description}</p>
                              {model.suitable.includes(formData.propertyType) && (
                                <Badge className="mt-2 bg-emerald-100 text-emerald-700 border-0">
                                  Recomendado
                                </Badge>
                              )}
                            </div>
                            {formData.pricingModel === model.id && (
                              <Check className="h-5 w-5 text-emerald-600" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">Nome do Tipo</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Suíte Master"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-gray-700">Código</Label>
                    <Input
                      id="code"
                      placeholder="Ex: SM01"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o tipo de quarto..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-white border-gray-300 min-h-[100px]"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* Capacity */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-200">
                  <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-emerald-600" />
                    Capacidade
                  </Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxGuests" className="text-gray-700">Máximo de Hóspedes</Label>
                      <Input
                        id="maxGuests"
                        type="number"
                        value={formData.maxGuests}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxGuests: e.target.value }))}
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxAdults" className="text-gray-700">Máximo de Adultos</Label>
                      <Input
                        id="maxAdults"
                        type="number"
                        value={formData.maxAdults}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxAdults: e.target.value }))}
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxChildren" className="text-gray-700">Máximo de Crianças</Label>
                      <Input
                        id="maxChildren"
                        type="number"
                        value={formData.maxChildren}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxChildren: e.target.value }))}
                        className="bg-white border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Size */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-pink-50 border border-violet-200">
                  <Label className="flex items-center gap-2 mb-3 text-gray-800">
                    <Maximize className="h-5 w-5 text-violet-600" />
                    Tamanho (m²)
                  </Label>
                  <Input
                    type="number"
                    placeholder="Ex: 35"
                    value={formData.size}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    className="bg-white border-gray-300"
                  />
                </div>

                {/* Pricing based on model */}
                {formData.pricingModel === "per_person" ? (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                    <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                      Preços por Pessoa
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pricePerAdult" className="text-gray-700">Preço por Adulto (R$)</Label>
                        <Input
                          id="pricePerAdult"
                          placeholder="Ex: 150,00"
                          value={formData.pricePerAdult}
                          onChange={(e) => setFormData(prev => ({ ...prev, pricePerAdult: e.target.value }))}
                          className="bg-white border-gray-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pricePerChild" className="text-gray-700">Preço por Criança (R$)</Label>
                        <Input
                          id="pricePerChild"
                          placeholder="Ex: 75,00"
                          value={formData.pricePerChild}
                          onChange={(e) => setFormData(prev => ({ ...prev, pricePerChild: e.target.value }))}
                          className="bg-white border-gray-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="basePrice" className="text-gray-700">Taxa Base (R$)</Label>
                        <Input
                          id="basePrice"
                          placeholder="Ex: 50,00"
                          value={formData.basePrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                          className="bg-white border-gray-300"
                        />
                        <p className="text-xs text-gray-500">Taxa fixa por quarto/noite</p>
                      </div>
                    </div>
                  </div>
                ) : formData.pricingModel === "per_unit" ? (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
                    <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                      Preço por Unidade
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="basePrice" className="text-gray-700">Preço da Unidade (R$)</Label>
                        <Input
                          id="basePrice"
                          placeholder="Ex: 450,00"
                          value={formData.basePrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                          className="bg-white border-gray-300"
                        />
                        <p className="text-xs text-gray-500">Preço fixo para até {formData.maxGuests} hóspedes</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="extraPersonFee" className="text-gray-700">Taxa Pessoa Extra (R$)</Label>
                        <Input
                          id="extraPersonFee"
                          placeholder="Ex: 80,00"
                          value={formData.extraPersonFee}
                          onChange={(e) => setFormData(prev => ({ ...prev, extraPersonFee: e.target.value }))}
                          className="bg-white border-gray-300"
                        />
                        <p className="text-xs text-gray-500">Cobrado por hóspede adicional</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center text-gray-500">
                    Selecione um modelo de precificação no passo anterior
                  </div>
                )}

                {/* Image Upload */}
                <div className="p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer bg-gray-50">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="p-4 rounded-full bg-blue-100">
                      <ImageIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Clique para adicionar imagens</p>
                      <p className="text-sm text-gray-500">PNG, JPG até 5MB</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                {/* Amenities */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-cyan-600" />
                    Amenidades Incluídas
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {amenities.map((amenity) => (
                      <button
                        key={amenity.id}
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.selectedAmenities.includes(amenity.id)
                            ? "border-cyan-500 bg-cyan-50"
                            : "border-gray-200 bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        <amenity.icon className={`h-6 w-6 mx-auto mb-2 ${
                          formData.selectedAmenities.includes(amenity.id) ? "text-cyan-600" : "text-gray-400"
                        }`} />
                        <p className="text-xs font-medium text-center text-gray-700">{amenity.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100">
                        <Check className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Status Ativo</p>
                        <p className="text-sm text-gray-500">Este tipo estará disponível para reservas</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    Resumo do Cadastro
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-white border border-gray-200">
                      <p className="text-2xl font-bold text-gray-800">{formData.name || "-"}</p>
                      <p className="text-xs text-gray-500">Nome</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white border border-gray-200">
                      <p className="text-2xl font-bold text-gray-800">{formData.maxGuests}</p>
                      <p className="text-xs text-gray-500">Hóspedes</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white border border-gray-200">
                      <p className="text-2xl font-bold text-gray-800">{formData.selectedAmenities.length}</p>
                      <p className="text-xs text-gray-500">Amenidades</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white border border-gray-200">
                      <Badge className={formData.isActive ? "bg-emerald-500" : "bg-red-500"}>
                        {formData.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">Status</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
              </div>
            </ScrollArea>

            <div className="flex justify-between gap-3 px-6 py-4 border-t border-border flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => step > 1 ? setStep(step - 1) : onOpenChange(false)}
              >
                {step > 1 ? "Voltar" : "Cancelar"}
              </Button>
              <Button
                onClick={() => step < 3 ? setStep(step + 1) : void handleSubmit()}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                {isSubmitting && step === 3 ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {step < 3 ? "Continuar" : "Criar Tipo de Quarto"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}