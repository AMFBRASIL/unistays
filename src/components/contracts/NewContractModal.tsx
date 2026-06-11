import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  Building2,
  Home,
  Warehouse,
  TreePalm,
  ChevronRight,
  ChevronLeft,
  Check,
  Mail,
  Phone,
  User,
  Calendar,
  MapPin,
  FileText,
  Copy,
  Sparkles,
  Percent,
  DollarSign,
  Clock,
  BedDouble,
  Plus,
  Target,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ContractData {
  id: string;
  company: string;
  cnpj: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  discount: number;
  validFrom: string;
  validTo: string;
  roomNightsLimit: number;
}

interface NewContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editContract?: ContractData | null;
}

const propertyTypes = [
  { id: "hotel", name: "Hotel", icon: Building2, color: "from-blue-500 to-cyan-500", description: "Hospedagem tradicional" },
  { id: "apart-hotel", name: "Apart-Hotel", icon: Home, color: "from-purple-500 to-pink-500", description: "Apartamentos equipados" },
  { id: "loft", name: "Loft", icon: Warehouse, color: "from-amber-500 to-orange-500", description: "Espaços modernos" },
  { id: "temporada", name: "Temporada", icon: TreePalm, color: "from-emerald-500 to-green-500", description: "Aluguel por temporada" },
];

const contractTypes = [
  { id: "corporate", name: "Corporativo", icon: Briefcase, color: "from-blue-500 to-indigo-600", description: "Empresas e corporações" },
  { id: "agency", name: "Agência", icon: Target, color: "from-purple-500 to-pink-500", description: "Agências de viagem" },
  { id: "government", name: "Governo", icon: Shield, color: "from-emerald-500 to-green-500", description: "Órgãos públicos" },
  { id: "partner", name: "Parceiro", icon: Sparkles, color: "from-amber-500 to-orange-500", description: "Parceiros estratégicos" },
];

const roomCategories = [
  { id: "standard", name: "Standard", price: "R$ 250/noite" },
  { id: "superior", name: "Superior", price: "R$ 350/noite" },
  { id: "deluxe", name: "Deluxe", price: "R$ 450/noite" },
  { id: "suite", name: "Suíte", price: "R$ 650/noite" },
  { id: "master", name: "Master Suite", price: "R$ 950/noite" },
];

export function NewContractModal({ open, onOpenChange, editContract }: NewContractModalProps) {
  const isEditing = !!editContract;
  const [step, setStep] = useState(1);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(["hotel"]);
  const [selectedContractType, setSelectedContractType] = useState<string>("corporate");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    companyName: "",
    cnpj: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    city: "",
    state: "",
    discount: "",
    roomNightsLimit: "",
    validFrom: "",
    validTo: "",
    paymentTerms: "",
    notes: "",
  });
  const [protocol, setProtocol] = useState("");

  // Initialize form with edit data when modal opens
  useState(() => {
    if (editContract && open) {
      setFormData({
        companyName: editContract.company,
        cnpj: editContract.cnpj,
        contactName: editContract.contact,
        contactEmail: editContract.email,
        contactPhone: editContract.phone,
        address: editContract.address,
        city: "",
        state: "",
        discount: editContract.discount.toString(),
        roomNightsLimit: editContract.roomNightsLimit.toString(),
        validFrom: editContract.validFrom,
        validTo: editContract.validTo,
        paymentTerms: "",
        notes: "",
      });
    }
  });

  // Effect to populate form when editing
  if (open && editContract && formData.companyName !== editContract.company) {
    setFormData({
      companyName: editContract.company,
      cnpj: editContract.cnpj,
      contactName: editContract.contact,
      contactEmail: editContract.email,
      contactPhone: editContract.phone,
      address: editContract.address,
      city: "",
      state: "",
      discount: editContract.discount.toString(),
      roomNightsLimit: editContract.roomNightsLimit.toString(),
      validFrom: editContract.validFrom,
      validTo: editContract.validTo,
      paymentTerms: "",
      notes: "",
    });
  }

  const handlePropertyTypeToggle = (typeId: string) => {
    setSelectedPropertyTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const handleCategoryToggle = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateProtocol = () => {
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `CTR-${dateStr}-${random}`;
  };

  const handleNext = () => {
    if (step === 1 && selectedPropertyTypes.length === 0) {
      toast.error("Selecione pelo menos um tipo de propriedade");
      return;
    }
    if (step === 2 && !selectedContractType) {
      toast.error("Selecione um tipo de contrato");
      return;
    }
    if (step === 3) {
      if (!formData.companyName || !formData.cnpj || !formData.contactEmail) {
        toast.error("Preencha os campos obrigatórios");
        return;
      }
    }
    if (step === 4) {
      if (!formData.discount || !formData.validFrom || !formData.validTo) {
        toast.error("Preencha os campos obrigatórios");
        return;
      }
      setProtocol(generateProtocol());
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleClose = () => {
    setStep(1);
    setSelectedPropertyTypes([]);
    setSelectedContractType("");
    setSelectedCategories([]);
    setFormData({
      companyName: "",
      cnpj: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      city: "",
      state: "",
      discount: "",
      roomNightsLimit: "",
      validFrom: "",
      validTo: "",
      paymentTerms: "",
      notes: "",
    });
    setProtocol("");
    onOpenChange(false);
  };

  const copyProtocol = () => {
    navigator.clipboard.writeText(protocol);
    toast.success("Protocolo copiado!");
  };

  const selectedContractConfig = contractTypes.find((t) => t.id === selectedContractType);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 border-4 border-white rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 border-4 border-white rounded-full" />
            <Briefcase className="absolute top-6 right-20 w-8 h-8" />
            <FileText className="absolute bottom-6 right-12 w-6 h-6" />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                {isEditing ? "Editar Contrato" : "Novo Contrato Corporativo"}
              </DialogTitle>
              <p className="text-blue-100 mt-1">
                {isEditing ? "Atualize os dados do contrato" : "Cadastre um novo contrato com empresa ou agência"}
              </p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-6 relative z-10">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    step >= s
                      ? "bg-white text-blue-600"
                      : "bg-white/20 text-white/60"
                  )}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 5 && (
                  <div
                    className={cn(
                      "w-8 h-1 mx-1 rounded-full transition-all",
                      step > s ? "bg-white" : "bg-white/20"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 overflow-y-auto" style={{ maxHeight: "calc(90vh - 220px)" }}>
          <div className="p-6 pb-10 space-y-6">
            {/* Step 1: Property Type Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/10 flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Tipos de Propriedade</h3>
                  <p className="text-muted-foreground">
                    Selecione os tipos de propriedade incluídos no contrato
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {propertyTypes.map((type) => {
                    const isSelected = selectedPropertyTypes.includes(type.id);
                    return (
                      <div
                        key={type.id}
                        onClick={() => handlePropertyTypeToggle(type.id)}
                        className={cn(
                          "relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300",
                          isSelected
                            ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10"
                            : "border-border hover:border-blue-500/50 hover:bg-accent/50"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4",
                            type.color
                          )}
                        >
                          <type.icon className="w-7 h-7 text-white" />
                        </div>
                        <h4 className="font-semibold text-lg mb-1">{type.name}</h4>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Contract Type Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Tipo de Contrato</h3>
                  <p className="text-muted-foreground">
                    Selecione o tipo de parceria
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {contractTypes.map((type) => {
                    const isSelected = selectedContractType === type.id;
                    return (
                      <div
                        key={type.id}
                        onClick={() => setSelectedContractType(type.id)}
                        className={cn(
                          "relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300",
                          isSelected
                            ? "border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/10"
                            : "border-border hover:border-purple-500/50 hover:bg-accent/50"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4",
                            type.color
                          )}
                        >
                          <type.icon className="w-7 h-7 text-white" />
                        </div>
                        <h4 className="font-semibold text-lg mb-1">{type.name}</h4>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Company Details */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Dados da Empresa</h3>
                  <p className="text-muted-foreground">
                    Informações da empresa contratante
                  </p>
                </div>

                {/* Company Info */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/5 border border-emerald-500/20 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-emerald-500" />
                    <h4 className="font-semibold text-emerald-700 dark:text-emerald-400">
                      Dados Cadastrais
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Razão Social *</Label>
                      <Input
                        placeholder="Nome da empresa"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CNPJ *</Label>
                      <Input
                        placeholder="00.000.000/0001-00"
                        value={formData.cnpj}
                        onChange={(e) => handleInputChange("cnpj", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                      Contato Principal
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Contato</Label>
                      <Input
                        placeholder="Nome completo"
                        value={formData.contactName}
                        onChange={(e) => handleInputChange("contactName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="email@empresa.com"
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        placeholder="(00) 00000-0000"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-amber-500" />
                    <h4 className="font-semibold text-amber-700 dark:text-amber-400">
                      Endereço
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label>Endereço</Label>
                      <Input
                        placeholder="Av./Rua, número, complemento"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Cidade</Label>
                        <Input
                          placeholder="Cidade"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Estado</Label>
                        <Input
                          placeholder="UF"
                          value={formData.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Contract Terms */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center">
                    <Percent className="w-10 h-10 text-violet-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Condições do Contrato</h3>
                  <p className="text-muted-foreground">
                    Defina os termos e benefícios
                  </p>
                </div>

                {/* Discount & Limits */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/5 border border-violet-500/20 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="w-5 h-5 text-violet-500" />
                    <h4 className="font-semibold text-violet-700 dark:text-violet-400">
                      Descontos e Limites
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Desconto (%) *</Label>
                      <Input
                        type="number"
                        placeholder="Ex: 20"
                        value={formData.discount}
                        onChange={(e) => handleInputChange("discount", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Limite de Room Nights</Label>
                      <Input
                        type="number"
                        placeholder="Ex: 500"
                        value={formData.roomNightsLimit}
                        onChange={(e) => handleInputChange("roomNightsLimit", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Validity */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                      Vigência
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data Início *</Label>
                      <Input
                        type="date"
                        value={formData.validFrom}
                        onChange={(e) => handleInputChange("validFrom", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data Fim *</Label>
                      <Input
                        type="date"
                        value={formData.validTo}
                        onChange={(e) => handleInputChange("validTo", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Room Categories */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/5 border border-emerald-500/20 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BedDouble className="w-5 h-5 text-emerald-500" />
                    <h4 className="font-semibold text-emerald-700 dark:text-emerald-400">
                      Categorias Incluídas
                    </h4>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {roomCategories.map((cat) => {
                      const isSelected = selectedCategories.includes(cat.id);
                      return (
                        <div
                          key={cat.id}
                          onClick={() => handleCategoryToggle(cat.id)}
                          className={cn(
                            "p-3 rounded-xl border-2 cursor-pointer transition-all text-center",
                            isSelected
                              ? "border-emerald-500 bg-emerald-500/10"
                              : "border-border hover:border-emerald-500/50"
                          )}
                        >
                          <p className="font-medium">{cat.name}</p>
                          <p className="text-xs text-muted-foreground">{cat.price}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="space-y-2">
                  <Label>Condições de Pagamento</Label>
                  <Textarea
                    placeholder="Ex: Faturamento mensal com vencimento em 30 dias..."
                    value={formData.paymentTerms}
                    onChange={(e) => handleInputChange("paymentTerms", e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    placeholder="Notas adicionais sobre o contrato..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Success */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
                    <Check className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-emerald-500">
                      Contrato Cadastrado!
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      O contrato corporativo foi criado com sucesso
                    </p>
                  </div>

                  {/* Protocol */}
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/5 border border-emerald-500/20">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">Protocolo</p>
                      <p className="font-mono font-bold text-emerald-500">{protocol}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyProtocol}
                      className="h-8 w-8"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-accent/50 border border-border space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <h4 className="font-semibold text-lg">Resumo do Contrato</h4>
                    {selectedContractConfig && (
                      <Badge
                        className={cn(
                          "gap-1 text-white",
                          `bg-gradient-to-r ${selectedContractConfig.color}`
                        )}
                      >
                        <selectedContractConfig.icon className="w-3 h-3" />
                        {selectedContractConfig.name}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Empresa</p>
                          <p className="font-semibold">{formData.companyName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Percent className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Desconto</p>
                          <p className="font-semibold">{formData.discount}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Vigência</p>
                          <p className="font-semibold">
                            {formData.validFrom && new Date(formData.validFrom).toLocaleDateString("pt-BR")} - {formData.validTo && new Date(formData.validTo).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                          <BedDouble className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Room Nights</p>
                          <p className="font-semibold">
                            {formData.roomNightsLimit || "Ilimitado"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Property Types Tags */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                    {selectedPropertyTypes.map((typeId) => {
                      const type = propertyTypes.find((t) => t.id === typeId);
                      if (!type) return null;
                      return (
                        <Badge
                          key={typeId}
                          variant="outline"
                          className={cn(
                            "gap-1",
                            type.color.replace("from-", "text-").split(" ")[0]
                          )}
                        >
                          <type.icon className="w-3 h-3" />
                          {type.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Notifications */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center border-2 border-background">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-background">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Notificações enviadas</p>
                    <p className="text-xs text-muted-foreground">
                      Email de confirmação e cópia do contrato enviados
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-card flex items-center justify-between flex-shrink-0">
          <div>
            {step > 1 && step < 5 && (
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {step < 5 ? (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleNext}
                  className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  {step === 4 ? "Criar Contrato" : "Próximo"}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    setStep(1);
                    setSelectedPropertyTypes([]);
                    setSelectedContractType("");
                    setSelectedCategories([]);
                    setFormData({
                      companyName: "",
                      cnpj: "",
                      contactName: "",
                      contactEmail: "",
                      contactPhone: "",
                      address: "",
                      city: "",
                      state: "",
                      discount: "",
                      roomNightsLimit: "",
                      validFrom: "",
                      validTo: "",
                      paymentTerms: "",
                      notes: "",
                    });
                  }}
                  className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  Novo Contrato
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
