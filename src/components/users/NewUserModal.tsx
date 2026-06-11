import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Users,
  Eye,
  EyeOff,
  Building2,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  UserPlus,
  KeyRound,
  Briefcase,
  Copy,
  PartyPopper,
  Send,
  FileText,
  X,
  Hotel,
  TreePine,
  Building,
  Home,
  CalendarRange,
  Upload,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface UserData {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: string;
  group?: { id: number }; // Assuming user.group is an object
  properties?: number[];
}

interface NewUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData?: UserData | null;
  onSuccess?: () => void;
}

// Property Types
type PropertyType = "hotel" | "apart-hotel" | "loft" | "temporada";

const propertyTypeConfig: Record<PropertyType, { label: string; icon: typeof Hotel; color: string; bgColor: string }> = {
  hotel: {
    label: "Hotel",
    icon: Hotel,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  "apart-hotel": {
    label: "Apart-Hotel",
    icon: Building,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
  loft: {
    label: "Loft",
    icon: Home,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10"
  },
  temporada: {
    label: "Temporada",
    icon: TreePine,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10"
  }
};

// Roles are now fetched from DB
/* const roles = [
  ...
]; */

// Hardcoded data removed
const generateProtocol = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `USR-${year}${month}${day}-${random}`;
};

export function NewUserModal({ open, onOpenChange, userData, onSuccess }: NewUserModalProps) {
  const isEditMode = !!userData;
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [sendInvite, setSendInvite] = useState(true);
  const [protocol, setProtocol] = useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyType | "all">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Parse name into firstName and lastName
  const parseName = (fullName?: string) => {
    if (!fullName) return { firstName: "", lastName: "" };
    const parts = fullName.trim().split(" ");
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    };
  };

  const initialName = parseName(userData?.name);

  // Fetch Groups (to be used as Roles)
  const { data: groupsData } = useQuery({
    queryKey: ['userGroups'],
    queryFn: async () => {
      const response = await api.getUserGroups();
      return response.success ? response.data.groups : [];
    }
  });

  const { data: propertiesData } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await api.getProperties();
      return response.success ? response.data.properties : [];
    }
  });

  const roles = groupsData?.map((g: any, index: number) => ({
    value: g.id.toString(), // Use Group ID as the "role value"
    label: g.name,
    color: "from-blue-500 to-cyan-500", // Default color
    icon: Shield, // Default icon
    description: g.description || "Sem descrição",
    userCount: g.users?.length || 0 // Assuming backend returns user count or we calculate it
  })) || [];

  // If we need to calculate counts manually from users list (fallback)
  /* Users fetching for role counts */
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.getUsers();
      return response.success ? response.data.users : [];
    }
  });

  // Calculate counts if not available in group data
  const groupCounts = usersData?.reduce((acc: any, user: any) => {
    // Assuming backend user object has group: { id: number }
    const gid = user.group?.id;
    if (gid) acc[gid] = (acc[gid] || 0) + 1;
    return acc;
  }, {}) || {};

  const properties = (propertiesData || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    type: p.type as PropertyType,
    units: p.units?.length || 0
  }));

  const [formData, setFormData] = useState({
    firstName: initialName.firstName,
    lastName: initialName.lastName,
    email: userData?.email || "",
    phone: userData?.phone || "",
    password: "",
    groupId: userData?.group?.id?.toString() || "", // Renamed role to groupId
    selectedProperties: userData?.properties || [] as number[],
    allProperties: !userData?.properties || userData.properties.length === 0,
  });

  // Update form data when userData changes
  useEffect(() => {
    if (userData && open) {
      const nameParts = parseName(userData.name);
      setFormData({
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        email: userData.email || "",
        phone: userData.phone || "",
        password: "",
        groupId: userData.group?.id?.toString() || "",
        selectedProperties: userData.properties || [],
        allProperties: !userData.properties || userData.properties.length === 0,
      });
      setAvatarPreview(userData.avatar || null);
      setAvatarFile(null);
      setStep(1);
    } else if (!userData && open) {
      // Reset for new user
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        groupId: "",
        selectedProperties: [],
        allProperties: true,
      });
      setAvatarPreview(null);
      setAvatarFile(null);
      setStep(1);
    }
  }, [userData, open]);

  const handleSubmit = async () => {
    // Validações básicas
    if (!formData.firstName || !formData.email || !formData.groupId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (isEditMode) {
      // TODO: Implementar edição de usuário
      toast.info("Edição de usuário será implementada em breve");
      return;
    }

    // Validação de senha para novos usuários (apenas se não enviar convite)
    if (!sendInvite && !formData.password) {
      toast.error("A senha é obrigatória quando não enviar convite");
      return;
    }

    if (!sendInvite && formData.password && formData.password.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    // Se enviar convite, gerar senha temporária (será alterada pelo usuário)
    // Por enquanto, vamos gerar uma senha aleatória segura
    let passwordToUse = formData.password;
    if (sendInvite && !formData.password) {
      // Gerar senha temporária aleatória
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      passwordToUse = Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }

    // Criar novo usuário
    try {
      setIsSubmitting(true);

      // Upload avatar first if exists
      let avatarUrl = null;
      if (avatarFile) {
        try {
          const uploadResponse = await api.uploadImage(avatarFile, 'users');
          if (uploadResponse.success && uploadResponse.data?.url) {
            avatarUrl = uploadResponse.data.url;
          }
        } catch (uploadErr) {
          console.error("Failed to upload avatar:", uploadErr);
          toast.error("Falha ao fazer upload do avatar, mas o usuário será criado sem ele.");
        }
      }

      // Combinar firstName e lastName em name
      const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ');

      const response = await api.createUser({
        email: formData.email.trim(),
        password: passwordToUse,
        name: fullName,
        phone: formData.phone?.trim() || null,
        avatar: avatarUrl,
        status: 'active',
        groupId: parseInt(formData.groupId),
        propertyIds: formData.allProperties ? properties.map(p => p.id) : formData.selectedProperties,
      });

      if (response.success) {
        const newProtocol = generateProtocol();
        setProtocol(newProtocol);
        setStep(4);
        toast.success("Usuário criado com sucesso!");

        // Chamar callback para recarregar lista
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(response.error?.message || "Erro ao criar usuário");
      }
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      toast.error("Erro ao criar usuário. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setProtocol("");
      setPropertyTypeFilter("all");
      setSendInvite(true);
      if (!isEditMode) {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          groupId: "",
          selectedProperties: [],
          allProperties: true,
        });
      }
    }, 300);
  };

  const copyProtocol = () => {
    navigator.clipboard.writeText(protocol);
    toast.success("Protocolo copiado!");
  };

  const toggleProperty = (propertyId: number) => {
    setFormData(prev => ({
      ...prev,
      allProperties: false,
      selectedProperties: prev.selectedProperties.includes(propertyId)
        ? prev.selectedProperties.filter(id => id !== propertyId)
        : [...prev.selectedProperties, propertyId]
    }));
  };

  const toggleAllProperties = () => {
    setFormData(prev => ({
      ...prev,
      allProperties: !prev.allProperties,
      selectedProperties: !prev.allProperties ? [] : prev.selectedProperties
    }));
  };

  const filteredProperties = propertyTypeFilter === "all"
    ? properties
    : properties.filter(p => p.type === propertyTypeFilter);

  const getSelectedPropertiesByType = () => {
    const selected = formData.allProperties ? properties : properties.filter(p => formData.selectedProperties.includes(p.id));
    const grouped: Record<PropertyType, typeof properties> = {
      hotel: [],
      "apart-hotel": [],
      loft: [],
      temporada: []
    };
    selected.forEach(p => grouped[p.type].push(p));
    return grouped;
  };

  const selectedRole = roles.find(r => r.value === formData.groupId);

  const canProceedStep1 = formData.firstName && formData.email;
  const canProceedStep2 = formData.groupId && (formData.allProperties || formData.selectedProperties.length > 0);

  const stepsData = [
    { num: 1, title: "Informações", desc: "Dados pessoais" },
    { num: 2, title: "Permissões", desc: "Cargo e propriedades" },
    { num: 3, title: "Acesso", desc: "Credenciais" },
    { num: 4, title: "Concluído", desc: "Sucesso" },
  ];

  return (
    <Dialog open={open} onOpenChange={step === 4 ? handleClose : onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex min-h-[650px]">
          {/* Left Side - Illustration */}
          <div className={`hidden lg:flex w-[320px] p-8 flex-col justify-between relative overflow-hidden transition-all duration-500 ${step === 4
            ? "bg-gradient-to-br from-green-500 via-green-500/90 to-emerald-500"
            : "bg-gradient-to-br from-primary via-primary/90 to-primary/70"
            }`}>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full" />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-6">
                {step === 4 ? (
                  <PartyPopper className="h-7 w-7 text-white" />
                ) : (
                  <UserPlus className="h-7 w-7 text-white" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {step === 4 ? "Sucesso!" : isEditMode ? "Editar Usuário" : "Novo Usuário"}
              </h2>
              <p className="text-white/80 text-sm">
                {step === 4
                  ? isEditMode
                    ? "O usuário foi atualizado com sucesso"
                    : "O usuário foi criado com sucesso e já pode acessar o sistema"
                  : isEditMode
                    ? "Atualize as informações do usuário"
                    : "Adicione um novo membro com acesso às propriedades híbridas"
                }
              </p>
            </div>

            {/* Property Types Legend */}
            {step === 2 && (
              <div className="relative z-10 space-y-2 my-4">
                <p className="text-white/60 text-xs uppercase tracking-wider">Tipos de Propriedade</p>
                {(Object.keys(propertyTypeConfig) as PropertyType[]).map((type) => {
                  const config = propertyTypeConfig[type];
                  const Icon = config.icon;
                  const count = properties.filter(p => p.type === type).length;
                  return (
                    <div key={type} className="flex items-center gap-2 text-white/80 text-sm">
                      <Icon className="h-4 w-4" />
                      <span>{config.label}</span>
                      <span className="text-white/50">({count})</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Steps Indicator */}
            <div className="relative z-10 space-y-4">
              {stepsData.slice(0, 3).map((s) => (
                <div key={s.num} className={`flex items-center gap-3 transition-all duration-300 ${step >= s.num ? "opacity-100" : "opacity-50"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${step === s.num && step !== 4
                    ? "bg-white text-primary shadow-lg scale-110"
                    : step > s.num || step === 4
                      ? "bg-white/30 text-white"
                      : "bg-white/10 text-white/60"
                    }`}>
                    {step > s.num || step === 4 ? <CheckCircle className="h-5 w-5" /> : s.num}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{s.title}</p>
                    <p className="text-white/60 text-xs">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative z-10 flex items-center gap-2 text-white/60 text-xs">
              <Sparkles className="h-4 w-4" />
              <span>HotelFlow Híbrido</span>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex-1 p-8 flex flex-col overflow-y-auto max-h-[650px]">
            {/* Mobile Header */}
            {step !== 4 && (
              <div className="lg:hidden mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{isEditMode ? "Editar Usuário" : "Novo Usuário"}</h2>
                    <p className="text-sm text-muted-foreground">Etapa {step} de 3</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${step >= s ? "bg-primary" : "bg-muted"}`} />
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="flex-1 animate-fade-in">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <User className="h-5 w-5 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold">Informações Pessoais</h3>
                  </div>
                  <p className="text-muted-foreground text-sm ml-12">
                    Preencha os dados básicos do novo usuário
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="flex flex-col items-center justify-center -mt-2 mb-6">
                    <div className="relative group cursor-pointer">
                      <div className={cn(
                        "w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden transition-all duration-300 bg-muted/30 group-hover:border-primary group-hover:bg-primary/5",
                        avatarPreview ? "border-solid border-primary/50" : ""
                      )}>
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
                            <Camera className="h-6 w-6" />
                            <span className="text-[10px] font-medium uppercase tracking-wide">Foto</span>
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleAvatarChange}
                        />
                      </div>
                      {avatarPreview && (
                        <button
                          onClick={() => {
                            setAvatarFile(null);
                            setAvatarPreview(null);
                          }}
                          className="absolute -top-1 -right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Nome *</Label>
                      <Input
                        placeholder="João"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="h-12 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Sobrenome</Label>
                      <Input
                        placeholder="Silva"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="h-12 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="joao.silva@hotel.com"
                        className="h-12 pl-12 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={isEditMode}
                        readOnly={isEditMode}
                      />
                    </div>
                    {isEditMode && (
                      <p className="text-xs text-muted-foreground">
                        O email não pode ser alterado
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="+55 (11) 99999-9999"
                        className="h-12 pl-12 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Preview Card */}
                  {formData.firstName && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border border-primary/20 mt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-lg font-bold text-primary-foreground">
                          {formData.firstName.charAt(0)}{formData.lastName.charAt(0) || ""}
                        </div>
                        <div>
                          <p className="font-semibold">{formData.firstName} {formData.lastName}</p>
                          <p className="text-sm text-muted-foreground">{formData.email || "email@exemplo.com"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Permissions & Properties */}
            {step === 2 && (
              <div className="flex-1 animate-fade-in">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Shield className="h-5 w-5 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-semibold">Cargo e Propriedades</h3>
                  </div>
                  <p className="text-muted-foreground text-sm ml-12">
                    Defina o cargo e acesso às propriedades híbridas
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Role Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Cargo/Perfil *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {roles.map((role: any) => {
                        const IconComp = role.icon;
                        const isSelected = formData.groupId === role.value;
                        const userCount = groupCounts[parseInt(role.value)] || 0;
                        return (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, groupId: role.value })}
                            className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${isSelected
                              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                              : "border-border/50 bg-muted/20 hover:border-primary/30 hover:bg-muted/40"
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center shrink-0`}>
                                <IconComp className="h-4 w-4 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{role.label}</p>
                                <p className="text-xs text-muted-foreground truncate">{role.description}</p>
                              </div>
                              {isSelected && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                              {!isSelected && <Badge variant="secondary" className="ml-auto text-xs">{userCount}</Badge>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>



                  {/* Hybrid Properties Access */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Acesso às Propriedades *</Label>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={formData.allProperties}
                          onCheckedChange={toggleAllProperties}
                          id="all-properties"
                        />
                        <label htmlFor="all-properties" className="text-sm text-muted-foreground cursor-pointer">
                          Todas as propriedades
                        </label>
                      </div>
                    </div>

                    {/* Property Type Filter */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant={propertyTypeFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPropertyTypeFilter("all")}
                        className="text-xs"
                      >
                        Todas
                      </Button>
                      {(Object.keys(propertyTypeConfig) as PropertyType[]).map((type) => {
                        const config = propertyTypeConfig[type];
                        const Icon = config.icon;
                        return (
                          <Button
                            key={type}
                            type="button"
                            variant={propertyTypeFilter === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPropertyTypeFilter(type)}
                            className={cn("text-xs gap-1", propertyTypeFilter === type && config.bgColor)}
                          >
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </Button>
                        );
                      })}
                    </div>

                    {/* Properties List */}
                    <div className="max-h-40 overflow-y-auto border border-border/50 rounded-xl p-2 space-y-1 bg-muted/10">
                      {filteredProperties.map((property) => {
                        const config = propertyTypeConfig[property.type];
                        const Icon = config.icon;
                        const isSelected = formData.allProperties || formData.selectedProperties.includes(property.id);

                        return (
                          <div
                            key={property.id}
                            onClick={() => !formData.allProperties && toggleProperty(property.id)}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer",
                              isSelected
                                ? "bg-primary/10 border border-primary/20"
                                : "hover:bg-muted/50",
                              formData.allProperties && "opacity-70 cursor-not-allowed"
                            )}
                          >
                            <Checkbox
                              checked={isSelected}
                              disabled={formData.allProperties}
                              className="pointer-events-none"
                            />
                            <div className={cn("p-1.5 rounded-md", config.bgColor)}>
                              <Icon className={cn("h-3.5 w-3.5", config.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{property.name}</p>
                              <p className="text-xs text-muted-foreground">{property.units} unidades</p>
                            </div>
                            <Badge variant="outline" className={cn("text-xs shrink-0", config.color)}>
                              {config.label}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>

                    {/* Selected Summary */}
                    {!formData.allProperties && formData.selectedProperties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {formData.selectedProperties.slice(0, 3).map(id => {
                          const prop = properties.find(p => p.id === id);
                          if (!prop) return null;
                          const config = propertyTypeConfig[prop.type];
                          const Icon = config.icon;
                          return (
                            <Badge key={id} variant="secondary" className="text-xs gap-1">
                              <Icon className={cn("h-3 w-3", config.color)} />
                              {prop.name}
                            </Badge>
                          );
                        })}
                        {formData.selectedProperties.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{formData.selectedProperties.length - 3} mais
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {selectedRole && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/5 via-purple-500/10 to-transparent border border-purple-500/20">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedRole.color} flex items-center justify-center`}>
                          <selectedRole.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">{selectedRole.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {formData.allProperties ? "Todas propriedades" : `${formData.selectedProperties.length} propriedades`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Credentials */}
            {step === 3 && (
              <div className="flex-1 animate-fade-in">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <KeyRound className="h-5 w-5 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold">
                      {isEditMode ? "Alterar Senha (Opcional)" : "Credenciais de Acesso"}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm ml-12">
                    {isEditMode
                      ? "Deixe em branco para manter a senha atual"
                      : "Defina como o usuário acessará o sistema"
                    }
                  </p>
                </div>

                <div className="space-y-6">
                  {!isEditMode ? (
                    <>
                      {/* Invite Option */}
                      <div
                        onClick={() => setSendInvite(true)}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${sendInvite
                          ? "border-primary bg-primary/5"
                          : "border-border/50 bg-muted/20 hover:border-primary/30"
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sendInvite ? "bg-primary/20" : "bg-muted"}`}>
                            <Mail className={`h-6 w-6 ${sendInvite ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold">Enviar convite por email</p>
                              <Switch checked={sendInvite} onCheckedChange={setSendInvite} />
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              O usuário receberá um email com link para criar sua própria senha
                            </p>
                            {sendInvite && (
                              <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                <div className="flex items-center gap-2 text-green-600 text-sm">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Método mais seguro e recomendado</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Manual Password Option */}
                      <div
                        onClick={() => setSendInvite(false)}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${!sendInvite
                          ? "border-primary bg-primary/5"
                          : "border-border/50 bg-muted/20 hover:border-primary/30"
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${!sendInvite ? "bg-primary/20" : "bg-muted"}`}>
                            <Lock className={`h-6 w-6 ${!sendInvite ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold">Definir senha manualmente</p>
                              <Switch checked={!sendInvite} onCheckedChange={(v) => setSendInvite(!v)} />
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Você define a senha inicial e informa ao usuário
                            </p>
                          </div>
                        </div>
                      </div>

                      {!sendInvite && (
                        <div className="space-y-2 animate-fade-in">
                          <Label className="text-sm font-medium">Senha Inicial *</Label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="h-12 pl-12 pr-12 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Mínimo 8 caracteres, incluindo letras e números
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Nova Senha (Opcional)</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Deixe em branco para manter a senha atual"
                          className="h-12 pl-12 pr-12 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Deixe em branco para manter a senha atual. Mínimo 8 caracteres se alterar.
                      </p>
                    </div>
                  )}

                  {/* Final Summary with Hybrid Properties */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50 mt-4">
                    <p className="font-semibold mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Resumo do novo usuário
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Nome</p>
                        <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{formData.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cargo</p>
                        <p className="font-medium">{selectedRole?.label || "-"}</p>
                      </div>

                    </div>

                    {/* Properties by Type */}
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <p className="text-muted-foreground text-sm mb-2">Acesso às Propriedades</p>
                      {formData.allProperties ? (
                        <Badge className="bg-primary/20 text-primary">Todas as propriedades ({properties.length})</Badge>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {(Object.keys(propertyTypeConfig) as PropertyType[]).map((type) => {
                            const config = propertyTypeConfig[type];
                            const Icon = config.icon;
                            const count = formData.selectedProperties.filter(id =>
                              properties.find(p => p.id === id)?.type === type
                            ).length;
                            if (count === 0) return null;
                            return (
                              <Badge key={type} variant="outline" className={cn("text-xs gap-1", config.color)}>
                                <Icon className="h-3 w-3" />
                                {count} {config.label}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="flex-1 flex flex-col items-center justify-center animate-fade-in text-center px-4">
                {/* Success Animation */}
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center animate-scale-in">
                    <CheckCircle className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center animate-bounce">
                    <PartyPopper className="h-4 w-4 text-yellow-900" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-2">{isEditMode ? "Usuário Atualizado com Sucesso!" : "Usuário Criado com Sucesso!"}</h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                  {isEditMode
                    ? `${formData.firstName} ${formData.lastName} foi atualizado com sucesso no sistema.`
                    : `${formData.firstName} ${formData.lastName} foi adicionado ao sistema com acesso às propriedades selecionadas.`
                  }
                </p>

                {/* Protocol Card */}
                <div className="w-full max-w-md p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Protocolo de Cadastro</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-2xl font-bold font-mono tracking-wider text-primary">
                      {protocol}
                    </code>
                    <Button variant="ghost" size="icon" onClick={copyProtocol} className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Email Sent Card */}
                <div className="w-full max-w-md p-5 rounded-xl bg-green-500/10 border border-green-500/20 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                      <Send className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-green-700">Email enviado!</p>
                      <p className="text-sm text-green-600">
                        {sendInvite
                          ? `Um convite foi enviado para ${formData.email}`
                          : `Credenciais de acesso enviadas para ${formData.email}`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Summary with Properties */}
                <div className="w-full max-w-md p-4 rounded-xl bg-muted/30 border border-border/50 mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedRole?.color || 'from-primary to-primary/60'} flex items-center justify-center text-lg font-bold text-white`}>
                      {formData.firstName.charAt(0)}{formData.lastName.charAt(0) || ""}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold">{formData.firstName} {formData.lastName}</p>
                      <p className="text-sm text-muted-foreground">{formData.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{selectedRole?.label}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Properties Access Summary */}
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Acesso às propriedades:</p>
                    {formData.allProperties ? (
                      <div className="flex flex-wrap gap-1">
                        {(Object.keys(propertyTypeConfig) as PropertyType[]).map((type) => {
                          const config = propertyTypeConfig[type];
                          const Icon = config.icon;
                          const count = properties.filter(p => p.type === type).length;
                          return (
                            <Badge key={type} variant="outline" className={cn("text-xs gap-1", config.color)}>
                              <Icon className="h-3 w-3" />
                              {count} {config.label}
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {formData.selectedProperties.slice(0, 4).map(id => {
                          const prop = properties.find(p => p.id === id);
                          if (!prop) return null;
                          const config = propertyTypeConfig[prop.type];
                          return (
                            <Badge key={id} variant="secondary" className="text-xs">
                              {prop.name}
                            </Badge>
                          );
                        })}
                        {formData.selectedProperties.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{formData.selectedProperties.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleClose} className="gap-2">
                    <X className="h-4 w-4" />
                    Fechar
                  </Button>
                  <Button onClick={() => {
                    setStep(1);
                    setPropertyTypeFilter("all");
                    setFormData({
                      firstName: "",
                      lastName: "",
                      email: "",
                      phone: "",
                      password: "",
                      groupId: "",
                      selectedProperties: [],
                      allProperties: true,
                    });
                  }} className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Criar Outro Usuário
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation */}
            {step !== 4 && (
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/50">
                <Button
                  variant="ghost"
                  onClick={() => step > 1 ? setStep(step - 1) : onOpenChange(false)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {step > 1 ? "Voltar" : "Cancelar"}
                </Button>

                {step < 3 ? (
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    Continuar
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        {isEditMode ? "Salvar Alterações" : "Criar Usuário"}
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
