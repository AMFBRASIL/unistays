import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewUserModal } from "@/components/users/NewUserModal";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  Users as UsersIcon,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Mail,
  UserCheck,
  UserX,
  Key,
  Clock,
  Loader2
} from "lucide-react";
import { ResetPasswordModal } from "@/components/users/modals/ResetPasswordModal";
import { UserPermissionsModal } from "@/components/users/modals/UserPermissionsModal";
import { SendEmailModal } from "@/components/users/modals/SendEmailModal";

// Role names removed as we now use database Groups
const formatLastAccess = (lastLogin: Date | null | string) => {
  if (!lastLogin) return 'Nunca';

  try {
    const date = typeof lastLogin === 'string' ? new Date(lastLogin) : lastLogin;
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  } catch {
    return 'Nunca';
  }
};

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Buscar usuários do backend
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.getUsers();
      if (response.success && response.data) {
        return response.data.users;
      }
      throw new Error(response.error?.message || 'Erro ao carregar usuários');
    },
  });

  const users = data || [];

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter((u: any) => u.status === "active").length,
    inactive: users.filter((u: any) => u.status === "inactive").length,
    pending: 0, // Não há status pending no banco, apenas active/inactive/suspended
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      const response = await api.deleteUser(userId);
      if (response.success) {
        toast.success('Usuário excluído com sucesso');
        refetch();
      } else {
        toast.error(response.error?.message || 'Erro ao excluir usuário');
      }
    } catch (error) {
      toast.error('Erro ao excluir usuário');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Ativo</Badge>;
      case "inactive":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Inativo</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pendente</Badge>;
      default:
        return null;
    }
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
          <p className="text-destructive">Erro ao carregar usuários</p>
          <Button onClick={() => refetch()}>Tentar novamente</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Usuários
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os usuários do sistema
            </p>
          </div>
          <Button
            className="gap-2 bg-primary hover:bg-primary/90"
            onClick={() => setIsNewUserModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <UsersIcon className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <UserCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Ativos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-500/10">
                <UserX className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inactive}</p>
                <p className="text-sm text-muted-foreground">Inativos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                >
                  Todos
                </Button>
                <Button
                  variant={filterStatus === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("active")}
                >
                  Ativos
                </Button>
                <Button
                  variant={filterStatus === "inactive" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("inactive")}
                >
                  Inativos
                </Button>
                <Button
                  variant={filterStatus === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("pending")}
                >
                  Pendentes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Usuário</TableHead>
                  <TableHead>Cargo/Grupo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user: any) => {
                    const initials = user.name
                      ?.split(' ')
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || 'U';

                    return (
                      <TableRow key={user.id} className="border-border/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-sm font-semibold text-primary-foreground">
                              {user.avatar || initials}
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-primary/30 text-primary">
                            {user.group?.name || "Sem Grupo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatLastAccess(user.lastLogin)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => {
                                  setEditingUser(user);
                                  setIsNewUserModalOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => {
                                  setEditingUser(user);
                                  setIsResetPasswordModalOpen(true);
                                }}
                              >
                                <Key className="h-4 w-4" />
                                Resetar Senha
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => {
                                  setEditingUser(user);
                                  setIsPermissionsModalOpen(true);
                                }}
                              >
                                <Shield className="h-4 w-4" />
                                Permissões
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => {
                                  setEditingUser(user);
                                  setIsSendEmailModalOpen(true);
                                }}
                              >
                                <Mail className="h-4 w-4" />
                                Enviar Email
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-destructive"
                                onClick={() => handleDelete(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <NewUserModal
          open={isNewUserModalOpen}
          onOpenChange={(open) => {
            setIsNewUserModalOpen(open);
            if (!open) {
              setEditingUser(null);
            }
          }}
          userData={editingUser}
          onSuccess={() => {
            refetch();
          }}
        />

        {editingUser && (
          <>
            <ResetPasswordModal
              open={isResetPasswordModalOpen}
              onOpenChange={setIsResetPasswordModalOpen}
              userId={editingUser.id}
              userName={editingUser.name}
            />

            <UserPermissionsModal
              open={isPermissionsModalOpen}
              onOpenChange={setIsPermissionsModalOpen}
              user={editingUser}
              onSuccess={refetch}
            />

            <SendEmailModal
              open={isSendEmailModalOpen}
              onOpenChange={setIsSendEmailModalOpen}
              user={editingUser}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Users;

