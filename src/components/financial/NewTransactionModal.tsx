import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccountSelectField } from "./AccountSelectField";
import { 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight, 
  Hotel, 
  Building, 
  TreePine, 
  Home,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle,
  X,
  CreditCard,
  Banknote,
  Wallet,
  Building2,
  Users,
  Sparkles,
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  PiggyBank,
  HandCoins,
  ArrowRightLeft,
  Coins,
  Copy,
  Printer,
  Send,
  Download,
  Mail,
  Plus,
  Paperclip,
  Upload,
  File,
  Image,
  Trash2,
  FolderTree,
  ChevronRight,
  Loader2,
  AlertCircle,
  Percent,
  Tag,
  Palette,
  Type,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NewTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ApiProperty {
  id: number;
  name: string;
  type?: string;
}

interface ApiFinancialCategory {
  id: number;
  name: string;
  type: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

interface ApiPaymentMethod {
  id: number;
  name: string;
}

interface CreateTransactionData {
  type: string;
  financialCategoryId: number;
  chartOfAccountId?: number | null;
  description: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethodId: number | null;
  paymentDate: string;
  propertyId: number;
  notes: string | null;
  attachments: string[] | null;
}

interface ApiAttachment {
  url: string;
}

type PropertyType = "hotel" | "apart-hotel" | "loft" | "temporada";
type TransactionType = "income" | "expense";
type FormStep = 1 | 2 | 3 | 4;

const propertyTypeConfig: Record<PropertyType, { label: string; icon: typeof Hotel; color: string; bgColor: string }> = {
  hotel: { label: "Hotel", icon: Hotel, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  "apart-hotel": { label: "Apart-Hotel", icon: Building, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  loft: { label: "Loft", icon: Home, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  temporada: { label: "Temporada", icon: TreePine, color: "text-emerald-500", bgColor: "bg-emerald-500/10" }
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Hotel, Receipt, Sparkles, Building2, Users, DollarSign, Home, Wallet, Percent, Tag,
  TrendingUp, TrendingDown, CreditCard, Palette, Type,
};

const parseCurrencyToNumber = (value: string): number => {
  if (!value) return 0;
  const normalized = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalized) || 0;
};

const steps = [
  { id: 1, title: "Tipo & Valor", description: "Selecione o tipo e valor", icon: CircleDollarSign },
  { id: 2, title: "Propriedade", description: "Escolha a propriedade", icon: Building2 },
  { id: 3, title: "Classificação", description: "Categoria e conta contábil", icon: FolderTree },
  { id: 4, title: "Detalhes", description: "Pagamento e observações", icon: FileText },
];

const generateProtocol = (type: TransactionType) => {
  const prefix = type === "income" ? "REC" : "DES";
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${date}-${random}`;
};

const formatCurrencyBRL = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  const cents = parseInt(numbers, 10);
  const formatted = (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatted;
};

export function NewTransactionModal({ open, onOpenChange }: NewTransactionModalProps) {
  const queryClient = useQueryClient();
  const [transactionType, setTransactionType] = useState<TransactionType>("income");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyType | "all">("all");
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [protocol, setProtocol] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    financialCategoryId: "" as string,
    chartOfAccountId: "" as string,
    property: "",
    paymentMethod: "",
    date: new Date().toISOString().split('T')[0],
    reference: "",
    notes: "",
  });

  const { data: propertiesData } = useQuery({
    queryKey: ['properties'],
    queryFn: () => api.getProperties(),
    enabled: open,
  });

  const { data: paymentMethodsData } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => api.getPaymentMethods(),
    enabled: open,
  });

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['financial-categories', open],
    queryFn: () => api.getFinancialCategories(undefined, true),
    enabled: open,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const backendProperties = (propertiesData?.data?.properties || []) as ApiProperty[];
  const properties = backendProperties.map((p) => ({
    id: p.id.toString(),
    name: p.name,
    type: (p.type || "hotel") as PropertyType,
  }));

  const apiCategories = categoriesData?.data?.categories || [];
  const incomeFromApi = (apiCategories as ApiFinancialCategory[]).filter((c) => c.type === "income").sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const expenseFromApi = (apiCategories as ApiFinancialCategory[]).filter((c) => c.type === "expense").sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const mapCategory = (c: { id: number; name: string; icon?: string; color?: string }) => {
    const IconComp = ICON_MAP[c.icon || ""] || DollarSign;
    return { value: String(c.id), label: c.name, icon: IconComp, id: c.id };
  };

  const incomeCategories = incomeFromApi.map(mapCategory);
  const expenseCategories = expenseFromApi.map(mapCategory);

  const paymentMethods = ((paymentMethodsData?.data?.paymentMethods || []) as ApiPaymentMethod[]).map((pm) => ({
    value: pm.id.toString(),
    label: pm.name,
    icon: CreditCard,
  }));

  const createMutation = useMutation({
    mutationFn: async (data: CreateTransactionData) => {
      const res = await api.createTransaction(data);
      if (!res.success) throw new Error(res.error?.message || "Erro ao registrar transação");
      return res;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-all'] });
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] });
      const newProtocol = (response.data as { transaction?: { transactionNumber?: string } })?.transaction?.transactionNumber || generateProtocol(transactionType);
      setProtocol(newProtocol);
      setShowSuccess(true);
      toast.success("Transação registrada com sucesso!");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Erro ao registrar transação");
    },
  });

  const filteredProperties = propertyTypeFilter === "all" 
    ? properties 
    : properties.filter(p => p.type === propertyTypeFilter);

  const categories = transactionType === "income" ? incomeCategories : expenseCategories;

  const canSubmit = !!formData.description && !!formData.amount && !!formData.financialCategoryId && !!formData.property && categories.length > 0;

  const canProceed = (step: FormStep): boolean => {
    switch (step) {
      case 1:
        return !!formData.amount && !!formData.description;
      case 2:
        return !!formData.property;
      case 3:
        return !!formData.financialCategoryId;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!formData.description || !formData.amount || !formData.financialCategoryId || !formData.property) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (categories.length === 0) {
      toast.error("Configure as categorias financeiras em Cadastros > Categorias Financeiras");
      return;
    }

    const amountValue = parseCurrencyToNumber(formData.amount);
    if (amountValue <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    try {
      let uploadedAttachments: string[] = [];
      if (attachments.length > 0) {
        toast.loading("Enviando anexos...");
        const uploadResponse = await api.uploadTransactionAttachments(attachments);
        uploadedAttachments = (uploadResponse.data.attachments as ApiAttachment[]).map((a) => a.url);
        toast.dismiss();
      }

      const transactionData: CreateTransactionData = {
        type: transactionType,
        financialCategoryId: parseInt(formData.financialCategoryId, 10),
        chartOfAccountId: formData.chartOfAccountId ? parseInt(formData.chartOfAccountId, 10) : null,
        description: formData.description,
        amount: amountValue,
        currency: 'BRL',
        status: 'completed',
        paymentMethodId: formData.paymentMethod ? parseInt(formData.paymentMethod) : null,
        paymentDate: formData.date,
        propertyId: parseInt(formData.property),
        notes: formData.notes || null,
        attachments: uploadedAttachments.length > 0 ? uploadedAttachments : null,
      };

      createMutation.mutate(transactionData);
    } catch (error: unknown) {
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : "Erro ao enviar anexos");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setShowSuccess(false);
      setCurrentStep(1);
      setProtocol("");
      setTransactionType("income");
      setPropertyTypeFilter("all");
      setAttachments([]);
      setFormData({
        description: "",
        amount: "",
        financialCategoryId: "",
        chartOfAccountId: "",
        property: "",
        paymentMethod: "",
        date: new Date().toISOString().split('T')[0],
        reference: "",
        notes: "",
      });
    }, 300);
  };

  const handleNewTransaction = () => {
    setShowSuccess(false);
    setCurrentStep(1);
    setProtocol("");
    setAttachments([]);
    setFormData({
      description: "",
      amount: "",
      financialCategoryId: "",
      chartOfAccountId: "",
      property: "",
      paymentMethod: "",
      date: new Date().toISOString().split('T')[0],
      reference: "",
      notes: "",
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...files]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const copyProtocol = () => {
    navigator.clipboard.writeText(protocol);
    toast.success("Protocolo copiado!");
  };

  const selectedProperty = properties.find(p => p.id === formData.property);
  const selectedCategory = categories.find(c => c.value === formData.financialCategoryId);

  const accentColor = transactionType === "income" ? "emerald" : "red";
  const secondaryColor = transactionType === "income" ? "teal" : "orange";

  // Step Content Components
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Transaction Type Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => {
            setTransactionType("income");
            setFormData((prev) => ({ ...prev, financialCategoryId: "", chartOfAccountId: "" }));
          }}
          className={cn(
            "relative p-5 rounded-2xl border-2 transition-all overflow-hidden group",
            transactionType === "income"
              ? "border-emerald-500 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 shadow-lg shadow-emerald-500/10"
              : "border-border/50 hover:border-emerald-500/50 hover:bg-emerald-500/5"
          )}
        >
          <div className="absolute -right-4 -top-4 opacity-20">
            <CircleDollarSign className={cn(
              "h-24 w-24 transition-transform group-hover:scale-110",
              transactionType === "income" ? "text-emerald-500" : "text-muted-foreground"
            )} />
          </div>
          
          <div className="relative flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-xl transition-all",
              transactionType === "income" 
                ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg" 
                : "bg-muted"
            )}>
              <ArrowUpRight className={cn(
                "h-6 w-6",
                transactionType === "income" ? "text-white" : "text-muted-foreground"
              )} />
            </div>
            <div className="text-left">
              <p className={cn(
                "font-semibold text-lg",
                transactionType === "income" && "text-emerald-600"
              )}>Receita</p>
              <p className="text-sm text-muted-foreground">Entrada de valores</p>
            </div>
          </div>
          
          {transactionType === "income" && (
            <div className="absolute bottom-2 right-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
          )}
        </button>
        
        <button
          type="button"
          onClick={() => {
            setTransactionType("expense");
            setFormData((prev) => ({ ...prev, financialCategoryId: "", chartOfAccountId: "" }));
          }}
          className={cn(
            "relative p-5 rounded-2xl border-2 transition-all overflow-hidden group",
            transactionType === "expense"
              ? "border-red-500 bg-gradient-to-br from-red-500/10 to-orange-500/10 shadow-lg shadow-red-500/10"
              : "border-border/50 hover:border-red-500/50 hover:bg-red-500/5"
          )}
        >
          <div className="absolute -right-4 -top-4 opacity-20">
            <HandCoins className={cn(
              "h-24 w-24 transition-transform group-hover:scale-110",
              transactionType === "expense" ? "text-red-500" : "text-muted-foreground"
            )} />
          </div>
          
          <div className="relative flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-xl transition-all",
              transactionType === "expense" 
                ? "bg-gradient-to-br from-red-500 to-orange-500 shadow-lg" 
                : "bg-muted"
            )}>
              <ArrowDownRight className={cn(
                "h-6 w-6",
                transactionType === "expense" ? "text-white" : "text-muted-foreground"
              )} />
            </div>
            <div className="text-left">
              <p className={cn(
                "font-semibold text-lg",
                transactionType === "expense" && "text-red-600"
              )}>Despesa</p>
              <p className="text-sm text-muted-foreground">Saída de valores</p>
            </div>
          </div>
          
          {transactionType === "expense" && (
            <div className="absolute bottom-2 right-2">
              <CheckCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </button>
      </div>

      {/* Value Input */}
      <div className={cn(
        "p-5 rounded-2xl border relative overflow-hidden",
        transactionType === "income" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
      )}>
        <div className="absolute -right-6 -bottom-6 opacity-10">
          <Coins className={cn(
            "h-28 w-28",
            transactionType === "income" ? "text-emerald-500" : "text-red-500"
          )} />
        </div>
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "p-2 rounded-lg",
              transactionType === "income" ? "bg-emerald-500/20" : "bg-red-500/20"
            )}>
              <DollarSign className={cn(
                "h-5 w-5",
                transactionType === "income" ? "text-emerald-500" : "text-red-500"
              )} />
            </div>
            <Label className="text-base font-semibold">Valor *</Label>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">R$</span>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0,00"
              className="pl-12 text-2xl font-bold h-14 bg-background"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: formatCurrencyBRL(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Descrição *</Label>
        <Input
          placeholder="Ex: Reserva #1234, Conta de luz..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-background h-12"
        />
      </div>

      {/* Reference */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Referência (Reserva, NF)</Label>
        <Input
          placeholder="Ex: #1234, NF-5678..."
          value={formData.reference}
          onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
          className="bg-background"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {filteredProperties.length === 0 && (
        <div className={cn(
          "flex items-center gap-3 p-4 rounded-xl border-2 border-dashed",
          transactionType === "income" ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"
        )}>
          <AlertCircle className={cn("h-8 w-8 shrink-0", transactionType === "income" ? "text-emerald-500" : "text-red-500")} />
          <div>
            <p className="font-medium">Nenhuma propriedade cadastrada</p>
            <p className="text-sm text-muted-foreground">Cadastre propriedades em Configurações para continuar.</p>
          </div>
        </div>
      )}
      <div className={cn(
        "p-5 rounded-2xl border",
        transactionType === "income" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
      )}>
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "p-2 rounded-lg",
            transactionType === "income" ? "bg-emerald-500/20" : "bg-red-500/20"
          )}>
            <Building2 className={cn(
              "h-5 w-5",
              transactionType === "income" ? "text-emerald-500" : "text-red-500"
            )} />
          </div>
          <div>
            <Label className="text-base font-semibold">Propriedade *</Label>
            <p className="text-xs text-muted-foreground">Selecione a propriedade relacionada</p>
          </div>
        </div>
        
        {/* Property Type Filter */}
        <div className="flex gap-2 flex-wrap mb-4">
          <Button
            type="button"
            variant={propertyTypeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setPropertyTypeFilter("all")}
            className={cn(
              propertyTypeFilter === "all" && transactionType === "income" && "bg-emerald-500 hover:bg-emerald-600",
              propertyTypeFilter === "all" && transactionType === "expense" && "bg-red-500 hover:bg-red-600"
            )}
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
                className={cn(
                  "gap-1.5",
                  propertyTypeFilter === type && transactionType === "income" && "bg-emerald-500 hover:bg-emerald-600",
                  propertyTypeFilter === type && transactionType === "expense" && "bg-red-500 hover:bg-red-600"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {config.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredProperties.map((prop: { id: string; name: string; type: PropertyType }) => {
          const propType = propertyTypeConfig[prop.type] ? prop.type : "hotel";
          const config = propertyTypeConfig[propType];
          const Icon = config.icon;
          const isSelected = formData.property === prop.id;
          return (
            <button
              key={prop.id}
              type="button"
              onClick={() => setFormData({ ...formData, property: prop.id })}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-left group",
                isSelected
                  ? transactionType === "income"
                    ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                    : "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10"
                  : "border-border/50 hover:border-border bg-card"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2.5 rounded-xl transition-all",
                  isSelected 
                    ? transactionType === "income" 
                      ? "bg-emerald-500 text-white" 
                      : "bg-red-500 text-white"
                    : (config?.bgColor || "bg-muted")
                )}>
                  <Icon className={cn(
                    "h-5 w-5",
                    isSelected ? "text-white" : (config?.color || "text-muted-foreground")
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{prop.name}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {config?.label || prop.type}
                  </Badge>
                </div>
                {isSelected && (
                  <CheckCircle className={cn(
                    "h-5 w-5 flex-shrink-0",
                    transactionType === "income" ? "text-emerald-500" : "text-red-500"
                  )} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Category Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            transactionType === "income" ? "bg-emerald-500/20" : "bg-red-500/20"
          )}>
            <Receipt className={cn(
              "h-5 w-5",
              transactionType === "income" ? "text-emerald-500" : "text-red-500"
            )} />
          </div>
          <div>
            <Label className="text-base font-semibold">Categoria *</Label>
            <p className="text-xs text-muted-foreground">Selecione a categoria da transação (Cadastros → Categorias Financeiras)</p>
          </div>
        </div>
        
        {isLoadingCategories ? (
          <div className="flex items-center gap-2 py-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Carregando categorias financeiras...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className={cn(
            "flex items-center gap-3 p-4 rounded-xl border-2 border-dashed",
            transactionType === "income" ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"
          )}>
            <AlertCircle className={cn("h-8 w-8 shrink-0", transactionType === "income" ? "text-emerald-500" : "text-red-500")} />
            <div>
              <p className="font-medium">Nenhuma categoria configurada</p>
              <p className="text-sm text-muted-foreground">
                Configure as categorias financeiras em <strong>Cadastros → Categorias Financeiras</strong> para usar o modal.
              </p>
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = formData.financialCategoryId === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData({ ...formData, financialCategoryId: cat.value })}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all text-left group",
                  isSelected
                    ? transactionType === "income"
                      ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                      : "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10"
                    : "border-border/50 hover:border-border bg-card"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-all",
                    isSelected 
                      ? transactionType === "income" 
                        ? "bg-emerald-500 text-white" 
                        : "bg-red-500 text-white"
                      : "bg-muted group-hover:bg-muted/80"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={cn(
                    "font-medium",
                    isSelected && (transactionType === "income" ? "text-emerald-600" : "text-red-600")
                  )}>{cat.label}</span>
                  {isSelected && (
                    <CheckCircle className={cn(
                      "h-4 w-4 ml-auto",
                      transactionType === "income" ? "text-emerald-500" : "text-red-500"
                    )} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
        )}
      </div>

      {/* Chart of Accounts Selection */}
      <div className="p-5 rounded-2xl border bg-indigo-500/5 border-indigo-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-indigo-500/20">
            <FolderTree className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <Label className="text-base font-semibold">Plano de Contas</Label>
            <p className="text-xs text-muted-foreground">Vincule à conta contábil para relatórios fiscais</p>
          </div>
        </div>
        
        <AccountSelectField
          value={formData.chartOfAccountId}
          onChange={(v) => setFormData({ ...formData, chartOfAccountId: v })}
          transactionType={transactionType}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Date & Payment Method */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Label>Data</Label>
          </div>
          <Input
            type="date"
            className="bg-background"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            <Label>Forma de Pagamento</Label>
          </div>
          <Select value={formData.paymentMethod} onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{method.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <Label>Observações</Label>
        </div>
        <Textarea
          placeholder="Observações adicionais..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="bg-background resize-none"
          rows={3}
        />
      </div>

      {/* File Attachments */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <Label>Anexos</Label>
          <span className="text-xs text-muted-foreground">(Opcional)</span>
        </div>
        
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer",
            isDragging
              ? transactionType === "income"
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-red-500 bg-red-500/10"
              : "border-border/50 hover:border-border bg-muted/30"
          )}
        >
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center">
            <div className={cn(
              "mx-auto w-10 h-10 rounded-xl flex items-center justify-center mb-2",
              transactionType === "income" ? "bg-emerald-500/20" : "bg-red-500/20"
            )}>
              <Upload className={cn(
                "h-5 w-5",
                transactionType === "income" ? "text-emerald-500" : "text-red-500"
              )} />
            </div>
            <p className="font-medium text-sm mb-1">
              {isDragging ? "Solte os arquivos aqui" : "Arraste ou clique para selecionar"}
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, imagens, documentos (máx. 10MB)
            </p>
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((file, index) => {
              const FileIcon = getFileIcon(file);
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border bg-card",
                    transactionType === "income" ? "border-emerald-500/20" : "border-red-500/20"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    transactionType === "income" ? "bg-emerald-500/10" : "bg-red-500/10"
                  )}>
                    <FileIcon className={cn(
                      "h-4 w-4",
                      transactionType === "income" ? "text-emerald-500" : "text-red-500"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Card */}
      {formData.amount && formData.property && (
        <div className={cn(
          "p-5 rounded-2xl border-2 relative overflow-hidden",
          transactionType === "income" 
            ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30"
            : "bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30"
        )}>
          <div className="absolute -right-8 -top-8 opacity-10">
            <PiggyBank className={cn(
              "h-32 w-32",
              transactionType === "income" ? "text-emerald-500" : "text-red-500"
            )} />
          </div>
          
          <div className="relative">
            <p className="text-sm text-muted-foreground mb-3">Resumo da transação</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {selectedProperty && (
                  <Badge className={cn(
                    propertyTypeConfig[selectedProperty.type]?.bgColor || "bg-muted",
                    propertyTypeConfig[selectedProperty.type]?.color || "text-muted-foreground"
                  )}>
                    {selectedProperty.name}
                  </Badge>
                )}
                {selectedCategory && (
                  <Badge variant="outline">{selectedCategory.label}</Badge>
                )}
                {formData.paymentMethod && (
                  <Badge variant="secondary">
                    {paymentMethods.find(m => m.value === formData.paymentMethod)?.label}
                  </Badge>
                )}
              </div>
              <span className={cn(
                "text-2xl font-bold",
                transactionType === "income" ? "text-emerald-500" : "text-red-500"
              )}>
                {transactionType === "income" ? "+" : "-"} R$ {parseCurrencyToNumber(formData.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSuccess = () => (
    <div className="p-6 space-y-6">
      {/* Success Animation */}
      <div className="text-center py-6">
        <div className={cn(
          "mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 animate-scale-in",
          transactionType === "income" 
            ? "bg-gradient-to-br from-emerald-500 to-teal-500" 
            : "bg-gradient-to-br from-red-500 to-orange-500"
        )}>
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2">
          {transactionType === "income" ? "Receita" : "Despesa"} Registrada!
        </h3>
        <p className="text-muted-foreground">
          A transação foi registrada com sucesso no sistema.
        </p>
      </div>

      {/* Protocol */}
      <div className={cn(
        "p-4 rounded-2xl border-2 text-center",
        transactionType === "income" 
          ? "bg-emerald-500/5 border-emerald-500/30" 
          : "bg-red-500/5 border-red-500/30"
      )}>
        <p className="text-sm text-muted-foreground mb-2">Protocolo da Transação</p>
        <div className="flex items-center justify-center gap-3">
          <span className={cn(
            "text-2xl font-mono font-bold",
            transactionType === "income" ? "text-emerald-600" : "text-red-600"
          )}>
            {protocol}
          </span>
          <Button variant="outline" size="sm" onClick={copyProtocol}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notification Info */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="p-2 rounded-lg bg-blue-500/20">
          <Mail className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <p className="font-medium text-sm">Comprovante enviado</p>
          <p className="text-xs text-muted-foreground">
            Uma cópia foi enviada para o e-mail cadastrado
          </p>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className={cn(
        "p-5 rounded-2xl border",
        transactionType === "income" 
          ? "bg-emerald-500/5 border-emerald-500/20" 
          : "bg-red-500/5 border-red-500/20"
      )}>
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Receipt className={cn(
            "h-5 w-5",
            transactionType === "income" ? "text-emerald-500" : "text-red-500"
          )} />
          Detalhes da Transação
        </h4>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Tipo</span>
            <Badge className={cn(
              transactionType === "income" 
                ? "bg-emerald-500/10 text-emerald-600" 
                : "bg-red-500/10 text-red-600"
            )}>
              {transactionType === "income" ? "Receita" : "Despesa"}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Descrição</span>
            <span className="font-medium">{formData.description}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Propriedade</span>
            <span className="font-medium">{selectedProperty?.name}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Categoria</span>
            <Badge variant="outline">{selectedCategory?.label}</Badge>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Data</span>
            <span className="font-medium">
              {new Date(formData.date).toLocaleDateString('pt-BR')}
            </span>
          </div>
          
          {formData.paymentMethod && (
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">Forma de Pagamento</span>
              <Badge variant="secondary">
                {paymentMethods.find(m => m.value === formData.paymentMethod)?.label}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Total Value */}
      <div className={cn(
        "p-5 rounded-2xl border-2 relative overflow-hidden",
        transactionType === "income" 
          ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30"
          : "bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30"
      )}>
        <div className="absolute -right-8 -top-8 opacity-10">
          <Coins className={cn(
            "h-32 w-32",
            transactionType === "income" ? "text-emerald-500" : "text-red-500"
          )} />
        </div>
        <div className="relative flex items-center justify-between">
          <span className="text-lg font-medium">Valor Total</span>
          <span className={cn(
            "text-3xl font-bold",
            transactionType === "income" ? "text-emerald-500" : "text-red-500"
          )}>
            {transactionType === "income" ? "+" : "-"} R$ {parseCurrencyToNumber(formData.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1" onClick={() => toast.info("Imprimindo...")}>
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => toast.info("Exportando PDF...")}>
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => toast.info("Enviando por e-mail...")}>
          <Send className="h-4 w-4 mr-2" />
          Enviar Email
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header with gradient */}
        <div className={cn(
          "relative px-6 py-5 border-b flex-shrink-0",
          transactionType === "income" 
            ? "bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10"
            : "bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10"
        )}>
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
            {transactionType === "income" ? (
              <svg viewBox="0 0 200 200" className="w-full h-full text-emerald-500">
                <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
                <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
              </svg>
            ) : (
              <svg viewBox="0 0 200 200" className="w-full h-full text-red-500">
                <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
                <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
              </svg>
            )}
          </div>

          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className={cn(
                "p-3 rounded-2xl shadow-lg",
                transactionType === "income" 
                  ? "bg-gradient-to-br from-emerald-500 to-teal-500" 
                  : "bg-gradient-to-br from-red-500 to-orange-500"
              )}>
                {transactionType === "income" ? (
                  <TrendingUp className="h-6 w-6 text-white" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <span className="block">Nova Transação</span>
                <span className={cn(
                  "text-sm font-normal",
                  transactionType === "income" ? "text-emerald-600" : "text-red-600"
                )}>
                  {transactionType === "income" ? "Registrar entrada de valores" : "Registrar saída de valores"}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Progress Bar */}
          {!showSuccess && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  Etapa {currentStep} de {steps.length}
                </span>
                <span className={cn(
                  "text-xs font-medium",
                  transactionType === "income" ? "text-emerald-600" : "text-red-600"
                )}>
                  {Math.round((currentStep / steps.length) * 100)}% concluído
                </span>
              </div>
              <Progress 
                value={(currentStep / steps.length) * 100} 
                className={cn(
                  "h-2",
                  transactionType === "income" 
                    ? "[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500" 
                    : "[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-orange-500"
                )}
              />
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 min-h-0">
          {/* Left Sidebar - Steps */}
          {!showSuccess && (
            <div className={cn(
              "w-64 border-r p-4 flex-shrink-0",
              transactionType === "income" ? "bg-emerald-500/5" : "bg-red-500/5"
            )}>
              <div className="space-y-2">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => {
                        // Allow going back to previous steps
                        if (step.id <= currentStep) {
                          setCurrentStep(step.id as FormStep);
                        }
                      }}
                      disabled={step.id > currentStep}
                      className={cn(
                        "w-full p-4 rounded-xl text-left transition-all relative group",
                        isActive
                          ? transactionType === "income"
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "bg-red-500 text-white shadow-lg shadow-red-500/20"
                          : isCompleted
                            ? "bg-background border hover:bg-muted cursor-pointer"
                            : "bg-muted/50 opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          isActive
                            ? "bg-white/20"
                            : isCompleted
                              ? transactionType === "income"
                                ? "bg-emerald-500/20"
                                : "bg-red-500/20"
                              : "bg-muted"
                        )}>
                          {isCompleted && !isActive ? (
                            <CheckCircle className={cn(
                              "h-5 w-5",
                              transactionType === "income" ? "text-emerald-500" : "text-red-500"
                            )} />
                          ) : (
                            <StepIcon className={cn(
                              "h-5 w-5",
                              isActive ? "text-white" : "text-muted-foreground"
                            )} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-semibold text-sm",
                            !isActive && !isCompleted && "text-muted-foreground"
                          )}>
                            {step.title}
                          </p>
                          <p className={cn(
                            "text-xs truncate",
                            isActive ? "text-white/80" : "text-muted-foreground"
                          )}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Connector line */}
                      {index < steps.length - 1 && (
                        <div className={cn(
                          "absolute left-9 top-[calc(100%+0.25rem)] w-0.5 h-2",
                          isCompleted 
                            ? transactionType === "income" ? "bg-emerald-500" : "bg-red-500"
                            : "bg-border"
                        )} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1">
              <div className="p-6 pb-10">
                {showSuccess ? (
                  renderSuccess()
                ) : (
                  <>
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                    {currentStep === 4 && renderStep4()}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-3 p-6 border-t bg-muted/30 flex-shrink-0">
          {showSuccess ? (
            <>
              <div />
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} size="lg">
                  Fechar
                </Button>
                <Button 
                  onClick={handleNewTransaction}
                  size="lg"
                  className={cn(
                    "min-w-[200px]",
                    transactionType === "income"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                      : "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  )}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Transação
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} size="lg">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(prev => (prev - 1) as FormStep)}
                    size="lg"
                  >
                    Voltar
                  </Button>
                )}
                
                {currentStep < 4 ? (
                  <Button 
                    onClick={() => setCurrentStep(prev => (prev + 1) as FormStep)}
                    disabled={!canProceed(currentStep)}
                    size="lg"
                    className={cn(
                      "min-w-[150px]",
                      transactionType === "income"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                        : "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    )}
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={!canSubmit || createMutation.isPending}
                    size="lg"
                    className={cn(
                      "min-w-[200px]",
                      transactionType === "income"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                        : "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    )}
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Registrar {transactionType === "income" ? "Receita" : "Despesa"}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}