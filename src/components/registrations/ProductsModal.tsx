import React, { useState, useRef, useCallback, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  Check,
  Package,
  Tag,
  DollarSign,
  Warehouse,
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  Boxes,
  Calculator,
  Percent,
  Scale,
  QrCode,
  Barcode,
  Sparkles,
  Upload,
  Image,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface ProductsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type ProductRow = {
  id: number;
  name: string;
  code: string;
  category: string | null;
  categoryId: number | null;
  salePrice: number | null;
  stockQuantity: number;
  minStock: number;
  status: string;
  images: string[] | null;
};

type ProductCategoryRow = { id: number; name: string; code?: string; icon?: string | null };
type UnitRow = { id: number; name: string; abbreviation?: string };

const wizardSteps = [
  { id: "info", title: "Informações", icon: Package, description: "Dados básicos" },
  { id: "category", title: "Classificação", icon: Tag, description: "Categoria e grupo" },
  { id: "pricing", title: "Preços", icon: DollarSign, description: "Custos e valores" },
  { id: "stock", title: "Estoque", icon: Warehouse, description: "Níveis e alertas" },
  { id: "fiscal", title: "Fiscal", icon: FileText, description: "Dados tributários" },
];

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200";

/** Máscara Real (R$): 1.234,56 - só dígitos; parte inteira sem zeros à esquerda */
function maskBRL(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  const decimalPart = digits.slice(-2).padStart(2, "0");
  let integerPart = digits.slice(0, -2) || "0";
  integerPart = integerPart.replace(/^0+/, "") || "0";
  const withDots = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return withDots + "," + decimalPart;
}

/** Converte string BRL para número (ex.: "1.234,56" → 1234.56) */
function parseBRL(value: string): number {
  if (!value || !value.trim()) return 0;
  const normalized = value.replace(/\./g, "").replace(",", ".");
  return parseFloat(normalized) || 0;
}

export function ProductsModal({ open, onOpenChange, onSuccess }: ProductsModalProps) {
  const [view, setView] = useState<"list" | "create">("list");
  const [currentStep, setCurrentStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategoryRow[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await api.getProducts();
      const list = (res?.data as { products?: unknown[] })?.products ?? res?.data ?? [];
      const arr = Array.isArray(list) ? list : [];
      setProducts(arr.map((p: Record<string, unknown>) => ({
        id: p.id as number,
        name: (p.name as string) ?? "",
        code: (p.code as string) ?? "",
        category: (p.category as string) ?? null,
        categoryId: (p.categoryId as number) ?? null,
        salePrice: p.salePrice != null ? Number(p.salePrice) : null,
        stockQuantity: Number(p.stockQuantity ?? 0),
        minStock: Number(p.minStock ?? 0),
        status: (p.status as string) ?? "active",
        images: (p.images as string[] | null) ?? null,
      })));
    } catch {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const res = await api.getProductCategories();
      const list = (res?.data as { productCategories?: unknown[] })?.productCategories ?? res?.data ?? [];
      const arr = Array.isArray(list) ? list : [];
      setProductCategories(arr.map((c: Record<string, unknown>) => ({
        id: c.id as number,
        name: (c.name as string) ?? "",
        code: c.code as string | undefined,
        icon: c.icon as string | null | undefined,
      })));
    } catch {
      setProductCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchUnits = useCallback(async () => {
    setLoadingUnits(true);
    try {
      const res = await api.getUnitsOfMeasure();
      const list = (res?.data as { unitsOfMeasure?: unknown[] })?.unitsOfMeasure ?? res?.data ?? [];
      const arr = Array.isArray(list) ? list : [];
      setUnitsOfMeasure(arr.map((u: Record<string, unknown>) => ({
        id: u.id as number,
        name: (u.name as string) ?? "",
        abbreviation: u.abbreviation as string | undefined,
      })));
    } catch {
      setUnitsOfMeasure([]);
    } finally {
      setLoadingUnits(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchProducts();
      fetchCategories();
      fetchUnits();
    }
  }, [open, fetchProducts, fetchCategories, fetchUnits]);

  useEffect(() => {
    if (!open) {
      // Sempre que fechar o modal pai, voltar para a listagem.
      setView("list");
      setCurrentStep(0);
    }
  }, [open]);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    description: "",
    unit: "",
    brand: "",
    category: "",
    subCategory: "",
    tags: [] as string[],
    costPrice: "",
    salePrice: "",
    margin: "",
    promotionalPrice: "",
    hasPromotion: false,
    minStock: "",
    maxStock: "",
    reorderPoint: "",
    initialStock: "",
    location: "",
    ncm: "",
    cfop: "",
    icms: "",
    pis: "",
    cofins: "",
    origin: "",
  });

  const deriveStatus = (p: ProductRow): "active" | "low" | "out" => {
    if (p.stockQuantity === 0) return "out";
    if (p.minStock > 0 && p.stockQuantity < p.minStock) return "low";
    return p.status === "inactive" ? "active" : "active";
  };

  const filteredProducts = products
    .map((p) => ({ ...p, displayStatus: deriveStatus(p) }))
    .filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || String(product.categoryId) === filterCategory;
      return matchesSearch && matchesCategory;
    });

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.sku.trim()) {
      toast.error("Preencha nome e código (SKU) do produto.");
      return;
    }
    setSubmitting(true);
    try {
      const costPrice = formData.costPrice ? parseBRL(formData.costPrice) : null;
      const salePrice = formData.salePrice ? parseBRL(formData.salePrice) : null;
      const res = await api.createProduct({
        code: formData.sku.trim(),
        name: formData.name.trim(),
        barcode: formData.barcode?.trim() || null,
        categoryId: formData.category ? Number(formData.category) : null,
        unitId: formData.unit ? Number(formData.unit) : null,
        description: formData.description?.trim() || null,
        costPrice: Number.isFinite(costPrice) ? costPrice : null,
        salePrice: Number.isFinite(salePrice) ? salePrice : null,
        stockQuantity: parseInt(formData.initialStock, 10) || 0,
        minStock: parseInt(formData.minStock, 10) || 0,
        trackStock: true,
        status: "active",
        images: uploadedImageUrl ? [uploadedImageUrl] : null,
      });
      if (!res.success) {
        toast.error(res.error?.message ?? "Erro ao criar produto.");
        return;
      }
      toast.success("Produto criado com sucesso.");
      onSuccess?.();
      fetchProducts();
      setView("list");
      setCurrentStep(0);
      setImagePreview(null);
      setUploadedImageUrl(null);
      setFormData({
        name: "",
        sku: "",
        barcode: "",
        description: "",
        unit: "",
        brand: "",
        category: "",
        subCategory: "",
        tags: [],
        costPrice: "",
        salePrice: "",
        margin: "",
        promotionalPrice: "",
        hasPromotion: false,
        minStock: "",
        maxStock: "",
        reorderPoint: "",
        initialStock: "",
        location: "",
        ncm: "",
        cfop: "",
        icms: "",
        pis: "",
        cofins: "",
        origin: "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateNew = () => {
    setFormData({
      name: "",
      sku: "",
      barcode: "",
      description: "",
      unit: "",
      brand: "",
      category: "",
      subCategory: "",
      tags: [],
      costPrice: "",
      salePrice: "",
      margin: "",
      promotionalPrice: "",
      hasPromotion: false,
      minStock: "",
      maxStock: "",
      reorderPoint: "",
      initialStock: "",
      location: "",
      ncm: "",
      cfop: "",
      icms: "",
      pis: "",
      cofins: "",
      origin: "",
    });
    setCurrentStep(0);
    setImagePreview(null);
    setUploadedImageUrl(null);
    setView("create");
  };

  const uploadProductImage = async (file: File) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Use apenas imagens (JPEG, PNG ou WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 5MB.");
      return;
    }
    setUploadingImage(true);
    try {
      const res = await api.uploadImage(file, "products");
      if (res.success && res.data) {
        const data = res.data as { url?: string; fullUrl?: string };
        const url = data.fullUrl ?? data.url ?? null;
        if (url) {
          setUploadedImageUrl(url);
          setImagePreview(url);
          toast.success("Imagem enviada.");
        } else {
          toast.error("Resposta do servidor sem URL da imagem.");
        }
      } else {
        toast.error(res.error?.message ?? "Falha ao enviar imagem.");
      }
    } catch {
      toast.error("Erro ao enviar imagem.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void uploadProductImage(file);
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
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) void uploadProductImage(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setUploadedImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const calculateMargin = () => {
    const cost = parseBRL(formData.costPrice) || 0;
    const sale = parseBRL(formData.salePrice) || 0;
    if (cost > 0 && sale > 0) {
      const margin = ((sale - cost) / cost) * 100;
      setFormData(prev => ({ ...prev, margin: margin.toFixed(1) }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Ativo</Badge>;
      case "low":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Estoque Baixo</Badge>;
      case "out":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Sem Estoque</Badge>;
      default:
        return <Badge variant="secondary">Inativo</Badge>;
    }
  };

  const renderListView = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Produtos</h2>
              <p className="text-sm text-muted-foreground">Gerencie o catálogo de produtos</p>
            </div>
          </div>
          <Button onClick={handleCreateNew} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <Boxes className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total</span>
            </div>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{products.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-1">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Ativos</span>
            </div>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{products.filter(p => deriveStatus(p) === "active").length}</p>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Baixo Estoque</span>
            </div>
            <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{products.filter(p => deriveStatus(p) === "low").length}</p>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">Sem Estoque</span>
            </div>
            <p className="text-xl font-bold text-red-700 dark:text-red-300">{products.filter(p => deriveStatus(p) === "out").length}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              {productCategories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.icon ? String(cat.icon) + " " : ""}{cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 min-h-0 overflow-hidden px-6 pb-6">
        <ScrollArea className="h-full">
          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">Carregando produtos...</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4 pb-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
              >
                {/* Product Image */}
                <div className="relative h-32 overflow-hidden bg-muted">
                  <img
                    src={product.images?.[0] ?? PLACEHOLDER_IMAGE}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(product.displayStatus)}
                  </div>

                  {/* Category Badge */}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm text-xs">
                      {product.category ?? "—"}
                    </Badge>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                    <code className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{product.code}</code>
                  </div>

                  {/* Price & Stock */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Preço</p>
                      <p className="text-lg font-bold text-foreground">
                        R$ {(product.salePrice ?? 0).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Estoque</p>
                      <p className={`text-lg font-bold ${
                        product.stockQuantity === 0 
                          ? "text-red-600" 
                          : product.minStock > 0 && product.stockQuantity < product.minStock 
                            ? "text-amber-600" 
                            : "text-emerald-600"
                      }`}>
                        {product.stockQuantity}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

          {!loadingProducts && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground mt-1">
                Tente ajustar os filtros ou cadastre um novo produto
              </p>
              <Button onClick={handleCreateNew} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Info
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border border-pink-200 dark:border-pink-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/50">
                  <Sparkles className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h4 className="font-medium text-pink-900 dark:text-pink-100">Dados do Produto</h4>
                  <p className="text-sm text-pink-700 dark:text-pink-300">Preencha as informações básicas do produto</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Produto *</Label>
                  <Input
                    placeholder="Ex: Água Mineral 500ml"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Input
                    placeholder="Ex: Crystal"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>SKU / Código *</Label>
                  <div className="relative">
                    <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="BEB-001"
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Código de Barras</Label>
                  <div className="relative">
                    <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="7891234567890"
                      value={formData.barcode}
                      onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Unidade de Medida *</Label>
                  <Select 
                    value={formData.unit} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitsOfMeasure.map((unit) => (
                        <SelectItem key={unit.id} value={String(unit.id)}>
                          {unit.name}{unit.abbreviation ? ` (${unit.abbreviation})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Descrição detalhada do produto..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Imagem do Produto (StorageService via api.uploadImage) */}
              <div className="space-y-2">
                <Label>Imagem do Produto</Label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !uploadingImage && fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    uploadingImage ? "cursor-wait" : "cursor-pointer"
                  } ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : imagePreview
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="mx-auto w-16 h-16 rounded-xl bg-muted flex items-center justify-center animate-pulse">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Enviando imagem...</p>
                    </div>
                  ) : imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-40 rounded-lg mx-auto shadow-md"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="mx-auto w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Arraste e solte a imagem aqui
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          ou <span className="text-primary font-medium">clique para selecionar</span>
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG ou WEBP (máx. 5MB). A imagem será salva no storage configurado.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Category
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200 dark:border-violet-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/50">
                  <Tag className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h4 className="font-medium text-violet-900 dark:text-violet-100">Classificação</h4>
                  <p className="text-sm text-violet-700 dark:text-violet-300">Organize o produto em categorias</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Categoria Principal *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {productCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: String(cat.id) }))}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        formData.category === String(cat.id)
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{cat.icon ? String(cat.icon) : <Tag className="h-8 w-8 mx-auto text-muted-foreground" />}</span>
                      <p className="text-sm font-medium">{cat.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subcategoria</Label>
                <Input
                  placeholder="Ex: Água com Gás"
                  value={formData.subCategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subCategory: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {["Novo", "Popular", "Orgânico", "Premium", "Econômico", "Importado"].map(tag => (
                    <Badge
                      key={tag}
                      variant={formData.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          tags: prev.tags.includes(tag)
                            ? prev.tags.filter(t => t !== tag)
                            : [...prev.tags, tag]
                        }));
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Pricing
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                  <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-medium text-emerald-900 dark:text-emerald-100">Preços</h4>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">Configure custos e valores de venda</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Preço de Custo *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    <Input
                      placeholder="0,00"
                      value={formData.costPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, costPrice: maskBRL(e.target.value) }))}
                      onBlur={calculateMargin}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Preço de Venda *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    <Input
                      placeholder="0,00"
                      value={formData.salePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, salePrice: maskBRL(e.target.value) }))}
                      onBlur={calculateMargin}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Margem</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={formData.margin}
                      readOnly
                      className="pl-10 bg-muted/50"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <Label>Preço Promocional</Label>
                  </div>
                  <Switch
                    checked={formData.hasPromotion}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasPromotion: checked }))}
                  />
                </div>
                {formData.hasPromotion && (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    <Input
                      placeholder="0,00"
                      value={formData.promotionalPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, promotionalPrice: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3: // Stock
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                  <Warehouse className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Estoque</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Configure níveis e alertas de estoque</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estoque Inicial</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.initialStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, initialStock: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Local de Armazenamento</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="almox-central">Almoxarifado Central</SelectItem>
                      <SelectItem value="frigobar">Frigobar</SelectItem>
                      <SelectItem value="restaurante">Restaurante</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="governanca">Governança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Estoque Mínimo</Label>
                  <div className="relative">
                    <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                    <Input
                      type="number"
                      placeholder="10"
                      value={formData.minStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, minStock: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Ponto de Reposição</Label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                    <Input
                      type="number"
                      placeholder="25"
                      value={formData.reorderPoint}
                      onChange={(e) => setFormData(prev => ({ ...prev, reorderPoint: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Estoque Máximo</Label>
                  <div className="relative">
                    <Boxes className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    <Input
                      type="number"
                      placeholder="100"
                      value={formData.maxStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxStock: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Fiscal
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="font-medium text-amber-900 dark:text-amber-100">Dados Fiscais</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">Configure informações tributárias</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>NCM</Label>
                  <Input
                    placeholder="00000000"
                    value={formData.ncm}
                    onChange={(e) => setFormData(prev => ({ ...prev, ncm: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CFOP</Label>
                  <Input
                    placeholder="5102"
                    value={formData.cfop}
                    onChange={(e) => setFormData(prev => ({ ...prev, cfop: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Origem</Label>
                <Select
                  value={formData.origin}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, origin: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 - Nacional</SelectItem>
                    <SelectItem value="1">1 - Estrangeira (importação direta)</SelectItem>
                    <SelectItem value="2">2 - Estrangeira (mercado interno)</SelectItem>
                    <SelectItem value="3">3 - Nacional (conteúdo importado 40-70%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>ICMS (%)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="18"
                      value={formData.icms}
                      onChange={(e) => setFormData(prev => ({ ...prev, icms: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>PIS (%)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="1.65"
                      value={formData.pis}
                      onChange={(e) => setFormData(prev => ({ ...prev, pis: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>COFINS (%)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="7.6"
                      value={formData.cofins}
                      onChange={(e) => setFormData(prev => ({ ...prev, cofins: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderCreateView = () => (
    <div className="flex h-full max-h-[95vh]">
      {/* Left Sidebar - Steps */}
      <div className="w-72 flex-shrink-0 bg-gradient-to-b from-pink-500 via-pink-500/95 to-rose-500/85 p-6 text-white hidden lg:flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Novo Produto</h2>
              <p className="text-sm opacity-80">Cadastro completo</p>
            </div>
          </div>

          <div className="space-y-2">
            {wizardSteps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = currentStep === idx;
              const isCompleted = currentStep > idx;
              
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-white/25 backdrop-blur-sm shadow-lg"
                      : isCompleted
                      ? "bg-white/10 opacity-90"
                      : "opacity-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isActive
                      ? "bg-white text-pink-500"
                      : isCompleted
                      ? "bg-white/30"
                      : "bg-white/10"
                  }`}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs opacity-70">Etapa {idx + 1}</p>
                    <p className="font-medium text-sm truncate">{s.title}</p>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress */}
          <div className="mt-8 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso</span>
              <span className="font-bold">{Math.round(((currentStep + 1) / wizardSteps.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / wizardSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium text-sm">Dica</span>
            </div>
            <p className="text-xs opacity-80">
              {currentStep === 0 && "Preencha os dados básicos e adicione uma imagem para facilitar a identificação."}
              {currentStep === 1 && "Categorize bem seu produto para facilitar buscas e relatórios."}
              {currentStep === 2 && "Configure os preços corretamente para cálculo automático de margem."}
              {currentStep === 3 && "Defina níveis de estoque para receber alertas automáticos."}
              {currentStep === 4 && "Os dados fiscais são essenciais para emissão de notas."}
            </p>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="p-6 pb-0 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-500/10">
              <Package className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <span className="block font-semibold">Novo Produto</span>
              <span className="text-sm text-muted-foreground">
                Etapa {currentStep + 1} de {wizardSteps.length}: {wizardSteps[currentStep].title}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Progress */}
        <div className="px-6 py-3 lg:hidden">
          <div className="flex gap-1">
            {wizardSteps.map((s, idx) => (
              <div
                key={s.id}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  idx <= currentStep ? "bg-pink-500" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 px-6">
          <div className="py-6 pb-10">
            {renderStepContent()}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex-shrink-0 p-6 border-t bg-background">
          <div className="flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => {
                if (currentStep === 0) {
                  setView("list");
                } else {
                  handlePrevious();
                }
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {currentStep === 0 ? "Cancelar" : "Anterior"}
            </Button>

            {currentStep === wizardSteps.length - 1 ? (
              <Button onClick={handleSubmit} disabled={submitting} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                <Check className="h-4 w-4 mr-2" />
                {submitting ? "Salvando..." : "Salvar Produto"}
              </Button>
            ) : (
              <Button onClick={handleNext} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${view === "create" ? "max-w-5xl" : "max-w-5xl"} h-[90vh] p-0 gap-0 overflow-hidden flex flex-col`}>
        {view === "list" ? (
          renderListView()
        ) : (
          renderCreateView()
        )}
      </DialogContent>
    </Dialog>
  );
}