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
  Percent,
  Tag,
  Zap,
  Clock,
  Calendar,
  Users,
  Gift,
  Sparkles,
  Check,
  Hotel,
  Building,
  Home,
  Palmtree,
  Star,
  TrendingUp,
  BadgePercent,
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

interface PromotionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Quando definido, o modal abre já neste modo (ex: "create" para Nova Promoção). */
  initialMode?: "list" | "create" | "edit";
  /** Dados da promoção para edição (quando aberto a partir da lista). */
  initialData?: any;
  /** Chamado após criar/atualizar com sucesso. */
  onSuccess?: () => void;
}

const promotionTypes = [
  { id: "discount", icon: Percent, label: "Desconto %", color: "from-pink-500 to-pink-600", description: "Percentual de desconto" },
  { id: "fixed", icon: Tag, label: "Valor Fixo", color: "from-violet-500 to-violet-600", description: "Desconto em reais" },
  { id: "flash", icon: Zap, label: "Flash Sale", color: "from-amber-500 to-amber-600", description: "Promoção relâmpago" },
  { id: "earlybird", icon: Clock, label: "Early Bird", color: "from-cyan-500 to-cyan-600", description: "Reserva antecipada" },
  { id: "lastminute", icon: TrendingUp, label: "Last Minute", color: "from-red-500 to-red-600", description: "Última hora" },
  { id: "gift", icon: Gift, label: "Brinde", color: "from-emerald-500 to-emerald-600", description: "Cortesia inclusa" },
];

const propertyTypes = [
  { id: "hotel", icon: Hotel, label: "Hotel" },
  { id: "apart", icon: Building, label: "Apart-Hotel" },
  { id: "loft", icon: Home, label: "Loft" },
  { id: "temporada", icon: Palmtree, label: "Temporada" },
];

const weekDays = [
  { id: "dom", label: "Dom" },
  { id: "seg", label: "Seg" },
  { id: "ter", label: "Ter" },
  { id: "qua", label: "Qua" },
  { id: "qui", label: "Qui" },
  { id: "sex", label: "Sex" },
  { id: "sab", label: "Sáb" },
];
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400";

const getTypeLabel = (type: string) => {
  const promoType = promotionTypes.find(p => p.id === type);
  return promoType ? promoType.label : type;
};

const getTypeColor = (type: string) => {
  const promoType = promotionTypes.find(p => p.id === type);
  return promoType ? promoType.color : "from-gray-500 to-gray-600";
};

/** Máscara valor em R$: digita números e formata como "R$ 1.234,56" */
function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Converte string mascarada "R$ 1.234,56" para número */
function parseCurrency(masked: string): number | null {
  if (!masked || !masked.trim()) return null;
  const cleaned = masked.replace(/\s/g, "").replace(/R\$/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? null : n;
}

/** Formata número para exibição "R$ 1.234,56" (ao carregar edição) */
function formatCurrencyForDisplay(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "";
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const mapDbTypeToModalType = (dbType: string): string => {
  const typeMap: Record<string, string> = {
    'percentage': 'discount',
    'fixed_amount': 'fixed',
    'package': 'gift',
    'free_night': 'gift',
  };
  return typeMap[dbType] || 'discount';
};

export function PromotionModal({ open, onOpenChange, initialMode, initialData, onSuccess }: PromotionModalProps) {
  const [mode, setMode] = useState<"list" | "create" | "edit">(initialMode ?? "list");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<any | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<any | null>(null);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    propertyId: null as number | null,
    type: "",
    name: "",
    code: "",
    description: "",
    discountValue: "",
    minValue: "",
    maxDiscount: "",
    validFrom: "",
    validTo: "",
    minNights: "1",
    maxUses: "",
    usesPerGuest: "1",
    selectedPropertyTypes: [] as string[],
    selectedDays: [] as string[],
    showOnWebsite: true,
    requireCoupon: false,
    isActive: true,
  });

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadProperties();
      if (mode === "list") {
        loadPromotions();
      }
    }
  }, [open, mode]);

  // Ao abrir a partir da lista: create (sem initialData) ou edit (com initialData)
  useEffect(() => {
    if (!open) return;
    if (initialData?.id) {
      setMode("edit");
      setStep(1);
      loadPromotionForEdit(initialData.id);
    } else if (initialMode === "create") {
      setMode("create");
      setStep(1);
      setEditingPromotion(null);
      setSearchTerm("");
      setFormData({
        propertyId: selectedPropertyId,
        type: "",
        name: "",
        code: "",
        description: "",
        discountValue: "",
        minValue: "",
        maxDiscount: "",
        validFrom: "",
        validTo: "",
        minNights: "1",
        maxUses: "",
        usesPerGuest: "1",
        selectedPropertyTypes: [],
        selectedDays: [],
        showOnWebsite: true,
        requireCoupon: false,
        isActive: true,
      });
    }
  }, [open, initialMode, initialData?.id]);

  // Filter promotions based on search term
  const filteredPromotions = useMemo(() => {
    return promotions.filter((promo) => {
      if (!searchTerm.trim()) return true;
      const search = searchTerm.toLowerCase().trim();
      const name = (promo.name || "").toLowerCase();
      const code = (promo.code || "").toLowerCase();
      const description = (promo.description || "").toLowerCase();
      const promoCode = (promo.promoCode || "").toLowerCase();
      return (
        name.includes(search) ||
        code.includes(search) ||
        description.includes(search) ||
        promoCode.includes(search)
      );
    });
  }, [promotions, searchTerm]);

  const loadProperties = async () => {
    try {
      const response = await api.getProperties();
      if (response.success && response.data?.properties) {
        setProperties(response.data.properties);
        // Selecionar primeira propriedade por padrão
        if (response.data.properties.length > 0 && !selectedPropertyId) {
          setSelectedPropertyId(response.data.properties[0].id);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar propriedades:", error);
    }
  };

  const loadPromotions = async () => {
    try {
      setIsLoading(true);
      const response = await api.getPromotions();
      if (response.success && response.data?.promotions) {
        setPromotions(response.data.promotions);
      }
    } catch (error) {
      console.error("Erro ao carregar promoções:", error);
      toast.error("Erro ao carregar promoções");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPromotionForEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await api.getPromotionById(id);
      if (response.success && response.data) {
        const promo = response.data as Record<string, unknown>;
        setEditingPromotion(promo);
        const modalType = mapDbTypeToModalType((promo.type as string) || "");
        const isFixed = modalType === "fixed";
        setFormData({
          propertyId: (promo.propertyId as number) || null,
          type: modalType,
          name: (promo.name as string) || "",
          code: (promo.code as string) || "",
          description: (promo.description as string) || "",
          discountValue: isFixed
            ? formatCurrencyForDisplay(promo.discountValue as number)
            : ((promo.discountPercentage as number)?.toString() ?? (promo.discountValue as number)?.toString()) || "",
          minValue: formatCurrencyForDisplay(promo.minValue as number),
          maxDiscount: formatCurrencyForDisplay(promo.maxDiscount as number),
          validFrom: promo.validFrom ? new Date(promo.validFrom as string).toISOString().split("T")[0] : "",
          validTo: promo.validTo ? new Date(promo.validTo as string).toISOString().split("T")[0] : "",
          minNights: (promo.minStay as number)?.toString() || "1",
          maxUses: (promo.usageLimit as number)?.toString() || "",
          usesPerGuest: "1",
          selectedPropertyTypes: (promo.propertyTypes as string[]) || [],
          selectedDays: (promo.selectedDays as string[]) || [],
          showOnWebsite: (promo.showOnWebsite as boolean) !== false,
          requireCoupon: !!(promo.requireCoupon ?? promo.requireCoupon),
          isActive: (promo.status as string) === "active",
        });
        if (promo.propertyId) {
          setSelectedPropertyId(promo.propertyId as number);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar promoção:", error);
      toast.error("Erro ao carregar dados da promoção");
      setEditingPromotion(null);
      setMode("list");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePropertyType = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPropertyTypes: prev.selectedPropertyTypes.includes(id)
        ? prev.selectedPropertyTypes.filter(p => p !== id)
        : [...prev.selectedPropertyTypes, id]
    }));
  };

  const toggleDay = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(id)
        ? prev.selectedDays.filter(d => d !== id)
        : [...prev.selectedDays, id]
    }));
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.propertyId) {
      toast.error("Propriedade é obrigatória");
      return;
    }
    if (!formData.type) {
      toast.error("Tipo de promoção é obrigatório");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Nome da promoção é obrigatório");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = {
        propertyId: formData.propertyId,
        code: formData.code.trim() || undefined,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        type: formData.type,
        discountValue: formData.type === "fixed"
          ? parseCurrency(formData.discountValue)
          : (formData.discountValue ? parseFloat(formData.discountValue.replace(/\D/g, "")) : null),
        discountPercentage: formData.type === "discount" || formData.type === "flash" || formData.type === "earlybird" || formData.type === "lastminute"
          ? (formData.discountValue ? parseFloat(formData.discountValue.replace(/\D/g, "")) : null)
          : null,
        minValue: parseCurrency(formData.minValue),
        maxDiscount: parseCurrency(formData.maxDiscount),
        minStay: formData.minNights ? parseInt(formData.minNights, 10) : null,
        maxStay: null,
        validFrom: formData.validFrom || null,
        validTo: formData.validTo || null,
        propertyTypes: formData.selectedPropertyTypes.length > 0 ? formData.selectedPropertyTypes : null,
        selectedDays: formData.selectedDays.length > 0 ? formData.selectedDays : null,
        usageLimit: formData.maxUses ? parseInt(formData.maxUses, 10) : null,
        usesPerGuest: formData.usesPerGuest ? parseInt(formData.usesPerGuest, 10) : null,
        showOnWebsite: formData.showOnWebsite,
        requireCoupon: formData.requireCoupon,
        status: formData.isActive ? "active" : "inactive",
      };

      let response;
      if (editingPromotion) {
        response = await api.updatePromotion((editingPromotion as { id: number }).id, data);
        if (response.success) {
          toast.success("Promoção Atualizada", {
            description: `${formData.name} foi atualizada com sucesso!`,
          });
          if (onSuccess) {
            onSuccess();
            handleClose();
          } else {
            await loadPromotions();
            setMode("list");
            setEditingPromotion(null);
            resetForm();
          }
        } else {
          toast.error((response.error as { message?: string })?.message || "Erro ao atualizar promoção");
        }
      } else {
        response = await api.createPromotion(data);
        if (response.success) {
          toast.success("Promoção Criada", {
            description: `${formData.name} foi cadastrada com sucesso!`,
          });
          if (onSuccess) {
            onSuccess();
            handleClose();
          } else {
            await loadPromotions();
            setMode("list");
            resetForm();
          }
        } else {
          toast.error((response.error as { message?: string })?.message || "Erro ao cadastrar promoção");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar promoção:", error);
      toast.error("Erro ao salvar promoção");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      propertyId: selectedPropertyId,
      type: "",
      name: "",
      code: "",
      description: "",
      discountValue: "",
      minValue: "",
      maxDiscount: "",
      validFrom: "",
      validTo: "",
      minNights: "1",
      maxUses: "",
      usesPerGuest: "1",
      selectedPropertyTypes: [],
      selectedDays: [],
      showOnWebsite: true,
      requireCoupon: false,
      isActive: true,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setMode("list");
      setStep(1);
      setEditingPromotion(null);
      setSearchTerm("");
      resetForm();
    }, 300);
  };

  const handleNewClick = () => {
    setEditingPromotion(null);
    setMode("create");
    setStep(1);
    setSearchTerm("");
    resetForm();
  };

  const handleEditClick = (promotion: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingPromotion(promotion);
    setMode("edit");
    setStep(1);
    loadPromotionForEdit(promotion.id);
  };

  const handleBackToList = () => {
    setMode("list");
    setStep(1);
    setEditingPromotion(null);
    resetForm();
    loadPromotions();
  };

  const handleDeleteClick = (promotion: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPromotionToDelete(promotion);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!promotionToDelete) return;

    try {
      setIsDeleting(true);
      const response = await api.deletePromotion(promotionToDelete.id);

      if (response.success) {
        toast.success("Promoção Excluída", {
          description: `${promotionToDelete.name} foi excluída com sucesso!`,
        });
        setDeleteDialogOpen(false);
        setPromotionToDelete(null);
        await loadPromotions();
      } else {
        toast.error(response.error?.message || "Erro ao excluir promoção");
      }
    } catch (error) {
      console.error("Erro ao excluir promoção:", error);
      toast.error("Erro ao excluir promoção");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setPromotionToDelete(null);
  };

  // Auto-set propertyId when property is selected
  useEffect(() => {
    if (selectedPropertyId && mode === "create") {
      setFormData(prev => ({ ...prev, propertyId: selectedPropertyId }));
    }
  }, [selectedPropertyId, mode]);

  const progressValue = mode === "list" ? 100 : step === 1 ? 33 : step === 2 ? 66 : 100;
  const wizardSteps = [
    { key: "setup", title: "Estrutura", subtitle: "Tipo e identidade", icon: BadgePercent, done: mode !== "list" && step > 1 },
    { key: "rules", title: "Regras", subtitle: "Valores e validade", icon: ListFilter, done: mode !== "list" && step > 2 },
    { key: "publish", title: "Publicação", subtitle: "Limites e status", icon: LayoutGrid, done: mode !== "list" && step === 3 },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className={`${mode === "list" ? "max-w-7xl" : "max-w-7xl"} h-[90vh] p-0 gap-0 overflow-hidden`}>
          <div className="h-full min-h-0 grid md:grid-cols-[300px_1fr]">
            <aside className="hidden md:flex flex-col border-r border-border/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
              <div className="relative p-5 border-b border-white/10">
                <div className="absolute inset-0 opacity-25 bg-cover bg-center" style={{ backgroundImage: `url(${PLACEHOLDER_IMAGE})` }} />
                <div className="absolute inset-0 bg-gradient-to-br from-rose-900/70 to-slate-950/80" />
                <div className="relative">
                  <p className="text-xs uppercase tracking-wider text-rose-200/90">Promotion Wizard</p>
                  <h3 className="mt-1 text-lg font-semibold">Padrão moderno</h3>
                  <p className="text-xs text-slate-300 mt-1">Fluxo robusto para criação de promoções.</p>
                </div>
              </div>
              <div className="p-5 border-b border-white/10">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                  <span>Progresso do fluxo</span>
                  <span>{progressValue}%</span>
                </div>
                <Progress value={progressValue} className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-rose-400 [&>div]:to-pink-500" />
              </div>
              <div className="p-4 space-y-2">
                {wizardSteps.map((s, i) => (
                  <div key={s.key} className={`rounded-xl border px-3 py-3 ${mode === "list" ? "border-white/10 bg-white/5" : s.done || step === i + 1 ? "border-rose-400/30 bg-rose-500/10" : "border-white/10 bg-white/5"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${(s.done || (mode !== "list" && step === i + 1)) ? "bg-rose-400/20 text-rose-300" : "bg-white/10 text-slate-300"}`}>
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
          <div className="relative px-6 py-5 border-b bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-rose-500/10 flex-shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
              <svg viewBox="0 0 200 200" className="w-full h-full text-rose-500">
                <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
                <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
              </svg>
            </div>

            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
              <BadgePercent className="h-24 w-24 text-rose-500" />
            </div>

            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-rose-500 to-pink-500">
                    <BadgePercent className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {mode === "list"
                        ? "Promoções"
                        : mode === "edit"
                          ? "Editar Promoção"
                          : "Nova Promoção"}
                    </DialogTitle>
                    <p className="text-sm font-normal text-rose-600">
                      {mode === "list"
                        ? "Gerencie as promoções cadastradas"
                        : mode === "edit"
                          ? "Edite as informações da promoção"
                          : "Configure uma nova oferta ou desconto especial"}
                    </p>
                  </div>
                </div>
                {(mode === "create" || mode === "edit") && (
                  <div className="flex gap-2">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === s
                          ? "bg-rose-600 text-white"
                          : step > s
                            ? "bg-rose-500 text-white"
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

          <ScrollArea className="flex-1 min-h-0 h-full">
            <div className="p-6 space-y-6">
              {mode === "list" ? (
                /* LIST MODE */
                <div className="space-y-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Promoções Cadastradas</h3>
                        <p className="text-sm text-muted-foreground">
                          {filteredPromotions.length} de {promotions.length} {promotions.length === 1 ? "promoção cadastrada" : "promoções cadastradas"}
                        </p>
                      </div>
                      <Button
                        onClick={handleNewClick}
                        className="bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Promoção
                      </Button>
                    </div>

                    {/* Search Field */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome, código, descrição, cupom..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                    </div>
                  ) : promotions.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <BadgePercent className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhuma promoção cadastrada</p>
                      <Button onClick={handleNewClick} className="mt-4" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar Primeira Promoção
                      </Button>
                    </div>
                  ) : filteredPromotions.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhuma promoção encontrada com o termo "{searchTerm}"</p>
                    </div>
                  ) : (
                    /* Promotions List - Table */
                    <div className="border rounded-lg overflow-hidden">
                      <ScrollArea className="h-[calc(95vh-280px)]">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted/50 border-b sticky top-0 z-10">
                              <tr>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Promoção</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Tipo</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Desconto</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Validade</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Cupom</th>
                                <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {filteredPromotions.map((promo) => (
                                <tr
                                  key={promo.id}
                                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                                >
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <BadgePercent className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <span className="font-medium text-sm block">{promo.name}</span>
                                        {promo.code && (
                                          <span className="text-xs text-muted-foreground">Código: {promo.code}</span>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <Badge className="text-white border-0 shadow-sm" style={{
                                      background: `linear-gradient(to right, var(--${getTypeColor(mapDbTypeToModalType(promo.type)).split(' ')[0].replace('from-', '')}), var(--${getTypeColor(mapDbTypeToModalType(promo.type)).split(' ')[2]?.replace('to-', '') || 'pink-600'}))`,
                                      backgroundColor: !getTypeColor(mapDbTypeToModalType(promo.type)).includes('from-') ? 'rgb(236 72 153)' : undefined,
                                    }}>
                                      {getTypeLabel(mapDbTypeToModalType(promo.type))}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-sm text-muted-foreground">
                                      {promo.discountPercentage
                                        ? `${promo.discountPercentage}%`
                                        : promo.discountValue
                                          ? `R$ ${promo.discountValue}`
                                          : "-"}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-sm text-muted-foreground">
                                      {promo.validFrom && promo.validTo
                                        ? `${new Date(promo.validFrom).toLocaleDateString('pt-BR')} - ${new Date(promo.validTo).toLocaleDateString('pt-BR')}`
                                        : "-"}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-sm text-muted-foreground font-mono">
                                      {promo.code || "-"}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <Badge
                                      className={promo.status === "active" ? "bg-emerald-500" : "bg-red-500"}
                                    >
                                      {promo.status === "active" ? "Ativa" : "Inativa"}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center justify-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={(e) => handleEditClick(promo, e)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={(e) => handleDeleteClick(promo, e)}
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
                      {/* Property Selection */}
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Building className="h-5 w-5 text-rose-400" />
                          Propriedade *
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {properties.map((prop) => {
                            const pType = propertyTypes.find(t => t.id === prop.type) || propertyTypes[0];
                            const Icon = pType.icon;
                            const isSelected = selectedPropertyId === prop.id;

                            return (
                              <button
                                key={prop.id}
                                type="button"
                                disabled={!!editingPromotion}
                                onClick={() => {
                                  if (editingPromotion) return;
                                  setSelectedPropertyId(prop.id);
                                  setFormData((prev) => ({ ...prev, propertyId: prop.id }));
                                }}
                                className={`p-4 rounded-xl border-2 transition-all text-left relative group ${isSelected
                                  ? "border-rose-500 bg-rose-500/10 shadow-sm"
                                  : "border-border hover:border-rose-300 bg-card"
                                  } ${!!editingPromotion ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
                              >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${isSelected
                                  ? "bg-rose-500 text-white"
                                  : "bg-muted text-muted-foreground group-hover:bg-rose-100 group-hover:text-rose-600"
                                  }`}>
                                  <Icon className="h-5 w-5" />
                                </div>
                                <h4 className="font-semibold text-foreground truncate pr-6">{prop.name}</h4>
                                <p className="text-xs text-muted-foreground capitalize mt-1">{pType.label}</p>

                                {isSelected && (
                                  <div className="absolute top-4 right-4">
                                    <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center">
                                      <Check className="h-3 w-3 text-white" />
                                    </div>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Promotion Type */}
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Zap className="h-5 w-5 text-rose-400" />
                          Tipo de Promoção *
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {promotionTypes.map((type) => (
                            <button
                              key={type.id}
                              onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${formData.type === type.id
                                ? "border-rose-500 bg-rose-500/10"
                                : "border-border hover:border-rose-300 bg-card"
                                }`}
                            >
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center mb-3`}>
                                <type.icon className="h-6 w-6 text-white" />
                              </div>
                              <p className="font-semibold text-foreground">{type.label}</p>
                              <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome da Promoção *</Label>
                          <Input
                            id="name"
                            placeholder="Ex: Super Verão 2024"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="code">Código do Cupom</Label>
                          <Input
                            id="code"
                            placeholder="Ex: VERAO2024"
                            value={formData.code}
                            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                            className="bg-background uppercase"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          placeholder="Descreva a promoção para os clientes..."
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="bg-background min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      {/* Discount Values */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-rose-500/5 to-pink-500/5">
                        <Label className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                          <Percent className="h-5 w-5 text-rose-400" />
                          Valores do Desconto
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="discountValue">
                              {formData.type === "fixed" ? "Valor do Desconto (R$)" : "Desconto (%)"}
                            </Label>
                            <Input
                              id="discountValue"
                              type={formData.type === "fixed" ? "text" : "number"}
                              placeholder={formData.type === "fixed" ? "Ex: R$ 100,00" : "Ex: 15"}
                              value={formData.discountValue}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  discountValue:
                                    formData.type === "fixed" ? maskCurrency(e.target.value) : e.target.value.replace(/\D/g, ""),
                                }))
                              }
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="minValue">Valor Mínimo da Reserva (R$)</Label>
                            <Input
                              id="minValue"
                              type="text"
                              placeholder="Ex: R$ 500,00"
                              value={formData.minValue}
                              onChange={(e) => setFormData((prev) => ({ ...prev, minValue: maskCurrency(e.target.value) }))}
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="maxDiscount">Desconto Máximo (R$)</Label>
                            <Input
                              id="maxDiscount"
                              type="text"
                              placeholder="Ex: R$ 200,00"
                              value={formData.maxDiscount}
                              onChange={(e) => setFormData((prev) => ({ ...prev, maxDiscount: maskCurrency(e.target.value) }))}
                              className="bg-background"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Validity */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
                        <Label className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                          <Calendar className="h-5 w-5 text-cyan-400" />
                          Período de Validade
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="validFrom">Data Início</Label>
                            <Input
                              id="validFrom"
                              type="date"
                              value={formData.validFrom}
                              onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="validTo">Data Fim</Label>
                            <Input
                              id="validTo"
                              type="date"
                              value={formData.validTo}
                              onChange={(e) => setFormData(prev => ({ ...prev, validTo: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
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
                        </div>
                      </div>

                      {/* Week Days */}
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-foreground">Dias da Semana Válidos</Label>
                        <div className="flex gap-2 flex-wrap">
                          {weekDays.map((day) => (
                            <button
                              key={day.id}
                              onClick={() => toggleDay(day.id)}
                              className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center text-sm font-medium ${formData.selectedDays.includes(day.id)
                                ? "border-cyan-500 bg-cyan-500/20 text-cyan-400"
                                : "border-border bg-card text-muted-foreground hover:border-cyan-300"
                                }`}
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Se nenhum dia for selecionado, a promoção será válida todos os dias
                        </p>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      {/* Property Types */}
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Hotel className="h-5 w-5 text-violet-400" />
                          Tipos de Propriedade
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {propertyTypes.map((type) => (
                            <button
                              key={type.id}
                              onClick={() => togglePropertyType(type.id)}
                              className={`p-4 rounded-xl border-2 transition-all ${formData.selectedPropertyTypes.includes(type.id)
                                ? "border-violet-500 bg-violet-500/10"
                                : "border-border hover:border-violet-300 bg-card"
                                }`}
                            >
                              <type.icon className={`h-6 w-6 mx-auto mb-2 ${formData.selectedPropertyTypes.includes(type.id) ? "text-violet-400" : "text-muted-foreground"
                                }`} />
                              <p className="text-sm font-medium text-center">{type.label}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Usage Limits */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                        <Label className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                          <Users className="h-5 w-5 text-amber-400" />
                          Limites de Uso
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="maxUses">Usos Totais</Label>
                            <Input
                              id="maxUses"
                              type="number"
                              placeholder="Ilimitado"
                              value={formData.maxUses}
                              onChange={(e) => setFormData(prev => ({ ...prev, maxUses: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="usesPerGuest">Usos por Hóspede</Label>
                            <Input
                              id="usesPerGuest"
                              type="number"
                              min="1"
                              value={formData.usesPerGuest}
                              onChange={(e) => setFormData(prev => ({ ...prev, usesPerGuest: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Settings */}
                      <div className="space-y-4">
                        <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-emerald-500/20">
                                <Star className="h-5 w-5 text-emerald-400" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Exibir no Website</p>
                                <p className="text-sm text-muted-foreground">Mostrar promoção no motor de reservas</p>
                              </div>
                            </div>
                            <Switch
                              checked={formData.showOnWebsite}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showOnWebsite: checked }))}
                            />
                          </div>
                        </div>
                        <div className="p-5 rounded-2xl border bg-gradient-to-r from-violet-500/5 to-purple-500/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-violet-500/20">
                                <Tag className="h-5 w-5 text-violet-400" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Exigir Cupom</p>
                                <p className="text-sm text-muted-foreground">Hóspede precisa informar o código</p>
                              </div>
                            </div>
                            <Switch
                              checked={formData.requireCoupon}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requireCoupon: checked }))}
                            />
                          </div>
                        </div>
                        <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-blue-500/20">
                                <Check className="h-5 w-5 text-blue-400" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Promoção Ativa</p>
                                <p className="text-sm text-muted-foreground">Disponível para uso imediato</p>
                              </div>
                            </div>
                            <Switch
                              checked={formData.isActive}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-rose-500/5 to-pink-500/5">
                        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-rose-400" />
                          Resumo da Promoção
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 rounded-lg bg-card border">
                            <p className="text-lg font-bold text-foreground truncate">{formData.name || "-"}</p>
                            <p className="text-xs text-muted-foreground">Nome</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-card border">
                            <p className="text-2xl font-bold text-rose-400">
                              {formData.type === "fixed" ? `R$ ${formData.discountValue || "0"}` : `${formData.discountValue || "0"}%`}
                            </p>
                            <p className="text-xs text-muted-foreground">Desconto</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-card border">
                            <p className="text-lg font-bold text-foreground">{formData.code || "-"}</p>
                            <p className="text-xs text-muted-foreground">Cupom</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-card border">
                            <Badge className={formData.isActive ? "bg-emerald-500" : "bg-red-500"}>
                              {formData.isActive ? "Ativa" : "Inativa"}
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
                    className="bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 text-white shadow-lg shadow-rose-500/25"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingPromotion ? "Atualizando..." : "Cadastrando..."}
                      </>
                    ) : step < 3 ? (
                      "Continuar"
                    ) : editingPromotion ? (
                      "Atualizar Promoção"
                    ) : (
                      "Criar Promoção"
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
              Tem certeza que deseja excluir a promoção <strong>{promotionToDelete?.name}</strong>?
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                Código: {promotionToDelete?.code || "N/A"} | Cupom: {promotionToDelete?.promoCode || "N/A"}
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
