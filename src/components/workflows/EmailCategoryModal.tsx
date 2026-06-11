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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  FolderPlus,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Calendar,
  UserCheck,
  CreditCard,
  Bell,
  Gift,
  Star,
  MessageSquare,
  Settings2,
  Mail,
  Sparkles,
  ShoppingBag,
  Heart,
  Plane,
  Coffee,
  Utensils,
  Car,
  Briefcase,
  GraduationCap,
  Music,
  Camera,
  Gamepad2,
  Palette,
  Code2,
  Zap,
  Shield,
  Award,
  Target,
  TrendingUp,
  Users,
  Home,
  Building2,
  MapPin,
  Clock,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface EmailCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: EmailCategory[];
  onCategoriesChange: (categories: EmailCategory[]) => void;
}

export interface EmailCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  isSystem: boolean;
  templateCount: number;
}

const availableIcons = [
  { id: "Calendar", icon: Calendar, label: "Calendário" },
  { id: "UserCheck", icon: UserCheck, label: "Check-in" },
  { id: "CreditCard", icon: CreditCard, label: "Pagamento" },
  { id: "Bell", icon: Bell, label: "Notificação" },
  { id: "Gift", icon: Gift, label: "Presente" },
  { id: "Star", icon: Star, label: "Estrela" },
  { id: "MessageSquare", icon: MessageSquare, label: "Mensagem" },
  { id: "Settings2", icon: Settings2, label: "Sistema" },
  { id: "Mail", icon: Mail, label: "E-mail" },
  { id: "Sparkles", icon: Sparkles, label: "Destaque" },
  { id: "ShoppingBag", icon: ShoppingBag, label: "Compras" },
  { id: "Heart", icon: Heart, label: "Favorito" },
  { id: "Plane", icon: Plane, label: "Viagem" },
  { id: "Coffee", icon: Coffee, label: "Café" },
  { id: "Utensils", icon: Utensils, label: "Restaurante" },
  { id: "Car", icon: Car, label: "Transporte" },
  { id: "Briefcase", icon: Briefcase, label: "Negócios" },
  { id: "GraduationCap", icon: GraduationCap, label: "Educação" },
  { id: "Music", icon: Music, label: "Eventos" },
  { id: "Camera", icon: Camera, label: "Fotos" },
  { id: "Gamepad2", icon: Gamepad2, label: "Lazer" },
  { id: "Palette", icon: Palette, label: "Design" },
  { id: "Code2", icon: Code2, label: "Técnico" },
  { id: "Zap", icon: Zap, label: "Rápido" },
  { id: "Shield", icon: Shield, label: "Segurança" },
  { id: "Award", icon: Award, label: "Prêmio" },
  { id: "Target", icon: Target, label: "Meta" },
  { id: "TrendingUp", icon: TrendingUp, label: "Crescimento" },
  { id: "Users", icon: Users, label: "Grupo" },
  { id: "Home", icon: Home, label: "Casa" },
  { id: "Building2", icon: Building2, label: "Empresa" },
  { id: "MapPin", icon: MapPin, label: "Localização" },
  { id: "Clock", icon: Clock, label: "Horário" },
];

const availableColors = [
  { id: "blue", color: "text-blue-400", bgColor: "bg-blue-500/10", label: "Azul" },
  { id: "emerald", color: "text-emerald-400", bgColor: "bg-emerald-500/10", label: "Verde" },
  { id: "amber", color: "text-amber-400", bgColor: "bg-amber-500/10", label: "Âmbar" },
  { id: "violet", color: "text-violet-400", bgColor: "bg-violet-500/10", label: "Violeta" },
  { id: "pink", color: "text-pink-400", bgColor: "bg-pink-500/10", label: "Rosa" },
  { id: "yellow", color: "text-yellow-400", bgColor: "bg-yellow-500/10", label: "Amarelo" },
  { id: "cyan", color: "text-cyan-400", bgColor: "bg-cyan-500/10", label: "Ciano" },
  { id: "slate", color: "text-slate-400", bgColor: "bg-slate-500/10", label: "Cinza" },
  { id: "red", color: "text-red-400", bgColor: "bg-red-500/10", label: "Vermelho" },
  { id: "orange", color: "text-orange-400", bgColor: "bg-orange-500/10", label: "Laranja" },
  { id: "teal", color: "text-teal-400", bgColor: "bg-teal-500/10", label: "Teal" },
  { id: "indigo", color: "text-indigo-400", bgColor: "bg-indigo-500/10", label: "Índigo" },
  { id: "purple", color: "text-purple-400", bgColor: "bg-purple-500/10", label: "Roxo" },
  { id: "rose", color: "text-rose-400", bgColor: "bg-rose-500/10", label: "Rosé" },
  { id: "lime", color: "text-lime-400", bgColor: "bg-lime-500/10", label: "Lima" },
  { id: "fuchsia", color: "text-fuchsia-400", bgColor: "bg-fuchsia-500/10", label: "Fúcsia" },
];

/** Converte categoria da API para o formato do modal */
function apiCategoryToModal(c: { id: string; name: string; description?: string | null; icon?: string; color?: string; bgColor?: string; templateCount?: number }): EmailCategory {
  return {
    id: c.id,
    name: c.name,
    description: c.description ?? "",
    icon: c.icon ?? "Mail",
    color: c.color ?? "text-blue-400",
    bgColor: c.bgColor ?? "bg-blue-500/10",
    isSystem: false,
    templateCount: c.templateCount ?? 0,
  };
}

export function EmailCategoryModal({ 
  open, 
  onOpenChange, 
  categories, 
  onCategoriesChange,
}: EmailCategoryModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EmailCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "Calendar",
    colorId: "blue",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "Calendar",
      colorId: "blue",
    });
    setErrors({});
    setEditingCategory(null);
  };

  const handleNewCategory = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleEditCategory = (category: EmailCategory) => {
    setEditingCategory(category);
    const colorMatch = availableColors.find(c => c.color === category.color);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      colorId: colorMatch?.id || "blue",
    });
    setIsEditing(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (formData.name.length > 50) {
      newErrors.name = "Nome deve ter no máximo 50 caracteres";
    }
    
    if (formData.description.length > 200) {
      newErrors.description = "Descrição deve ter no máximo 200 caracteres";
    }

    // Check for duplicate names (excluding current editing category)
    const existingCategory = categories.find(
      c => c.name.toLowerCase() === formData.name.toLowerCase() && c.id !== editingCategory?.id
    );
    if (existingCategory) {
      newErrors.name = "Já existe uma categoria com este nome";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveCategory = async () => {
    if (!validateForm()) return;

    const selectedColor = availableColors.find(c => c.id === formData.colorId)!;
    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        icon: formData.icon,
        color: selectedColor.color,
        bgColor: selectedColor.bgColor,
      };

      if (editingCategory) {
        const res = await api.updateEmailTemplateCategory(editingCategory.id, payload);
        if (res.success && res.data?.category) {
          const cat = apiCategoryToModal(res.data.category as Parameters<typeof apiCategoryToModal>[0]);
          onCategoriesChange(categories.map(c => (c.id === editingCategory.id ? cat : c)));
          toast.success("Categoria atualizada com sucesso");
        } else {
          toast.error(res.error?.message ?? "Erro ao atualizar categoria");
          return;
        }
      } else {
        const res = await api.createEmailTemplateCategory(payload);
        if (res.success && res.data?.category) {
          const cat = apiCategoryToModal(res.data.category as Parameters<typeof apiCategoryToModal>[0]);
          onCategoriesChange([...categories, cat]);
          toast.success("Categoria criada com sucesso");
        } else {
          toast.error(res.error?.message ?? "Erro ao criar categoria");
          return;
        }
      }
      setIsEditing(false);
      resetForm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar categoria");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category?.isSystem) return;
    if ((category?.templateCount ?? 0) > 0) {
      toast.error("Não é possível excluir categoria com templates vinculados");
      return;
    }
    setSaving(true);
    try {
      const res = await api.deleteEmailTemplateCategory(categoryId);
      if (res.success) {
        onCategoriesChange(categories.filter(c => c.id !== categoryId));
        toast.success("Categoria removida com sucesso");
      } else {
        toast.error(res.error?.message ?? "Erro ao remover categoria");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao remover categoria");
    } finally {
      setSaving(false);
    }
  };

  const getIconComponent = (iconId: string) => {
    const iconData = availableIcons.find(i => i.id === iconId);
    return iconData?.icon || Calendar;
  };

  const renderCategoriesList = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Categorias Cadastradas</h3>
          <p className="text-sm text-muted-foreground">{categories.length} categorias no sistema</p>
        </div>
        <Button onClick={handleNewCategory} className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="p-12 text-center border border-dashed border-border rounded-xl">
          <div className="p-4 rounded-full bg-muted/30 w-fit mx-auto mb-4">
            <FolderPlus className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma categoria cadastrada</h3>
          <p className="text-muted-foreground mb-4">Crie sua primeira categoria para organizar os templates de e-mail</p>
          <Button onClick={handleNewCategory} className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Categoria
          </Button>
        </div>
      )}

      {/* Categories Grid */}
      {categories.length > 0 && (
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-2 gap-4 pr-4">
            {categories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              return (
                <div
                  key={category.id}
                  className="p-4 rounded-xl bg-card/50 border border-border hover:border-primary/30 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-lg ${category.bgColor}`}>
                      <IconComponent className={`h-5 w-5 ${category.color}`} />
                    </div>
                    <div className="flex items-center gap-1">
                      {category.isSystem && (
                        <Badge variant="secondary" className="text-xs">Sistema</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {category.templateCount} templates
                      </Badge>
                    </div>
                  </div>

                  <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {category.description || "Sem descrição"}
                  </p>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleEditCategory(category)}
                      disabled={category.isSystem || saving}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-destructive"
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={category.isSystem || (category.templateCount ?? 0) > 0 || saving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );

  const renderCategoryForm = () => {
    const selectedColor = availableColors.find(c => c.id === formData.colorId)!;
    const IconComponent = getIconComponent(formData.icon);

    return (
      <div className="space-y-6">
        <h3 className="font-semibold text-foreground">
          {editingCategory ? "Editar Categoria" : "Nova Categoria"}
        </h3>

        {/* Preview */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground mb-2">Pré-visualização</p>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${selectedColor.bgColor}`}>
              <IconComponent className={`h-6 w-6 ${selectedColor.color}`} />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{formData.name || "Nome da Categoria"}</h4>
              <p className="text-sm text-muted-foreground">{formData.description || "Descrição da categoria"}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="category-name">Nome da Categoria *</Label>
            <Input
              id="category-name"
              placeholder="Ex: Reservas, Marketing, Notificações..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? "border-destructive" : ""}
              maxLength={50}
            />
            {errors.name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
            <p className="text-xs text-muted-foreground">{formData.name.length}/50 caracteres</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="category-description">Descrição</Label>
            <Textarea
              id="category-description"
              placeholder="Descreva o propósito desta categoria..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={errors.description ? "border-destructive" : ""}
              rows={3}
              maxLength={200}
            />
            {errors.description && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground">{formData.description.length}/200 caracteres</p>
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Ícone</Label>
            <ScrollArea className="h-[120px]">
              <div className="grid grid-cols-8 gap-2 pr-4">
                {availableIcons.map((iconData) => {
                  const IconComp = iconData.icon;
                  const isSelected = formData.icon === iconData.id;
                  return (
                    <button
                      key={iconData.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: iconData.id })}
                      className={`p-2.5 rounded-lg border transition-all duration-200 ${
                        isSelected
                          ? `${selectedColor.bgColor} border-primary`
                          : "border-border hover:border-primary/50 hover:bg-muted/30"
                      }`}
                      title={iconData.label}
                    >
                      <IconComp className={`h-5 w-5 ${isSelected ? selectedColor.color : "text-muted-foreground"}`} />
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="grid grid-cols-8 gap-2">
              {availableColors.map((colorData) => {
                const isSelected = formData.colorId === colorData.id;
                return (
                  <button
                    key={colorData.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, colorId: colorData.id })}
                    className={`p-3 rounded-lg border transition-all duration-200 ${colorData.bgColor} ${
                      isSelected ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-border"
                    }`}
                    title={colorData.label}
                  >
                    <div className={`h-4 w-4 rounded-full ${colorData.color.replace('text-', 'bg-').replace('-400', '-500')}`} />
                    {isSelected && (
                      <Check className={`h-3 w-3 absolute top-1 right-1 ${colorData.color}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col bg-background border-border p-0">
        <DialogHeader className="pb-4 pt-6 px-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
              <FolderPlus className="h-8 w-8 text-violet-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                Categorias de Templates
              </DialogTitle>
              <p className="text-muted-foreground">
                Organize seus templates de e-mail por categorias
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6">
            {isEditing ? renderCategoryForm() : renderCategoriesList()}
          </div>
        </ScrollArea>

        {isEditing && (
          <div className="border-t border-border p-4 flex items-center justify-end gap-2 bg-muted/30 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => { setIsEditing(false); resetForm(); }}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={saving}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}