import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  loadSelfmartConfig,
  getSelfmartStores,
  getSelfmartStoreProducts,
  getSelfmartLowStockProducts,
  getSelfmartStoreSales,
  createSelfmartStore,
  updateSelfmartStore,
  createSelfmartProduct,
  addSelfmartStoreProduct,
  updateSelfmartStoreProduct,
  deleteSelfmartStoreProduct,
  selfmartStockEntry,
  selfmartStockLoss,
  getSelfmartStoreLogs,
  getSelfmartStoreProductLogs,
  selfmartCheckoutPayment,
  type SelfmartStore,
  type SelfmartStoreProduct,
  type SelfmartSale,
  type SelfmartStockLog,
} from "@/lib/selfmart";
import { AlertCircle, BarChart3, Boxes, PackageSearch, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function Selfmart() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<SelfmartStore[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [products, setProducts] = useState<SelfmartStoreProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<SelfmartStoreProduct[]>([]);
  const [sales, setSales] = useState<SelfmartSale[]>([]);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [storeLogs, setStoreLogs] = useState<SelfmartStockLog[]>([]);
  const [productLogs, setProductLogs] = useState<SelfmartStockLog[]>([]);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [newStoreName, setNewStoreName] = useState("");
  const [editStoreName, setEditStoreName] = useState("");
  const [newProductCode, setNewProductCode] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [addProductId, setAddProductId] = useState("");
  const [addProductPrice, setAddProductPrice] = useState("");
  const [addProductQty, setAddProductQty] = useState("");
  const [addProductCost, setAddProductCost] = useState("");
  const [selectedStoreProductId, setSelectedStoreProductId] = useState("");
  const [opPrice, setOpPrice] = useState("");
  const [opQty, setOpQty] = useState("");
  const [opCost, setOpCost] = useState("");
  const [opReason, setOpReason] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [lossQty, setLossQty] = useState("");
  const [lossReason, setLossReason] = useState("");
  const [checkoutPaymentType, setCheckoutPaymentType] = useState("pix");
  const [checkoutItems, setCheckoutItems] = useState("[]");
  const [checkoutResponse, setCheckoutResponse] = useState("");

  const config = loadSelfmartConfig();

  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        (p.productBarcode || "").toLowerCase().includes(q)
    );
  }, [products, query]);

  const totals = useMemo(() => {
    return filteredProducts.reduce(
      (acc, item) => {
        const qty = item.quantity || 0;
        const price = item.price || 0;
        acc.stockItems += qty;
        acc.stockValue += qty * price;
        acc.productCount += 1;
        return acc;
      },
      { stockItems: 0, stockValue: 0, productCount: 0 }
    );
  }, [filteredProducts]);

  const selectedStore = useMemo(
    () => stores.find((s) => s.id === selectedStoreId) || null,
    [stores, selectedStoreId]
  );
  const selectedStoreProduct = useMemo(
    () => products.find((p) => String(p.id) === selectedStoreProductId) || null,
    [products, selectedStoreProductId]
  );

  const salesTotal = useMemo(
    () => sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0),
    [sales]
  );

  const handleLoadStores = async () => {
    const result = await getSelfmartStores(config, 1, 50);
    setStores(result);
    if (!selectedStoreId && result.length > 0) {
      setSelectedStoreId(result[0].id);
    }
    return result;
  };

  const handleLoadStoreData = async (storeId: string) => {
    const [storeProductsRes, lowStockRes, storeSalesRes, allStoreLogsRes] = await Promise.allSettled([
      getSelfmartStoreProducts(config, storeId, 1, 100),
      getSelfmartLowStockProducts(config, storeId, lowStockThreshold, 1, 100),
      getSelfmartStoreSales(config, storeId, 1, 100),
      getSelfmartStoreLogs(config, storeId, 1, 100),
    ]);

    if (storeProductsRes.status !== "fulfilled") {
      throw storeProductsRes.reason;
    }
    if (lowStockRes.status !== "fulfilled") {
      throw lowStockRes.reason;
    }
    if (allStoreLogsRes.status !== "fulfilled") {
      throw allStoreLogsRes.reason;
    }

    const storeProducts = storeProductsRes.value;
    const lowStock = lowStockRes.value;
    const allStoreLogs = allStoreLogsRes.value;
    const storeSales = storeSalesRes.status === "fulfilled" ? storeSalesRes.value : [];

    if (storeSalesRes.status === "rejected") {
      const msg = storeSalesRes.reason instanceof Error ? storeSalesRes.reason.message : "Falha ao consultar vendas";
      setSalesError(msg);
    } else {
      setSalesError(null);
    }

    setProducts(storeProducts);
    setLowStockProducts(lowStock);
    setSales(storeSales);
    setStoreLogs(allStoreLogs);
    setProductLogs([]);
    if (storeProducts.length > 0) {
      const firstId = String(storeProducts[0].id);
      setSelectedStoreProductId((prev) => prev || firstId);
    } else {
      setSelectedStoreProductId("");
    }
    return { storeProducts, lowStock, storeSales };
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const currentStores = stores.length > 0 ? stores : await handleLoadStores();
      const storeId = selectedStoreId || currentStores[0]?.id;
      if (!storeId) {
        throw new Error("Nenhuma loja encontrada na Selfmart.");
      }
      if (!selectedStoreId) {
        setSelectedStoreId(storeId);
      }
      setEditStoreName(currentStores.find((s) => s.id === storeId)?.name || "");
      const result = await handleLoadStoreData(storeId);
      toast({
        title: "Dados carregados",
        description: `${result.storeProducts.length} produtos, ${result.lowStock.length} com estoque baixo e ${result.storeSales.length} vendas.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao carregar Selfmart",
        description: error instanceof Error ? error.message : "Falha na integracao",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrentStore = async () => {
    if (!selectedStoreId) return;
    await handleLoadStoreData(selectedStoreId);
  };

  const parseCheckoutItems = (): Array<{ product_id: number; quantity: number; price?: number }> => {
    const parsed = JSON.parse(checkoutItems);
    if (!Array.isArray(parsed)) throw new Error("Itens do checkout devem ser um array JSON.");
    return parsed.map((item) => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
      ...(item.price != null ? { price: Number(item.price) } : {}),
    }));
  };

  if (!config.enabled) {
    return (
      <DashboardLayout>
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Integracao Selfmart desabilitada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Esta funcionalidade e separada da Unistays. Habilite em Integracoes para acessar o relatorio.
            </p>
            <Button asChild>
              <Link to="/integrations">Ir para Integracoes</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Selfmart</h1>
            <p className="text-muted-foreground">
              Painel de lojas, produtos, estoque baixo e vendas da Selfmart.
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={loading}>
            {loading ? "Carregando..." : "Atualizar dados"}
          </Button>
        </div>

        <Card>
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-[1fr,180px] gap-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Loja Selfmart</p>
              <Select
                value={selectedStoreId}
                onValueChange={async (value) => {
                  setSelectedStoreId(value);
                  if (!value) return;
                  try {
                    setLoading(true);
                    await handleLoadStoreData(value);
                  } catch (error) {
                    toast({
                      title: "Erro ao trocar loja",
                      description: error instanceof Error ? error.message : "Falha ao carregar loja",
                      variant: "destructive",
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a loja" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStore ? (
                <p className="text-xs text-muted-foreground">
                  Loja selecionada: <strong>{selectedStore.name}</strong>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Clique em "Atualizar dados" para carregar as lojas.</p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Limite estoque baixo</p>
              <Input
                type="number"
                min={1}
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Math.max(1, Number(e.target.value || 1)))}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Produtos</p>
                <p className="text-2xl font-bold">{totals.productCount}</p>
              </div>
              <PackageSearch className="h-5 w-5 text-blue-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estoque (itens)</p>
                <p className="text-2xl font-bold">{totals.stockItems}</p>
              </div>
              <Boxes className="h-5 w-5 text-emerald-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor em estoque</p>
                <p className="text-2xl font-bold">{currency.format(totals.stockValue)}</p>
              </div>
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="stock" className="space-y-4">
          <TabsList>
            <TabsTrigger value="stock">Produtos e Estoque</TabsTrigger>
            <TabsTrigger value="low-stock">Estoque Baixo</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="operations">Operações</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="checkout">Checkout</TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="space-y-4">
            <Input
              placeholder="Buscar por nome ou codigo de barras..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="text-left p-3">Produto</th>
                      <th className="text-left p-3">Codigo</th>
                      <th className="text-right p-3">Preco</th>
                      <th className="text-right p-3">Estoque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product, idx) => (
                      <tr key={`${product.id || product.productBarcode || product.productName}-${idx}`} className="border-b">
                        <td className="p-3">{product.productName}</td>
                        <td className="p-3">{product.productBarcode || "-"}</td>
                        <td className="p-3 text-right">{currency.format(product.price || 0)}</td>
                        <td className="p-3 text-right">
                          <Badge variant="outline">{product.quantity ?? "-"}</Badge>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td className="p-4 text-muted-foreground" colSpan={4}>
                          Nenhum produto encontrado. Clique em "Atualizar dados".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="low-stock" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Produtos com estoque baixo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="text-left p-3">Produto</th>
                      <th className="text-left p-3">Código</th>
                      <th className="text-right p-3">Preço</th>
                      <th className="text-right p-3">Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((product, idx) => (
                      <tr key={`${product.id}-${idx}`} className="border-b">
                        <td className="p-3">{product.productName}</td>
                        <td className="p-3">{product.productBarcode || "-"}</td>
                        <td className="p-3 text-right">{currency.format(product.price || 0)}</td>
                        <td className="p-3 text-right">
                          <Badge variant="destructive">{product.quantity}</Badge>
                        </td>
                      </tr>
                    ))}
                    {lowStockProducts.length === 0 && (
                      <tr>
                        <td className="p-4 text-muted-foreground" colSpan={4}>
                          Nenhum produto com estoque baixo para esta loja/limite.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-amber-500" />
                  Relatorio de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-3 bg-muted/30">
                  <p className="text-sm text-muted-foreground">Total de vendas carregadas</p>
                  <p className="text-2xl font-bold">{sales.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Volume financeiro</p>
                  <p className="text-xl font-semibold">{currency.format(salesTotal)}</p>
                </div>
                {salesError && (
                  <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700">
                    Erro ao consultar sales na Selfmart: {salesError}
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/40">
                      <tr>
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Pagamento</th>
                        <th className="text-right p-3">Valor</th>
                        <th className="text-left p-3">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale) => (
                        <tr key={sale.id} className="border-b">
                          <td className="p-3 font-mono text-xs">{sale.id}</td>
                          <td className="p-3">{sale.paymentType}</td>
                          <td className="p-3 text-right">{currency.format(sale.totalPrice || 0)}</td>
                          <td className="p-3">
                            {sale.createdAt ? new Date(sale.createdAt).toLocaleString("pt-BR") : "-"}
                          </td>
                        </tr>
                      ))}
                      {sales.length === 0 && (
                        <tr>
                          <td className="p-4 text-muted-foreground" colSpan={4}>
                            Nenhuma venda retornada para esta loja.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle>Lojas</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="Nova loja" value={newStoreName} onChange={(e) => setNewStoreName(e.target.value)} />
                  <Button
                    onClick={async () => {
                      try {
                        if (!newStoreName.trim()) throw new Error("Informe o nome da loja.");
                        setLoading(true);
                        await createSelfmartStore(config, { name: newStoreName.trim() });
                        setNewStoreName("");
                        const s = await handleLoadStores();
                        toast({ title: "Loja criada", description: `${s.length} lojas disponíveis.` });
                      } catch (error) {
                        toast({ title: "Erro", description: error instanceof Error ? error.message : "Falha ao criar loja", variant: "destructive" });
                      } finally { setLoading(false); }
                    }}
                    disabled={loading}
                  >
                    Criar loja
                  </Button>
                  <Input placeholder="Renomear loja selecionada" value={editStoreName} onChange={(e) => setEditStoreName(e.target.value)} />
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        if (!selectedStoreId) throw new Error("Selecione uma loja.");
                        if (!editStoreName.trim()) throw new Error("Informe o novo nome.");
                        setLoading(true);
                        await updateSelfmartStore(config, selectedStoreId, { name: editStoreName.trim() });
                        await handleLoadStores();
                        await refreshCurrentStore();
                        toast({ title: "Loja atualizada" });
                      } catch (error) {
                        toast({ title: "Erro", description: error instanceof Error ? error.message : "Falha ao atualizar loja", variant: "destructive" });
                      } finally { setLoading(false); }
                    }}
                    disabled={loading}
                  >
                    Atualizar loja selecionada
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Produto (catálogo)</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="Código (barcode/code)" value={newProductCode} onChange={(e) => setNewProductCode(e.target.value)} />
                  <Input placeholder="Nome do produto" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
                  <Input placeholder="Preço" type="number" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} />
                  <Button
                    onClick={async () => {
                      try {
                        if (!newProductCode.trim() || !newProductName.trim() || !newProductPrice) {
                          throw new Error("Preencha código, nome e preço.");
                        }
                        setLoading(true);
                        const created = await createSelfmartProduct(config, {
                          code: newProductCode.trim(),
                          name: newProductName.trim(),
                          price: Number(newProductPrice),
                        });
                        setAddProductId(String(created.id || ""));
                        setNewProductCode("");
                        setNewProductName("");
                        setNewProductPrice("");
                        toast({ title: "Produto criado", description: "Produto disponível para adicionar na loja." });
                      } catch (error) {
                        toast({ title: "Erro", description: error instanceof Error ? error.message : "Falha ao criar produto", variant: "destructive" });
                      } finally { setLoading(false); }
                    }}
                    disabled={loading}
                  >
                    Criar produto
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Adicionar produto na loja</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="ID do produto (catálogo)" value={addProductId} onChange={(e) => setAddProductId(e.target.value)} />
                  <Input placeholder="Preço na loja" type="number" value={addProductPrice} onChange={(e) => setAddProductPrice(e.target.value)} />
                  <Input placeholder="Quantidade inicial (opcional)" type="number" value={addProductQty} onChange={(e) => setAddProductQty(e.target.value)} />
                  <Input placeholder="Custo (opcional)" type="number" value={addProductCost} onChange={(e) => setAddProductCost(e.target.value)} />
                  <Button
                    onClick={async () => {
                      try {
                        if (!selectedStoreId) throw new Error("Selecione uma loja.");
                        if (!addProductId || !addProductPrice) throw new Error("Informe product_id e preço.");
                        setLoading(true);
                        await addSelfmartStoreProduct(config, selectedStoreId, {
                          product_id: Number(addProductId),
                          price: Number(addProductPrice),
                          ...(addProductQty ? { quantity: Number(addProductQty) } : {}),
                          ...(addProductCost ? { cost: Number(addProductCost) } : {}),
                        });
                        setAddProductId("");
                        setAddProductPrice("");
                        setAddProductQty("");
                        setAddProductCost("");
                        await refreshCurrentStore();
                        toast({ title: "Produto adicionado à loja" });
                      } catch (error) {
                        toast({ title: "Erro", description: error instanceof Error ? error.message : "Falha ao adicionar produto", variant: "destructive" });
                      } finally { setLoading(false); }
                    }}
                    disabled={loading}
                  >
                    Adicionar na loja
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Atualizar / Estoque / Remover</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Select value={selectedStoreProductId} onValueChange={setSelectedStoreProductId}>
                    <SelectTrigger><SelectValue placeholder="Selecione produto da loja" /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          #{p.id} - {p.productName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Preço (update)" type="number" value={opPrice} onChange={(e) => setOpPrice(e.target.value)} />
                  <Input placeholder="Quantidade (update opcional)" type="number" value={opQty} onChange={(e) => setOpQty(e.target.value)} />
                  <Input placeholder="Custo (update opcional)" type="number" value={opCost} onChange={(e) => setOpCost(e.target.value)} />
                  <Input placeholder="Motivo (opcional)" value={opReason} onChange={(e) => setOpReason(e.target.value)} />
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          if (!selectedStoreId || !selectedStoreProductId) throw new Error("Selecione loja/produto.");
                          if (!opPrice) throw new Error("Preço é obrigatório para atualizar produto da loja.");
                          setLoading(true);
                          await updateSelfmartStoreProduct(config, selectedStoreId, Number(selectedStoreProductId), {
                            price: Number(opPrice),
                            ...(opQty ? { quantity: Number(opQty) } : {}),
                            ...(opCost ? { cost: Number(opCost) } : {}),
                            ...(opReason.trim() ? { reason: opReason.trim() } : {}),
                          });
                          await refreshCurrentStore();
                          toast({ title: "Produto da loja atualizado" });
                        } catch (error) {
                          toast({ title: "Erro", description: error instanceof Error ? error.message : "Falha ao atualizar", variant: "destructive" });
                        } finally { setLoading(false); }
                      }}
                      disabled={loading}
                    >
                      Atualizar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          if (!selectedStoreId || !selectedStoreProductId) throw new Error("Selecione loja/produto.");
                          if (!stockQty) throw new Error("Informe quantidade para entrada.");
                          setLoading(true);
                          await selfmartStockEntry(config, selectedStoreId, Number(selectedStoreProductId), {
                            quantity: Number(stockQty),
                            ...(opReason.trim() ? { reason: opReason.trim() } : {}),
                          });
                          setStockQty("");
                          await refreshCurrentStore();
                          toast({ title: "Entrada de estoque registrada" });
                        } catch (error) {
                          toast({ title: "Erro", description: error instanceof Error ? error.message : "Falha na entrada", variant: "destructive" });
                        } finally { setLoading(false); }
                      }}
                      disabled={loading}
                    >
                      Entrada
                    </Button>
                    <Input className="max-w-[150px]" placeholder="Qtd entrada" type="number" value={stockQty} onChange={(e) => setStockQty(e.target.value)} />
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          if (!selectedStoreId || !selectedStoreProductId) throw new Error("Selecione loja/produto.");
                          if (!lossQty || !lossReason.trim()) throw new Error("Informe quantidade e motivo da perda.");
                          setLoading(true);
                          await selfmartStockLoss(config, selectedStoreId, Number(selectedStoreProductId), {
                            quantity: Number(lossQty),
                            reason: lossReason.trim(),
                          });
                          setLossQty("");
                          setLossReason("");
                          await refreshCurrentStore();
                          toast({ title: "Perda registrada" });
                        } catch (error) {
                          toast({ title: "Erro", description: error instanceof Error ? error.message : "Falha na perda", variant: "destructive" });
                        } finally { setLoading(false); }
                      }}
                      disabled={loading}
                    >
                      Perda
                    </Button>
                    <Input className="max-w-[130px]" placeholder="Qtd perda" type="number" value={lossQty} onChange={(e) => setLossQty(e.target.value)} />
                    <Input className="min-w-[200px]" placeholder="Motivo perda" value={lossReason} onChange={(e) => setLossReason(e.target.value)} />
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        try {
                          if (!selectedStoreId || !selectedStoreProductId) throw new Error("Selecione loja/produto.");
                          setLoading(true);
                          await deleteSelfmartStoreProduct(config, selectedStoreId, Number(selectedStoreProductId));
                          await refreshCurrentStore();
                          toast({ title: "Produto removido da loja" });
                        } catch (error) {
                          toast({ title: "Erro", description: error instanceof Error ? error.message : "Falha ao remover", variant: "destructive" });
                        } finally { setLoading(false); }
                      }}
                      disabled={loading}
                    >
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Logs da loja</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      if (!selectedStoreId) throw new Error("Selecione uma loja.");
                      setLoading(true);
                      const logs = await getSelfmartStoreLogs(config, selectedStoreId, 1, 100);
                      setStoreLogs(logs);
                      toast({ title: "Logs da loja atualizados", description: `${logs.length} registros.` });
                    } catch (error) {
                      toast({ title: "Erro", description: error instanceof Error ? error.message : "Falha ao carregar logs", variant: "destructive" });
                    } finally { setLoading(false); }
                  }}
                  disabled={loading}
                >
                  Atualizar logs da loja
                </Button>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/40">
                      <tr>
                        <th className="text-left p-2">Data</th>
                        <th className="text-left p-2">Tipo</th>
                        <th className="text-left p-2">Campo</th>
                        <th className="text-left p-2">Mudança</th>
                        <th className="text-left p-2">Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storeLogs.map((log) => (
                        <tr key={`${log.id}-${log.createdAt}`} className="border-b">
                          <td className="p-2">{log.createdAt ? new Date(log.createdAt).toLocaleString("pt-BR") : "-"}</td>
                          <td className="p-2">{log.logType}</td>
                          <td className="p-2">{log.fieldChanged || "-"}</td>
                          <td className="p-2 text-xs">{`${log.oldValue || "-"} → ${log.newValue || "-"}`}</td>
                          <td className="p-2">{log.reason || "-"}</td>
                        </tr>
                      ))}
                      {storeLogs.length === 0 && (
                        <tr><td className="p-3 text-muted-foreground" colSpan={5}>Sem logs.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Logs por produto da loja</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2">
                  <Select value={selectedStoreProductId} onValueChange={setSelectedStoreProductId}>
                    <SelectTrigger className="max-w-md"><SelectValue placeholder="Selecione produto da loja" /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={`log-${p.id}`} value={String(p.id)}>
                          #{p.id} - {p.productName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        if (!selectedStoreId || !selectedStoreProductId) throw new Error("Selecione loja/produto.");
                        setLoading(true);
                        const logs = await getSelfmartStoreProductLogs(config, selectedStoreId, Number(selectedStoreProductId), 1, 100);
                        setProductLogs(logs);
                        toast({ title: "Logs do produto atualizados", description: `${logs.length} registros.` });
                      } catch (error) {
                        toast({ title: "Erro", description: error instanceof Error ? error.message : "Falha ao carregar logs", variant: "destructive" });
                      } finally { setLoading(false); }
                    }}
                    disabled={loading}
                  >
                    Carregar logs do produto
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/40">
                      <tr>
                        <th className="text-left p-2">Data</th>
                        <th className="text-left p-2">Tipo</th>
                        <th className="text-left p-2">Campo</th>
                        <th className="text-left p-2">Mudança</th>
                        <th className="text-left p-2">Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productLogs.map((log) => (
                        <tr key={`p-${log.id}-${log.createdAt}`} className="border-b">
                          <td className="p-2">{log.createdAt ? new Date(log.createdAt).toLocaleString("pt-BR") : "-"}</td>
                          <td className="p-2">{log.logType}</td>
                          <td className="p-2">{log.fieldChanged || "-"}</td>
                          <td className="p-2 text-xs">{`${log.oldValue || "-"} → ${log.newValue || "-"}`}</td>
                          <td className="p-2">{log.reason || "-"}</td>
                        </tr>
                      ))}
                      {productLogs.length === 0 && (
                        <tr><td className="p-3 text-muted-foreground" colSpan={5}>Sem logs do produto.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkout" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Checkout / Pagamento</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm mb-1">Tipo de pagamento</p>
                    <Select value={checkoutPaymentType} onValueChange={setCheckoutPaymentType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">pix</SelectItem>
                        <SelectItem value="credit_card">credit_card</SelectItem>
                        <SelectItem value="debit_card">debit_card</SelectItem>
                        <SelectItem value="cash">cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-sm mb-1">Loja</p>
                    <Input value={selectedStoreId} disabled />
                  </div>
                </div>
                <div>
                  <p className="text-sm mb-1">Itens (JSON)</p>
                  <Input
                    value={checkoutItems}
                    onChange={(e) => setCheckoutItems(e.target.value)}
                    placeholder='[{"product_id":1,"quantity":1}]'
                  />
                </div>
                <Button
                  onClick={async () => {
                    try {
                      if (!selectedStoreId) throw new Error("Selecione uma loja.");
                      const items = parseCheckoutItems();
                      if (items.length === 0) throw new Error("Informe ao menos um item.");
                      setLoading(true);
                      const response = await selfmartCheckoutPayment(config, {
                        store_id: selectedStoreId,
                        payment_type: checkoutPaymentType,
                        products: items,
                      });
                      setCheckoutResponse(JSON.stringify(response, null, 2));
                      await refreshCurrentStore();
                      toast({ title: "Checkout enviado com sucesso" });
                    } catch (error) {
                      toast({ title: "Erro no checkout", description: error instanceof Error ? error.message : "Falha ao enviar pagamento", variant: "destructive" });
                    } finally { setLoading(false); }
                  }}
                  disabled={loading}
                >
                  Enviar checkout
                </Button>
                <div>
                  <p className="text-sm mb-1">Resposta</p>
                  <pre className="text-xs p-3 rounded-md bg-muted overflow-auto max-h-80">
                    {checkoutResponse || "Sem resposta ainda."}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
