import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Truck,
  Building2,
  FileText,
  Mail,
  Phone,
  MapPin,
  User,
  Package,
  Utensils,
  Wrench,
  Sparkles as SparklesIcon,
  Shirt,
  Check,
  Sparkles,
  Globe,
  Clock,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

/** Máscara CNPJ: 00.000.000/0000-00 */
function maskCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
}

/** Máscara Telefone/Celular BR: (00) 0000-0000 ou (00) 00000-0000 */
function maskPhone(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 2) return numbers.length ? `(${numbers}` : "";
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

/** Máscara Real (R$): 1.234,56 */
function maskBRL(value: string): string {
  const cleaned = value.replace(/[^\d,]/g, "");
  if (!cleaned) return "";

  const [rawInteger = "", rawDecimal = ""] = cleaned.split(",");
  const integerDigits = rawInteger.replace(/\D/g, "");
  const decimalDigits = rawDecimal.replace(/\D/g, "").slice(0, 2);

  const integerNumber = integerDigits ? Number(integerDigits) : 0;
  const integerFormatted = integerNumber.toLocaleString("pt-BR");
  const decimalFormatted = decimalDigits.padEnd(2, "0");

  return `${integerFormatted},${decimalFormatted}`;
}

/** Máscara BRL em tempo real: 1000 -> R$ 10,00 */
function maskBRLFromIntegerInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const valueAsNumber = Number(digits) / 100;
  return valueAsNumber.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Converte número para string em formato BRL (ex.: 2222 → "R$ 2.222,00") */
function numberToBRL(n: number): string {
  return Number(n || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Converte string BRL para número (ex.: "2.222,00" → 2222) */
function parseBRL(value: string): number {
  if (!value || !value.trim()) return 0;
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return parseFloat(normalized) || 0;
}

/** Categoria de fornecedor (API) */
export interface ApiSupplierCategory {
  id: number;
  code: string;
  name: string;
  icon?: string | null;
  colorFrom?: string | null;
  colorTo?: string | null;
}

/** Fornecedor (API) para edição */
export interface ApiSupplierInitial {
  id: number;
  propertyId?: number | null;
  categoryId: number;
  name: string;
  tradeName?: string | null;
  cnpj?: string | null;
  stateRegistration?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  zipCode?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  paymentTerms?: number | null;
  deliveryDays?: number | null;
  minOrderValue?: number | null;
  notes?: string | null;
  status: string;
}

interface SupplierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ApiSupplierInitial | null;
  onSuccess?: () => void;
  categories?: ApiSupplierCategory[];
}

const categoryFallbacks: { id: string; icon: typeof Package; label: string; color: string }[] = [
  { id: "food", icon: Utensils, label: "Alimentos", color: "from-amber-500 to-amber-600" },
  { id: "beverages", icon: Package, label: "Bebidas", color: "from-cyan-500 to-cyan-600" },
  { id: "cleaning", icon: SparklesIcon, label: "Limpeza", color: "from-blue-500 to-blue-600" },
  { id: "maintenance", icon: Wrench, label: "Manutenção", color: "from-gray-500 to-gray-600" },
  { id: "laundry", icon: Shirt, label: "Lavanderia", color: "from-violet-500 to-violet-600" },
  { id: "equipment", icon: Package, label: "Equipamentos", color: "from-emerald-500 to-emerald-600" },
];

const configSteps = [
  { id: "category", title: "Categoria", description: "Tipo de fornecedor", icon: Package },
  { id: "info", title: "Dados", description: "Informações da empresa", icon: Building2 },
  { id: "contact", title: "Contato", description: "Dados de contato", icon: Mail },
  { id: "commercial", title: "Comercial", description: "Condições comerciais", icon: Clock },
];
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400";

export function SupplierModal({ open, onOpenChange, initialData, onSuccess, categories: categoriesProp = [] }: SupplierModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [categories, setCategories] = useState<ApiSupplierCategory[]>(categoriesProp);
  const [properties, setProperties] = useState<{ id: number; name?: string; address?: string }[]>([]);
  const [formData, setFormData] = useState({
    propertyId: "",
    categoryId: "",
    name: "",
    tradeName: "",
    cnpj: "",
    ie: "",
    email: "",
    phone: "",
    whatsapp: "",
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
    paymentTerms: "",
    deliveryDays: "",
    minOrder: "",
    notes: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!initialData?.id;
  const displayCategories = categories;

  useEffect(() => {
    if (open && categoriesProp.length > 0) setCategories(categoriesProp);
  }, [open, categoriesProp]);

  useEffect(() => {
    if (open && categories.length === 0) {
      api.getSupplierCategories().then((res) => {
        if (res.success && res.data?.categories) setCategories((res.data.categories as ApiSupplierCategory[]) || []);
      });
    }
  }, [open, categories.length]);

  useEffect(() => {
    if (open && properties.length === 0) {
      api.getProperties().then((res) => {
        const data = (res as { data?: { properties?: { id: number; name?: string; address?: string }[] } }).data;
        if (data?.properties) setProperties(data.properties);
      });
    }
  }, [open, properties.length]);

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setFormData({
        propertyId: initialData.propertyId != null ? String(initialData.propertyId) : "",
        categoryId: String(initialData.categoryId ?? ""),
        name: initialData.name || "",
        tradeName: initialData.tradeName || "",
        cnpj: initialData.cnpj ? maskCNPJ(initialData.cnpj) : "",
        ie: initialData.stateRegistration || "",
        email: initialData.email || "",
        phone: initialData.phone ? maskPhone(initialData.phone) : "",
        whatsapp: initialData.whatsapp ? maskPhone(initialData.whatsapp) : "",
        website: initialData.website || "",
        contactName: initialData.contactName || "",
        contactEmail: initialData.contactEmail || "",
        contactPhone: initialData.contactPhone ? maskPhone(initialData.contactPhone) : "",
        cep: initialData.zipCode || "",
        street: initialData.address || "",
        number: "",
        complement: "",
        neighborhood: "",
        city: initialData.city || "",
        state: initialData.state || "",
        paymentTerms: initialData.paymentTerms === 0 || initialData.paymentTerms === null ? "avista" : String(initialData.paymentTerms),
        deliveryDays: initialData.deliveryDays != null ? String(initialData.deliveryDays) : "",
        minOrder: initialData.minOrderValue != null ? numberToBRL(initialData.minOrderValue) : "",
        notes: initialData.notes || "",
        isActive: initialData.status === "active",
      });
    } else {
      setFormData({
        propertyId: "",
        categoryId: "",
        name: "",
        tradeName: "",
        cnpj: "",
        ie: "",
        email: "",
        phone: "",
        whatsapp: "",
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
        paymentTerms: "",
        deliveryDays: "",
        minOrder: "",
        notes: "",
        isActive: true,
      });
    }
  }, [open, initialData]);

  const progressPercent = ((currentStep + 1) / configSteps.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === configSteps.length - 1;

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

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const propertyId = formData.propertyId ? parseInt(formData.propertyId, 10) : 0;
    const categoryId = formData.categoryId ? parseInt(formData.categoryId, 10) : 0;
    if (!isEdit && !propertyId) {
      toast.error("Selecione a propriedade para o fornecedor.");
      return;
    }
    if (!categoryId || !formData.name?.trim()) {
      toast.error("Preencha a categoria e o nome do fornecedor.");
      return;
    }
    const address = [formData.street, formData.number, formData.complement, formData.neighborhood].filter(Boolean).join(", ") || null;
    const paymentTermsNum = formData.paymentTerms === "avista" ? 0 : (parseInt(formData.paymentTerms, 10) || null);
    const payload = {
      ...(propertyId ? { propertyId } : {}),
      categoryId,
      name: formData.name.trim(),
      tradeName: formData.tradeName?.trim() || null,
      cnpj: formData.cnpj?.trim() || null,
      stateRegistration: formData.ie?.trim() || null,
      email: formData.email?.trim() || null,
      phone: formData.phone?.trim() || null,
      whatsapp: formData.whatsapp?.trim() || null,
      website: formData.website?.trim() || null,
      contactName: formData.contactName?.trim() || null,
      contactEmail: formData.contactEmail?.trim() || null,
      contactPhone: formData.contactPhone?.trim() || null,
      zipCode: formData.cep?.trim() || null,
      address,
      city: formData.city?.trim() || null,
      state: formData.state?.trim() || null,
      paymentTerms: paymentTermsNum,
      deliveryDays: formData.deliveryDays ? parseInt(formData.deliveryDays, 10) : null,
      minOrderValue: formData.minOrder ? parseBRL(formData.minOrder) : null,
      notes: formData.notes?.trim() || null,
      status: formData.isActive ? "active" as const : "inactive" as const,
    };

    setSubmitting(true);
    try {
      const res = isEdit
        ? await api.updateSupplier(initialData!.id, payload)
        : await api.createSupplier(payload);
      setSubmitting(false);
      if (res.success) {
        toast.success(isEdit ? "Fornecedor atualizado." : "Fornecedor cadastrado com sucesso.");
        onSuccess?.();
        handleClose();
      } else {
        toast.error((res.error as { message?: string })?.message ?? (isEdit ? "Erro ao atualizar." : "Erro ao cadastrar."));
      }
    } catch {
      setSubmitting(false);
      toast.error("Erro ao processar.");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep(0);
  };

  const selectedCategory = displayCategories.find((c) => c.id === Number(formData.categoryId));

  const renderStepContent = () => {
    switch (configSteps[currentStep].id) {
      case "category":
        return (
          <div className="space-y-6">
            {/* Propriedade: cards grandes selecionáveis */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-slate-500/5 to-zinc-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-slate-500 to-zinc-500">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Propriedade</h3>
                  <p className="text-sm text-muted-foreground">Selecione a propriedade a que o fornecedor será vinculado</p>
                </div>
              </div>
              {properties.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">Carregando propriedades...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.map((p) => {
                    const selected = formData.propertyId === String(p.id);
                    const image = (p as { image?: string }).image;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, propertyId: String(p.id) }))}
                        className={cn(
                          "rounded-xl border-2 overflow-hidden transition-all text-left min-h-[140px]",
                          selected
                            ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                            : "border-border hover:border-primary/50 bg-background"
                        )}
                      >
                        <div className="h-28 flex items-center justify-center bg-gradient-to-br from-slate-100 to-zinc-100 dark:from-slate-800 dark:to-zinc-800">
                          {image ? (
                            <img
                              src={image}
                              alt={p.name || ""}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className={cn("h-12 w-12", selected ? "text-primary" : "text-muted-foreground")} />
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{p.name || `Propriedade ${p.id}`}</p>
                            {selected && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                          </div>
                          {p.address && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.address}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl border bg-gradient-to-r from-orange-500/5 to-amber-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Categoria do Fornecedor</h3>
                  <p className="text-sm text-muted-foreground">Selecione o tipo de fornecimento</p>
                </div>
              </div>

              {displayCategories.length === 0 ? (
                <p className="text-muted-foreground py-4">Carregando categorias...</p>
              ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayCategories.map((cat) => {
                  const fallback = categoryFallbacks.find((f) => f.id === cat.code);
                  const Icon = fallback?.icon ?? Package;
                  const color = fallback?.color ?? "from-gray-500 to-gray-600";
                  const selected = formData.categoryId === String(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, categoryId: String(cat.id) }))}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all",
                        selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 bg-background"
                      )}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center mx-auto mb-3`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="font-medium text-center">{cat.name}</p>
                      {selected && <CheckCircle2 className="h-5 w-5 text-primary mx-auto mt-2" />}
                    </button>
                  );
                })}
              </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Dados da Empresa</h3>
                  <p className="text-sm text-muted-foreground">Informações básicas do fornecedor</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Razão Social</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Distribuidora ABC LTDA"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tradeName">Nome Fantasia</Label>
                  <Input
                    id="tradeName"
                    placeholder="Ex: ABC Distribuidora"
                    value={formData.tradeName}
                    onChange={(e) => setFormData(prev => ({ ...prev, tradeName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-500" />
                    CNPJ
                  </Label>
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={(e) => setFormData(prev => ({ ...prev, cnpj: maskCNPJ(e.target.value) }))}
                    maxLength={18}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ie">Inscrição Estadual</Label>
                  <Input
                    id="ie"
                    placeholder="IE"
                    value={formData.ie}
                    onChange={(e) => setFormData(prev => ({ ...prev, ie: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "info":
        return (
          <div className="space-y-6">
            {/* Address */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-violet-500/5 to-purple-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Endereço</h3>
                  <p className="text-sm text-muted-foreground">Localização do fornecedor</p>
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
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="street">Logradouro</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      value={formData.number}
                      onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    placeholder="Sala, Andar, etc."
                    value={formData.complement}
                    onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Contato do Fornecedor</h3>
                  <p className="text-sm text-muted-foreground">Dados de comunicação</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contato@fornecedor.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-500" />
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="(00) 0000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: maskPhone(e.target.value) }))}
                    maxLength={15}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    placeholder="(00) 00000-0000"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: maskPhone(e.target.value) }))}
                    maxLength={15}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-500" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    placeholder="www.fornecedor.com.br"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Representante / Vendedor</h3>
                  <p className="text-sm text-muted-foreground">Contato comercial direto</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Nome</Label>
                  <Input
                    id="contactName"
                    placeholder="Ex: João Silva"
                    value={formData.contactName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">E-mail</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="joao@fornecedor.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Celular</Label>
                  <Input
                    id="contactPhone"
                    placeholder="(00) 00000-0000"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: maskPhone(e.target.value) }))}
                    maxLength={15}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "commercial":
        return (
          <div className="space-y-6">
            {/* Commercial Terms */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-amber-500/5 to-orange-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Condições Comerciais</h3>
                  <p className="text-sm text-muted-foreground">Prazos e valores mínimos</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Prazo de Pagamento</Label>
                  <Select value={formData.paymentTerms} onValueChange={(v) => setFormData(prev => ({ ...prev, paymentTerms: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avista">À Vista</SelectItem>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="14">14 dias</SelectItem>
                      <SelectItem value="21">21 dias</SelectItem>
                      <SelectItem value="28">28 dias</SelectItem>
                      <SelectItem value="30">30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryDays">Prazo de Entrega (dias)</Label>
                  <Input
                    id="deliveryDays"
                    type="number"
                    placeholder="Ex: 3"
                    value={formData.deliveryDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryDays: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minOrder">Pedido Mínimo (R$)</Label>
                  <Input
                    id="minOrder"
                    placeholder="R$ 0,00"
                    value={formData.minOrder}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        minOrder: e.target.value.trim() ? maskBRLFromIntegerInput(e.target.value) : "",
                      }))
                    }
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Informações adicionais sobre o fornecedor..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
            </div>

            {/* Status */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <Check className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium">Fornecedor Ativo</p>
                    <p className="text-sm text-muted-foreground">Disponível para pedidos</p>
                  </div>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-orange-500/5 to-red-500/5">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-500" />
                Resumo do Cadastro
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-background border">
                  <p className="text-lg font-bold truncate">{formData.tradeName || formData.name || "-"}</p>
                  <p className="text-xs text-muted-foreground">Nome</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background border">
                  <p className="text-lg font-bold capitalize">
                    {selectedCategory?.name || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">Categoria</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background border">
                  <p className="text-lg font-bold">{formData.deliveryDays || "-"} dias</p>
                  <p className="text-xs text-muted-foreground">Prazo Entrega</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background border">
                  <Badge className={formData.isActive ? "bg-emerald-500" : "bg-red-500"}>
                    {formData.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Status</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl h-[90vh] max-h-[90vh] p-0 gap-0 overflow-hidden">
        <div className="h-full min-h-0 grid md:grid-cols-[300px_1fr]">
          <aside className="hidden md:flex flex-col border-r border-border/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
            <div className="relative p-5 border-b border-white/10">
              <div className="absolute inset-0 opacity-25 bg-cover bg-center" style={{ backgroundImage: `url(${PLACEHOLDER_IMAGE})` }} />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-900/70 to-slate-950/80" />
              <div className="relative">
                <p className="text-xs uppercase tracking-wider text-orange-200/90">Supplier Wizard</p>
                <h3 className="mt-1 text-lg font-semibold">Fluxo por etapas</h3>
                <p className="text-xs text-slate-300 mt-1">Cadastro completo e robusto de fornecedores.</p>
              </div>
            </div>
            <div className="p-5 border-b border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                <span>Progresso do fluxo</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-orange-400 [&>div]:to-red-500" />
            </div>
            <div className="p-4 space-y-2">
              {configSteps.map((step, index) => {
                const Icon = step.icon;
                const done = index < currentStep;
                const active = index === currentStep;
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      "w-full rounded-xl border px-3 py-3 text-left transition-colors",
                      active ? "border-orange-400/40 bg-orange-500/15" : done ? "border-orange-400/30 bg-orange-500/10" : "border-white/10 bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", done ? "bg-orange-400/20 text-orange-300" : "bg-white/10 text-slate-300")}>
                        {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">{`${index + 1}. ${step.title}`}</p>
                        <p className="text-xs text-slate-300 truncate">{step.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
          <div className="flex flex-col min-h-0 min-w-0">
        {/* Header */}
        <div className="relative px-6 py-5 border-b bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-red-500/10 flex-shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-orange-500">
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
            </svg>
          </div>
          
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            <Truck className="h-24 w-24 text-orange-500" />
          </div>

          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-orange-500 to-red-500">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="block">{isEdit ? "Editar Fornecedor" : "Novo Fornecedor"}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Etapa {currentStep + 1} de {configSteps.length} — {configSteps[currentStep].title}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between">
              {configSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs font-medium",
                      isCompleted && "text-emerald-600 bg-emerald-500/10",
                      isCurrent && "text-primary bg-primary/10",
                      !isCompleted && !isCurrent && "text-muted-foreground hover:bg-accent/50"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Icon className={cn("h-4 w-4", isCurrent ? "text-orange-500" : "")} />
                    )}
                    <span className="hidden md:inline">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content - área rolável no meio do modal */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 h-full">
            <div className="p-6 pb-10">
              {renderStepContent()}
            </div>
          </ScrollArea>
        </div>

        {/* Footer with Navigation */}
        <div className="flex items-center justify-between gap-3 p-6 border-t bg-muted/30 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={isFirstStep ? handleClose : handlePrevious}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {isFirstStep ? "Cancelar" : "Anterior"}
          </Button>

          <div className="flex items-center gap-2">
            {configSteps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentStep ? "bg-primary w-6" : index < currentStep ? "bg-emerald-500" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            {isLastStep ? (
              <Button 
                onClick={handleSubmit}
                disabled={submitting}
                className="min-w-[180px] bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEdit ? "Salvar Alterações" : "Cadastrar Fornecedor"}
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={currentStep === 0 && !formData.categoryId}
                className="min-w-[140px] bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}