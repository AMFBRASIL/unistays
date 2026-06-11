import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UtensilsCrossed,
  Wine,
  Coffee,
  IceCream,
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  QrCode,
  BedDouble,
  User,
  Users,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Printer,
  Building2,
  Home,
  Warehouse,
  Palmtree,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface Product {
  id: number;
  name: string;
  price: number;
  promotionalPrice: number | null;
  isPromotionActive: boolean;
  stockQuantity: number;
  category: string | null;
  categoryId: number | null;
  image?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface RecentOrder {
  id: number;
  transactionNumber: string;
  time: string;
  unit: string | null;
  guest: string | null;
  total: number;
  items: number;
  status: "pending" | "completed" | "cancelled";
  propertyType: string;
}

type PropertyType = "hotel" | "apart-hotel" | "loft" | "temporada";

const propertyTypes = [
  { id: "hotel" as PropertyType, name: "Hotel", icon: Building2, color: "from-blue-500 to-indigo-500", unitLabel: "Quarto" },
  { id: "apart-hotel" as PropertyType, name: "Apart-Hotel", icon: Home, color: "from-emerald-500 to-teal-500", unitLabel: "Apartamento" },
  { id: "loft" as PropertyType, name: "Loft", icon: Warehouse, color: "from-violet-500 to-purple-500", unitLabel: "Unidade" },
  { id: "temporada" as PropertyType, name: "Temporada", icon: Palmtree, color: "from-amber-500 to-orange-500", unitLabel: "Imóvel" },
];

const categoryIcons = [UtensilsCrossed, Wine, Coffee, IceCream];

const statusConfig = {
  pending: { label: "Pendente", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  completed: { label: "Concluído", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  cancelled: { label: "Cancelado", color: "bg-red-500/10 text-red-500 border-red-500/20" },
};

const getPropertyBadgeColor = (type: string) => {
  switch (type) {
    case "hotel": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "apart-hotel": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "loft": return "bg-violet-500/10 text-violet-500 border-violet-500/20";
    case "temporada": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  }
};

type InventoryRow = { id: number; productId: number; currentStock: number };

function formatGuestRecord(g: Record<string, unknown> | null | undefined): string | null {
  if (!g) return null;
  const first = String(g.firstName ?? "").trim();
  const last = String(g.lastName ?? "").trim();
  const combined = [first, last].filter(Boolean).join(" ").trim();
  if (combined) return combined;
  const name = String(g.name ?? "").trim();
  return name || null;
}

function collectNamesFromReservation(r: Record<string, unknown>): string[] {
  const out: string[] = [];
  const main = formatGuestRecord(r.guest as Record<string, unknown> | undefined);
  if (main) out.push(main);
  const acc = r.accompanyingGuests;
  if (Array.isArray(acc)) {
    for (const ag of acc) {
      const n = formatGuestRecord(ag as Record<string, unknown>);
      if (n) out.push(n);
    }
  }
  return out;
}

function buildOutMovementsForProduct(
  rows: InventoryRow[],
  productId: number,
  quantityNeeded: number,
  productName: string,
  reason: string
): Array<{ itemId: number; type: "out"; quantity: number; reason: string }> {
  const forProduct = rows
    .filter((r) => r.productId === productId)
    .sort((a, b) => a.id - b.id);

  if (forProduct.length === 0) {
    throw new Error(`Item de estoque não encontrado para "${productName}" nesta propriedade.`);
  }

  const total = forProduct.reduce((s, r) => s + r.currentStock, 0);
  if (quantityNeeded > total) {
    throw new Error(`Estoque insuficiente para "${productName}". Disponível nesta propriedade: ${total}.`);
  }

  let remaining = quantityNeeded;
  const movements: Array<{ itemId: number; type: "out"; quantity: number; reason: string }> = [];
  for (const r of forProduct) {
    if (remaining <= 0) break;
    if (r.currentStock <= 0) continue;
    const take = Math.min(remaining, r.currentStock);
    movements.push({ itemId: r.id, type: "out", quantity: take, reason });
    remaining -= take;
  }
  if (remaining > 0) {
    throw new Error(`Estoque insuficiente para "${productName}". Disponível nesta propriedade: ${total}.`);
  }
  return movements;
}

export default function POSTerminal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType>("hotel");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [unit, setUnit] = useState("");
  const [guestName, setGuestName] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [properties, setProperties] = useState<Array<{ id: number; name: string; type: string }>>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<Array<{ id: number; name: string; type: string; code?: string }>>([]);
  const [productCategories, setProductCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [incomeCategoryId, setIncomeCategoryId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixData, setPixData] = useState<{ brCode: string; qrCodeDataUrl?: string; amount: number; description: string } | null>(null);
  const [pixBankConfirmed, setPixBankConfirmed] = useState(false);
  const [cardConfirmModalOpen, setCardConfirmModalOpen] = useState(false);
  const [pendingCardMethod, setPendingCardMethod] = useState<"Cartão de Crédito" | "Cartão de Débito" | null>(null);
  const [cardTransactionConfirmed, setCardTransactionConfirmed] = useState(false);
  const [cardTransactionCode, setCardTransactionCode] = useState("");

  const [unitOccupants, setUnitOccupants] = useState<string[]>([]);
  const [unitOccupantsLoading, setUnitOccupantsLoading] = useState(false);
  const [unitOccupantsHint, setUnitOccupantsHint] = useState<string | null>(null);
  const [resolvedUnitDisplay, setResolvedUnitDisplay] = useState<string | null>(null);
  const [clientConfirmedUnitCharge, setClientConfirmedUnitCharge] = useState(false);
  const recentOrdersScrollRef = useRef<HTMLDivElement | null>(null);

  const currentProperty = propertyTypes.find(p => p.id === selectedPropertyType) || propertyTypes[0];
  const selectedProperty = useMemo(() => properties.find((p) => p.id === selectedPropertyId) || null, [properties, selectedPropertyId]);

  useEffect(() => {
    const load = async () => {
      try {
        const [propsRes, methodsRes, categoriesRes, productCategoriesRes] = await Promise.all([
          api.getProperties(),
          api.getPaymentMethods(true),
          api.getFinancialCategories("income", true),
          api.getProductCategories(undefined, "active"),
        ]);

        const propsRaw = ((propsRes.data as { properties?: unknown[] } | undefined)?.properties ?? []) as Array<Record<string, unknown>>;
        const normalizedProps = propsRaw.map((p) => ({
          id: Number(p.id),
          name: String(p.name ?? `Propriedade ${p.id}`),
          type: String(p.type ?? "hotel"),
        }));
        setProperties(normalizedProps);
        if (normalizedProps.length > 0) {
          setSelectedPropertyId((prev) => prev ?? normalizedProps[0].id);
          const pType = normalizedProps[0].type as PropertyType;
          if (pType === "hotel" || pType === "apart-hotel" || pType === "loft" || pType === "temporada") {
            setSelectedPropertyType(pType);
          }
        }

        const productCategoriesRaw = ((productCategoriesRes.data as { productCategories?: unknown[] } | undefined)?.productCategories ?? []) as Array<Record<string, unknown>>;
        setProductCategories(
          productCategoriesRaw.map((c) => ({
            id: Number(c.id),
            name: String(c.name ?? `Categoria ${c.id}`),
          }))
        );

        const methodsRaw = ((methodsRes.data as { paymentMethods?: unknown[] } | undefined)?.paymentMethods ?? []) as Array<Record<string, unknown>>;
        setPaymentMethods(
          methodsRaw.map((m) => ({
            id: Number(m.id),
            name: String(m.name ?? ""),
            type: String(m.type ?? "").toLowerCase(),
            code: m.code ? String(m.code).toLowerCase() : undefined,
          }))
        );

        const categoriesRaw = ((categoriesRes.data as { categories?: unknown[] } | undefined)?.categories ?? []) as Array<Record<string, unknown>>;
        const preferred = categoriesRaw.find((c) => String(c.name ?? "").toLowerCase().includes("venda")) ?? categoriesRaw[0];
        setIncomeCategoryId(preferred ? Number(preferred.id) : null);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar dados do PDV");
      }
    };
    void load();
  }, []);

  useEffect(() => {
    if (!selectedPropertyId) return;
    const loadProducts = async () => {
      try {
        const productsRes = await api.getProducts(undefined, "active", undefined, undefined, selectedPropertyId);
        const productsRaw = ((productsRes.data as { products?: unknown[] } | undefined)?.products ?? []) as Array<Record<string, unknown>>;
        setProducts(
          productsRaw.map((p) => ({
            id: Number(p.id),
            name: String(p.name ?? "Produto"),
            price: Number(p.salePrice ?? 0),
            promotionalPrice: p.promotionalPrice != null ? Number(p.promotionalPrice) : null,
            isPromotionActive: Boolean(p.isPromotionActive ?? false),
            stockQuantity: Number(p.stockQuantity ?? 0),
            category: p.category ? String(p.category) : null,
            categoryId: p.categoryId != null ? Number(p.categoryId) : null,
            image: Array.isArray(p.images) && p.images[0] ? String(p.images[0]) : undefined,
          }))
        );
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar produtos para esta propriedade.");
        setProducts([]);
      }
    };
    void loadProducts();
  }, [selectedPropertyId]);

  const categories = useMemo(() => {
    const all = [{ id: "all", name: "Todos", icon: UtensilsCrossed }];
    const real = productCategories.map((cat, idx) => ({
      id: String(cat.id),
      name: cat.name,
      icon: categoryIcons[idx % categoryIcons.length],
    }));
    return [...all, ...real];
  }, [productCategories]);

  const loadRecentPosOrders = async () => {
    if (!selectedPropertyId) return;
    try {
      const res = await api.getTransactions({
        propertyId: selectedPropertyId,
        type: "income",
        search: "POS Terminal",
      });
      const list = ((res.data as { transactions?: unknown[] } | undefined)?.transactions ?? []) as Array<Record<string, unknown>>;
      const mapped: RecentOrder[] = list.slice(0, 8).map((t) => {
        const desc = String(t.description ?? "");
        const unitMatch = desc.match(/unidade:\s*([^\-|]+)/i);
        const guestMatch = desc.match(/h[oó]spede:\s*([^\-|]+)/i);
        const itemsChunk = desc.split(" - ")[1] ?? "";
        const itemsCount = itemsChunk
          ? itemsChunk.split(",").map((x) => x.trim()).filter(Boolean).length
          : 0;
        return {
          id: Number(t.id),
          transactionNumber: String(t.transactionNumber ?? `TRX-${t.id}`),
          time: new Date(String(t.createdAt ?? new Date())).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          unit: unitMatch ? unitMatch[1].trim() : null,
          guest: guestMatch ? guestMatch[1].trim() : null,
          total: Number(t.amount ?? 0),
          items: itemsCount,
          status: (String(t.status ?? "pending") as "pending" | "completed" | "cancelled"),
          propertyType: selectedPropertyType,
        };
      });
      setRecentOrders(mapped);
    } catch (error) {
      console.error(error);
      setRecentOrders([]);
    }
  };

  useEffect(() => {
    void loadRecentPosOrders();
  }, [selectedPropertyId, selectedPropertyType]);

  useEffect(() => {
    setClientConfirmedUnitCharge(false);
  }, [selectedPropertyId]);

  useEffect(() => {
    const raw = unit.trim();
    if (!selectedPropertyId || !raw) {
      setUnitOccupants([]);
      setUnitOccupantsHint(null);
      setResolvedUnitDisplay(null);
      setUnitOccupantsLoading(false);
      return;
    }

    setUnitOccupantsLoading(true);
    setUnitOccupantsHint(null);

    const handle = window.setTimeout(async () => {
      try {
        const unitsRes = await api.getUnits(selectedPropertyId);
        const unitsList = (((unitsRes.data as { units?: unknown[] } | undefined)?.units) ?? []) as Array<Record<string, unknown>>;
        const needle = raw.toLowerCase();
        const matched = unitsList.find(
          (u) => String(u.number ?? "").trim().toLowerCase() === needle
        );
        if (!matched) {
          setUnitOccupants([]);
          setResolvedUnitDisplay(null);
          setUnitOccupantsHint(`Nenhuma unidade "${raw}" nesta propriedade.`);
          return;
        }
        const unitId = Number(matched.id);
        const num = String(matched.number ?? raw);
        const uname = matched.name ? String(matched.name) : "";
        setResolvedUnitDisplay(uname ? `${num} — ${uname}` : num);

        const resvRes = await api.getReservations({
          propertyId: selectedPropertyId,
          unitId,
          isActiveNow: "true",
          status: "checked_in,confirmed",
        } as Record<string, string>);
        const reservations = (((resvRes.data as { reservations?: unknown[] } | undefined)?.reservations) ?? []) as Array<Record<string, unknown>>;

        const uniqueNames: string[] = [];
        const seen = new Set<string>();
        for (const r of reservations) {
          for (const n of collectNamesFromReservation(r)) {
            const k = n.toLowerCase();
            if (!seen.has(k)) {
              seen.add(k);
              uniqueNames.push(n);
            }
          }
        }

        setUnitOccupants(uniqueNames);
        if (uniqueNames.length === 0) {
          setUnitOccupantsHint("Nenhuma estadia ativa com hóspedes registrados para esta unidade hoje.");
        } else {
          setUnitOccupantsHint(null);
        }
      } catch (e) {
        console.error(e);
        setUnitOccupants([]);
        setResolvedUnitDisplay(null);
        setUnitOccupantsHint("Não foi possível consultar hóspedes da unidade.");
      } finally {
        setUnitOccupantsLoading(false);
      }
    }, 450);

    return () => window.clearTimeout(handle);
  }, [unit, selectedPropertyId]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || String(p.categoryId ?? "") === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const filteredOrders = recentOrders;
  const getCartQuantity = (productId: number) =>
    cart.find((item) => item.product.id === productId)?.quantity ?? 0;

  const scrollRecentOrders = (direction: "left" | "right") => {
    const el = recentOrdersScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "right" ? 320 : -320, behavior: "smooth" });
  };

  const addToCart = (product: Product) => {
    const currentQty = getCartQuantity(product.id);
    if (product.stockQuantity <= 0) {
      toast.error(`"${product.name}" sem estoque.`);
      return;
    }
    if (currentQty >= product.stockQuantity) {
      toast.error(`Estoque maximo atingido para "${product.name}".`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    if (delta > 0) {
      const product = products.find((p) => p.id === productId);
      const currentQty = getCartQuantity(productId);
      if (product && currentQty >= product.stockQuantity) {
        toast.error(`Estoque maximo atingido para "${product.name}".`);
        return;
      }
    }
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setUnit("");
    setGuestName("");
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const getPaymentMethodId = (kind: "pix" | "debit" | "credit" | "cash") => {
    const byKind = paymentMethods.find((m) => {
      if (kind === "pix") return m.type === "pix" || m.code === "pix";
      if (kind === "debit") return m.type === "debit";
      if (kind === "credit") return m.type === "credit";
      return m.type === "cash";
    });
    return byKind?.id ?? null;
  };

  const createPosTransaction = async (
    method: "Conta do Quarto" | "Cartão de Crédito" | "Cartão de Débito" | "PIX" | "Dinheiro",
    options?: { cardTransactionCode?: string }
  ) => {
    if (!selectedPropertyId) {
      toast.error("Selecione uma propriedade.");
      return false;
    }
    if (!incomeCategoryId) {
      toast.error("Categoria financeira de receita não encontrada.");
      return false;
    }
    const paymentMethodId =
      method === "PIX"
        ? getPaymentMethodId("pix")
        : method === "Cartão de Débito"
        ? getPaymentMethodId("debit")
        : method === "Cartão de Crédito"
        ? getPaymentMethodId("credit")
        : getPaymentMethodId("cash");

    const itemSummary = cart.map((i) => `${i.product.name} x${i.quantity}`).join(", ");
    const unitPart = unit.trim() ? ` | Unidade: ${unit.trim()}` : "";
    const guestPart = guestName.trim() ? ` | Hóspede: ${guestName.trim()}` : "";
    const description = `PDV ${selectedProperty?.name || ""} - ${itemSummary}${unitPart}${guestPart}`.slice(0, 255);

    setIsSubmitting(true);
    let stockDebited = false;
    let stockMovements: Array<{ itemId: number; type: "out" | "in"; quantity: number; reason?: string | null }> = [];
    try {
      // 1) Baixa estoque em lote para todos os itens do carrinho.
      const inventoryRes = await api.getInventoryItems({ propertyId: selectedPropertyId });
      const inventoryItems = (((inventoryRes.data as { items?: unknown[] } | undefined)?.items) ?? []) as Array<Record<string, unknown>>;
      const inventoryRows: InventoryRow[] = inventoryItems.map((row) => ({
        id: Number(row.id),
        productId: Number(row.productId ?? 0),
        currentStock: Number(row.currentStock ?? 0),
      }));

      const reason = `Venda PDV - ${method}`;
      const outMovements = cart.flatMap((item) =>
        buildOutMovementsForProduct(inventoryRows, item.product.id, item.quantity, item.product.name, reason)
      );

      if (outMovements.length > 0) {
        const outRes = await api.createInventoryMovementsBulk({ movements: outMovements });
        if (!outRes.success) {
          throw new Error(outRes.error?.message || "Não foi possível baixar estoque.");
        }
      }
      stockDebited = true;
      stockMovements = outMovements;

      // Ajuste visual imediato no card de produto após baixa de estoque.
      const qtyByProductId = new Map<number, number>();
      for (const item of cart) qtyByProductId.set(item.product.id, item.quantity);
      setProducts((prev) =>
        prev.map((p) => {
          const sold = qtyByProductId.get(p.id) ?? 0;
          if (!sold) return p;
          return { ...p, stockQuantity: Math.max(0, p.stockQuantity - sold) };
        })
      );

      // 2) Lança a receita no financeiro.
      const payload = {
        type: "income",
        financialCategoryId: incomeCategoryId,
        description,
        amount: Number(cartTotal.toFixed(2)),
        currency: "BRL",
        status: "completed",
        paymentMethodId,
        paymentDate: new Date().toISOString(),
        propertyId: selectedPropertyId,
        notes: `POS Terminal | pagamento: ${method}${options?.cardTransactionCode ? ` | codigo_transacao_cartao: ${options.cardTransactionCode}` : ""}`,
      };
      const res = await api.createTransaction(payload);
      if (!res.success) {
        toast.error(res.error?.message || "Não foi possível registrar a venda.");
        return false;
      }
      await loadRecentPosOrders();
      return true;
    } catch (error) {
      console.error(error);
      // Se já baixou estoque e falhou depois, tenta estornar automaticamente.
      if (stockDebited && stockMovements.length > 0) {
        try {
          await api.createInventoryMovementsBulk({
            movements: stockMovements.map((m) => ({
              itemId: m.itemId,
              type: "in",
              quantity: m.quantity,
              reason: "Estorno automatico - falha ao registrar venda PDV",
            })),
          });
        } catch (revertError) {
          console.error("Falha ao estornar estoque apos erro no PDV:", revertError);
        }
      }
      const message = error instanceof Error ? error.message : "Erro ao registrar venda.";
      toast.error(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishOrder = async (paymentMethod: "Conta do Quarto" | "Cartão de Crédito" | "Cartão de Débito" | "PIX" | "Dinheiro") => {
    if (paymentMethod === "Conta do Quarto" && !unit.trim()) {
      toast.error(`Informe o número do ${currentProperty.unitLabel.toLowerCase()}`);
      return;
    }
    if (paymentMethod === "Conta do Quarto" && unit.trim() && !clientConfirmedUnitCharge) {
      toast.error("Confirme com o cliente e marque a caixa de confirmação antes de lançar na conta da unidade.");
      return;
    }
    if (paymentMethod === "Cartão de Crédito" || paymentMethod === "Cartão de Débito") {
      setPendingCardMethod(paymentMethod);
      setCardTransactionConfirmed(false);
      setCardTransactionCode("");
      setCardConfirmModalOpen(true);
      return;
    }
    if (paymentMethod === "PIX") {
      setPixLoading(true);
      setPixModalOpen(true);
      setPixBankConfirmed(false);
      try {
        const pixRes = await api.generateBookingPixCharge({
          amount: Number(cartTotal.toFixed(2)),
          description: `Pagamento POS ${selectedProperty?.name || "UniStays"}`,
          guest: { name: guestName.trim() || undefined },
          reservationContext: {
            unitLabel: unit.trim() ? `${currentProperty.unitLabel} ${unit.trim()}` : undefined,
            period: "POS",
          },
        });
        if (!pixRes.success || !pixRes.data?.brCode) {
          toast.error(pixRes.error?.message || "Não foi possível gerar o PIX.");
          setPixModalOpen(false);
          return;
        }
        setPixData({
          brCode: pixRes.data.brCode,
          qrCodeDataUrl: (pixRes.data as { qrCodeDataUrl?: string }).qrCodeDataUrl,
          amount: pixRes.data.amount,
          description: pixRes.data.description,
        });
      } catch (error) {
        console.error(error);
        toast.error("Erro ao gerar PIX.");
        setPixModalOpen(false);
      } finally {
        setPixLoading(false);
      }
      return;
    }

    const ok = await createPosTransaction(paymentMethod);
    if (!ok) return;
    toast.success(`Pedido enviado! Pagamento: ${paymentMethod}`);
    clearCart();
    setShowPayment(false);
  };

  const handleConfirmPixPaid = async () => {
    if (!pixBankConfirmed) {
      toast.error("Confirme primeiro no Gerencianet/EFI que o PIX foi aprovado.");
      return;
    }
    const ok = await createPosTransaction("PIX");
    if (!ok) return;
    toast.success("Pagamento PIX registrado com sucesso.");
    setPixModalOpen(false);
    setPixData(null);
    clearCart();
    setShowPayment(false);
  };

  const handleConfirmCardPayment = async () => {
    if (!pendingCardMethod) return;
    if (!cardTransactionConfirmed) {
      toast.error("Confirme a aprovação da transação na maquininha antes de continuar.");
      return;
    }
    if (!cardTransactionCode.trim()) {
      toast.error("Informe o código da transação do cartão.");
      return;
    }
    const ok = await createPosTransaction(pendingCardMethod, { cardTransactionCode: cardTransactionCode.trim() });
    if (!ok) return;
    toast.success(`Pagamento ${pendingCardMethod} registrado com sucesso.`);
    setCardConfirmModalOpen(false);
    setPendingCardMethod(null);
    setCardTransactionCode("");
    clearCart();
    setShowPayment(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Products */}
      <div className="flex-1 flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
              currentProperty.color
            )}>
              <currentProperty.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">PDV - {currentProperty.name}</h1>
              <p className="text-sm text-muted-foreground">
                <Clock className="w-3 h-3 inline mr-1" />
                {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={selectedPropertyId ? String(selectedPropertyId) : ""}
              onValueChange={(v) => {
                const id = Number(v);
                const p = properties.find((pp) => pp.id === id);
                setSelectedPropertyId(id);
                if (p) {
                  const t = p.type as PropertyType;
                  if (t === "hotel" || t === "apart-hotel" || t === "loft" || t === "temporada") {
                    setSelectedPropertyType(t);
                  }
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Propriedade" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((prop) => (
                  <SelectItem key={prop.id} value={String(prop.id)}>
                    <div className="flex items-center gap-2">
                      {prop.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={() => window.history.back()}>
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar produto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 text-lg"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              className={cn(
                "gap-2 whitespace-nowrap",
                selectedCategory === cat.id && "bg-gradient-to-r from-orange-500 to-red-500"
              )}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              (() => {
                const outOfStock = product.stockQuantity <= 0;
                const canAdd = !outOfStock && getCartQuantity(product.id) < product.stockQuantity;
                return (
              <Card
                key={product.id}
                className={cn(
                  "transition-all",
                  outOfStock
                    ? "cursor-not-allowed border-red-500/40 bg-red-500/5 opacity-95"
                    : "cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-95"
                )}
                onClick={() => {
                  if (!canAdd) {
                    if (outOfStock) {
                      toast.error(`"${product.name}" sem estoque.`);
                    } else {
                      toast.error(`Estoque maximo atingido para "${product.name}".`);
                    }
                    return;
                  }
                  addToCart(product);
                }}
              >
                <CardContent className="p-4">
                  {(() => {
                    const hasPromo = product.isPromotionActive && product.promotionalPrice != null && product.promotionalPrice > 0 && product.promotionalPrice < product.price;
                    return (
                      <>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-orange-500/10 to-red-500/5 flex items-center justify-center shrink-0 border border-border/60">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UtensilsCrossed className="w-5 h-5 text-orange-500/50" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{product.category || "Sem categoria"}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">Qtd atual</span>
                      <span className={`text-xs font-semibold ${product.stockQuantity <= 0 ? "text-red-500" : product.stockQuantity <= 5 ? "text-amber-500" : "text-emerald-500"}`}>
                        {product.stockQuantity}
                      </span>
                    </div>
                    {outOfStock && (
                      <Badge className="h-5 text-[10px] bg-red-500/10 text-red-600 border border-red-200">
                        Sem estoque
                      </Badge>
                    )}
                    {hasPromo ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground line-through">
                            R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                          <Badge className="h-5 text-[10px] bg-rose-500/10 text-rose-600 border border-rose-200">
                            Em promocao
                          </Badge>
                        </div>
                        <p className="text-lg font-bold text-rose-600">
                          R$ {(product.promotionalPrice ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-emerald-500">
                          R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        <Badge variant="outline" className="h-5 text-[10px]">
                          Sem promocao
                        </Badge>
                      </div>
                    )}
                  </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
                );
              })()
            ))}
          </div>
        </ScrollArea>

        {/* Recent Orders - Bottom */}
        <div className="mt-4 pt-4 border-t border-border rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg px-3 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Receipt className="w-4 h-4 text-slate-200" />
              Últimos Pedidos
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-white/20 bg-white/5 text-white hover:bg-white/10"
                onClick={() => scrollRecentOrders("left")}
                aria-label="Rolar pedidos para a esquerda"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-white/20 bg-white/5 text-white hover:bg-white/10"
                onClick={() => scrollRecentOrders("right")}
                aria-label="Rolar pedidos para a direita"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div
            ref={recentOrdersScrollRef}
            className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {recentOrders.length === 0 && (
              <Card className="min-w-[280px] flex-shrink-0 border-white/10 bg-white/5 backdrop-blur-sm">
                <CardContent className="p-4 text-sm text-slate-300">
                  Nenhum pedido do PDV encontrado para esta propriedade.
                </CardContent>
              </Card>
            )}
            {recentOrders.slice(0, 20).map((order) => {
              const status = statusConfig[order.status];
              return (
                <Card key={order.id} className="min-w-[180px] flex-shrink-0 border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-medium text-white">{order.transactionNumber}</span>
                      <Badge variant="outline" className={status.color}>
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300 mb-1">
                      <BedDouble className="w-3 h-3" />
                      <span>{order.unit ? `${currentProperty.unitLabel} ${order.unit}` : "Sem unidade"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{order.time} {order.items > 0 ? `• ${order.items} itens` : ""}</span>
                      <span className="font-semibold text-emerald-300">
                        R$ {order.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Side - Cart — mesmo padrão visual dos Últimos Pedidos (reserva / slate escuro) */}
      <div className="w-[380px] border-l border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg flex flex-col min-h-0">
        {!showPayment ? (
          <>
            {/* Cart Header */}
            <div className="p-4 border-b border-white/10 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                  <ShoppingCart className="w-5 h-5 text-slate-200" />
                  Pedido
                  {cartItemsCount > 0 && (
                    <Badge className="bg-orange-500 border-0">{cartItemsCount}</Badge>
                  )}
                </h2>
                {cart.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCart} className="text-slate-200 hover:bg-white/10 hover:text-white">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Unit & Guest */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 flex items-center gap-1">
                    <currentProperty.icon className="w-3 h-3" />
                    {currentProperty.unitLabel}
                  </label>
                  <Input
                    placeholder="Nº"
                    value={unit}
                    onChange={(e) => {
                      setUnit(e.target.value);
                      setClientConfirmedUnitCharge(false);
                    }}
                    className="h-10 bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Hóspede
                  </label>
                  <Input
                    placeholder="Nome"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="h-10 bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              {unit.trim() && (
                <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
                    <Users className="h-3.5 w-3.5" />
                    Pessoas na unidade (hoje)
                  </div>
                  {unitOccupantsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Consultando reservas...
                    </div>
                  ) : unitOccupants.length > 0 ? (
                    <ul className="space-y-1.5 text-sm text-white">
                      {unitOccupants.map((n) => (
                        <li key={n} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                          {n}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-amber-200/90">{unitOccupantsHint || "Digite o número para buscar hóspedes."}</p>
                  )}
                  {resolvedUnitDisplay && !unitOccupantsLoading && (
                    <p className="text-[11px] text-slate-500 border-t border-white/10 pt-2">
                      Unidade: {resolvedUnitDisplay}
                    </p>
                  )}
                  <label className="flex items-start gap-2 cursor-pointer pt-1">
                    <Checkbox
                      checked={clientConfirmedUnitCharge}
                      onCheckedChange={(v) => setClientConfirmedUnitCharge(v === true)}
                      className="mt-0.5 border-white/40 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <span className="text-xs text-slate-300 leading-snug">
                      O cliente que está pedindo confirmou o lançamento na conta desta unidade e está ciente das pessoas listadas acima.
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Cart Items */}
            <ScrollArea className="flex-1 min-h-0 p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-500" />
                  <p className="text-slate-300">Carrinho vazio</p>
                  <p className="text-sm text-slate-500">Clique nos produtos para adicionar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white truncate">{item.product.name}</p>
                        <p className="text-sm text-slate-400">
                          R$ {item.product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-white/20 bg-white/5 text-white hover:bg-white/10"
                          onClick={() => updateQuantity(item.product.id, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-white">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-white/20 bg-white/5 text-white hover:bg-white/10"
                          onClick={() => updateQuantity(item.product.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-red-300 hover:bg-white/10 hover:text-red-200"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Cart Footer */}
            <div className="p-4 border-t border-white/10 space-y-4 shrink-0">
              <div className="flex items-center justify-between text-lg">
                <span className="font-medium text-slate-200">Total</span>
                <span className="text-2xl font-bold text-emerald-300">
                  R$ {cartTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <Button
                className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
                disabled={cart.length === 0}
                onClick={() => setShowPayment(true)}
              >
                <CreditCard className="w-5 h-5" />
                Finalizar Pedido
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Payment Screen */}
            <div className="p-4 border-b border-white/10 shrink-0">
              <Button variant="ghost" className="gap-2 mb-4 text-slate-200 hover:bg-white/10 hover:text-white" onClick={() => setShowPayment(false)}>
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>
              <h2 className="text-xl font-bold text-white">Pagamento</h2>
              <p className="text-slate-400 text-sm">Selecione a forma de pagamento</p>
            </div>

            <div className="flex-1 min-h-0 p-4 space-y-4 overflow-y-auto">
              {/* Order Summary */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">{currentProperty.unitLabel}</span>
                    <span className="font-semibold text-white">{unit || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Itens</span>
                    <span className="font-semibold text-white">{cartItemsCount}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="font-medium text-slate-200">Total</span>
                    <span className="text-2xl font-bold text-emerald-300">
                      R$ {cartTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Options */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-16 justify-start gap-4 text-left border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => handleFinishOrder("Conta do Quarto")}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <BedDouble className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Lançar na Conta</p>
                    <p className="text-sm text-slate-400">Débito no checkout</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-16 justify-start gap-4 text-left border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => handleFinishOrder("Cartão de Crédito")}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Cartão de Crédito</p>
                    <p className="text-sm text-slate-400">Visa, Master, Elo</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-16 justify-start gap-4 text-left border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => void handleFinishOrder("Cartão de Débito")}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Cartão de Débito</p>
                    <p className="text-sm text-slate-400">Visa, Master, Elo</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-16 justify-start gap-4 text-left border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => void handleFinishOrder("PIX")}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">PIX</p>
                    <p className="text-sm text-slate-400">Pagamento instantâneo</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-16 justify-start gap-4 text-left border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => void handleFinishOrder("Dinheiro")}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                    <Banknote className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Dinheiro</p>
                    <p className="text-sm text-slate-400">Pagamento em espécie</p>
                  </div>
                </Button>
              </div>
            </div>

            {/* Print Button */}
            <div className="p-4 border-t border-white/10 shrink-0">
              <Button variant="outline" className="w-full gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10">
                <Printer className="w-4 h-4" />
                Imprimir Comanda
              </Button>
            </div>
          </>
        )}
      </div>

      <Dialog open={pixModalOpen} onOpenChange={setPixModalOpen}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden">
          <div className="h-full flex flex-col bg-background">
            <div className="px-8 py-6 border-b bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
              <h2 className="text-2xl font-bold">Pagamento PIX</h2>
              <p className="text-muted-foreground">Escaneie o QR Code ou copie o codigo PIX para concluir o pagamento.</p>
            </div>
            <div className="flex-1 overflow-auto p-8">
              {pixLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">Gerando PIX...</div>
              ) : pixData ? (
                <div className="grid md:grid-cols-2 gap-8 h-full">
                  <Card className="border-emerald-500/20">
                    <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
                      {pixData.qrCodeDataUrl ? (
                        <img src={pixData.qrCodeDataUrl} alt="QR Code PIX" className="w-72 h-72 object-contain rounded-xl border" />
                      ) : (
                        <div className="w-72 h-72 rounded-xl border flex items-center justify-center text-muted-foreground">QR indisponivel</div>
                      )}
                      <p className="text-sm text-muted-foreground">Valor: R$ {pixData.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </CardContent>
                  </Card>
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-5 space-y-3">
                        <p className="text-sm text-muted-foreground">Descricao</p>
                        <p className="font-medium">{pixData.description}</p>
                        <p className="text-sm text-muted-foreground mt-3">PIX copia e cola</p>
                        <div className="p-3 rounded-md bg-muted text-xs break-all">{pixData.brCode}</div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            void navigator.clipboard.writeText(pixData.brCode);
                            toast.success("Codigo PIX copiado!");
                          }}
                        >
                          Copiar codigo PIX
                        </Button>
                      </CardContent>
                    </Card>
                    <div className="text-xs text-muted-foreground">
                      Se quarto e hospede nao forem informados, o pagamento e registrado normalmente no financeiro do sistema.
                    </div>
                    <label className="flex items-start gap-2 text-sm">
                      <Checkbox
                        checked={pixBankConfirmed}
                        onCheckedChange={(v) => setPixBankConfirmed(v === true)}
                      />
                      <span>Confirmo que o pagamento PIX foi aprovado no Gerencianet/EFI.</span>
                    </label>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="px-8 py-4 border-t bg-muted/30 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setPixModalOpen(false)}>Fechar</Button>
              <Button onClick={() => void handleConfirmPixPaid()} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                {isSubmitting ? "Registrando..." : "Confirmar pagamento PIX"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={cardConfirmModalOpen} onOpenChange={setCardConfirmModalOpen}>
        <DialogContent className="max-w-xl">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Confirmação de {pendingCardMethod || "Cartão"}</h2>
            <p className="text-sm text-muted-foreground">
              Confirme que a transação foi aprovada na maquininha para concluir o pedido, baixar o estoque e registrar no financeiro.
            </p>
            <div className="rounded-md border p-3 bg-muted/30">
              <p className="text-sm">Valor: <strong>R$ {cartTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></p>
              <p className="text-sm">Itens: <strong>{cartItemsCount}</strong></p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Código da transação do cartão *</label>
              <Input
                value={cardTransactionCode}
                onChange={(e) => setCardTransactionCode(e.target.value)}
                placeholder="Ex.: NSU, autorização ou código da maquininha"
              />
            </div>
            <label className="flex items-start gap-2 text-sm">
              <Checkbox
                checked={cardTransactionConfirmed}
                onCheckedChange={(v) => setCardTransactionConfirmed(v === true)}
              />
              <span>Confirmo que a transação em cartão foi autorizada pela operadora.</span>
            </label>
            <p className="text-xs text-muted-foreground">
              Importante: guarde o papel/comprovante da transação para conferência e auditoria.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCardConfirmModalOpen(false);
                  setPendingCardMethod(null);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={() => void handleConfirmCardPayment()} disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Concluir pedido"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
