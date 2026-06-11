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
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Ruler,
  Hash,
  Check,
  Info,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

interface UnitsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnitsModal({ open, onOpenChange }: UnitsModalProps) {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<any | null>(null);
  const [editingUnit, setEditingUnit] = useState<any | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    abbreviation: "",
    description: "",
    isActive: true,
  });

  const presetUnits = [
    { id: "unit", title: "Unidade", subtitle: "Contagem simples de item", code: "UN", name: "Unidade", abbreviation: "un" },
    { id: "kg", title: "Quilograma", subtitle: "Peso em quilogramas", code: "KG", name: "Quilograma", abbreviation: "kg" },
    { id: "litro", title: "Litro", subtitle: "Volume em litros", code: "L", name: "Litro", abbreviation: "L" },
    { id: "metro", title: "Metro", subtitle: "Comprimento em metros", code: "M", name: "Metro", abbreviation: "m" },
  ];

  // Load data when modal opens
  useEffect(() => {
    if (open && mode === "list") {
      loadUnits();
    }
  }, [open, mode]);

  // Filter units based on search term
  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      if (!searchTerm.trim()) return true;
      const search = searchTerm.toLowerCase().trim();
      const name = (unit.name || "").toLowerCase();
      const code = (unit.code || "").toLowerCase();
      const abbreviation = (unit.abbreviation || "").toLowerCase();
      const description = (unit.description || "").toLowerCase();
      return (
        name.includes(search) ||
        code.includes(search) ||
        abbreviation.includes(search) ||
        description.includes(search)
      );
    });
  }, [units, searchTerm]);

  const loadUnits = async () => {
    try {
      setIsLoading(true);
      const response = await api.getUnitsOfMeasure(searchTerm || undefined);
      if (response.success && response.data?.unitsOfMeasure) {
        setUnits(response.data.unitsOfMeasure);
      }
    } catch (error) {
      console.error("Erro ao carregar unidades de medida:", error);
      toast.error("Erro ao carregar unidades de medida");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnitForEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await api.getUnitOfMeasureById(id);
      if (response.success && response.data) {
        const unit = response.data;
        setEditingUnit(unit);
        
        setFormData({
          code: unit.code || "",
          name: unit.name || "",
          abbreviation: unit.abbreviation || "",
          description: unit.description || "",
          isActive: unit.status === "active",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar unidade de medida:", error);
      toast.error("Erro ao carregar dados da unidade de medida");
      setEditingUnit(null);
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
    if (!formData.abbreviation.trim()) {
      toast.error("Abreviação é obrigatória");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        abbreviation: formData.abbreviation.trim(),
        description: formData.description.trim() || null,
        status: formData.isActive ? "active" as const : "inactive" as const,
      };

      let response;
      if (editingUnit) {
        response = await api.updateUnitOfMeasure(editingUnit.id, data);
        if (response.success) {
          toast.success("Unidade de Medida Atualizada", {
            description: `${formData.name} foi atualizada com sucesso!`,
          });
          await loadUnits();
          setMode("list");
          setEditingUnit(null);
          resetForm();
        } else {
          toast.error(response.error?.message || "Erro ao atualizar unidade de medida");
        }
      } else {
        response = await api.createUnitOfMeasure(data);
        if (response.success) {
          toast.success("Unidade de Medida Criada", {
            description: `${formData.name} foi cadastrada com sucesso!`,
          });
          await loadUnits();
          setMode("list");
          resetForm();
        } else {
          toast.error(response.error?.message || "Erro ao cadastrar unidade de medida");
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar unidade de medida:", error);
      toast.error("Erro ao salvar unidade de medida");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      abbreviation: "",
      description: "",
      isActive: true,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setMode("list");
      setCurrentStep(1);
      setEditingUnit(null);
      setSearchTerm("");
      resetForm();
    }, 300);
  };

  const handleNewClick = () => {
    setEditingUnit(null);
    setMode("create");
    setCurrentStep(1);
    setSearchTerm("");
    resetForm();
  };

  const handleEditClick = (unit: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingUnit(unit);
    setMode("edit");
    setCurrentStep(1);
    loadUnitForEdit(unit.id);
  };

  const handleBackToList = () => {
    setMode("list");
    setCurrentStep(1);
    setEditingUnit(null);
    resetForm();
    loadUnits();
  };

  const applyPreset = (preset: { code: string; name: string; abbreviation: string }) => {
    setFormData((prev) => ({
      ...prev,
      code: prev.code || preset.code,
      name: prev.name || preset.name,
      abbreviation: prev.abbreviation || preset.abbreviation,
    }));
  };

  const handleNextStep = () => {
    if (!formData.code.trim()) {
      toast.error("Código é obrigatório");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!formData.abbreviation.trim()) {
      toast.error("Abreviação é obrigatória");
      return;
    }
    setCurrentStep(2);
  };

  const handleDeleteClick = (unit: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setUnitToDelete(unit);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!unitToDelete) return;

    try {
      setIsDeleting(true);
      const response = await api.deleteUnitOfMeasure(unitToDelete.id);

      if (response.success) {
        toast.success("Unidade de Medida Excluída", {
          description: `${unitToDelete.name} foi excluída com sucesso!`,
        });
        setDeleteDialogOpen(false);
        setUnitToDelete(null);
        await loadUnits();
      } else {
        toast.error(response.error?.message || "Erro ao excluir unidade de medida");
      }
    } catch (error) {
      console.error("Erro ao excluir unidade de medida:", error);
      toast.error("Erro ao excluir unidade de medida");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setUnitToDelete(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className={`${mode === "list" ? "max-w-7xl" : "max-w-6xl h-[90vh]"} max-h-[95vh] p-0 gap-0 overflow-hidden flex flex-col`}>
          {/* Header */}
          <div className="relative px-6 py-5 border-b bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-rose-500/10 flex-shrink-0">
            <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none">
              <svg viewBox="0 0 200 200" className="w-full h-full text-rose-500">
                <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
              <Ruler className="h-32 w-32 text-rose-500" />
            </div>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl shadow-lg bg-gradient-to-br from-rose-500 to-pink-500">
                    <Ruler className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-rose-600">
                      {mode === "list" 
                        ? "Unidades de Medida" 
                        : mode === "edit"
                        ? "Editar Unidade de Medida"
                        : "Nova Unidade de Medida"}
                    </DialogTitle>
                    <p className="text-sm font-normal text-rose-500 mt-1">
                      {mode === "list" 
                        ? "Gerencie as unidades de medida cadastradas" 
                        : mode === "edit"
                        ? "Edite as informações da unidade de medida"
                        : "Cadastre uma nova unidade de medida para produtos"}
                    </p>
                  </div>
                </div>
              </div>
            </DialogHeader>
          </div>

          <ScrollArea className="flex-1 overflow-auto">
            <div className="p-6">
              {mode === "list" ? (
                /* LIST MODE */
                <div className="space-y-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Unidades de Medida Cadastradas</h3>
                        <p className="text-sm text-muted-foreground">
                          {filteredUnits.length} de {units.length} {units.length === 1 ? "unidade cadastrada" : "unidades cadastradas"}
                        </p>
                      </div>
                      <Button
                        onClick={handleNewClick}
                        className="bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Unidade de Medida
                      </Button>
                    </div>
                    
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome, código, abreviação, descrição..."
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
                  ) : units.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <Ruler className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhuma unidade de medida cadastrada</p>
                      <Button onClick={handleNewClick} className="mt-4" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar Primeira Unidade de Medida
                      </Button>
                    </div>
                  ) : filteredUnits.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhuma unidade de medida encontrada com o termo "{searchTerm}"</p>
                    </div>
                  ) : (
                    /* Units List - Table */
                    <div className="border rounded-lg overflow-hidden">
                      <ScrollArea className="h-[calc(95vh-280px)]">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted/50 border-b sticky top-0 z-10">
                              <tr>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Código</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Nome</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Abreviação</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Descrição</th>
                                <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {filteredUnits.map((unit) => (
                                <tr 
                                  key={unit.id} 
                                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                                  onClick={() => handleEditClick(unit)}
                                >
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <Hash className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium text-sm">{unit.code}</span>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <span className="font-medium text-sm">{unit.name}</span>
                                  </td>
                                  <td className="p-3">
                                    <Badge variant="outline" className="font-mono">
                                      {unit.abbreviation}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-sm text-muted-foreground truncate max-w-xs block">
                                      {unit.description || "-"}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <Badge className={unit.status === "active" ? "bg-emerald-500" : "bg-gray-500"}>
                                      {unit.status === "active" ? "Ativa" : "Inativa"}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center justify-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleEditClick(unit, e)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={(e) => handleDeleteClick(unit, e)}
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
                  <aside className="rounded-2xl border border-border bg-gradient-to-b from-rose-500/10 via-pink-500/10 to-background overflow-hidden">
                    <div className="p-5 border-b border-border/60 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.18),transparent_40%)]">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow">
                          <Ruler className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">Unidade de Medida</p>
                          <p className="text-xs text-muted-foreground">
                            {editingUnit ? "Edição avançada" : "Cadastro avançado"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-rose-500 to-pink-600 transition-all"
                            style={{ width: `${currentStep === 1 ? 50 : 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Etapa {currentStep} de 2</p>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {[1, 2].map((step) => (
                        <button
                          key={step}
                          type="button"
                          className={`w-full rounded-xl border p-3 text-left transition ${
                            currentStep === step ? "bg-primary/10 border-primary/30" : "bg-card border-border/60"
                          }`}
                          onClick={() => setCurrentStep(step)}
                        >
                          <p className="text-sm font-medium">
                            {step === 1 ? "1. Dados e modelo" : "2. Detalhes e revisão"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {step === 1
                              ? "Escolha um card e preencha os campos."
                              : "Ajuste status, descrição e confirme."}
                          </p>
                        </button>
                      ))}
                    </div>
                  </aside>

                  <Card>
                    <CardContent className="p-6 space-y-6">
                      {currentStep === 1 ? (
                        <>
                          <div className="flex items-start gap-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
                            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900">
                              <Info className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-rose-900 dark:text-rose-100 mb-1">
                                {editingUnit ? "Editar Unidade de Medida" : "Nova Unidade de Medida"}
                              </h4>
                              <p className="text-sm text-rose-700 dark:text-rose-300">
                                Preencha os dados principais da unidade de medida.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {presetUnits.map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => applyPreset(preset)}
                                className="rounded-xl border border-border/60 bg-card hover:bg-muted/40 p-4 text-left transition"
                              >
                                <p className="font-semibold">{preset.title}</p>
                                <p className="text-xs text-muted-foreground">{preset.subtitle}</p>
                                <p className="text-xs mt-2 text-muted-foreground">
                                  {preset.code} • {preset.abbreviation}
                                </p>
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="code" className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-rose-400" />
                                Código *
                              </Label>
                              <Input
                                id="code"
                                placeholder="Ex: UN, KG, LT"
                                value={formData.code}
                                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                className="bg-background"
                                disabled={!!editingUnit}
                              />
                              {editingUnit && (
                                <p className="text-xs text-muted-foreground">O código não pode ser alterado</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="name">Nome *</Label>
                              <Input
                                id="name"
                                placeholder="Ex: Unidade, Quilograma, Litro"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="abbreviation">Abreviação *</Label>
                              <Input
                                id="abbreviation"
                                placeholder="Ex: un, kg, l"
                                value={formData.abbreviation}
                                onChange={(e) => setFormData(prev => ({ ...prev, abbreviation: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                              id="description"
                              placeholder="Descrição da unidade..."
                              value={formData.description}
                              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                              className="bg-background min-h-[100px]"
                            />
                          </div>

                          <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                                  <Check className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <Label className="text-base font-semibold">Unidade Ativa</Label>
                                  <p className="text-xs text-muted-foreground">Disponível para uso</p>
                                </div>
                              </div>
                              <Switch
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                              />
                            </div>
                          </div>

                          <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
                            <p className="text-sm font-semibold">Resumo</p>
                            <p className="text-sm text-muted-foreground">Código: <span className="text-foreground font-medium">{formData.code || "-"}</span></p>
                            <p className="text-sm text-muted-foreground">Nome: <span className="text-foreground font-medium">{formData.name || "-"}</span></p>
                            <p className="text-sm text-muted-foreground">Abreviação: <span className="text-foreground font-medium">{formData.abbreviation || "-"}</span></p>
                            <p className="text-sm text-muted-foreground">Status: <span className="text-foreground font-medium">{formData.isActive ? "Ativa" : "Inativa"}</span></p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
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
                  onClick={currentStep === 1 ? handleBackToList : () => setCurrentStep(1)}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {currentStep === 1 ? "Voltar" : "Etapa Anterior"}
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBackToList} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  {currentStep === 1 ? (
                    <Button
                      onClick={handleNextStep}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 text-white shadow-lg shadow-rose-500/25"
                    >
                      Próxima Etapa
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 text-white shadow-lg shadow-rose-500/25"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingUnit ? "Atualizando..." : "Salvando..."}
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          {editingUnit ? "Atualizar Unidade" : "Salvar Unidade"}
                        </>
                      )}
                    </Button>
                  )}
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
              Tem certeza que deseja excluir a unidade de medida <strong>{unitToDelete?.name}</strong>?
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                Código: {unitToDelete?.code} | Abreviação: {unitToDelete?.abbreviation}
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
