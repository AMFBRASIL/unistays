import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Tag,
  Hotel,
  Building,
  Home,
  Palmtree,
  Calendar,
  Clock,
  CalendarDays,
  CalendarRange,
  Check,
  Sparkles,
  Percent,
  Coffee,
  Car,
  Waves,
  Dumbbell,
  Utensils,
  Loader2,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
  CheckCircle2,
  ListFilter,
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface RatePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Quando passado, abre direto em create ou edit (sem tela de lista interna) */
  modeWhenOpen?: "list" | "create" | "edit";
  /** Dados do plano para edição (obrigatório quando modeWhenOpen === "edit") */
  initialData?: any;
  /** Chamado após criar/atualizar com sucesso (fecha o modal e permite refetch na lista) */
  onSuccess?: () => void;
}

const propertyTypes = [
  { id: "hotel", icon: Hotel, label: "Hotel", color: "from-blue-500 to-blue-600" },
  { id: "apart", icon: Building, label: "Apart-Hotel", color: "from-violet-500 to-violet-600" },
  { id: "loft", icon: Home, label: "Loft", color: "from-emerald-500 to-emerald-600" },
  { id: "temporada", icon: Palmtree, label: "Temporada", color: "from-amber-500 to-amber-600" },
];

const stayTypes = [
  { id: "daily", icon: Calendar, label: "Diária", color: "from-cyan-500 to-cyan-600" },
  { id: "weekly", icon: Clock, label: "Semanal", color: "from-green-500 to-green-600" },
  { id: "monthly", icon: CalendarDays, label: "Mensal", color: "from-orange-500 to-orange-600" },
  { id: "longstay", icon: CalendarRange, label: "Long Stay", color: "from-pink-500 to-pink-600" },
];

const planTypes = [
  { id: "package", label: "Pacote", color: "bg-blue-500", dbValue: "package" },
  { id: "promo", label: "Promoção", color: "bg-pink-500", dbValue: "promotional" },
  { id: "corporate", label: "Corporativo", color: "bg-violet-500", dbValue: "corporate" },
  { id: "seasonal", label: "Sazonal", color: "bg-amber-500", dbValue: "promotional" },
];

const inclusions = [
  { id: "breakfast", icon: Coffee, label: "Café da Manhã" },
  { id: "parking", icon: Car, label: "Estacionamento" },
  { id: "pool", icon: Waves, label: "Piscina" },
  { id: "gym", icon: Dumbbell, label: "Academia" },
  { id: "meals", icon: Utensils, label: "Refeições" },
];
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400";

const getTypeLabel = (type: string) => {
  const planType = planTypes.find(p => p.dbValue === type);
  return planType ? planType.label : type;
};

const getTypeColor = (type: string) => {
  const planType = planTypes.find(p => p.dbValue === type);
  return planType ? planType.color : "bg-gray-500";
};

export function RatePlanModal({ open, onOpenChange, modeWhenOpen = "list", initialData, onSuccess }: RatePlanModalProps) {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ratePlanToDelete, setRatePlanToDelete] = useState<any | null>(null);
  const [editingRatePlan, setEditingRatePlan] = useState<any | null>(null);
  const [ratePlans, setRatePlans] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    propertyId: null as number | null,
    selectedPropertyTypes: [] as string[],
    selectedStayTypes: [] as string[],
    planType: "",
    name: "",
    code: "",
    description: "",
    discount: "",
    validFrom: "",
    validTo: "",
    minNights: "1",
    maxNights: "",
    selectedInclusions: [] as string[],
    isActive: true,
  });

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadProperties();
      if (mode === "list") {
        loadRatePlans();
      }
    }
  }, [open, mode]);

  // Quando aberto a partir da lista (Planos Tarifários): abrir direto em create ou edit
  useEffect(() => {
    if (!open) return;
    if (modeWhenOpen === "create") {
      setMode("create");
      setEditingRatePlan(null);
      setStep(1);
      setFormData({
        propertyId: selectedPropertyId,
        selectedPropertyTypes: [],
        selectedStayTypes: [],
        planType: "",
        name: "",
        code: "",
        description: "",
        discount: "",
        validFrom: "",
        validTo: "",
        minNights: "1",
        maxNights: "",
        selectedInclusions: [],
        isActive: true,
      });
    } else if (modeWhenOpen === "edit" && initialData?.id) {
      setMode("edit");
      loadRatePlanForEdit(initialData.id);
    } else if (modeWhenOpen === "list") {
      setMode("list");
      loadRatePlans();
    }
  }, [open, modeWhenOpen, initialData?.id]);

  // Filter rate plans based on search term
  const filteredRatePlans = useMemo(() => {
    return ratePlans.filter((plan) => {
      if (!searchTerm.trim()) return true;
      const search = searchTerm.toLowerCase().trim();
      const name = (plan.name || "").toLowerCase();
      const code = (plan.code || "").toLowerCase();
      const description = (plan.description || "").toLowerCase();
      return (
        name.includes(search) ||
        code.includes(search) ||
        description.includes(search)
      );
    });
  }, [ratePlans, searchTerm]);

  const loadProperties = async () => {
    try {
      const response = await api.getProperties();
      if (response.success && response.data?.properties) {
        setProperties(response.data.properties);
        const props = response.data.properties as { id: number }[];
        if (props.length > 0 && !selectedPropertyId) {
          setSelectedPropertyId(props[0].id);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar propriedades:", error);
    }
  };

  const loadRatePlans = async () => {
    try {
      setIsLoading(true);
      const response = await api.getRatePlans();
      if (response.success && response.data?.ratePlans) {
        setRatePlans(response.data.ratePlans);
      }
    } catch (error) {
      console.error("Erro ao carregar planos tarifários:", error);
      toast.error("Erro ao carregar planos tarifários");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRatePlanForEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await api.getRatePlanById(id);
      if (response.success && response.data) {
        const plan = response.data as Record<string, unknown>;
        setEditingRatePlan(plan);
        
        setFormData({
          propertyId: (plan.propertyId as number) || null,
          selectedPropertyTypes: (plan.propertyTypes as string[]) || [],
          selectedStayTypes: (plan.stayTypes as string[]) || [],
          planType: planTypeToModalType((plan.type as string) || ""),
          name: (plan.name as string) || "",
          code: (plan.code as string) || "",
          description: (plan.description as string) || "",
          discount: (plan.discountPercentage as number)?.toString() || "",
          validFrom: plan.validFrom ? new Date(plan.validFrom as string).toISOString().split("T")[0] : "",
          validTo: plan.validTo ? new Date(plan.validTo as string).toISOString().split("T")[0] : "",
          minNights: (plan.minStay as number)?.toString() || "1",
          maxNights: (plan.maxStay as number)?.toString() || "",
          selectedInclusions: (plan.inclusions as string[]) || [],
          isActive: (plan.status as string) === "active",
        });

        if (plan.propertyId) {
          setSelectedPropertyId(plan.propertyId as number);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar plano tarifário:", error);
      toast.error("Erro ao carregar dados do plano tarifário");
      setEditingRatePlan(null);
      setMode("list");
    } finally {
      setIsLoading(false);
    }
  };

  // Mapear tipo do modal para tipo do banco
  const planTypeToModalType = (dbType: string): string => {
    const planType = planTypes.find(p => p.dbValue === dbType);
    return planType ? planType.id : "";
  };

  const modalTypeToPlanType = (modalType: string): string => {
    const planType = planTypes.find(p => p.id === modalType);
    return planType ? planType.dbValue : "package";
  };

  const togglePropertyType = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPropertyTypes: prev.selectedPropertyTypes.includes(id)
        ? prev.selectedPropertyTypes.filter(p => p !== id)
        : [...prev.selectedPropertyTypes, id]
    }));
  };

  const toggleStayType = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedStayTypes: prev.selectedStayTypes.includes(id)
        ? prev.selectedStayTypes.filter(s => s !== id)
        : [...prev.selectedStayTypes, id]
    }));
  };

  const toggleInclusion = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedInclusions: prev.selectedInclusions.includes(id)
        ? prev.selectedInclusions.filter(i => i !== id)
        : [...prev.selectedInclusions, id]
    }));
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.propertyId) {
      toast.error("Propriedade é obrigatória");
      return;
    }
    if (!formData.planType) {
      toast.error("Tipo do plano é obrigatório");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Nome do plano é obrigatório");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = {
        propertyId: formData.propertyId,
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        description: formData.description.trim() || null,
        type: modalTypeToPlanType(formData.planType),
        currency: "BRL",
        baseRate: 0,
        discountPercentage: formData.discount ? parseFloat(formData.discount) : null,
        minStay: formData.minNights ? parseInt(formData.minNights, 10) : null,
        maxStay: formData.maxNights ? parseInt(formData.maxNights, 10) : null,
        validFrom: formData.validFrom || null,
        validTo: formData.validTo || null,
        propertyTypes: formData.selectedPropertyTypes.length > 0 ? formData.selectedPropertyTypes : null,
        stayTypes: formData.selectedStayTypes.length > 0 ? formData.selectedStayTypes : null,
        inclusions: formData.selectedInclusions.length > 0 ? formData.selectedInclusions : null,
        status: formData.isActive ? "active" : "inactive",
      };

      let response;
      if (editingRatePlan) {
        response = await api.updateRatePlan(editingRatePlan.id, data);
        if (response.success) {
          toast.success("Plano Tarifário Atualizado", {
            description: `${formData.name} foi atualizado com sucesso!`,
          });
          if (onSuccess) {
            onSuccess();
            handleClose();
          } else {
            await loadRatePlans();
            setMode("list");
            setEditingRatePlan(null);
            resetForm();
          }
        } else {
          toast.error(response.error?.message || "Erro ao atualizar plano tarifário");
        }
      } else {
        response = await api.createRatePlan(data);
        if (response.success) {
          toast.success("Plano Tarifário Criado", {
            description: `${formData.name} foi cadastrado com sucesso!`,
          });
          if (onSuccess) {
            onSuccess();
            handleClose();
          } else {
            await loadRatePlans();
            setMode("list");
            resetForm();
          }
        } else {
          toast.error(response.error?.message || "Erro ao cadastrar plano tarifário");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar plano tarifário:", error);
      toast.error("Erro ao salvar plano tarifário");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      propertyId: selectedPropertyId,
      selectedPropertyTypes: [],
      selectedStayTypes: [],
      planType: "",
      name: "",
      code: "",
      description: "",
      discount: "",
      validFrom: "",
      validTo: "",
      minNights: "1",
      maxNights: "",
      selectedInclusions: [],
      isActive: true,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setMode("list");
      setStep(1);
      setEditingRatePlan(null);
      setSearchTerm("");
      resetForm();
    }, 300);
  };

  const handleNewClick = () => {
    setEditingRatePlan(null);
    setMode("create");
    setStep(1);
    setSearchTerm("");
    resetForm();
  };

  const handleEditClick = (ratePlan: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingRatePlan(ratePlan);
    setMode("edit");
    setStep(1);
    loadRatePlanForEdit(ratePlan.id);
  };

  const handleBackToList = () => {
    setMode("list");
    setStep(1);
    setEditingRatePlan(null);
    resetForm();
    loadRatePlans();
  };

  const handleDeleteClick = (ratePlan: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRatePlanToDelete(ratePlan);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!ratePlanToDelete) return;

    try {
      setIsDeleting(true);
      const response = await api.deleteRatePlan(ratePlanToDelete.id);

      if (response.success) {
        toast.success("Plano Tarifário Excluído", {
          description: `${ratePlanToDelete.name} foi excluído com sucesso!`,
        });
        setDeleteDialogOpen(false);
        setRatePlanToDelete(null);
        await loadRatePlans();
      } else {
        toast.error(response.error?.message || "Erro ao excluir plano tarifário");
      }
    } catch (error) {
      console.error("Erro ao excluir plano tarifário:", error);
      toast.error("Erro ao excluir plano tarifário");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setRatePlanToDelete(null);
  };

  // Auto-set propertyId when property is selected
  useEffect(() => {
    if (selectedPropertyId && mode === "create") {
      setFormData(prev => ({ ...prev, propertyId: selectedPropertyId }));
    }
  }, [selectedPropertyId, mode]);

  const progressValue = mode === "list" ? 100 : step === 1 ? 33 : step === 2 ? 66 : 100;
  const wizardSteps = [
    { key: "segment", title: "Segmentação", subtitle: "Tipo e escopo", icon: Tag, done: mode !== "list" && step > 1 },
    { key: "rules", title: "Regras", subtitle: "Condições comerciais", icon: ListFilter, done: mode !== "list" && step > 2 },
    { key: "summary", title: "Resumo", subtitle: "Publicação final", icon: LayoutGrid, done: mode !== "list" && step === 3 },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className={`${mode === "list" ? "max-w-7xl" : "max-w-7xl"} h-[90vh] max-h-[90vh] p-0 gap-0 overflow-hidden`}>
          <div className="h-full min-h-0 grid md:grid-cols-[300px_1fr]">
            <aside className="hidden md:flex flex-col border-r border-border/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
              <div className="relative p-5 border-b border-white/10">
                <div className="absolute inset-0 opacity-25 bg-cover bg-center" style={{ backgroundImage: `url(${PLACEHOLDER_IMAGE})` }} />
                <div className="absolute inset-0 bg-gradient-to-br from-pink-900/70 to-slate-950/80" />
                <div className="relative">
                  <p className="text-xs uppercase tracking-wider text-pink-200/90">Rate Plan Wizard</p>
                  <h3 className="mt-1 text-lg font-semibold">Estrutura premium</h3>
                  <p className="text-xs text-slate-300 mt-1">Fluxo de cadastro com steps e progresso.</p>
                </div>
              </div>
              <div className="p-5 border-b border-white/10">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                  <span>Progresso do fluxo</span>
                  <span>{progressValue}%</span>
                </div>
                <Progress value={progressValue} className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-pink-400 [&>div]:to-rose-500" />
              </div>
              <div className="p-4 space-y-2">
                {wizardSteps.map((s, i) => (
                  <div key={s.key} className={`rounded-xl border px-3 py-3 ${mode === "list" ? "border-white/10 bg-white/5" : s.done || step === i + 1 ? "border-pink-400/30 bg-pink-500/10" : "border-white/10 bg-white/5"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${(s.done || (mode !== "list" && step === i + 1)) ? "bg-pink-400/20 text-pink-300" : "bg-white/10 text-slate-300"}`}>
                        {s.done ? <CheckCircle2 className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">{`${i + 1}. ${s.title}`}</p>
                        <p className="text-xs text-slate-300 truncate">{s.subtitle}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
            <div className="flex flex-col min-h-0 min-w-0">
          {/* Header */}
          <div className="relative px-6 py-5 border-b bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-pink-500/10 flex-shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
              <svg viewBox="0 0 200 200" className="w-full h-full text-pink-500">
                <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
                <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
              </svg>
            </div>
            
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
              <Tag className="h-24 w-24 text-pink-500" />
            </div>

            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-pink-500 to-rose-500">
                    <Tag className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {mode === "list" 
                        ? "Planos Tarifários" 
                        : mode === "edit"
                        ? "Editar Plano Tarifário"
                        : "Novo Plano Tarifário"}
                    </DialogTitle>
                    <p className="text-sm font-normal text-pink-600">
                      {mode === "list" 
                        ? "Gerencie os planos tarifários cadastrados" 
                        : mode === "edit"
                        ? "Edite as informações do plano tarifário"
                        : "Configure um novo plano de tarifas e descontos"}
                    </p>
                  </div>
                </div>
                {(mode === "create" || mode === "edit") && (
                  <div className="flex gap-2">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          step === s
                            ? "bg-pink-600 text-white"
                            : step > s
                            ? "bg-pink-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {step > s ? <Check className="h-5 w-5" /> : s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 h-full">
            <div className="p-6 space-y-6">
              {mode === "list" ? (
                /* LIST MODE */
                <div className="space-y-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Planos Tarifários Cadastrados</h3>
                        <p className="text-sm text-muted-foreground">
                          {filteredRatePlans.length} de {ratePlans.length} {ratePlans.length === 1 ? "plano cadastrado" : "planos cadastrados"}
                        </p>
                      </div>
                      <Button
                        onClick={handleNewClick}
                        className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Plano Tarifário
                      </Button>
                    </div>
                    
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome, código, descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                    </div>
                  ) : ratePlans.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhum plano tarifário cadastrado</p>
                      <Button onClick={handleNewClick} className="mt-4" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar Primeiro Plano Tarifário
                      </Button>
                    </div>
                  ) : filteredRatePlans.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhum plano encontrado com o termo "{searchTerm}"</p>
                    </div>
                  ) : (
                    /* Rate Plans List - Table */
                    <div className="border rounded-lg overflow-hidden">
                      <ScrollArea className="h-[calc(95vh-280px)]">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted/50 border-b sticky top-0 z-10">
                              <tr>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Plano</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Tipo</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Desconto</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Validade</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Min/Max Noites</th>
                                <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {filteredRatePlans.map((plan) => (
                                <tr 
                                  key={plan.id} 
                                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                                >
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <Tag className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <span className="font-medium text-sm block">{plan.name}</span>
                                        {plan.code && (
                                          <span className="text-xs text-muted-foreground">Código: {plan.code}</span>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <Badge className={`${getTypeColor(plan.type)} text-white border-0 shadow-sm`}>
                                      {getTypeLabel(plan.type)}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-sm text-muted-foreground">
                                      {plan.discountPercentage ? `${plan.discountPercentage}%` : "-"}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-sm text-muted-foreground">
                                      {plan.validFrom && plan.validTo
                                        ? `${new Date(plan.validFrom).toLocaleDateString('pt-BR')} - ${new Date(plan.validTo).toLocaleDateString('pt-BR')}`
                                        : "-"}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-sm text-muted-foreground">
                                      {plan.minStay || "1"} / {plan.maxStay || "∞"}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <Badge 
                                      className={plan.status === "active" ? "bg-emerald-500" : "bg-red-500"}
                                    >
                                      {plan.status === "active" ? "Ativo" : "Inativo"}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center justify-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={(e) => handleEditClick(plan, e)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={(e) => handleDeleteClick(plan, e)}
                                        disabled={isDeleting}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              ) : (
                /* CREATE/EDIT MODE - Mantém o layout original */
                <>
                  {step === 1 && (
                    <div className="space-y-6">
                      {/* Property Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="property">Propriedade *</Label>
                        <select
                          id="property"
                          value={selectedPropertyId || ""}
                          onChange={(e) => {
                            const propId = parseInt(e.target.value, 10);
                            setSelectedPropertyId(propId);
                            setFormData(prev => ({ ...prev, propertyId: propId }));
                          }}
                          className="w-full px-3 py-2 rounded-md border bg-background"
                          disabled={!!editingRatePlan}
                        >
                          <option value="">Selecione uma propriedade</option>
                          {properties.map((prop) => (
                            <option key={prop.id} value={prop.id}>
                              {prop.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Property Types */}
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Hotel className="h-5 w-5 text-pink-400" />
                          Tipos de Propriedade
                          <Badge className="ml-2 bg-pink-500/20 text-pink-400 border-0">
                            Selecione um ou mais
                          </Badge>
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {propertyTypes.map((type) => (
                            <button
                              key={type.id}
                              onClick={() => togglePropertyType(type.id)}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                formData.selectedPropertyTypes.includes(type.id)
                                  ? "border-pink-500 bg-pink-500/10"
                                  : "border-border hover:border-pink-300 bg-card"
                              }`}
                            >
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center mx-auto mb-3`}>
                                <type.icon className="h-6 w-6 text-white" />
                              </div>
                              <p className="font-medium text-foreground text-center">{type.label}</p>
                              {formData.selectedPropertyTypes.includes(type.id) && (
                                <div className="flex justify-center mt-2">
                                  <Check className="h-5 w-5 text-pink-400" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Stay Types */}
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-cyan-400" />
                          Tipos de Estadia
                          <Badge className="ml-2 bg-cyan-500/20 text-cyan-400 border-0">
                            Selecione um ou mais
                          </Badge>
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {stayTypes.map((type) => (
                            <button
                              key={type.id}
                              onClick={() => toggleStayType(type.id)}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                formData.selectedStayTypes.includes(type.id)
                                  ? "border-cyan-500 bg-cyan-500/10"
                                  : "border-border hover:border-cyan-300 bg-card"
                              }`}
                            >
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center mx-auto mb-3`}>
                                <type.icon className="h-6 w-6 text-white" />
                              </div>
                              <p className="font-medium text-foreground text-center">{type.label}</p>
                              {formData.selectedStayTypes.includes(type.id) && (
                                <div className="flex justify-center mt-2">
                                  <Check className="h-5 w-5 text-cyan-400" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Plan Type */}
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-foreground">Tipo do Plano *</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {planTypes.map((type) => (
                            <button
                              key={type.id}
                              onClick={() => setFormData(prev => ({ ...prev, planType: type.id }))}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                formData.planType === type.id
                                  ? "border-white/40 bg-white/10"
                                  : "border-border hover:border-pink-300 bg-card"
                              }`}
                            >
                              <Badge className={`${type.color} mb-2`}>{type.label}</Badge>
                              {formData.planType === type.id && (
                                <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome do Plano *</Label>
                          <Input
                            id="name"
                            placeholder="Ex: Pacote Férias 2024"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="code">Código</Label>
                          <Input
                            id="code"
                            placeholder="Ex: FER2024"
                            value={formData.code}
                            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                            className="bg-background"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          placeholder="Descreva o plano tarifário..."
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="bg-background min-h-[100px]"
                        />
                      </div>

                      {/* Discount and Validity */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-pink-500/5 to-rose-500/5">
                        <Label className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                          <Percent className="h-5 w-5 text-pink-400" />
                          Desconto e Validade
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="discount">Desconto (%)</Label>
                            <Input
                              id="discount"
                              type="number"
                              min="0"
                              max="100"
                              placeholder="Ex: 15"
                              value={formData.discount}
                              onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="validFrom">Válido De</Label>
                            <Input
                              id="validFrom"
                              type="date"
                              value={formData.validFrom}
                              onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="validTo">Válido Até</Label>
                            <Input
                              id="validTo"
                              type="date"
                              value={formData.validTo}
                              onChange={(e) => setFormData(prev => ({ ...prev, validTo: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Stay Limits */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="minNights">Mínimo de Noites</Label>
                          <Input
                            id="minNights"
                            type="number"
                            min="1"
                            value={formData.minNights}
                            onChange={(e) => setFormData(prev => ({ ...prev, minNights: e.target.value }))}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxNights">Máximo de Noites</Label>
                          <Input
                            id="maxNights"
                            type="number"
                            min="1"
                            placeholder="Ilimitado"
                            value={formData.maxNights}
                            onChange={(e) => setFormData(prev => ({ ...prev, maxNights: e.target.value }))}
                            className="bg-background"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      {/* Inclusions */}
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-amber-400" />
                          Inclusões do Plano
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {inclusions.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => toggleInclusion(item.id)}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                formData.selectedInclusions.includes(item.id)
                                  ? "border-amber-500 bg-amber-500/10"
                                  : "border-border hover:border-amber-300 bg-card"
                              }`}
                            >
                              <item.icon className={`h-6 w-6 mx-auto mb-2 ${
                                formData.selectedInclusions.includes(item.id) ? "text-amber-400" : "text-muted-foreground"
                              }`} />
                              <p className="text-xs font-medium text-center">{item.label}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/20">
                              <Check className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Plano Ativo</p>
                              <p className="text-sm text-muted-foreground">Disponível para novas reservas</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                          />
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-pink-500/5 to-rose-500/5">
                        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-pink-400" />
                          Resumo do Plano
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 rounded-lg bg-card border">
                            <p className="text-lg font-bold text-foreground truncate">{formData.name || "-"}</p>
                            <p className="text-xs text-muted-foreground">Nome</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-card border">
                            <p className="text-2xl font-bold text-pink-400">{formData.discount || "0"}%</p>
                            <p className="text-xs text-muted-foreground">Desconto</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-card border">
                            <p className="text-lg font-bold text-foreground">{formData.selectedInclusions.length}</p>
                            <p className="text-xs text-muted-foreground">Inclusões</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-card border">
                            <Badge className={formData.isActive ? "bg-emerald-500" : "bg-red-500"}>
                              {formData.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">Status</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            </ScrollArea>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t bg-muted/30 flex-shrink-0">
            {mode === "list" ? (
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={onSuccess ? handleClose : handleBackToList}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {onSuccess ? "Fechar" : "Voltar"}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => step > 1 ? setStep(step - 1) : (onSuccess ? handleClose : handleBackToList)()}
                    disabled={isSubmitting}
                  >
                    {step > 1 ? "Anterior" : "Cancelar"}
                  </Button>
                  <Button
                    onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white shadow-lg shadow-pink-500/25"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingRatePlan ? "Atualizando..." : "Cadastrando..."}
                      </>
                    ) : step < 3 ? (
                      "Continuar"
                    ) : editingRatePlan ? (
                      "Atualizar Plano Tarifário"
                    ) : (
                      "Criar Plano Tarifário"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
          </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o plano tarifário <strong>{ratePlanToDelete?.name}</strong>?
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                Código: {ratePlanToDelete?.code || "N/A"}
              </span>
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete} disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
