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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Star,
  Check,
  Sparkles,
  Globe,
  Heart,
  Crown,
  Loader2,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface GuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const personTypes = [
  { id: "fisica", icon: User, label: "Pessoa Física", description: "CPF, RG, Data de Nascimento" },
  { id: "juridica", icon: Building2, label: "Pessoa Jurídica", description: "CNPJ, Razão Social, IE" },
];

const loyaltyTiers = [
  { id: "bronze", label: "Bronze", color: "from-amber-700 to-amber-800", icon: Star },
  { id: "silver", label: "Prata", color: "from-slate-400 to-slate-500", icon: Star },
  { id: "gold", label: "Ouro", color: "from-yellow-500 to-yellow-600", icon: Crown },
  { id: "platinum", label: "Platina", color: "from-purple-500 to-purple-600", icon: Crown },
];

export function GuestModal({ open, onOpenChange }: GuestModalProps) {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<any | null>(null);
  const [editingGuest, setEditingGuest] = useState<any | null>(null);
  const [guests, setGuests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    personType: "fisica" as "fisica" | "juridica",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    documentType: "cpf" as "cpf" | "passport" | "rg" | "cnh" | "other" | "",
    documentNumber: "",
    nationality: "Brasil",
    birthDate: "",
    gender: "" as "male" | "female" | "other" | "prefer_not_to_say" | "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    country: "Brasil",
    tier: "bronze" as "bronze" | "silver" | "gold" | "platinum",
    notes: "",
  });

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadGuests();
      if (!editingGuest) {
        setMode("list");
        setStep(1);
      }
    }
  }, [open]);

  // Load guest data when editing
  useEffect(() => {
    if (editingGuest && mode === "edit" && open) {
      loadGuestForEdit(editingGuest.id);
    }
  }, [editingGuest?.id, mode, open]);

  // Filter guests based on search term
  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      if (!searchTerm.trim()) return true;
      const search = searchTerm.toLowerCase().trim();
      const fullName = `${guest.firstName || ""} ${guest.lastName || ""}`.toLowerCase();
      const documentNumber = (guest.documentNumber || "").toLowerCase();
      const email = (guest.email || "").toLowerCase();
      const phone = (guest.phone || "").toLowerCase();
      return (
        fullName.includes(search) ||
        documentNumber.includes(search) ||
        email.includes(search) ||
        phone.includes(search)
      );
    });
  }, [guests, searchTerm]);

  const loadGuests = async () => {
    try {
      setIsLoading(true);
      const response = await api.getGuests();
      if (response.success && response.data?.guests) {
        setGuests(response.data.guests);
      }
    } catch (error) {
      console.error("Erro ao carregar hóspedes:", error);
      toast.error("Erro ao carregar hóspedes");
    } finally {
      setIsLoading(false);
    }
  };

  const loadGuestForEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await api.getGuestById(id);
      if (response.success && response.data?.guest) {
        const guest = response.data.guest;
        
        // Usar firstName e lastName diretamente
        const firstName = guest.firstName || "";
        const lastName = guest.lastName || "";

        // Separar endereço (assumindo formato: "rua, número, complemento")
        let street = "";
        let number = "";
        let complement = "";
        if (guest.address) {
          const addressParts = guest.address.split(",");
          street = addressParts[0]?.trim() || "";
          number = addressParts[1]?.trim() || "";
          complement = addressParts.slice(2).join(",").trim() || "";
        }

        // Determinar tipo de pessoa baseado no documento
        const docType = guest.documentType || "cpf";
        const personType = (docType === "cpf" || docType === "rg" || docType === "cnh" || docType === "passport") ? "fisica" : "juridica";
        
        setFormData({
          personType,
          firstName,
          lastName,
          email: guest.email || "",
          phone: guest.phone || "",
          documentType: guest.documentType || "cpf",
          documentNumber: guest.documentNumber || "",
          nationality: guest.nationality || "Brasil",
          birthDate: guest.birthDate || "",
          gender: guest.gender || "",
          cep: guest.zipCode || "",
          street,
          number,
          complement,
          neighborhood: "", // Não há campo específico no banco
          city: guest.city || "",
          state: guest.state || "",
          country: guest.country || "Brasil",
          tier: guest.tier || "bronze",
          notes: guest.notes || "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar hóspede:", error);
      toast.error("Erro ao carregar dados do hóspede");
      setEditingGuest(null);
      setMode("list");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCEP = async (cep: string) => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro || "",
            neighborhood: data.bairro || "",
            city: data.localidade || "",
            state: data.uf || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching CEP:", error);
      }
    }
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.firstName.trim()) {
      toast.error(formData.personType === "fisica" ? "Nome é obrigatório" : "Razão social é obrigatória");
      return;
    }
    
    if (formData.personType === "fisica" && !formData.lastName.trim()) {
      toast.error("Sobrenome é obrigatório");
      return;
    }

    try {
      setIsSubmitting(true);

      // Montar endereço completo
      const addressParts = [
        formData.street,
        formData.number,
        formData.complement
      ].filter(Boolean);
      const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : null;

      // Para pessoa jurídica, se não tiver lastName, usar firstName (backend exige lastName)
      const finalFirstName = formData.firstName.trim();
      const finalLastName = formData.personType === "juridica" 
        ? (formData.lastName.trim() || finalFirstName)
        : formData.lastName.trim();

      const data = {
        firstName: finalFirstName,
        lastName: finalLastName,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        documentType: formData.documentType || null,
        documentNumber: formData.documentNumber.trim() || null,
        nationality: formData.nationality || null,
        birthDate: formData.birthDate || null,
        gender: formData.gender || null,
        address: fullAddress,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        zipCode: formData.cep.trim() || null,
        country: formData.country || "Brasil",
        tier: formData.tier || "bronze",
        notes: formData.notes.trim() || null,
      };

      let response;
      if (editingGuest) {
        // Update existing
        response = await api.updateGuest(editingGuest.id, data);
        if (response.success) {
          toast.success("Hóspede Atualizado", {
            description: `${formData.firstName} ${formData.lastName} foi atualizado com sucesso!`,
          });
        } else {
          toast.error(response.error?.message || "Erro ao atualizar hóspede");
        }
      } else {
        // Create new
        response = await api.createGuest(data);
        if (response.success) {
          toast.success("Hóspede Cadastrado", {
            description: `${formData.firstName} ${formData.lastName} foi cadastrado com sucesso!`,
          });
        } else {
          toast.error(response.error?.message || "Erro ao cadastrar hóspede");
        }
      }

      if (response.success) {
        await loadGuests();
        setMode("list");
        setEditingGuest(null);
        resetForm();
      }
    } catch (error) {
      console.error(`Erro ao ${editingGuest ? 'atualizar' : 'criar'} hóspede:`, error);
      toast.error(`Erro ao ${editingGuest ? 'atualizar' : 'criar'} hóspede`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setEditingGuest(null);
    setFormData({
      personType: "fisica",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      documentType: "cpf",
      documentNumber: "",
      nationality: "Brasil",
      birthDate: "",
      gender: "",
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      country: "Brasil",
      tier: "bronze",
      notes: "",
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setMode("list");
      resetForm();
    }, 300);
  };

  const handleNewClick = () => {
    setEditingGuest(null);
    setMode("create");
    setStep(1);
    setSearchTerm("");
    resetForm();
  };

  const handleEditClick = async (guest: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGuest(guest);
    setMode("edit");
    setStep(1);
  };

  const handleBackToList = () => {
    setMode("list");
    setEditingGuest(null);
    resetForm();
  };

  const handleDeleteClick = (guest: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setGuestToDelete(guest);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!guestToDelete) return;

    try {
      setIsDeleting(true);
      const response = await api.deleteGuest(guestToDelete.id);

      if (response.success) {
        toast.success("Hóspede Excluído", {
          description: `${guestToDelete.firstName} ${guestToDelete.lastName} foi excluído com sucesso!`,
        });
        setDeleteDialogOpen(false);
        setGuestToDelete(null);
        await loadGuests();
      } else {
        toast.error(response.error?.message || "Erro ao excluir hóspede");
      }
    } catch (error) {
      console.error("Erro ao excluir hóspede:", error);
      toast.error("Erro ao excluir hóspede");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setGuestToDelete(null);
  };

  const getTierInfo = (tier: string) => {
    return loyaltyTiers.find(t => t.id === tier) || loyaltyTiers[0];
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className={`${mode === "list" ? "max-w-7xl" : "max-w-6xl"} max-h-[95vh] p-0 gap-0 overflow-hidden flex flex-col`}>
          {/* Header */}
          <div className="relative px-6 py-5 border-b bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-500/10 flex-shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
              <svg viewBox="0 0 200 200" className="w-full h-full text-emerald-500">
                <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
                <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
              </svg>
            </div>
            
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
              <Users className="h-24 w-24 text-emerald-500" />
            </div>

            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-emerald-500 to-green-500">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {mode === "list" 
                        ? "Hóspedes" 
                        : mode === "edit"
                        ? "Editar Hóspede"
                        : "Novo Hóspede"}
                    </DialogTitle>
                    <p className="text-sm font-normal text-emerald-600">
                      {mode === "list" 
                        ? "Gerencie os hóspedes cadastrados" 
                        : mode === "edit"
                        ? "Edite as informações do hóspede"
                        : "Cadastre um novo hóspede no sistema"}
                    </p>
                  </div>
                </div>
                {(mode === "create" || mode === "edit") && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((s) => (
                      <div
                        key={s}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          step === s
                            ? "bg-emerald-600 text-white"
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
                        <h3 className="text-lg font-semibold">Hóspedes Cadastrados</h3>
                        <p className="text-sm text-muted-foreground">
                          {filteredGuests.length} de {guests.length} {guests.length === 1 ? "hóspede cadastrado" : "hóspedes cadastrados"}
                        </p>
                      </div>
                      <Button
                        onClick={handleNewClick}
                        className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Hóspede
                      </Button>
                    </div>
                    
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome, CPF, CNPJ, e-mail, telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    </div>
                  ) : guests.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhum hóspede cadastrado</p>
                      <Button onClick={handleNewClick} className="mt-4" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar Primeiro Hóspede
                      </Button>
                    </div>
                  ) : filteredGuests.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhum hóspede encontrado com o termo "{searchTerm}"</p>
                    </div>
                  ) : (
                    /* Guests List - Compact Table */
                    <div className="border rounded-lg overflow-hidden">
                      <ScrollArea className="h-[calc(95vh-280px)]">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted/50 border-b sticky top-0 z-10">
                              <tr>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Nome</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">E-mail</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Telefone</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Documento</th>
                                <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">Tier</th>
                                <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {filteredGuests.map((guest) => {
                              const tierInfo = getTierInfo(guest.tier);
                              const TierIcon = tierInfo.icon;
                              
                              return (
                                <tr 
                                  key={guest.id} 
                                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                                >
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium text-sm">
                                        {guest.firstName} {guest.lastName}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-sm text-muted-foreground">
                                      {guest.email || "-"}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-sm text-muted-foreground">
                                      {guest.phone || "-"}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-sm text-muted-foreground">
                                      {guest.documentNumber || "-"}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <Badge 
                                      className={`text-xs text-white bg-gradient-to-r ${tierInfo.color} border-0 shadow-sm`}
                                    >
                                      <TierIcon className="h-3 w-3 mr-1" />
                                      {tierInfo.label}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center justify-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={(e) => handleEditClick(guest, e)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={(e) => handleDeleteClick(guest, e)}
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
                <>
                  {step === 1 && (
                    <div className="space-y-6">
                      {/* Person Type Selection */}
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <User className="h-5 w-5 text-emerald-400" />
                          Tipo de Pessoa
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {personTypes.map((type) => (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  personType: type.id as any,
                                  documentType: type.id === "fisica" ? "cpf" : "other",
                                  firstName: "",
                                  lastName: "",
                                }));
                              }}
                              className={`p-6 rounded-xl border-2 transition-all text-left ${
                                formData.personType === type.id
                                  ? "border-emerald-500 bg-emerald-500/10"
                                  : "border-border hover:border-emerald-300 bg-card"
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${formData.personType === type.id ? "bg-emerald-500/20" : "bg-white/10"}`}>
                                  <type.icon className={`h-6 w-6 ${formData.personType === type.id ? "text-emerald-400" : "text-muted-foreground"}`} />
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground">{type.label}</p>
                                  <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="flex items-center gap-2">
                            <User className="h-4 w-4 text-emerald-400" />
                            {formData.personType === "fisica" ? "Nome" : "Razão Social"}
                          </Label>
                          <Input
                            id="firstName"
                            type="text"
                            placeholder={formData.personType === "fisica" ? "Ex: João" : "Ex: Empresa LTDA"}
                            value={formData.firstName}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              firstName: e.target.value,
                            }))}
                            className="bg-background"
                          />
                        </div>
                        {formData.personType === "fisica" && (
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="flex items-center gap-2">
                              <User className="h-4 w-4 text-emerald-400" />
                              Sobrenome
                            </Label>
                            <Input
                              id="lastName"
                              type="text"
                              placeholder="Ex: da Silva"
                              value={formData.lastName}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                lastName: e.target.value,
                              }))}
                              className="bg-background"
                            />
                          </div>
                        )}
                        {formData.personType === "juridica" && (
                          <div className="space-y-2">
                            <Label htmlFor="document" className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-emerald-400" />
                              CNPJ
                            </Label>
                            <Input
                              id="document"
                              placeholder="00.000.000/0000-00"
                              value={formData.documentNumber}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                documentNumber: e.target.value,
                                documentType: "other",
                              }))}
                              className="bg-background"
                            />
                          </div>
                        )}
                      </div>
                      
                      {formData.personType === "fisica" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="document" className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-emerald-400" />
                              CPF
                            </Label>
                            <Input
                              id="document"
                              placeholder="000.000.000-00"
                              value={formData.documentNumber}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                documentNumber: e.target.value,
                                documentType: "cpf",
                              }))}
                              className="bg-background"
                            />
                          </div>
                        </div>
                      )}

                      {formData.personType === "fisica" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="birthDate" className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-emerald-400" />
                              Data de Nascimento
                            </Label>
                            <Input
                              id="birthDate"
                              type="date"
                              value={formData.birthDate}
                              onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="gender">Gênero</Label>
                            <Select value={formData.gender} onValueChange={(v) => setFormData(prev => ({ ...prev, gender: v as any }))}>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Masculino</SelectItem>
                                <SelectItem value="female">Feminino</SelectItem>
                                <SelectItem value="other">Outro</SelectItem>
                                <SelectItem value="prefer_not_to_say">Prefiro não informar</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nationality" className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-emerald-400" />
                              Nacionalidade
                            </Label>
                            <Input
                              id="nationality"
                              placeholder="Brasil"
                              value={formData.nationality}
                              onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      {/* Contact Info */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                            <Mail className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Informações de Contato</Label>
                            <p className="text-xs text-muted-foreground">E-mail e telefone do hóspede</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="email@exemplo.com"
                              value={formData.email}
                              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-blue-400" />
                              Telefone/WhatsApp
                            </Label>
                            <Input
                              id="phone"
                              placeholder="(00) 00000-0000"
                              value={formData.phone}
                              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      {/* Address */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-violet-500/5 to-purple-500/5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
                            <MapPin className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Endereço</Label>
                            <p className="text-xs text-muted-foreground">Localização do hóspede</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="cep">CEP</Label>
                              <Input
                                id="cep"
                                placeholder="00000-000"
                                value={formData.cep}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, "");
                                  setFormData(prev => ({ ...prev, cep: value }));
                                  fetchCEP(value);
                                }}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="street">Logradouro</Label>
                              <Input
                                id="street"
                                placeholder="Rua, Avenida..."
                                value={formData.street}
                                onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="number">Número</Label>
                              <Input
                                id="number"
                                placeholder="123"
                                value={formData.number}
                                onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="complement">Complemento</Label>
                              <Input
                                id="complement"
                                placeholder="Apto 101"
                                value={formData.complement}
                                onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="neighborhood">Bairro</Label>
                              <Input
                                id="neighborhood"
                                value={formData.neighborhood}
                                onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="city">Cidade</Label>
                              <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="state">Estado</Label>
                              <Input
                                id="state"
                                value={formData.state}
                                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="country">País</Label>
                              <Input
                                id="country"
                                value={formData.country}
                                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-6">
                      {/* Loyalty Program */}
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Crown className="h-5 w-5 text-amber-400" />
                          Programa de Fidelidade
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {loyaltyTiers.map((tier) => (
                            <button
                              key={tier.id}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, tier: tier.id as any }))}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                formData.tier === tier.id
                                  ? "border-amber-500 bg-amber-500/10"
                                  : "border-white/10 bg-white/5 hover:border-white/20"
                              }`}
                            >
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tier.color} flex items-center justify-center mx-auto mb-3`}>
                                <tier.icon className="h-6 w-6 text-white" />
                              </div>
                              <p className="font-medium text-foreground text-center">{tier.label}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <Label htmlFor="notes" className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-emerald-400" />
                          Observações
                        </Label>
                        <Textarea
                          id="notes"
                          placeholder="Informações adicionais sobre o hóspede..."
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          className="bg-background min-h-[100px]"
                        />
                      </div>

                      {/* Summary */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-foreground">Resumo do Cadastro</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 rounded-lg bg-white/5">
                            <p className="text-lg font-bold text-foreground truncate">
                              {formData.firstName} {formData.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">Nome</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-white/5">
                            <p className="text-lg font-bold text-foreground truncate">{formData.email || "-"}</p>
                            <p className="text-xs text-muted-foreground">E-mail</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-white/5">
                            <p className="text-lg font-bold text-foreground">{formData.phone || "-"}</p>
                            <p className="text-xs text-muted-foreground">Telefone</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-white/5">
                            <Badge className={`bg-gradient-to-r ${getTierInfo(formData.tier).color} text-white`}>
                              {getTierInfo(formData.tier).label}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">Fidelidade</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
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
                    onClick={() => step < 4 ? setStep(step + 1) : handleSubmit()}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white shadow-lg shadow-emerald-500/25"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingGuest ? "Atualizando..." : "Cadastrando..."}
                      </>
                    ) : step < 4 ? (
                      "Próximo"
                    ) : editingGuest ? (
                      "Atualizar Hóspede"
                    ) : (
                      "Cadastrar Hóspede"
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
              Tem certeza que deseja excluir o hóspede <strong>{guestToDelete?.firstName} {guestToDelete?.lastName}</strong>?
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                E-mail: {guestToDelete?.email || "N/A"}
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
