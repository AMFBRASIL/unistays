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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tags,
  Building2,
  Home,
  Warehouse,
  Palmtree,
  Calendar,
  Clock,
  Sun,
  Moon,
  CalendarDays,
  CalendarRange,
  Gift,
  Percent,
  Briefcase,
  Sparkles,
  Check,
  ChevronRight,
  Utensils,
  Car,
  Wifi,
  Dumbbell,
  Heart,
  Baby,
  PartyPopper,
  Coffee,
  Wine,
  Waves,
  UtensilsCrossed,
  BedDouble,
  Plus,
  Trash2,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NewRatePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Property types for hybrid system
const propertyTypes = [
  { id: "hotel", name: "Hotel", icon: Building2, color: "from-blue-500 to-cyan-500", description: "Diárias tradicionais" },
  { id: "apart-hotel", name: "Apart-Hotel", icon: Home, color: "from-purple-500 to-pink-500", description: "Estadias flexíveis" },
  { id: "loft", name: "Loft", icon: Warehouse, color: "from-amber-500 to-orange-500", description: "Experiências únicas" },
  { id: "temporada", name: "Temporada", icon: Palmtree, color: "from-emerald-500 to-green-500", description: "Aluguel sazonal" },
];

// Stay types
const stayTypes = [
  { id: "daily", name: "Diária", icon: Sun, description: "Tarifa por noite" },
  { id: "weekly", name: "Semanal", icon: CalendarDays, description: "Mínimo 7 noites" },
  { id: "monthly", name: "Mensal", icon: CalendarRange, description: "Mínimo 30 noites" },
  { id: "longstay", name: "Long Stay", icon: Clock, description: "Contratos longos" },
];

// Plan types
const planTypes = [
  { id: "package", name: "Pacote", icon: Gift, color: "from-purple-500 to-pink-500", description: "Combo de serviços" },
  { id: "promotion", name: "Promoção", icon: Percent, color: "from-emerald-500 to-green-500", description: "Desconto especial" },
  { id: "corporate", name: "Corporativo", icon: Briefcase, color: "from-blue-500 to-cyan-500", description: "Empresas conveniadas" },
  { id: "seasonal", name: "Temporada", icon: Calendar, color: "from-amber-500 to-orange-500", description: "Datas especiais" },
];

// Room categories by property type
const roomCategories: Record<string, string[]> = {
  hotel: ["Standard", "Superior", "Luxo", "Suíte Master", "Suíte Presidencial", "Familiar"],
  "apart-hotel": ["Studio", "1 Quarto", "2 Quartos", "Penthouse"],
  loft: ["Loft Compacto", "Loft Premium", "Loft Duplex", "Loft Garden"],
  temporada: ["Casa 2 Quartos", "Casa 3 Quartos", "Casa 4 Quartos", "Villa", "Chalé"],
};

// Available inclusions
const availableInclusions = [
  { id: "breakfast", name: "Café da manhã", icon: Coffee },
  { id: "dinner", name: "Jantar", icon: UtensilsCrossed },
  { id: "fullboard", name: "Pensão completa", icon: Utensils },
  { id: "spa", name: "Spa", icon: Sparkles },
  { id: "parking", name: "Estacionamento", icon: Car },
  { id: "wifi", name: "Wi-Fi Premium", icon: Wifi },
  { id: "gym", name: "Academia", icon: Dumbbell },
  { id: "romantic", name: "Decoração Romântica", icon: Heart },
  { id: "kids", name: "Kids Club", icon: Baby },
  { id: "party", name: "Festa Especial", icon: PartyPopper },
  { id: "bar", name: "Open Bar", icon: Wine },
  { id: "pool", name: "Acesso Piscina", icon: Waves },
  { id: "latecheckout", name: "Late Checkout", icon: Clock },
  { id: "earlycheckin", name: "Early Check-in", icon: Sun },
];

export function NewRatePlanModal({ open, onOpenChange }: NewRatePlanModalProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [selectedStayTypes, setSelectedStayTypes] = useState<string[]>([]);
  const [planType, setPlanType] = useState<string>("");
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [discount, setDiscount] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [minNights, setMinNights] = useState("1");
  const [maxNights, setMaxNights] = useState("");
  const [selectedRoomCategories, setSelectedRoomCategories] = useState<string[]>([]);
  const [selectedInclusions, setSelectedInclusions] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  const togglePropertyType = (id: string) => {
    setSelectedPropertyTypes(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleStayType = (id: string) => {
    setSelectedStayTypes(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleRoomCategory = (category: string) => {
    setSelectedRoomCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleInclusion = (id: string) => {
    setSelectedInclusions(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Get available room categories based on selected property types
  const availableRoomCategories = selectedPropertyTypes.flatMap(
    pt => roomCategories[pt] || []
  ).filter((v, i, a) => a.indexOf(v) === i);

  const handleClose = () => {
    setStep(1);
    setSelectedPropertyTypes([]);
    setSelectedStayTypes([]);
    setPlanType("");
    setPlanName("");
    setPlanDescription("");
    setDiscount("");
    setValidFrom("");
    setValidTo("");
    setMinNights("1");
    setMaxNights("");
    setSelectedRoomCategories([]);
    setSelectedInclusions([]);
    setIsActive(true);
    onOpenChange(false);
  };

  const handleFinish = () => {
    // Here you would save the rate plan
    console.log({
      propertyTypes: selectedPropertyTypes,
      stayTypes: selectedStayTypes,
      planType,
      name: planName,
      description: planDescription,
      discount,
      validFrom,
      validTo,
      minNights,
      maxNights,
      roomCategories: selectedRoomCategories,
      inclusions: selectedInclusions,
      active: isActive,
    });
    setStep(5); // Success step
  };

  const selectedPlanTypeData = planTypes.find(p => p.id === planType);

  const canProceedStep1 = selectedPropertyTypes.length > 0 && selectedStayTypes.length > 0;
  const canProceedStep2 = planType !== "";
  const canProceedStep3 = planName.trim() !== "" && validFrom !== "" && validTo !== "";
  const canProceedStep4 = selectedRoomCategories.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="p-0 flex-shrink-0">
          <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 p-6">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Tags className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-white">Novo Plano de Tarifas</DialogTitle>
                <p className="text-white/80 text-sm">
                  {step === 1 && "Selecione propriedades e tipos de estadia"}
                  {step === 2 && "Escolha o tipo de plano"}
                  {step === 3 && "Configure os detalhes do plano"}
                  {step === 4 && "Selecione categorias e inclusões"}
                  {step === 5 && "Plano criado com sucesso"}
                </p>
              </div>
            </div>

            {/* Step Indicator */}
            {step < 5 && (
              <div className="flex items-center gap-2 mt-4">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                        s === step
                          ? "bg-white text-purple-600"
                          : s < step
                          ? "bg-white/30 text-white"
                          : "bg-white/10 text-white/50"
                      )}
                    >
                      {s < step ? <Check className="w-4 h-4" /> : s}
                    </div>
                    {s < 4 && (
                      <div
                        className={cn(
                          "w-8 h-0.5 mx-1",
                          s < step ? "bg-white/30" : "bg-white/10"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 220px)' }}>
          {/* Step 1: Property & Stay Types */}
          {step === 1 && (
            <div className="p-6 space-y-6">
              {/* Property Types */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Tipos de Propriedade</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione em quais tipos de propriedade este plano será aplicado
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {propertyTypes.map((property) => (
                    <div
                      key={property.id}
                      onClick={() => togglePropertyType(property.id)}
                      className={cn(
                        "relative p-4 rounded-xl border-2 cursor-pointer transition-all text-center group",
                        selectedPropertyTypes.includes(property.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {selectedPropertyTypes.includes(property.id) && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mx-auto mb-2 transition-transform group-hover:scale-110",
                          property.color
                        )}
                      >
                        <property.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-medium text-sm">{property.name}</p>
                      <p className="text-xs text-muted-foreground">{property.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Stay Types */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Tipos de Estadia</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione para quais tipos de estadia este plano será válido
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {stayTypes.map((stay) => (
                    <div
                      key={stay.id}
                      onClick={() => toggleStayType(stay.id)}
                      className={cn(
                        "relative p-4 rounded-xl border-2 cursor-pointer transition-all text-center group",
                        selectedStayTypes.includes(stay.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {selectedStayTypes.includes(stay.id) && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/10 transition-colors">
                        <stay.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <p className="font-medium text-sm">{stay.name}</p>
                      <p className="text-xs text-muted-foreground">{stay.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Plan Type */}
          {step === 2 && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Tipo de Plano</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Escolha o tipo de plano que deseja criar
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {planTypes.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setPlanType(plan.id)}
                      className={cn(
                        "relative p-6 rounded-xl border-2 cursor-pointer transition-all group",
                        planType === plan.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {planType === plan.id && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center transition-transform group-hover:scale-110",
                            plan.color
                          )}
                        >
                          <plan.icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{plan.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {plan.id === "package" && (
                              <>
                                <Badge variant="secondary">Múltiplos serviços</Badge>
                                <Badge variant="secondary">Valor agregado</Badge>
                              </>
                            )}
                            {plan.id === "promotion" && (
                              <>
                                <Badge variant="secondary">Desconto direto</Badge>
                                <Badge variant="secondary">Tempo limitado</Badge>
                              </>
                            )}
                            {plan.id === "corporate" && (
                              <>
                                <Badge variant="secondary">Empresas</Badge>
                                <Badge variant="secondary">Faturamento</Badge>
                              </>
                            )}
                            {plan.id === "seasonal" && (
                              <>
                                <Badge variant="secondary">Datas especiais</Badge>
                                <Badge variant="secondary">Alta temporada</Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Plan Details */}
          {step === 3 && (
            <div className="p-6 space-y-6">
              {/* Plan Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Tags className="w-4 h-4" />
                      Nome do Plano *
                    </Label>
                    <Input
                      placeholder="Ex: Pacote Romântico de Verão"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      placeholder="Descreva os benefícios e detalhes do plano..."
                      value={planDescription}
                      onChange={(e) => setPlanDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Desconto (%)
                    </Label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Válido de *
                      </Label>
                      <Input
                        type="date"
                        value={validFrom}
                        onChange={(e) => setValidFrom(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Válido até *
                      </Label>
                      <Input
                        type="date"
                        value={validTo}
                        onChange={(e) => setValidTo(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        Mín. Noites
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={minNights}
                        onChange={(e) => setMinNights(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        Máx. Noites
                      </Label>
                      <Input
                        type="number"
                        placeholder="Sem limite"
                        value={maxNights}
                        onChange={(e) => setMaxNights(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                    <div>
                      <p className="font-medium">Status do Plano</p>
                      <p className="text-sm text-muted-foreground">
                        {isActive ? "Ativo e disponível para reservas" : "Inativo, não aparece nas buscas"}
                      </p>
                    </div>
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Room Categories & Inclusions */}
          {step === 4 && (
            <div className="p-6 pb-10 space-y-6">
              {/* Room Categories */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Categorias de Acomodação</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione quais categorias de quartos/unidades podem usar este plano
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableRoomCategories.map((category) => (
                    <div
                      key={category}
                      onClick={() => toggleRoomCategory(category)}
                      className={cn(
                        "relative p-3 rounded-lg border-2 cursor-pointer transition-all text-center",
                        selectedRoomCategories.includes(category)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {selectedRoomCategories.includes(category) && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-primary-foreground" />
                        </div>
                      )}
                      <BedDouble className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="font-medium text-sm">{category}</p>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    setSelectedRoomCategories(
                      selectedRoomCategories.length === availableRoomCategories.length
                        ? []
                        : availableRoomCategories
                    )
                  }
                >
                  {selectedRoomCategories.length === availableRoomCategories.length
                    ? "Desmarcar Todos"
                    : "Selecionar Todos"}
                </Button>
              </div>

              <Separator />

              {/* Inclusions */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Inclusões do Plano</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione o que está incluído neste plano
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableInclusions.map((inclusion) => (
                    <div
                      key={inclusion.id}
                      onClick={() => toggleInclusion(inclusion.id)}
                      className={cn(
                        "relative p-3 rounded-lg border-2 cursor-pointer transition-all group",
                        selectedInclusions.includes(inclusion.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {selectedInclusions.includes(inclusion.id) && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-primary-foreground" />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <inclusion.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                        <p className="font-medium text-sm">{inclusion.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Plano Criado!</h2>
              <p className="text-muted-foreground mb-6">Seu novo plano de tarifas foi configurado com sucesso</p>

              <div className="bg-muted/50 rounded-xl p-6 mb-6 max-w-md mx-auto text-left">
                <div className="flex items-center gap-3 mb-4">
                  {selectedPlanTypeData && (
                    <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", selectedPlanTypeData.color)}>
                      <selectedPlanTypeData.icon className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-lg">{planName}</p>
                    <Badge variant="outline">{selectedPlanTypeData?.name}</Badge>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Protocolo</span>
                    <span className="font-mono font-bold">PLAN-{Date.now().toString().slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Propriedades</span>
                    <span className="font-medium">{selectedPropertyTypes.length} tipo(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estadias</span>
                    <span className="font-medium">{selectedStayTypes.length} tipo(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categorias</span>
                    <span className="font-medium">{selectedRoomCategories.length} selecionada(s)</span>
                  </div>
                  {discount && Number(discount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Desconto</span>
                      <span className="font-bold text-emerald-500">{discount}%</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inclusões</span>
                    <span className="font-medium">{selectedInclusions.length} item(ns)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}>
                      {isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Fechar
                </Button>
                <Button
                  className="gap-2 bg-gradient-to-r from-purple-500 to-pink-600"
                  onClick={() => {
                    setStep(1);
                    setSelectedPropertyTypes([]);
                    setSelectedStayTypes([]);
                    setPlanType("");
                    setPlanName("");
                    setPlanDescription("");
                    setDiscount("");
                    setValidFrom("");
                    setValidTo("");
                    setMinNights("1");
                    setMaxNights("");
                    setSelectedRoomCategories([]);
                    setSelectedInclusions([]);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Novo Plano
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer Actions */}
        {step < 5 && (
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => (step === 1 ? handleClose() : setStep(step - 1))}
            >
              {step === 1 ? "Cancelar" : "Voltar"}
            </Button>
            <Button
              className="gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2) ||
                (step === 3 && !canProceedStep3) ||
                (step === 4 && !canProceedStep4)
              }
              onClick={() => (step === 4 ? handleFinish() : setStep(step + 1))}
            >
              {step === 4 ? (
                <>
                  <Check className="w-4 h-4" />
                  Criar Plano
                </>
              ) : (
                <>
                  Continuar
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
