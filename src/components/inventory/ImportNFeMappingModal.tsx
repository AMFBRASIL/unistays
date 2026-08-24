import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRightLeft,
  CheckCircle2,
  Loader2,
  PackagePlus,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { buildImportRows, countRowsByConfidence } from "@/lib/nfeItemMatcher";
import type {
  ImportRowAction,
  InventoryItemOption,
  NFeImportRow,
  ParsedNFe,
} from "@/types/nfeImport";

interface ImportNFeMappingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parsed: ParsedNFe;
  onSuccess?: () => void;
}

const confidenceStyles = {
  exact: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  high: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
  partial: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  none: "bg-rose-500/10 text-rose-700 border-rose-500/20",
};

const confidenceLabels = {
  exact: "Match exato",
  high: "Alta confiança",
  partial: "Revisar",
  none: "Sem match",
};

export function ImportNFeMappingModal({
  open,
  onOpenChange,
  parsed,
  onSuccess,
}: ImportNFeMappingModalProps) {
  const [rows, setRows] = useState<NFeImportRow[]>([]);
  const [inventory, setInventory] = useState<InventoryItemOption[]>([]);
  const [properties, setProperties] = useState<Array<{ id: number; name: string }>>([]);
  const [propertyId, setPropertyId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, propsRes] = await Promise.all([
        api.getInventoryItems({}),
        api.getProperties(),
      ]);

      const itemsRaw =
        itemsRes.success && itemsRes.data
          ? ((itemsRes.data as { items?: Array<Record<string, unknown>> }).items ?? [])
          : [];

      const inventoryOptions: InventoryItemOption[] = itemsRaw.map((item) => ({
        id: Number(item.id),
        name: String(item.name ?? ""),
        sku: (item.sku as string | null | undefined) ?? null,
        barcode: (item.barcode as string | null | undefined) ?? null,
        unit: String(item.unit ?? "UN"),
        propertyId: Number(item.propertyId),
        propertyName: item.propertyName ? String(item.propertyName) : undefined,
        currentStock: Number(item.currentStock ?? 0),
      }));

      const propsRaw =
        propsRes.success && propsRes.data
          ? ((propsRes.data as { properties?: Array<{ id: number; name: string }> }).properties ?? [])
          : [];

      setInventory(inventoryOptions);
      setProperties(propsRaw);
      if (propsRaw.length > 0) {
        setPropertyId(String(propsRaw[0].id));
      }

      setRows(buildImportRows(parsed, inventoryOptions));
    } finally {
      setLoading(false);
    }
  }, [parsed]);

  useEffect(() => {
    if (open) {
      void loadData();
    }
  }, [open, loadData]);

  const stats = useMemo(() => countRowsByConfidence(rows), [rows]);
  const selectedCount = rows.filter((row) => row.include).length;

  const inventoryForProperty = useMemo(() => {
    const pid = Number(propertyId);
    if (!pid) return inventory;
    return inventory.filter((item) => item.propertyId === pid);
  }, [inventory, propertyId]);

  const updateRow = (index: number, patch: Partial<NFeImportRow>) => {
    setRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );
  };

  const handleActionChange = (index: number, action: ImportRowAction) => {
    updateRow(index, {
      action,
      inventoryItemId: action === "link" ? rows[index].inventoryItemId : null,
    });
  };

  const handleInventoryChange = (index: number, value: string) => {
    if (value === "create") {
      updateRow(index, { action: "create", inventoryItemId: null, matchConfidence: "none", matchLabel: "Será criado no estoque" });
      return;
    }
    if (value === "skip") {
      updateRow(index, { action: "skip", inventoryItemId: null, include: false });
      return;
    }
    updateRow(index, {
      action: "link",
      inventoryItemId: Number(value),
      matchConfidence: "exact",
      matchLabel: "Vinculado manualmente",
      include: true,
    });
  };

  const handleImport = async () => {
    const pid = Number(propertyId);
    if (!pid) {
      toast.error("Selecione a propriedade de destino.");
      return;
    }

    const toImport = rows.filter((row) => row.include && row.action !== "skip");
    if (toImport.length === 0) {
      toast.error("Selecione ao menos um item para importar.");
      return;
    }

    setImporting(true);
    try {
      const reference = `NF-e ${parsed.number ?? parsed.accessKey?.slice(-8) ?? ""}`.trim();
      let created = 0;
      let linked = 0;

      for (const row of toImport) {
        let itemId = row.inventoryItemId;

        if (row.action === "create" || !itemId) {
          const createRes = await api.createInventoryItem({
            propertyId: pid,
            name: row.nfeItem.description,
            sku: row.nfeItem.code || null,
            barcode: row.nfeItem.ean && row.nfeItem.ean !== "SEM GTIN" ? row.nfeItem.ean : null,
            unit: row.nfeItem.unit || "UN",
            currentStock: 0,
            minStock: 0,
            costPrice: row.nfeItem.unitPrice,
            notes: `Importado via NF-e${parsed.number ? ` nº ${parsed.number}` : ""}`,
          });

          if (!createRes.success || !createRes.data) {
            throw new Error(`Falha ao criar item: ${row.nfeItem.description}`);
          }

          itemId = Number((createRes.data as { id?: string | number }).id);
          created += 1;
        } else {
          linked += 1;
        }

        if (!itemId) continue;

        const moveRes = await api.createInventoryMovement({
          itemId,
          type: "in",
          quantity: row.nfeItem.quantity,
          unitCost: row.nfeItem.unitPrice,
          reason: "Entrada via importação NF-e",
          reference,
          notes: `${row.nfeItem.description} (${row.nfeItem.code})`,
        });

        if (!moveRes.success) {
          throw new Error(`Falha ao dar entrada: ${row.nfeItem.description}`);
        }
      }

      toast.success(
        `Importação concluída: ${linked} vinculado(s), ${created} criado(s), ${toImport.length} entrada(s) no estoque.`,
      );
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao importar itens.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-cyan-600" />
            De-para: NF-e × Estoque
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          <div className="grid md:grid-cols-5 gap-3">
            {(Object.keys(stats) as Array<keyof typeof stats>).map((key) => (
              <Card key={key}>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">{confidenceLabels[key]}</p>
                  <p className="text-xl font-bold">{stats[key]}</p>
                </CardContent>
              </Card>
            ))}
            <Card className="md:col-span-1 border-cyan-500/30 bg-cyan-500/5">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Selecionados</p>
                <p className="text-xl font-bold text-cyan-700">{selectedCount}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Propriedade de destino</p>
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a propriedade" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={String(property.id)}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              Matches automáticos por SKU, EAN e nome
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 max-h-[52vh] px-6">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
          ) : (
            <table className="w-full text-sm border rounded-xl overflow-hidden">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="px-3 py-2 w-10" />
                  <th className="px-3 py-2">Item da NF-e</th>
                  <th className="px-3 py-2 w-36">Match</th>
                  <th className="px-3 py-2">Item no sistema</th>
                  <th className="px-3 py-2 w-28">Qtd NF</th>
                  <th className="px-3 py-2 w-36">Ação</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.nfeItem.lineNumber}-${row.nfeItem.code}`} className="border-t align-top">
                    <td className="px-3 py-3">
                      <Checkbox
                        checked={row.include}
                        onCheckedChange={(checked) =>
                          updateRow(index, { include: checked === true })
                        }
                      />
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium">{row.nfeItem.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cód: {row.nfeItem.code || "—"}
                        {row.nfeItem.ncm ? ` • NCM ${row.nfeItem.ncm}` : ""}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="outline" className={cn("text-xs", confidenceStyles[row.matchConfidence])}>
                        {confidenceLabels[row.matchConfidence]}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{row.matchLabel}</p>
                    </td>
                    <td className="px-3 py-3">
                      <Select
                        value={
                          row.action === "create"
                            ? "create"
                            : row.action === "skip"
                              ? "skip"
                              : row.inventoryItemId
                                ? String(row.inventoryItemId)
                                : "create"
                        }
                        onValueChange={(value) => handleInventoryChange(index, value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecionar item" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="create">
                            <span className="flex items-center gap-2">
                              <PackagePlus className="w-4 h-4" />
                              Criar novo item
                            </span>
                          </SelectItem>
                          <SelectItem value="skip">Ignorar item</SelectItem>
                          {inventoryForProperty.map((item) => (
                            <SelectItem key={item.id} value={String(item.id)}>
                              {item.name}
                              {item.sku ? ` (${item.sku})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-3">
                      {row.nfeItem.quantity} {row.nfeItem.unit}
                    </td>
                    <td className="px-3 py-3">
                      <Select
                        value={row.action}
                        onValueChange={(value) => handleActionChange(index, value as ImportRowAction)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="link">Vincular existente</SelectItem>
                          <SelectItem value="create">Criar + entrada</SelectItem>
                          <SelectItem value="skip">Ignorar</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ScrollArea>

        <div className="border-t px-6 py-4 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Revise itens com match parcial antes de importar
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => void handleImport()}
              disabled={importing || loading || selectedCount === 0}
              className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
            >
              {importing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Importar {selectedCount} item(ns)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
