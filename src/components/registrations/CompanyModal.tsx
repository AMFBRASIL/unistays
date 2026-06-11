import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
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
  Building2,
  FileText,
  Mail,
  Phone,
  MapPin,
  User,
  Briefcase,
  Globe,
  Check,
  Sparkles,
  Plane,
  Hotel,
  HandshakeIcon,
  Percent,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

/** Empresa no formato da API (getCompanies / getCompanyById) */
export interface ApiCompany {
  id: number;
  uuid?: string;
  type: string;
  name: string;
  tradeName?: string | null;
  cnpj?: string | null;
  stateRegistration?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  zipCode?: string | null;
  address?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string;
  commissionPercentage?: number | null;
  paymentTerms?: string | null;
  notes?: string | null;
  status?: string;
  [key: string]: unknown;
}

interface CompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "create" = Nova Empresa, "edit" = Editar (com companyToEdit) */
  initialMode?: "list" | "create" | "edit";
  /** Empresa a editar; quando definido, abre no modo edição com formulário preenchido */
  companyToEdit?: ApiCompany | null;
  /** Chamado após criar ou atualizar empresa com sucesso */
  onSuccess?: () => void;
}

/** Máscara CNPJ: 00.000.000/0000-00 */
function formatCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 14);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
}

/** Máscara telefone/celular: (00) 00000-0000 (até 11 dígitos) */
function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 2) return numbers ? `(${numbers}` : "";
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

function getInitialFormData() {
  return {
    companyType: "",
    name: "",
    tradeName: "",
    cnpj: "",
    ie: "",
    email: "",
    phone: "",
    website: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    commission: "",
    paymentTerms: "",
    notes: "",
    isActive: true,
  };
}

function fillFormFromCompany(company: ApiCompany) {
  return {
    companyType: company.type || "",
    name: company.name || "",
    tradeName: company.tradeName || "",
    cnpj: company.cnpj ? formatCNPJ(String(company.cnpj).replace(/\D/g, "")) : "",
    ie: company.stateRegistration || "",
    email: company.email || "",
    phone: company.phone ? formatPhone(String(company.phone).replace(/\D/g, "")) : "",
    website: company.website || "",
    contactName: company.contactName || "",
    contactEmail: company.contactEmail || "",
    contactPhone: company.contactPhone ? formatPhone(String(company.contactPhone).replace(/\D/g, "")) : "",
    cep: company.zipCode || "",
    street: company.street || "",
    number: company.number || "",
    complement: company.complement || "",
    neighborhood: company.neighborhood || "",
    city: company.city || "",
    state: company.state || "",
    commission: company.commissionPercentage?.toString() || "",
    paymentTerms: company.paymentTerms || "",
    notes: company.notes || "",
    isActive: company.status === "active",
  };
}

const companyTypes = [
  { id: "agency", icon: Plane, label: "Agência de Viagens", color: "from-blue-500 to-blue-600" },
  { id: "corporate", icon: Briefcase, label: "Corporativo", color: "from-violet-500 to-violet-600" },
  { id: "operator", icon: Globe, label: "Operadora", color: "from-emerald-500 to-emerald-600" },
  { id: "ota", icon: Hotel, label: "OTA", color: "from-amber-500 to-amber-600" },
];

const steps = [
  { id: 1, title: "Tipo e Dados", description: "Informações básicas", icon: Building2 },
  { id: 2, title: "Contatos", description: "E-mail e telefone", icon: Mail },
  { id: 3, title: "Endereço", description: "Localização", icon: MapPin },
  { id: 4, title: "Comercial", description: "Condições e status", icon: HandshakeIcon },
];

export function CompanyModal({ open, onOpenChange, initialMode, companyToEdit, onSuccess }: CompanyModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());

  const editingCompany = companyToEdit ?? null;
  const isEdit = Boolean(editingCompany);

  // Abrir em modo edição com dados da empresa
  useEffect(() => {
    if (open && companyToEdit) {
      setStep(1);
      setFormData(fillFormFromCompany(companyToEdit));
    }
  }, [open, companyToEdit]);

  // Abrir em modo criação: limpar formulário
  useEffect(() => {
    if (open && initialMode === "create" && !companyToEdit) {
      setStep(1);
      setFormData(getInitialFormData());
    }
  }, [open, initialMode, companyToEdit]);

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
    if (!formData.companyType) {
      toast.error("Selecione o tipo de empresa.");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Razão social é obrigatória.");
      return;
    }

    const payload = {
      type: formData.companyType,
      name: formData.name.trim(),
      tradeName: formData.tradeName.trim() || null,
      cnpj: formData.cnpj.trim() || null,
      stateRegistration: formData.ie.trim() || null,
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      website: formData.website?.trim() || null,
      contactName: formData.contactName.trim() || null,
      contactEmail: formData.contactEmail.trim() || null,
      contactPhone: formData.contactPhone.trim() || null,
      zipCode: formData.cep.trim() || null,
      street: formData.street.trim() || null,
      number: formData.number.trim() || null,
      complement: formData.complement.trim() || null,
      neighborhood: formData.neighborhood.trim() || null,
      city: formData.city.trim() || null,
      state: formData.state.trim() || null,
      country: "Brasil",
      commissionPercentage: formData.commission ? parseFloat(formData.commission) : null,
      paymentTerms: formData.paymentTerms || null,
      notes: formData.notes.trim() || null,
      status: formData.isActive ? "active" : "inactive",
    };

    setIsSubmitting(true);
    try {
      if (editingCompany) {
        const res = await api.updateCompany(editingCompany.id, payload);
        if (res.success) {
          toast.success("Empresa atualizada", {
            description: `${formData.name} foi atualizada com sucesso.`,
          });
          onSuccess?.();
          onOpenChange(false);
          setStep(1);
          setFormData(getInitialFormData());
        } else {
          toast.error(res.error?.message ?? "Erro ao atualizar empresa.");
        }
      } else {
        const res = await api.createCompany(payload);
        if (res.success) {
          toast.success("Empresa cadastrada", {
            description: `${formData.name} foi cadastrada com sucesso.`,
          });
          onSuccess?.();
          onOpenChange(false);
          setStep(1);
          setFormData(getInitialFormData());
        } else {
          toast.error(res.error?.message ?? "Erro ao cadastrar empresa.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar empresa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (step / 4) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0 overflow-hidden bg-background border-border">
        {/* Progress Bar */}
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex h-[calc(85vh-4px)]">
          {/* Left Sidebar */}
          <div className="w-72 bg-gradient-to-b from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-r border-border p-6 flex flex-col">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/25">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {isEdit ? "Editar Empresa" : "Nova Empresa"}
                  </h2>
                  <p className="text-xs text-muted-foreground">Etapa {step} de 4</p>
                </div>
              </div>
            </div>

            {/* Steps Navigation */}
            <nav className="flex-1 space-y-2">
              {steps.map((s) => {
                const StepIcon = s.icon;
                const isActive = step === s.id;
                const isCompleted = step > s.id;

                return (
                  <button
                    key={s.id}
                    onClick={() => setStep(s.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                      isActive
                        ? "bg-white dark:bg-background shadow-md border border-violet-200 dark:border-violet-800"
                        : isCompleted
                        ? "bg-white/50 dark:bg-background/50 hover:bg-white dark:hover:bg-background"
                        : "hover:bg-white/50 dark:hover:bg-background/50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25"
                        : isCompleted
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {s.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{s.description}</p>
                    </div>
                    {isActive && (
                      <ArrowRight className="h-4 w-4 text-violet-500" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Help Text */}
            <div className="mt-auto pt-6 border-t border-border/50">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4 text-violet-500 flex-shrink-0 mt-0.5" />
                <p>Cadastre agências, operadoras e parceiros corporativos para gerenciar comissões e reservas.</p>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Content Header */}
            <div className="px-8 py-6 border-b border-border flex-shrink-0">
              <h3 className="text-xl font-semibold text-foreground">
                {steps[step - 1].title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {steps[step - 1].description}
              </p>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
              <div className="p-8 space-y-6">
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Company Type Selection */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-violet-500" />
                        Tipo de Empresa
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {companyTypes.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => setFormData(prev => ({ ...prev, companyType: type.id }))}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              formData.companyType === type.id
                                ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20"
                                : "border-border bg-card hover:border-violet-300 dark:hover:border-violet-700"
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center mb-3`}>
                              <type.icon className="h-6 w-6 text-white" />
                            </div>
                            <p className="font-medium text-foreground">{type.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-violet-500" />
                          Razão Social
                        </Label>
                        <Input
                          id="name"
                          placeholder="Ex: Empresa Viagens LTDA"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tradeName">Nome Fantasia</Label>
                        <Input
                          id="tradeName"
                          placeholder="Ex: Viagens Top"
                          value={formData.tradeName}
                          onChange={(e) => setFormData(prev => ({ ...prev, tradeName: e.target.value }))}
                          className="bg-background border-border"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cnpj" className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-violet-500" />
                          CNPJ
                        </Label>
                        <Input
                          id="cnpj"
                          placeholder="00.000.000/0000-00"
                          value={formData.cnpj}
                          onChange={(e) => setFormData(prev => ({ ...prev, cnpj: formatCNPJ(e.target.value) }))}
                          maxLength={18}
                          className="bg-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ie">Inscrição Estadual</Label>
                        <Input
                          id="ie"
                          placeholder="IE"
                          value={formData.ie}
                          onChange={(e) => setFormData(prev => ({ ...prev, ie: e.target.value }))}
                          className="bg-background border-border"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="p-5 rounded-xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-200/50 dark:border-blue-800/30">
                      <Label className="text-sm font-medium flex items-center gap-2 mb-4">
                        <Mail className="h-4 w-4 text-blue-500" />
                        Contato da Empresa
                      </Label>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-xs">E-mail</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="contato@empresa.com"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-xs flex items-center gap-1">
                            <Phone className="h-3 w-3 text-blue-500" />
                            Telefone
                          </Label>
                          <Input
                            id="phone"
                            placeholder="(00) 00000-0000"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                            maxLength={15}
                            className="bg-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website" className="text-xs flex items-center gap-1">
                            <Globe className="h-3 w-3 text-blue-500" />
                            Website
                          </Label>
                          <Input
                            id="website"
                            placeholder="www.empresa.com.br"
                            value={formData.website}
                            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                            className="bg-background border-border"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Person */}
                    <div className="p-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-800/30">
                      <Label className="text-sm font-medium flex items-center gap-2 mb-4">
                        <User className="h-4 w-4 text-emerald-500" />
                        Contato Principal
                      </Label>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contactName" className="text-xs">Nome do Contato</Label>
                          <Input
                            id="contactName"
                            placeholder="Ex: Maria Silva"
                            value={formData.contactName}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                            className="bg-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactEmail" className="text-xs">E-mail do Contato</Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            placeholder="maria@empresa.com"
                            value={formData.contactEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                            className="bg-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactPhone" className="text-xs">Celular do Contato</Label>
                          <Input
                            id="contactPhone"
                            placeholder="(00) 00000-0000"
                            value={formData.contactPhone}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: formatPhone(e.target.value) }))}
                            maxLength={15}
                            className="bg-background border-border"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    {/* Address */}
                    <div className="p-5 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-800/30">
                      <Label className="text-sm font-medium flex items-center gap-2 mb-4">
                        <MapPin className="h-4 w-4 text-amber-500" />
                        Endereço
                      </Label>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cep" className="text-xs">CEP</Label>
                            <Input
                              id="cep"
                              placeholder="00000-000"
                              value={formData.cep}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                setFormData(prev => ({ ...prev, cep: value }));
                                fetchCEP(value);
                              }}
                              className="bg-background border-border"
                            />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label htmlFor="street" className="text-xs">Logradouro</Label>
                            <Input
                              id="street"
                              placeholder="Rua, Avenida..."
                              value={formData.street}
                              onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                              className="bg-background border-border"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="number" className="text-xs">Número</Label>
                            <Input
                              id="number"
                              placeholder="123"
                              value={formData.number}
                              onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                              className="bg-background border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="complement" className="text-xs">Complemento</Label>
                            <Input
                              id="complement"
                              placeholder="Sala 101"
                              value={formData.complement}
                              onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
                              className="bg-background border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="neighborhood" className="text-xs">Bairro</Label>
                            <Input
                              id="neighborhood"
                              value={formData.neighborhood}
                              onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                              className="bg-background border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city" className="text-xs">Cidade</Label>
                            <Input
                              id="city"
                              value={formData.city}
                              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                              className="bg-background border-border"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    {/* Commercial Terms */}
                    <div className="p-5 rounded-xl bg-pink-50/50 dark:bg-pink-950/10 border border-pink-200/50 dark:border-pink-800/30">
                      <Label className="text-sm font-medium flex items-center gap-2 mb-4">
                        <HandshakeIcon className="h-4 w-4 text-pink-500" />
                        Condições Comerciais
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="commission" className="text-xs flex items-center gap-1">
                            <Percent className="h-3 w-3 text-pink-500" />
                            Comissão (%)
                          </Label>
                          <Input
                            id="commission"
                            placeholder="Ex: 10"
                            value={formData.commission}
                            onChange={(e) => setFormData(prev => ({ ...prev, commission: e.target.value }))}
                            className="bg-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paymentTerms" className="text-xs">Prazo de Pagamento</Label>
                          <Select value={formData.paymentTerms} onValueChange={(v) => setFormData(prev => ({ ...prev, paymentTerms: v }))}>
                            <SelectTrigger className="bg-background border-border">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="avista">À Vista</SelectItem>
                              <SelectItem value="7">7 dias</SelectItem>
                              <SelectItem value="14">14 dias</SelectItem>
                              <SelectItem value="30">30 dias</SelectItem>
                              <SelectItem value="45">45 dias</SelectItem>
                              <SelectItem value="60">60 dias</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Label htmlFor="notes" className="text-xs">Observações</Label>
                        <Textarea
                          id="notes"
                          placeholder="Condições especiais, acordos..."
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          className="bg-background border-border min-h-[80px]"
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div className="p-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-800/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                            <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Empresa Ativa</p>
                            <p className="text-xs text-muted-foreground">Disponível para novas reservas</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                        />
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-5 rounded-xl bg-violet-50/50 dark:bg-violet-950/10 border border-violet-200/50 dark:border-violet-800/30">
                      <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-violet-500" />
                        Resumo do Cadastro
                      </h4>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="text-center p-3 rounded-lg bg-background border border-border">
                          <p className="text-sm font-semibold text-foreground truncate">{formData.tradeName || formData.name || "-"}</p>
                          <p className="text-xs text-muted-foreground">Nome</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-background border border-border">
                          <p className="text-sm font-semibold text-foreground capitalize">
                            {companyTypes.find(t => t.id === formData.companyType)?.label || "-"}
                          </p>
                          <p className="text-xs text-muted-foreground">Tipo</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-background border border-border">
                          <p className="text-sm font-semibold text-foreground">{formData.commission || "0"}%</p>
                          <p className="text-xs text-muted-foreground">Comissão</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-background border border-border">
                          <Badge className={formData.isActive ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}>
                            {formData.isActive ? "Ativa" : "Inativa"}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">Status</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-border flex-shrink-0 bg-muted/30">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => step > 1 ? setStep(step - 1) : onOpenChange(false)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {step > 1 ? "Voltar" : "Cancelar"}
                </Button>
                <Button
                  onClick={() => step < 4 ? setStep(step + 1) : handleSubmit()}
                  disabled={isSubmitting}
                  className="gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isEdit ? "Salvando..." : "Cadastrando..."}
                    </>
                  ) : step < 4 ? (
                    <>
                      Continuar
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : isEdit ? (
                    "Salvar alterações"
                  ) : (
                    "Cadastrar Empresa"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
