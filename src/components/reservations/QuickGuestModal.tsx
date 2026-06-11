import { useState } from "react";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  User,
  Mail,
  Phone,
  IdCard,
  MapPin,
  Globe,
  Briefcase,
  Calendar,
  Check,
  Sparkles,
  UserPlus,
  Copy,
  ChevronRight,
  ChevronLeft,
  Building2,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QuickGuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuestCreated?: (guest: GuestData) => void;
}

interface GuestData {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthdate: string;
  stateRegistration: string;
  nationality: string;
  address: string;
  addressNumber: string;
  complement: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  company: string;
  occupation: string;
  personType: "fisica" | "juridica";
}

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

// CPF mask function
const formatCPF = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

// CNPJ mask function
const formatCNPJ = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
};

// Phone mask function
const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 2) return `(${numbers}`;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

// CEP mask function
const formatCEP = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

export function QuickGuestModal({ open, onOpenChange, onGuestCreated }: QuickGuestModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<GuestData>({
    id: "",
    name: "",
    email: "",
    phone: "",
    cpf: "",
    birthdate: "",
    stateRegistration: "",
    nationality: "Brasileiro",
    address: "",
    addressNumber: "",
    complement: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Brasil",
    company: "",
    occupation: "",
    personType: "fisica",
  });
  const [protocol, setProtocol] = useState("");
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);

  const fetchAddressByCEP = async (cep: string) => {
    const numbers = cep.replace(/\D/g, "");
    if (numbers.length !== 8) return;

    setIsLoadingCEP(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${numbers}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setFormData(prev => ({
        ...prev,
        address: data.logradouro || prev.address,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
        country: "Brasil",
      }));
      toast.success("Endereço preenchido automaticamente");
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    } finally {
      setIsLoadingCEP(false);
    }
  };

  const handleCEPChange = (value: string) => {
    const formatted = formatCEP(value);
    updateForm("zipCode", formatted);

    const numbers = value.replace(/\D/g, "");
    if (numbers.length === 8) {
      fetchAddressByCEP(numbers);
    }
  };

  const updateForm = (field: keyof GuestData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateProtocol = () => {
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `HSP-${dateStr}-${random}`;
  };

  const generateId = () => {
    return `g${Date.now()}`;
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error("Preencha os campos obrigatórios");
        return;
      }
    }
    if (step === 2) {
      try {
        setIsSaving(true);
        const nameParts = formData.name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || "";

        const payload = {
          firstName,
          lastName,
          email: formData.email,
          phone: formData.phone,
          documentNumber: formData.cpf,
          documentType: 'cpf',
          address: formData.address,
          addressNumber: formData.addressNumber,
          addressComplement: formData.complement,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          nationality: formData.nationality,
          birthDate: formData.birthdate,
          companyName: formData.company,
        };

        const response = await api.createGuest(payload);

        if (response.success) {
          const newProtocol = generateProtocol();
          const newId = response.data?.id ? String(response.data.id) : generateId();
          setProtocol(newProtocol);
          setFormData(prev => ({ ...prev, id: newId }));
          setStep(prev => prev + 1);
          toast.success("Hóspede cadastrado com sucesso!");
        } else {
          toast.error("Erro ao cadastrar: " + (response.error || "Erro desconhecido"));
          return;
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro interno ao criar hóspede");
        return;
      } finally {
        setIsSaving(false);
      }
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handleClose = () => {
    setStep(1);
    setFormData({
      id: "",
      name: "",
      email: "",
      phone: "",
      cpf: "",
      birthdate: "",
      stateRegistration: "",
      nationality: "Brasileiro",
      address: "",
      addressNumber: "",
      complement: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Brasil",
      company: "",
      occupation: "",
      personType: "fisica",
    });
    setProtocol("");
    onOpenChange(false);
  };

  const handleFinish = () => {
    onGuestCreated?.(formData);
    toast.success("Hóspede cadastrado com sucesso!");
    handleClose();
  };

  const copyProtocol = () => {
    navigator.clipboard.writeText(protocol);
    toast.success("Protocolo copiado!");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-24 h-24 border-4 border-white rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-36 h-36 border-4 border-white rounded-full" />
            <UserPlus className="absolute top-6 right-16 w-8 h-8" />
            <User className="absolute bottom-4 right-8 w-6 h-6" />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                Novo Hóspede
              </DialogTitle>
              <p className="text-emerald-100 mt-1">
                Cadastro rápido de hóspede
              </p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-6 relative z-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    step >= s
                      ? "bg-white text-emerald-600"
                      : "bg-white/20 text-white/60"
                  )}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      "w-12 h-1 mx-1 rounded-full transition-all",
                      step > s ? "bg-white" : "bg-white/20"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 overflow-y-auto" style={{ maxHeight: "calc(90vh - 260px)" }}>
          <div className="p-6 pb-10 space-y-6">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Person Type Selection Cards */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-500/5 to-slate-600/10 border border-slate-500/20">
                  <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-500/20">
                      <IdCard className="h-4 w-4 text-slate-500" />
                    </div>
                    Tipo de Pessoa *
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      onClick={() => {
                        updateForm("personType", "fisica");
                        updateForm("cpf", "");
                        updateForm("birthdate", "");
                        updateForm("stateRegistration", "");
                      }}
                      className={cn(
                        "p-5 rounded-xl border-2 cursor-pointer transition-all",
                        formData.personType === "fisica"
                          ? "border-emerald-500 bg-emerald-500/10 shadow-lg"
                          : "border-border hover:border-emerald-500/50 hover:bg-muted/50"
                      )}
                    >
                      <User className={cn(
                        "h-8 w-8 mb-3",
                        formData.personType === "fisica" ? "text-emerald-500" : "text-muted-foreground"
                      )} />
                      <p className={cn(
                        "font-semibold text-lg",
                        formData.personType === "fisica" ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                      )}>Pessoa Física</p>
                      <p className="text-sm text-muted-foreground mt-1">CPF, Nome Completo</p>
                    </div>

                    <div
                      onClick={() => {
                        updateForm("personType", "juridica");
                        updateForm("cpf", "");
                        updateForm("birthdate", "");
                        updateForm("stateRegistration", "");
                      }}
                      className={cn(
                        "p-5 rounded-xl border-2 cursor-pointer transition-all",
                        formData.personType === "juridica"
                          ? "border-blue-500 bg-blue-500/10 shadow-lg"
                          : "border-border hover:border-blue-500/50 hover:bg-muted/50"
                      )}
                    >
                      <Building2 className={cn(
                        "h-8 w-8 mb-3",
                        formData.personType === "juridica" ? "text-blue-500" : "text-muted-foreground"
                      )} />
                      <p className={cn(
                        "font-semibold text-lg",
                        formData.personType === "juridica" ? "text-blue-600 dark:text-blue-400" : "text-foreground"
                      )}>Pessoa Jurídica</p>
                      <p className="text-sm text-muted-foreground mt-1">CNPJ, Razão Social, IE</p>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className={cn(
                  "p-5 rounded-xl border space-y-4",
                  formData.personType === "juridica"
                    ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/5 border-blue-500/20"
                    : "bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border-emerald-500/20"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    {formData.personType === "juridica" ? (
                      <>
                        <Building2 className="w-5 h-5 text-blue-500" />
                        <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                          Identificação da Empresa
                        </h4>
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5 text-emerald-500" />
                        <h4 className="font-semibold text-emerald-700 dark:text-emerald-400">
                          Identificação
                        </h4>
                      </>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label>
                        {formData.personType === "juridica" ? "Razão Social *" : "Nome Completo *"}
                      </Label>
                      <Input
                        placeholder={formData.personType === "juridica" ? "Razão social da empresa" : "Nome do hóspede"}
                        value={formData.name}
                        onChange={(e) => updateForm("name", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          {formData.personType === "juridica" ? "CNPJ" : "CPF"}
                          {formData.cpf && (
                            <Badge variant="outline" className="text-xs">
                              {formData.personType === "juridica" ? "CNPJ" : "CPF"}
                            </Badge>
                          )}
                        </Label>
                        <Input
                          placeholder={formData.personType === "juridica" ? "00.000.000/0000-00" : "000.000.000-00"}
                          value={formData.cpf}
                          onChange={(e) => updateForm("cpf", formData.personType === "juridica" ? formatCNPJ(e.target.value) : formatCPF(e.target.value))}
                          maxLength={formData.personType === "juridica" ? 18 : 14}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{formData.personType === "juridica" ? "Data de Abertura" : "Data de Nascimento"}</Label>
                        <Input
                          type="date"
                          value={formData.birthdate}
                          onChange={(e) => updateForm("birthdate", e.target.value)}
                        />
                      </div>
                    </div>
                    {formData.personType === "juridica" && (
                      <div className="space-y-2">
                        <Label>Inscrição Estadual (IE)</Label>
                        <Input
                          placeholder="Inscrição Estadual"
                          value={formData.stateRegistration}
                          onChange={(e) => updateForm("stateRegistration", e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                      Contato
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>E-mail *</Label>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={formData.email}
                        onChange={(e) => updateForm("email", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone/WhatsApp *</Label>
                      <Input
                        placeholder="(00) 00000-0000"
                        value={formData.phone}
                        onChange={(e) => updateForm("phone", formatPhone(e.target.value))}
                        maxLength={15}
                      />
                    </div>
                  </div>
                </div>

                {/* Nationality */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/5 border border-violet-500/20 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-violet-500" />
                    <h4 className="font-semibold text-violet-700 dark:text-violet-400">
                      Nacionalidade
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nacionalidade</Label>
                      <Input
                        placeholder="Brasileiro"
                        value={formData.nationality}
                        onChange={(e) => updateForm("nationality", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>País</Label>
                      <Input
                        placeholder="Brasil"
                        value={formData.country}
                        onChange={(e) => updateForm("country", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address & Professional */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Address */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-amber-500" />
                    <h4 className="font-semibold text-amber-700 dark:text-amber-400">
                      Endereço
                    </h4>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        CEP
                        {isLoadingCEP && (
                          <span className="text-xs text-muted-foreground animate-pulse">
                            Buscando...
                          </span>
                        )}
                      </Label>
                      <Input
                        placeholder="00000-000"
                        value={formData.zipCode}
                        onChange={(e) => handleCEPChange(e.target.value)}
                        maxLength={9}
                        disabled={isLoadingCEP}
                        className="max-w-[180px]"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label>Cidade</Label>
                        <Input
                          placeholder="Cidade"
                          value={formData.city}
                          onChange={(e) => updateForm("city", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Estado</Label>
                        <Select value={formData.state} onValueChange={(v) => updateForm("state", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="UF" />
                          </SelectTrigger>
                          <SelectContent>
                            {brazilianStates.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label>Endereço</Label>
                        <Input
                          placeholder="Rua, Avenida..."
                          value={formData.address}
                          onChange={(e) => updateForm("address", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Número</Label>
                        <Input
                          placeholder="Nº"
                          value={formData.addressNumber}
                          onChange={(e) => updateForm("addressNumber", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Complemento</Label>
                        <Input
                          placeholder="Apto, Bloco..."
                          value={formData.complement}
                          onChange={(e) => updateForm("complement", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-slate-500/10 to-gray-500/5 border border-slate-500/20 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-5 h-5 text-slate-500" />
                    <h4 className="font-semibold text-slate-700 dark:text-slate-400">
                      Informações Profissionais
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Responsável</Label>
                      <Input
                        placeholder="Nome do responsável"
                        value={formData.company}
                        onChange={(e) => updateForm("company", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Profissão</Label>
                      <Input
                        placeholder="Cargo/Profissão"
                        value={formData.occupation}
                        onChange={(e) => updateForm("occupation", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Success Animation */}
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center animate-bounce">
                    <Check className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-600">Hóspede Cadastrado!</h3>
                  <p className="text-muted-foreground">
                    O cadastro foi realizado com sucesso
                  </p>
                </div>

                {/* Protocol */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Protocolo de Cadastro</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl font-mono font-bold text-emerald-600">{protocol}</span>
                    <Button variant="outline" size="icon" onClick={copyProtocol}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-slate-500/5 to-slate-500/10 border border-border space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">Resumo do Cadastro</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-background/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        {formData.personType === "juridica" ? (
                          <Building2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <User className="w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {formData.personType === "juridica" ? "Razão Social" : "Nome"}
                        </p>
                        <p className="font-medium">{formData.name}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-background/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">E-mail</p>
                        <p className="font-medium text-sm">{formData.email}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-background/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-violet-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Telefone</p>
                        <p className="font-medium">{formData.phone}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-background/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <IdCard className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {formData.personType === "juridica" ? "CNPJ" : "CPF"}
                        </p>
                        <p className="font-medium">{formData.cpf || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {formData.city && (
                    <div className="p-3 rounded-lg bg-background/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-rose-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Localização</p>
                        <p className="font-medium">{formData.city}{formData.state ? `, ${formData.state}` : ""}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-700 dark:text-blue-400">E-mail de boas-vindas enviado</p>
                    <p className="text-sm text-muted-foreground">O hóspede receberá as informações de cadastro</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30 flex justify-between items-center flex-shrink-0">
          {step > 1 && step < 3 ? (
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={isSaving}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              {isSaving ? "Salvando..." : (step === 2 ? "Finalizar Cadastro" : "Continuar")}
              {!isSaving && <ChevronRight className="w-4 h-4" />}
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
              <Button
                onClick={handleFinish}
                className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                <Check className="w-4 h-4" />
                Usar este Hóspede
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
