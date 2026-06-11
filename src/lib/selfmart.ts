export interface SelfmartConfig {
  enabled: boolean;
  baseUrl: string;
  apiToken: string;
}

export interface SelfmartProduct {
  id?: string | number;
  name: string;
  barcode?: string;
  price: number;
  quantity?: number;
  cost?: number;
  store_id?: string | number;
}

export interface SelfmartStore {
  id: string;
  name: string;
}

export interface SelfmartStoreProduct {
  id: number;
  productId: number;
  productName: string;
  productBarcode?: string;
  price: number;
  cost: number;
  quantity: number;
  storeId: string;
  storeName?: string;
}

export interface SelfmartSale {
  id: string;
  storeId: string;
  paymentType: string;
  totalPrice: number;
  createdAt: string;
}

export interface SelfmartStockLog {
  id: number;
  storeProductId: number;
  logType: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  changedBy?: string;
  createdAt?: string;
}

const SELFMART_STORAGE_KEY = "unistays:selfmart:config";
const DEFAULT_SELFMART_BASE_URL =
  (import.meta as any)?.env?.VITE_SELFMART_BASE_URL?.toString() ||
  "https://apiselfmart.couplerewind.com.br";

const sanitizeBaseUrl = (value?: string): string => {
  const raw = (value || DEFAULT_SELFMART_BASE_URL).trim();
  return raw.replace(/\/+$/, "");
};

export const getDefaultSelfmartConfig = (): SelfmartConfig => ({
  enabled: false,
  baseUrl: DEFAULT_SELFMART_BASE_URL,
  apiToken: "",
});

export const loadSelfmartConfig = (): SelfmartConfig => {
  if (typeof window === "undefined") {
    return getDefaultSelfmartConfig();
  }

  const raw = localStorage.getItem(SELFMART_STORAGE_KEY);
  if (!raw) {
    return getDefaultSelfmartConfig();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SelfmartConfig>;
    return {
      enabled: Boolean(parsed.enabled),
      baseUrl: sanitizeBaseUrl(parsed.baseUrl),
      apiToken: parsed.apiToken || "",
    };
  } catch {
    return getDefaultSelfmartConfig();
  }
};

export const saveSelfmartConfig = (config: SelfmartConfig): void => {
  if (typeof window === "undefined") return;
  const payload: SelfmartConfig = {
    enabled: Boolean(config.enabled),
    baseUrl: sanitizeBaseUrl(config.baseUrl),
    apiToken: config.apiToken?.trim() || "",
  };
  localStorage.setItem(SELFMART_STORAGE_KEY, JSON.stringify(payload));
};

const parseProducts = (payload: any): SelfmartProduct[] => {
  const rawProducts =
    payload?.products ||
    payload?.data?.products ||
    payload?.data ||
    payload;

  if (!Array.isArray(rawProducts)) {
    return [];
  }

  return rawProducts.map((item: any) => ({
    id: item?.id,
    name: item?.name || "Produto sem nome",
    barcode: item?.barcode || item?.code || "",
    price: Number(item?.price || 0),
    quantity: typeof item?.quantity === "number" ? item.quantity : undefined,
    cost: typeof item?.cost === "number" ? item.cost : undefined,
    store_id: item?.store_id,
  }));
};

const parseStores = (payload: any): SelfmartStore[] => {
  const stores = payload?.stores || payload?.data?.stores || payload?.data || payload;
  if (!Array.isArray(stores)) return [];
  return stores
    .map((store: any) => ({
      id: String(store?.id ?? ""),
      name: String(store?.name ?? ""),
    }))
    .filter((s: SelfmartStore) => s.id && s.name);
};

const parseStoreProducts = (payload: any): SelfmartStoreProduct[] => {
  const products = payload?.products || payload?.data?.products || payload?.data || payload;
  if (!Array.isArray(products)) return [];
  return products.map((item: any) => ({
    id: Number(item?.id ?? 0),
    productId: Number(item?.product_id ?? item?.productId ?? 0),
    productName: String(item?.product_name ?? item?.productName ?? item?.name ?? "Produto sem nome"),
    productBarcode: item?.product_barcode ? String(item.product_barcode) : undefined,
    price: Number(item?.price ?? 0),
    cost: Number(item?.cost ?? 0),
    quantity: Number(item?.quantity ?? 0),
    storeId: String(item?.store_id ?? item?.storeId ?? ""),
    storeName: item?.store_name ? String(item.store_name) : undefined,
  }));
};

const parseSales = (payload: any): SelfmartSale[] => {
  const sales = payload?.sales || payload?.data?.sales || payload?.data || payload;
  if (!Array.isArray(sales)) return [];
  return sales.map((sale: any) => ({
    id: String(sale?.id ?? ""),
    storeId: String(sale?.store_id ?? sale?.storeId ?? ""),
    paymentType: String(sale?.payment_type ?? sale?.paymentType ?? "-"),
    totalPrice: Number(sale?.total_price ?? sale?.totalPrice ?? 0),
    createdAt: String(sale?.created_at ?? sale?.createdAt ?? ""),
  }));
};

const selfmartFetch = async <T>(
  config: SelfmartConfig,
  endpoint: string,
  parser: (payload: any) => T,
  options?: RequestInit
): Promise<T> => {
  if (!config.enabled) {
    throw new Error("Integracao Selfmart desabilitada");
  }
  if (!config.apiToken) {
    throw new Error("Configure o token Bearer da Selfmart na integracao");
  }
  const url = `${sanitizeBaseUrl(config.baseUrl)}${endpoint}`;
  const response = await fetch(url, {
    method: options?.method || "GET",
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...(options?.headers || {}),
    },
    body: options?.body,
  });
  if (!response.ok) {
    let details = "";
    try {
      const errBody = await response.json();
      details = errBody?.message || errBody?.error || "";
    } catch {
      // ignore parse error
    }
    throw new Error(details || "Nao foi possivel carregar dados da Selfmart");
  }
  const data = await response.json();
  return parser(data);
};

export const getSelfmartProducts = async (
  config: SelfmartConfig,
  page = 1,
  limit = 50
): Promise<SelfmartProduct[]> => {
  return selfmartFetch(
    config,
    `/admin/products?page=${page}&limit=${limit}`,
    parseProducts
  );
};

export const getSelfmartStores = async (
  config: SelfmartConfig,
  page = 1,
  limit = 50
): Promise<SelfmartStore[]> => {
  return selfmartFetch(
    config,
    `/admin/stores?page=${page}&limit=${limit}`,
    parseStores
  );
};

export const getSelfmartStoreProducts = async (
  config: SelfmartConfig,
  storeId: string,
  page = 1,
  limit = 50
): Promise<SelfmartStoreProduct[]> => {
  return selfmartFetch(
    config,
    `/admin/store/${encodeURIComponent(storeId)}/products?page=${page}&limit=${limit}`,
    parseStoreProducts
  );
};

export const getSelfmartLowStockProducts = async (
  config: SelfmartConfig,
  storeId: string,
  threshold = 5,
  page = 1,
  limit = 50
): Promise<SelfmartStoreProduct[]> => {
  return selfmartFetch(
    config,
    `/admin/store/${encodeURIComponent(storeId)}/products/low-stock?threshold=${threshold}&page=${page}&limit=${limit}`,
    parseStoreProducts
  );
};

export const getSelfmartStoreSales = async (
  config: SelfmartConfig,
  storeId: string,
  page = 1,
  limit = 50
): Promise<SelfmartSale[]> => {
  const base = `/admin/store/${encodeURIComponent(storeId)}/sales`;
  const attempts = [
    `${base}?page=${page}&limit=${limit}`,
    `${base}?page=${page}`,
    base,
  ];

  let lastError: unknown = null;
  for (const endpoint of attempts) {
    try {
      return await selfmartFetch(
        config,
        endpoint,
        parseSales
      );
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Nao foi possivel carregar vendas da Selfmart");
};

const parseStockLogs = (payload: any): SelfmartStockLog[] => {
  const logs = payload?.logs || payload?.data?.logs || payload?.data || payload;
  if (!Array.isArray(logs)) return [];
  return logs.map((log: any) => ({
    id: Number(log?.id ?? 0),
    storeProductId: Number(log?.store_product_id ?? 0),
    logType: String(log?.log_type ?? "-"),
    fieldChanged: log?.field_changed ? String(log.field_changed) : undefined,
    oldValue: log?.old_value ? String(log.old_value) : undefined,
    newValue: log?.new_value ? String(log.new_value) : undefined,
    reason: log?.reason ? String(log.reason) : undefined,
    changedBy: log?.changed_by ? String(log.changed_by) : undefined,
    createdAt: log?.created_at ? String(log.created_at) : undefined,
  }));
};

const identity = <T>(value: T): T => value;

export const createSelfmartStore = async (
  config: SelfmartConfig,
  data: { name: string }
): Promise<SelfmartStore> => {
  const payload = await selfmartFetch(
    config,
    "/admin/store",
    identity<any>,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  return {
    id: String(payload?.id ?? payload?.data?.id ?? ""),
    name: String(payload?.name ?? payload?.data?.name ?? data.name),
  };
};

export const updateSelfmartStore = async (
  config: SelfmartConfig,
  storeId: string,
  data: { name: string }
): Promise<SelfmartStore> => {
  const payload = await selfmartFetch(
    config,
    `/admin/store/${encodeURIComponent(storeId)}`,
    identity<any>,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
  return {
    id: String(payload?.id ?? payload?.data?.id ?? storeId),
    name: String(payload?.name ?? payload?.data?.name ?? data.name),
  };
};

export const createSelfmartProduct = async (
  config: SelfmartConfig,
  data: { code: string; name: string; price: number; description?: string }
): Promise<SelfmartProduct> => {
  const payload = await selfmartFetch(
    config,
    "/admin/product",
    identity<any>,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  return {
    id: payload?.id ?? payload?.data?.id,
    name: String(payload?.name ?? payload?.data?.name ?? data.name),
    barcode: String(payload?.barcode ?? payload?.code ?? data.code),
    price: Number(payload?.price ?? payload?.data?.price ?? data.price),
  };
};

export const addSelfmartStoreProduct = async (
  config: SelfmartConfig,
  storeId: string,
  data: { product_id: number; price: number; quantity?: number; cost?: number }
): Promise<SelfmartStoreProduct> => {
  const payload = await selfmartFetch(
    config,
    `/admin/store/${encodeURIComponent(storeId)}/product`,
    identity<any>,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  return parseStoreProducts([payload])[0];
};

export const updateSelfmartStoreProduct = async (
  config: SelfmartConfig,
  storeId: string,
  storeProductId: number,
  data: { price: number; quantity?: number; cost?: number; reason?: string; changed_by?: string }
): Promise<SelfmartStoreProduct> => {
  const payload = await selfmartFetch(
    config,
    `/admin/store/${encodeURIComponent(storeId)}/product/${storeProductId}`,
    identity<any>,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
  return parseStoreProducts([payload])[0];
};

export const deleteSelfmartStoreProduct = async (
  config: SelfmartConfig,
  storeId: string,
  storeProductId: number
): Promise<void> => {
  await selfmartFetch(
    config,
    `/admin/store/${encodeURIComponent(storeId)}/product/${storeProductId}`,
    identity<any>,
    { method: "DELETE" }
  );
};

export const selfmartStockEntry = async (
  config: SelfmartConfig,
  storeId: string,
  storeProductId: number,
  data: { quantity: number; reason?: string; changed_by?: string }
): Promise<SelfmartStoreProduct> => {
  const payload = await selfmartFetch(
    config,
    `/admin/store/${encodeURIComponent(storeId)}/product/${storeProductId}/entry`,
    identity<any>,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  return parseStoreProducts([payload])[0];
};

export const selfmartStockLoss = async (
  config: SelfmartConfig,
  storeId: string,
  storeProductId: number,
  data: { quantity: number; reason: string; changed_by?: string }
): Promise<SelfmartStoreProduct> => {
  const payload = await selfmartFetch(
    config,
    `/admin/store/${encodeURIComponent(storeId)}/product/${storeProductId}/loss`,
    identity<any>,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  return parseStoreProducts([payload])[0];
};

export const getSelfmartStoreLogs = async (
  config: SelfmartConfig,
  storeId: string,
  page = 1,
  limit = 50
): Promise<SelfmartStockLog[]> => {
  return selfmartFetch(
    config,
    `/admin/store/${encodeURIComponent(storeId)}/logs?page=${page}&limit=${limit}`,
    parseStockLogs
  );
};

export const getSelfmartStoreProductLogs = async (
  config: SelfmartConfig,
  storeId: string,
  storeProductId: number,
  page = 1,
  limit = 50
): Promise<SelfmartStockLog[]> => {
  return selfmartFetch(
    config,
    `/admin/store/${encodeURIComponent(storeId)}/product/${storeProductId}/logs?page=${page}&limit=${limit}`,
    parseStockLogs
  );
};

export const selfmartCheckoutPayment = async (
  config: SelfmartConfig,
  data: {
    store_id: string;
    payment_type: string;
    products: Array<{ product_id: number; quantity: number; price?: number }>;
    token?: string;
    user_id?: number;
  }
): Promise<any> => {
  return selfmartFetch(
    config,
    "/checkout/payment",
    identity<any>,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
};
