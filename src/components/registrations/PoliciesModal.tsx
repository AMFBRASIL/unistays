import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ShieldCheck,
  Calendar,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle2,
  Check,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Building2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PoliciesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PolicyType = "cancellation" | "checkin" | "payment" | "guest" | "occupancy" | "pets" | "other";
type PolicyStatus = "active" | "inactive";

interface PolicyRecord {
  id: number;
  propertyId: number;
  code: string;
  name: string;
  policyType: PolicyType;
  cancellationPolicy: string | null;
  cancellationDeadline: number | null;
  refundPercentage: number | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  minAge: number | null;
  maxOccupancy: number | null;
  childrenPolicy: "free" | "discount" | "full_price" | "not_allowed" | null;
  petsAllowed: boolean;
  petFee: number | null;
  depositRequired: boolean;
  depositType: "percentage" | "fixed" | "nights" | null;
  depositAmount: number | null;
  description: string | null;
  status: PolicyStatus;
}

const policyTypes: { id: PolicyType; label: string; icon: any; color: string; desc: string }[] = [
  { id: "cancellation", label: "Cancelamento", icon: AlertCircle, color: "from-red-500 to-rose-500", desc: "Prazos e reembolsos" },
  { id: "checkin", label: "Check-in/Check-out", icon: Calendar, color: "from-blue-500 to-cyan-500", desc: "Horários e regras de entrada" },
  { id: "payment", label: "Pagamento", icon: DollarSign, color: "from-emerald-500 to-green-500", desc: "Depósito e cobrança" },
  { id: "guest", label: "Hóspedes", icon: Users, color: "from-purple-500 to-violet-500", desc: "Idade e condições" },
  { id: "occupancy", label: "Ocupação", icon: Users, color: "from-amber-500 to-orange-500", desc: "Limites de pessoas" },
  { id: "pets", label: "Animais", icon: ShieldCheck, color: "from-pink-500 to-rose-500", desc: "Permissões para pets" },
  { id: "other", label: "Outras", icon: ShieldCheck, color: "from-slate-500 to-slate-600", desc: "Políticas gerais" },
];

const cancellationPolicies = [
  { id: "free", label: "Cancelamento Gratuito" },
  { id: "flexible", label: "Flexível" },
  { id: "moderate", label: "Moderada" },
  { id: "strict", label: "Rígida" },
  { id: "non_refundable", label: "Não Reembolsável" },
];

export function PoliciesModal({ open, onOpenChange }: PoliciesModalProps) {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"list" | "wizard">("list");
  const [editingPolicyId, setEditingPolicyId] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"all" | PolicyStatus>("all");
  const [formData, setFormData] = useState({
    propertyId: "",
    policyType: "" as PolicyType | "",
    code: "",
    name: "",
    cancellationPolicy: "",
    checkInTime: "14:00",
    checkOutTime: "12:00",
    minAge: "18",
    maxOccupancy: "",
    childrenPolicy: "free",
    petsAllowed: false,
    petFee: "",
    depositRequired: false,
    depositAmount: "",
    depositType: "percentage",
    cancellationDeadline: "",
    refundPercentage: "100",
    notes: "",
    isActive: true,
  });

  const { data: propertiesData } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const response = await api.getProperties();
      return response.success && response.data?.properties ? response.data.properties : [];
    },
    enabled: open,
  });
  const properties = propertiesData || [];

  const { data: policiesData, isLoading } = useQuery({
    queryKey: ["policies", selectedPropertyFilter, selectedStatusFilter],
    queryFn: async () => {
      const response = await api.getPolicies(
        undefined,
        selectedPropertyFilter !== "all" ? Number(selectedPropertyFilter) : undefined,
        undefined,
        selectedStatusFilter !== "all" ? selectedStatusFilter : undefined
      );
      return response.success && response.data?.policies ? (response.data.policies as PolicyRecord[]) : [];
    },
    enabled: open,
  });
  const policies = policiesData || [];

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      propertyId: "",
      policyType: "",
      code: "",
      name: "",
      cancellationPolicy: "",
      checkInTime: "14:00",
      checkOutTime: "12:00",
      minAge: "18",
      maxOccupancy: "",
      childrenPolicy: "free",
      petsAllowed: false,
      petFee: "",
      depositRequired: false,
      depositAmount: "",
      depositType: "percentage",
      cancellationDeadline: "",
      refundPercentage: "100",
      notes: "",
      isActive: true,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setView("list");
      setEditingPolicyId(null);
      resetForm();
    }, 150);
  };

  const refreshPolicies = () => {
    queryClient.invalidateQueries({ queryKey: ["policies"] });
    queryClient.invalidateQueries({ queryKey: ["setupProgress"] });
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      return api.createPolicy({
        propertyId: Number(formData.propertyId),
        code: formData.code || undefined,
        name: formData.name,
        policyType: formData.policyType as PolicyType,
        cancellationPolicy: (formData.cancellationPolicy || null) as any,
        cancellationDeadline: formData.cancellationDeadline ? Number(formData.cancellationDeadline) : null,
        refundPercentage: formData.refundPercentage ? Number(formData.refundPercentage) : null,
        checkInTime: formData.checkInTime || null,
        checkOutTime: formData.checkOutTime || null,
        minAge: formData.minAge ? Number(formData.minAge) : null,
        maxOccupancy: formData.maxOccupancy ? Number(formData.maxOccupancy) : null,
        childrenPolicy: (formData.childrenPolicy || null) as any,
        petsAllowed: formData.petsAllowed,
        petFee: formData.petFee ? Number(formData.petFee) : null,
        depositRequired: formData.depositRequired,
        depositType: (formData.depositType || null) as any,
        depositAmount: formData.depositAmount ? Number(formData.depositAmount) : null,
        description: formData.notes || null,
        status: formData.isActive ? "active" : "inactive",
      });
    },
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.error?.message || "Erro ao criar política");
      toast.success("Política criada com sucesso");
      setView("list");
      setEditingPolicyId(null);
      resetForm();
      refreshPolicies();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingPolicyId) return { success: false, error: { message: "ID inválido" } };
      return api.updatePolicy(editingPolicyId, {
        propertyId: Number(formData.propertyId),
        code: formData.code || undefined,
        name: formData.name,
        policyType: formData.policyType as PolicyType,
        cancellationPolicy: (formData.cancellationPolicy || null) as any,
        cancellationDeadline: formData.cancellationDeadline ? Number(formData.cancellationDeadline) : null,
        refundPercentage: formData.refundPercentage ? Number(formData.refundPercentage) : null,
        checkInTime: formData.checkInTime || null,
        checkOutTime: formData.checkOutTime || null,
        minAge: formData.minAge ? Number(formData.minAge) : null,
        maxOccupancy: formData.maxOccupancy ? Number(formData.maxOccupancy) : null,
        childrenPolicy: (formData.childrenPolicy || null) as any,
        petsAllowed: formData.petsAllowed,
        petFee: formData.petFee ? Number(formData.petFee) : null,
        depositRequired: formData.depositRequired,
        depositType: (formData.depositType || null) as any,
        depositAmount: formData.depositAmount ? Number(formData.depositAmount) : null,
        description: formData.notes || null,
        status: formData.isActive ? "active" : "inactive",
      });
    },
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.error?.message || "Erro ao atualizar política");
      toast.success("Política atualizada com sucesso");
      setView("list");
      setEditingPolicyId(null);
      resetForm();
      refreshPolicies();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.deletePolicy(id),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.error?.message || "Erro ao excluir política");
      toast.success("Política excluída");
      refreshPolicies();
    },
  });

  const progress = useMemo(() => Math.round((currentStep / 3) * 100), [currentStep]);
  const selectedType = policyTypes.find((p) => p.id === formData.policyType);

  const startNew = () => {
    setEditingPolicyId(null);
    resetForm();
    setView("wizard");
  };

  const startEdit = (policy: PolicyRecord) => {
    setEditingPolicyId(policy.id);
    setFormData({
      propertyId: String(policy.propertyId),
      policyType: policy.policyType || "",
      code: policy.code || "",
      name: policy.name || "",
      cancellationPolicy: policy.cancellationPolicy || "",
      checkInTime: policy.checkInTime ? String(policy.checkInTime).slice(0, 5) : "14:00",
      checkOutTime: policy.checkOutTime ? String(policy.checkOutTime).slice(0, 5) : "12:00",
      minAge: policy.minAge != null ? String(policy.minAge) : "18",
      maxOccupancy: policy.maxOccupancy != null ? String(policy.maxOccupancy) : "",
      childrenPolicy: policy.childrenPolicy || "free",
      petsAllowed: !!policy.petsAllowed,
      petFee: policy.petFee != null ? String(policy.petFee) : "",
      depositRequired: !!policy.depositRequired,
      depositAmount: policy.depositAmount != null ? String(policy.depositAmount) : "",
      depositType: policy.depositType || "percentage",
      cancellationDeadline: policy.cancellationDeadline != null ? String(policy.cancellationDeadline) : "",
      refundPercentage: policy.refundPercentage != null ? String(policy.refundPercentage) : "100",
      notes: policy.description || "",
      isActive: policy.status === "active",
    });
    setCurrentStep(1);
    setView("wizard");
  };

  const submit = () => {
    if (!formData.propertyId) return toast.error("Selecione a propriedade");
    if (!formData.policyType) return toast.error("Selecione o tipo de política");
    if (!formData.name.trim()) return toast.error("Informe o nome da política");
    if (editingPolicyId) updateMutation.mutate();
    else createMutation.mutate();
  };

  const goNext = () => {
    if (currentStep === 1 && (!formData.propertyId || !formData.policyType || !formData.name.trim())) {
      return toast.error("Preencha os campos obrigatórios da etapa");
    }
    if (currentStep < 3) setCurrentStep((s) => s + 1);
    else submit();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] md:max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden">
        <div className="flex h-full">
          <div className="hidden md:flex w-72 border-r bg-gradient-to-b from-red-500/10 via-rose-500/5 to-background p-6 flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-red-500" />
                Políticas do Hotel
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mt-3">
              Configure políticas reais da propriedade com fluxo robusto e integrado ao banco.
            </p>

            {view === "wizard" && (
              <>
                <div className="mt-8 space-y-4">
                  {[1, 2, 3].map((step) => (
                    <button
                      key={step}
                      onClick={() => setCurrentStep(step)}
                      className={cn(
                        "w-full text-left rounded-xl p-3 border transition",
                        currentStep === step ? "border-red-500 bg-red-500/10" : "border-border hover:border-red-300"
                      )}
                    >
                      <p className="text-xs text-muted-foreground">Etapa {step}</p>
                      <p className="font-medium">
                        {step === 1 && "Tipo e dados principais"}
                        {step === 2 && "Regras operacionais"}
                        {step === 3 && "Revisão e ativação"}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <p className="text-xs text-muted-foreground mb-2">Progresso</p>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
                </div>
              </>
            )}
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="p-5 border-b bg-background/80">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{view === "list" ? "Políticas cadastradas" : editingPolicyId ? "Editar política" : "Nova política"}</p>
                  <p className="text-sm text-muted-foreground">{view === "list" ? "Gerencie múltiplas políticas por propriedade" : "Wizard avançado com dados reais"}</p>
                </div>
                {view === "list" ? (
                  <Button onClick={startNew} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova política
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => { setView("list"); setEditingPolicyId(null); resetForm(); }} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para listagem
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                {view === "list" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Select value={selectedPropertyFilter} onValueChange={setSelectedPropertyFilter}>
                        <SelectTrigger><SelectValue placeholder="Filtrar por propriedade" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as propriedades</SelectItem>
                          {properties.map((property: any) => (
                            <SelectItem key={property.id} value={String(property.id)}>{property.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={selectedStatusFilter} onValueChange={(v: any) => setSelectedStatusFilter(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os status</SelectItem>
                          <SelectItem value="active">Ativa</SelectItem>
                          <SelectItem value="inactive">Inativa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {isLoading && <p className="text-sm text-muted-foreground">Carregando políticas...</p>}
                    {!isLoading && policies.length === 0 && (
                      <Card className="border-dashed"><CardContent className="p-6 text-sm text-muted-foreground">Nenhuma política cadastrada para o filtro atual.</CardContent></Card>
                    )}

                    {policies.map((policy) => {
                      const pType = policyTypes.find((p) => p.id === policy.policyType);
                      const property = properties.find((p: any) => Number(p.id) === Number(policy.propertyId));
                      return (
                        <Card key={policy.id} className="border-border/60">
                          <CardContent className="p-4 flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold">{policy.name}</p>
                                <Badge variant={policy.status === "active" ? "default" : "outline"}>{policy.status === "active" ? "Ativa" : "Inativa"}</Badge>
                                <Badge variant="secondary">{pType?.label || policy.policyType}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{property?.name || `Propriedade #${policy.propertyId}`}</p>
                              <p className="text-xs text-muted-foreground mt-1">{policy.description || "-"}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => startEdit(policy)} className="gap-1"><Pencil className="h-3.5 w-3.5" />Editar</Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(policy.id)} className="gap-1"><Trash2 className="h-3.5 w-3.5" />Excluir</Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {view === "wizard" && (
                  <div className="space-y-6">
                    {currentStep === 1 && (
                      <Card className="border-red-500/20">
                        <CardContent className="p-6 space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Propriedade</Label>
                              <Select value={formData.propertyId} onValueChange={(value) => setFormData((prev) => ({ ...prev, propertyId: value }))}>
                                <SelectTrigger><SelectValue placeholder="Selecione a propriedade" /></SelectTrigger>
                                <SelectContent>{properties.map((property: any) => <SelectItem key={property.id} value={String(property.id)}>{property.name}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Código (opcional)</Label>
                              <Input value={formData.code} onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))} placeholder="Ex: POL-CHECKIN" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Nome da Política</Label>
                            <Input value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} placeholder="Ex: Política padrão de check-in" />
                          </div>

                          <div className="space-y-3">
                            <Label>Tipo de Política</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                              {policyTypes.map((type) => {
                                const Icon = type.icon;
                                const active = formData.policyType === type.id;
                                return (
                                  <button type="button" key={type.id} onClick={() => setFormData((prev) => ({ ...prev, policyType: type.id }))} className={cn("p-4 rounded-xl border-2 transition text-left", active ? "border-red-500 bg-red-500/10" : "border-border hover:border-red-300")}>
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${type.color} text-white flex items-center justify-center mb-2`}><Icon className="h-5 w-5" /></div>
                                    <p className="font-semibold">{type.label}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{type.desc}</p>
                                    {active && <CheckCircle2 className="h-4 w-4 text-red-500 mt-2" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {currentStep === 2 && (
                      <Card className="border-red-500/20">
                        <CardContent className="p-6 space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Check-in</Label><Input type="time" value={formData.checkInTime} onChange={(e) => setFormData((p) => ({ ...p, checkInTime: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Check-out</Label><Input type="time" value={formData.checkOutTime} onChange={(e) => setFormData((p) => ({ ...p, checkOutTime: e.target.value }))} /></div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>Idade mínima</Label><Input value={formData.minAge} onChange={(e) => setFormData((p) => ({ ...p, minAge: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Ocupação máxima</Label><Input value={formData.maxOccupancy} onChange={(e) => setFormData((p) => ({ ...p, maxOccupancy: e.target.value }))} /></div>
                            <div className="space-y-2">
                              <Label>Política de crianças</Label>
                              <Select value={formData.childrenPolicy} onValueChange={(v) => setFormData((p) => ({ ...p, childrenPolicy: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="free">Grátis</SelectItem>
                                  <SelectItem value="discount">Desconto</SelectItem>
                                  <SelectItem value="full_price">Preço integral</SelectItem>
                                  <SelectItem value="not_allowed">Não permitido</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Tipo de cancelamento</Label>
                              <Select value={formData.cancellationPolicy} onValueChange={(v) => setFormData((p) => ({ ...p, cancellationPolicy: v }))}>
                                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                <SelectContent>{cancellationPolicies.map((policy) => <SelectItem key={policy.id} value={policy.id}>{policy.label}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2"><Label>Prazo cancelamento (horas)</Label><Input type="number" value={formData.cancellationDeadline} onChange={(e) => setFormData((p) => ({ ...p, cancellationDeadline: e.target.value }))} /></div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Reembolso (%)</Label><Input type="number" value={formData.refundPercentage} onChange={(e) => setFormData((p) => ({ ...p, refundPercentage: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Taxa PET</Label><Input type="number" value={formData.petFee} onChange={(e) => setFormData((p) => ({ ...p, petFee: e.target.value }))} /></div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-3 rounded-lg border"><Label>Permite animais</Label><Switch checked={formData.petsAllowed} onCheckedChange={(v) => setFormData((p) => ({ ...p, petsAllowed: v }))} /></div>
                            <div className="flex items-center justify-between p-3 rounded-lg border"><Label>Exigir depósito</Label><Switch checked={formData.depositRequired} onCheckedChange={(v) => setFormData((p) => ({ ...p, depositRequired: v }))} /></div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {currentStep === 3 && (
                      <Card className="border-red-500/20">
                        <CardContent className="p-6 space-y-5">
                          <div className="flex items-center gap-2 text-red-500"><Sparkles className="h-4 w-4" /><p className="font-medium">Revisão final</p></div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="p-3 rounded-lg border"><p className="text-muted-foreground">Propriedade</p><p className="font-medium">{properties.find((p: any) => String(p.id) === formData.propertyId)?.name || "-"}</p></div>
                            <div className="p-3 rounded-lg border"><p className="text-muted-foreground">Tipo</p><p className="font-medium">{selectedType?.label || "-"}</p></div>
                            <div className="p-3 rounded-lg border"><p className="text-muted-foreground">Nome</p><p className="font-medium">{formData.name || "-"}</p></div>
                            <div className="p-3 rounded-lg border"><p className="text-muted-foreground">Check-in / Check-out</p><p className="font-medium">{formData.checkInTime} / {formData.checkOutTime}</p></div>
                          </div>
                          <div className="space-y-2"><Label>Descrição</Label><Textarea value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} /></div>
                          <div className="flex items-center justify-between p-3 rounded-lg border"><Label>Política ativa</Label><Switch checked={formData.isActive} onCheckedChange={(v) => setFormData((p) => ({ ...p, isActive: v }))} /></div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t p-4 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{view === "list" ? `${policies.length} política(s)` : `Etapa ${currentStep} de 3`}</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleClose}>Fechar</Button>
                  {view === "wizard" && (
                    <>
                      <Button variant="outline" onClick={() => setCurrentStep((s) => Math.max(1, s - 1))} disabled={currentStep === 1}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Voltar
                      </Button>
                      <Button onClick={goNext} disabled={createMutation.isPending || updateMutation.isPending}>
                        {currentStep < 3 ? (
                          <>
                            Avançar
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            {editingPolicyId ? "Salvar alterações" : "Criar política"}
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

