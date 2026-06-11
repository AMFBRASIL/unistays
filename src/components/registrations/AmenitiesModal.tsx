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
  Sparkles,
  Check,
  Package,
  Loader2,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface AmenitiesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const amenityCategories = [
  { id: "comfort", label: "Conforto", icon: AirVent, color: "from-blue-500 to-cyan-500" },
  { id: "entertainment", label: "Entretenimento", icon: Tv, color: "from-purple-500 to-violet-500" },
  { id: "wellness", label: "Bem-estar", icon: Waves, color: "from-emerald-500 to-green-500" },
  { id: "convenience", label: "Conveniência", icon: Coffee, color: "from-amber-500 to-orange-500" },
];

const commonAmenities = [
  { id: "wifi", icon: Wifi, label: "Wi-Fi", category: "comfort" },
  { id: "tv", icon: Tv, label: "Smart TV", category: "entertainment" },
  { id: "ac", icon: AirVent, label: "Ar Condicionado", category: "comfort" },
  { id: "coffee", icon: Coffee, label: "Cafeteira", category: "convenience" },
  { id: "bath", icon: Bath, label: "Banheira", category: "wellness" },
  { id: "parking", icon: Car, label: "Estacionamento", category: "convenience" },
  { id: "breakfast", icon: UtensilsCrossed, label: "Café da Manhã", category: "convenience" },
  { id: "gym", icon: Dumbbell, label: "Academia", category: "wellness" },
  { id: "pool", icon: Waves, label: "Piscina", category: "wellness" },
  { id: "view", icon: Mountain, label: "Vista", category: "comfort" },
];

const getCategoryLabel = (category: string) => {
  const cat = amenityCategories.find(c => c.id === category);
  return cat ? cat.label : category;
};

const getCategoryColor = (category: string) => {
  const cat = amenityCategories.find(c => c.id === category);
  return cat ? cat.color : "from-gray-500 to-gray-600";
};

// Mapear icon string para componente
const getIconComponent = (iconName: string | null | undefined) => {
  const iconMap: Record<string, React.ElementType> = {
    wifi: Wifi,
    tv: Tv,
    ac: AirVent,
    coffee: Coffee,
    bath: Bath,
    parking: Car,
    breakfast: UtensilsCrossed,
    gym: Dumbbell,
    pool: Waves,
    view: Mountain,
  };
  return iconMap[iconName || ''] || Package;
};

export function AmenitiesModal({ open, onOpenChange }: AmenitiesModalProps) {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [amenityToDelete, setAmenityToDelete] = useState<any | null>(null);
  const [editingAmenity, setEditingAmenity] = useState<any | null>(null);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    icon: "",
    description: "",
    isChargeable: false,
    price: "",
    isActive: true,
  });

  // Load data when modal opens
  useEffect(() => {
    if (open && mode === "list") {
      loadAmenities();
    }
  }, [open, mode]);

  // Filter amenities based on search term
  const filteredAmenities = useMemo(() => {
    return amenities.filter((amenity) => {
      if (!searchTerm.trim()) return true;
      const search = searchTerm.toLowerCase().trim();
      const name = (amenity.name || "").toLowerCase();
      const code = (amenity.code || "").toLowerCase();
      const description = (amenity.description || "").toLowerCase();
      return (
        name.includes(search) ||
        code.includes(search) ||
        description.includes(search)
      );
    });
  }, [amenities, searchTerm]);

  const loadAmenities = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAmenities(searchTerm || undefined);
      if (response.success && response.data?.amenities) {
        setAmenities(response.data.amenities);
      }
    } catch (error) {
      console.error("Erro ao carregar amenidades:", error);
      toast.error("Erro ao carregar amenidades");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAmenityForEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await api.getAmenityById(id);
      if (response.success && response.data) {
        const amenity = response.data;
        setEditingAmenity(amenity);
        
        setFormData({
          code: amenity.code || "",
          name: amenity.name || "",
          category: amenity.category || "",
          icon: amenity.icon || "",
          description: amenity.description || "",
          isChargeable: amenity.isChargeable || false,
          price: amenity.price?.toString() || "",
          isActive: amenity.status === "active",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar amenidade:", error);
      toast.error("Erro ao carregar dados da amenidade");
      setEditingAmenity(null);
      setMode("list");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.code.trim()) {
      toast.error("Código é obrigatório");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!formData.category) {
      toast.error("Categoria é obrigatória");
      return;
    }
    if (formData.isChargeable && (!formData.price || parseFloat(formData.price) <= 0)) {
      toast.error("Preço é obrigatório quando a amenidade é cobrável");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        category: formData.category as 'comfort' | 'entertainment' | 'wellness' | 'convenience',
        icon: formData.icon || null,
        description: formData.description.trim() || null,
        isChargeable: formData.isChargeable,
        price: formData.isChargeable ? (formData.price ? parseFloat(formData.price) : null) : null,
        status: formData.isActive ? "active" as const : "inactive" as const,
      };

      let response;
      if (editingAmenity) {
        response = await api.updateAmenity(editingAmenity.id, data);
        if (response.success) {
          toast.success("Amenidade Atualizada", {
            description: `${formData.name} foi atualizada com sucesso!`,
          });
          await loadAmenities();
          setMode("list");
          setEditingAmenity(null);
          resetForm();
        } else {
          toast.error(response.error?.message || "Erro ao atualizar amenidade");
        }
      } else {
        response = await api.createAmenity(data);
        if (response.success) {
          toast.success("Amenidade Criada", {
            description: `${formData.name} foi cadastrada com sucesso!`,
          });
          await loadAmenities();
          setMode("list");
          resetForm();
        } else {
          toast.error(response.error?.message || "Erro ao cadastrar amenidade");
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar amenidade:", error);
      toast.error("Erro ao salvar amenidade");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      code: "",
      name: "",
      category: "",
      icon: "",
      description: "",
      isChargeable: false,
      price: "",
      isActive: true,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setMode("list");
      setStep(1);
      setEditingAmenity(null);
      setSearchTerm("");
      resetForm();
    }, 300);
  };

  const handleNewClick = () => {
    setEditingAmenity(null);
    setMode("create");
    setStep(1);
    setSearchTerm("");
    resetForm();
  };

  const handleEditClick = (amenity: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingAmenity(amenity);
    setMode("edit");
    setStep(1);
    loadAmenityForEdit(amenity.id);
  };

  const handleBackToList = () => {
    setMode("list");
    setStep(1);
    setEditingAmenity(null);
    resetForm();
    loadAmenities();
  };

  const handleDeleteClick = (amenity: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAmenityToDelete(amenity);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!amenityToDelete) return;

    try {
      setIsDeleting(true);
      const response = await api.deleteAmenity(amenityToDelete.id);

      if (response.success) {
        toast.success("Amenidade Excluída", {
          description: `${amenityToDelete.name} foi excluída com sucesso!`,
        });
        setDeleteDialogOpen(false);
        setAmenityToDelete(null);
        await loadAmenities();
      } else {
        toast.error(response.error?.message || "Erro ao excluir amenidade");
      }
    } catch (error) {
      console.error("Erro ao excluir amenidade:", error);
      toast.error("Erro ao excluir amenidade");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setAmenityToDelete(null);
  };

  const filteredCommonAmenities = formData.category 
    ? commonAmenities.filter(a => a.category === formData.category)
    : commonAmenities;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className={`${mode === "list" ? "max-w-7xl" : "max-w-6xl"} max-h-[95vh] p-0 gap-0 overflow-hidden flex flex-col`}>
          {/* Header */}
          <div className="relative px-6 py-5 border-b bg-gradient-to-r from-sky-500/10 via-cyan-500/10 to-sky-500/10 flex-shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
              <svg viewBox="0 0 200 200" className="w-full h-full text-sky-500">
                <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
                <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
              </svg>
            </div>
            
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
              <Wifi className="h-24 w-24 text-sky-500" />
            </div>

            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-sky-500 to-cyan-500">
                    <Wifi className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {mode === "list" 
                        ? "Amenidades" 
                        : mode === "edit"
                        ? "Editar Amenidade"
                        : "Nova Amenidade"}
                    </DialogTitle>
                    <p className="text-sm font-normal text-sky-600">
                      {mode === "list" 
                        ? "Gerencie as amenidades cadastradas" 
                        : mode === "edit"
                        ? "Edite as informações da amenidade"
                        : "Cadastre uma nova comodidade ou amenidade"}
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
                            ? "bg-sky-600 text-white"
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
                        <h3 className="text-lg font-semibold">Amenidades Cadastradas</h3>
                        <p className="text-sm text-muted-foreground">
                          {filteredAmenities.length} de {amenities.length} {amenities.length === 1 ? "amenidade cadastrada" : "amenidades cadastradas"}
                        </p>
                      </div>
                      <Button
                        onClick={handleNewClick}
                        className="bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Amenidade
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
                      <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                    </div>
                  ) : amenities.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <Wifi className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhuma amenidade cadastrada</p>
                      <Button onClick={handleNewClick} className="mt-4" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar Primeira Amenidade
                      </Button>
                    </div>
                  ) : filteredAmenities.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhuma amenidade encontrada com o termo "{searchTerm}"</p>
                    </div>
                  ) : (
                    /* Amenities List - Table */
                    <div className="border rounded-lg overflow-hidden">
                      <ScrollArea className="h-[calc(95vh-280px)]">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted/50 border-b sticky top-0 z-10">
                              <tr>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Amenidade</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Categoria</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Preço</th>
                                <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {filteredAmenities.map((amenity) => {
                                const IconComponent = getIconComponent(amenity.icon);
                                return (
                                  <tr 
                                    key={amenity.id} 
                                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                                    onClick={() => handleEditClick(amenity)}
                                  >
                                    <td className="p-3">
                                      <div className="flex items-center gap-2">
                                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                          <span className="font-medium text-sm block">{amenity.name}</span>
                                          {amenity.code && (
                                            <span className="text-xs text-muted-foreground">Código: {amenity.code}</span>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <Badge 
                                        className="text-white border-0 shadow-sm"
                                        style={{
                                          background: `linear-gradient(to right, ${getCategoryColor(amenity.category).replace('from-', '').replace('to-', ', ').replace(' ', '')})`,
                                        }}
                                      >
                                        {getCategoryLabel(amenity.category)}
                                      </Badge>
                                    </td>
                                    <td className="p-3">
                                      {amenity.isChargeable ? (
                                        <span className="text-sm font-semibold text-sky-600">
                                          R$ {amenity.price?.toFixed(2).replace('.', ',') || "0,00"}
                                        </span>
                                      ) : (
                                        <Badge variant="outline" className="border-green-500 text-green-600">
                                          Gratuito
                                        </Badge>
                                      )}
                                    </td>
                                    <td className="p-3 text-center">
                                      <Badge className={amenity.status === "active" ? "bg-emerald-500" : "bg-gray-500"}>
                                        {amenity.status === "active" ? "Ativa" : "Inativa"}
                                      </Badge>
                                    </td>
                                    <td className="p-3">
                                      <div className="flex items-center justify-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => handleEditClick(amenity, e)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                          onClick={(e) => handleDeleteClick(amenity, e)}
                                          disabled={isDeleting}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
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
                  <aside className="rounded-2xl border border-border bg-gradient-to-b from-sky-500/10 via-cyan-500/10 to-background overflow-hidden">
                    <div className="p-5 border-b border-border/60 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.2),transparent_40%)]">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 shadow">
                          <Wifi className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">Cadastro de Amenidade</p>
                          <p className="text-xs text-muted-foreground">
                            {editingAmenity ? "Edição avançada" : "Novo cadastro"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-sky-500 to-cyan-600 transition-all"
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
                            {s === 1 ? "1. Categoria e dados principais" : "2. Preço e revisão"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s === 1
                              ? "Escolha categoria e preencha os dados base."
                              : "Configure cobrança, status e valide resumo."}
                          </p>
                        </button>
                      ))}
                    </div>
                  </aside>

                  <div className="space-y-6">
                  {step === 1 && (
                    <div className="space-y-6">
                      {/* Category Selection */}
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Package className="h-5 w-5 text-sky-400" />
                          Categoria *
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {amenityCategories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                              <button
                                key={cat.id}
                                onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  formData.category === cat.id
                                    ? "border-sky-500 bg-sky-500/10"
                                    : "border-border hover:border-sky-300 bg-card"
                                }`}
                              >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${cat.color} flex items-center justify-center mx-auto mb-3`}>
                                  <Icon className="h-6 w-6 text-white" />
                                </div>
                                <p className="font-medium text-foreground text-center text-sm">{cat.label}</p>
                                {formData.category === cat.id && (
                                  <div className="flex justify-center mt-2">
                                    <CheckCircle2 className="h-4 w-4 text-sky-400" />
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
                            placeholder="Ex: AME-WIFI-01"
                            value={formData.code}
                            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome da Amenidade *</Label>
                          <Input
                            id="name"
                            placeholder="Ex: Wi-Fi de Alta Velocidade"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-background"
                          />
                        </div>
                      </div>

                      {/* Common Amenities Quick Select */}
                      {formData.category && (
                        <div className="p-5 rounded-2xl border bg-gradient-to-r from-sky-500/5 to-cyan-500/5">
                          <Label className="text-base font-semibold mb-4 block">Amenidades Comuns</Label>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {filteredCommonAmenities.map((amenity) => {
                              const Icon = amenity.icon;
                              return (
                                <button
                                  key={amenity.id}
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      name: amenity.label,
                                      icon: amenity.id,
                                    }));
                                  }}
                                  className={`p-3 rounded-xl border-2 transition-all ${
                                    formData.icon === amenity.id
                                      ? "border-sky-500 bg-sky-500/10"
                                      : "border-border hover:border-sky-300 bg-card"
                                  }`}
                                >
                                  <Icon className={`h-5 w-5 mx-auto mb-2 ${
                                    formData.icon === amenity.id ? "text-sky-400" : "text-muted-foreground"
                                  }`} />
                                  <p className="text-xs font-medium text-center">{amenity.label}</p>
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-xs text-muted-foreground mt-3">
                            Selecione uma amenidade comum ou preencha manualmente acima
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          placeholder="Descreva a amenidade e seus benefícios..."
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="bg-background min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      {/* Pricing */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                              <DollarSign className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">Cobrança</Label>
                              <p className="text-xs text-muted-foreground">Esta amenidade é cobrada?</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.isChargeable}
                            onCheckedChange={(checked) => {
                              setFormData(prev => ({ 
                                ...prev, 
                                isChargeable: checked,
                                // Limpar preço se não for cobrável
                                price: checked ? prev.price : "",
                              }));
                            }}
                          />
                        </div>
                        {formData.isChargeable && (
                          <div className="space-y-2">
                            <Label htmlFor="price">Valor (R$) *</Label>
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
                        )}
                      </div>

                      {/* Status */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                              <Check className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Amenidade Ativa</p>
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
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-sky-500/5 to-cyan-500/5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500">
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
                              {amenityCategories.find(c => c.id === formData.category)?.label || "-"}
                            </p>
                            <p className="text-xs text-muted-foreground">Categoria</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-card border">
                            <p className="text-lg font-bold text-foreground">
                              {formData.isChargeable 
                                ? `R$ ${formData.price || "0,00"}`
                                : "Gratuito"}
                            </p>
                            <p className="text-xs text-muted-foreground">Preço</p>
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
                    className="bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 text-white shadow-lg shadow-sky-500/25"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingAmenity ? "Atualizando..." : "Criando..."}
                      </>
                    ) : step < 2 ? (
                      "Continuar"
                    ) : editingAmenity ? (
                      "Atualizar Amenidade"
                    ) : (
                      "Criar Amenidade"
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
              Tem certeza que deseja excluir a amenidade <strong>{amenityToDelete?.name}</strong>?
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                Código: {amenityToDelete?.code} | Categoria: {amenityToDelete ? getCategoryLabel(amenityToDelete.category) : "N/A"}
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
