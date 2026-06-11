import React, { useState, useEffect, useMemo } from "react";
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
  Package,
  Edit,
  Trash2,
  Plus,
  Search,
  Loader2,
  Check,
  ArrowLeft,
  type LucideIcon,
  Utensils,
  Wrench,
  Sparkles,
  Shirt,
  Truck,
  Building2,
  FileText,
  Mail,
  Phone,
  MapPin,
  User,
  Globe,
  Clock,
  Shield,
  Heart,
  Zap,
  Star,
  Home,
  Coffee,
  ShoppingBag,
  Droplet,
  Wind,
  Sun,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface SupplierCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mapeamento de ícones disponíveis
const iconMap: Record<string, LucideIcon> = {
  Utensils,
  Package,
  Sparkles,
  Wrench,
  Shirt,
  Truck,
  Building2,
  FileText,
  Mail,
  Phone,
  MapPin,
  User,
  Globe,
  Clock,
  Shield,
  Heart,
  Zap,
  Star,
  Home,
  Coffee,
  ShoppingBag,
  Droplet,
  Wind,
  Sun,
};

const iconOptions = [
  { value: 'Package', label: 'Pacote' },
  { value: 'Utensils', label: 'Utensílios' },
  { value: 'Sparkles', label: 'Brilho' },
  { value: 'Wrench', label: 'Chave' },
  { value: 'Shirt', label: 'Camisa' },
  { value: 'Truck', label: 'Caminhão' },
  { value: 'Shield', label: 'Escudo' },
  { value: 'Heart', label: 'Coração' },
  { value: 'Zap', label: 'Raio' },
  { value: 'Star', label: 'Estrela' },
  { value: 'Home', label: 'Casa' },
  { value: 'Coffee', label: 'Café' },
  { value: 'ShoppingBag', label: 'Sacola' },
  { value: 'Droplet', label: 'Gota' },
  { value: 'Wind', label: 'Vento' },
  { value: 'Sun', label: 'Sol' },
];

const colorOptions = [
  { value: 'amber-500', label: 'Âmbar', from: '#f59e0b', to: '#d97706' },
  { value: 'cyan-500', label: 'Ciano', from: '#06b6d4', to: '#0891b2' },
  { value: 'blue-500', label: 'Azul', from: '#3b82f6', to: '#2563eb' },
  { value: 'gray-500', label: 'Cinza', from: '#6b7280', to: '#4b5563' },
  { value: 'violet-500', label: 'Violeta', from: '#8b5cf6', to: '#7c3aed' },
  { value: 'emerald-500', label: 'Esmeralda', from: '#10b981', to: '#059669' },
  { value: 'red-500', label: 'Vermelho', from: '#ef4444', to: '#dc2626' },
  { value: 'green-500', label: 'Verde', from: '#22c55e', to: '#16a34a' },
  { value: 'orange-500', label: 'Laranja', from: '#f97316', to: '#ea580c' },
  { value: 'purple-500', label: 'Roxo', from: '#a855f7', to: '#9333ea' },
  { value: 'pink-500', label: 'Rosa', from: '#ec4899', to: '#db2777' },
  { value: 'indigo-500', label: 'Anil', from: '#6366f1', to: '#4f46e5' },
];

const getIconComponent = (iconName: string | null | undefined): LucideIcon => {
  if (!iconName) return Package;
  return iconMap[iconName] || Package;
};

export function SupplierCategoryModal({ open, onOpenChange }: SupplierCategoryModalProps) {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    icon: "",
    colorFrom: "",
    colorTo: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    if (open && mode === "list") {
      loadCategories();
    }
  }, [open, mode]);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      if (!searchTerm.trim()) return true;
      const search = searchTerm.toLowerCase().trim();
      const name = (category.name || "").toLowerCase();
      const code = (category.code || "").toLowerCase();
      return name.includes(search) || code.includes(search);
    });
  }, [categories, searchTerm]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await api.getSupplierCategories();
      if (response.success && response.data?.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toast.error("Erro ao carregar categorias");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategoryForEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await api.getSupplierCategoryById(id);
      if (response.success && response.data) {
        const category = response.data;
        setEditingCategory(category);
        setFormData({
          code: category.code || "",
          name: category.name || "",
          icon: category.icon || "",
          colorFrom: category.colorFrom || "",
          colorTo: category.colorTo || "",
          description: category.description || "",
          sortOrder: category.sortOrder || 0,
          isActive: category.status === "active",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar categoria:", error);
      toast.error("Erro ao carregar dados da categoria");
      setEditingCategory(null);
      setMode("list");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.code.trim()) {
      toast.error("Código é obrigatório");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        icon: formData.icon || null,
        colorFrom: formData.colorFrom || null,
        colorTo: formData.colorTo || null,
        description: formData.description.trim() || null,
        sortOrder: formData.sortOrder || 0,
        status: formData.isActive ? "active" : "inactive",
      };

      let response;
      if (editingCategory) {
        response = await api.updateSupplierCategory(editingCategory.id, data);
        if (response.success) {
          toast.success("Categoria Atualizada", {
            description: `${formData.name} foi atualizada com sucesso!`,
          });
          await loadCategories();
          setMode("list");
          setEditingCategory(null);
          resetForm();
        } else {
          toast.error(response.error?.message || "Erro ao atualizar categoria");
        }
      } else {
        response = await api.createSupplierCategory(data);
        if (response.success) {
          toast.success("Categoria Cadastrada", {
            description: `${formData.name} foi cadastrada com sucesso!`,
          });
          await loadCategories();
          setMode("list");
          resetForm();
        } else {
          toast.error(response.error?.message || "Erro ao cadastrar categoria");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      toast.error("Erro ao salvar categoria");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      icon: "",
      colorFrom: "",
      colorTo: "",
      description: "",
      sortOrder: 0,
      isActive: true,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setMode("list");
      setEditingCategory(null);
      setSearchTerm("");
      resetForm();
    }, 300);
  };

  const handleNewClick = () => {
    setEditingCategory(null);
    setMode("create");
    setSearchTerm("");
    resetForm();
  };

  const handleEditClick = (category: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingCategory(category);
    setMode("edit");
    loadCategoryForEdit(category.id);
  };

  const handleBackToList = () => {
    setMode("list");
    setEditingCategory(null);
    resetForm();
    loadCategories();
  };

  const handleDeleteClick = (category: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      const response = await api.deleteSupplierCategory(categoryToDelete.id);

      if (response.success) {
        toast.success("Categoria Excluída", {
          description: `${categoryToDelete.name} foi excluída com sucesso!`,
        });
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
        await loadCategories();
      } else {
        toast.error(response.error?.message || "Erro ao excluir categoria");
      }
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast.error("Erro ao excluir categoria");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const selectedIcon = formData.icon ? getIconComponent(formData.icon) : Package;
  const selectedColor = colorOptions.find(c => c.value === formData.colorFrom);
  const colorFromHex = selectedColor?.from || '#6b7280';
  const colorToHex = colorOptions.find(c => c.value === formData.colorTo)?.to || '#4b5563';

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className={`${mode === "list" ? "max-w-6xl" : "max-w-2xl"} max-h-[95vh] p-0 gap-0 overflow-hidden flex flex-col`}>
          {/* Header */}
          <div className="relative px-6 py-5 border-b bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 flex-shrink-0">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-orange-500 to-red-500">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {mode === "list" 
                        ? "Categorias de Fornecedores" 
                        : mode === "edit"
                        ? "Editar Categoria"
                        : "Nova Categoria"}
                    </DialogTitle>
                    <p className="text-sm font-normal text-orange-600">
                      {mode === "list" 
                        ? "Gerencie as categorias de fornecedores" 
                        : mode === "edit"
                        ? "Edite as informações da categoria"
                        : "Cadastre uma nova categoria de fornecedor"}
                    </p>
                  </div>
                </div>
              </div>
            </DialogHeader>
          </div>

          <ScrollArea className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {mode === "list" ? (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Categorias Cadastradas</h3>
                        <p className="text-sm text-muted-foreground">
                          {filteredCategories.length} de {categories.length} {categories.length === 1 ? "categoria cadastrada" : "categorias cadastradas"}
                        </p>
                      </div>
                      <Button
                        onClick={handleNewClick}
                        className="bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Categoria
                      </Button>
                    </div>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome ou código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhuma categoria cadastrada</p>
                      <Button onClick={handleNewClick} className="mt-4" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar Primeira Categoria
                      </Button>
                    </div>
                  ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhuma categoria encontrada com o termo "{searchTerm}"</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredCategories.map((category) => {
                        const IconComponent = getIconComponent(category.icon);
                        const colorFrom = colorOptions.find(c => c.value === category.colorFrom);
                        const colorTo = colorOptions.find(c => c.value === category.colorTo);
                        const colorFromHex = colorFrom?.from || '#6b7280';
                        const colorToHex = colorTo?.to || '#4b5563';

                        return (
                          <div
                            key={category.id}
                            className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{
                                  background: `linear-gradient(to right, ${colorFromHex}, ${colorToHex})`,
                                }}
                              >
                                <IconComponent className="h-6 w-6 text-white" />
                              </div>
                              <Badge className={category.status === "active" ? "bg-emerald-500" : "bg-red-500"}>
                                {category.status === "active" ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-lg mb-1">{category.name}</h4>
                            <p className="text-xs text-muted-foreground mb-2">Código: {category.code}</p>
                            {category.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{category.description}</p>
                            )}
                            <div className="flex gap-2 mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={(e) => handleEditClick(category, e)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => handleDeleteClick(category, e)}
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Código *</Label>
                      <Input
                        id="code"
                        placeholder="Ex: segurança"
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                        className="bg-background"
                        disabled={!!editingCategory}
                      />
                      <p className="text-xs text-muted-foreground">Identificador único (não pode ser alterado após criação)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        placeholder="Ex: Segurança"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="icon">Ícone</Label>
                      <Select value={formData.icon} onValueChange={(v) => setFormData(prev => ({ ...prev, icon: v }))}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Selecione um ícone" />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((icon) => {
                            const IconComponent = getIconComponent(icon.value);
                            return (
                              <SelectItem key={icon.value} value={icon.value}>
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4" />
                                  {icon.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {formData.icon && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            {React.createElement(selectedIcon, { className: "h-4 w-4" })}
                          </div>
                          <span className="text-sm text-muted-foreground">Preview</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sortOrder">Ordem de Exibição</Label>
                      <Input
                        id="sortOrder"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="colorFrom">Cor Inicial</Label>
                      <Select value={formData.colorFrom} onValueChange={(v) => setFormData(prev => ({ ...prev, colorFrom: v }))}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: color.from }} />
                                {color.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="colorTo">Cor Final</Label>
                      <Select value={formData.colorTo} onValueChange={(v) => setFormData(prev => ({ ...prev, colorTo: v }))}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: color.to }} />
                                {color.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(formData.colorFrom || formData.colorTo) && (
                    <div className="p-4 rounded-lg border bg-muted/30">
                      <Label className="text-sm mb-2 block">Preview do Gradiente</Label>
                      <div 
                        className="w-full h-20 rounded-lg flex items-center justify-center"
                        style={{
                          background: `linear-gradient(to right, ${colorFromHex}, ${colorToHex})`,
                        }}
                      >
                        {formData.icon && React.createElement(selectedIcon, { className: "h-8 w-8 text-white" })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Descrição da categoria..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-background min-h-[80px]"
                    />
                  </div>

                  <div className="p-4 rounded-xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20">
                          <Check className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Categoria Ativa</p>
                          <p className="text-sm text-muted-foreground">Disponível para uso</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      />
                    </div>
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
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600 text-white shadow-lg shadow-orange-500/25"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingCategory ? "Atualizando..." : "Cadastrando..."}
                    </>
                  ) : editingCategory ? (
                    "Atualizar Categoria"
                  ) : (
                    "Cadastrar Categoria"
                  )}
                </Button>
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
              Tem certeza que deseja excluir a categoria <strong>{categoryToDelete?.name}</strong>?
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                Código: {categoryToDelete?.code || "N/A"}
              </span>
              <br />
              Esta ação não pode ser desfeita. Categorias em uso por fornecedores não podem ser excluídas.
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
