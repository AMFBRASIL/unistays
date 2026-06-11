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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Utensils,
  UtensilsCrossed,
  DollarSign,
  Clock,
  Sparkles,
  Check,
  Users,
  Loader2,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface MealsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mealTypes = [
  { id: "breakfast", label: "Café da Manhã", icon: Utensils, color: "from-amber-500 to-orange-500", time: "07:00 - 10:00" },
  { id: "lunch", label: "Almoço", icon: UtensilsCrossed, color: "from-red-500 to-rose-500", time: "12:00 - 14:00" },
  { id: "dinner", label: "Jantar", icon: UtensilsCrossed, color: "from-purple-500 to-violet-500", time: "19:00 - 21:00" },
  { id: "snack", label: "Lanche", icon: Utensils, color: "from-cyan-500 to-blue-500", time: "15:00 - 17:00" },
  { id: "brunch", label: "Brunch", icon: UtensilsCrossed, color: "from-green-500 to-emerald-500", time: "10:00 - 12:00" },
];

const servingTypes = [
  { id: "buffet", label: "Buffet", description: "Serviço self-service" },
  { id: "a_la_carte", label: "À La Carte", description: "Cardápio à la carte" },
  { id: "room_service", label: "Room Service", description: "Serviço no quarto" },
];

const getMealTypeLabel = (type: string) => {
  const meal = mealTypes.find(m => m.id === type);
  return meal ? meal.label : type;
};

const getMealTypeColor = (type: string) => {
  const meal = mealTypes.find(m => m.id === type);
  return meal ? meal.color : "from-gray-500 to-gray-600";
};

const getServingTypeLabel = (type: string) => {
  const serving = servingTypes.find(s => s.id === type);
  return serving ? serving.label : type;
};

export function MealsModal({ open, onOpenChange }: MealsModalProps) {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<any | null>(null);
  const [editingMeal, setEditingMeal] = useState<any | null>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    propertyId: null as number | null,
    code: "",
    name: "",
    mealType: "",
    servingType: "",
    description: "",
    price: "",
    pricePerPerson: true,
    startTime: "",
    endTime: "",
    isActive: true,
  });

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadProperties();
      if (mode === "list") {
        loadMeals();
      }
    }
  }, [open, mode]);

  // Filter meals based on search term
  const filteredMeals = useMemo(() => {
    return meals.filter((meal) => {
      if (!searchTerm.trim()) return true;
      const search = searchTerm.toLowerCase().trim();
      const name = (meal.name || "").toLowerCase();
      const code = (meal.code || "").toLowerCase();
      const description = (meal.description || "").toLowerCase();
      return (
        name.includes(search) ||
        code.includes(search) ||
        description.includes(search)
      );
    });
  }, [meals, searchTerm]);

  const loadProperties = async () => {
    try {
      const response = await api.getProperties();
      if (response.success && response.data?.properties) {
        setProperties(response.data.properties);
        if (response.data.properties.length > 0 && !selectedPropertyId) {
          setSelectedPropertyId(response.data.properties[0].id);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar propriedades:", error);
    }
  };

  const loadMeals = async () => {
    try {
      setIsLoading(true);
      const response = await api.getMeals(searchTerm || undefined, selectedPropertyId || undefined);
      if (response.success && response.data?.meals) {
        setMeals(response.data.meals);
      }
    } catch (error) {
      console.error("Erro ao carregar refeições:", error);
      toast.error("Erro ao carregar refeições");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMealForEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await api.getMealById(id);
      if (response.success && response.data) {
        const meal = response.data;
        setEditingMeal(meal);
        
        setFormData({
          propertyId: meal.propertyId || null,
          code: meal.code || "",
          name: meal.name || "",
          mealType: meal.mealType || "",
          servingType: meal.servingType || "",
          description: meal.description || "",
          price: meal.price?.toString() || "",
          pricePerPerson: meal.pricePerPerson !== false,
          startTime: meal.startTime || "",
          endTime: meal.endTime || "",
          isActive: meal.status === "active",
        });
        
        if (meal.propertyId) {
          setSelectedPropertyId(meal.propertyId);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar refeição:", error);
      toast.error("Erro ao carregar dados da refeição");
      setEditingMeal(null);
      setMode("list");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.propertyId) {
      toast.error("Propriedade é obrigatória");
      return;
    }
    if (!formData.code.trim()) {
      toast.error("Código é obrigatório");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!formData.mealType) {
      toast.error("Tipo de refeição é obrigatório");
      return;
    }
    if (!formData.servingType) {
      toast.error("Tipo de serviço é obrigatório");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Preço é obrigatório e deve ser maior que zero");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = {
        propertyId: formData.propertyId,
        code: formData.code.trim(),
        name: formData.name.trim(),
        mealType: formData.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'brunch',
        servingType: formData.servingType as 'buffet' | 'a_la_carte' | 'room_service',
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        pricePerPerson: formData.pricePerPerson,
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
        status: formData.isActive ? "active" as const : "inactive" as const,
      };

      let response;
      if (editingMeal) {
        response = await api.updateMeal(editingMeal.id, data);
        if (response.success) {
          toast.success("Refeição Atualizada", {
            description: `${formData.name} foi atualizada com sucesso!`,
          });
          await loadMeals();
          setMode("list");
          setEditingMeal(null);
          resetForm();
        } else {
          toast.error(response.error?.message || "Erro ao atualizar refeição");
        }
      } else {
        response = await api.createMeal(data);
        if (response.success) {
          toast.success("Refeição Criada", {
            description: `${formData.name} foi cadastrada com sucesso!`,
          });
          await loadMeals();
          setMode("list");
          resetForm();
        } else {
          toast.error(response.error?.message || "Erro ao cadastrar refeição");
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar refeição:", error);
      toast.error("Erro ao salvar refeição");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      propertyId: selectedPropertyId,
      code: "",
      name: "",
      mealType: "",
      servingType: "",
      description: "",
      price: "",
      pricePerPerson: true,
      startTime: "",
      endTime: "",
      isActive: true,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setMode("list");
      setStep(1);
      setEditingMeal(null);
      setSearchTerm("");
      resetForm();
    }, 300);
  };

  const handleNewClick = () => {
    setEditingMeal(null);
    setMode("create");
    setStep(1);
    setSearchTerm("");
    resetForm();
  };

  const handleEditClick = (meal: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingMeal(meal);
    setMode("edit");
    setStep(1);
    loadMealForEdit(meal.id);
  };

  const handleBackToList = () => {
    setMode("list");
    setStep(1);
    setEditingMeal(null);
    resetForm();
    loadMeals();
  };

  const handleDeleteClick = (meal: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setMealToDelete(meal);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!mealToDelete) return;

    try {
      setIsDeleting(true);
      const response = await api.deleteMeal(mealToDelete.id);

      if (response.success) {
        toast.success("Refeição Excluída", {
          description: `${mealToDelete.name} foi excluída com sucesso!`,
        });
        setDeleteDialogOpen(false);
        setMealToDelete(null);
        await loadMeals();
      } else {
        toast.error(response.error?.message || "Erro ao excluir refeição");
      }
    } catch (error) {
      console.error("Erro ao excluir refeição:", error);
      toast.error("Erro ao excluir refeição");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setMealToDelete(null);
  };

  // Auto-set propertyId when property is selected
  useEffect(() => {
    if (selectedPropertyId && mode === "create") {
      setFormData(prev => ({ ...prev, propertyId: selectedPropertyId }));
    }
  }, [selectedPropertyId, mode]);

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className={`${mode === "list" ? "max-w-7xl" : "max-w-6xl"} max-h-[95vh] p-0 gap-0 overflow-hidden flex flex-col`}>
          {/* Header */}
          <div className="relative px-6 py-5 border-b bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-yellow-500/10 flex-shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
              <svg viewBox="0 0 200 200" className="w-full h-full text-yellow-500">
                <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
                <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
              </svg>
            </div>
            
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
              <UtensilsCrossed className="h-24 w-24 text-yellow-500" />
            </div>

            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-yellow-500 to-amber-500">
                    <UtensilsCrossed className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {mode === "list" 
                        ? "Refeições" 
                        : mode === "edit"
                        ? "Editar Refeição"
                        : "Nova Refeição"}
                    </DialogTitle>
                    <p className="text-sm font-normal text-yellow-600">
                      {mode === "list" 
                        ? "Gerencie as refeições cadastradas" 
                        : mode === "edit"
                        ? "Edite as informações da refeição"
                        : "Cadastre uma opção de alimentação"}
                    </p>
                  </div>
                </div>
                {(mode === "create" || mode === "edit") && (
                  <div className="flex gap-2">
                    {[1, 2].map((s) => (
                      <div
                        key={s}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          step === s
                            ? "bg-yellow-600 text-white"
                            : step > s
                            ? "bg-emerald-500 text-white"
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

          <ScrollArea className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {mode === "list" ? (
                /* LIST MODE */
                <div className="space-y-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Refeições Cadastradas</h3>
                        <p className="text-sm text-muted-foreground">
                          {filteredMeals.length} de {meals.length} {meals.length === 1 ? "refeição cadastrada" : "refeições cadastradas"}
                        </p>
                      </div>
                      <Button
                        onClick={handleNewClick}
                        className="bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-700 hover:to-amber-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Refeição
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
                      <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                    </div>
                  ) : meals.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhuma refeição cadastrada</p>
                      <Button onClick={handleNewClick} className="mt-4" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar Primeira Refeição
                      </Button>
                    </div>
                  ) : filteredMeals.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhuma refeição encontrada com o termo "{searchTerm}"</p>
                    </div>
                  ) : (
                    /* Meals List - Table */
                    <div className="border rounded-lg overflow-hidden">
                      <ScrollArea className="h-[calc(95vh-280px)]">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted/50 border-b sticky top-0 z-10">
                              <tr>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Refeição</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Tipo</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Serviço</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Preço</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Horário</th>
                                <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {filteredMeals.map((meal) => (
                                <tr 
                                  key={meal.id} 
                                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                                  onClick={() => handleEditClick(meal)}
                                >
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <span className="font-medium text-sm block">{meal.name}</span>
                                        {meal.code && (
                                          <span className="text-xs text-muted-foreground">Código: {meal.code}</span>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <Badge 
                                      className="text-white border-0 shadow-sm"
                                      style={{
                                        background: `linear-gradient(to right, ${getMealTypeColor(meal.mealType).replace('from-', '').replace('to-', ', ').replace(' ', '')})`,
                                      }}
                                    >
                                      {getMealTypeLabel(meal.mealType)}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-sm text-muted-foreground">
                                      {getServingTypeLabel(meal.servingType)}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <div>
                                      <span className="text-sm font-semibold text-yellow-600">
                                        R$ {meal.price?.toFixed(2).replace('.', ',') || "0,00"}
                                      </span>
                                      {meal.pricePerPerson && (
                                        <span className="text-xs text-muted-foreground block">por pessoa</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    {meal.startTime && meal.endTime ? (
                                      <span className="text-sm text-muted-foreground">
                                        {meal.startTime} - {meal.endTime}
                                      </span>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">-</span>
                                    )}
                                  </td>
                                  <td className="p-3 text-center">
                                    <Badge className={meal.status === "active" ? "bg-emerald-500" : "bg-gray-500"}>
                                      {meal.status === "active" ? "Ativa" : "Inativa"}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center justify-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleEditClick(meal, e)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={(e) => handleDeleteClick(meal, e)}
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
                /* CREATE/EDIT MODE */
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                  <aside className="rounded-2xl border border-border bg-gradient-to-b from-yellow-500/10 via-amber-500/10 to-background overflow-hidden">
                    <div className="p-5 border-b border-border/60 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.2),transparent_40%)]">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 shadow">
                          <UtensilsCrossed className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">Cadastro de Refeição</p>
                          <p className="text-xs text-muted-foreground">
                            {editingMeal ? "Edição avançada" : "Novo cadastro"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 transition-all"
                            style={{ width: `${step === 1 ? 50 : 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Etapa {step} de 2</p>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {[1, 2].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStep(s)}
                          className={`w-full rounded-xl border p-3 text-left transition ${
                            step === s ? "bg-primary/10 border-primary/30" : "bg-card border-border/60"
                          }`}
                        >
                          <p className="text-sm font-medium">
                            {s === 1 ? "1. Tipo e dados principais" : "2. Serviço, preço e revisão"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s === 1
                              ? "Selecione o tipo de refeição e dados base."
                              : "Configure valor, horário e status final."}
                          </p>
                        </button>
                      ))}
                    </div>
                  </aside>

                  <div className="space-y-6">
                    {step === 1 && (
                    <div className="space-y-6">
                      {/* Property Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="property">Propriedade *</Label>
                        <Select
                          value={selectedPropertyId?.toString() || ""}
                          onValueChange={(value) => {
                            const propId = parseInt(value, 10);
                            setSelectedPropertyId(propId);
                            setFormData(prev => ({ ...prev, propertyId: propId }));
                          }}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Selecione uma propriedade" />
                          </SelectTrigger>
                          <SelectContent>
                            {properties.map((property) => (
                              <SelectItem key={property.id} value={property.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  {property.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Meal Type Selection */}
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Utensils className="h-5 w-5 text-yellow-400" />
                          Tipo de Refeição *
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {mealTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                              <button
                                key={type.id}
                                onClick={() => {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    mealType: type.id,
                                    startTime: type.time.split(" - ")[0],
                                    endTime: type.time.split(" - ")[1],
                                  }));
                                }}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  formData.mealType === type.id
                                    ? "border-yellow-500 bg-yellow-500/10"
                                    : "border-border hover:border-yellow-300 bg-card"
                                }`}
                              >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center mx-auto mb-3`}>
                                  <Icon className="h-6 w-6 text-white" />
                                </div>
                                <p className="font-medium text-foreground text-center text-sm">{type.label}</p>
                                <p className="text-xs text-muted-foreground text-center mt-1">{type.time}</p>
                                {formData.mealType === type.id && (
                                  <div className="flex justify-center mt-2">
                                    <CheckCircle2 className="h-4 w-4 text-yellow-400" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="code">Código *</Label>
                          <Input
                            id="code"
                            placeholder="Ex: CF-COMP-01"
                            value={formData.code}
                            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome da Refeição *</Label>
                          <Input
                            id="name"
                            placeholder="Ex: Café da Manhã Completo"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-background"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          placeholder="Descreva a refeição e seus itens..."
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="bg-background min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}

                    {step === 2 && (
                    <div className="space-y-6">
                      {/* Serving Type */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-orange-500/5 to-amber-500/5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Tipo de Serviço *</Label>
                            <p className="text-xs text-muted-foreground">Forma de servir a refeição</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {servingTypes.map((type) => (
                            <button
                              key={type.id}
                              onClick={() => setFormData(prev => ({ ...prev, servingType: type.id }))}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${
                                formData.servingType === type.id
                                  ? "border-orange-500 bg-orange-500/10"
                                  : "border-border hover:border-orange-300 bg-card"
                              }`}
                            >
                              <p className="font-semibold text-foreground text-sm">{type.label}</p>
                              <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                              {formData.servingType === type.id && (
                                <div className="flex justify-end mt-2">
                                  <CheckCircle2 className="h-4 w-4 text-orange-400" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-green-500/5 to-emerald-500/5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                            <DollarSign className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Preço *</Label>
                            <p className="text-xs text-muted-foreground">Valor da refeição</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price" className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-400" />
                              {formData.pricePerPerson ? "Preço por Pessoa (R$) *" : "Preço Total (R$) *"}
                            </Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0,00"
                              value={formData.price}
                              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
                          <div className="flex items-end">
                            <div className="p-5 rounded-2xl border bg-card w-full">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="text-sm font-medium">Por Pessoa</Label>
                                  <p className="text-xs text-muted-foreground">Cobrar individualmente</p>
                                </div>
                                <Switch
                                  checked={formData.pricePerPerson}
                                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, pricePerPerson: checked }))}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Time Range */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Horário de Serviço</Label>
                            <p className="text-xs text-muted-foreground">Período de disponibilidade</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="startTime">Horário Início</Label>
                            <Input
                              id="startTime"
                              type="time"
                              value={formData.startTime}
                              onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endTime">Horário Fim</Label>
                            <Input
                              id="endTime"
                              type="time"
                              value={formData.endTime}
                              onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                              <Check className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Refeição Ativa</p>
                              <p className="text-sm text-muted-foreground">Disponível para seleção</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                          />
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-yellow-500/5 to-amber-500/5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-foreground">Resumo</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 rounded-lg bg-card border">
                            <p className="text-lg font-bold text-foreground truncate">{formData.name || "-"}</p>
                            <p className="text-xs text-muted-foreground">Nome</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-card border">
                            <p className="text-lg font-bold text-foreground capitalize">
                              {mealTypes.find(t => t.id === formData.mealType)?.label || "-"}
                            </p>
                            <p className="text-xs text-muted-foreground">Tipo</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-card border">
                            <p className="text-lg font-bold text-foreground">R$ {formData.price || "0,00"}</p>
                            <p className="text-xs text-muted-foreground">
                              {formData.pricePerPerson ? "Por Pessoa" : "Total"}
                            </p>
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
                  </div>
                </div>
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
                  onClick={handleBackToList}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => step > 1 ? setStep(step - 1) : handleBackToList()}
                    disabled={isSubmitting}
                  >
                    {step > 1 ? "Anterior" : "Cancelar"}
                  </Button>
                  <Button
                    onClick={() => step < 2 ? setStep(step + 1) : handleSubmit()}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-700 hover:to-amber-600 text-white shadow-lg shadow-yellow-500/25"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingMeal ? "Atualizando..." : "Criando..."}
                      </>
                    ) : step < 2 ? (
                      "Continuar"
                    ) : editingMeal ? (
                      "Atualizar Refeição"
                    ) : (
                      "Criar Refeição"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a refeição <strong>{mealToDelete?.name}</strong>?
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                Código: {mealToDelete?.code} | Tipo: {mealToDelete ? getMealTypeLabel(mealToDelete.mealType) : "N/A"}
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
