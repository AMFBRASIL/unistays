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
  Crown,
  Users,
  Building2,
  Home,
  Warehouse,
  TreePalm,
  ChevronRight,
  ChevronLeft,
  Check,
  Medal,
  Award,
  Trophy,
  Gem,
  Mail,
  Phone,
  User,
  Calendar,
  Star,
  MapPin,
  FileText,
  Copy,
  Sparkles,
  Heart,
  Gift,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NewMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const propertyTypes = [
  { id: "hotel", name: "Hotel", icon: Building2, color: "from-blue-500 to-cyan-500", description: "Hospedagem tradicional" },
  { id: "apart-hotel", name: "Apart-Hotel", icon: Home, color: "from-purple-500 to-pink-500", description: "Apartamentos equipados" },
  { id: "loft", name: "Loft", icon: Warehouse, color: "from-amber-500 to-orange-500", description: "Espaços modernos" },
  { id: "temporada", name: "Temporada", icon: TreePalm, color: "from-emerald-500 to-green-500", description: "Aluguel por temporada" },
];

const loyaltyTiers = [
  { id: "bronze", name: "Bronze", icon: Medal, color: "from-amber-600 to-orange-700", points: "0 - 999", discount: 5 },
  { id: "silver", name: "Prata", icon: Award, color: "from-slate-400 to-slate-500", points: "1.000 - 4.999", discount: 10 },
  { id: "gold", name: "Ouro", icon: Trophy, color: "from-amber-400 to-yellow-500", points: "5.000 - 14.999", discount: 15 },
  { id: "platinum", name: "Platina", icon: Gem, color: "from-violet-500 to-purple-600", points: "15.000+", discount: 20 },
];

export function NewMemberModal({ open, onOpenChange }: NewMemberModalProps) {
  const [step, setStep] = useState(1);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    birthDate: "",
    address: "",
    city: "",
    state: "",
    initialPoints: "",
    notes: "",
  });
  const [protocol, setProtocol] = useState("");

  const handlePropertyTypeToggle = (typeId: string) => {
    setSelectedPropertyTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateProtocol = () => {
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `MBR-${dateStr}-${random}`;
  };

  const handleNext = () => {
    if (step === 1 && selectedPropertyTypes.length === 0) {
      toast.error("Selecione pelo menos um tipo de propriedade");
      return;
    }
    if (step === 2 && !selectedTier) {
      toast.error("Selecione um nível de fidelidade");
      return;
    }
    if (step === 3) {
      if (!formData.name || !formData.email) {
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
    setSelectedTier("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      cpf: "",
      birthDate: "",
      address: "",
      city: "",
      state: "",
      initialPoints: "",
      notes: "",
    });
    setProtocol("");
    onOpenChange(false);
  };

  const copyProtocol = () => {
    navigator.clipboard.writeText(protocol);
    toast.success("Protocolo copiado!");
  };

  const selectedTierConfig = loyaltyTiers.find((t) => t.id === selectedTier);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-white relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 border-4 border-white rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 border-4 border-white rounded-full" />
            <Crown className="absolute top-6 right-20 w-8 h-8" />
            <Star className="absolute bottom-6 right-12 w-6 h-6" />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                Novo Membro Fidelidade
              </DialogTitle>
              <p className="text-amber-100 mt-1">
                Cadastre um novo membro no programa de fidelidade
              </p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-6 relative z-10">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    step >= s
                      ? "bg-white text-amber-600"
                      : "bg-white/20 text-white/60"
                  )}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 4 && (
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

        <ScrollArea className="flex-1 min-h-0 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 220px)' }}>
          <div className="p-6 pb-10 space-y-6">
            {/* Step 1: Property Type Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/10 flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Tipos de Propriedade</h3>
                  <p className="text-muted-foreground">
                    Selecione os tipos de propriedade onde o membro poderá acumular pontos
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
                            ? "border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/10"
                            : "border-border hover:border-amber-500/50 hover:bg-accent/50"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
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

                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-700 dark:text-amber-400">Dica</p>
                      <p className="text-sm text-muted-foreground">
                        Membros podem acumular pontos em todos os tipos de propriedade selecionados,
                        permitindo benefícios em toda a rede.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Tier Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center">
                    <Crown className="w-10 h-10 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Nível Inicial</h3>
                  <p className="text-muted-foreground">
                    Defina o nível de fidelidade inicial do membro
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {loyaltyTiers.map((tier) => {
                    const isSelected = selectedTier === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => setSelectedTier(tier.id)}
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
                            tier.color
                          )}
                        >
                          <tier.icon className="w-7 h-7 text-white" />
                        </div>
                        <h4 className="font-semibold text-lg mb-1">{tier.name}</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">{tier.points} pontos</p>
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                            {tier.discount}% desconto
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/5 border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <Gift className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-700 dark:text-purple-400">Benefícios</p>
                      <p className="text-sm text-muted-foreground">
                        Cada nível oferece benefícios exclusivos como descontos, upgrades e
                        experiências VIP.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Member Details */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center">
                    <User className="w-10 h-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Dados do Membro</h3>
                  <p className="text-muted-foreground">
                    Preencha as informações do novo membro
                  </p>
                </div>

                {/* Personal Info */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                      Informações Pessoais
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome Completo *</Label>
                      <Input
                        placeholder="Nome do membro"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CPF</Label>
                      <Input
                        placeholder="000.000.000-00"
                        value={formData.cpf}
                        onChange={(e) => handleInputChange("cpf", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Nascimento</Label>
                      <Input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pontos Iniciais</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.initialPoints}
                        onChange={(e) => handleInputChange("initialPoints", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/5 border border-emerald-500/20 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-emerald-500" />
                    <h4 className="font-semibold text-emerald-700 dark:text-emerald-400">
                      Contato
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        placeholder="(00) 00000-0000"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Address Info */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20 space-y-4">
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
                        placeholder="Rua, número, complemento"
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

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    placeholder="Notas adicionais sobre o membro..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
                    <Check className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-emerald-500">
                      Membro Cadastrado!
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      O novo membro foi adicionado ao programa de fidelidade
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
                    <h4 className="font-semibold text-lg">Resumo do Cadastro</h4>
                    {selectedTierConfig && (
                      <Badge
                        className={cn(
                          "gap-1 text-white",
                          `bg-gradient-to-r ${selectedTierConfig.color}`
                        )}
                      >
                        <selectedTierConfig.icon className="w-3 h-3" />
                        {selectedTierConfig.name}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Membro</p>
                          <p className="font-semibold">{formData.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-semibold">{formData.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <Star className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Pontos Iniciais</p>
                          <p className="font-semibold">
                            {formData.initialPoints || "0"} pontos
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Propriedades</p>
                          <p className="font-semibold">
                            {selectedPropertyTypes.length} tipo(s)
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
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Notificações enviadas</p>
                    <p className="text-xs text-muted-foreground">
                      Email de boas-vindas e cartão de fidelidade digital
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
            {step > 1 && step < 4 && (
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {step < 4 ? (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleNext}
                  className="gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700"
                >
                  {step === 3 ? "Cadastrar Membro" : "Próximo"}
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
                    setSelectedTier("");
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      cpf: "",
                      birthDate: "",
                      address: "",
                      city: "",
                      state: "",
                      initialPoints: "",
                      notes: "",
                    });
                  }}
                  className="gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700"
                >
                  <Plus className="w-4 h-4" />
                  Novo Cadastro
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
