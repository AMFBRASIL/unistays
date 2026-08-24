export type NFeImportSource = "pdf" | "xml";

export interface ParsedNFeItem {
  lineNumber: number;
  code: string;
  ean?: string;
  description: string;
  ncm?: string;
  cfop?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ParsedNFe {
  accessKey?: string;
  number?: string;
  series?: string;
  issueDate?: string;
  emitterName: string;
  emitterDocument?: string;
  totalValue: number;
  items: ParsedNFeItem[];
  source: NFeImportSource;
  warnings: string[];
}

export type MatchConfidence = "exact" | "high" | "partial" | "none";

export type ImportRowAction = "link" | "create" | "skip";

export interface InventoryItemOption {
  id: number;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  unit: string;
  propertyId: number;
  propertyName?: string;
  currentStock: number;
}

export interface NFeImportRow {
  nfeItem: ParsedNFeItem;
  inventoryItemId: number | null;
  matchConfidence: MatchConfidence;
  matchLabel: string;
  action: ImportRowAction;
  include: boolean;
}
