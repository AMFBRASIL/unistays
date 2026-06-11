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
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FolderTree,
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
import { api } from "@/lib/api";

interface ProductGroupsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductGroupsModal({ open, onOpenChange }: ProductGroupsModalProps) {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<any | null>(null);
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    parentGroupId: null as number | null,
    description: "",
    isActive: true,
  });

  // Load data when modal opens
  useEffect(() => {
    if (open && mode === "list") {
      loadGroups();
    }
  }, [open, mode]);

  // Filter groups based on search term
  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      if (!searchTerm.trim()) return true;
      const search = searchTerm.toLowerCase().trim();
      const name = (group.name || "").toLowerCase();
      const code = (group.code || "").toLowerCase();
      const description = (group.description || "").toLowerCase();
      return (
        name.includes(search) ||
        code.includes(search) ||
        description.includes(search)
      );
    });
  }, [groups, searchTerm]);

  // Get root groups (sem pai) para o select
  const rootGroups = useMemo(() => {
    return groups.filter(g => !g.parentGroupId && g.status === 'active');
  }, [groups]);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const response = await api.getProductGroups(searchTerm || undefined);
      if (response.success && response.data?.productGroups) {
        setGroups(response.data.productGroups);
      }
    } catch (error) {
      console.error("Erro ao carregar grupos de produtos:", error);
      toast.error("Erro ao carregar grupos de produtos");
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroupForEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await api.getProductGroupById(id);
      if (response.success && response.data) {
        const group = response.data;
        setEditingGroup(group);
        
        setFormData({
          code: group.code || "",
          name: group.name || "",
          parentGroupId: group.parentGroupId || null,
          description: group.description || "",
          isActive: group.status === "active",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar grupo de produtos:", error);
      toast.error("Erro ao carregar dados do grupo de produtos");
      setEditingGroup(null);
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

    try {
      setIsSubmitting(true);

      const data = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        parentGroupId: formData.parentGroupId || null,
        description: formData.description.trim() || null,
        status: formData.isActive ? "active" as const : "inactive" as const,
      };

      let response;
      if (editingGroup) {
        response = await api.updateProductGroup(editingGroup.id, data);
        if (response.success) {
          toast.success("Grupo de Produtos Atualizado", {
            description: `${formData.name} foi atualizado com sucesso!`,
          });
          await loadGroups();
          setMode("list");
          setEditingGroup(null);
          resetForm();
        } else {
          toast.error(response.error?.message || "Erro ao atualizar grupo de produtos");
        }
      } else {
        response = await api.createProductGroup(data);
        if (response.success) {
          toast.success("Grupo de Produtos Criado", {
            description: `${formData.name} foi cadastrado com sucesso!`,
          });
          await loadGroups();
          setMode("list");
          resetForm();
        } else {
          toast.error(response.error?.message || "Erro ao cadastrar grupo de produtos");
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar grupo de produtos:", error);
      toast.error("Erro ao salvar grupo de produtos");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      parentGroupId: null,
      description: "",
      isActive: true,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setMode("list");
      setEditingGroup(null);
      setSearchTerm("");
      resetForm();
    }, 300);
  };

  const handleNewClick = () => {
    setEditingGroup(null);
    setMode("create");
    setSearchTerm("");
    resetForm();
    loadGroups(); // Carregar grupos para o select de grupo pai
  };

  const handleEditClick = (group: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingGroup(group);
    setMode("edit");
    loadGroupForEdit(group.id);
    loadGroups(); // Carregar grupos para o select de grupo pai
  };

  const handleBackToList = () => {
    setMode("list");
    setEditingGroup(null);
    resetForm();
    loadGroups();
  };

  const handleDeleteClick = (group: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;

    try {
      setIsDeleting(true);
      const response = await api.deleteProductGroup(groupToDelete.id);

      if (response.success) {
        toast.success("Grupo de Produtos Excluído", {
          description: `${groupToDelete.name} foi excluído com sucesso!`,
        });
        setDeleteDialogOpen(false);
        setGroupToDelete(null);
        await loadGroups();
      } else {
        toast.error(response.error?.message || "Erro ao excluir grupo de produtos");
      }
    } catch (error) {
      console.error("Erro ao excluir grupo de produtos:", error);
      toast.error("Erro ao excluir grupo de produtos");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setGroupToDelete(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className={`${mode === "list" ? "max-w-7xl" : "max-w-4xl"} max-h-[95vh] p-0 gap-0 overflow-hidden flex flex-col`}>
          {/* Header */}
          <div className="relative px-6 py-5 border-b bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-fuchsia-500/10 flex-shrink-0">
            <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none">
              <svg viewBox="0 0 200 200" className="w-full h-full text-fuchsia-500">
                <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
              <FolderTree className="h-32 w-32 text-fuchsia-500" />
            </div>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl shadow-lg bg-gradient-to-br from-fuchsia-500 to-purple-500">
                    <FolderTree className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-fuchsia-600">
                      {mode === "list" 
                        ? "Grupos de Produtos" 
                        : mode === "edit"
                        ? "Editar Grupo de Produtos"
                        : "Novo Grupo de Produtos"}
                    </DialogTitle>
                    <p className="text-sm font-normal text-fuchsia-500 mt-1">
                      {mode === "list" 
                        ? "Gerencie os grupos de produtos cadastrados" 
                        : mode === "edit"
                        ? "Edite as informações do grupo de produtos"
                        : "Organize produtos em grupos e categorias"}
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
                        <h3 className="text-lg font-semibold">Grupos de Produtos Cadastrados</h3>
                        <p className="text-sm text-muted-foreground">
                          {filteredGroups.length} de {groups.length} {groups.length === 1 ? "grupo cadastrado" : "grupos cadastrados"}
                        </p>
                      </div>
                      <Button
                        onClick={handleNewClick}
                        className="bg-gradient-to-r from-fuchsia-600 to-purple-500 hover:from-fuchsia-700 hover:to-purple-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Grupo de Produtos
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
                      <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
                    </div>
                  ) : groups.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <FolderTree className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhum grupo de produtos cadastrado</p>
                      <Button onClick={handleNewClick} className="mt-4" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar Primeiro Grupo de Produtos
                      </Button>
                    </div>
                  ) : filteredGroups.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhum grupo encontrado com o termo "{searchTerm}"</p>
                    </div>
                  ) : (
                    /* Groups List - Table */
                    <div className="border rounded-lg overflow-hidden">
                      <ScrollArea className="h-[calc(95vh-280px)]">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted/50 border-b sticky top-0 z-10">
                              <tr>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Código</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Nome</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Grupo Pai</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Descrição</th>
                                <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {filteredGroups.map((group) => (
                                <tr 
                                  key={group.id} 
                                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                                  onClick={() => handleEditClick(group)}
                                >
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <Hash className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium text-sm">{group.code}</span>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <span className="font-medium text-sm">{group.name}</span>
                                  </td>
                                  <td className="p-3">
                                    {group.parentGroup ? (
                                      <Badge variant="outline" className="text-xs">
                                        {group.parentGroup.name}
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-xs text-muted-foreground border-dashed">
                                        Grupo Raiz
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="p-3">
                                    <span className="text-sm text-muted-foreground truncate max-w-xs block">
                                      {group.description || "-"}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <Badge className={group.status === "active" ? "bg-emerald-500" : "bg-gray-500"}>
                                      {group.status === "active" ? "Ativo" : "Inativo"}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center justify-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleEditClick(group, e)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={(e) => handleDeleteClick(group, e)}
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
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-950/20 border border-fuchsia-200 dark:border-fuchsia-800">
                      <div className="p-2 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900">
                        <Info className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-fuchsia-900 dark:text-fuchsia-100 mb-1">
                          {editingGroup ? "Editar Grupo de Produtos" : "Novo Grupo de Produtos"}
                        </h4>
                        <p className="text-sm text-fuchsia-700 dark:text-fuchsia-300">
                          {editingGroup 
                            ? "Edite as informações do grupo de produtos abaixo."
                            : "Crie um novo grupo para organizar seus produtos."}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="code" className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-fuchsia-400" />
                          Código *
                        </Label>
                        <Input
                          id="code"
                          placeholder="Ex: GRP-001"
                          value={formData.code}
                          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                          className="bg-background"
                          disabled={!!editingGroup}
                        />
                        {editingGroup && (
                          <p className="text-xs text-muted-foreground">O código não pode ser alterado</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome do Grupo *</Label>
                        <Input
                          id="name"
                          placeholder="Ex: Bebidas, Limpeza, Alimentos"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="parentGroup">Grupo Pai</Label>
                      <Select
                        value={formData.parentGroupId?.toString() || "none"}
                        onValueChange={(value) => {
                          setFormData(prev => ({
                            ...prev,
                            parentGroupId: value === "none" ? null : parseInt(value, 10),
                          }));
                        }}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Selecione um grupo pai (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum (Grupo Raiz)</SelectItem>
                          {rootGroups
                            .filter(g => !editingGroup || g.id !== editingGroup.id) // Não pode ser pai de si mesmo
                            .map((group) => (
                              <SelectItem key={group.id} value={group.id.toString()}>
                                {group.name} ({group.code})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Deixe em branco para criar um grupo raiz (sem grupo pai)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        placeholder="Descrição do grupo..."
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
                            <Label className="text-base font-semibold">Grupo Ativo</Label>
                            <p className="text-xs text-muted-foreground">Disponível para uso</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBackToList} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || isLoading}
                    className="bg-gradient-to-r from-fuchsia-600 to-purple-500 hover:from-fuchsia-700 hover:to-purple-600 text-white shadow-lg shadow-fuchsia-500/25"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingGroup ? "Atualizando..." : "Salvando..."}
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        {editingGroup ? "Atualizar Grupo" : "Salvar Grupo"}
                      </>
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
              Tem certeza que deseja excluir o grupo de produtos <strong>{groupToDelete?.name}</strong>?
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                Código: {groupToDelete?.code}
                {groupToDelete?.parentGroup && (
                  <> | Grupo Pai: {groupToDelete.parentGroup.name}</>
                )}
              </span>
              <br />
              <span className="text-sm font-medium text-red-600 mt-2 block">
                Esta ação não pode ser desfeita. Grupos com subgrupos ou produtos associados não podem ser excluídos.
              </span>
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
