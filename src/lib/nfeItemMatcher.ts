import type {
  InventoryItemOption,
  MatchConfidence,
  NFeImportRow,
  ParsedNFe,
} from "@/types/nfeImport";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenOverlap(a: string, b: string): number {
  const tokensA = new Set(normalize(a).split(" ").filter(Boolean));
  const tokensB = new Set(normalize(b).split(" ").filter(Boolean));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let shared = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) shared += 1;
  });
  return shared / Math.max(tokensA.size, tokensB.size);
}

function findBestMatch(
  nfeCode: string,
  nfeEan: string | undefined,
  nfeDescription: string,
  inventory: InventoryItemOption[],
): { item: InventoryItemOption | null; confidence: MatchConfidence; label: string } {
  const code = nfeCode.trim();
  const ean = nfeEan?.trim();

  if (code) {
    const bySku = inventory.find(
      (item) => item.sku && normalize(item.sku) === normalize(code),
    );
    if (bySku) {
      return { item: bySku, confidence: "exact", label: "Código/SKU idêntico" };
    }
  }

  if (ean && ean !== "SEM GTIN") {
    const byBarcode = inventory.find(
      (item) => item.barcode && normalize(item.barcode) === normalize(ean),
    );
    if (byBarcode) {
      return { item: byBarcode, confidence: "exact", label: "EAN/GTIN idêntico" };
    }
  }

  let best: InventoryItemOption | null = null;
  let bestScore = 0;

  inventory.forEach((item) => {
    const score = tokenOverlap(nfeDescription, item.name);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  });

  if (best && bestScore >= 0.72) {
    return { item: best, confidence: "high", label: `Nome similar (${Math.round(bestScore * 100)}%)` };
  }

  if (best && bestScore >= 0.45) {
    return { item: best, confidence: "partial", label: `Possível match (${Math.round(bestScore * 100)}%)` };
  }

  return { item: null, confidence: "none", label: "Não encontrado no estoque" };
}

export function buildImportRows(
  parsed: ParsedNFe,
  inventory: InventoryItemOption[],
): NFeImportRow[] {
  return parsed.items.map((nfeItem) => {
    const match = findBestMatch(
      nfeItem.code,
      nfeItem.ean,
      nfeItem.description,
      inventory,
    );

    const hasMatch = match.confidence === "exact" || match.confidence === "high";

    return {
      nfeItem,
      inventoryItemId: match.item?.id ?? null,
      matchConfidence: match.confidence,
      matchLabel: match.label,
      action: hasMatch ? "link" : "create",
      include: true,
    };
  });
}

export function countRowsByConfidence(rows: NFeImportRow[]): Record<MatchConfidence, number> {
  return rows.reduce(
    (acc, row) => {
      acc[row.matchConfidence] += 1;
      return acc;
    },
    { exact: 0, high: 0, partial: 0, none: 0 } as Record<MatchConfidence, number>,
  );
}
