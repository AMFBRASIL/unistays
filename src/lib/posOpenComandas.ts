export interface OpenComandaItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface OpenComanda {
  number: string;
  guestName: string;
  items: OpenComandaItem[];
  updatedAt: string;
  propertyId: number;
}

function storageKey(propertyId: number): string {
  return `unistays_pos_open_comandas_${propertyId}`;
}

export function loadOpenComandas(propertyId: number): OpenComanda[] {
  try {
    const raw = localStorage.getItem(storageKey(propertyId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OpenComanda[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOpenComandas(propertyId: number, comandas: OpenComanda[]): void {
  localStorage.setItem(storageKey(propertyId), JSON.stringify(comandas));
}

export function findOpenComanda(
  propertyId: number,
  comandaNumber: string
): OpenComanda | null {
  const needle = comandaNumber.trim().toLowerCase();
  if (!needle) return null;
  return (
    loadOpenComandas(propertyId).find((c) => c.number.trim().toLowerCase() === needle) ?? null
  );
}

export function upsertOpenComandaItems(
  propertyId: number,
  comandaNumber: string,
  guestName: string,
  newItems: OpenComandaItem[]
): OpenComanda {
  const number = comandaNumber.trim();
  const list = loadOpenComandas(propertyId);
  const idx = list.findIndex((c) => c.number.trim().toLowerCase() === number.toLowerCase());
  const existing = idx >= 0 ? list[idx] : null;
  const merged = new Map<number, OpenComandaItem>();

  for (const item of existing?.items ?? []) {
    merged.set(item.productId, { ...item });
  }
  for (const item of newItems) {
    const prev = merged.get(item.productId);
    if (prev) {
      merged.set(item.productId, {
        ...prev,
        quantity: prev.quantity + item.quantity,
        price: item.price,
        name: item.name,
      });
    } else {
      merged.set(item.productId, { ...item });
    }
  }

  const next: OpenComanda = {
    number,
    guestName: guestName.trim() || existing?.guestName || "",
    items: Array.from(merged.values()),
    updatedAt: new Date().toISOString(),
    propertyId,
  };

  if (idx >= 0) list[idx] = next;
  else list.unshift(next);
  saveOpenComandas(propertyId, list);
  return next;
}

export function removeOpenComanda(propertyId: number, comandaNumber: string): void {
  const needle = comandaNumber.trim().toLowerCase();
  const list = loadOpenComandas(propertyId).filter(
    (c) => c.number.trim().toLowerCase() !== needle
  );
  saveOpenComandas(propertyId, list);
}

export function openComandaTotal(comanda: OpenComanda): number {
  return comanda.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function openComandaItemsCount(comanda: OpenComanda): number {
  return comanda.items.reduce((sum, i) => sum + i.quantity, 0);
}
