import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Bell, 
  Key,
  Camera,
  Edit,
  Save,
  Clock,
  Activity,
  LogOut,
  Smartphone,
  Globe,
  Lock,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface UserProfileData {
  id: number;
  uuid: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin: Date | string | null;
  createdAt: Date | string;
}

const UserProfile = () => {
  const { refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  // Carregar dados do perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const response = await api.getProfile();
        
        if (response.success && response.data) {
          const profileData = response.data.user || response.data;
          setUserData(profileData);
          setFormData({
            name: profileData.name || '',
            phone: profileData.phone || '',
          });
        } else {
          toast.error('Erro ao carregar perfil', {
            description: response.error?.message || 'Não foi possível carregar os dados do perfil',
          });
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        toast.error('Erro ao carregar perfil', {
          description: 'Erro de conexão com o servidor',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Função para salvar perfil
  const handleSave = async () => {
    // Validação
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório', {
        description: 'Por favor, preencha o nome',
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await api.updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
      });

      if (response.success && response.data) {
        const updatedData = response.data.user || response.data;
        setUserData({
          ...userData,
          ...updatedData,
        });
        setIsEditing(false);
        await refreshUser(); // Atualizar contexto
        toast.success('Perfil atualizado com sucesso!');
      } else {
        toast.error('Erro ao atualizar perfil', {
          description: response.error?.message || 'Não foi possível atualizar o perfil',
        });
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao atualizar perfil', {
        description: 'Erro de conexão com o servidor',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Função para cancelar edição
  const handleCancel = () => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
      });
    }
    setIsEditing(false);
  };

  // Função para formatar data
  const formatDate = (date: Date | string | null): string => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(dateObj);
  };

  // Função para formatar data relativa
  const formatRelativeTime = (date: Date | string | null): string => {
    if (!date) return 'Nunca';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `Há ${diffInMinutes} min`;
    if (diffInHours < 24) return `Há ${diffInHours} h`;
    if (diffInDays < 7) return `Há ${diffInDays} dias`;
    return formatDate(dateObj);
  };

  // Função para obter iniciais do nome
  const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Função para obter label do role
  const getRoleLabel = (role: string): string => {
    const roleLabels: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Administrador',
      manager: 'Gerente',
      receptionist: 'Recepcionista',
      housekeeping: 'Limpeza',
      accountant: 'Contador',
      viewer: 'Visualizador',
    };
    return roleLabels[role] || role;
  };

  // Dados mockados (podem ser substituídos por dados reais futuramente)
  const userActivities = [
    { action: "Login realizado", time: "Há 5 minutos", device: "Chrome - Windows" },
    { action: "Reserva #1234 criada", time: "Há 2 horas", device: "Chrome - Windows" },
    { action: "Check-in processado", time: "Há 4 horas", device: "App Mobile" },
    { action: "Configurações alteradas", time: "Ontem, 15:30", device: "Chrome - Windows" },
    { action: "Relatório exportado", time: "Ontem, 10:15", device: "Chrome - Windows" },
  ];

  const activeSessions = [
    { device: "Chrome - Windows 11", location: "São Paulo, BR", current: true, lastActive: "Agora" },
    { device: "Safari - iPhone 14", location: "São Paulo, BR", current: false, lastActive: "Há 2 horas" },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando perfil...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!userData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8">
            <CardContent className="text-center">
              <p className="text-muted-foreground">Erro ao carregar dados do perfil</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header com foto de capa */}
          <div className="relative">
            <div className="h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 rounded-xl overflow-hidden">
              <div className="absolute inset-0 opacity-50" />
          </div>
          
          {/* Avatar e info principal */}
          <div className="absolute -bottom-16 left-8 flex items-end gap-6">
            <div className="relative">
              {userData.avatar ? (
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-background shadow-xl">
                  <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-4xl font-bold text-primary-foreground border-4 border-background shadow-xl">
                  {getInitials(userData.name)}
                </div>
              )}
              <button 
                className="absolute -bottom-2 -right-2 p-2 bg-primary rounded-full text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
                disabled={!isEditing}
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-foreground">{userData.name}</h1>
              <p className="text-muted-foreground">{getRoleLabel(userData.role)}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  className={userData.status === 'active' 
                    ? "bg-green-500/10 text-green-500 border-green-500/20" 
                    : userData.status === 'inactive'
                    ? "bg-gray-500/10 text-gray-500 border-gray-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                  }
                >
                  {userData.status === 'active' ? 'Ativo' : userData.status === 'inactive' ? 'Inativo' : 'Suspenso'}
                </Badge>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {getRoleLabel(userData.role)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Botão de editar */}
          <div className="absolute top-4 right-4">
            {isEditing ? (
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="gap-2"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar Perfil
              </Button>
            )}
          </div>
        </div>

        {/* Espaço para o avatar */}
        <div className="h-12" />

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Membro desde</p>
                <p className="font-semibold">{formatDate(userData.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <Mail className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold text-xs truncate">{userData.emailVerified ? 'Verificado' : 'Não verificado'}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Último acesso</p>
                <p className="font-semibold">{formatRelativeTime(userData.lastLogin)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Shield className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">2FA</p>
                <p className="font-semibold">{userData.twoFactorEnabled ? 'Ativado' : 'Desativado'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de conteúdo */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="info" className="gap-2">
              <User className="h-4 w-4" />
              Informações
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              Atividade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value={userData.email} 
                        disabled 
                        className="pl-10 bg-muted" 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      O email não pode ser alterado
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value={formData.phone} 
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing} 
                        className="pl-10" 
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>UUID</Label>
                    <Input value={userData.uuid} disabled className="bg-muted text-xs font-mono" />
                    <p className="text-xs text-muted-foreground">
                      Identificador único do usuário
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Informações da Conta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={getRoleLabel(userData.role)} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Input value={userData.status === 'active' ? 'Ativo' : userData.status === 'inactive' ? 'Inativo' : 'Suspenso'} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Verificado</Label>
                    <Input value={userData.emailVerified ? 'Sim' : 'Não'} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Criação</Label>
                    <Input value={formatDate(userData.createdAt)} disabled className="bg-muted" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    Alterar Senha
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Senha Atual</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nova Senha</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar Nova Senha</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <Button className="w-full">Alterar Senha</Button>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Autenticação em Duas Etapas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`flex items-center justify-between p-4 rounded-lg border ${
                    userData.twoFactorEnabled 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-muted/50 border-border'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Shield className={`h-5 w-5 ${userData.twoFactorEnabled ? 'text-green-500' : 'text-muted-foreground'}`} />
                      <div>
                        <p className="font-medium">
                          {userData.twoFactorEnabled ? '2FA Ativado' : '2FA Desativado'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {userData.twoFactorEnabled 
                            ? 'Via aplicativo autenticador' 
                            : 'Autenticação em duas etapas não está ativada'}
                        </p>
                      </div>
                    </div>
                    <Switch checked={userData.twoFactorEnabled} disabled />
                  </div>
                  <Button variant="outline" className="w-full" disabled>
                    {userData.twoFactorEnabled ? 'Reconfigurar 2FA' : 'Ativar 2FA'} 
                    <span className="ml-2 text-xs text-muted-foreground">(Em breve)</span>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-border/50 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    Sessões Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeSessions.map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${session.current ? 'bg-green-500/10' : 'bg-muted'}`}>
                            <Globe className={`h-5 w-5 ${session.current ? 'text-green-500' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <p className="font-medium">{session.device}</p>
                            <p className="text-sm text-muted-foreground">{session.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            {session.current && <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Sessão atual</Badge>}
                            <p className="text-sm text-muted-foreground mt-1">{session.lastActive}</p>
                          </div>
                          {!session.current && (
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <LogOut className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Preferências de Notificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Novas Reservas", description: "Receba alertas de novas reservas", enabled: true },
                  { title: "Check-ins", description: "Notificações de check-ins pendentes", enabled: true },
                  { title: "Check-outs", description: "Alertas de check-outs do dia", enabled: true },
                  { title: "Relatórios", description: "Relatórios diários e semanais", enabled: false },
                  { title: "Atualizações do Sistema", description: "Novidades e atualizações", enabled: true },
                  { title: "Marketing", description: "Dicas e ofertas especiais", enabled: false },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked={item.enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Histórico de Atividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-muted-foreground">{activity.time}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{activity.device}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
