import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { NewGroupModal } from "@/components/usergroups/NewGroupModal";
import { PageManagementModal } from "@/components/usergroups/PageManagementModal";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Search,
  Shield,
  Edit,
  Trash2,
  ChevronRight,
  Eye,
  Settings,
  FileText,
  CreditCard,
  Calendar,
  Home,
  BarChart3,
  Bell,
  Save,
  Loader2,
  Pencil,
  X,
  Check,
  UserPlus
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const permissionLevels = [
  { key: "read", label: "Ler", icon: Eye, description: "Visualizar informações" },
  { key: "write", label: "Escrever", icon: Plus, description: "Criar novos registros" },
  { key: "update", label: "Editar", icon: Pencil, description: "Modificar registros existentes" },
  { key: "delete", label: "Excluir", icon: Trash2, description: "Remover registros" },
];

const colors = [
  "from-red-500 to-orange-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-purple-500 to-pink-500",
  "from-amber-500 to-yellow-500",
  "from-indigo-500 to-purple-500",
  "from-teal-500 to-cyan-500",
];

interface GroupPermissions {
  [module: string]: {
    read?: boolean;
    write?: boolean;
    update?: boolean;
    delete?: boolean;
  };
}

const UserGroups = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<GroupPermissions>({});
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [isPageManagementOpen, setIsPageManagementOpen] = useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const queryClient = useQueryClient();

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUserIdToAdd, setSelectedUserIdToAdd] = useState<string>("");

  const { data: groupsData, isLoading, error } = useQuery({
    queryKey: ['userGroups'],
    queryFn: async () => {
      const response = await api.getUserGroups();
      if (response.success && response.data) {
        return response.data.groups;
      }
      throw new Error(response.error?.message || 'Erro ao carregar grupos');
    },
  });

  const { data: allUsersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.getUsers();
      if (response.success && response.data) {
        return response.data.users;
      }
      return [];
    },
    enabled: isAddUserOpen
  });

  const allUsers = allUsersData || [];
  const groups = groupsData || [];

  const { data: pagesData } = useQuery({
    queryKey: ['system-pages'],
    queryFn: async () => {
      const res = await api.getPages();
      if (res.success && res.data) {
        return Array.isArray(res.data) ? res.data : (res.data as any).pages || [];
      }
      return [];
    }
  });

  const permissionModules = pagesData?.map((page: any) => ({
    key: page.route.replace(/^\//, '').replace(/\//g, '_') || 'dashboard',
    label: page.title,
    icon: FileText,
    description: page.route
  })) || [];

  const { data: selectedGroupData } = useQuery({
    queryKey: ['user-group', selectedGroup],
    queryFn: async () => {
      if (!selectedGroup) return null;
      const response = await api.getUserGroupById(selectedGroup);
      if (response.success && response.data) {
        return response.data.group;
      }
      throw new Error(response.error?.message || 'Erro ao carregar perfil');
    },
    enabled: !!selectedGroup,
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ id, permissions }: { id: number; permissions: GroupPermissions }) => {
      const response = await api.updateUserGroupPermissions(id, permissions);
      if (!response.success) {
        throw new Error(response.error?.message || 'Erro ao atualizar permissões');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success('Permissões atualizadas com sucesso');
      queryClient.invalidateQueries({ queryKey: ['user-group', selectedGroup] });
      queryClient.invalidateQueries({ queryKey: ['userGroups'] });
      setEditingPermissions({});
      setIsEditingPermissions(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar permissões');
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.updateUserGroup(id, data);
      if (!response.success) {
        throw new Error(response.error?.message || 'Erro ao atualizar perfil');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success('Perfil atualizado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['user-group', selectedGroup] });
      queryClient.invalidateQueries({ queryKey: ['userGroups'] });
      setIsEditingName(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar perfil');
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.deleteUserGroup(id);
      if (!response.success) {
        throw new Error(response.error?.message || 'Erro ao deletar perfil');
      }
    },
    onSuccess: () => {
      toast.success('Perfil deletado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['userGroups'] });
      setSelectedGroup(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao deletar perfil');
    },
  });

  const addUserMutation = useMutation({
    mutationFn: ({ groupId, userId }: { groupId: number, userId: number }) =>
      api.addUserToGroup(groupId, userId),
    onSuccess: () => {
      toast.success("Usuário adicionado com sucesso");
      setIsAddUserOpen(false);
      setSelectedUserIdToAdd("");
      queryClient.invalidateQueries({ queryKey: ['user-group', selectedGroup] });
      queryClient.invalidateQueries({ queryKey: ['userGroups'] });
    },
    onError: (error: any) => toast.error(error.message || "Erro ao adicionar usuário")
  });

  const removeUserMutation = useMutation({
    mutationFn: ({ groupId, userId }: { groupId: number, userId: number }) =>
      api.removeUserFromGroup(groupId, userId),
    onSuccess: () => {
      toast.success("Usuário removido com sucesso");
      queryClient.invalidateQueries({ queryKey: ['user-group', selectedGroup] });
      queryClient.invalidateQueries({ queryKey: ['userGroups'] });
    },
    onError: (error: any) => toast.error(error.message || "Erro ao remover usuário")
  });

  const filteredGroups = groups.filter((group: any) =>
    group.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEditingName = () => {
    setEditingName(selectedGroupData?.name || '');
    setEditingDescription(selectedGroupData?.description || '');
    setIsEditingName(true);
  };

  const saveName = () => {
    if (!selectedGroup) return;
    updateGroupMutation.mutate({
      id: selectedGroup,
      data: {
        name: editingName,
        description: editingDescription,
      },
    });
  };

  const handleDelete = () => {
    if (!selectedGroup) return;
    if (confirm('Tem certeza que deseja deletar este perfil?')) {
      deleteGroupMutation.mutate(selectedGroup);
    }
  };

  const totalUsers = groups.reduce((acc: number, g: any) => acc + (g.userCount || 0), 0);

  const startEditing = () => {
    setIsEditingPermissions(true);
    if (selectedGroupData?.permissions) {
      setEditingPermissions(JSON.parse(JSON.stringify(selectedGroupData.permissions)));
    } else {
      setEditingPermissions({});
    }
  };

  const savePermissions = () => {
    if (!selectedGroup) return;
    updatePermissionsMutation.mutate({
      id: selectedGroup,
      permissions: editingPermissions,
    });
  };

  const togglePermission = (module: string, level: string) => {
    if (!isEditingPermissions) return;
    setEditingPermissions((prev) => {
      const newPerms = { ...prev };
      if (!newPerms[module]) {
        newPerms[module] = {};
      }
      newPerms[module][level as keyof typeof newPerms[typeof module]] =
        !newPerms[module][level as keyof typeof newPerms[typeof module]];
      return newPerms;
    });
  };

  const toggleAllModulePermissions = (moduleKey: string) => {
    if (!isEditingPermissions) return;
    setEditingPermissions((prev) => {
      const newPerms = { ...prev };
      if (!newPerms[moduleKey]) {
        newPerms[moduleKey] = {};
      }
      const levels = ['read', 'write', 'update', 'delete'];
      const currentModulePerms = newPerms[moduleKey];
      const allTrue = levels.every(level => currentModulePerms?.[level as keyof typeof currentModulePerms]);

      levels.forEach(level => {
        newPerms[moduleKey][level as keyof typeof newPerms[moduleKey]] = !allTrue;
      });
      return newPerms;
    });
  };

  const getPermissionValue = (module: string, level: string): boolean => {
    if (isEditingPermissions) {
      return editingPermissions[module]?.[level as keyof typeof editingPermissions[typeof module]] || false;
    }
    return selectedGroupData?.permissions?.[module]?.[level] || false;
  };

  const cancelEditingPermissions = () => {
    setIsEditingPermissions(false);
    setEditingPermissions({});
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <p className="text-destructive">Erro ao carregar perfis</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Perfil de Usuários
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie perfis e permissões de acesso detalhadas
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPageManagementOpen(true)}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Gerenciar Menu
            </Button>
            <Button
              onClick={() => setIsNewGroupModalOpen(true)}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Novo Perfil
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{groups.length}</p>
                <p className="text-sm text-muted-foreground">Perfis</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-sm text-muted-foreground">Usuários</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Settings className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{permissionModules.length}</p>
                <p className="text-sm text-muted-foreground">Módulos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Eye className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{permissionLevels.length * permissionModules.length}</p>
                <p className="text-sm text-muted-foreground">Permissões</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-primary" />
                Perfis
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar perfil..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredGroups.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum perfil encontrado</p>
              ) : (
                filteredGroups.map((group: any, index: number) => (
                  <div
                    key={group.id}
                    onClick={() => {
                      setSelectedGroup(group.id);
                      setEditingPermissions({});
                      setIsEditingName(false);
                    }}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${selectedGroup === group.id
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-muted/30 hover:bg-muted/50 border border-transparent"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center`}>
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{group.name}</p>
                          <p className="text-sm text-muted-foreground">{group.userCount || 0} usuários</p>
                        </div>
                      </div>
                      <ChevronRight className={`h-5 w-5 transition-transform ${selectedGroup === group.id ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50 lg:col-span-2">
            {selectedGroupData ? (
              <>
                <CardHeader className="border-b border-border/50">
                  <div className="flex items-center justify-between">
                    {isEditingName ? (
                      <div className="flex-1 space-y-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          placeholder="Nome do perfil"
                          className="font-semibold"
                        />
                        <Input
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          placeholder="Descrição"
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveName} disabled={updateGroupMutation.isPending}>
                            <Check className="h-4 w-4 mr-1" />
                            Salvar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setIsEditingName(false)}>
                            <X className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors[(selectedGroup || 0) % colors.length]} flex items-center justify-center`}>
                          <Shield className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{selectedGroupData.name}</CardTitle>
                          <p className="text-muted-foreground">{selectedGroupData.description || 'Sem descrição'}</p>
                        </div>
                      </div>
                    )}
                    {!isEditingName && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={startEditingName}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={handleDelete}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Settings className="h-5 w-5 text-primary" />
                          Permissões por Módulo
                        </h3>
                        {!isEditingPermissions && (
                          <Button variant="outline" size="sm" onClick={startEditing}>
                            <Edit className="h-4 w-4 mr-1" />
                            Editar Permissões
                          </Button>
                        )}
                        {isEditingPermissions && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={savePermissions}
                              disabled={updatePermissionsMutation.isPending}
                            >
                              <Save className="h-4 w-4 mr-1" />
                              {updatePermissionsMutation.isPending ? 'Salvando...' : 'Salvar'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEditingPermissions}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
                        {permissionModules.map((module) => {
                          const allActive = permissionLevels.every(level =>
                            getPermissionValue(module.key, level.key)
                          );

                          return (
                            <Card key={module.key} className="border-border/50">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                      <module.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{module.label}</p>
                                      <p className="text-xs text-muted-foreground">{module.description}</p>
                                    </div>
                                  </div>
                                  {isEditingPermissions && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleAllModulePermissions(module.key)}
                                      className="h-8 text-xs"
                                    >
                                      {allActive ? "Desmarcar Todos" : "Selecionar Todos"}
                                    </Button>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                  {permissionLevels.map((level) => {
                                    const isChecked = getPermissionValue(module.key, level.key);
                                    const LevelIcon = level.icon;
                                    return (
                                      <div
                                        key={level.key}
                                        className={`p-3 rounded-lg border transition-colors cursor-pointer ${isChecked
                                          ? "bg-primary/10 border-primary/30"
                                          : "bg-muted/20 border-border/50"
                                          } ${isEditingPermissions ? "hover:bg-muted/40" : "opacity-75 cursor-not-allowed"}`}
                                        onClick={() => togglePermission(module.key, level.key)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Checkbox
                                            checked={isChecked}
                                            onCheckedChange={() => togglePermission(module.key, level.key)}
                                            disabled={!isEditingPermissions}
                                          />
                                          <LevelIcon className={`h-4 w-4 ${isChecked ? "text-primary" : "text-muted-foreground"}`} />
                                          <div>
                                            <p className={`text-sm font-medium ${isChecked ? "text-primary" : "text-muted-foreground"}`}>
                                              {level.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{level.description}</p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          Usuários neste Perfil ({selectedGroupData.users?.length || 0})
                        </h3>
                        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                              <UserPlus className="h-4 w-4" />
                              Adicionar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Adicionar Usuário ao Grupo</DialogTitle>
                              <DialogDescription>
                                Selecione um usuário para adicionar a este grupo.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Select value={selectedUserIdToAdd} onValueChange={setSelectedUserIdToAdd}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um usuário..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {allUsers
                                    .filter((u: any) => !selectedGroupData.users?.some((gu: any) => gu.id === u.id))
                                    .map((user: any) => (
                                      <SelectItem key={user.id} value={String(user.id)}>
                                        {user.name} ({user.email})
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancelar</Button>
                              <Button
                                onClick={() => {
                                  if (selectedUserIdToAdd) {
                                    addUserMutation.mutate({
                                      groupId: selectedGroupData.id,
                                      userId: parseInt(selectedUserIdToAdd)
                                    });
                                  }
                                }}
                                disabled={!selectedUserIdToAdd || addUserMutation.isPending}
                              >
                                {addUserMutation.isPending ? "Adicionando..." : "Adicionar"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      {selectedGroupData.users && selectedGroupData.users.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedGroupData.users.map((user: any) => (
                            <div key={user.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50 text-sm">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                                {user.avatar || (user.name || '').charAt(0).toUpperCase()}
                              </div>
                              <span>{user.name}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 ml-1 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => removeUserMutation.mutate({ groupId: selectedGroupData.id, userId: user.id })}
                                disabled={removeUserMutation.isPending}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Nenhum usuário neste perfil</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full py-20">
                <div className="text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Selecione um perfil para ver os detalhes</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        <NewGroupModal
          open={isNewGroupModalOpen}
          onOpenChange={setIsNewGroupModalOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['userGroups'] });
          }}
        />

        <PageManagementModal
          open={isPageManagementOpen}
          onOpenChange={setIsPageManagementOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['system-pages'] });
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default UserGroups;
