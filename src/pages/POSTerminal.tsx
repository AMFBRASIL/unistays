import { useEffect, useMemo, useState } from "react";
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
  Ban,
  Hash,
  CalendarClock,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { printHtmlDocument } from "@/lib/printHtml";
import {
  findOpenComanda,
  loadOpenComandas,
  openComandaItemsCount,
  openComandaTotal,
  removeOpenComanda,
  upsertOpenComandaItems,
  type OpenComanda,
} from "@/lib/posOpenComandas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface PosOrderLineItem {
  name: string;
  quantity: number;
}

interface RecentOrder {
  id: number;
  transactionNumber: string;
  time: string;
  createdAt: string;
  unit: string | null;
  comanda: string | null;
  guest: string | null;
  total: number;
  items: number;
  lineItems: PosOrderLineItem[];
  status: "pending" | "completed" | "cancelled" | "refunded";
  propertyType: string;
  propertyName: string | null;
  paymentMethodName: string | null;
  paymentLabel: string | null;
  description: string;
  notes: string | null;
  currency: string;
}

type OrderTargetMode = "unit" | "comanda";

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
  refunded: { label: "Estornado", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
};

function parsePosOrderDescription(desc: string): {
  unit: string | null;
  comanda: string | null;
  guest: string | null;
  lineItems: PosOrderLineItem[];
} {
  const unitMatch = desc.match(/unidade:\s*([^\-|]+)/i);
  const comandaMatch = desc.match(/comanda:\s*([^\-|]+)/i);
  const guestMatch = desc.match(/(?:h[oó]spede|nome):\s*([^\-|]+)/i);
  const afterDash = desc.includes(" - ") ? desc.split(" - ").slice(1).join(" - ") : desc;
  const itemsChunk = afterDash.split(" | ")[0] ?? "";
  const lineItems: PosOrderLineItem[] = itemsChunk
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const m = chunk.match(/^(.*)\s+x(\d+)\s*$/i);
      if (m) {
        return { name: m[1].trim(), quantity: Number(m[2]) || 1 };
      }
      return { name: chunk, quantity: 1 };
    });

  return {
    unit: unitMatch ? unitMatch[1].trim() : null,
    comanda: comandaMatch ? comandaMatch[1].trim() : null,
    guest: guestMatch ? guestMatch[1].trim() : null,
    lineItems,
  };
}

function extractPaymentLabelFromNotes(notes: string | null | undefined): string | null {
  if (!notes) return null;
  const m = notes.match(/pagamento:\s*([^|]+)/i);
  return m ? m[1].trim() : null;
}

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
  const [orderTargetMode, setOrderTargetMode] = useState<OrderTargetMode>("unit");
  const [unit, setUnit] = useState("");
  const [comandaNumber, setComandaNumber] = useState("");
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
  const [selectedOrder, setSelectedOrder] = useState<RecentOrder | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);
  const [ordersPage, setOrdersPage] = useState(0);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printSource, setPrintSource] = useState<"cart" | "comanda">("cart");
  const [openComandaPreview, setOpenComandaPreview] = useState<OpenComanda | null>(null);
  const [payingOpenComandaNumber, setPayingOpenComandaNumber] = useState<string | null>(null);
  const [openComandasTick, setOpenComandasTick] = useState(0);
  const [payComandaModalOpen, setPayComandaModalOpen] = useState(false);
  const [payComandaLookup, setPayComandaLookup] = useState("");
  const [payComandaSelected, setPayComandaSelected] = useState<OpenComanda | null>(null);
  const RECENT_ORDERS_PAGE_SIZE = 6;

  const currentProperty = propertyTypes.find(p => p.id === selectedPropertyType) || propertyTypes[0];
  const selectedProperty = useMemo(() => properties.find((p) => p.id === selectedPropertyId) || null, [properties, selectedPropertyId]);

  const activeOpenComanda = useMemo(() => {
    if (!selectedPropertyId || orderTargetMode !== "comanda" || !comandaNumber.trim()) return null;
    void openComandasTick;
    return findOpenComanda(selectedPropertyId, comandaNumber);
  }, [selectedPropertyId, orderTargetMode, comandaNumber, openComandasTick]);

  const allOpenComandas = useMemo(() => {
    if (!selectedPropertyId) return [] as OpenComanda[];
    void openComandasTick;
    return loadOpenComandas(selectedPropertyId);
  }, [selectedPropertyId, openComandasTick]);

  const openComandasCount = allOpenComandas.length;

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
      const mapped: RecentOrder[] = list.slice(0, 30).map((t) => {
        const desc = String(t.description ?? "");
        const notes = t.notes != null ? String(t.notes) : null;
        const parsed = parsePosOrderDescription(desc);
        const createdAt = String(t.createdAt ?? new Date().toISOString());
        const statusRaw = String(t.status ?? "pending");
        const status =
          statusRaw === "cancelled" || statusRaw === "refunded" || statusRaw === "pending" || statusRaw === "completed"
            ? statusRaw
            : "pending";
        return {
          id: Number(t.id),
          transactionNumber: String(t.transactionNumber ?? `TRX-${t.id}`),
          time: new Date(createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          createdAt,
          unit: parsed.unit,
          comanda: parsed.comanda,
          guest: parsed.guest,
          total: Number(t.amount ?? 0),
          items: parsed.lineItems.length,
          lineItems: parsed.lineItems,
          status,
          propertyType: selectedPropertyType,
          propertyName: t.propertyName ? String(t.propertyName) : selectedProperty?.name ?? null,
          paymentMethodName: t.paymentMethodName ? String(t.paymentMethodName) : null,
          paymentLabel: extractPaymentLabelFromNotes(notes),
          description: desc,
          notes,
          currency: String(t.currency ?? "BRL"),
        };
      });
      setRecentOrders(mapped);
      setOrdersPage(0);
    } catch (error) {
      console.error(error);
      setRecentOrders([]);
      setOrdersPage(0);
    }
  };

  useEffect(() => {
    void loadRecentPosOrders();
  }, [selectedPropertyId, selectedPropertyType]);

  useEffect(() => {
    setClientConfirmedUnitCharge(false);
    setUnit("");
    setComandaNumber("");
    setGuestName("");
    setOrderTargetMode("unit");
  }, [selectedPropertyId]);

  useEffect(() => {
    if (orderTargetMode !== "unit") {
      setUnitOccupants([]);
      setUnitOccupantsHint(null);
      setResolvedUnitDisplay(null);
      setUnitOccupantsLoading(false);
      return;
    }

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

        // Estadia "em uso" hoje: check-in <= hoje <= check-out e status checked_in ou confirmed
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
  }, [unit, selectedPropertyId, orderTargetMode]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || String(p.categoryId ?? "") === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const getCartQuantity = (productId: number) =>
    cart.find((item) => item.product.id === productId)?.quantity ?? 0;

  const ordersPageCount = Math.max(1, Math.ceil(recentOrders.length / RECENT_ORDERS_PAGE_SIZE));
  const visibleRecentOrders = recentOrders.slice(
    ordersPage * RECENT_ORDERS_PAGE_SIZE,
    ordersPage * RECENT_ORDERS_PAGE_SIZE + RECENT_ORDERS_PAGE_SIZE
  );

  const goRecentOrdersPage = (direction: "left" | "right") => {
    setOrdersPage((prev) => {
      if (direction === "left") return Math.max(0, prev - 1);
      return Math.min(ordersPageCount - 1, prev + 1);
    });
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

  const clearCart = (options?: { keepComandaTarget?: boolean }) => {
    setCart([]);
    setClientConfirmedUnitCharge(false);
    setPayingOpenComandaNumber(null);
    if (!options?.keepComandaTarget) {
      setUnit("");
      setComandaNumber("");
      setGuestName("");
    }
  };

  const refreshOpenComandas = () => setOpenComandasTick((n) => n + 1);

  const buildComandaPrintHtml = (opts: {
    title: string;
    comanda?: string | null;
    unit?: string | null;
    guest?: string | null;
    items: Array<{ name: string; quantity: number; price: number }>;
    footerNote?: string;
  }) => {
    const total = opts.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const when = new Date().toLocaleString("pt-BR");
    const rows = opts.items
      .map(
        (i) => `
        <tr>
          <td style="padding:6px 0;border-bottom:1px dashed #ddd;">${i.name}</td>
          <td style="padding:6px 0;border-bottom:1px dashed #ddd;text-align:center;">${i.quantity}</td>
          <td style="padding:6px 0;border-bottom:1px dashed #ddd;text-align:right;">R$ ${(i.price * i.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
        </tr>`
      )
      .join("");

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${opts.title}</title>
  <style>
    @page { margin: 8mm; size: 80mm auto; }
    body { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #111; margin: 0; padding: 8px; font-size: 12px; }
    h1 { font-size: 16px; margin: 0 0 4px; text-align: center; }
    .muted { color: #555; font-size: 11px; text-align: center; margin-bottom: 12px; }
    .meta { margin: 10px 0; line-height: 1.45; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; border-bottom: 1px solid #111; padding-bottom: 4px; font-size: 11px; }
    .total { margin-top: 12px; font-size: 15px; font-weight: 700; display: flex; justify-content: space-between; }
    .footer { margin-top: 16px; text-align: center; font-size: 11px; color: #444; }
  </style>
</head>
<body>
  <h1>${opts.title}</h1>
  <div class="muted">${selectedProperty?.name || "UniStays"} · ${when}</div>
  <div class="meta">
    ${opts.comanda ? `<div><strong>Comanda:</strong> ${opts.comanda}</div>` : ""}
    ${opts.unit ? `<div><strong>${currentProperty.unitLabel}:</strong> ${opts.unit}</div>` : ""}
    ${opts.guest ? `<div><strong>Cliente:</strong> ${opts.guest}</div>` : ""}
  </div>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th style="text-align:center;">Qtd</th>
        <th style="text-align:right;">Valor</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="total">
    <span>TOTAL</span>
    <span>R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
  </div>
  <div class="footer">${opts.footerNote || "Obrigado!"}</div>
</body>
</html>`;
  };

  const openPrintModal = (source: "cart" | "comanda" = "cart") => {
    if (source === "cart") {
      if (cart.length === 0) {
        toast.error("Adicione itens ao carrinho para imprimir a comanda.");
        return;
      }
      setPrintSource("cart");
      setOpenComandaPreview(null);
      setPrintModalOpen(true);
      return;
    }
    if (!selectedPropertyId || !comandaNumber.trim()) {
      toast.error("Informe o número da comanda para imprimir.");
      return;
    }
    const open = findOpenComanda(selectedPropertyId, comandaNumber);
    if (!open || open.items.length === 0) {
      toast.error("Não há itens nesta comanda aberta.");
      return;
    }
    setPrintSource("comanda");
    setOpenComandaPreview(open);
    setPrintModalOpen(true);
  };

  const handlePrintComanda = () => {
    const items =
      printSource === "comanda" && openComandaPreview
        ? openComandaPreview.items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          }))
        : cart.map((i) => ({
            name: i.product.name,
            quantity: i.quantity,
            price: i.product.price,
          }));

    if (items.length === 0) {
      toast.error("Nada para imprimir.");
      return;
    }

    const html = buildComandaPrintHtml({
      title: "COMANDA PDV",
      comanda:
        printSource === "comanda"
          ? openComandaPreview?.number
          : orderTargetMode === "comanda"
            ? comandaNumber || null
            : null,
      unit: orderTargetMode === "unit" ? unit || null : null,
      guest:
        printSource === "comanda"
          ? openComandaPreview?.guestName || guestName || null
          : guestName || null,
      items,
      footerNote:
        printSource === "comanda"
          ? "Comanda em aberto — pagamento ao final"
          : "Prévia do pedido",
    });

    const ok = printHtmlDocument(html);
    if (ok) toast.success("Enviando comanda para impressão...");
    else toast.error("Não foi possível abrir a impressão.");
  };

  const handleAddCartToComanda = () => {
    if (!selectedPropertyId) {
      toast.error("Selecione uma propriedade.");
      return;
    }
    if (orderTargetMode !== "comanda") {
      toast.error("Ative o modo Day-use / Comanda para lançar itens sem pagar agora.");
      return;
    }
    if (!comandaNumber.trim()) {
      toast.error("Informe o número da comanda.");
      return;
    }
    if (cart.length === 0) {
      toast.error("Adicione itens ao carrinho.");
      return;
    }

    const saved = upsertOpenComandaItems(
      selectedPropertyId,
      comandaNumber,
      guestName,
      cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }))
    );
    refreshOpenComandas();
    clearCart({ keepComandaTarget: true });
    setShowPayment(false);
    toast.success(`Itens adicionados à comanda ${saved.number}`, {
      description: `Total em aberto: R$ ${openComandaTotal(saved).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    });
  };

  const buildCartFromOpenComanda = (open: OpenComanda): CartItem[] => {
    const productMap = new Map(products.map((p) => [p.id, p]));
    const nextCart: CartItem[] = [];
    for (const item of open.items) {
      const product = productMap.get(item.productId);
      if (product) {
        nextCart.push({ product, quantity: item.quantity });
      } else {
        nextCart.push({
          product: {
            id: item.productId,
            name: item.name,
            price: item.price,
            promotionalPrice: null,
            isPromotionActive: false,
            stockQuantity: 9999,
            category: null,
            categoryId: null,
          },
          quantity: item.quantity,
        });
      }
    }
    return nextCart;
  };

  const prepareOpenComandaForPayment = (open: OpenComanda) => {
    setCart(buildCartFromOpenComanda(open));
    setComandaNumber(open.number);
    setGuestName(open.guestName || "");
    setOrderTargetMode("comanda");
    setPayingOpenComandaNumber(open.number);
    setUnit("");
    setClientConfirmedUnitCharge(false);
  };

  const openPayComandaModal = (prefill?: string) => {
    refreshOpenComandas();
    const initial = (prefill ?? comandaNumber).trim();
    setPayComandaLookup(initial);
    if (selectedPropertyId && initial) {
      setPayComandaSelected(findOpenComanda(selectedPropertyId, initial));
    } else {
      setPayComandaSelected(null);
    }
    setPayComandaModalOpen(true);
  };

  const handleLookupPayComanda = () => {
    if (!selectedPropertyId) {
      toast.error("Selecione uma propriedade.");
      return;
    }
    if (!payComandaLookup.trim()) {
      toast.error("Informe o número da comanda.");
      return;
    }
    const found = findOpenComanda(selectedPropertyId, payComandaLookup);
    if (!found || found.items.length === 0) {
      setPayComandaSelected(null);
      toast.error(`Nenhuma comanda aberta com o nº "${payComandaLookup.trim()}".`);
      return;
    }
    setPayComandaSelected(found);
    setComandaNumber(found.number);
    setGuestName(found.guestName || "");
    setOrderTargetMode("comanda");
  };

  const handleLoadOpenComandaToPay = (open?: OpenComanda | null) => {
    const target =
      open ??
      (selectedPropertyId && comandaNumber.trim()
        ? findOpenComanda(selectedPropertyId, comandaNumber)
        : null);
    if (!target || target.items.length === 0) {
      toast.error("Comanda sem itens em aberto.");
      return;
    }
    prepareOpenComandaForPayment(target);
    setPayComandaModalOpen(false);
    setShowPayment(true);
    toast.message(`Comanda ${target.number} carregada para pagamento`);
  };

  const handlePayComandaFromModal = async (
    method: "Cartão de Crédito" | "Cartão de Débito" | "PIX" | "Dinheiro"
  ) => {
    if (!payComandaSelected || payComandaSelected.items.length === 0) {
      toast.error("Selecione uma comanda com itens.");
      return;
    }
    if (method === "PIX" || method === "Cartão de Crédito" || method === "Cartão de Débito") {
      prepareOpenComandaForPayment(payComandaSelected);
      setPayComandaModalOpen(false);
      setShowPayment(true);
      // Reutiliza fluxos existentes (QR PIX / confirmação de cartão)
      void handleFinishOrder(method);
      return;
    }

    const saleItems = buildCartFromOpenComanda(payComandaSelected);
    prepareOpenComandaForPayment(payComandaSelected);
    const ok = await createPosTransaction(method, {
      cartItems: saleItems,
      targetMode: "comanda",
      comandaValue: payComandaSelected.number,
      guestValue: payComandaSelected.guestName || guestName,
      closeComandaNumber: payComandaSelected.number,
    });
    if (!ok) return;
    toast.success(`Comanda ${payComandaSelected.number} paga com sucesso!`);
    clearCart();
    setShowPayment(false);
    setPayComandaModalOpen(false);
    setPayComandaSelected(null);
    setPayComandaLookup("");
  };

  const openOrderDetail = (order: RecentOrder) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
  };

  const handleCancelSelectedOrder = async () => {
    if (!selectedOrder || !selectedPropertyId) return;
    if (selectedOrder.status === "cancelled" || selectedOrder.status === "refunded") {
      toast.error("Este pedido já está cancelado.");
      return;
    }

    setIsCancellingOrder(true);
    try {
      // Tenta estornar estoque pelos itens parseados da descrição
      if (selectedOrder.lineItems.length > 0) {
        try {
          const inventoryRes = await api.getInventoryItems({ propertyId: selectedPropertyId });
          const inventoryItems = (((inventoryRes.data as { items?: unknown[] } | undefined)?.items) ?? []) as Array<Record<string, unknown>>;
          const inventoryRows: InventoryRow[] = inventoryItems.map((row) => ({
            id: Number(row.id),
            productId: Number(row.productId ?? 0),
            currentStock: Number(row.currentStock ?? 0),
          }));

          const productByName = new Map(
            products.map((p) => [p.name.trim().toLowerCase(), p] as const)
          );
          const restoreMovements: Array<{ itemId: number; type: "in"; quantity: number; reason: string }> = [];

          for (const line of selectedOrder.lineItems) {
            const product = productByName.get(line.name.trim().toLowerCase());
            if (!product) continue;
            const rowsForProduct = inventoryRows
              .filter((r) => r.productId === product.id)
              .sort((a, b) => a.id - b.id);
            if (rowsForProduct.length === 0) continue;
            restoreMovements.push({
              itemId: rowsForProduct[0].id,
              type: "in",
              quantity: line.quantity,
              reason: `Estorno PDV - cancelamento ${selectedOrder.transactionNumber}`,
            });
          }

          if (restoreMovements.length > 0) {
            await api.createInventoryMovementsBulk({ movements: restoreMovements });
            const qtyByProductId = new Map<number, number>();
            for (const line of selectedOrder.lineItems) {
              const product = productByName.get(line.name.trim().toLowerCase());
              if (!product) continue;
              qtyByProductId.set(product.id, (qtyByProductId.get(product.id) ?? 0) + line.quantity);
            }
            setProducts((prev) =>
              prev.map((p) => {
                const restored = qtyByProductId.get(p.id) ?? 0;
                if (!restored) return p;
                return { ...p, stockQuantity: p.stockQuantity + restored };
              })
            );
          }
        } catch (stockErr) {
          console.error("Falha ao estornar estoque no cancelamento:", stockErr);
          toast.warning("Pedido cancelado no financeiro, mas o estorno de estoque falhou. Ajuste manualmente se necessário.");
        }
      }

      const cancelNotes = `${selectedOrder.notes ? `${selectedOrder.notes} | ` : ""}cancelado_pdv: ${new Date().toISOString()}`;
      const res = await api.updateTransaction(selectedOrder.id, {
        status: "cancelled",
        notes: cancelNotes,
      });
      if (!res.success) {
        throw new Error(res.error?.message || "Não foi possível cancelar o pedido.");
      }

      toast.success("Pedido cancelado com sucesso.");
      setCancelConfirmOpen(false);
      setOrderDetailOpen(false);
      setSelectedOrder(null);
      await loadRecentPosOrders();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Erro ao cancelar pedido.");
    } finally {
      setIsCancellingOrder(false);
    }
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
    options?: {
      cardTransactionCode?: string;
      cartItems?: CartItem[];
      targetMode?: OrderTargetMode;
      unitValue?: string;
      comandaValue?: string;
      guestValue?: string;
      closeComandaNumber?: string | null;
    }
  ) => {
    if (!selectedPropertyId) {
      toast.error("Selecione uma propriedade.");
      return false;
    }
    if (!incomeCategoryId) {
      toast.error("Categoria financeira de receita não encontrada.");
      return false;
    }
    const saleItems = options?.cartItems ?? cart;
    if (saleItems.length === 0) {
      toast.error("Nenhum item para faturar.");
      return false;
    }
    const saleTotal = saleItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const mode = options?.targetMode ?? orderTargetMode;
    const unitValue = options?.unitValue ?? unit;
    const comandaValue = options?.comandaValue ?? comandaNumber;
    const guestValue = options?.guestValue ?? guestName;
    const closeComandaNumber = options?.closeComandaNumber ?? payingOpenComandaNumber;

    const paymentMethodId =
      method === "PIX"
        ? getPaymentMethodId("pix")
        : method === "Cartão de Débito"
        ? getPaymentMethodId("debit")
        : method === "Cartão de Crédito"
        ? getPaymentMethodId("credit")
        : getPaymentMethodId("cash");

    const itemSummary = saleItems.map((i) => `${i.product.name} x${i.quantity}`).join(", ");
    const unitPart =
      mode === "unit" && unitValue.trim() ? ` | Unidade: ${unitValue.trim()}` : "";
    const comandaPart =
      mode === "comanda" && comandaValue.trim()
        ? ` | Comanda: ${comandaValue.trim()}`
        : "";
    const guestPart = guestValue.trim()
      ? ` | ${mode === "comanda" ? "Nome" : "Hóspede"}: ${guestValue.trim()}`
      : "";
    const description = `PDV ${selectedProperty?.name || ""} - ${itemSummary}${unitPart}${comandaPart}${guestPart}`.slice(0, 255);

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
      const outMovements = saleItems.flatMap((item) =>
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
      for (const item of saleItems) qtyByProductId.set(item.product.id, item.quantity);
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
        amount: Number(saleTotal.toFixed(2)),
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
      if (closeComandaNumber && selectedPropertyId) {
        removeOpenComanda(selectedPropertyId, closeComandaNumber);
        refreshOpenComandas();
        setPayingOpenComandaNumber(null);
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
    if (paymentMethod === "Conta do Quarto" && orderTargetMode === "comanda") {
      toast.error("Conta do quarto só funciona no modo Unidade. Use PIX, cartão ou dinheiro para day-use/comanda.");
      return;
    }
    if (paymentMethod === "Conta do Quarto" && !unit.trim()) {
      toast.error(`Informe o número do ${currentProperty.unitLabel.toLowerCase()}`);
      return;
    }
    if (paymentMethod === "Conta do Quarto" && unit.trim() && !clientConfirmedUnitCharge) {
      toast.error("Confirme com o cliente e marque a caixa de confirmação antes de lançar na conta da unidade.");
      return;
    }
    if (orderTargetMode === "comanda" && !comandaNumber.trim() && !guestName.trim()) {
      toast.error("Informe o número da comanda ou o nome do cliente (day-use).");
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
          <div className="flex items-center justify-between mb-3 gap-2">
            <h3 className="font-semibold flex items-center gap-2 shrink-0">
              <Receipt className="w-4 h-4 text-slate-200" />
              Últimos Pedidos
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 border-amber-400/40 bg-amber-500/15 text-amber-50 hover:bg-amber-500/25"
                onClick={() => openPayComandaModal()}
              >
                <Hash className="w-3.5 h-3.5" />
                Pagar comanda
                {openComandasCount > 0 && (
                  <Badge className="h-5 px-1.5 bg-amber-400 text-slate-950 border-0 text-[10px]">
                    {openComandasCount}
                  </Badge>
                )}
              </Button>
              {recentOrders.length > RECENT_ORDERS_PAGE_SIZE && (
                <span className="text-[11px] text-slate-400 tabular-nums">
                  {ordersPage + 1}/{ordersPageCount}
                </span>
              )}
              <Button
                variant="outline"
                size="icon"
                disabled={ordersPage <= 0}
                className="h-8 w-8 border-white/20 bg-white/5 text-white hover:bg-white/10 disabled:opacity-30"
                onClick={() => goRecentOrdersPage("left")}
                aria-label="Pedidos anteriores"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={ordersPage >= ordersPageCount - 1 || recentOrders.length === 0}
                className="h-8 w-8 border-white/20 bg-white/5 text-white hover:bg-white/10 disabled:opacity-30"
                onClick={() => goRecentOrdersPage("right")}
                aria-label="Próximos pedidos"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-3 overflow-hidden pb-1">
            {recentOrders.length === 0 && (
              <Card className="min-w-[280px] flex-shrink-0 border-white/10 bg-white/5 backdrop-blur-sm">
                <CardContent className="p-4 text-sm text-slate-300">
                  Nenhum pedido do PDV encontrado para esta propriedade.
                </CardContent>
              </Card>
            )}
            {visibleRecentOrders.map((order) => {
              const status = statusConfig[order.status] ?? statusConfig.pending;
              return (
                <Card
                  key={order.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openOrderDetail(order)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openOrderDetail(order);
                    }
                  }}
                  className={cn(
                    "min-w-[180px] flex-shrink-0 border-white/10 bg-white/5 backdrop-blur-sm cursor-pointer transition-all",
                    "hover:bg-white/10 hover:border-white/25 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60",
                    (order.status === "cancelled" || order.status === "refunded") && "opacity-60"
                  )}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-medium text-white">{order.transactionNumber}</span>
                      <Badge variant="outline" className={status.color}>
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300 mb-1">
                      {order.comanda ? (
                        <>
                          <Receipt className="w-3 h-3" />
                          <span>
                            Comanda {order.comanda}
                            {order.guest ? ` · ${order.guest}` : ""}
                          </span>
                        </>
                      ) : (
                        <>
                          <BedDouble className="w-3 h-3" />
                          <span>
                            {order.unit
                              ? `${currentProperty.unitLabel} ${order.unit}`
                              : order.guest
                                ? order.guest
                                : "Sem unidade"}
                          </span>
                        </>
                      )}
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
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                  <ShoppingCart className="w-5 h-5 text-slate-200" />
                  Pedido
                  {cartItemsCount > 0 && (
                    <Badge className="bg-orange-500 border-0">{cartItemsCount}</Badge>
                  )}
                </h2>
                {cart.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => clearCart()} className="text-slate-200 hover:bg-white/10 hover:text-white">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full mb-3 h-10 gap-2 border-amber-400/40 bg-amber-500/15 text-amber-50 hover:bg-amber-500/25"
                onClick={() => openPayComandaModal()}
              >
                <Receipt className="w-4 h-4" />
                Pagar Comanda
                {openComandasCount > 0 && (
                  <Badge className="ml-auto bg-amber-400 text-slate-950 border-0">
                    {openComandasCount}
                  </Badge>
                )}
              </Button>

              {/* Destino do pedido: Unidade (hóspede) ou Day-use / Comanda */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setOrderTargetMode("unit");
                    setComandaNumber("");
                    setClientConfirmedUnitCharge(false);
                  }}
                  className={cn(
                    "h-9 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1.5",
                    orderTargetMode === "unit"
                      ? "bg-blue-500/20 border-blue-400/40 text-blue-100"
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                  )}
                >
                  <BedDouble className="w-3.5 h-3.5" />
                  Unidade
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrderTargetMode("comanda");
                    setUnit("");
                    setClientConfirmedUnitCharge(false);
                    setUnitOccupants([]);
                    setUnitOccupantsHint(null);
                    setResolvedUnitDisplay(null);
                  }}
                  className={cn(
                    "h-9 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1.5",
                    orderTargetMode === "comanda"
                      ? "bg-amber-500/20 border-amber-400/40 text-amber-100"
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                  )}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  Day-use / Comanda
                </button>
              </div>

              {orderTargetMode === "unit" ? (
                <>
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
                </>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 flex items-center gap-1">
                        <Receipt className="w-3 h-3" />
                        Comanda
                      </label>
                      <Input
                        placeholder="Nº comanda"
                        value={comandaNumber}
                        onChange={(e) => setComandaNumber(e.target.value)}
                        className="h-10 bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Nome
                      </label>
                      <Input
                        placeholder="Nome do cliente"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="h-10 bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Lance itens na comanda sem pagar agora. No final, carregue a comanda e escolha o pagamento.
                  </p>
                  {activeOpenComanda && (
                    <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-amber-100">
                          Comanda {activeOpenComanda.number} em aberto
                        </p>
                        <Badge className="bg-amber-500/20 text-amber-100 border-0">
                          {openComandaItemsCount(activeOpenComanda)} itens
                        </Badge>
                      </div>
                      <p className="text-sm text-amber-50">
                        Total: R${" "}
                        {openComandaTotal(activeOpenComanda).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-amber-400/40 bg-transparent text-amber-50 hover:bg-amber-500/20"
                          onClick={() => openPrintModal("comanda")}
                        >
                          <Printer className="w-3.5 h-3.5 mr-1" />
                          Imprimir
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950"
                          onClick={() => openPayComandaModal(activeOpenComanda.number)}
                        >
                          Pagar agora
                        </Button>
                      </div>
                    </div>
                  )}
                  {openComandasCount > 0 && !activeOpenComanda && (
                    <p className="text-[11px] text-slate-500">
                      {openComandasCount} comanda(s) aberta(s) nesta propriedade. Digite o nº para carregar.
                    </p>
                  )}
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
              {orderTargetMode === "comanda" && (
                <Button
                  variant="outline"
                  className="w-full h-12 gap-2 border-amber-400/40 bg-amber-500/10 text-amber-50 hover:bg-amber-500/20"
                  disabled={cart.length === 0 || !comandaNumber.trim() || isSubmitting}
                  onClick={handleAddCartToComanda}
                >
                  <Receipt className="w-4 h-4" />
                  Adicionar à Comanda (pagar depois)
                </Button>
              )}
              <Button
                className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
                disabled={cart.length === 0}
                onClick={() => setShowPayment(true)}
              >
                <CreditCard className="w-5 h-5" />
                Finalizar Pedido
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10"
                disabled={cart.length === 0}
                onClick={() => openPrintModal("cart")}
              >
                <Printer className="w-4 h-4" />
                Imprimir Comanda
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
                  {orderTargetMode === "comanda" ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400">Comanda</span>
                        <span className="font-semibold text-white">{comandaNumber || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400">Nome</span>
                        <span className="font-semibold text-white">{guestName || "-"}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400">{currentProperty.unitLabel}</span>
                      <span className="font-semibold text-white">{unit || "-"}</span>
                    </div>
                  )}
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
                  disabled={orderTargetMode === "comanda"}
                  className="w-full h-16 justify-start gap-4 text-left border-white/20 bg-white/5 text-white hover:bg-white/10 disabled:opacity-40"
                  onClick={() => handleFinishOrder("Conta do Quarto")}
                  title={
                    orderTargetMode === "comanda"
                      ? "Disponível apenas no modo Unidade"
                      : undefined
                  }
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <BedDouble className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Lançar na Conta</p>
                    <p className="text-sm text-slate-400">
                      {orderTargetMode === "comanda"
                        ? "Indisponível no day-use/comanda"
                        : "Débito no checkout"}
                    </p>
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
            <div className="p-4 border-t border-white/10 shrink-0 space-y-2">
              {orderTargetMode === "comanda" && (
                <Button
                  variant="outline"
                  className="w-full gap-2 border-amber-400/40 bg-amber-500/10 text-amber-50 hover:bg-amber-500/20"
                  disabled={cart.length === 0 || !comandaNumber.trim() || isSubmitting}
                  onClick={handleAddCartToComanda}
                >
                  <Receipt className="w-4 h-4" />
                  Adicionar à Comanda (pagar depois)
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10"
                disabled={cart.length === 0}
                onClick={() => openPrintModal("cart")}
              >
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

      {/* Detalhes do pedido recente */}
      <Dialog
        open={orderDetailOpen}
        onOpenChange={(open) => {
          setOrderDetailOpen(open);
          if (!open) setSelectedOrder(null);
        }}
      >
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-white/10 bg-slate-950 text-white sm:rounded-2xl">
          {selectedOrder && (
            <div className="flex flex-col max-h-[85vh]">
              <div className="relative px-6 pt-6 pb-5 border-b border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/40">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(249,115,22,0.18),_transparent_55%)] pointer-events-none" />
                <DialogHeader className="relative space-y-3">
                  <div className="flex items-start justify-between gap-3 pr-6">
                    <div>
                      <DialogTitle className="text-xl text-white flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-orange-400" />
                        Pedido {selectedOrder.transactionNumber}
                      </DialogTitle>
                      <DialogDescription className="text-slate-400 mt-1">
                        Detalhes completos do lançamento no PDV
                      </DialogDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0",
                        (statusConfig[selectedOrder.status] ?? statusConfig.pending).color
                      )}
                    >
                      {(statusConfig[selectedOrder.status] ?? statusConfig.pending).label}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.propertyName && (
                      <Badge variant="outline" className="border-white/15 bg-white/5 text-slate-200">
                        <Building2 className="h-3 w-3 mr-1" />
                        {selectedOrder.propertyName}
                      </Badge>
                    )}
                    {(selectedOrder.paymentLabel || selectedOrder.paymentMethodName) && (
                      <Badge variant="outline" className="border-white/15 bg-white/5 text-slate-200">
                        <CreditCard className="h-3 w-3 mr-1" />
                        {selectedOrder.paymentLabel || selectedOrder.paymentMethodName}
                      </Badge>
                    )}
                  </div>
                </DialogHeader>
              </div>

              <ScrollArea className="flex-1 px-6 py-5">
                <div className="space-y-5 pr-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400 flex items-center gap-1 mb-1">
                        <CalendarClock className="h-3 w-3" /> Data / hora
                      </p>
                      <p className="text-sm font-medium text-white">
                        {new Date(selectedOrder.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400 flex items-center gap-1 mb-1">
                        <Hash className="h-3 w-3" /> Total
                      </p>
                      <p className="text-lg font-bold text-emerald-300">
                        R$ {selectedOrder.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
                        {selectedOrder.comanda ? "Comanda" : currentProperty.unitLabel}
                      </p>
                      <p className="text-sm font-medium text-white flex items-center gap-1.5">
                        {selectedOrder.comanda ? (
                          <>
                            <Receipt className="h-3.5 w-3.5 text-amber-400" />
                            {selectedOrder.comanda}
                          </>
                        ) : selectedOrder.unit ? (
                          <>
                            <BedDouble className="h-3.5 w-3.5 text-blue-400" />
                            {selectedOrder.unit}
                          </>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:col-span-2">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
                        {selectedOrder.comanda ? "Nome" : "Hóspede"}
                      </p>
                      <p className="text-sm font-medium text-white flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {selectedOrder.guest || <span className="text-slate-500">Não informado</span>}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                      <Package className="h-4 w-4 text-orange-400" />
                      <h4 className="text-sm font-semibold text-white">Itens do pedido</h4>
                      <Badge className="ml-auto bg-orange-500/20 text-orange-200 border-0">
                        {selectedOrder.lineItems.length || selectedOrder.items}
                      </Badge>
                    </div>
                    {selectedOrder.lineItems.length > 0 ? (
                      <ul className="divide-y divide-white/5">
                        {selectedOrder.lineItems.map((item, idx) => (
                          <li key={`${item.name}-${idx}`} className="flex items-center justify-between px-4 py-3 text-sm">
                            <span className="text-slate-200">{item.name}</span>
                            <span className="font-mono text-slate-400">x{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="px-4 py-6 text-sm text-slate-400 text-center">
                        Itens não identificados neste lançamento.
                      </p>
                    )}
                  </div>

                  {(selectedOrder.notes || selectedOrder.description) && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">Observações / descrição</p>
                      {selectedOrder.notes && (
                        <p className="text-xs text-slate-300 break-words">{selectedOrder.notes}</p>
                      )}
                      <p className="text-[11px] text-slate-500 break-words font-mono leading-relaxed">
                        {selectedOrder.description}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="px-6 py-4 border-t border-white/10 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => {
                    setOrderDetailOpen(false);
                    setSelectedOrder(null);
                  }}
                >
                  Fechar
                </Button>
                <Button
                  variant="destructive"
                  disabled={
                    isCancellingOrder ||
                    selectedOrder.status === "cancelled" ||
                    selectedOrder.status === "refunded"
                  }
                  className="gap-2"
                  onClick={() => setCancelConfirmOpen(true)}
                >
                  <Ban className="h-4 w-4" />
                  {selectedOrder.status === "cancelled" || selectedOrder.status === "refunded"
                    ? "Já cancelado"
                    : "Cancelar pedido"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar este pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              O lançamento {selectedOrder?.transactionNumber} será marcado como cancelado no financeiro
              e o sistema tentará estornar o estoque dos itens. Esta ação não pode ser desfeita pelo PDV.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancellingOrder}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isCancellingOrder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                void handleCancelSelectedOrder();
              }}
            >
              {isCancellingOrder ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Confirmar cancelamento"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal: buscar comanda e pagar total */}
      <Dialog
        open={payComandaModalOpen}
        onOpenChange={(open) => {
          setPayComandaModalOpen(open);
          if (!open) {
            setPayComandaSelected(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-white/10 bg-slate-950 text-white sm:rounded-2xl max-h-[90vh] flex flex-col">
          <div className="px-6 pt-6 pb-4 border-b border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 shrink-0">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Receipt className="h-5 w-5 text-amber-400" />
                Pagar comanda
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Informe o número, confira todos os itens e finalize o pagamento.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex gap-2">
              <Input
                value={payComandaLookup}
                onChange={(e) => setPayComandaLookup(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleLookupPayComanda();
                  }
                }}
                placeholder="Nº da comanda"
                className="h-11 bg-white/10 border-white/20 text-white placeholder:text-slate-500"
              />
              <Button
                type="button"
                className="h-11 px-5 bg-amber-500 hover:bg-amber-600 text-slate-950"
                onClick={handleLookupPayComanda}
              >
                Buscar
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-4 space-y-4">
              {allOpenComandas.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Comandas abertas</p>
                  <div className="flex flex-wrap gap-2">
                    {allOpenComandas.map((c) => (
                      <button
                        key={c.number}
                        type="button"
                        onClick={() => {
                          setPayComandaLookup(c.number);
                          setPayComandaSelected(c);
                          setComandaNumber(c.number);
                          setGuestName(c.guestName || "");
                          setOrderTargetMode("comanda");
                        }}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                          payComandaSelected?.number === c.number
                            ? "border-amber-400/50 bg-amber-500/20 text-amber-50"
                            : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                        )}
                      >
                        <span className="font-semibold">#{c.number}</span>
                        <span className="block text-[11px] text-slate-400">
                          {c.guestName || "Sem nome"} · {openComandaItemsCount(c)} itens · R${" "}
                          {openComandaTotal(c).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {payComandaSelected ? (
                <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10 flex flex-wrap items-center gap-2 justify-between">
                    <div>
                      <p className="font-semibold text-white">Comanda {payComandaSelected.number}</p>
                      <p className="text-xs text-slate-400">
                        {payComandaSelected.guestName || "Cliente não informado"} · atualizada{" "}
                        {new Date(payComandaSelected.updatedAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-100 border-0">
                      {openComandaItemsCount(payComandaSelected)} itens
                    </Badge>
                  </div>
                  <ul className="divide-y divide-white/5 max-h-56 overflow-y-auto">
                    {payComandaSelected.items.map((item) => (
                      <li
                        key={`${item.productId}-${item.name}`}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="text-slate-100 truncate">{item.name}</p>
                          <p className="text-xs text-slate-500">
                            R$ {item.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} un.
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono text-slate-300">x{item.quantity}</p>
                          <p className="font-semibold text-emerald-300">
                            R${" "}
                            {(item.price * item.quantity).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between bg-black/20">
                    <span className="font-medium text-slate-200">Total da comanda</span>
                    <span className="text-xl font-bold text-emerald-300">
                      R${" "}
                      {openComandaTotal(payComandaSelected).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-slate-400 text-sm">
                  Digite o número da comanda e clique em Buscar, ou selecione uma comanda aberta acima.
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="px-6 py-4 border-t border-white/10 bg-slate-900/90 space-y-3 shrink-0">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                disabled={!payComandaSelected}
                onClick={() => {
                  if (!payComandaSelected) return;
                  setPrintSource("comanda");
                  setOpenComandaPreview(payComandaSelected);
                  setPrintModalOpen(true);
                }}
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button
                variant="outline"
                className="border-amber-400/40 bg-amber-500/10 text-amber-50 hover:bg-amber-500/20"
                disabled={!payComandaSelected || isSubmitting}
                onClick={() => handleLoadOpenComandaToPay(payComandaSelected)}
              >
                Ir para pagamento
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={!payComandaSelected || isSubmitting}
                onClick={() => void handlePayComandaFromModal("PIX")}
              >
                <QrCode className="w-4 h-4 mr-2" />
                PIX
              </Button>
              <Button
                className="bg-slate-600 hover:bg-slate-500"
                disabled={!payComandaSelected || isSubmitting}
                onClick={() => void handlePayComandaFromModal("Dinheiro")}
              >
                <Banknote className="w-4 h-4 mr-2" />
                Dinheiro
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                disabled={!payComandaSelected || isSubmitting}
                onClick={() => void handlePayComandaFromModal("Cartão de Crédito")}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Crédito
              </Button>
              <Button
                className="bg-orange-600 hover:bg-orange-700"
                disabled={!payComandaSelected || isSubmitting}
                onClick={() => void handlePayComandaFromModal("Cartão de Débito")}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Débito
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview / impressão de comanda */}
      <Dialog open={printModalOpen} onOpenChange={setPrintModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-white/10 bg-slate-950 text-white sm:rounded-2xl">
          <div className="px-5 pt-5 pb-4 border-b border-white/10 bg-gradient-to-br from-slate-900 to-orange-950/30">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Printer className="h-5 w-5 text-orange-400" />
                Comanda para impressão
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Confira os itens e envie para a impressora.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-5 py-4 space-y-4">
            <div className="rounded-xl border border-dashed border-white/20 bg-white text-slate-900 p-4 font-mono text-sm shadow-inner">
              <p className="text-center font-bold text-base mb-1">COMANDA PDV</p>
              <p className="text-center text-xs text-slate-500 mb-3">
                {selectedProperty?.name || "UniStays"} · {new Date().toLocaleString("pt-BR")}
              </p>
              <div className="space-y-1 text-xs mb-3">
                {(printSource === "comanda"
                  ? openComandaPreview?.number
                  : orderTargetMode === "comanda"
                    ? comandaNumber
                    : null) && (
                  <p>
                    <strong>Comanda:</strong>{" "}
                    {printSource === "comanda" ? openComandaPreview?.number : comandaNumber}
                  </p>
                )}
                {orderTargetMode === "unit" && unit.trim() && (
                  <p>
                    <strong>{currentProperty.unitLabel}:</strong> {unit}
                  </p>
                )}
                <p>
                  <strong>Cliente:</strong>{" "}
                  {(printSource === "comanda"
                    ? openComandaPreview?.guestName || guestName
                    : guestName) || "—"}
                </p>
              </div>
              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1.5">
                {(printSource === "comanda" && openComandaPreview
                  ? openComandaPreview.items.map((i) => ({
                      key: `${i.productId}-${i.name}`,
                      name: i.name,
                      quantity: i.quantity,
                      price: i.price,
                    }))
                  : cart.map((i) => ({
                      key: String(i.product.id),
                      name: i.product.name,
                      quantity: i.quantity,
                      price: i.product.price,
                    }))
                ).map((item) => (
                  <div key={item.key} className="flex justify-between gap-2">
                    <span className="truncate">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="shrink-0">
                      R${" "}
                      {(item.price * item.quantity).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-base border-t border-slate-900 mt-3 pt-2">
                <span>TOTAL</span>
                <span>
                  R${" "}
                  {(printSource === "comanda" && openComandaPreview
                    ? openComandaTotal(openComandaPreview)
                    : cartTotal
                  ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-white/10 flex gap-2 justify-end bg-slate-900/80">
            <Button
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              onClick={() => setPrintModalOpen(false)}
            >
              Fechar
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
              onClick={handlePrintComanda}
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
